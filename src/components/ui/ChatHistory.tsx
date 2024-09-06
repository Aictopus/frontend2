import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ChevronDown, ChevronUp, User, Bot } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
}

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  return (
    <div className="w-full max-w-xl mx-auto mb-4">
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : '40px',
          width: isExpanded ? '100%' : '40px'
        }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden shadow-md mx-auto"
        style={{ maxWidth: isExpanded ? '100%' : '40px' }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full h-10 flex items-center justify-center text-sm font-medium",
            "text-gray-700 dark:text-gray-200",
            "hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} className="ml-2" />
            </>
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px] w-full pr-4" ref={scrollAreaRef}>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "mb-4 flex",
                          message.isUser ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "flex items-start space-x-2 max-w-[80%]",
                          message.isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
                        )}>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            message.isUser ? "bg-blue-500" : "bg-gray-500"
                          )}>
                            {message.isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                          </div>
                          <div className={cn(
                            "rounded-lg p-3",
                            message.isUser ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"
                          )}>
                            <pre className="whitespace-pre-wrap break-words text-sm">
                              {message.content}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};