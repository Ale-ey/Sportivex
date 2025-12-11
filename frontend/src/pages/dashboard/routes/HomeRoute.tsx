import React, { useEffect, useState } from "react";
import HomeTab, {
  type ActivityItem,
  type EventItem,
  type StatItem,
} from "../tabs/HomeTab";
import { Dumbbell, Heart, Clock, Award } from "lucide-react";
import { useGym } from "@/hooks/useGym";
import { useLeague } from "@/hooks/useLeague";

const HomeRoute: React.FC = () => {
  const { stats, workoutHistory, fetchStats, fetchWorkoutHistory } = useGym();
  const { leagues, fetchLeagues, loading: leaguesLoading, error: leaguesError } = useLeague();
  const [homeStats, setHomeStats] = useState<StatItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetchStats();
    fetchWorkoutHistory(5); // Get last 5 workouts
    fetchLeagues().catch((err) => {
      console.error('Error fetching leagues:', err);
    });
  }, [fetchStats, fetchWorkoutHistory, fetchLeagues]);

  useEffect(() => {
    if (stats) {
      setHomeStats([
        {
          title: "Workouts This Week",
          value: stats.weekWorkouts?.toString() || "0",
          icon: Dumbbell,
          color: "bg-[#00B4D8]",
          change: "+0",
        },
        {
          title: "Calories Burned",
          value: stats.weekCalories?.toLocaleString() || "0",
          icon: Heart,
          color: "bg-[#0096C7]",
          change: stats.todayCalories > 0 ? `+${stats.todayCalories}` : "+0",
        },
        {
          title: "Today's Calories",
          value: stats.todayCalories?.toString() || "0",
          icon: Clock,
          color: "bg-[#0077B6]",
          change: stats.todayCalories > 0 ? "Today" : "0",
        },
        {
          title: "Total Workouts",
          value: stats.totalWorkouts?.toString() || "0",
          icon: Award,
          color: "bg-[#48CAE4]",
          change: "+0",
        },
      ]);
    }
  }, [stats]);

  useEffect(() => {
    if (workoutHistory && workoutHistory.length > 0) {
      const activities: ActivityItem[] = workoutHistory.slice(0, 3).map((workout) => {
        const workoutDate = new Date(workout.workout_date || workout.start_time);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - workoutDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let timeString = "";
        if (diffDays === 0) {
          timeString = `Today, ${workoutDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
          timeString = `Yesterday, ${workoutDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          timeString = workoutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }

        const durationMinutes = workout.total_duration_minutes || 0;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const durationString = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

        return {
          activity: "Gym Workout",
          time: timeString,
          duration: durationString,
          calories: workout.total_calories || 0,
          status: "completed",
        };
      });
      setRecentActivities(activities);
    } else {
      // Show empty state or placeholder
      setRecentActivities([]);
    }
  }, [workoutHistory]);

  useEffect(() => {
    if (leaguesLoading) {
      return;
    }
    
    if (leaguesError) {
      setUpcomingEvents([]);
      return;
    }
    
    if (leagues && leagues.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Only show leagues that are upcoming, registration_open, or in_progress (not completed or cancelled)
      const filteredLeagues = leagues.filter((league) => {
        // Exclude cancelled and completed leagues
        if (league.status === 'cancelled' || league.status === 'completed') {
          return false;
        }
        
        // Must have a start_date
        if (!league.start_date) {
          return false;
        }
        
        // Only show if start_date is today or in the future
        const startDate = new Date(league.start_date);
        startDate.setHours(0, 0, 0, 0);
        return startDate >= today;
      });
      
      const events: EventItem[] = filteredLeagues
        .sort((a, b) => {
          const dateA = new Date(a.start_date);
          const dateB = new Date(b.start_date);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 4)
        .map((league) => {
          // Format date nicely
          const startDate = new Date(league.start_date);
          const dateString = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          });
          
          // Add time if available
          const timeString = startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          // Map backend status directly to display status
          let eventStatus: string;
          switch (league.status) {
            case 'registration_open':
              eventStatus = "registration open";
              break;
            case 'in_progress':
              // Use backend status directly - show "in progress"
              eventStatus = "in progress";
              break;
            case 'upcoming':
              eventStatus = "upcoming";
              break;
            case 'completed':
              eventStatus = "completed";
              break;
            case 'cancelled':
              eventStatus = "cancelled";
              break;
            default:
              // Use backend status as-is
              eventStatus = league.status.replace(/_/g, ' ');
              break;
          }

          return {
            event: league.name,
            date: `${dateString}, ${timeString}`,
            type: "Competition" as const,
            status: eventStatus,
          };
        });
      
      setUpcomingEvents(events);
    } else {
      setUpcomingEvents([]);
    }
  }, [leagues, leaguesLoading, leaguesError]);

  return (
    <HomeTab
      stats={homeStats}
      recentActivities={recentActivities}
      upcomingEvents={upcomingEvents}
    />
  );
};

export default HomeRoute;
