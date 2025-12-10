import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, Users, Trophy, Loader2 } from "lucide-react";
import { useLeague } from "@/hooks/useLeague";
import { type League } from "@/services/leagueService";

export interface LeagueCardProps {
  id?: string;
  name: string;
  date: string;
  participants: number;
  status: "Registered" | "Training" | "Upcoming" | "Registration Open";
  prize: string;
  myRank?: number | null;
  league?: League;
}

const LeagueCard: React.FC<LeagueCardProps> = ({
  id,
  name,
  date,
  participants,
  status,
  prize,
  myRank,
  league,
}) => {
  const { registerForLeague, getUserRegistration } = useLeague();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (id && league?.registration_enabled) {
      checkRegistrationStatus();
    } else {
      setIsChecking(false);
    }
  }, [id, league]);

  const checkRegistrationStatus = async () => {
    if (!id) return;
    setIsChecking(true);
    try {
      const registration = await getUserRegistration(id);
      setIsRegistered(!!registration && registration.status !== 'cancelled');
    } catch (error) {
      console.error('Error checking registration:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || !league) return;

    // Register only (no cancel functionality)
    setIsRegistering(true);
    try {
      await registerForLeague(id);
      setIsRegistered(true);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsRegistering(false);
    }
  };

  const canRegister = league?.registration_enabled && status === "Registration Open";
  const showRegisterButton = canRegister && !isChecking;
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
    <Card className="bg-white border border-[#E2F5FB] hover:shadow-lg transition-all group">
      <CardContent className="p-6">
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
              {isRegistered && status === "Registration Open" ? "Registered" : status}
            </Badge>
            <p className="text-2xl font-bold text-[#023E8A]">{prize}</p>
            <p className="text-xs text-slate-500">Prize Pool</p>
            {league?.registration_fee !== undefined && league.registration_fee > 0 && (
              <>
                <p className="text-lg font-semibold text-[#0077B6] mt-2">
                  ${league.registration_fee.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">Registration Fee</p>
              </>
            )}
            {league?.registration_fee === 0 || (league?.registration_fee === undefined && status === "Registration Open") && (
              <p className="text-xs text-emerald-600 font-medium mt-2">Free Registration</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-[#E2F5FB]" onClick={(e) => e.stopPropagation()}>
          {showRegisterButton ? (
            <Button
              type="button"
              size="sm"
              onClick={handleRegister}
              disabled={isRegistering || isRegistered}
              className={`flex-1 ${
                isRegistered
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-[#00B4D8] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B4D8] text-white"
              }`}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : isRegistered ? (
                "Registered"
              ) : (
                "Register Now"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="flex-1 bg-gradient-to-r from-[#00B4D8] to-[#0096C7] hover:from-[#0096C7] hover:to-[#00B4D8] text-white"
            >
              View Details
            </Button>
          )}
          {isRegistered && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              Registered
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeagueCard;
