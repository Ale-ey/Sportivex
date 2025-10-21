import React from "react";
import { Button } from "../../../components/ui/button";
import TrainingCard from "../../../components/TrainingCard";
import { Plus } from "lucide-react";

export interface TrainingProgramItem {
  name: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  progress: number;
  enrolled: boolean;
}

interface TrainingTabProps {
  programs: TrainingProgramItem[];
}

const TrainingTab: React.FC<TrainingTabProps> = ({ programs }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#023E8A]">Training Programs</h2>
        <Button className="bg-gradient-to-r from-[#00B4D8] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B4D8] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Enroll in Program
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.map((program, index) => (
          <TrainingCard
            key={index}
            name={program.name}
            instructor={program.instructor}
            duration={program.duration}
            level={program.level}
            progress={program.enrolled ? program.progress : undefined}
            enrolled={program.enrolled}
            onClick={() => console.log(`Training clicked: ${program.name}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default TrainingTab;
