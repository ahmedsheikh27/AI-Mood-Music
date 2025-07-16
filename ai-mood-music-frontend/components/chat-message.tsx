import { cn } from "@/lib/utils"
import type { Message } from "@/app/chat/page" // Import the Message type from app/chat/page.tsx

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3 text-sm shadow-md",
          isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-100",
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
