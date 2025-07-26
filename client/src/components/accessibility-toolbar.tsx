import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Contrast, Type, Volume2, User } from "lucide-react";
import { useAccessibility } from "@/lib/accessibility";

interface AccessibilityToolbarProps {
  user?: { username: string } | null;
}

export default function AccessibilityToolbar({ user }: AccessibilityToolbarProps) {
  const { 
    highContrast, 
    largeText, 
    audioEnabled, 
    toggleHighContrast, 
    toggleLargeText, 
    toggleAudio 
  } = useAccessibility();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant={highContrast ? "default" : "secondary"}
            size="sm"
            onClick={toggleHighContrast}
            className="flex items-center space-x-2"
          >
            <Contrast className="h-4 w-4" />
            <span className="text-sm">High Contrast</span>
          </Button>
          <Button
            variant={largeText ? "default" : "secondary"}
            size="sm"
            onClick={toggleLargeText}
            className="flex items-center space-x-2"
          >
            <Type className="h-4 w-4" />
            <span className="text-sm">Text Size</span>
          </Button>
          <Button
            variant={audioEnabled ? "default" : "secondary"}
            size="sm"
            onClick={toggleAudio}
            className="flex items-center space-x-2"
          >
            <Volume2 className="h-4 w-4" />
            <span className="text-sm">Audio</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Welcome back, {user?.username || 'Player'}!</span>
          <div className="w-8 h-8 bg-magic-purple rounded-full flex items-center justify-center">
            <User className="text-white text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
