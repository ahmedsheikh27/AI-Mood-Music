from openai import AsyncOpenAI
from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool
import os
from dotenv import load_dotenv
from app.services.spotify_client import SpotifyClient

load_dotenv()

gemini_api_key = os.getenv('GEMINI_API_KEY')

client = AsyncOpenAI(
    api_key=gemini_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

@function_tool
def get_playlist_by_mood(mood: str, token: str) -> str:
    """
    Get a playlist based on the user's mood using Spotify API.
    """
    client = SpotifyClient(token)
    query = f"{mood} mood playlist"
    results = client.search(query)
    if results.get("playlists", {}).get("items"):
        playlist = results["playlists"]["items"][0]
        return f"{playlist['name']} - {playlist['external_urls']['spotify']}"
    return "No playlist found for this mood."

agent = Agent(
    name="Mood Music Assistant",
    instructions="You are a helpful assistant that recommends Spotify playlists based on the user's mood. The user provides their mood and token.",
    model=OpenAIChatCompletionsModel(model="gemini-2.0-flash", openai_client=client),
    tools=[get_playlist_by_mood]
)

class MoodMusicChatAgent:
    def __init__(self, spotify_token: str):
        self.spotify_token = spotify_token

    def ask_mood(self):
        return "Hey! 🎵 What kind of mood are you in today?"

    async def respond_to_mood(self, mood: str) -> str:
        query = f"My mood is {mood}. Use my Spotify token: {self.spotify_token}"
        result =await Runner.run(agent, query)
        return result.final_output
