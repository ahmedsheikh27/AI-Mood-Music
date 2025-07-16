"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation" // Import useRouter and useSearchParams
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Music, Send, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { ChatMessage } from "@/components/chat-message"

export type Message = {
  id: string
  role: "user" | "ai"
  content: string
}

type PlaylistResult = {
  name: string
  link: string
}

export default function HomePage() {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [playlistResult, setPlaylistResult] = useState<PlaylistResult | null>(null)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const router = useRouter() // Initialize useRouter
  const searchParams = useSearchParams() // Initialize useSearchParams

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check for Spotify token on component mount or from URL
  useEffect(() => {
    const urlToken = searchParams.get("token")
    const storedToken = localStorage.getItem("spotify_access_token")

    if (urlToken) {
      // If token is in URL, store it and clean the URL
      localStorage.setItem("spotify_access_token", urlToken)
      setSpotifyToken(urlToken)
      router.replace("/") // Clean the URL by removing the token query param
      toast({
        title: "Spotify Connected!",
        description: "You can now use the Mood Music Finder.",
      })
    } else if (storedToken) {
      // If no token in URL, check localStorage
      setSpotifyToken(storedToken)
    }
  }, [searchParams, router, toast])

  // Initialize chat with AI agent after Spotify token is available
  useEffect(() => {
    const startChat = async () => {
      if (spotifyToken && messages.length === 0) {
        // Only start if token exists and no messages yet
        setIsLoading(true)
        try {
          const response = await api.get("/chat/start", {
            params: { spotify_token: spotifyToken },
          })
          setMessages([{ id: "ai-initial", role: "ai", content: response.data.message }])
        } catch (error) {
          console.error("Error starting chat:", error)
          toast({
            title: "Chat Initialization Failed",
            description: "Could not start the chat with the AI. Please try again.",
            variant: "destructive",
          })
          // Clear token if chat fails to start, forcing re-login
          localStorage.removeItem("spotify_access_token")
          setSpotifyToken(null)
        } finally {
          setIsLoading(false)
        }
      }
    }
    startChat()
  }, [spotifyToken, messages.length, toast])

  const handleConnectSpotify = () => {
    // Redirect to your FastAPI backend's login endpoint
    window.location.href = "http://127.0.0.1:8000/api/login"
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || !spotifyToken || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setPlaylistResult(null) // Clear previous playlist result

    try {
      const response = await api.post("/chat/respond", {
        spotify_token: spotifyToken,
        mood: userMessage.content,
      })

      const aiResponseContent = response.data.message

      // Check if the response contains a playlist link
      const playlistRegex = /(https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+)/
      const match = aiResponseContent.match(playlistRegex)

      if (match) {
        const playlistLink = match[0]
        const playlistNameMatch = aiResponseContent.match(/Here's your playlist: "([^"]+)"/)
        const playlistName = playlistNameMatch ? playlistNameMatch[1] : "Your Mood Playlist"

        setPlaylistResult({ name: playlistName, link: playlistLink })
        // Remove the link from the AI message content for cleaner display
        const cleanedAiResponse = aiResponseContent.replace(playlistRegex, "").trim()
        setMessages((prev) => [...prev, { id: Date.now().toString() + "-ai", role: "ai", content: cleanedAiResponse }])
      } else {
        setMessages((prev) => [...prev, { id: Date.now().toString() + "-ai", role: "ai", content: aiResponseContent }])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Message Failed",
        description: "Could not get a response from the AI. Please try again.",
        variant: "destructive",
      })
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-error", role: "ai", content: "Oops! Something went wrong. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!spotifyToken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800 p-4 text-white">
        <Card className="w-full max-w-md bg-white/10 text-white shadow-lg backdrop-blur-sm">
          <CardHeader className="text-center">
            <Music className="mx-auto mb-4 h-16 w-16 text-white" />
            <CardTitle className="text-3xl font-bold">AI Mood Music Finder</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-lg">Discover the perfect soundtrack for your mood with the power of AI.</p>
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800 p-4">
      <Card className="relative flex h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl dark:bg-zinc-800">
        <CardHeader className="border-b p-4 dark:border-zinc-700">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">AI Mood Music Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full pr-4">
            <div className="flex flex-col space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-lg bg-gray-200 p-3 text-sm text-gray-800 shadow-md dark:bg-zinc-700 dark:text-gray-100">
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                    AI is typing...
                  </div>
                </div>
              )}
              {playlistResult && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-lg bg-green-100 p-3 text-sm text-green-800 shadow-md dark:bg-green-900 dark:text-green-100">
                    <p className="font-semibold">Here's your playlist:</p>
                    <a
                      href={playlistResult.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {playlistResult.name}
                    </a>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4 dark:border-zinc-700">
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              placeholder="Tell me about your mood..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-grow rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}
