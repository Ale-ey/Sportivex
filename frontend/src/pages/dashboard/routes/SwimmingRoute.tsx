import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QRScanner from '@/components/QRScanner';
import { useSwimming } from '@/hooks/useSwimming';
import {
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  History,
  BookOpen,
} from 'lucide-react';
import type { TimeSlot } from '@/services/swimmingService';

const SwimmingRoute: React.FC = () => {
  const {
    timeSlots,
    loadingTimeSlots,
    attendanceHistory,
    loadingHistory,
    rules,
    loadingRules,
    fetchTimeSlots,
    scanQRCode,
    joinWaitlist,
    leaveWaitlist,
    fetchUserHistory,
    fetchRules,
    isUserOnWaitlist,
    getUserWaitlistPosition,
    formatTimeRange,
    isSlotFull,
    isPastSlot,
    getSlotStatus,
    canReserveSlot,
  } = useSwimming();

  const [scanning, setScanning] = useState(false);
  const [reserving, setReserving] = useState<Record<string, boolean>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    // Fetch initial data - try without filter first, then with active filter
    const loadData = async () => {
      // First try to fetch all slots (no filter) to see if any exist
      const allSlotsResult = await fetchTimeSlots();
      
      // If no slots found, try with active filter
      if (allSlotsResult.success && allSlotsResult.data?.timeSlots.length === 0) {
        console.log('No slots found without filter, trying with active=true');
        await fetchTimeSlots({ active: true });
      }
      
      await fetchRules();
    };
    
    loadData();
    
    // Refresh time slots every 30 seconds to update capacity
    const interval = setInterval(() => {
      fetchTimeSlots({ active: true });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchTimeSlots, fetchRules]);

  const handleQRScan = async (qrCode: string) => {
    try {
      setScanning(true);
      await scanQRCode(qrCode);
      // Time slots will be refreshed automatically by the hook
    } catch (error) {
      console.error('Error scanning QR code:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleReserve = async (slot: TimeSlot) => {
    try {
      setReserving((prev) => ({ ...prev, [slot.id]: true }));
      const today = new Date().toISOString().split('T')[0];
      
      if (isUserOnWaitlist(slot.id)) {
        await leaveWaitlist(slot.id, today);
      } else {
        await joinWaitlist(slot.id, today);
      }
    } catch (error) {
      console.error('Error managing reservation:', error);
    } finally {
      setReserving((prev) => ({ ...prev, [slot.id]: false }));
    }
  };

  const handleViewHistory = async () => {
    if (!showHistory && attendanceHistory.length === 0) {
      await fetchUserHistory(50);
    }
    setShowHistory(!showHistory);
  };

  if (loadingTimeSlots && timeSlots.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077B6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#023E8A] mb-2">Swimming Pool</h2>
        <p className="text-muted-foreground">
          Manage your swimming sessions and view available time slots
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleViewHistory}
          variant="outline"
          className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Hide' : 'View'} History
        </Button>
        <Button
          onClick={() => {
            setShowRules(!showRules);
          }}
          variant="outline"
          className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          {showRules ? 'Hide' : 'View'} Rules
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchTimeSlots({ active: true })}
            variant="outline"
            size="sm"
            className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
            disabled={loadingTimeSlots}
          >
            {loadingTimeSlots ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Refresh
          </Button>
          <Button
            onClick={() => fetchTimeSlots()}
            variant="outline"
            size="sm"
            className="border-[#ADE8F4] text-[#0077B6] hover:bg-[#EAF7FD]"
            disabled={loadingTimeSlots}
            title="Fetch all slots (including inactive)"
          >
            All Slots
          </Button>
        </div>
      </div>

      {/* Rules Section */}
      {showRules && (
        <Card className="border border-[#E2F5FB]">
          <CardHeader>
            <CardTitle className="text-xl text-[#023E8A] flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Pool Rules & Regulations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRules ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#0077B6]" />
              </div>
            ) : rules.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No rules available
              </p>
            ) : (
              <div className="space-y-4">
                {rules
                  .filter((rule) => rule.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 bg-[#F8FDFF] rounded-lg border border-[#E2F5FB]"
                    >
                      <h4 className="font-semibold text-[#023E8A] mb-2">
                        {rule.title}
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {rule.content}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance History Section */}
      {showHistory && (
        <Card className="border border-[#E2F5FB]">
          <CardHeader>
            <CardTitle className="text-xl text-[#023E8A] flex items-center gap-2">
              <History className="w-5 h-5" />
              Your Attendance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#0077B6]" />
              </div>
            ) : attendanceHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No attendance history found
              </p>
            ) : (
              <div className="space-y-3">
                {attendanceHistory.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-[#F8FDFF] rounded-lg border border-[#E2F5FB]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#023E8A]">
                          {record.time_slot
                            ? `${formatTimeRange(
                                record.time_slot.start_time,
                                record.time_slot.end_time
                              )}`
                            : 'Time slot not available'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.check_in_time).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        className={
                          record.check_in_method === 'qr_scan'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }
                      >
                        {record.check_in_method === 'qr_scan'
                          ? 'QR Scan'
                          : 'Manual'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
        </div>

        {timeSlots.length === 0 ? (
          <Card className="border border-[#E2F5FB]">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No time slots available for today.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map((slot, index) => {
              const status = getSlotStatus(slot);
              const isReserved = isUserOnWaitlist(slot.id);
              const waitlistPosition = getUserWaitlistPosition(slot.id);
              const isReserving = reserving[slot.id] || false;
              const canReserve = canReserveSlot(slot);
              const isPast = isPastSlot(slot);

              return (
                <Card
                  key={slot.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg border ${
                    status === 'current'
                      ? 'border-[#0077B6] bg-gradient-to-br from-blue-50 to-blue-100/50'
                      : status === 'ended'
                      ? 'border-gray-300 bg-gray-50 opacity-75'
                      : 'border-[#E2F5FB]'
                  } animate-in slide-in-from-bottom duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${
                        status === 'ended' ? 'text-gray-500' : 'text-[#023E8A]'
                      }`}>
                        <Clock className={`w-5 h-5 ${
                          status === 'ended' ? 'text-gray-400' : 'text-[#0077B6]'
                        }`} />
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </CardTitle>
                      {status === 'current' && (
                        <Badge className="bg-[#0077B6] text-white animate-pulse">
                          Current
                        </Badge>
                      )}
                      {status === 'ended' && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                          Ended
                        </Badge>
                      )}
                      {status === 'upcoming' && (
                        <Badge className="bg-blue-100 text-blue-700">
                          Upcoming
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
                              : (slot.availableSpots || 0) <= 3
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {slot.currentCount || 0}/{slot.max_capacity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({(slot.availableSpots || 0)} available)
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

                    {/* Waitlist Position */}
                    {isReserved && waitlistPosition && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 font-medium">
                          Waitlist Position: #{waitlistPosition}
                        </p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isPast ? (
                        <Badge variant="outline" className="w-full justify-center bg-gray-100 text-gray-600 border-gray-300">
                          <XCircle className="w-3 h-3 mr-1" />
                          Slot Ended
                        </Badge>
                      ) : isSlotFull(slot) ? (
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
                      onClick={() => handleReserve(slot)}
                      disabled={isReserving || isPast || !canReserve}
                      className={`w-full transition-all duration-300 ${
                        isPast
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isReserved
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-[#0077B6] hover:bg-[#005885] text-white'
                      }`}
                    >
                      {isReserving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isReserved ? 'Cancelling...' : 'Reserving...'}
                        </>
                      ) : isPast ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Slot Ended
                        </>
                      ) : isReserved ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Leave Waitlist
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
