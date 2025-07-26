import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Calculator, Book, Brain, Palette, Eye, Volume2, HandMetal, Contrast, Type, Code, Beaker } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SurveyModal({ isOpen, onClose }: SurveyModalProps) {
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<number | null>(null);
  const [studentClass, setStudentClass] = useState<string>("");
  const [specialNeed, setSpecialNeed] = useState<string>("");
  const [learningStyle, setLearningStyle] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [currentMood, setCurrentMood] = useState<string>("");
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
    
    if (!name || !age || !studentClass || !specialNeed || !learningStyle || subjects.length === 0 || !currentMood) {
      toast({
        title: "Incomplete Survey",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitSurveyMutation.mutate({
      name,
      age,
      class: studentClass,
      specialNeed,
      learningStyle,
      subjects,
      currentMood,
      accessibilityNeeds,
    });
  };

  const toggleSubject = (subject: string) => {
    setSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
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
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What's your name?</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          {/* Age Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What's your age?</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={age === 7 ? "default" : "outline"}
                onClick={() => setAge(7)}
                className="p-4 h-auto text-center"
              >
                6-8 years
              </Button>
              <Button
                type="button"
                variant={age === 10 ? "default" : "outline"}
                onClick={() => setAge(10)}
                className="p-4 h-auto text-center"
              >
                9-12 years
              </Button>
              <Button
                type="button"
                variant={age === 15 ? "default" : "outline"}
                onClick={() => setAge(15)}
                className="p-4 h-auto text-center"
              >
                13-18 years
              </Button>
            </div>
          </div>

          {/* Class Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What class/grade are you in?</label>
            <Input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="e.g., 5th Grade, Class 8, etc."
              className="w-full"
            />
          </div>

          {/* Special Need Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Do you have any special learning needs?</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "autism", label: "Autism" },
                { id: "adhd", label: "ADHD" },
                { id: "dyslexia", label: "Dyslexia" },
                { id: "physical", label: "Physical Disability" },
                { id: "other", label: "Other" },
                { id: "none", label: "None" },
              ].map(({ id, label }) => (
                <Button
                  key={id}
                  type="button"
                  variant={specialNeed === id ? "default" : "outline"}
                  onClick={() => setSpecialNeed(id)}
                  className="p-3 h-auto text-center"
                >
                  {label}
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
                { id: "auditory", label: "Auditory Learning", description: "I learn by listening", icon: Volume2 },
                { id: "kinesthetic", label: "Kinesthetic Learning", description: "I learn by doing and touching", icon: HandMetal },
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

          {/* Subjects Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Which subjects interest you? (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "english", label: "English", icon: Book },
                { id: "math", label: "Math", icon: Calculator },
                { id: "science", label: "Science", icon: Beaker },
                { id: "coding", label: "Coding", icon: Code },
                { id: "art", label: "Art", icon: Palette },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={subjects.includes(id) ? "default" : "outline"}
                  onClick={() => toggleSubject(id)}
                  className="p-4 h-auto text-left justify-start"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Current Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling today?</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "happy", emoji: "😊", label: "Happy" },
                { id: "excited", emoji: "🤩", label: "Excited" },
                { id: "calm", emoji: "😌", label: "Calm" },
                { id: "curious", emoji: "🤔", label: "Curious" },
                { id: "tired", emoji: "😴", label: "Tired" },
                { id: "neutral", emoji: "😐", label: "Neutral" },
              ].map(({ id, emoji, label }) => (
                <Button
                  key={id}
                  type="button"
                  variant={currentMood === id ? "default" : "outline"}
                  onClick={() => setCurrentMood(id)}
                  className="p-3 h-auto text-center flex flex-col items-center"
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Accessibility Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Do you need any accessibility features?</label>
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
