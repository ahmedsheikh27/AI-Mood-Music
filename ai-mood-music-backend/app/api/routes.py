from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from app.auth.spotify_oauth import get_auth_url, get_token
from app.agents.chat_agent import MoodMusicChatAgent
from app.models.request_models import MoodRequest

router = APIRouter()
user_agents = {}

@router.get("/login")
def login():
    return RedirectResponse(get_auth_url())

@router.get("/callback")
def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "Authorization failed"}, status_code=400)

    # exchange the code for token (your existing logic)
    token_data = get_token(code)
    access_token = token_data.get("access_token")

    # redirect to frontend
    redirect_url = f"http://localhost:3000/chat/?token={access_token}"
    return RedirectResponse(redirect_url)

@router.get("/chat/start")
def start_chat(spotify_token: str):
    agent = MoodMusicChatAgent(spotify_token)
    user_agents[spotify_token] = agent
    return {"message": agent.ask_mood()}

@router.post("/chat/respond")
async def respond_chat(data: MoodRequest):
    print("🧪 Received mood:", data.mood)
    print("🧪 Token:", data.spotify_token)

    agent = user_agents.get(data.spotify_token)
    if not agent:
        print("❌ Agent not found for token!")
        raise HTTPException(status_code=400, detail="Chat not started. Please call /chat/start first.")

    try:
        response = await agent.respond_to_mood(data.mood)
        return {"message": response}
    except Exception as e:
        print("❌ Error during respond_to_mood:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")