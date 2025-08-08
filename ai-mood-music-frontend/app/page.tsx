"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

export default function HomePage() {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const urlToken = searchParams.get("token")
    const storedToken = localStorage.getItem("spotify_access_token")

    if (urlToken) {
      // Store token and go to chat page
      localStorage.setItem("spotify_access_token", urlToken)
      setSpotifyToken(urlToken)
      router.replace("/chat")
      toast({
        title: "Spotify Connected!",
        description: "You can now use the Mood Music Finder.",
      })
    } else if (storedToken) {
      setSpotifyToken(storedToken)
      router.replace("/chat")
    }
  }, [searchParams, router, toast])

  const handleConnectSpotify = () => {
    window.location.href = "http://127.0.0.1:8000/api/login"
  }

  if (spotifyToken) {
    return null // No UI here — redirect handled in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800 p-4 text-white">
      <Card className="w-full max-w-md bg-white/10 text-white shadow-lg backdrop-blur-sm">
        <CardHeader className="text-center">
          <Music className="mx-auto mb-4 h-16 w-16 text-white" />
          <CardTitle className="text-3xl font-bold">AI Mood Music Finder</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-lg">
            Discover the perfect soundtrack for your mood with the power of AI.
          </p>
          <Button
            onClick={handleConnectSpotify}
            className="w-full rounded-full bg-green-500 py-3 text-lg font-semibold text-white shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            Connect Spotify
          </Button>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
