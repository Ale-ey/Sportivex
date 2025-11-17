import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QRScanner from '@/components/QRScanner';
import { swimmingService, type TimeSlot } from '@/services/swimmingService';
import { Clock, Users, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SwimmingRoute: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [reserving, setReserving] = useState<Record<string, boolean>>({});
  const [userReservations, setUserReservations] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTimeSlots();
    // Refresh every 30 seconds to update capacity
    const interval = setInterval(fetchTimeSlots, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await swimmingService.getTimeSlots();
      if (response.success) {
        setTimeSlots(response.data.timeSlots);
        
        // Check user's reservations for today by checking waitlists
        const today = new Date().toISOString().split('T')[0];
        const reservationPromises = response.data.timeSlots.map(async (slot) => {
          try {
            const waitlistResponse = await swimmingService.getWaitlist(slot.id, today);
            // The backend will prevent duplicate reservations, so we track locally
            // In a production app, you'd decode JWT to get user ID and check waitlist
            return { slotId: slot.id, hasReservation: false };
          } catch {
            return { slotId: slot.id, hasReservation: false };
          }
        });
        
        await Promise.all(reservationPromises);
        // Reservations are tracked locally after user actions
        // Backend validation prevents duplicates
      }
    } catch (error: any) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load time slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      setScanning(true);
      const response = await swimmingService.scanQRCode(qrCode);
      
      if (response.success) {
        toast.success(response.message || 'Attendance marked successfully!');
        fetchTimeSlots(); // Refresh to update counts
      } else {
        if (response.capacityExceeded) {
          toast.error('This time slot is full. Please try another slot.');
        } else if (response.alreadyCheckedIn) {
          toast.error('You have already checked in for this time slot.');
        } else {
          toast.error(response.message || 'Failed to mark attendance.');
        }
      }
    } catch (error: any) {
      console.error('Error scanning QR code:', error);
      toast.error('Failed to scan QR code. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleReserve = async (slot: TimeSlot) => {
    try {
      setReserving((prev) => ({ ...prev, [slot.id]: true }));
      const today = new Date().toISOString().split('T')[0];
      
      const response = await swimmingService.joinWaitlist(slot.id, today);
      
      if (response.success) {
        toast.success(
          response.message || `Reserved slot ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
        );
        setUserReservations((prev) => new Set(prev).add(slot.id));
        fetchTimeSlots(); // Refresh to update counts
      } else {
        toast.error(response.message || 'Failed to reserve slot.');
      }
    } catch (error: any) {
      console.error('Error reserving slot:', error);
      toast.error('Failed to reserve slot. Please try again.');
    } finally {
      setReserving((prev) => ({ ...prev, [slot.id]: false }));
    }
  };

  const handleCancelReservation = async (slot: TimeSlot) => {
    try {
      setReserving((prev) => ({ ...prev, [slot.id]: true }));
      const today = new Date().toISOString().split('T')[0];
      
      const response = await swimmingService.leaveWaitlist(slot.id, today);
      
      if (response.success) {
        toast.success('Reservation cancelled successfully.');
        setUserReservations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(slot.id);
          return newSet;
        });
        fetchTimeSlots();
      } else {
        toast.error(response.message || 'Failed to cancel reservation.');
      }
    } catch (error: any) {
      console.error('Error cancelling reservation:', error);
      toast.error('Failed to cancel reservation. Please try again.');
    } finally {
      setReserving((prev) => ({ ...prev, [slot.id]: false }));
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (start: string, end: string): string => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const isSlotFull = (slot: TimeSlot): boolean => {
    return slot.availableSpots <= 0;
  };

  const isCurrentSlot = (slot: TimeSlot): boolean => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
    return currentTime >= slot.start_time && currentTime <= slot.end_time;
  };

  const getSlotStatus = (slot: TimeSlot): 'available' | 'full' | 'current' => {
    if (isCurrentSlot(slot)) return 'current';
    if (isSlotFull(slot)) return 'full';
    return 'available';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-[#023E8A] mb-2">Swimming Pool</h2>
        <p className="text-muted-foreground">
          Manage your swimming sessions and view available time slots
        </p>
      </div>

      {/* QR Scanner Card */}
      <div className="animate-in slide-in-from-top duration-500">
        <QRScanner onScan={handleQRScan} isScanning={scanning} />
      </div>

      {/* Time Slots Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-[#023E8A] flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Available Time Slots - Today
          </h3>
          <Button
            onClick={fetchTimeSlots}
            variant="outline"
            size="sm"
            className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
          >
            Refresh
          </Button>
        </div>

        {timeSlots.length === 0 ? (
          <Card className="border border-[#E2F5FB]">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No time slots available for today.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map((slot, index) => {
              const status = getSlotStatus(slot);
              const isReserved = userReservations.has(slot.id);
              const isReserving = reserving[slot.id] || false;

              return (
                <Card
                  key={slot.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg border ${
                    status === 'current'
                      ? 'border-[#0077B6] bg-gradient-to-br from-blue-50 to-blue-100/50'
                      : 'border-[#E2F5FB]'
                  } animate-in slide-in-from-bottom duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-[#023E8A] flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#0077B6]" />
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </CardTitle>
                      {status === 'current' && (
                        <Badge className="bg-[#0077B6] text-white animate-pulse">
                          Current
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Capacity Info */}
                    <div className="flex items-center justify-between p-3 bg-[#F8FDFF] rounded-lg border border-[#E2F5FB]">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-[#0077B6]" />
                        <span className="text-[#023E8A] font-medium">Capacity</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-semibold ${
                            isSlotFull(slot)
                              ? 'text-red-600'
                              : slot.availableSpots <= 3
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {slot.currentCount}/{slot.max_capacity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({slot.availableSpots} available)
                        </span>
                      </div>
                    </div>

                    {/* Gender Restriction */}
                    {slot.gender_restriction && slot.gender_restriction !== 'mixed' && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Restriction:</span>{' '}
                        {slot.gender_restriction
                          .split('_')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </div>
                    )}

                    {/* Trainer Info */}
                    {slot.trainer && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Trainer:</span> {slot.trainer.name}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isSlotFull(slot) ? (
                        <Badge variant="destructive" className="w-full justify-center">
                          <XCircle className="w-3 h-3 mr-1" />
                          Full
                        </Badge>
                      ) : (
                        <Badge
                          className={`w-full justify-center ${
                            status === 'current'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() =>
                        isReserved
                          ? handleCancelReservation(slot)
                          : handleReserve(slot)
                      }
                      disabled={isReserving || (isSlotFull(slot) && !isReserved)}
                      className={`w-full transition-all duration-300 ${
                        isReserved
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-[#0077B6] hover:bg-[#005885] text-white'
                      }`}
                    >
                      {isReserving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isReserved ? 'Cancelling...' : 'Reserving...'}
                        </>
                      ) : isReserved ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Reservation
                        </>
                      ) : isSlotFull(slot) ? (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Join Waitlist
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Reserve Slot
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwimmingRoute;

