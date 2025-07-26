import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Calculator, Book, Brain, Palette, Eye, Volume2, HandMetal, Contrast, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SurveyModal({ isOpen, onClose }: SurveyModalProps) {
  const [age, setAge] = useState<number | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState<string>("");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitSurveyMutation = useMutation({
    mutationFn: async (surveyData: any) => {
      const response = await apiRequest("POST", "/api/user/survey", surveyData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Survey Completed! ✨",
        description: "Your magical dashboard has been personalized!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/current"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Survey Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!age || interests.length === 0 || !learningStyle) {
      toast({
        title: "Incomplete Survey",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitSurveyMutation.mutate({
      age,
      interests,
      learningStyle,
      accessibilityNeeds,
    });
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleAccessibilityNeed = (need: string) => {
    setAccessibilityNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-fredoka text-2xl text-magic-purple">
            Magical Learning Survey
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Age Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What's your age group?</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={age === 7 ? "default" : "outline"}
                onClick={() => setAge(7)}
                className="p-4 h-auto text-left flex-col items-start"
              >
                <div className="font-semibold">6-8 years</div>
                <div className="text-sm text-gray-500">Early learner</div>
              </Button>
              <Button
                type="button"
                variant={age === 10 ? "default" : "outline"}
                onClick={() => setAge(10)}
                className="p-4 h-auto text-left flex-col items-start"
              >
                <div className="font-semibold">9-12 years</div>
                <div className="text-sm text-gray-500">Advanced learner</div>
              </Button>
            </div>
          </div>
          
          {/* Interests Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What do you love learning about?</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "math", label: "Math & Numbers", icon: Calculator },
                { id: "reading", label: "Reading & Writing", icon: Book },
                { id: "logic", label: "Logic & Puzzles", icon: Brain },
                { id: "art", label: "Art & Creativity", icon: Palette },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={interests.includes(id) ? "default" : "outline"}
                  onClick={() => toggleInterest(id)}
                  className="p-4 h-auto text-left justify-start"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Learning Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How do you learn best?</label>
            <div className="space-y-3">
              {[
                { id: "visual", label: "Visual Learning", description: "I learn with pictures and colors", icon: Eye },
                { id: "audio", label: "Audio Learning", description: "I learn by listening", icon: Volume2 },
                { id: "hands-on", label: "Hands-On Learning", description: "I learn by doing and touching", icon: HandMetal },
              ].map(({ id, label, description, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={learningStyle === id ? "default" : "outline"}
                  onClick={() => setLearningStyle(id)}
                  className="w-full p-4 h-auto text-left justify-start"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-sm text-gray-500">{description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Accessibility Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Do you need any special help?</label>
            <div className="space-y-3">
              {[
                { id: "high-contrast", label: "High contrast colors", icon: Contrast },
                { id: "large-text", label: "Larger text size", icon: Type },
                { id: "audio-support", label: "Audio support", icon: Volume2 },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={accessibilityNeeds.includes(id) ? "default" : "outline"}
                  onClick={() => toggleAccessibilityNeed(id)}
                  className="w-full p-4 h-auto text-left justify-start"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={submitSurveyMutation.isPending}
            className="w-full bg-gradient-to-r from-magic-purple to-pink-magic text-white py-4 rounded-xl font-fredoka text-lg hover:scale-105 transform transition-all duration-200"
          >
            {submitSurveyMutation.isPending ? "Creating..." : "Create My Magical Dashboard! ✨"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
