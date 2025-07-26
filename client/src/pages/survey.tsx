import { useLocation } from "wouter";
import SurveyModal from "@/components/survey-modal";

export default function Survey() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <SurveyModal 
        isOpen={true} 
        onClose={() => setLocation("/")} 
      />
    </div>
  );
}
