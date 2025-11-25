import React from "react";
import LeaguesTab, { type LeagueItem } from "../tabs/LeaguesTab";

const LeaguesRoute: React.FC = () => {
  const leagues: LeagueItem[] = [
    {
      name: "Summer Swimming Championship",
      date: "Aug 15, 2024",
      participants: 45,
      status: "Registered",
      prize: "$5,000",
      myRank: 12,
    },
    {
      name: "Gym Strength Competition",
      date: "Aug 20, 2024",
      participants: 32,
      status: "Training",
      prize: "$3,000",
      myRank: 8,
    },
    {
      name: "Horse Riding Show",
      date: "Aug 25, 2024",
      participants: 18,
      status: "Upcoming",
      prize: "$2,500",
      myRank: null,
    },
    {
      name: "Badminton Tournament",
      date: "Sep 1, 2024",
      participants: 28,
      status: "Registration Open",
      prize: "$1,500",
      myRank: null,
    },
  ];
  return <LeaguesTab leagues={leagues} />;
};

export default LeaguesRoute;
