import React from "react";
import { Button } from "../../../components/ui/button";
import LeagueCard from "../../../components/LeagueCard";
import { Plus } from "lucide-react";

import { type League } from "@/services/leagueService";

export interface LeagueItem {
  id?: string;
  name: string;
  date: string;
  participants: number;
  status: "Registered" | "Training" | "Upcoming" | "Registration Open";
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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#023E8A]">
          Competitions & Leagues
        </h2>
        <Button className="bg-gradient-to-r from-[#00B4D8] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B4D8] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Join Competition
        </Button>
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
