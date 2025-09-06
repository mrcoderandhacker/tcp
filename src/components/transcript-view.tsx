import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Search, Download } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const mockTranscript = [
  {
    speaker: "John",
    timestamp: "10:30:15",
    text: "Good morning everyone. Let's start today's design review. We have several key features to discuss including the AI transcription system."
  },
  {
    speaker: "Sarah",
    timestamp: "10:30:42",
    text: "Thanks John. I've been working on the user interface mockups. The deadline for the first prototype is this Friday, so we need to prioritize the core features."
  },
  {
    speaker: "You",
    timestamp: "10:31:05",
    text: "Great work Sarah. The real-time collaboration tools are looking excellent. We should focus on the meeting sentiment analysis next."
  },
  {
    speaker: "John",
    timestamp: "10:31:28",
    text: "I agree. The AI-powered features like keyword extraction and action item detection will really set us apart from competitors."
  },
  {
    speaker: "Sarah",
    timestamp: "10:31:55",
    text: "The polling system integration is almost complete. We can test it during this meeting if you'd like."
  }
];

const keywords = ["deadline", "Friday", "AI", "prototype", "features", "real-time", "competitors"];

export function TranscriptView() {
  const [searchTerm, setSearchTerm] = useState("");

  const highlightKeywords = (text: string) => {
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="bg-yellow-200 px-1 rounded font-medium">$&</span>`);
    });
    return highlightedText;
  };

  const filteredTranscript = mockTranscript.filter(entry => 
    searchTerm === "" || 
    entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3>Live Transcript</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search transcript..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.map(keyword => (
            <span key={keyword} className="text-xs bg-yellow-100 px-2 py-1 rounded-full">
              {keyword}
            </span>
          ))}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredTranscript.map((entry, index) => (
            <div key={index} className="border-l-2 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary">{entry.speaker}</span>
                <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
              </div>
              <p 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightKeywords(entry.text) }}
              />
            </div>
          ))}
          
          {/* Live indicator */}
          <div className="border-l-2 border-green-400 pl-4 opacity-75">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary">Sarah</span>
              <span className="text-xs text-muted-foreground">10:32:18</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Speaking... <span className="animate-pulse">|</span>
            </p>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}