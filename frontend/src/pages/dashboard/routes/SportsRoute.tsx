import React from "react";
import SportsTab, { type SportItem } from "../tabs/SportsTab";
import { webp } from "@/assets/WEBP/webp";
const SportsRoute: React.FC = () => {
  const sports: SportItem[] = [
    {
      name: "Swimming",
      image: webp.swiming,
    },
    {
      name: "Gym Training",
      image: webp.gmy2,
    },
    {
      name: "Horse Riding",
      image: webp.horseRiding,
    },
    {
      name: "Badminton",
      image: webp.badminton,
    },
    // {
    //   name: "Paddle",
    //   image: webp.paddle,
    // },
    // {
    //   name: "Basketball",
    //   image: webp.basketball,
    // },
    // {
    //   name: "Bowling",
    //   image: webp.bowling,
    // },
  ];
  return <SportsTab sports={sports} />;
};

export default SportsRoute;
