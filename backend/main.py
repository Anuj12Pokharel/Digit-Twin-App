from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from typing import List
from . import models, schemas, database, auth, tools
from .database import engine
from .services.jira_service import JiraService
from .services.google_calendar_service import GoogleCalendarService
from .services.knowledge_service import knowledge_base
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Twin (Jira Enabled)")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ---

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(user.password) if user.password else None
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_pwd,
        google_id=user.google_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    return {"access_token": auth.create_access_token(data={"sub": user.email}), "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- JIRA ---

@app.post("/jira/connect", response_model=schemas.JiraConfigResponse)
def connect_jira(config: schemas.JiraConfigCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_config = db.query(models.JiraConfig).filter(models.JiraConfig.user_id == current_user.id).first()
    if db_config:
        for key, value in config.dict().items(): setattr(db_config, key, value)
    else:
        db_config = models.JiraConfig(**config.dict(), user_id=current_user.id)
        db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@app.get("/jira/issues")
async def get_jira_issues(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.jira_config: raise HTTPException(status_code=400, detail="Jira not connected")
    svc = JiraService(current_user.jira_config.domain, current_user.jira_config.email, current_user.jira_config.api_token)
    return await svc.get_my_issues()

# --- GOOGLE CALENDAR ---

@app.post("/google/connect")
async def connect_google_calendar(
    code: str, 
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    # Exchange code for tokens (simplified for this design)
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": "https://auth.expo.io/@your-user/your-app" # Placeholder for Expo redirect
            }
        )
        if res.status_code != 200:
            raise HTTPException(status_code=400, detail="Google Auth failed")
        
        data = res.json()
        db_config = db.query(models.GoogleCalendarConfig).filter(models.GoogleCalendarConfig.user_id == current_user.id).first()
        expiry = datetime.utcnow() + timedelta(seconds=data.get("expires_in", 3600))
        
        if db_config:
            db_config.access_token = data["access_token"]
            if "refresh_token" in data: db_config.refresh_token = data["refresh_token"]
            db_config.token_expiry = expiry
        else:
            db_config = models.GoogleCalendarConfig(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                token_expiry=expiry,
                user_id=current_user.id
            )
            db.add(db_config)
        
        db.commit()
        return {"status": "success"}

@app.get("/google/calendar/events")
async def get_google_events(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.google_calendar_config:
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
    
    svc = GoogleCalendarService(
        current_user.google_calendar_config.access_token,
        current_user.google_calendar_config.refresh_token,
        current_user.google_calendar_config.token_expiry
    )
    return await svc.list_upcoming_events()

# --- INTERNAL FALLBACKS ---

@app.post("/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_project = models.Project(**project.dict(), user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=List[schemas.ProjectResponse])
def get_projects(current_user: models.User = Depends(auth.get_current_user)):
    return current_user.projects

# --- TASKS ---

@app.post("/tasks", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_task = models.Task(**task.dict(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.patch("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, new_status: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = new_status
    db.commit()
    db.refresh(task)
    return task

# --- DOCUMENTS ---

@app.post("/documents", response_model=schemas.DocumentResponse)
async def create_document(doc: schemas.DocumentCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_doc = models.Document(**doc.model_dump(), user_id=current_user.id)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # Ingest into the brain automatically
    knowledge_base.ingest_document(
        doc_id=str(db_doc.id), 
        content=db_doc.content, 
        metadata={"title": db_doc.title, "source": "user_document", "user_id": current_user.id}
    )
    
    return db_doc

@app.get("/documents", response_model=List[schemas.DocumentResponse])
def get_documents(current_user: models.User = Depends(auth.get_current_user)):
    return current_user.documents

# --- VOICE AI ---

from pydantic import BaseModel

class ChatRequest(BaseModel):
    query: str

@app.post("/chat-completions")
async def chat_completions(req: ChatRequest, current_user: models.User = Depends(auth.get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key missing")

    if current_user.current_mode == "personal":
        instr = f"You are the Digital Twin of {current_user.full_name or current_user.email}. This is PERSONAL MODE. "
        instr += "CRITICAL: Your entire personality, history, and knowledge are derived EXCLUSIVELY from the provided training guide. "
        instr += "You are an expert mapped exactly to the holistic lifestyle outlined below.\n"
        
        try:
            with open("backend/data/personal_training.txt", "r", encoding="utf-8") as f:
                training_content = f.read()
            instr += "\n\n--- PERSONAL TRAINING CONTEXT ---\n" + training_content + "\n--------------------------------\n\n"
        except FileNotFoundError:
            pass

        instr += "Always speak in the FIRST PERSON ('I am...', 'My philosophy is...') to maintain the illusion of being the user's replica."
    else:
        instr = f"You are a Digital Twin Office Assistant. This is WORK MODE. "
        if current_user.jira_config:
            instr += f"Jira is connected to {current_user.jira_config.domain}. "
        if current_user.google_calendar_config:
            instr += "Google Calendar is connected. "
        instr += "Prioritize connected services for work and scheduling tasks."

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": instr},
                    {"role": "user", "content": req.query}
                ],
                "temperature": 0.7
            },
            timeout=30.0
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        data = response.json()
        return {"response": data["choices"][0]["message"]["content"]}

@app.post("/auth/realtime-session")
async def get_realtime_session(current_user: models.User = Depends(auth.get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key missing")

    if current_user.current_mode == "personal":
        instr = f"You are the Digital Twin of {current_user.full_name or current_user.email}. This is PERSONAL MODE. "
        instr += "CRITICAL: Your entire personality, history, and knowledge are derived EXCLUSIVELY from the provided training guide. "
        instr += "You are an expert mapped exactly to the holistic lifestyle outlined below.\n"
        
        try:
            with open("backend/data/personal_training.txt", "r", encoding="utf-8") as f:
                training_content = f.read()
            instr += "\n\n--- PERSONAL TRAINING CONTEXT ---\n" + training_content + "\n--------------------------------\n\n"
        except FileNotFoundError:
            pass

        instr += "Always speak in the FIRST PERSON ('I am...', 'My philosophy is...') to maintain the illusion of being the user's replica."
    else:
        instr = f"You are a Digital Twin Office Assistant. This is WORK MODE. "
        if current_user.jira_config:
            instr += f"Jira is connected to {current_user.jira_config.domain}. "
        if current_user.google_calendar_config:
            instr += "Google Calendar is connected. "
        instr += "Prioritize connected services for work and scheduling tasks. Use 'get_daily_battle_plan' for analysis."
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/realtime/sessions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-realtime-preview-2024-10-01",
                "voice": "alloy",
                "instructions": instr,
                "tools": tools.TOOLS_METADATA,
                "tool_choice": "auto",
            },
        )
        return response.json()

@app.post("/switch-mode")
def switch_mode(secret_word: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if secret_word != "evolve":
        raise HTTPException(status_code=400, detail="Invalid secret")
    current_user.current_mode = "work" if current_user.current_mode == "personal" else "personal"
    db.commit()
    return {"mode": current_user.current_mode}

@app.get("/")
def root():
    return {"status": "Office Assistant Active"}
