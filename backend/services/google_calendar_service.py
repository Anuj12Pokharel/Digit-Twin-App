import httpx
from datetime import datetime, timedelta
from typing import List, Optional
import os

class GoogleCalendarService:
    def __init__(self, access_token: str, refresh_token: str = None, token_expiry: datetime = None):
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.token_expiry = token_expiry
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.base_url = "https://www.googleapis.com/calendar/v3"

    async def _refresh_token_if_needed(self):
        if self.token_expiry and datetime.utcnow() >= self.token_expiry - timedelta(minutes=5):
            if not self.refresh_token:
                return # Can't refresh
            
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "refresh_token": self.refresh_token,
                        "grant_type": "refresh_token",
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    self.access_token = data["access_token"]
                    if "expires_in" in data:
                        self.token_expiry = datetime.utcnow() + timedelta(seconds=data["expires_in"])
                    return True
        return False

    async def list_upcoming_events(self, max_results: int = 10):
        await self._refresh_token_if_needed()
        url = f"{self.base_url}/calendars/primary/events"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        params = {
            "timeMin": datetime.utcnow().isoformat() + "Z",
            "maxResults": max_results,
            "singleEvents": "true",
            "orderBy": "startTime"
        }
        
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers, params=params)
            res.raise_for_status()
            return res.json().get("items", [])

    async def create_event(self, summary: str, start_time: datetime, end_time: datetime = None, location: str = None, description: str = None):
        await self._refresh_token_if_needed()
        if not end_time:
            end_time = start_time + timedelta(hours=1)
            
        url = f"{self.base_url}/calendars/primary/events"
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"}
        
        payload = {
            "summary": summary,
            "location": location,
            "description": description,
            "start": {"dateTime": start_time.isoformat() + "Z", "timeZone": "UTC"},
            "end": {"dateTime": end_time.isoformat() + "Z", "timeZone": "UTC"},
        }
        
        async with httpx.AsyncClient() as client:
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            return res.json()
