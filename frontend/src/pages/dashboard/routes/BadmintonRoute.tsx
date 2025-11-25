import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, User, Play, RotateCcw, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetProfile } from '@/hooks/useAuth';
// h
// Hardcoded player data with availability
const INITIAL_PLAYERS = [
  { id: '1', name: 'Ali Khan', avatar: null as string | null, initials: 'AK', available: true },
  { id: '2', name: 'Sarah Ahmed', avatar: null as string | null, initials: 'SA', available: true },
  { id: '3', name: 'Ahmed Ali', avatar: null as string | null, initials: 'AA', available: true },
  { id: '4', name: 'Fatima Hassan', avatar: null as string | null, initials: 'FH', available: true },
  { id: '5', name: 'Omar Malik', avatar: null as string | null, initials: 'OM', available: true },
  { id: '6', name: 'Zainab Ali', avatar: null as string | null, initials: 'ZA', available: true },
  { id: '7', name: 'Hassan Raza', avatar: null as string | null, initials: 'HR', available: true },
  { id: '8', name: 'Ayesha Khan', avatar: null as string | null, initials: 'AK', available: true },
  { id: '9', name: 'Bilal Shah', avatar: null as string | null, initials: 'BS', available: true },
  { id: '10', name: 'Mariam Ali', avatar: null as string | null, initials: 'MA', available: true },
];

type MatchMode = '1v1' | '2v2';
type Player = typeof INITIAL_PLAYERS[0] & { available: boolean };
type Team = Player[];

interface BadmintonRouteProps {}

