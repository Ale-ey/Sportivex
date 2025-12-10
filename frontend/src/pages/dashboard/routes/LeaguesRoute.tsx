import React, { useEffect, useState } from "react";
import LeaguesTab, { type LeagueItem } from "../tabs/LeaguesTab";
import { useLeague } from "@/hooks/useLeague";
import { Loader2 } from "lucide-react";

const LeaguesRoute: React.FC = () => {
  const { leagues, loading, fetchLeagues } = useLeague();
  const [leagueItems, setLeagueItems] = useState<LeagueItem[]>([]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  useEffect(() => {
    // Transform API leagues to LeagueItem format
    const transformed = leagues.map((league) => {
      const startDate = new Date(league.start_date);
      const today = new Date();
      const registrationDeadline = new Date(league.registration_deadline);
      
      let status: "Registered" | "Training" | "Upcoming" | "Registration Open" = "Upcoming";
      
      if (league.status === 'in_progress') {
        status = "Training";
      } else if (league.status === 'completed') {
        status = "Training"; // Show as training for completed leagues
      } else if (league.registration_enabled && today <= registrationDeadline) {
        status = "Registration Open";
      } else if (league.status === 'registration_open') {
        status = "Registration Open";
      }

      return {
        id: league.id,
        name: league.name,
        date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        participants: 0, // Will be updated if we have registration count
        status,
        prize: league.prize || "TBD",
        myRank: null,
        league: league, // Store full league object for registration
      };
    });
    
    setLeagueItems(transformed);
  }, [leagues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  return <LeaguesTab leagues={leagueItems} />;
};

export default LeaguesRoute;
