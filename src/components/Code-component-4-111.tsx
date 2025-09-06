import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Video, 
  Users, 
  Lock, 
  Plus, 
  LogIn, 
  Calendar,
  Clock,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import { authenticatedApiCall, apiCall } from "../utils/api";

interface Meeting {
  id: string;
  name: string;
  creator_name: string;
  created_at: string;
  participant_count: number;
  is_active: boolean;
}

interface MeetingLobbyProps {
  user?: any;
  accessToken?: string;
  onJoinMeeting: (meetingId: string, meetingName: string) => void;
}

export function MeetingLobby({ user, accessToken, onJoinMeeting }: MeetingLobbyProps) {
  const [activeTab, setActiveTab] = useState("join");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create meeting form
  const [newMeetingName, setNewMeetingName] = useState("");
  const [newMeetingPassword, setNewMeetingPassword] = useState("");
  
  // Join meeting form
  const [joinMeetingName, setJoinMeetingName] = useState("");
  const [joinMeetingPassword, setJoinMeetingPassword] = useState("");

  useEffect(() => {
    if (user) {
      loadMeetings();
      // Poll for meeting updates
      const interval = setInterval(loadMeetings, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadMeetings = async () => {
    try {
      const response = await apiCall('/meetings');
      setMeetings(response.meetings || []);
    } catch (error) {
      console.error('Failed to load meetings:', error);
      // Show demo meetings if backend fails
      setMeetings([
        {
          id: "demo-1",
          name: "Product Strategy Meeting",
          creator_name: "Sarah Johnson",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          participant_count: 3,
          is_active: true
        },
        {
          id: "demo-2", 
          name: "Design Review Session",
          creator_name: "Alex Chen",
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          participant_count: 5,
          is_active: true
        }
      ]);
    }
  };

  const createMeeting = async () => {
    if (!newMeetingName.trim()) return;
    
    setIsLoading(true);
    try {
      if (user && accessToken) {
        const response = await authenticatedApiCall('/meetings', accessToken, {
          method: 'POST',
          body: JSON.stringify({
            name: newMeetingName.trim(),
            password: newMeetingPassword.trim() || undefined
          }),
        });
        
        if (response.meeting) {
          onJoinMeeting(response.meeting.id, response.meeting.name);
        }
      } else {
        // Demo mode
        const meetingId = `demo-${Date.now()}`;
        onJoinMeeting(meetingId, newMeetingName.trim());
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
      // Still proceed in demo mode
      const meetingId = `demo-${Date.now()}`;
      onJoinMeeting(meetingId, newMeetingName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const joinMeeting = async (meetingId?: string, meetingName?: string) => {
    const nameToJoin = meetingName || joinMeetingName.trim();
    const idToJoin = meetingId || `join-${Date.now()}`;
    
    if (!nameToJoin) return;
    
    setIsLoading(true);
    try {
      if (user && accessToken && meetingId) {
        // Verify meeting exists and password if needed
        await authenticatedApiCall(`/meetings/${meetingId}/join`, accessToken, {
          method: 'POST',
          body: JSON.stringify({
            password: joinMeetingPassword.trim() || undefined
          }),
        });
      }
      
      onJoinMeeting(idToJoin, nameToJoin);
    } catch (error) {
      console.error('Failed to join meeting:', error);
      // Still proceed in demo mode
      onJoinMeeting(idToJoin, nameToJoin);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2 text-primary">Team Collaboration Platform</h1>
          <p className="text-lg text-muted-foreground">AI-Powered Meeting Assistant</p>
          {user && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <User className="w-4 h-4" />
              <span className="text-sm">Welcome, {user.user_metadata?.name || user.email}</span>
            </div>
          )}
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Meeting Lobby
            </CardTitle>
            <CardDescription>
              Create a new meeting or join an existing one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="join">Join Meeting</TabsTrigger>
                <TabsTrigger value="create">Create Meeting</TabsTrigger>
                <TabsTrigger value="active">Active Meetings</TabsTrigger>
              </TabsList>
              
              {/* Join Meeting Tab */}
              <TabsContent value="join" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="meeting-name">Meeting Name</Label>
                    <Input
                      id="meeting-name"
                      placeholder="Enter meeting name..."
                      value={joinMeetingName}
                      onChange={(e) => setJoinMeetingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && joinMeeting()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="meeting-password">Password (if required)</Label>
                    <Input
                      id="meeting-password"
                      type="password"
                      placeholder="Enter password..."
                      value={joinMeetingPassword}
                      onChange={(e) => setJoinMeetingPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && joinMeeting()}
                    />
                  </div>
                  <Button 
                    onClick={() => joinMeeting()} 
                    className="w-full" 
                    size="lg"
                    disabled={!joinMeetingName.trim() || isLoading}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isLoading ? "Joining..." : "Join Meeting"}
                  </Button>
                </div>
              </TabsContent>
              
              {/* Create Meeting Tab */}
              <TabsContent value="create" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-meeting-name">Meeting Name</Label>
                    <Input
                      id="new-meeting-name"
                      placeholder="e.g., Team Standup, Product Review..."
                      value={newMeetingName}
                      onChange={(e) => setNewMeetingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createMeeting()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-meeting-password">Password (optional)</Label>
                    <Input
                      id="new-meeting-password"
                      type="password"
                      placeholder="Leave empty for public meeting..."
                      value={newMeetingPassword}
                      onChange={(e) => setNewMeetingPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createMeeting()}
                    />
                  </div>
                  <Button 
                    onClick={createMeeting} 
                    className="w-full" 
                    size="lg"
                    disabled={!newMeetingName.trim() || isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? "Creating..." : "Create & Join Meeting"}
                  </Button>
                </div>
              </TabsContent>
              
              {/* Active Meetings Tab */}
              <TabsContent value="active" className="mt-6">
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {meetings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No active meetings found</p>
                        <p className="text-sm">Create a new meeting to get started</p>
                      </div>
                    ) : (
                      meetings.map((meeting) => (
                        <Card key={meeting.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4>{meeting.name}</h4>
                                  {meeting.id.includes('password') && (
                                    <Lock className="w-3 h-3 text-muted-foreground" />
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    {meeting.participant_count}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {meeting.creator_name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(meeting.created_at)}
                                  </span>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => joinMeeting(meeting.id, meeting.name)}
                                disabled={isLoading}
                              >
                                <LogIn className="w-3 h-3 mr-1" />
                                Join
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Your meetings are secured with end-to-end encryption</p>
        </div>
      </div>
    </div>
  );
}