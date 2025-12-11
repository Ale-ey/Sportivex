import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Activity, Target, Trophy, Play } from "lucide-react";

export interface StatItem {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  change: string;
}

export interface ActivityItem {
  activity: string;
  time: string;
  duration: string;
  calories: number;
  status: string;
}

export interface EventItem {
  event: string;
  date: string;
  type: "Competition" | "Training";
  status: string;
}

interface HomeTabProps {
  stats: StatItem[];
  recentActivities: ActivityItem[];
  upcomingEvents: EventItem[];
}

const HomeTab: React.FC<HomeTabProps> = ({
  stats,
  recentActivities,
  upcomingEvents,
}) => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartWorkout = () => {
    navigate("/dashboard/gym?tab=workout");
  };

  // Format date and time
  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#EAF7FD] to-[#CAF0F8] rounded-xl p-8 text-[#023E8A] border border-[#ADE8F4]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">
              Track Your Athletic Journey
            </h2>
            <p className="text-slate-600 text-lg">
              Monitor your progress and achieve your fitness goals
            </p>
            <div className="mt-6 flex space-x-4">
              <Button 
                onClick={handleStartWorkout}
                className="bg-gradient-to-r from-[#00B4D8] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B4D8] text-white px-6 py-3 rounded-lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm">Current Date & Time</p>
            <p className="text-2xl font-bold text-[#023E8A]">
              {formatDateTime(currentDateTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white border border-[#E2F5FB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-[#EAF7FD] ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-[#023E8A]" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-[#023E8A]">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.change.startsWith("+")
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-[#E2F5FB]">
          <CardHeader>
            <CardTitle className="text-[#023E8A]">Recent Activities</CardTitle>
            <CardDescription className="text-slate-600">
              Your latest training sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>No recent activities. Start a workout to see your progress!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.slice(0, 3).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#EAF7FD] rounded-lg border border-[#ADE8F4]"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#00B4D8] rounded-lg flex items-center justify-center mr-3">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-[#023E8A]">
                          {activity.activity}
                        </p>
                        <p className="text-sm text-slate-600">
                          {activity.time} • {activity.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-emerald-600 font-medium">
                        {activity.calories} cal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#E2F5FB]">
          <CardHeader>
            <CardTitle className="text-[#023E8A]">Upcoming Events</CardTitle>
            <CardDescription className="text-slate-600">
              Your scheduled competitions and training
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Trophy className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>No upcoming events. Check back later for new competitions!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.slice(0, 4).map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#EAF7FD] rounded-lg border border-[#ADE8F4]"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 ${
                          event.type === "Competition"
                            ? "bg-[#0096C7]"
                            : "bg-[#48CAE4]"
                        } rounded-lg flex items-center justify-center mr-3`}
                      >
                        {event.type === "Competition" ? (
                          <Trophy className="w-5 h-5 text-white" />
                        ) : (
                          <Target className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#023E8A]">
                          {event.event}
                        </p>
                        <p className="text-sm text-slate-600">{event.date}</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        event.status === "registered"
                          ? "text-[#0077B6]"
                          : "text-emerald-600"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeTab;
