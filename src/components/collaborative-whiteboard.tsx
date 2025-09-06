import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Pencil, Eraser, Square, Circle, Type, Download, Users } from "lucide-react";
import { useState } from "react";

const mockCollaborators = [
  { name: "You", color: "#3b82f6", active: true },
  { name: "John", color: "#10b981", active: true },
  { name: "Sarah", color: "#f59e0b", active: false }
];

export function CollaborativeWhiteboard() {
  const [selectedTool, setSelectedTool] = useState("pencil");
  
  const tools = [
    { id: "pencil", icon: Pencil, label: "Draw" },
    { id: "eraser", icon: Eraser, label: "Erase" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "text", icon: Type, label: "Text" }
  ];

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3>Collaborative Whiteboard</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">2 online</span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Tools */}
        <div className="flex items-center gap-2 mb-3">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTool(tool.id)}
                className="flex items-center gap-1"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">{tool.label}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Collaborators */}
        <div className="flex items-center gap-2">
          {mockCollaborators.map((collaborator, index) => (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: collaborator.color }}
              />
              <Badge variant={collaborator.active ? "default" : "secondary"} className="text-xs px-2 py-0.5">
                {collaborator.name}
                {collaborator.active && <span className="ml-1">●</span>}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 relative bg-white rounded-b-lg overflow-hidden">
        {/* Mock whiteboard with some drawn elements */}
        <div className="absolute inset-4 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            {/* Mock drawing elements */}
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-32 h-20 border-2 border-blue-500 rounded-lg flex items-center justify-center text-blue-600 text-sm">
                  User Interface
                </div>
              </div>
              
              <div className="flex justify-center gap-8">
                <div className="w-24 h-16 border-2 border-green-500 rounded-lg flex items-center justify-center text-green-600 text-xs">
                  Video Call
                </div>
                <div className="w-24 h-16 border-2 border-amber-500 rounded-lg flex items-center justify-center text-amber-600 text-xs">
                  AI Features
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-40 h-12 border-2 border-purple-500 rounded-lg flex items-center justify-center text-purple-600 text-xs">
                  Collaborative Tools
                </div>
              </div>
            </div>
            
            {/* Active cursors */}
            <div className="relative">
              <div 
                className="absolute top-0 left-20 w-4 h-4 transform rotate-12"
                style={{ color: "#10b981" }}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
                  <path d="M3 3v10l3-3h7l-7-7z"/>
                </svg>
                <span className="absolute top-4 left-0 text-xs bg-green-500 text-white px-1 py-0.5 rounded whitespace-nowrap">
                  John
                </span>
              </div>
            </div>
            
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Real-time collaborative drawing</p>
              <p className="text-xs">Select a tool and start drawing</p>
            </div>
          </div>
        </div>
        
        {/* Drawing area overlay for interaction */}
        <div 
          className="absolute inset-0 cursor-crosshair"
          style={{ 
            cursor: selectedTool === 'pencil' ? 'crosshair' : 
                   selectedTool === 'eraser' ? 'not-allowed' : 
                   selectedTool === 'text' ? 'text' : 'crosshair' 
          }}
        />
      </div>
    </Card>
  );
}