const BadmintonRoute: React.FC<BadmintonRouteProps> = () => {
  const { getProfile, user } = useGetProfile();
  const [matchMode, setMatchMode] = useState<MatchMode>('1v1');
  const [team1, setTeam1] = useState<Team>([]);
  const [team2, setTeam2] = useState<Team>([]);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [isSelectingRandom, setIsSelectingRandom] = useState<{ team: 1 | 2; slot: number } | null>(null);
  const [randomSelectionIndex, setRandomSelectionIndex] = useState(0);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const [matchStarted, setMatchStarted] = useState(false);
  const [playerReady, setPlayerReady] = useState<Record<string, boolean>>({});
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playersPerTeam = matchMode === '1v1' ? 1 : 2;

  // Get user profile on mount
  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Add current user to players list and auto-select for both teams when user is loaded
  useEffect(() => {
    if (user) {
      const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

      const currentUserPlayer: Player = {
        id: user.id || 'current-user',
        name: user.name || 'You',
        avatar: user.profilePictureUrl ?? null,
        initials: getInitials(user.name || 'You'),
        available: true,
      };

      // Add current user to players list if not already there
      setPlayers((prev) => {
        const exists = prev.some((p) => p.id === user.id);
        if (!exists) {
          return [...prev, currentUserPlayer];
        }
        return prev;
      });

      // Auto-select current user for both teams if teams are empty
      if (team1.length === 0 && team2.length === 0) {
        setTeam1([currentUserPlayer]);
        setTeam2([currentUserPlayer]);
      }
    }
  }, [user, team1.length, team2.length]);

  // Check if all players are ready
  useEffect(() => {
    const totalPlayers = team1.length + team2.length;
    const readyCount = Object.values(playerReady).filter(Boolean).length;
    setAllPlayersReady(totalPlayers > 0 && totalPlayers === readyCount);
  }, [team1, team2, playerReady]);

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
      }, 150); // Fast scrolling animation

      // Stop after 2 seconds and select random player
      const timeout = setTimeout(() => {
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
        
        if (availablePlayers.length > 0) {
          const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
          
          if (isSelectingRandom.team === 1) {
            const newTeam1 = [...team1];
            newTeam1[isSelectingRandom.slot] = randomPlayer;
            setTeam1(newTeam1);
          } else {
            const newTeam2 = [...team2];
            newTeam2[isSelectingRandom.slot] = randomPlayer;
            setTeam2(newTeam2);
          }
          
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
  }, [isSelectingRandom, team1, team2, players]);

  const handleModeSelect = (mode: MatchMode) => {
    setMatchMode(mode);
    // Reset teams but keep current user
    if (user) {
      const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

      const currentUserPlayer: Player = {
        id: user.id || 'current-user',
        name: user.name || 'You',
        avatar: user.profilePictureUrl ?? null,
        initials: getInitials(user.name || 'You'),
        available: true,
      };

      setTeam1([currentUserPlayer]);
      setTeam2([currentUserPlayer]);
    } else {
      setTeam1([]);
      setTeam2([]);
    }
    setPlayerReady({});
    setMatchStarted(false);
  };

  const handleToggleMyAvailability = () => {
    if (!user) return;
    
    // Update current user's availability in players list
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === user.id) {
          return { ...p, available: !p.available };
        }
        return p;
      })
    );
    
    // Also update in teams if user is selected
    const updateTeamAvailability = (team: Team) => {
      return team.map((p) => {
        if (p.id === user.id) {
          return { ...p, available: !p.available };
        }
        return p;
      });
    };
    
    setTeam1(updateTeamAvailability(team1));
    setTeam2(updateTeamAvailability(team2));
  };

  // Get current user's availability status
  const getMyAvailability = (): boolean => {
    if (!user) return true;
    const currentUserPlayer = players.find((p) => p.id === user.id);
    return currentUserPlayer?.available ?? true;
  };

  const handlePlayerSlotClick = (team: 1 | 2, slot: number) => {
    // If slot is empty, start random selection
    const currentTeam = team === 1 ? team1 : team2;
    if (!currentTeam[slot]) {
      setIsSelectingRandom({ team, slot });
    } else {
      // If slot has player, remove them and clear ready status
      const player = currentTeam[slot];
      if (player) {
        setPlayerReady((prev) => {
          const newReady = { ...prev };
          delete newReady[player.id];
          return newReady;
        });
      }
      
      if (team === 1) {
        const newTeam1 = [...team1];
        newTeam1.splice(slot, 1);
        setTeam1(newTeam1);
      } else {
        const newTeam2 = [...team2];
        newTeam2.splice(slot, 1);
        setTeam2(newTeam2);
      }
    }
  };

  const handlePlayerSelect = (player: Player, team: 1 | 2) => {
    // Check if player is already selected
    const isInTeam1 = team1.some((p) => p.id === player.id);
    const isInTeam2 = team2.some((p) => p.id === player.id);
    
    if (isInTeam1 || isInTeam2) {
      toast.error('Player already selected!');
      return;
    }

    // Find first empty slot in the team
    if (team === 1) {
      if (team1.length < playersPerTeam) {
        const newTeam1 = [...team1];
        newTeam1.push(player);
        setTeam1(newTeam1);
      }
    } else {
      if (team2.length < playersPerTeam) {
        const newTeam2 = [...team2];
        newTeam2.push(player);
        setTeam2(newTeam2);
      }
    }
  };

  const handlePlayerReady = (playerId: string) => {
    setPlayerReady((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const handleStartMatch = () => {
    if (allPlayersReady) {
      setMatchStarted(true);
      toast.success('Match started!', { icon: '🎾' });
    }
  };

  const handleReset = () => {
    // Reset teams but keep current user
    if (user) {
      const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      };

      const currentUserPlayer: Player = {
        id: user.id || 'current-user',
        name: user.name || 'You',
        avatar: user.profilePictureUrl ?? null,
        initials: getInitials(user.name || 'You'),
        available: true,
      };

      setTeam1([currentUserPlayer]);
      setTeam2([currentUserPlayer]);
    } else {
      setTeam1([]);
      setTeam2([]);
    }
    setPlayerReady({});
    setMatchStarted(false);
    setAllPlayersReady(false);
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
                {/* Duplicate for seamless loop */}
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
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Button
                  size="sm"
                  variant={playerReady[player.id] ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayerReady(player.id);
                  }}
                  className={`text-xs h-6 px-2 ${
                    playerReady[player.id]
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-white border-[#0077B6] text-[#0077B6]'
                  }`}
                >
                  {playerReady[player.id] ? '✓ Ready' : 'Ready'}
                </Button>
              </div>
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
      </div>
    );
  };

  if (matchStarted) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
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

          <div className="text-3xl font-bold text-[#023E8A] mt-8">Match in Progress!</div>
          <p className="text-muted-foreground">Good luck to both teams!</p>

          <Button
            onClick={handleReset}
            variant="outline"
            className="mt-6 border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Match
          </Button>
        </div>
      </div>
    );
  }

  const myAvailability = getMyAvailability();

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
            onClick={handleToggleMyAvailability}
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
                        // Find first empty slot - prioritize team 1, then team 2
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
      {allPlayersReady && team1.length === playersPerTeam && team2.length === playersPerTeam && (
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

