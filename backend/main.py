import os
import logging
import warnings
from pathlib import Path
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress duckduckgo_search renaming warning which resets simplefilter internally
_orig_warn = warnings.warn
def _patched_warn(message, category=None, stacklevel=1, source=None):
    if "duckduckgo_search" in str(message) and "renamed" in str(message):
        return
    return _orig_warn(message, category, stacklevel, source)
warnings.warn = _patched_warn

# Load .env from the backend directory
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import List
import models, schemas, database, auth, tools
from database import engine
from services.jira_service import JiraService
from services.google_calendar_service import GoogleCalendarService
from services.knowledge_service import knowledge_base
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digit Twin API", version="1.0.0")

# Ensure uploads directory exists and serve it as static files
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

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
        google_id=user.google_id,
        address=user.address,
        mobile_number=user.mobile_number
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email address not found."
        )
    if not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password. Please try again."
        )
    return {"access_token": auth.create_access_token(data={"sub": user.email}), "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.patch("/users/me", response_model=schemas.UserResponse)
def update_me(
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/users/me/avatar", response_model=schemas.UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    # Build a unique filename: user_<id>.<ext>
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"user_{current_user.id}.{ext}"
    save_path = UPLOADS_DIR / filename
    contents = await file.read()
    with open(save_path, "wb") as f:
        f.write(contents)
    # Store the public URL in the DB
    current_user.avatar_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user

# --- PASSWORD RESET (OTP flow) ---

import random
import string

def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))

def _get_valid_otp(email: str, code: str, db: Session):
    """Return the OTPCode row if it exists, is unexpired, and unused."""
    now = datetime.utcnow()
    return (
        db.query(models.OTPCode)
        .filter(
            models.OTPCode.email == email,
            models.OTPCode.code == code,
            models.OTPCode.expires_at > now,
            models.OTPCode.used_at == None,  # noqa: E711
        )
        .first()
    )

