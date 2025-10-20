import React from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Users, Clock, Target } from "lucide-react";

export interface TrainingProgramItem {
  name: string;
  instructor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
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
        <h2 className="text-3xl font-bold text-white">Training Programs</h2>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          + Enroll in Program
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.map((program, index) => (
          <Card
            key={index}
            className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    {program.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Users className="w-4 h-4 mr-2" />
                    Instructor: {program.instructor}
                  </div>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration: {program.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Target className="w-4 h-4 mr-2" />
                    Level: {program.level}
                  </div>
                  {program.enrolled && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{program.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${program.progress}%`,
                            background:
                              "linear-gradient(90deg,#0077B6,#00B4D8)",
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      program.level === "Beginner"
                        ? "bg-green-900 text-green-300"
                        : program.level === "Intermediate"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {program.level}
                  </span>
                  <p className="text-lg font-bold text-white mt-2">
                    {program.enrolled ? "Enrolled" : "Available"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {program.enrolled ? "In Progress" : "Open for Enrollment"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {program.enrolled ? "Continue" : "Enroll Now"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrainingTab;
