import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize, Minimize } from "lucide-react";
import { useState } from "react";

interface VideoCallPanelProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function VideoCallPanel({ isFullscreen = false, onToggleFullscreen }: VideoCallPanelProps) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  return (
    <Card className="h-full flex flex-col">
      <div className="flex-1 bg-gray-900 rounded-lg relative overflow-hidden">
        {/* Jitsi Meet iframe placeholder */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8" />
            </div>
            <p className="text-lg">Meeting Room Active</p>
            <p className="text-sm opacity-75">3 participants connected</p>
          </div>
        </div>
        
        {/* Mock participant thumbnails */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <div className="w-20 h-14 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs">
            You
          </div>
          <div className="w-20 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
            John
          </div>
          <div className="w-20 h-14 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs">
            Sarah
          </div>
        </div>

        {/* Fullscreen Toggle Button */}
        {onToggleFullscreen && (
          <div className="absolute top-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={onToggleFullscreen}
              className="bg-black/20 hover:bg-black/30 text-white border-none"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center gap-2 p-4 bg-gray-50">
        <Button
          variant={videoEnabled ? "default" : "destructive"}
          size="sm"
          onClick={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        <Button
          variant={audioEnabled ? "default" : "destructive"}
          size="sm"
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button variant="destructive" size="sm">
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}