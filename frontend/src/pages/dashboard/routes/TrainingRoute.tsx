import React from "react";
import TrainingTab, { type TrainingProgramItem } from "../tabs/TrainingTab";

const TrainingRoute: React.FC = () => {
  const programs: TrainingProgramItem[] = [
    {
      name: "Advanced Swimming Technique",
      instructor: "Sarah Johnson",
      duration: "8 weeks",
      level: "Advanced",
      progress: 75,
      enrolled: true,
    },
    {
      name: "Strength & Conditioning",
      instructor: "Mike Chen",
      duration: "12 weeks",
      level: "Intermediate",
      progress: 60,
      enrolled: true,
    },
    {
      name: "Horse Riding Mastery",
      instructor: "Emma Wilson",
      duration: "6 weeks",
      level: "Beginner",
      progress: 0,
      enrolled: false,
    },
    {
      name: "Tennis Fundamentals",
      instructor: "David Lee",
      duration: "10 weeks",
      level: "Intermediate",
      progress: 0,
      enrolled: false,
    },
  ];
  return <TrainingTab programs={programs} />;
};

export default TrainingRoute;
