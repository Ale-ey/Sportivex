import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Clock, 
  Users, 
  Waves, 
  Play, 
  Pause, 
  Square,
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  duration: number; // in minutes
  trainer: string;
  capacity: number;
  currentUsers: number;
  status: 'available' | 'occupied' | 'maintenance';
  startTime?: Date;
  endTime?: Date;
  remainingTime?: number;
}

interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  slotId: string;
  startTime: Date;
  endTime: Date;
  remainingTime: number;
  status: 'active' | 'paused' | 'completed';
}

const TimeTracking: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      time: '06:00 AM',
      duration: 60,
      trainer: 'John Smith',
      capacity: 20,
      currentUsers: 15,
      status: 'occupied',
      startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      endTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
    },
    {
      id: '2',
      time: '07:00 AM',
      duration: 60,
      trainer: 'Sarah Johnson',
      capacity: 20,
      currentUsers: 8,
      status: 'occupied',
      startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      endTime: new Date(Date.now() + 55 * 60 * 1000), // 55 minutes from now
    },
    {
      id: '3',
      time: '08:00 AM',
      duration: 60,
      trainer: 'Mike Wilson',
      capacity: 20,
      currentUsers: 0,
      status: 'available',
    },
    {
      id: '4',
      time: '09:00 AM',
      duration: 60,
      trainer: 'Lisa Brown',
      capacity: 20,
      currentUsers: 0,
      status: 'available',
    },
    {
      id: '5',
      time: '10:00 AM',
      duration: 60,
      trainer: 'David Lee',
      capacity: 20,
      currentUsers: 0,
      status: 'maintenance',
    },
  ]);

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: 'session1',
      userId: 'user1',
      userName: 'Alice Johnson',
      slotId: '1',
      startTime: new Date(Date.now() - 15 * 60 * 1000),
      endTime: new Date(Date.now() + 45 * 60 * 1000),
      remainingTime: 45,
      status: 'active',
    },
    {
      id: 'session2',
      userId: 'user2',
      userName: 'Bob Smith',
      slotId: '2',
      startTime: new Date(Date.now() - 5 * 60 * 1000),
      endTime: new Date(Date.now() + 55 * 60 * 1000),
      remainingTime: 55,
      status: 'active',
    },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update remaining time for active sessions
  useEffect(() => {
    const updateRemainingTime = () => {
      setActiveSessions(prevSessions => 
        prevSessions.map(session => {
          const now = new Date();
          const remaining = Math.max(0, Math.floor((session.endTime.getTime() - now.getTime()) / (1000 * 60)));
          
          return {
            ...session,
            remainingTime: remaining,
            status: remaining === 0 ? 'completed' : session.status,
          };
        })
      );
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Users className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const startSession = (slotId: string) => {
    // Simulate starting a new session
    const slot = timeSlots.find(s => s.id === slotId);
    if (slot) {
      const newSession: ActiveSession = {
        id: `session_${Date.now()}`,
        userId: 'current_user',
        userName: 'Current User',
        slotId,
        startTime: new Date(),
        endTime: new Date(Date.now() + slot.duration * 60 * 1000),
        remainingTime: slot.duration,
        status: 'active',
      };
      
      setActiveSessions(prev => [...prev, newSession]);
      
      setTimeSlots(prev => 
        prev.map(slot => 
          slot.id === slotId 
            ? { ...slot, status: 'occupied' as const, currentUsers: slot.currentUsers + 1 }
            : slot
        )
      );
    }
  };

  const pauseSession = (sessionId: string) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'paused' as const }
          : session
      )
    );
  };

  const resumeSession = (sessionId: string) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'active' as const }
          : session
      )
    );
  };

  const endSession = (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (session) {
      setTimeSlots(prev => 
        prev.map(slot => 
          slot.id === session.slotId 
            ? { ...slot, status: 'available' as const, currentUsers: Math.max(0, slot.currentUsers - 1) }
            : slot
        )
      );
    }
    
    setActiveSessions(prev => 
      prev.filter(session => session.id !== sessionId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Timer className="w-8 h-8 mr-3 text-blue-600" />
                Swimming Pool Time Tracking
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time monitoring of swimming pool time slots and sessions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-600">
                Current Time
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map(session => (
                <Card key={session.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{session.userName}</h3>
                      <Badge className={session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Started: {formatTime(session.startTime)}</div>
                      <div>Ends: {formatTime(session.endTime)}</div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(session.remainingTime)} remaining
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      {session.status === 'active' ? (
                        <Button size="sm" variant="outline" onClick={() => pauseSession(session.id)}>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => resumeSession(session.id)}>
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => endSession(session.id)}>
                        <Square className="w-4 h-4 mr-1" />
                        End
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Time Slots */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Time Slots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map(slot => (
              <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{slot.time}</CardTitle>
                    <Badge className={getStatusColor(slot.status)}>
                      {getStatusIcon(slot.status)}
                      <span className="ml-1 capitalize">{slot.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Duration: {slot.duration} minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {slot.currentUsers}/{slot.capacity} users
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Waves className="w-4 h-4 mr-2" />
                      Trainer: {slot.trainer}
                    </div>
                    {slot.status === 'occupied' && slot.startTime && (
                      <div className="text-sm text-gray-600">
                        <div>Started: {formatTime(slot.startTime)}</div>
                        <div>Ends: {formatTime(slot.endTime!)}</div>
                      </div>
                    )}
                    <div className="pt-2">
                      {slot.status === 'available' ? (
                        <Button 
                          onClick={() => startSession(slot.id)}
                          className="w-full"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Session
                        </Button>
                      ) : slot.status === 'maintenance' ? (
                        <Button disabled className="w-full">
                          Under Maintenance
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          Slot Occupied
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pool Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {timeSlots.filter(slot => slot.status === 'occupied').length}
                </div>
                <div className="text-sm text-gray-600">Active Slots</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {timeSlots.filter(slot => slot.status === 'available').length}
                </div>
                <div className="text-sm text-gray-600">Available Slots</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {timeSlots.reduce((sum, slot) => sum + slot.currentUsers, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {activeSessions.length}
                </div>
                <div className="text-sm text-gray-600">Active Sessions</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
