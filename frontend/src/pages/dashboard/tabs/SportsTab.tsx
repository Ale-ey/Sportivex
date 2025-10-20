import React from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Search, Filter } from "lucide-react";

export interface SportItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  image?: string;
  progress: number;
  sessions: number;
  lastSession: string;
}

interface SportsTabProps {
  sports: SportItem[];
}

const SportsTab: React.FC<SportsTabProps> = ({ sports }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Sports Activities</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {sports.map((sport, index) => (
          <Card
            key={index}
            className="relative overflow-hidden rounded-lg transition-all cursor-pointer h-64"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={
                sport.image
                  ? { backgroundImage: `url(${sport.image})` }
                  : { backgroundColor: "#1f2937" }
              }
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              aria-hidden
            />
            <CardContent className="relative p-6 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <sport.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-lg">
                    {sport.name}
                  </h3>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {sport.progress}%
                  </p>
                  <p className="text-sm text-gray-200/70">Progress</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${sport.color}`}
                    style={{ width: `${sport.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-200/80">
                <span>{sport.sessions} sessions</span>
                <span className="text-gray-200/60">{sport.lastSession}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SportsTab;
