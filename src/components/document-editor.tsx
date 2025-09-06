import { Card } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Badge } from "./ui/badge.tsx";
import { Save, Download, Users, History } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { User, Collaborator, DocumentData } from "../types/index.ts";

interface DocumentEditorProps {
  meetingId: string;
  user: User;
}

export function DocumentEditor({ meetingId, user }: DocumentEditorProps) {
  const [content, setContent] = useState<string>("");
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load document content
  useEffect(() => {
    const loadDocument = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await fetch(`/make-server-22ef7db9/documents/${meetingId}`);
        
        if (response.ok) {
          const data: DocumentData = await response.json();
          setContent(data.content || "");
        } else {
          setContent("# Meeting Notes\n\nStart typing your collaborative notes here...");
        }
      } catch (error) {
        console.error("Failed to load document:", error);
        setContent("# Meeting Notes\n\nStart typing your collaborative notes here...");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [meetingId]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(async (): Promise<void> => {
      if (isTyping && content.trim().length > 0) {
        try {
          const response = await fetch(`/make-server-22ef7db9/documents/${meetingId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${user.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
          });

          if (response.ok) {
            setLastSaved(new Date());
            setIsTyping(false);
          }
        } catch (error) {
          console.error("Failed to save document:", error);
        }
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [content, isTyping, meetingId, user.access_token]);

  const handleContentChange = (value: string): void => {
    setContent(value);
    if (value.trim().length > 0) {
      setIsTyping(true);
    }
  };

  const saveDocument = async (): Promise<void> => {
    try {
      const response = await fetch(`/make-server-22ef7db9/documents/${meetingId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  };

  const exportDocument = (): void => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-notes-${meetingId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simulate real-time collaboration
  useEffect(() => {
    const simulateCollaboration = setInterval(() => {
      const mockCollaborators: Collaborator[] = [
        {
          id: "1",
          name: user.user_metadata?.name || "You",
          color: "#3b82f6",
          cursorPosition: Math.floor(content.length / 2),
          active: true
        },
        {
          id: "2",
          name: "John Doe",
          color: "#10b981",
          cursorPosition: Math.floor(content.length / 3),
          active: true
        },
        {
          id: "3",
          name: "Sarah Smith",
          color: "#f59e0b",
          cursorPosition: Math.floor(content.length / 4),
          active: false
        }
      ];
      setCollaborators(mockCollaborators);
    }, 3000);

    return () => clearInterval(simulateCollaboration);
  }, [content, user.user_metadata?.name]);

  const activeCollaborators = collaborators.filter(c => c.active);
  const userName = user.user_metadata?.name || user.email || "User";

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading document...</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Collaborative Document</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={saveDocument} 
              disabled={isTyping || content.trim().length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {isTyping ? "Saving..." : "Save"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportDocument}
              disabled={content.trim().length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {activeCollaborators.length} online
            </span>
            <div className="flex gap-1">
              {activeCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: collaborator.color }}
                  />
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {collaborator.name}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="w-3 h-3" />
            {isTyping ? (
              <span className="text-blue-600">Auto-saving...</span>
            ) : (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full h-full resize-none border-0 rounded-none p-4 text-sm leading-relaxed font-mono"
          placeholder="Start typing your meeting notes collaboratively..."
          style={{ minHeight: "300px" }}
          disabled={isLoading}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-2 border-t bg-secondary/30 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{content.length} characters</span>
          <span>{content.split('\n').length} lines</span>
          <span>Markdown format</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isTyping && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}