import React from "react";
import LeagueCard from "../../../components/LeagueCard";

import { type League } from "@/services/leagueService";

export interface LeagueItem {
  id?: string;
  name: string;
  date: string;
  participants: number;
  status: "Registered" | "Training" | "Upcoming" | "Registration Open" | "Ongoing" | "Finished" | "In Progress";
  prize: string;
  myRank: number | null;
  league?: League; // Full league object for registration
}

interface LeaguesTabProps {
  leagues: LeagueItem[];
}

const LeaguesTab: React.FC<LeaguesTabProps> = ({ leagues }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#023E8A]">
          Competitions & Leagues
        </h2>
      </div>

      {leagues.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No leagues available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leagues.map((league) => (
            <LeagueCard
              key={league.id || league.name}
              id={league.id}
              name={league.name}
              date={league.date}
              participants={league.participants}
              status={league.status}
              prize={league.prize}
              myRank={league.myRank}
              league={league.league}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaguesTab;
