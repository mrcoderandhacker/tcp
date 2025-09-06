import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { CheckCircle2, Clock, AlertCircle, User } from "lucide-react";

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  extractedFrom: string;
}

const mockActionItems: ActionItem[] = [
  {
    id: "1",
    task: "Finish UI mockups for the collaboration platform",
    assignee: "Sarah",
    dueDate: "Friday, Jan 10",
    priority: "high",
    status: "in-progress",
    extractedFrom: "10:30:42 - Sarah: The deadline for the first prototype is this Friday"
  },
  {
    id: "2",
    task: "Complete AI transcription system testing",
    assignee: "John",
    dueDate: "Thursday, Jan 9",
    priority: "high",
    status: "pending",
    extractedFrom: "10:31:28 - John: AI-powered features like keyword extraction need testing"
  },
  {
    id: "3",
    task: "Implement real-time polling system integration",
    assignee: "Sarah",
    dueDate: "Wednesday, Jan 8",
    priority: "medium",
    status: "completed",
    extractedFrom: "10:31:55 - Sarah: The polling system integration is almost complete"
  },
  {
    id: "4",
    task: "Review competitor analysis for AI features",
    assignee: "You",
    dueDate: "Tomorrow, Jan 7",
    priority: "medium",
    status: "pending",
    extractedFrom: "10:31:28 - Discussion about competitive advantages"
  },
  {
    id: "5",
    task: "Test sentiment analysis implementation",
    assignee: "Team",
    dueDate: "End of week",
    priority: "low",
    status: "pending",
    extractedFrom: "10:31:05 - Focus on meeting sentiment analysis next"
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
    case 'pending': return <AlertCircle className="w-4 h-4 text-orange-600" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export function ActionItems() {
  const pendingItems = mockActionItems.filter(item => item.status !== 'completed');
  const completedItems = mockActionItems.filter(item => item.status === 'completed');

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3>Action Items</h3>
        <p className="text-sm text-muted-foreground">
          AI-detected tasks from meeting discussion
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Pending Items */}
          <div>
            <h4 className="mb-3 text-orange-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Pending & In Progress ({pendingItems.length})
            </h4>
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div key={item.id} className="border border-orange-200 rounded-lg p-3 bg-orange-50/50">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <h5 className="text-sm">{item.task}</h5>
                    </div>
                    <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                      {item.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.assignee}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.dueDate}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground bg-white/60 p-2 rounded border">
                    <strong>Extracted from:</strong> {item.extractedFrom}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <h4 className="mb-3 text-green-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed ({completedItems.length})
              </h4>
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div key={item.id} className="border border-green-200 rounded-lg p-3 bg-green-50/50 opacity-75">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <h5 className="text-sm line-through">{item.task}</h5>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.assignee}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.dueDate}
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