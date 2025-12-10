import { useMemo, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Activity, Trophy, MessageCircle, Home, Target, Shield } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";
import { useGetProfile } from "../hooks/useAuth";

const Dashboard: React.FC = () => {
  const { getProfile, user } = useGetProfile();
  
  // Fetch profile on mount to ensure role is available
  useEffect(() => {
    getProfile();
  }, [getProfile]);
  
  const items = useMemo(
    () => {
      const baseItems = [
        { to: "/dashboard/home", label: "Home", icon: Home },
        { to: "/dashboard/sports", label: "Sports", icon: Activity },
        { to: "/dashboard/leagues", label: "Leagues", icon: Trophy },
        // { to: "/dashboard/training", label: "Training", icon: Target },
        { to: "/dashboard/ai-chat", label: "AI Chat", icon: MessageCircle },
      ];
      
      // Add Admin link if user role is admin
      const userRole = user?.role?.toLowerCase()?.trim();
      console.log('Dashboard - User role check:', { userRole, fullUser: user });
      if (userRole === 'admin') {
        baseItems.push({ to: "/dashboard/admin", label: "Admin", icon: Shield });
        console.log('Dashboard - Admin link added to navigation');
      } else {
        console.log('Dashboard - Admin link NOT added. User role:', userRole);
      }
      
      return baseItems;
    },
    [user?.role]
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
