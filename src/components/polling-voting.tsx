import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Plus, BarChart3, Users, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { authenticatedApiCall, apiCall } from "../utils/api";
import { supabase } from "../utils/supabase/client";

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: { [optionIndex: number]: number };
  totalVotes: number;
  is_active: boolean;
  creator_name: string;
  created_at: string;
}

interface PollingVotingProps {
  user?: any;
  accessToken?: string;
}

const initialDemoPolls: Poll[] = [
  {
    id: "1",
    question: "Which AI feature should we prioritize next?",
    options: ["Real-time sentiment analysis", "Advanced keyword extraction", "Meeting mood tracking", "Voice tone analysis"],
    votes: { 0: 5, 1: 3, 2: 7, 3: 2 },
    totalVotes: 17,
    is_active: true,
    creator_name: "John",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    question: "Best time for our next design review?",
    options: ["Tomorrow 2 PM", "Wednesday 10 AM", "Thursday 3 PM"],
    votes: { 0: 2, 1: 8, 2: 4 },
    totalVotes: 14,
    is_active: false,
    creator_name: "Sarah",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  }
];

export function PollingVoting({ user, accessToken }: PollingVotingProps) {
  const [polls, setPolls] = useState<Poll[]>(initialDemoPolls);
  const [newPoll, setNewPoll] = useState({ question: "", options: ["", ""] });
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: number }>({ "2": 1 });
  const [isLoading, setIsLoading] = useState(false);

  // Load polls on component mount
  useEffect(() => {
    loadPolls();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('polls')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'polls' },
        () => {
          loadPolls(); // Reload all polls when changes occur
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'poll_votes' },
        () => {
          loadPolls(); // Reload polls when votes change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadPolls = async () => {
    try {
      const response = await apiCall('/polls');
      setPolls(response.polls || initialDemoPolls);
    } catch (error) {
      console.log('Backend unavailable, using demo data:', error.message);
      // Keep demo polls as fallback
    }
  };

  const vote = async (pollId: string, optionIndex: number) => {
    if (userVotes[pollId] !== undefined) return; // Already voted
    
    // Optimistic update
    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          votes: { ...poll.votes, [optionIndex]: (poll.votes[optionIndex] || 0) + 1 },
          totalVotes: poll.totalVotes + 1
        };
      }
      return poll;
    }));
    
    setUserVotes({ ...userVotes, [pollId]: optionIndex });

    if (user && accessToken && !accessToken.startsWith('guest')) {
      try {
        await authenticatedApiCall(`/polls/${pollId}/vote`, accessToken, {
          method: 'POST',
          body: JSON.stringify({ option_index: optionIndex }),
        });
      } catch (error) {
        console.error('Failed to record vote:', error);
        // Keep optimistic update for demo
      }
    }
  };

  const addOption = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, ""]
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({ ...newPoll, options: newOptions });
  };

  const createPoll = async () => {
    if (!newPoll.question || !newPoll.options.every(opt => opt.trim())) return;
    
    setIsLoading(true);
    const tempId = 'temp-' + Date.now();
    
    const poll: Poll = {
      id: tempId,
      question: newPoll.question,
      options: newPoll.options.filter(opt => opt.trim()),
      votes: {},
      totalVotes: 0,
      is_active: true,
      creator_name: user?.user_metadata?.name || "You",
      created_at: new Date().toISOString()
    };
    
    // Optimistic update
    setPolls([poll, ...polls]);
    setNewPoll({ question: "", options: ["", ""] });
    setShowCreatePoll(false);

    if (user && accessToken && !accessToken.startsWith('guest')) {
      try {
        const response = await authenticatedApiCall('/polls', accessToken, {
          method: 'POST',
          body: JSON.stringify({
            question: newPoll.question,
            options: poll.options
          }),
        });
        
        // Replace temp poll with real one
        setPolls(prev => prev.map(p => 
          p.id === tempId ? response.poll : p
        ));
      } catch (error) {
        console.error('Failed to create poll:', error);
        // Keep optimistic update for demo
      }
    }
    
    setIsLoading(false);
  };

  const getPercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3>Live Polling</h3>
          <Button 
            onClick={() => setShowCreatePoll(!showCreatePoll)} 
            size="sm"
            variant={showCreatePoll ? "secondary" : "default"}
            disabled={!user}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Poll
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {user ? "Real-time team voting and feedback" : "Sign in to create polls and vote"}
        </p>
      </div>
      
      {showCreatePoll && user && (
        <div className="p-4 border-b bg-secondary/30">
          <div className="space-y-3">
            <Input
              placeholder="Enter your question..."
              value={newPoll.question}
              onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            />
            
            {newPoll.options.map((option, index) => (
              <Input
                key={index}
                placeholder={`Option ${index + 1}...`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
              />
            ))}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addOption}>
                Add Option
              </Button>
              <Button size="sm" onClick={createPoll} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Poll"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCreatePoll(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {polls.map((poll) => (
            <div key={poll.id} className={`border rounded-lg p-4 ${poll.is_active ? 'bg-blue-50/30 border-blue-200' : 'bg-gray-50/30'}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-sm mb-1">{poll.question}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {poll.creator_name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(poll.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {poll.totalVotes} votes
                    </div>
                  </div>
                </div>
                <Badge variant={poll.is_active ? "default" : "secondary"} className="text-xs">
                  {poll.is_active ? "Active" : "Closed"}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {poll.options.map((option, index) => {
                  const votes = poll.votes[index] || 0;
                  const percentage = getPercentage(votes, poll.totalVotes);
                  const hasVoted = userVotes[poll.id] !== undefined;
                  const userSelectedThis = userVotes[poll.id] === index;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{option}</span>
                        <span className="text-xs text-muted-foreground">{votes} votes ({percentage}%)</span>
                      </div>
                      
                      <div className="relative">
                        <Progress value={percentage} className="h-6" />
                        
                        {!hasVoted && poll.is_active && user && (
                          <button
                            onClick={() => vote(poll.id, index)}
                            className="absolute inset-0 bg-transparent hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                          />
                        )}
                        
                        {userSelectedThis && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              Your vote
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {poll.is_active && userVotes[poll.id] === undefined && user && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Click on any option to vote
                </p>
              )}
              
              {!user && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Sign in to participate in voting
                </p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}