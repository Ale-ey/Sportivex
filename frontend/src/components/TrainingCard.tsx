import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, User, Activity } from "lucide-react";

export interface TrainingCardProps {
  name: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  progress?: number; // 0-100, only if enrolled
  enrolled: boolean;
  onClick?: () => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  name,
  instructor,
  duration,
  level,
  progress,
  enrolled,
  onClick,
}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Intermediate":
        return "bg-[#CAF0F8] text-[#0077B6] border-[#ADE8F4]";
      case "Advanced":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Expert":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Card className="bg-white border border-[#E2F5FB] hover:shadow-lg transition-all cursor-pointer group">
      <CardContent className="p-6" onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-bold text-[#023E8A] text-lg group-hover:text-[#0077B6] transition-colors">
                {name}
              </h3>
              <Badge className={`${getLevelColor(level)} border text-xs`}>
                {level}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <User className="w-4 h-4 mr-2 text-[#0096C7]" />
                <span>{instructor}</span>
              </div>

              <div className="flex items-center text-sm text-slate-600">
                <Clock className="w-4 h-4 mr-2 text-[#0096C7]" />
                <span>{duration}</span>
              </div>

              {enrolled && progress !== undefined && (
                <div className="flex items-center text-sm text-slate-600">
                  <Activity className="w-4 h-4 mr-2 text-[#0096C7]" />
                  <span>{progress}% completed</span>
                </div>
              )}
            </div>
          </div>

          {enrolled && (
            <div className="ml-4 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#EAF7FD] to-[#CAF0F8] border-2 border-[#ADE8F4]">
              <span className="text-2xl font-bold text-[#0077B6]">
                {progress}%
              </span>
            </div>
          )}
        </div>

        {enrolled && progress !== undefined && (
          <div className="mb-4">
            <div className="h-2 w-full bg-[#E2F5FB] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00B4D8] to-[#0096C7] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4 pt-4 border-t border-[#E2F5FB]">
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-[#00B4D8] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B4D8] text-white"
          >
            {enrolled ? "Continue Training" : "Enroll Now"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
          >
            Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingCard;
