import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, User, Play, RotateCcw, Sparkles, ToggleLeft, ToggleRight, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetProfile } from '@/hooks/useAuth';
import { useBadminton } from '@/hooks/useBadminton';
import type { Player } from '@/services/badmintonService';

type MatchMode = '1v1' | '2v2';

interface BadmintonRouteProps {}

const BadmintonRoute: React.FC<BadmintonRouteProps> = () => {
  const { getProfile, user } = useGetProfile();
  const {
    // State
    availablePlayers: players,
    myAvailability,
    availableCourts: courts,
    selectedCourt,
    currentMatch,
    matchMode,
    team1,
    team2,
    timeRemaining,
    loadingPlayers,
    loadingAvailability,
    loadingCourts,
    loadingMatches,
    // Actions
    fetchAvailablePlayers,
    fetchMyAvailability,
    toggleAvailability,
    fetchAvailableCourts,
    selectCourt,
    createMatch,
    startMatch,
    endMatch,
    fetchMyMatches,
    findMatch,
    setMatchMode,
    addPlayer,
    removePlayer,
    areTeamsReady,
    formatTimeRemaining,
    isMatchInProgress,
  } = useBadminton();

  const [isSelectingRandom, setIsSelectingRandom] = useState<{ team: 1 | 2; slot: number } | null>(null);
  const [randomSelectionIndex, setRandomSelectionIndex] = useState(0);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playersPerTeam = matchMode === '1v1' ? 1 : 2;
  const matchStarted = isMatchInProgress();
  const loading = loadingPlayers || loadingAvailability || loadingCourts || loadingMatches;

  // Get user profile and initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await getProfile();
        await Promise.all([
          fetchMyAvailability(),
          fetchAvailablePlayers(),
          fetchAvailableCourts(),
          fetchMyMatches()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Failed to load data');
      }
    };
    loadInitialData();
  }, [getProfile, fetchMyAvailability, fetchAvailablePlayers, fetchAvailableCourts, fetchMyMatches]);

  // Timer for match countdown
  useEffect(() => {
    if (matchStarted && currentMatch && currentMatch.status === 'in_progress') {
      timerIntervalRef.current = setInterval(() => {
        if (currentMatch.actual_start_time) {
          const startTime = new Date(currentMatch.actual_start_time).getTime();
          const endTime = startTime + 30 * 60 * 1000;
          const remaining = Math.max(0, endTime - Date.now());
          
          if (remaining <= 0) {
            // Auto-end match when time is up
            if (currentMatch.id) {
              endMatch(currentMatch.id);
            }
          }
        }
      }, 1000);
      
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [matchStarted, currentMatch, endMatch]);

  // Refresh available players periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!matchStarted) {
        fetchAvailablePlayers();
      }
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [matchStarted, fetchAvailablePlayers]);

  // Add current user to team when user is loaded
  useEffect(() => {
    if (user && myAvailability && !matchStarted && team1.length === 0) {
      const currentUserPlayer: Player = {
        id: user.id || '',
        name: user.name || 'You',
        email: user.email || '',
        avatar: user.profilePictureUrl ?? null,
        cms_id: typeof user.cmsId === 'number' ? user.cmsId : (typeof user.cmsId === 'string' ? parseInt(user.cmsId, 10) || 0 : 0),
        role: user.role || '',
        gender: user.gender || null,
        initials: getInitials(user.name || 'You'),
        available: true,
      };

      // Auto-select current user for team 1 if empty
      addPlayer(currentUserPlayer, 1);
    }
  }, [user, myAvailability, matchStarted, team1.length, addPlayer]);

  // Random selection animation
  useEffect(() => {
    if (isSelectingRandom) {
      const availablePlayers = players.filter(
        (p) => p.available && !team1.some((t) => t.id === p.id) && !team2.some((t) => t.id === p.id)
      );
      
      if (availablePlayers.length === 0) {
        setIsSelectingRandom(null);
        toast.error('No available players!');
        return;
      }

      scrollIntervalRef.current = setInterval(() => {
        setRandomSelectionIndex((prev) => (prev + 1) % availablePlayers.length);
      }, 150);

      const timeout = setTimeout(async () => {
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
        
        if (availablePlayers.length > 0) {
          const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
          
          // Remove player at slot if exists
          const currentTeam = isSelectingRandom.team === 1 ? team1 : team2;
          if (currentTeam[isSelectingRandom.slot]) {
            removePlayer(currentTeam[isSelectingRandom.slot].id, isSelectingRandom.team);
          }
          
          // Add new player
          addPlayer(randomPlayer, isSelectingRandom.team);
          
          toast.success(`${randomPlayer.name} selected!`);
        }
        
        setIsSelectingRandom(null);
        setRandomSelectionIndex(0);
      }, 2000);

      return () => {
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
        }
        clearTimeout(timeout);
      };
    }
  }, [isSelectingRandom, team1, team2, players, addPlayer, removePlayer]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleToggleAvailability = async () => {
    await toggleAvailability(!myAvailability);
  };

  const handleModeSelect = (mode: MatchMode) => {
    setMatchMode(mode);
    // Teams will be cleared by setMatchMode, then add current user if available
    if (user && myAvailability) {
      const currentUserPlayer: Player = {
        id: user.id || '',
        name: user.name || 'You',
        email: user.email || '',
        avatar: user.profilePictureUrl ?? null,
        cms_id: typeof user.cmsId === 'number' ? user.cmsId : (typeof user.cmsId === 'string' ? parseInt(user.cmsId, 10) || 0 : 0),
        role: user.role || '',
        gender: user.gender || null,
        initials: getInitials(user.name || 'You'),
        available: true,
      };
      setTimeout(() => addPlayer(currentUserPlayer, 1), 0);
    }
  };

  const handlePlayerSlotClick = (team: 1 | 2, slot: number) => {
    const currentTeam = team === 1 ? team1 : team2;
    if (!currentTeam[slot]) {
      setIsSelectingRandom({ team, slot });
    } else {
      const player = currentTeam[slot];
      if (player) {
        removePlayer(player.id, team);
      }
    }
  };

  const handlePlayerSelect = (player: Player, team: 1 | 2) => {
    const isInTeam1 = team1.some((p) => p.id === player.id);
    const isInTeam2 = team2.some((p) => p.id === player.id);
    
    if (isInTeam1 || isInTeam2) {
      toast.error('Player already selected!');
      return;
    }

    addPlayer(player, team);
  };

  const handleFindMatch = async (team: 1 | 2, slot: number) => {
    try {
      const response = await findMatch(matchMode, team);
      if (response.success && response.player) {
        const selectedPlayer = response.player;
        
        // Remove player at slot if exists, then add new one
        const currentTeam = team === 1 ? team1 : team2;
        if (currentTeam[slot]) {
          removePlayer(currentTeam[slot].id, team);
        }
        
        addPlayer(selectedPlayer, team);
        toast.success(`${selectedPlayer.name} selected!`);
      }
    } catch (error) {
      console.error('Error finding match:', error);
    }
  };

  const handleStartMatch = async () => {
    if (!selectedCourt) {
      toast.error('Please select a court');
      return;
    }

    if (!areTeamsReady()) {
      toast.error(`Both teams must have ${playersPerTeam} player(s)`);
      return;
    }

    try {
      const matchData = {
        courtId: selectedCourt.id,
        team1Player1Id: team1[0].id,
        team1Player2Id: matchMode === '2v2' ? team1[1]?.id : undefined,
        team2Player1Id: team2[0].id,
        team2Player2Id: matchMode === '2v2' ? team2[1]?.id : undefined,
        matchMode,
      };

      const createResponse = await createMatch(matchData);
      
      if (createResponse.success && createResponse.match) {
        toast.success('Match created successfully!');
        
        // Start the match
        const startResponse = await startMatch(createResponse.match.id);
        if (startResponse.success) {
          toast.success('Match started!', { icon: '🎾' });
        }
      }
    } catch (error: any) {
      console.error('Error starting match:', error);
    }
  };

  const handleEndMatch = async () => {
    if (!currentMatch) return;

    await endMatch(currentMatch.id);
  };

  const renderPlayerSlot = (team: 1 | 2, slot: number) => {
    const currentTeam = team === 1 ? team1 : team2;
    const player = currentTeam[slot];
    const isSelecting = isSelectingRandom?.team === team && isSelectingRandom?.slot === slot;
    const availablePlayers = players.filter(
      (p) => p.available && !team1.some((t) => t.id === p.id) && !team2.some((t) => t.id === p.id)
    );

    return (
      <div className="relative">
        <div
          onClick={() => handlePlayerSlotClick(team, slot)}
          className={`relative w-32 h-32 rounded-full border-4 transition-all duration-300 cursor-pointer ${
            player
              ? 'border-[#0077B6] bg-white'
              : isSelecting
              ? 'border-[#48CAE4] bg-gradient-to-br from-blue-100 to-blue-200 animate-pulse'
              : 'border-[#E2F5FB] bg-[#F8FDFF] hover:border-[#0077B6] hover:bg-blue-50'
          } flex items-center justify-center group`}
        >
          {isSelecting ? (
            <div className="overflow-hidden h-full w-full rounded-full">
              <div
                className="flex flex-col transition-transform duration-150 ease-linear"
                style={{
                  transform: `translateY(-${randomSelectionIndex * 100}%)`,
                }}
              >
                {availablePlayers.map((p) => (
                  <div key={p.id} className="h-32 w-32 flex items-center justify-center flex-shrink-0">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="bg-[#023E8A] text-white text-xl font-semibold">
                        {p.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
                {availablePlayers.map((p) => (
                  <div key={`dup-${p.id}`} className="h-32 w-32 flex items-center justify-center flex-shrink-0">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="bg-[#023E8A] text-white text-xl font-semibold">
                        {p.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
              </div>
            </div>
          ) : player ? (
            <>
              <Avatar className="w-24 h-24">
                <AvatarImage src={player.avatar || undefined} />
                <AvatarFallback className="bg-[#023E8A] text-white text-xl font-semibold">
                  {player.initials}
                </AvatarFallback>
              </Avatar>
            </>
          ) : (
            <div className="text-center">
              <User className="w-12 h-12 text-[#0077B6] opacity-50 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs text-muted-foreground mt-2">Click to select</p>
            </div>
          )}
        </div>
        {player && (
          <p className="text-center mt-2 text-sm font-medium text-[#023E8A]">{player.name}</p>
        )}
        {!player && !isSelecting && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleFindMatch(team, slot);
            }}
            className="mt-2 w-full text-xs bg-[#0077B6] text-white hover:bg-[#005885]"
          >
            Find Match
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (matchStarted && currentMatch) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#023E8A] mb-2">Match in Progress</h2>
            <div className="flex items-center gap-4 mt-2">
              <Badge className="bg-[#0077B6] text-white">
                <MapPin className="w-3 h-3 mr-1" />
                Court {currentMatch.court?.court_number || 'N/A'}
              </Badge>
              {timeRemaining > 0 && (
                <Badge className="bg-green-500 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeRemaining(timeRemaining)} remaining
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={handleEndMatch}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            End Match
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-8 py-12">
            {/* Team 1 */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                {team1.map((player) => (
                  <div key={player.id} className="flex flex-col items-center">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={player.avatar || undefined} />
                      <AvatarFallback className="bg-[#023E8A] text-white text-lg">
                        {player.initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm mt-2 font-medium text-[#023E8A]">{player.name}</p>
                  </div>
                ))}
              </div>
              <Badge className="bg-[#0077B6] text-white text-lg px-4 py-2">Team 1</Badge>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold text-[#023E8A] animate-pulse">VS</div>
              <Sparkles className="w-8 h-8 text-[#0077B6] animate-spin" />
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                {team2.map((player) => (
                  <div key={player.id} className="flex flex-col items-center">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={player.avatar || undefined} />
                      <AvatarFallback className="bg-[#023E8A] text-white text-lg">
                        {player.initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm mt-2 font-medium text-[#023E8A]">{player.name}</p>
                  </div>
                ))}
              </div>
              <Badge className="bg-[#0077B6] text-white text-lg px-4 py-2">Team 2</Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#023E8A] mb-2">Badminton Match Setup</h2>
          <p className="text-muted-foreground">Select match mode and players</p>
        </div>
        {user && (
          <Button
            variant="outline"
            onClick={handleToggleAvailability}
            className={`border-2 ${
              myAvailability
                ? 'border-green-500 text-green-600 hover:bg-green-50'
                : 'border-gray-400 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {myAvailability ? (
              <>
                <ToggleRight className="w-4 h-4 mr-2" />
                Available
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 mr-2" />
                Unavailable
              </>
            )}
          </Button>
        )}
      </div>

      {/* Mode Selection */}
      <Card className="border border-[#E2F5FB]">
        <CardHeader>
          <CardTitle className="text-[#023E8A]">Select Match Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => handleModeSelect('1v1')}
              className={`flex-1 h-20 ${
                matchMode === '1v1'
                  ? 'bg-[#0077B6] text-white'
                  : 'bg-white border-2 border-[#E2F5FB] text-[#023E8A] hover:bg-[#EAF7FD]'
              }`}
            >
              <User className="w-6 h-6 mr-2" />
              <div className="text-left">
                <div className="font-semibold">1 vs 1</div>
                <div className="text-xs opacity-90">Singles</div>
              </div>
            </Button>
            <Button
              onClick={() => handleModeSelect('2v2')}
              className={`flex-1 h-20 ${
                matchMode === '2v2'
                  ? 'bg-[#0077B6] text-white'
                  : 'bg-white border-2 border-[#E2F5FB] text-[#023E8A] hover:bg-[#EAF7FD]'
              }`}
            >
              <Users className="w-6 h-6 mr-2" />
              <div className="text-left">
                <div className="font-semibold">2 vs 2</div>
                <div className="text-xs opacity-90">Doubles</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Court Selection */}
      <Card className="border border-[#E2F5FB]">
        <CardHeader>
          <CardTitle className="text-[#023E8A]">Select Court</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {courts.map((court) => (
              <Button
                key={court.id}
                onClick={() => selectCourt(court)}
                variant={selectedCourt?.id === court.id ? 'default' : 'outline'}
                className={`h-20 ${
                  selectedCourt?.id === court.id
                    ? 'bg-[#0077B6] text-white'
                    : 'bg-white border-2 border-[#E2F5FB] text-[#023E8A] hover:bg-[#EAF7FD]'
                }`}
              >
                <MapPin className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">{court.name}</div>
                  <div className="text-xs opacity-90">{court.status}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team 1 */}
        <Card className="border border-[#E2F5FB]">
          <CardHeader>
            <CardTitle className="text-[#023E8A] flex items-center gap-2">
              <Badge className="bg-[#0077B6] text-white">Team 1</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              {Array.from({ length: playersPerTeam }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {renderPlayerSlot(1, idx)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* VS Divider */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="text-4xl font-bold text-[#023E8A]">VS</div>
        </div>

        {/* Team 2 */}
        <Card className="border border-[#E2F5FB]">
          <CardHeader>
            <CardTitle className="text-[#023E8A] flex items-center gap-2">
              <Badge className="bg-[#0077B6] text-white">Team 2</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              {Array.from({ length: playersPerTeam }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {renderPlayerSlot(2, idx)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile VS */}
      <div className="lg:hidden flex items-center justify-center py-4">
        <div className="text-3xl font-bold text-[#023E8A]">VS</div>
      </div>

      {/* Available Players */}
      <Card className="border border-[#E2F5FB]">
        <CardHeader>
          <CardTitle className="text-[#023E8A]">Available Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {players
              .filter((p) => p.available)
              .map((player) => {
                const isSelected = team1.some((t) => t.id === player.id) || team2.some((t) => t.id === player.id);
                const isCurrentUser = user && player.id === user.id;
                
                return (
                  <div
                    key={player.id}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-[#EAF7FD]'
                    }`}
                    onClick={() => {
                      if (!isSelected) {
                        if (team1.length < playersPerTeam) {
                          handlePlayerSelect(player, 1);
                        } else if (team2.length < playersPerTeam) {
                          handlePlayerSelect(player, 2);
                        } else {
                          toast.error('All teams are full!');
                        }
                      }
                    }}
                  >
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={player.avatar || undefined} />
                        <AvatarFallback className="bg-[#023E8A] text-white">
                          {player.initials}
                        </AvatarFallback>
                      </Avatar>
                      {isCurrentUser && (
                        <Badge className="absolute -top-1 -right-1 bg-[#0077B6] text-white text-xs px-1">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs mt-2 text-center text-[#023E8A] font-medium">
                      {player.name}
                    </p>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Play Button */}
      {areTeamsReady() && (
        <div className="flex justify-center animate-in slide-in-from-bottom duration-500">
          <Button
            onClick={handleStartMatch}
            size="lg"
            className="bg-[#0077B6] hover:bg-[#005885] text-white text-lg px-8 py-6 h-auto"
          >
            <Play className="w-6 h-6 mr-2" />
            Start Match
          </Button>
        </div>
      )}
    </div>
  );
};

export default BadmintonRoute;
