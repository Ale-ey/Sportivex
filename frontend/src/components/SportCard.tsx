import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export interface SportCardProps {
  title: string;
  image?: string;
  badge?: string;
  onClick?: () => void;
}

const SportCard: React.FC<SportCardProps> = ({
  title,
  image,
  badge,
  onClick,
}) => {
  return (
    <Card
      className="relative overflow-hidden rounded-2xl transition-all cursor-pointer h-64 hover:shadow-lg border border-[#E2F5FB] group"
      onClick={onClick}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={
          image
            ? { backgroundImage: `url(${image})` }
            : { backgroundColor: "#F8FDFF" }
        }
        aria-hidden
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"
        aria-hidden
      />

      <CardContent className="relative p-6 h-full flex flex-col justify-between">
        {/* Top: Badge only */}
        <div className="flex items-start justify-end">
          {badge && (
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {badge}
            </Badge>
          )}
        </div>

        {/* Bottom: Sport Title */}
        <div>
          <h3 className="font-bold text-white text-3xl drop-shadow-lg">
            {title}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default SportCard;
