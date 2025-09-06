import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useState } from "react";

interface QnAItem {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

const mockQnA: QnAItem[] = [
  {
    id: "1",
    question: "What are the main action items from today's discussion?",
    answer: "Based on the meeting transcript, the main action items are: 1) Sarah to finish UI mockups by Friday, 2) Complete AI transcription system testing, 3) Integrate polling system for real-time feedback, 4) Implement sentiment analysis features.",
    timestamp: "10:28 AM"
  },
  {
    id: "2",
    question: "Who mentioned the deadline and when is it?",
    answer: "Sarah mentioned the deadline. The first prototype deadline is this Friday. This was discussed at 10:30:42 during the meeting.",
    timestamp: "10:29 AM"
  },
  {
    id: "3",
    question: "What features were discussed as competitive advantages?",
    answer: "The AI-powered features were highlighted as competitive advantages, specifically: keyword extraction, action item detection, real-time sentiment analysis, and collaborative polling systems.",
    timestamp: "10:31 AM"
  }
];

export function AIQnA() {
  const [qnaHistory, setQnAHistory] = useState<QnAItem[]>(mockQnA);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const newQnA: QnAItem = {
        id: Date.now().toString(),
        question: question,
        answer: "I'm analyzing the meeting content to provide you with an accurate answer. Based on the current discussion, here's what I found relevant to your question...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setQnAHistory([...qnaHistory, newQnA]);
      setQuestion("");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3>AI Meeting Assistant</h3>
        <p className="text-sm text-muted-foreground">Ask questions about the meeting content</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {qnaHistory.map((item) => (
            <div key={item.id} className="space-y-3">
              {/* Question */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{item.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                </div>
              </div>
              
              {/* Answer */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 bg-secondary p-3 rounded-lg">
                  <p className="text-sm leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 bg-secondary p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Analyzing meeting content...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t flex gap-2">
        <Input
          placeholder="Ask about the meeting..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={askQuestion} disabled={isLoading || !question.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}