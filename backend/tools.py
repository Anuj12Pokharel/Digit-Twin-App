from sqlalchemy.orm import Session
import models, schemas
from services.jira_service import JiraService
from services.google_calendar_service import GoogleCalendarService
from services.knowledge_service import knowledge_base
from datetime import datetime, timedelta
import asyncio

class ToolRegistry:
    def __init__(self, db: Session, user: models.User):
        self.db = db
        self.user = user

    def _get_jira_client(self):
        config = self.user.jira_config
        if not config: return None
        return JiraService(config.domain, config.email, config.api_token)

    def _get_google_client(self):
        config = self.user.google_calendar_config
        if not config: return None
        return GoogleCalendarService(config.access_token, config.refresh_token, config.token_expiry)

    def get_daily_battle_plan(self):
        """Cross-references Jira and Calendar."""
        jira_client = self._get_jira_client()
        google_client = self._get_google_client()
        results = {"jira_tasks": [], "calendar_events": [], "status": "partial"}
        try:
            if jira_client:
                issues = asyncio.run(jira_client.get_my_issues())
                results["jira_tasks"] = [{"key": i["key"], "summary": i["fields"]["summary"], "status": i["fields"]["status"]["name"]} for i in issues]
            if google_client:
                events = asyncio.run(google_client.list_upcoming_events())
                results["calendar_events"] = [{"summary": e.get("summary"), "start": e["start"].get("dateTime")} for e in events]
            results["status"] = "success"
        except Exception as e:
            results["status"] = "error"
            results["error_message"] = str(e)
        return results

    def query_personal_knowledge(self, question: str):
        """Searches your personal 'AI Brain' (RAG) for facts about you, your notes, or your documents."""
        try:
            # We assume the documents are already indexed in ChromaDB
            context = knowledge_base.query_brain(question)
            return {"status": "success", "context": context}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def create_project(self, title: str, key: str = None):
        """Creates a Jira project if connected, else internal."""
        client = self._get_jira_client()
        if client:
            try:
                project_key = key or title[:3].upper()
                res = asyncio.run(client.create_project(project_key, title, self.user.jira_config.account_id))
                return {"status": "success", "jira_project": res, "source": "jira"}
            except Exception as e: return {"status": "error", "message": f"Jira: {str(e)}"}
        db_p = models.Project(title=title, user_id=self.user.id); self.db.add(db_p); self.db.commit()
        return {"status": "success", "project_id": db_p.id, "source": "local"}

    def create_work_task(self, title: str, project_key: str = "PROJ", description: str = None, priority: str = "medium"):
        """Creates a Jira issue or local task."""
        client = self._get_jira_client()
        if client:
            try:
                res = asyncio.run(client.create_issue(project_key, title, description, priority))
                return {"status": "success", "jira_issue": res, "source": "jira"}
            except Exception as e: return {"status": "error", "message": f"Jira: {str(e)}"}
        db_t = models.Task(title=title, description=description, priority=priority, user_id=self.user.id); self.db.add(db_t); self.db.commit()
        return {"status": "success", "task_id": db_t.id, "source": "local"}

    def schedule_meeting(self, title: str, start_time: str, location: str = None):
        """Schedules a meeting in Google Calendar if connected, else internal."""
        client = self._get_google_client()
        try:
            dt_start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            if client:
                res = asyncio.run(client.create_event(title, dt_start, location=location))
                return {"status": "success", "google_event": res, "source": "google_calendar"}
            
            db_e = models.Event(title=title, start_time=dt_start, location=location, user_id=self.user.id)
            self.db.add(db_e); self.db.commit()
            return {"status": "success", "event_id": db_e.id, "source": "local"}
        except Exception as e: return {"status": "error", "message": str(e)}

# Metadata for OpenAI
TOOLS_METADATA = [
    {
        "type": "function",
        "name": "get_daily_battle_plan",
        "description": "Cross-reference Jira tasks and Google Calendar meetings to summarize the day and identify conflicts.",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "type": "function",
        "name": "query_personal_knowledge",
        "description": "Answer questions about the user's life, notes, or history by searching their personal AI Knowledge Base.",
        "parameters": {
            "type": "object",
            "properties": {
                "question": {"type": "string", "description": "The specific question about the user's information."}
            },
            "required": ["question"]
        }
    },
    {
        "type": "function",
        "name": "create_project",
        "parameters": {
            "type": "object",
            "properties": {"title": {"type": "string"}, "key": {"type": "string"}},
            "required": ["title"]
        }
    },
    {
        "type": "function",
        "name": "create_work_task",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "project_key": {"type": "string"},
                "description": {"type": "string"},
                "priority": {"type": "string", "enum": ["Low", "Medium", "High"]}
            },
            "required": ["title", "project_key"]
        }
    },
    {
        "type": "function",
        "name": "schedule_meeting",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "start_time": {"type": "string", "description": "ISO 8601 date string"},
                "location": {"type": "string"}
            },
            "required": ["title", "start_time"]
        }
    }
]

CHAT_TOOLS_METADATA = []
for tool in TOOLS_METADATA:
    chat_tool = {
        "type": "function",
        "function": {
            "name": tool["name"],
            "parameters": tool["parameters"]
        }
    }
    if "description" in tool:
        chat_tool["function"]["description"] = tool["description"]
    CHAT_TOOLS_METADATA.append(chat_tool)

