import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Search, Filter } from "lucide-react";
import SportCard from "../../../components/SportCard";

export interface SportItem {
  name: string;
  image?: string;
}

interface SportsTabProps {
  sports: SportItem[];
}

const SportsTab: React.FC<SportsTabProps> = ({ sports }) => {
  const navigate = useNavigate();

  const handleSportClick = (sportName: string) => {
    const sport = sportName.toLowerCase();
    if (sport === "swimming") {
      navigate("/dashboard/swimming");
    } else if (sport === "badminton") {
      navigate("/dashboard/badminton");
    } else if (sport.includes("gym") || sport === "gym training" || sport === "gym & fitness") {
      navigate("/dashboard/gym");
    }
    // Add other sport navigation here as needed
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#023E8A]">Sports Activities</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {sports.map((sport, index) => (
          <SportCard
            key={index}
            title={sport.name}
            image={sport.image}
            onClick={() => handleSportClick(sport.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default SportsTab;
