import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Clock, Users, Target, TrendingUp } from "lucide-react";

const meetingSummary = {
  duration: "32 minutes",
  participants: 3,
  keyTopics: [
    "AI Meeting Assistant Development",
    "UI/UX Design Review", 
    "Competitive Analysis",
    "Project Timeline & Deadlines",
    "Feature Prioritization"
  ],
  mainDecisions: [
    "Prioritize AI transcription features for competitive advantage",
    "Set Friday deadline for first prototype completion",
    "Focus on real-time collaboration tools next sprint",
    "Implement polling system for user feedback collection"
  ],
  nextSteps: [
    "Sarah to complete UI mockups by Friday",
    "John to finish AI transcription testing",
    "Team to review competitor AI features",
    "Schedule follow-up meeting for Monday"
  ],
  sentiment: "Positive 😊",
  engagement: "High",
  productivity: "Excellent"
};

export function MeetingSummary() {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3>Meeting Summary</h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {meetingSummary.sentiment}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {meetingSummary.duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {meetingSummary.participants} participants
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm text-blue-700">Engagement</p>
              <p className="text-xs text-blue-600">{meetingSummary.engagement}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-green-700">Productivity</p>
              <p className="text-xs text-green-600">{meetingSummary.productivity}</p>
            </div>
          </div>
          
          {/* Key Topics */}
          <div>
            <h4 className="mb-3 text-primary">📋 Key Topics Discussed</h4>
            <div className="space-y-2">
              {meetingSummary.keyTopics.map((topic, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 bg-secondary/30 rounded">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {topic}
                </div>
              ))}
            </div>
          </div>
          
          {/* Main Decisions */}
          <div>
            <h4 className="mb-3 text-primary">✅ Key Decisions Made</h4>
            <div className="space-y-2">
              {meetingSummary.mainDecisions.map((decision, index) => (
                <div key={index} className="text-sm p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="leading-relaxed">{decision}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Next Steps */}
          <div>
            <h4 className="mb-3 text-primary">🎯 Next Steps</h4>
            <div className="space-y-2">
              {meetingSummary.nextSteps.map((step, index) => (
                <div key={index} className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}