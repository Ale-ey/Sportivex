import React from "react";
import HomeTab, {
  type ActivityItem,
  type EventItem,
  type StatItem,
} from "../tabs/HomeTab";
import { Dumbbell, Heart, Clock, Award } from "lucide-react";

const HomeRoute: React.FC = () => {
  const stats: StatItem[] = [
    {
      title: "Workouts This Week",
      value: "8",
      icon: Dumbbell,
      color: "bg-[#00B4D8]",
      change: "+2",
    },
    {
      title: "Calories Burned",
      value: "2,450",
      icon: Heart,
      color: "bg-[#0096C7]",
      change: "+15%",
    },
    {
      title: "Training Hours",
      value: "12.5",
      icon: Clock,
      color: "bg-[#0077B6]",
      change: "+3.2h",
    },
    {
      title: "Achievements",
      value: "5",
      icon: Award,
      color: "bg-[#48CAE4]",
      change: "+1",
    },
  ];

  const recentActivities: ActivityItem[] = [
    {
      activity: "Morning Swim",
      time: "Today, 7:00 AM",
      duration: "45 min",
      calories: 320,
      status: "completed",
    },
    {
      activity: "Gym Training",
      time: "Yesterday, 6:00 PM",
      duration: "1h 15min",
      calories: 450,
      status: "completed",
    },
    {
      activity: "Badminton Practice",
      time: "Yesterday, 4:00 PM",
      duration: "1h 30min",
      calories: 280,
      status: "completed",
    },
    {
      activity: "Horse Riding Lesson",
      time: "Monday, 10:00 AM",
      duration: "2h",
      calories: 180,
      status: "completed",
    },
  ];

  const upcomingEvents: EventItem[] = [
    {
      event: "Swimming Championship",
      date: "Saturday, 2:00 PM",
      type: "Competition",
      status: "registered",
    },
    {
      event: "Gym Training Session",
      date: "Tomorrow, 8:00 AM",
      type: "Training",
      status: "scheduled",
    },
    {
      event: "Horse Riding Lesson",
      date: "Monday, 10:00 AM",
      type: "Training",
      status: "scheduled",
    },
    {
      event: "Badminton Tournament",
      date: "Next Saturday, 3:00 PM",
      type: "Competition",
      status: "registered",
    },
  ];

  return (
    <HomeTab
      stats={stats}
      recentActivities={recentActivities}
      upcomingEvents={upcomingEvents}
    />
  );
};

export default HomeRoute;
