from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from .database import Base

class DigitalTwinMode(str, enum.Enum):
    PERSONAL = "personal"
    WORK = "work"

class TaskStatus(str, enum.Enum):
    TODO = "to_do"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    
    current_mode = Column(String, default=DigitalTwinMode.PERSONAL.value)
    avatar_url = Column(String, nullable=True)
    
    slack_connected = Column(Boolean, default=False)
    github_connected = Column(Boolean, default=False)
    jira_connected = Column(Boolean, default=False)
    calendar_connected = Column(Boolean, default=False)

    # Relationships
    jira_config = relationship("JiraConfig", back_populates="owner", uselist=False)
    google_calendar_config = relationship("GoogleCalendarConfig", back_populates="owner", uselist=False)
    projects = relationship("Project", back_populates="owner")
    tasks = relationship("Task", back_populates="owner")
    documents = relationship("Document", back_populates="owner")
    events = relationship("Event", back_populates="owner")
    health_logs = relationship("HealthLog", back_populates="owner")
    lifestyle_data = relationship("LifestyleData", back_populates="owner")

class JiraConfig(Base):
    __tablename__ = "jira_configs"
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, nullable=False)
    email = Column(String, nullable=False) 
    api_token = Column(String, nullable=False)
    account_id = Column(String, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="jira_config")

class GoogleCalendarConfig(Base):
    __tablename__ = "google_calendar_configs"
    id = Column(Integer, primary_key=True, index=True)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    token_expiry = Column(DateTime, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="google_calendar_config")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    color_code = Column(String, default="#007bff")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default=TaskStatus.TODO.value)
    priority = Column(String, default="medium")
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    project = relationship("Project", back_populates="tasks")
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False) # Markdown
    summary = Column(Text, nullable=True)
    version = Column(Integer, default=1)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="documents")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="events")

class HealthLog(Base):
    __tablename__ = "health_logs"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # fitness, meditation, mood, sleep
    value = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="health_logs")

class LifestyleData(Base):
    __tablename__ = "lifestyle_data"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False) # cooking, travel, hobbies, parenting
    label = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="lifestyle_data")

class OTPCode(Base):
    """Short-lived one-time password for email-based password reset."""
    __tablename__ = "otp_codes"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)          # 6-digit string
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)      # None = still valid
    created_at = Column(DateTime, default=datetime.utcnow)
