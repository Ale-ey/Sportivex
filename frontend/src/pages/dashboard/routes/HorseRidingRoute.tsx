import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  Users,
  Loader2,
  BookOpen,
  ShoppingCart,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useHorseRiding } from '@/hooks/useHorseRiding';
import { horseRidingService } from '@/services/horseRidingService';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const HorseRidingRoute: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    timeSlots,
    rules,
    equipment,
    registration,
    purchases,
    loadingSlots,
    loadingRules,
    loadingEquipment,
    loadingRegistration,
    loadingPurchases,
    fetchTimeSlots,
    fetchRules,
    fetchEquipment,
    fetchRegistration,
    fetchPurchases,
    createRegistration,
    verifyRegistrationPayment,
    createEquipmentPurchase,
    verifyEquipmentPurchasePayment,
  } = useHorseRiding();

  const [showRules, setShowRules] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [purchasingEquipmentId, setPurchasingEquipmentId] = useState<string | null>(null);

  // Check for payment success callback
  useEffect(() => {
    const payment = searchParams.get('payment');
    const registrationId = searchParams.get('registrationId');
    const purchaseId = searchParams.get('purchaseId');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success') {
      // Stripe redirects with session_id in query params (Stripe adds it automatically)
      const stripeSessionId = searchParams.get('session_id') || sessionId;
      
      if (registrationId) {
        // Verify registration payment
        if (stripeSessionId) {
          verifyRegistrationPayment({
            registrationId,
            sessionId: stripeSessionId,
          })
            .then(() => {
              fetchRegistration();
              setSearchParams({});
            })
            .catch(() => {
              // Error handled in hook
            });
        } else {
          // If no session_id, try to verify using the registration's stored session_id
          if (registration?.stripe_session_id) {
            verifyRegistrationPayment({
              registrationId,
              sessionId: registration.stripe_session_id,
            })
              .then(() => {
                fetchRegistration();
                setSearchParams({});
              })
              .catch(() => {
                // Error handled in hook
              });
          } else {
            toast.error('Payment session not found. Please contact support.');
            setSearchParams({});
          }
        }
      } else if (purchaseId && stripeSessionId) {
        // Verify equipment purchase payment
        verifyEquipmentPurchasePayment({
          purchaseId,
          sessionId: stripeSessionId,
        })
          .then(() => {
            fetchEquipment();
            fetchPurchases(); // Refresh purchases to show updated status
            setSearchParams({});
          })
          .catch(() => {
            // Error handled in hook
          });
      }
    } else if (payment === 'cancelled') {
      toast.error('Payment was cancelled');
      setSearchParams({});
    }
  }, [searchParams, verifyRegistrationPayment, verifyEquipmentPurchasePayment, fetchRegistration, fetchEquipment, setSearchParams, registration]);

  // Auto-verify payment if registration is pending with session ID
  useEffect(() => {
    const verifyPendingPayment = async () => {
      if (!registration || registration.status !== 'pending' || !registration.stripe_session_id) {
        return;
      }

      // Only verify if payment_status is pending
      if (registration.payment_status === 'pending' || registration.payment_status === 'processing') {
        try {
          console.log('Auto-verifying payment for registration:', registration.id);
          await verifyRegistrationPayment({
            registrationId: registration.id,
            sessionId: registration.stripe_session_id,
          });
          // Refresh registration after verification
          setTimeout(() => {
            fetchRegistration();
          }, 1000);
        } catch (error) {
          // Payment might not be completed yet, that's okay
          console.log('Payment verification failed:', error);
        }
      }
    };

    if (registration) {
      verifyPendingPayment();
    }
  }, [registration?.id, registration?.stripe_session_id, registration?.status, registration?.payment_status, verifyRegistrationPayment, fetchRegistration]);

  useEffect(() => {
    fetchTimeSlots({ active: true });
    fetchRules();
    fetchEquipment();
    fetchRegistration();
    fetchPurchases();
  }, [fetchTimeSlots, fetchRules, fetchEquipment, fetchRegistration, fetchPurchases]);

  // Auto-verify pending purchases with session IDs
  useEffect(() => {
    const verifyPendingPurchases = async () => {
      if (purchases.length === 0) return;

      const pendingPurchases = purchases.filter(
        (purchase) =>
          purchase.payment_status === 'pending' &&
          purchase.stripe_session_id &&
          purchase.status === 'pending'
      );

      for (const purchase of pendingPurchases) {
        try {
          console.log('Auto-verifying purchase:', purchase.id, 'with session:', purchase.stripe_session_id);
          if (purchase.stripe_session_id) {
            await verifyEquipmentPurchasePayment({
              purchaseId: purchase.id,
              sessionId: purchase.stripe_session_id,
            });
          }
          // Refresh purchases after successful verification
          setTimeout(() => {
            fetchPurchases();
          }, 500);
        } catch (error) {
          // Payment might not be completed yet, that's okay
          console.log('Payment verification failed for purchase:', purchase.id, error);
        }
      }
    };

    if (purchases.length > 0) {
      verifyPendingPurchases();
    }
  }, [purchases, verifyEquipmentPurchasePayment]);

  const handleRegister = async () => {
    try {
      // Don't pass registration_fee - let backend handle it (will require payment if fee > 0)
      await createRegistration();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePurchaseEquipment = async (equipmentId: string) => {
    setPurchasingEquipmentId(equipmentId);
    try {
      await createEquipmentPurchase({
        equipment_id: equipmentId,
        quantity: 1,
      });
      // The hook will redirect to Stripe, so we don't need to do anything here
    } catch (error) {
      // Error handled in hook
    } finally {
      setPurchasingEquipmentId(null);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDayOfWeek = (day: number | null) => {
    if (day === null) return 'All Days';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  // Check if equipment is purchased and paid
  const isEquipmentPurchased = (equipmentId: string) => {
    return purchases.some(
      (purchase) =>
        purchase.equipment_id === equipmentId &&
        (purchase.payment_status === 'succeeded' || 
         purchase.status === 'paid' || 
         purchase.status === 'fulfilled')
    );
  };

  // Get pending purchase for equipment (if any)
  const getPendingPurchase = (equipmentId: string) => {
    return purchases.find(
      (purchase) =>
        purchase.equipment_id === equipmentId &&
        purchase.payment_status === 'pending' &&
        purchase.stripe_session_id
    );
  };

  // Handle manual payment verification
  const handleVerifyPayment = async (purchaseId: string, sessionId: string) => {
    try {
      await verifyEquipmentPurchasePayment({
        purchaseId,
        sessionId,
      });
      fetchPurchases();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#023E8A] mb-2 flex items-center gap-2">
          <Activity className="w-8 h-8" />
          Horse Riding
        </h2>
        <p className="text-muted-foreground">
          View available time slots, rules, and equipment for horse riding
        </p>
      </div>

      {/* Registration Status */}
      {!registration ? (
        <Card className="border-2 border-[#023E8A]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Registration Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to register for horse riding before you can view time slots and enroll in sessions.
            </p>
            <Button onClick={handleRegister} disabled={loadingRegistration}>
              {loadingRegistration ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Register Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (registration.status === 'pending' || registration.payment_status === 'pending') ? (
        <Card className="border-2 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Payment Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your registration is pending payment. Please complete the payment to continue.
            </p>
            {registration.stripe_session_id && (
              <Button
                onClick={async () => {
                  try {
                    const response = await horseRidingService.getRegistrationCheckoutUrl(registration.id);
                    if (response.success && response.data.checkoutUrl) {
                      window.location.href = response.data.checkoutUrl;
                    } else {
                      toast.error('Failed to get payment link. Please try registering again.');
                    }
                  } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || 'Failed to get payment link';
                    toast.error(errorMessage);
                  }
                }}
              >
                Complete Payment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Registered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are registered for horse riding. You can now enroll in time slots.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setShowRules(true)}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          View Rules
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowEquipment(true)}
          className="flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          View Equipment
        </Button>
      </div>

      {/* Time Slots */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Available Time Slots</h3>
        </div>

        {loadingSlots ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : timeSlots.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No time slots available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeSlots.map((slot) => (
              <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </CardTitle>
                    <Badge variant={slot.is_active ? 'default' : 'secondary'}>
                      {slot.is_active ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Day</span>
                      <span className="font-medium">{formatDayOfWeek(slot.day_of_week)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Capacity
                      </span>
                      <span className="font-medium">{slot.max_capacity} riders</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>


      {/* Rules Dialog */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Horse Riding Rules & Regulations</DialogTitle>
            <DialogDescription>
              Please read and follow these rules for a safe and enjoyable experience
            </DialogDescription>
          </DialogHeader>
          {loadingRules ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : rules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No rules available.</p>
          ) : (
            <div className="space-y-4 mt-4">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{rule.title}</CardTitle>
                    {rule.category && (
                      <Badge variant="outline" className="w-fit">
                        {rule.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{rule.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Equipment Dialog */}
      <Dialog open={showEquipment} onOpenChange={setShowEquipment}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Horse Riding Equipment</DialogTitle>
            <DialogDescription>
              View available equipment and their prices
            </DialogDescription>
          </DialogHeader>
          {(loadingEquipment || loadingPurchases) ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : equipment.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No equipment available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {equipment.map((eq) => {
                const isPurchased = isEquipmentPurchased(eq.id);
                const pendingPurchase = getPendingPurchase(eq.id);
                return (
                <Card key={eq.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{eq.name}</CardTitle>
                      <Badge variant={eq.is_available ? 'default' : 'secondary'}>
                        {eq.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {eq.description && (
                        <p className="text-sm text-muted-foreground">{eq.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="text-xl font-bold text-[#023E8A]">
                          Rs. {eq.price.toLocaleString()}
                        </span>
                      </div>
                      {eq.stock_quantity !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Stock</span>
                          <span className="text-sm font-medium">{eq.stock_quantity}</span>
                        </div>
                      )}
                      {isPurchased ? (
                        <div className="w-full mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center justify-center gap-2 text-green-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-semibold">Paid</span>
                          </div>
                          <p className="text-xs text-green-600 text-center mt-1">
                            You can receive your equipment from the saddle club office
                          </p>
                        </div>
                      ) : pendingPurchase ? (
                        <div className="w-full mt-4 space-y-2">
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center justify-center gap-2 text-yellow-700 mb-1">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">Payment Pending</span>
                            </div>
                            <p className="text-xs text-yellow-600 text-center">
                              Complete your payment or verify if already paid
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => pendingPurchase.stripe_session_id && handleVerifyPayment(pendingPurchase.id, pendingPurchase.stripe_session_id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verify Payment
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full mt-4"
                          disabled={!eq.is_available || purchasingEquipmentId === eq.id}
                          onClick={() => handlePurchaseEquipment(eq.id)}
                        >
                          {purchasingEquipmentId === eq.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Purchase
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HorseRidingRoute;

