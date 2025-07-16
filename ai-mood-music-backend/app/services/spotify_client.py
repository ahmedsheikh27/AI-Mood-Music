import requests

class SpotifyClient:
    def __init__(self, token: str):
        self.token = token

    def search(self, query: str, type_: str = "playlist", limit: int = 5):
        headers = {"Authorization": f"Bearer {self.token}"}
        params = {"q": query, "type": type_, "limit": limit}
        res = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
        return res.json()
