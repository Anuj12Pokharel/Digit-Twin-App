from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime

class DigitalTwinMode(Enum):
    PERSONAL = "personal"
    WORK = "work"

class TaskStatus(Enum):
    TODO = "to_do"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None
    google_id: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    current_mode: Optional[str] = None
    avatar_url: Optional[str] = None
    slack_connected: Optional[bool] = None
    github_connected: Optional[bool] = None
    jira_connected: Optional[bool] = None
    calendar_connected: Optional[bool] = None

# Jira schemas
class JiraConfigBase(BaseModel):
    domain: str
    email: str
    api_token: str
    account_id: Optional[str] = None

class JiraConfigCreate(JiraConfigBase):
    pass

class JiraConfigResponse(JiraConfigBase):
    id: int
    class Config:
        from_attributes = True

# Google Calendar schemas
class GoogleCalendarConfigResponse(BaseModel):
    id: int
    access_token: str
    token_expiry: datetime
    class Config:
        from_attributes = True

# Work models
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "to_do"
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    color_code: Optional[str] = "#007bff"

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    tasks: List[TaskResponse] = []
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    version: int
    updated_at: datetime
    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    current_mode: str
    avatar_url: Optional[str] = None
    slack_connected: bool = False
    github_connected: bool = False
    jira_connected: bool = False
    calendar_connected: bool = False
    jira_config: Optional[JiraConfigResponse] = None
    google_calendar_config: Optional[GoogleCalendarConfigResponse] = None
    projects: List[ProjectResponse] = []
    tasks: List[TaskResponse] = []
    documents: List[DocumentResponse] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleLoginRequest(BaseModel):
    id_token: str

# ── Password reset flow ───────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str           # 6-digit string the user enters

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str           # re-verified server-side before applying
    new_password: str   # min length enforced in the endpoint