@app.post("/auth/forgot-password")
def forgot_password(
    req: schemas.ForgotPasswordRequest,
    db: Session = Depends(database.get_db),
):
    """
    Generate a 6-digit OTP and store it.
    In production: send via email (SMTP / SendGrid / SES).
    For now: returns the code in the response body for dev convenience.
    """
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        # Return 200 even for unknown email to avoid user enumeration
        return {"detail": "If that email exists, an OTP has been sent."}

    # Invalidate any existing unused OTPs for this email
    db.query(models.OTPCode).filter(
        models.OTPCode.email == req.email,
        models.OTPCode.used_at == None,  # noqa: E711
    ).delete()
    db.commit()

    code = _generate_otp()
    otp = models.OTPCode(
        email=req.email,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(otp)
    db.commit()

    # TODO: replace with real email delivery
    logger.info("[DEV] OTP for %s: %s", req.email, code)

    return {
        "detail": "OTP sent to your email.",
        # Remove `otp` field before going to production!
        "otp": code,
    }

@app.post("/auth/verify-otp")
def verify_otp(
    req: schemas.VerifyOTPRequest,
    db: Session = Depends(database.get_db),
):
    """Check that the OTP is valid (does NOT consume it — consumption happens at reset)."""
    otp = _get_valid_otp(req.email, req.code, db)
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
    return {"detail": "OTP verified."}

@app.post("/auth/reset-password")
def reset_password(
    req: schemas.ResetPasswordRequest,
    db: Session = Depends(database.get_db),
):
    """Verify OTP one final time, then update the user's password."""
    if len(req.new_password) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters.")

    otp = _get_valid_otp(req.email, req.code, db)
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Mark OTP as used
    otp.used_at = datetime.utcnow()
    # Update password
    user.hashed_password = auth.get_password_hash(req.new_password)
    db.commit()

    return {"detail": "Password updated successfully."}

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

@app.get("/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(current_user: models.User = Depends(auth.get_current_user)):
    return current_user.tasks

@app.patch("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id, models.Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id, models.Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()

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

@app.patch("/documents/{doc_id}", response_model=schemas.DocumentResponse)
def update_document(
    doc_id: int,
    payload: schemas.DocumentUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id, models.Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    doc.version += 1
    db.commit()
    db.refresh(doc)
    return doc

@app.delete("/documents/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id, models.Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Remove from vector store too
    try:
        knowledge_base.delete_document(str(doc_id))
    except Exception:
        pass
    db.delete(doc)
    db.commit()

# --- VOICE AI ---

from pydantic import BaseModel
from duckduckgo_search import DDGS

class ChatRequest(BaseModel):
    query: str
    mode: str | None = None  # Optional frontend override: 'personal', 'work', or 'neutral'

@app.post("/chat-completions")
async def chat_completions(
    req: ChatRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key missing")

    # Use frontend-supplied mode if provided, else fall back to DB-stored mode
    active_mode = req.mode if req.mode in ("personal", "work", "neutral") else current_user.current_mode
    is_neutral_routing = False

    if active_mode == "neutral":
        is_neutral_routing = True
        work_keywords = ["jira", "task", "calendar", "meeting", "deadline", "project", "schedule", "work", "office", "email", "todo", "ticket", "sprint", "job", "manager", "boss"]
        personal_keywords = ["gym", "fitness", "movie", "food", "cook", "hobbies", "leisure", "vacation", "trip", "personal", "hobby", "health", "workout", "recipe", "song", "play", "sleep", "family", "friend"]
        
        query_lower = req.query.lower()
        work_score = sum(query_lower.count(k) for k in work_keywords)
        personal_score = sum(query_lower.count(k) for k in personal_keywords)
        
        if work_score > personal_score:
            active_mode = "work"
        elif personal_score > work_score:
            active_mode = "personal"
        else:
            if any(w in query_lower for w in ["what", "how", "why", "who", "where"]):
                active_mode = "personal"
            else:
                active_mode = "work"

    if active_mode == "personal":
        instr = (
            f"You are the Digital Twin replica of {current_user.full_name or current_user.email} in PERSONAL MODE. "
            f"Your role is to act as the user's virtual clone/persona, representing their holistic lifestyle, values, and knowledge. "
            f"Always speak in the FIRST PERSON ('I', 'my', 'myself') to maintain the immersion of being the user's replica. "
            f"Your personality, history, and beliefs are deeply rooted in the core pillars of Wellness, Planet & Exploration.\n"
            f"You have access to your personal 'AI Brain' knowledge base of notes and documents via the `query_personal_knowledge` tool. "
            f"If the tool returns no matching context, assume no such information is in your notes/history, and reply accordingly in the first person.\n"
        )
        if is_neutral_routing:
            instr += "(Dynamically routed from NEUTRAL mode based on personal intent). "
        
        try:
            with open("backend/data/personal_training.txt", "r", encoding="utf-8") as f:
                training_content = f.read()
            instr += "\n\n--- YOUR CORE PERSONALITY & TRAINING GUIDE ---\n" + training_content + "\n---------------------------------------------\n\n"
        except FileNotFoundError:
            pass
            
        context_text = ""
        try:
            # Perform a web search using duckduckgo
            with DDGS() as ddgs:
                results = list(ddgs.text(req.query, max_results=3))
                if results:
                    context_text = "\n\n--- WEB SEARCH RESULTS ---\n"
                    for r in results:
                        context_text += f"Title: {r.get('title')}\nSnippet: {r.get('body')}\nLink: {r.get('href')}\n\n"
                    context_text += "--------------------------------\n\n"
        except Exception as e:
            logger.error("Web search failed: %s", e)

        instr += context_text
        instr += (
            "Ensure you align your answers with the training guide's philosophies (e.g., active outdoor lifestyle, carbon reduction, slow travel, organic wellness). "
            "Do not mention that you are performing web searches or reading files. Synthesize the info naturally as if it represents your own knowledge. "
            "CRITICAL INSTRUCTION: If the user's input clearly indicates a desire to switch to WORK MODE, or is strongly related to work tasks (Jira, tasks, meetings, project deadlines), prepend your exact response with '[SUGGEST_MODE_SWITCH: work]'. "
        )
    else:
        instr = (
            f"You are the Digital Twin of {current_user.full_name or current_user.email} in WORK MODE. "
            f"In this mode, you act as the user's executive office assistant, focus, and productivity booster. "
            f"Help the user manage their tasks, coordinate their calendar, and track project details efficiently. "
            f"You have access to the user's personal knowledge base, notes, and documents via the `query_personal_knowledge` tool, "
            f"and you should use it when asked about their notes, history, or documents. If a search yields no results, "
            f"state clearly that no matching notes were found rather than stating you lack access."
        )
        if is_neutral_routing:
            instr += "(Dynamically routed from NEUTRAL mode based on work/professional intent). "
        if current_user.jira_config:
            instr += f"Jira is connected to {current_user.jira_config.domain}. "
        if current_user.google_calendar_config:
            instr += "Google Calendar is connected. "
        instr += "Prioritize connected services (Jira, Google Calendar) for work and scheduling tasks. "
        instr += (
            "CRITICAL INSTRUCTION: If the user's input clearly indicates a desire to switch to PERSONAL MODE, or is strongly related to personal life (hobbies, movies, gym, cooking, leisure, fitness), prepend your exact response with '[SUGGEST_MODE_SWITCH: personal]'. "
        )

    import json
    from tools import ToolRegistry, CHAT_TOOLS_METADATA

    messages = [
        {"role": "system", "content": instr},
        {"role": "user", "content": req.query}
    ]

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-mini",
                "messages": messages,
                "tools": CHAT_TOOLS_METADATA,
                "tool_choice": "auto",
                "temperature": 0.7
            },
            timeout=30.0
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        data = response.json()
        message = data["choices"][0]["message"]
        
        if message.get("tool_calls"):
            tool_calls = message["tool_calls"]
            messages.append(message)
            
            registry = ToolRegistry(db, current_user)
            logger.info("[CHAT] OpenAI requested tool calls: %s", [tc['function']['name'] for tc in tool_calls])
            
            for tool_call in tool_calls:
                function_name = tool_call["function"]["name"]
                
                try:
                    function_args = json.loads(tool_call["function"]["arguments"])
                except Exception:
                    function_args = {}
                
                logger.info("[CHAT] Executing tool %s with args %s", function_name, function_args)
                tool_result = None
                try:
                    if function_name == "get_daily_battle_plan":
                        tool_result = registry.get_daily_battle_plan()
                    elif function_name == "query_personal_knowledge":
                        tool_result = registry.query_personal_knowledge(question=function_args.get("question", ""))
                    elif function_name == "create_project":
                        tool_result = registry.create_project(
                            title=function_args.get("title", ""),
                            key=function_args.get("key")
                        )
                    elif function_name == "create_work_task":
                        tool_result = registry.create_work_task(
                            title=function_args.get("title", ""),
                            project_key=function_args.get("project_key", "PROJ"),
                            description=function_args.get("description"),
                            priority=function_args.get("priority", "medium")
                        )
                    elif function_name == "schedule_meeting":
                        tool_result = registry.schedule_meeting(
                            title=function_args.get("title", ""),
                            start_time=function_args.get("start_time", ""),
                            location=function_args.get("location")
                        )
                    else:
                        tool_result = {"status": "error", "message": f"Unknown function {function_name}"}
                except Exception as e:
                    tool_result = {"status": "error", "message": str(e)}
                
                logger.info("[CHAT] Tool %s returned result: %s", function_name, tool_result)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "name": function_name,
                    "content": json.dumps(tool_result)
                })
            
            second_response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": messages,
                    "temperature": 0.7
                },
                timeout=30.0
            )
            if second_response.status_code != 200:
                raise HTTPException(status_code=second_response.status_code, detail=second_response.text)
            
            second_data = second_response.json()
            return {"response": second_data["choices"][0]["message"]["content"]}
        
        return {"response": message["content"]}

@app.post("/auth/realtime-session")
async def get_realtime_session(current_user: models.User = Depends(auth.get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key missing")

    if current_user.current_mode == "personal":
        instr = (
            f"You are the Digital Twin replica of {current_user.full_name or current_user.email} in PERSONAL MODE. "
            f"Your role is to act as the user's virtual clone/persona, representing their holistic lifestyle, values, and knowledge. "
            f"Always speak in the FIRST PERSON ('I', 'my', 'myself') to maintain the immersion of being the user's replica. "
            f"Your personality, history, and beliefs are deeply rooted in the core pillars of Wellness, Planet & Exploration.\n"
            f"You have access to your personal 'AI Brain' knowledge base of notes and documents via the `query_personal_knowledge` tool. "
            f"If the tool returns no matching context, assume no such information is in your notes/history, and reply accordingly in the first person.\n"
        )
        try:
            with open("backend/data/personal_training.txt", "r", encoding="utf-8") as f:
                training_content = f.read()
            instr += "\n\n--- YOUR CORE PERSONALITY & TRAINING GUIDE ---\n" + training_content + "\n---------------------------------------------\n\n"
        except FileNotFoundError:
            pass
    elif current_user.current_mode == "neutral":
        instr = (
            f"You are the Balanced Digital Twin of {current_user.full_name or current_user.email} in NEUTRAL MODE. "
            f"You assist with a healthy balance of everyday routines, scheduling, and casual learning. Be conversational, balanced, and direct. "
            f"You have access to the user's personal knowledge base, notes, and documents via the `query_personal_knowledge` tool."
        )
    else:
        instr = (
            f"You are the Digital Twin of {current_user.full_name or current_user.email} in WORK MODE. "
            f"In this mode, you act as the user's executive office assistant, focus, and productivity booster. "
            f"Help the user manage their tasks, coordinate their calendar, and track project details efficiently. "
            f"You have access to the user's personal knowledge base, notes, and documents via the `query_personal_knowledge` tool, "
            f"and you should use it when asked about their notes, history, or documents. If a search yields no results, "
            f"state clearly that no matching notes were found rather than stating you lack access."
        )
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
