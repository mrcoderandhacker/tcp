import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Send } from "lucide-react";
import { useState, useEffect } from "react";
import { authenticatedApiCall, apiCall } from "../utils/api";
import { supabase } from "../utils/supabase/client";

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface ChatPanelProps {
  user?: any;
  accessToken?: string;
}

export function ChatPanel({ user, accessToken }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load messages on component mount and set up polling for real-time updates
  useEffect(() => {
    loadMessages();
    
    // Set up polling for real-time updates since we're using KV store
    const pollInterval = setInterval(() => {
      loadMessages();
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await apiCall('/messages');
      setMessages(response.messages || []);
    } catch (error) {
      console.log('Backend unavailable, using demo data:', error.message);
      // Fall back to demo messages if backend fails
      setMessages([
        {
          id: "1",
          user_id: "demo-john",
          user_name: "John",
          content: "Hey everyone, ready to start the design review?",
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          user_id: "demo-sarah",
          user_name: "Sarah",
          content: "Yes! I've got the latest mockups ready to share",
          created_at: new Date(Date.now() - 9 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          user_id: user?.id || "demo-you",
          user_name: user?.user_metadata?.name || "You",
          content: "Perfect timing. Let's go through each feature.",
          created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        }
      ]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsLoading(true);
    try {
      if (user && accessToken && !accessToken.startsWith('guest')) {
        // Send to real backend
        await authenticatedApiCall('/messages', accessToken, {
          method: 'POST',
          body: JSON.stringify({
            content: newMessage,
            user_name: user.user_metadata?.name || user.email || 'User'
          }),
        });
      } else {
        // Demo mode - add message locally
        const demoMessage: Message = {
          id: Date.now().toString(),
          user_id: user?.id || 'demo-user',
          user_name: user?.user_metadata?.name || 'You',
          content: newMessage,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, demoMessage]);
      }
      
      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
      // Still add to local state for demo
      const demoMessage: Message = {
        id: Date.now().toString(),
        user_id: user?.id || 'demo-user',
        user_name: user?.user_metadata?.name || 'You',
        content: newMessage,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, demoMessage]);
      setNewMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h3>Team Chat</h3>
        <p className="text-sm text-muted-foreground">
          {user ? `${messages.length} messages` : 'Sign in for real-time chat'}
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-3 py-2 ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs opacity-75 mb-1">{message.user_name}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'opacity-75' : 'text-muted-foreground'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder={user ? "Type a message..." : "Sign in to chat..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={!user || isLoading}
          className="flex-1"
        />
        <Button 
          onClick={sendMessage} 
          size="sm" 
          disabled={!user || isLoading || !newMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}