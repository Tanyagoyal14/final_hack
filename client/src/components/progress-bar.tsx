interface ProgressBarProps {
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "pink";
}

export default function ProgressBar({ label, value, color }: ProgressBarProps) {
  const getGradientClass = (color: string) => {
    const gradients = {
      blue: "from-blue-400 to-blue-600",
      green: "from-green-400 to-green-600",
      purple: "from-purple-400 to-purple-600",
      pink: "from-pink-400 to-pink-600",
    };
    return gradients[color as keyof typeof gradients];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`bg-gradient-to-r ${getGradientClass(color)} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}
