import React, { useEffect, useState } from "react";
import LeaguesTab, { type LeagueItem } from "../tabs/LeaguesTab";
import { useLeague } from "@/hooks/useLeague";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { leagueService } from "@/services/leagueService";
import toast from "react-hot-toast";

const LeaguesRoute: React.FC = () => {
  const { leagues, loading, fetchLeagues } = useLeague();
  const [leagueItems, setLeagueItems] = useState<LeagueItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  // Check for payment success callback
  useEffect(() => {
    const payment = searchParams.get('payment');
    const registrationId = searchParams.get('registrationId');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success' && registrationId && sessionId) {
      // Verify league registration payment
      leagueService.verifyLeaguePayment({
        registrationId,
        sessionId,
      })
        .then((response) => {
          if (response.success) {
            toast.success('Payment verified successfully!');
            fetchLeagues(); // Refresh leagues to show updated status
          } else {
            toast.error(response.message || 'Failed to verify payment');
          }
          setSearchParams({});
        })
        .catch((error: any) => {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to verify payment';
          toast.error(errorMessage);
          setSearchParams({});
        });
    } else if (payment === 'cancelled') {
      toast.error('Payment was cancelled');
      setSearchParams({});
    }
  }, [searchParams, fetchLeagues, setSearchParams]);

  useEffect(() => {
    // Transform API leagues to LeagueItem format
    const transformed = leagues.map((league) => {
      const startDate = new Date(league.start_date);
      const today = new Date();
      const registrationDeadline = new Date(league.registration_deadline);
      
      let status: "Registered" | "Training" | "Upcoming" | "Registration Open" = "Upcoming";
      
      if (league.status === 'in_progress') {
        status = "Training";
      } else if (league.status === 'completed') {
        status = "Training"; // Show as training for completed leagues
      } else if (league.registration_enabled && today <= registrationDeadline) {
        status = "Registration Open";
      } else if (league.status === 'registration_open') {
        status = "Registration Open";
      }

      return {
        id: league.id,
        name: league.name,
        date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        participants: 0, // Will be updated if we have registration count
        status,
        prize: league.prize || "TBD",
        myRank: null,
        league: league, // Store full league object for registration
      };
    });
    
    setLeagueItems(transformed);
  }, [leagues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  return <LeaguesTab leagues={leagueItems} />;
};

export default LeaguesRoute;
