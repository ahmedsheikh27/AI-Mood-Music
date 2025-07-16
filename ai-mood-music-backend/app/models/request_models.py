from pydantic import BaseModel

class MoodRequest(BaseModel):
    mood: str
    spotify_token: str
