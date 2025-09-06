import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { VideoCallPanel } from "./components/video-call-panel";
import { ChatPanel } from "./components/chat-panel";
import { TranscriptView } from "./components/transcript-view";
import { AIQnA } from "./components/ai-qna";
import { ActionItems } from "./components/action-items";
import { MeetingSummary } from "./components/meeting-summary";
import { TaskManager } from "./components/task-manager";
import { CollaborativeWhiteboard } from "./components/collaborative-whiteboard";
import { PollingVoting } from "./components/polling-voting";
import { DocumentEditor } from "./components/document-editor";
import { TimerAgenda } from "./components/timer-agenda";
import { FileSharing } from "./components/file-sharing";
import { LoginModal } from "./components/auth/login-modal";
import { MeetingLobby } from "./components/meeting-lobby";
import { 
  MessageSquare, 
  FileText, 
  Bot, 
  CheckSquare, 
  FileBarChart, 
  ListTodo, 
  PenTool, 
  BarChart3, 
  FileEdit, 
  Timer, 
  Upload,
  Smile,
  LogIn,
  LogOut,
  User,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase/client";

export default function App() {
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [currentMeeting, setCurrentMeeting] = useState<{id: string, name: string} | null>(null);

  // Check for existing session on load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      setAccessToken(session.access_token);
    }
  };

  const handleLogin = (userData: any, token: string) => {
    setUser(userData);
    setAccessToken(token);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken("");
    setCurrentMeeting(null);
  };

  const handleJoinMeeting = (meetingId: string, meetingName: string) => {
    setCurrentMeeting({ id: meetingId, name: meetingName });
  };

  const handleLeaveMeeting = () => {
    setCurrentMeeting(null);
    setIsVideoFullscreen(false);
  };

  const toggleVideoFullscreen = () => {
    setIsVideoFullscreen(!isVideoFullscreen);
  };

  // Show meeting lobby if not in a meeting
  if (!currentMeeting) {
    return (
      <>
        <MeetingLobby 
          user={user}
          accessToken={accessToken}
          onJoinMeeting={handleJoinMeeting}
        />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      </>
    );
  }

  // Fullscreen Video View
  if (isVideoFullscreen) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Minimal Header for Fullscreen */}
        <div className="bg-white/95 backdrop-blur-sm border-b px-4 py-2 flex items-center justify-between shadow-sm absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg text-primary">Team Collaboration Platform</h1>
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Recording
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <Smile className="w-3 h-3" />
              Positive Meeting Mood
            </Badge>
            {user && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                {user.user_metadata?.name || user.email}
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Video */}
        <div className="flex-1 p-4 pt-20">
          <VideoCallPanel 
            isFullscreen={true} 
            onToggleFullscreen={toggleVideoFullscreen}
          />
        </div>
      </div>
    );
  }

  // Normal Split View
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLeaveMeeting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave
          </Button>
          <div>
            <h1 className="text-xl text-primary">Team Collaboration Platform</h1>
            <p className="text-sm text-muted-foreground">
              Meeting: {currentMeeting.name} • AI-Powered Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <Smile className="w-3 h-3" />
            Positive Meeting Mood
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Recording
          </Badge>
          
          {/* User Authentication */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-lg">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.user_metadata?.name || user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowLoginModal(true)} size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left Panel - Video + Chat */}
        <div className="w-1/2 flex flex-col gap-4 min-h-0">
          {/* Video Call - 70% */}
          <div className="flex-[7] min-h-0">
            <VideoCallPanel 
              isFullscreen={false} 
              onToggleFullscreen={toggleVideoFullscreen}
            />
          </div>
          
          {/* Chat - 30% */}
          <div className="flex-[3] min-h-0">
            <ChatPanel user={user} accessToken={accessToken} />
          </div>
        </div>

        {/* Right Panel - Tabbed Features */}
        <div className="w-1/2 min-h-0">
          <Tabs defaultValue="transcript" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-6 w-full mb-4">
              <TabsTrigger value="transcript" className="flex items-center gap-1 text-xs px-2">
                <MessageSquare className="w-3 h-3" />
                <span className="hidden sm:inline">Transcript</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-1 text-xs px-2">
                <FileBarChart className="w-3 h-3" />
                <span className="hidden sm:inline">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="ai-qa" className="flex items-center gap-1 text-xs px-2">
                <Bot className="w-3 h-3" />
                <span className="hidden sm:inline">AI Q&A</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-1 text-xs px-2">
                <CheckSquare className="w-3 h-3" />
                <span className="hidden sm:inline">Actions</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-1 text-xs px-2">
                <PenTool className="w-3 h-3" />
                <span className="hidden sm:inline">Tools</span>
              </TabsTrigger>
              <TabsTrigger value="more" className="flex items-center gap-1 text-xs px-2">
                <FileEdit className="w-3 h-3" />
                <span className="hidden sm:inline">More</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0">
              <TabsContent value="transcript" className="h-full m-0">
                <TranscriptView />
              </TabsContent>

              <TabsContent value="summary" className="h-full m-0">
                <MeetingSummary />
              </TabsContent>

              <TabsContent value="ai-qa" className="h-full m-0">
                <AIQnA />
              </TabsContent>

              <TabsContent value="actions" className="h-full m-0">
                <ActionItems />
              </TabsContent>

              <TabsContent value="tools" className="h-full m-0">
                <Tabs defaultValue="tasks" className="h-full flex flex-col">
                  <TabsList className="grid grid-cols-4 w-full mb-2">
                    <TabsTrigger value="tasks" className="text-xs">
                      <ListTodo className="w-3 h-3 mr-1" />
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="whiteboard" className="text-xs">
                      <PenTool className="w-3 h-3 mr-1" />
                      Board
                    </TabsTrigger>
                    <TabsTrigger value="polls" className="text-xs">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Polls
                    </TabsTrigger>
                    <TabsTrigger value="timer" className="text-xs">
                      <Timer className="w-3 h-3 mr-1" />
                      Timer
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 min-h-0">
                    <TabsContent value="tasks" className="h-full m-0">
                      <TaskManager user={user} accessToken={accessToken} />
                    </TabsContent>
                    <TabsContent value="whiteboard" className="h-full m-0">
                      <CollaborativeWhiteboard />
                    </TabsContent>
                    <TabsContent value="polls" className="h-full m-0">
                      <PollingVoting user={user} accessToken={accessToken} />
                    </TabsContent>
                    <TabsContent value="timer" className="h-full m-0">
                      <TimerAgenda />
                    </TabsContent>
                  </div>
                </Tabs>
              </TabsContent>

              <TabsContent value="more" className="h-full m-0">
                <Tabs defaultValue="document" className="h-full flex flex-col">
                  <TabsList className="grid grid-cols-2 w-full mb-2">
                    <TabsTrigger value="document" className="text-xs">
                      <FileEdit className="w-3 h-3 mr-1" />
                      Document
                    </TabsTrigger>
                    <TabsTrigger value="files" className="text-xs">
                      <Upload className="w-3 h-3 mr-1" />
                      Files
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 min-h-0">
                    <TabsContent value="document" className="h-full m-0">
                      <DocumentEditor />
                    </TabsContent>
                    <TabsContent value="files" className="h-full m-0">
                      <FileSharing />
                    </TabsContent>
                  </div>
                </Tabs>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}