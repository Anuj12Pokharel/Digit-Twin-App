import httpx
import json
from base64 import b64encode
from typing import List, Optional

class JiraService:
    def __init__(self, domain: str, email: str, api_token: str):
        self.domain = domain
        self.email = email
        self.api_token = api_token
        self.base_url = f"https://{domain}/rest/api/3"
        
        # Prepare Auth Header
        auth_str = f"{email}:{api_token}"
        encoded_auth = b64encode(auth_str.encode()).decode()
        self.headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    async def create_issue(self, project_key: str, summary: str, description: str = None, priority: str = "Medium", assignee_id: str = None):
        url = f"{self.base_url}/issue"
        
        # ADF (Atlassian Document Format) for description
        desc_adf = {
            "type": "doc",
            "version": 1,
            "content": [
                {
                    "type": "paragraph",
                    "content": [{"text": description or "", "type": "text"}]
                }
            ]
        } if description else None

        payload = {
            "fields": {
                "project": {"key": project_key},
                "summary": summary,
                "issuetype": {"name": "Task"},
                "priority": {"name": priority.capitalize()},
            }
        }
        
        if desc_adf:
            payload["fields"]["description"] = desc_adf
        if assignee_id:
            payload["fields"]["assignee"] = {"id": assignee_id}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json()

    async def get_my_issues(self):
        # Using JQL to get issues assigned to the user
        url = f"{self.base_url}/search"
        jql = "assignee = currentUser() AND status != Done ORDER BY created DESC"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params={"jql": jql, "maxResults": 20})
            response.raise_for_status()
            return response.json().get("issues", [])

    async def update_issue_status(self, issue_key: str, transition_id: str):
        url = f"{self.base_url}/issue/{issue_key}/transitions"
        payload = {"transition": {"id": transition_id}}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return True

    async def get_projects(self):
        url = f"{self.base_url}/project"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

    async def create_project(self, key: str, name: str, lead_account_id: str):
        # Simplified project creation - Usually requires more params like projectTypeKey and templateKey
        url = f"{self.base_url}/project"
        payload = {
            "key": key,
            "name": name,
            "leadAccountId": lead_account_id,
            "projectTypeKey": "software",
            "projectTemplateKey": "com.pyxis.greenhopper.jira:gh-simplified-kanban-classic"
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json()
