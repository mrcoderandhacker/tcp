import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Upload, 
  File, 
  FileImage, 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  User,
  Clock
} from "lucide-react";
import { useState } from "react";

interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  thumbnail?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

const mockFiles: SharedFile[] = [
  {
    id: "1",
    name: "UI_Mockups_v2.fig",
    type: "figma",
    size: 2456789,
    uploadedBy: "Sarah",
    uploadedAt: "10:25 AM",
    thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzFBMUEyRSIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMTJaIiBmaWxsPSIjRkY3MzYyIi8+CjxwYXRoIGQ9Ik0xNiAxNkgyNFYyNEgxNlYxNloiIGZpbGw9IiNBMjU5RkYiLz4KPC9zdmc+"
  },
  {
    id: "2", 
    name: "Meeting_Agenda_Jan6.pdf",
    type: "pdf",
    size: 345678,
    uploadedBy: "John",
    uploadedAt: "10:15 AM"
  },
  {
    id: "3",
    name: "Competitor_Analysis.xlsx",
    type: "excel", 
    size: 1234567,
    uploadedBy: "You",
    uploadedAt: "9:45 AM"
  },
  {
    id: "4",
    name: "Team_Photo.jpg",
    type: "image",
    size: 987654,
    uploadedBy: "Sarah",
    uploadedAt: "9:30 AM",
    thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzMzQkFGNyIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjE1IiByPSI1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTAgMzBDMTAgMjUuNTgxNyAxMy41ODE3IDIyIDE4IDIySDIyQzI2LjQxODMgMjIgMzAgMjUuNTgxNyAzMCAzMFYzMEgxMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=="
  }
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'image':
    case 'jpg':
    case 'png':
    case 'gif':
      return <FileImage className="w-8 h-8 text-blue-600" />;
    case 'pdf':
      return <FileText className="w-8 h-8 text-red-600" />;
    case 'excel':
    case 'xlsx':
      return <File className="w-8 h-8 text-green-600" />;
    case 'figma':
      return <File className="w-8 h-8 text-purple-600" />;
    default:
      return <File className="w-8 h-8 text-gray-600" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileSharing() {
  const [files, setFiles] = useState<SharedFile[]>(mockFiles);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => {
      const newFile: SharedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.includes('image') ? 'image' : file.name.split('.').pop() || 'file',
        size: file.size,
        uploadedBy: "You",
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUploading: true,
        uploadProgress: 0
      };
      
      setFiles(prev => [newFile, ...prev]);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === newFile.id && f.uploadProgress !== undefined && f.uploadProgress < 100) {
            return { ...f, uploadProgress: f.uploadProgress + 10 };
          }
          if (f.id === newFile.id && f.uploadProgress === 100) {
            return { ...f, isUploading: false, uploadProgress: undefined };
          }
          return f;
        }));
      }, 200);
      
      setTimeout(() => clearInterval(interval), 2000);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const event = {
        preventDefault: () => {},
        dataTransfer: { files: e.target.files }
      } as React.DragEvent;
      handleDrop(event);
    }
  };

  const previewFile = (file: SharedFile) => {
    setSelectedFile(file);
  };

  const deleteFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3>File Sharing</h3>
        <p className="text-sm text-muted-foreground">
          {files.length} files shared • {files.reduce((sum, f) => sum + f.size, 0) > 0 && formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
        </p>
      </div>
      
      {/* Upload Area */}
      <div 
        className={`m-4 p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag & drop files here or 
          <label className="text-primary cursor-pointer hover:underline ml-1">
            browse
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileInput}
            />
          </label>
        </p>
        <p className="text-xs text-muted-foreground">
          Images, PDFs, documents up to 10MB
        </p>
      </div>
      
      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {files.map((file) => (
            <div key={file.id} className="border rounded-lg p-3 bg-secondary/30">
              <div className="flex items-center gap-3">
                {file.thumbnail ? (
                  <img 
                    src={file.thumbnail} 
                    alt="" 
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm truncate">{file.name}</h5>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {file.uploadedBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {file.uploadedAt}
                    </div>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  
                  {file.isUploading && file.uploadProgress !== undefined && (
                    <div className="mt-2">
                      <Progress value={file.uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploading... {file.uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                
                {!file.isUploading && (
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => previewFile(file)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h4 className="truncate">{selectedFile.name}</h4>
              <Button variant="ghost" onClick={() => setSelectedFile(null)}>
                ×
              </Button>
            </div>
            
            <div className="flex-1 p-4 flex items-center justify-center bg-secondary/30">
              {selectedFile.type === 'image' ? (
                <div className="text-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <FileImage className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Image Preview</p>
                </div>
              ) : (
                <div className="text-center">
                  {getFileIcon(selectedFile.type)}
                  <p className="text-sm text-muted-foreground mt-4">
                    Preview not available for this file type
                  </p>
                  <Button className="mt-4" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download to view
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}