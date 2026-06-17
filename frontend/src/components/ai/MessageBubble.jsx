import React from 'react'
import { User, Sparkles } from 'lucide-react'

export const MessageBubble = ({ role, content }) => {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 my-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      {/* Avatar Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm ${
          isUser
            ? 'bg-primary/10 text-primary'
            : 'bg-accent/15 text-accent'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Balloon */}
      <div
        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-card text-card-foreground border border-border/80 rounded-tl-none'
        }`}
      >
        <p className="whitespace-pre-line">{content}</p>
      </div>
    </div>
  )
}

export default MessageBubble
