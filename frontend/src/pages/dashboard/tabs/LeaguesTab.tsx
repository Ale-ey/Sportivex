import React from "react";
import { Button } from "../../../components/ui/button";
import LeagueCard from "../../../components/LeagueCard";
import { Plus } from "lucide-react";

export interface LeagueItem {
  name: string;
  date: string;
  participants: number;
  status: "Registered" | "Training" | "Upcoming" | "Registration Open";
  prize: string;
  myRank: number | null;
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leagues.map((league, index) => (
          <LeagueCard
            key={index}
            name={league.name}
            date={league.date}
            participants={league.participants}
            status={league.status}
            prize={league.prize}
            myRank={league.myRank}
            onClick={() => console.log(`League clicked: ${league.name}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default LeaguesTab;
