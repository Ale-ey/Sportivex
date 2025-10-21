import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Users, Trophy } from "lucide-react";

export interface LeagueCardProps {
  name: string;
  date: string;
  participants: number;
  status: "Registered" | "Training" | "Upcoming" | "Registration Open";
  prize: string;
  myRank?: number | null;
  onClick?: () => void;
}

const LeagueCard: React.FC<LeagueCardProps> = ({
  name,
  date,
  participants,
  status,
  prize,
  myRank,
  onClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Registered":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Training":
        return "bg-[#CAF0F8] text-[#0077B6] border-[#ADE8F4]";
      case "Upcoming":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Registration Open":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Card className="bg-white border border-[#E2F5FB] hover:shadow-lg transition-all cursor-pointer group">
      <CardContent className="p-6" onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-[#023E8A] text-lg mb-3 group-hover:text-[#0077B6] transition-colors">
              {name}
            </h3>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="w-4 h-4 mr-2 text-[#0096C7]" />
                <span>{date}</span>
              </div>

              <div className="flex items-center text-sm text-slate-600">
                <Users className="w-4 h-4 mr-2 text-[#0096C7]" />
                <span>{participants} participants</span>
              </div>

              {myRank && (
                <div className="flex items-center text-sm text-[#0077B6] font-medium">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span>Your Rank: #{myRank}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right ml-4">
            <Badge className={`mb-3 ${getStatusColor(status)} border`}>
              {status}
            </Badge>
            <p className="text-2xl font-bold text-[#023E8A]">{prize}</p>
            <p className="text-xs text-slate-500">Prize Pool</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-[#E2F5FB]">
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-[#00B4D8] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B4D8] text-white"
          >
            {status === "Registration Open" ? "Register" : "View Details"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
          >
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeagueCard;
