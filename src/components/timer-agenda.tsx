import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Circle } from "lucide-react";
import { useState, useEffect } from "react";

interface AgendaItem {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
  startTime?: Date;
}

const agendaItems: AgendaItem[] = [
  {
    id: "1",
    title: "Welcome & Introductions",
    duration: 5,
    completed: true,
    startTime: new Date(Date.now() - 35 * 60 * 1000) // Started 35 min ago
  },
  {
    id: "2", 
    title: "AI Transcription Demo",
    duration: 10,
    completed: true,
    startTime: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: "3",
    title: "UI/UX Design Review",
    duration: 15,
    completed: false,
    startTime: new Date(Date.now() - 20 * 60 * 1000)
  },
  {
    id: "4",
    title: "Competitive Analysis Discussion",
    duration: 10,
    completed: false
  },
  {
    id: "5",
    title: "Sprint Planning & Action Items",
    duration: 15,
    completed: false
  },
  {
    id: "6",
    title: "Q&A and Wrap-up",
    duration: 5,
    completed: false
  }
];

export function TimerAgenda() {
  const [totalTime, setTotalTime] = useState(32 * 60 + 45); // 32 minutes 45 seconds
  const [isRunning, setIsRunning] = useState(true);
  const [agenda, setAgenda] = useState(agendaItems);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTotalTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTotalTime(0);
    setIsRunning(false);
  };

  const toggleAgendaItem = (itemId: string) => {
    setAgenda(agenda.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedItems = agenda.filter(item => item.completed).length;
  const totalItems = agenda.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  const currentItem = agenda.find(item => !item.completed);
  const totalPlannedDuration = agenda.reduce((sum, item) => sum + item.duration, 0);

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3>Meeting Timer & Agenda</h3>
        <p className="text-sm text-muted-foreground">
          {completedItems}/{totalItems} items completed
        </p>
      </div>
      
      {/* Timer Display */}
      <div className="p-4 border-b bg-secondary/30">
        <div className="text-center space-y-3">
          <div className="text-3xl font-mono tracking-wider text-primary">
            {formatTime(totalTime)}
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleTimer}>
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="outline" size="sm" onClick={resetTimer}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Planned: {totalPlannedDuration}m</span>
            <span>Current: {Math.floor(totalTime / 60)}m</span>
            <span className={totalTime > totalPlannedDuration * 60 ? 'text-red-600' : 'text-green-600'}>
              {totalTime > totalPlannedDuration * 60 ? 'Over' : 'On track'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="p-4 border-b">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {currentItem && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">Current: {currentItem.title}</span>
              <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300">
                {currentItem.duration}m
              </Badge>
            </div>
          </div>
        )}
      </div>
      
      {/* Agenda Items */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {agenda.map((item, index) => (
            <div 
              key={item.id} 
              className={`border rounded-lg p-3 transition-colors ${
                item.completed 
                  ? 'bg-green-50 border-green-200' 
                  : item === currentItem
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-secondary/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleAgendaItem(item.id)}
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {index + 1}. {item.title}
                    </h5>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={item.completed ? 'secondary' : item === currentItem ? 'default' : 'outline'} 
                        className="text-xs"
                      >
                        {item.duration}m
                      </Badge>
                      {item.completed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      {item === currentItem && <Circle className="w-4 h-4 text-blue-600 animate-pulse" />}
                    </div>
                  </div>
                  
                  {item.startTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Started: {item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Summary */}
      <div className="p-3 border-t bg-secondary/20 text-xs text-center text-muted-foreground">
        {completedItems === totalItems ? (
          <span className="text-green-600">🎉 All agenda items completed!</span>
        ) : (
          <span>
            {totalItems - completedItems} items remaining • 
            Estimated {agenda.filter(item => !item.completed).reduce((sum, item) => sum + item.duration, 0)}m left
          </span>
        )}
      </div>
    </Card>
  );
}