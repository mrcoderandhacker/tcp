import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Plus, Calendar, User } from "lucide-react";
import { useState, useEffect } from "react";
import { authenticatedApiCall, apiCall } from "../utils/api";
import { supabase } from "../utils/supabase/client";

interface Task {
  id: string;
  title: string;
  assignee_name: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  source: 'manual' | 'ai-extracted';
  created_at: string;
}

interface TaskManagerProps {
  user?: any;
  accessToken?: string;
}

const initialDemoTasks: Task[] = [
  {
    id: "1",
    title: "Complete AI transcription system testing",
    assignee_name: "John",
    due_date: "2025-01-09",
    priority: "high",
    completed: false,
    source: "ai-extracted",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Finish UI mockups for collaboration platform",
    assignee_name: "Sarah",
    due_date: "2025-01-10",
    priority: "high",
    completed: false,
    source: "ai-extracted",
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Implement real-time polling system",
    assignee_name: "Sarah",
    due_date: "2025-01-08",
    priority: "medium",
    completed: true,
    source: "ai-extracted",
    created_at: new Date().toISOString()
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'default';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function TaskManager({ user, accessToken }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialDemoTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as Task, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new as Task : task
            ));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTasks = async () => {
    try {
      const response = await apiCall('/tasks');
      setTasks(response.tasks || initialDemoTasks);
    } catch (error) {
      console.log('Backend unavailable, using demo data:', error.message);
      // Keep demo tasks as fallback
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    
    // Optimistic update
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: newCompleted } : t
    ));

    if (user && accessToken && !accessToken.startsWith('guest')) {
      try {
        await authenticatedApiCall(`/tasks/${taskId}`, accessToken, {
          method: 'PUT',
          body: JSON.stringify({ completed: newCompleted }),
        });
      } catch (error) {
        console.error('Failed to update task:', error);
        // Revert on error
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, completed: task.completed } : t
        ));
      }
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setIsLoading(true);
    const tempId = 'temp-' + Date.now();
    
    const newTask: Task = {
      id: tempId,
      title: newTaskTitle,
      assignee_name: user?.user_metadata?.name || "You",
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "medium",
      completed: false,
      source: "manual",
      created_at: new Date().toISOString()
    };
    
    // Optimistic update
    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");

    if (user && accessToken && !accessToken.startsWith('guest')) {
      try {
        const response = await authenticatedApiCall('/tasks', accessToken, {
          method: 'POST',
          body: JSON.stringify({
            title: newTaskTitle,
            assignee_name: user.user_metadata?.name || "You",
            due_date: newTask.due_date,
            priority: "medium",
            source: "manual"
          }),
        });
        
        // Replace temp task with real one
        setTasks(prev => prev.map(t => 
          t.id === tempId ? response.task : t
        ));
      } catch (error) {
        console.error('Failed to create task:', error);
        // Keep the optimistic update for demo
      }
    }
    
    setIsLoading(false);
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3>Task Manager</h3>
        <p className="text-sm text-muted-foreground">
          {activeTasks.length} active • {completedTasks.length} completed
        </p>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <Input
            placeholder={user ? "Add new task..." : "Sign in to add tasks..."}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            disabled={!user || isLoading}
            className="flex-1"
          />
          <Button 
            onClick={addTask} 
            size="sm" 
            disabled={!user || isLoading || !newTaskTitle.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Active Tasks */}
          <div>
            <h4 className="mb-3 text-orange-600">📋 Active Tasks ({activeTasks.length})</h4>
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-3 bg-orange-50/30">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                      disabled={!user}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm">{task.title}</h5>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.source === 'ai-extracted' && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              AI
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignee_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.due_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Completed Tasks */}
          {showCompleted && completedTasks.length > 0 && (
            <div>
              <h4 className="mb-3 text-green-600">✅ Completed ({completedTasks.length})</h4>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div key={task.id} className="border border-green-200 rounded-lg p-3 bg-green-50/30 opacity-75">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                        disabled={!user}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-sm line-through">{task.title}</h5>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {task.priority}
                            </Badge>
                            {task.source === 'ai-extracted' && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.assignee_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.due_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}