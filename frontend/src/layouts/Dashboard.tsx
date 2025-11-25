import { useMemo } from "react";
import { Outlet } from "react-router-dom";
import { Activity, Trophy, MessageCircle, Home, Target } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";

const Dashboard: React.FC = () => {
  const items = useMemo(
    () => [
      { to: "/dashboard/home", label: "Home", icon: Home },
      { to: "/dashboard/sports", label: "Sports", icon: Activity },
      { to: "/dashboard/leagues", label: "Leagues", icon: Trophy },
      { to: "/dashboard/training", label: "Training", icon: Target },
      { to: "/dashboard/ai-chat", label: "AI Chat", icon: MessageCircle },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#F8FDFF]">
      <DashboardHeader items={items} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
