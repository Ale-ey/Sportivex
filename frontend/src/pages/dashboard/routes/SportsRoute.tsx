import React from "react";
import SportsTab, { type SportItem } from "../tabs/SportsTab";
import { Waves, Dumbbell, Activity, Target, Trophy } from "lucide-react";

const SportsRoute: React.FC = () => {
  const sports: SportItem[] = [
    {
      name: "Swimming",
      icon: Waves,
      color: "bg-[#00B4D8]",
      image: "/swiming.jpg",
      progress: 85,
      sessions: 12,
      lastSession: "2 hours ago",
    },
    {
      name: "Gym Training",
      icon: Dumbbell,
      color: "bg-[#0077B6]",
      image: "/gym.jpg",
      progress: 92,
      sessions: 8,
      lastSession: "1 day ago",
    },
    {
      name: "Horse Riding",
      icon: Activity,
      color: "bg-[#023E8A]",
      progress: 68,
      sessions: 4,
      lastSession: "3 days ago",
    },
    {
      name: "Badminton",
      icon: Activity,
      color: "bg-[#0096C7]",
      image: "/badminton.jpg",
      progress: 78,
      sessions: 6,
      lastSession: "1 day ago",
    },
    {
      name: "Tennis",
      icon: Trophy,
      color: "bg-[#0077B6]",
      progress: 45,
      sessions: 3,
      lastSession: "1 week ago",
    },
    {
      name: "Basketball",
      icon: Target,
      color: "bg-[#023E8A]",
      progress: 73,
      sessions: 5,
      lastSession: "2 days ago",
    },
  ];
  return <SportsTab sports={sports} />;
};

export default SportsRoute;
