import React from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Calendar, Users, Trophy } from "lucide-react";

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
        <h2 className="text-3xl font-bold text-white">
          Competitions & Leagues
        </h2>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + Join Competition
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leagues.map((league, index) => (
          <Card
            key={index}
            className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    {league.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {league.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    {league.participants} participants
                  </div>
                  {league.myRank && (
                    <div className="flex items-center text-sm text-blue-400 mt-2">
                      <Trophy className="w-4 h-4 mr-2" />
                      Your Rank: #{league.myRank}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      league.status === "Registered"
                        ? "bg-green-900 text-green-300"
                        : league.status === "Training"
                        ? "bg-blue-900 text-blue-300"
                        : league.status === "Upcoming"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {league.status}
                  </span>
                  <p className="text-lg font-bold text-white mt-2">
                    {league.prize}
                  </p>
                  <p className="text-sm text-gray-400">Prize Pool</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {league.status === "Registration Open"
                    ? "Register"
                    : "View Details"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeaguesTab;
