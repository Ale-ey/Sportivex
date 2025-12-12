import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGym } from '@/hooks/useGym';
import { gymService, type GymRegistrationStatus } from '@/services/gymService';
import toast from 'react-hot-toast';
import {
  Play,
  Square,
  Plus,
  Trash2,
  Flame,
  Target,
  TrendingUp,
  Clock,
  Dumbbell,
  Loader2,
  Search,
  CheckCircle2,
  BarChart3,
  Lock,
  CreditCard,
} from 'lucide-react';
import type { Exercise, WorkoutExercise } from '@/services/gymService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const GymRoute: React.FC = () => {
  const {
    exercises,
    activeWorkout,
    workoutHistory,
    progress,
    progressPeriod,
    stats,
    goals,
    loadingExercises,
    loadingWorkout,
    loadingProgress,
    loadingStats,
    loadingGoals,
    fetchExercises,
    startWorkout,
    saveWorkout,
    finishWorkout,
    fetchActiveWorkout,
    fetchWorkoutHistory,
    fetchProgress,
    fetchStats,
    fetchGoals,
    saveGoal,

  } = useGym();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goalForm, setGoalForm] = useState({
    goal_type: 'calories_per_day' as const,
    target_value: 500,
    unit: 'calories',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: '',
  });
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'exercises' | 'workout' | 'progress' | 'goals' | null;
  const [activeTab, setActiveTab] = useState<'exercises' | 'workout' | 'progress' | 'goals'>(
    tabParam && ['exercises', 'workout', 'progress', 'goals'].includes(tabParam) ? tabParam : 'exercises'
  );
  
  // Gym registration state
  const [registrationStatus, setRegistrationStatus] = useState<GymRegistrationStatus | null>(null);
  const [loadingRegistration, setLoadingRegistration] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Check registration status on mount and handle payment verification
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        setLoadingRegistration(true);
        const response = await gymService.checkRegistrationStatus();
        if (response.success) {
          setRegistrationStatus(response.data);
        }
      } catch (error: any) {
        // Handle 402 Payment Required gracefully
        if (error.response?.status === 402 || error.response?.data?.code === 'GYM_REGISTRATION_REQUIRED') {
          setRegistrationStatus({
            success: false,
            isRegistered: error.response.data.requiresRegistration === false,
            isActive: false,
            isPaymentDue: error.response.data.requiresPayment || false,
            message: error.response.data.message || 'Gym registration is required',
            registration: error.response.data.registration || null
          });
        } else {
          console.error('Error checking gym registration:', error);
        }
      } finally {
        setLoadingRegistration(false);
      }
    };
    checkRegistration();
  }, []);

  // Handle payment verification when returning from Stripe
  useEffect(() => {
    const verifyPayment = async () => {
      const payment = searchParams.get('payment');
      const registrationId = searchParams.get('registrationId');
      const paymentId = searchParams.get('paymentId');
      // Stripe redirects with session_id in the URL
      const sessionId = searchParams.get('session_id');

      if (payment === 'success') {
        try {
          // If we have session_id, use it directly
          if (sessionId) {
            if (registrationId) {
              // Verify registration payment
              const result = await gymService.verifyRegistrationPayment(registrationId, sessionId);
              if (result.success) {
                toast.success('Registration payment verified!');
              } else {
                toast.error(result.message || 'Payment verification failed');
              }
            } else if (paymentId) {
              // Verify monthly payment
              const result = await gymService.verifyMonthlyPayment(paymentId, sessionId);
              if (result.success) {
                toast.success('Monthly payment verified!');
              } else {
                toast.error(result.message || 'Payment verification failed');
              }
            }
          } else {
            // If no session_id in URL, try to get it from registration
            if (registrationId) {
              const regResponse = await gymService.getRegistration();
              if (regResponse.success && regResponse.data.registration?.stripe_session_id) {
                const result = await gymService.verifyRegistrationPayment(
                  registrationId, 
                  regResponse.data.registration.stripe_session_id
                );
                if (result.success) {
                  toast.success('Registration payment verified!');
                } else {
                  toast.error(result.message || 'Payment verification failed');
                }
              } else {
                toast.error('Payment session not found. Please try again.');
              }
            } else {
              toast.error('Payment session ID not found');
            }
          }
          
          // Refresh registration status after a short delay
          setTimeout(async () => {
            const statusResponse = await gymService.checkRegistrationStatus();
            if (statusResponse.success) {
              setRegistrationStatus(statusResponse.data);
            }
          }, 1000);
          
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch (error: any) {
          console.error('Payment verification error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
          toast.error(errorMessage);
          
          // Still refresh status in case payment went through
          setTimeout(async () => {
            const statusResponse = await gymService.checkRegistrationStatus();
            if (statusResponse.success) {
              setRegistrationStatus(statusResponse.data);
            }
          }, 2000);
        }
      } else if (payment === 'cancelled') {
        toast.error('Payment was cancelled');
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    verifyPayment();
  }, [searchParams]);

  // Only fetch protected data if registration is active
  useEffect(() => {
    if (registrationStatus?.isActive) {
      fetchExercises();
      fetchActiveWorkout();
      fetchStats();
      fetchGoals();
      fetchProgress('week');
    } else {
      // Still fetch exercises (they're public)
      fetchExercises();
    }
  }, [registrationStatus?.isActive]);

  useEffect(() => {
    if (tabParam && ['exercises', 'workout', 'progress', 'goals'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (activeWorkout) {
      // Convert workout logs to workout exercises format
      const exercises: WorkoutExercise[] =
        activeWorkout.logs?.map((log) => ({
          exerciseId: log.exercise_id,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight,
          duration: log.duration_minutes,
        })) || [];
      setWorkoutExercises(exercises);
    }
  }, [activeWorkout]);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBodyPart = !selectedBodyPart || exercise.body_part === selectedBodyPart;
    return matchesSearch && matchesBodyPart;
  });

  const bodyParts = Array.from(new Set(exercises.map((e) => e.body_part).filter(Boolean)));

  const handleStartWorkout = async () => {
    const result = await startWorkout();
    if (result.success) {
      setActiveTab('workout');
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const workoutExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      sets: exercise.sets || 3,
      reps: exercise.repetitions || 12,
      weight: undefined,
      duration: 5, // Default 5 minutes
    };
    setWorkoutExercises([...workoutExercises, workoutExercise]);
    setShowExerciseDialog(false);
  };

  const handleUpdateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    const updated = [...workoutExercises];
    updated[index] = { ...updated[index], ...updates };
    setWorkoutExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const handleSaveWorkout = async () => {
    if (workoutExercises.length === 0) {
      alert('Please add at least one exercise to your workout');
      return;
    }
    const result = await saveWorkout(workoutExercises);
    if (result.success) {
      await fetchStats();
      await fetchProgress('week');
      await fetchWorkoutHistory();
      setWorkoutExercises([]);
      setActiveTab('progress');
    }
  };

  const handleFinishWorkout = async () => {
    if (workoutExercises.length > 0) {
      await handleSaveWorkout();
    }
    await finishWorkout('completed');
    setWorkoutExercises([]);
    setActiveTab('progress');
  };

  const handleSaveGoal = async () => {
    // Prepare goal data without user_id (backend will add it)
    const goalData = {
      goal_type: goalForm.goal_type,
      target_value: goalForm.target_value,
      unit: goalForm.unit || null,
      start_date: goalForm.start_date,
      end_date: goalForm.end_date && goalForm.end_date !== '' ? goalForm.end_date : undefined,
      description: goalForm.description || undefined,
      is_active: true,
    };
    
    const result = await saveGoal(goalData as any);
    if (result.success) {
      setShowGoalDialog(false);
      setGoalForm({
        goal_type: 'calories_per_day',
        target_value: 500,
        unit: 'calories',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        description: '',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRegister = async () => {
    try {
      setProcessingPayment(true);
      const response = await gymService.createRegistration();
      if (response.success && response.data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkoutUrl;
      } else if (response.success && !response.data.requiresPayment) {
        // Free registration
        toast.success('Registration successful!');
        // Refresh registration status
        const statusResponse = await gymService.checkRegistrationStatus();
        if (statusResponse.success) {
          setRegistrationStatus(statusResponse.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create registration');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayMonthly = async () => {
    if (!registrationStatus?.registration?.id) return;
    try {
      setProcessingPayment(true);
      const response = await gymService.createMonthlyPayment(registrationStatus.registration.id);
      if (response.success && response.data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Show registration/payment UI if not active
  if (loadingRegistration) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#023E8A]" />
      </div>
    );
  }

  if (!registrationStatus?.isActive) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-[#023E8A] mb-2">Gym & Fitness</h2>
          <p className="text-muted-foreground">Track your workouts, monitor progress, and achieve your fitness goals</p>
        </div>

        {/* Registration Required Card */}
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#023E8A] mb-2">
                  {registrationStatus?.isPaymentDue ? 'Monthly Payment Required' : 'Gym Registration Required'}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {registrationStatus?.message || 
                    (registrationStatus?.isPaymentDue 
                      ? 'Your monthly gym membership payment is due. Please complete the payment to continue using gym facilities.'
                      : 'To access gym features, you need to register and pay the monthly fee of 2000 PKR.')}
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                {!registrationStatus?.isRegistered ? (
                  <Button
                    onClick={handleRegister}
                    disabled={processingPayment}
                    size="lg"
                    className="bg-[#023E8A] hover:bg-[#023E8A]/90"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Register & Pay (2000 PKR)
                      </>
                    )}
                  </Button>
                ) : registrationStatus?.isPaymentDue ? (
                  <Button
                    onClick={handlePayMonthly}
                    disabled={processingPayment}
                    size="lg"
                    className="bg-[#023E8A] hover:bg-[#023E8A]/90"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Monthly Fee (2000 PKR)
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
              {registrationStatus?.registration?.next_payment_date && (
                <p className="text-sm text-muted-foreground mt-2">
                  Next payment due: {new Date(registrationStatus.registration.next_payment_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exercises Preview (Public) */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Exercise Library (Preview)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.slice(0, 6).map((exercise) => (
              <Card key={exercise.id}>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{exercise.name}</h4>
                  <p className="text-sm text-muted-foreground">{exercise.body_part}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#023E8A] mb-2">Gym & Fitness</h2>
        <p className="text-muted-foreground">Track your workouts, monitor progress, and achieve your fitness goals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Calories</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.todayCalories || 0}
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalWorkouts || 0}
                </p>
              </div>
              <Dumbbell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Week Calories</p>
                <p className="text-2xl font-bold text-green-600">
                  {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.weekCalories || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loadingGoals ? <Loader2 className="w-5 h-5 animate-spin" /> : goals.length}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'exercises' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('exercises')}
          className="rounded-b-none"
        >
          <Dumbbell className="w-4 h-4 mr-2" />
          Exercises
        </Button>
        <Button
          variant={activeTab === 'workout' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('workout')}
          className="rounded-b-none"
        >
          <Play className="w-4 h-4 mr-2" />
          Workout
        </Button>
        <Button
          variant={activeTab === 'progress' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('progress')}
          className="rounded-b-none"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Progress
        </Button>
        <Button
          variant={activeTab === 'goals' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('goals')}
          className="rounded-b-none"
        >
          <Target className="w-4 h-4 mr-2" />
          Goals
        </Button>
      </div>

      {/* Exercises Tab */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedBodyPart}
                onChange={(e) => setSelectedBodyPart(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Body Parts</option>
                {bodyParts.map((part) => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercises Grid */}
          {loadingExercises ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <Badge variant="outline">{exercise.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{exercise.description}</p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {exercise.body_part && <Badge variant="secondary">{exercise.body_part}</Badge>}
                      {exercise.equipment && <Badge variant="secondary">{exercise.equipment}</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedExercise(exercise);
                          setShowExerciseDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                      {activeWorkout && (
                        <Button
                          size="sm"
                          onClick={() => handleAddExercise(exercise)}
                          className="flex-1"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Workout
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Workout Tab */}
      {activeTab === 'workout' && (
        <div className="space-y-4">
          {!activeWorkout ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Active Workout</h3>
                <p className="text-muted-foreground mb-4">Start a new workout session to begin tracking your exercises</p>
                <Button onClick={handleStartWorkout} size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Workout</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Started: {formatTime(activeWorkout.start_time)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workoutExercises.map((workoutEx, index) => {
                      const exercise = exercises.find((e) => e.id === workoutEx.exerciseId);
                      return (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{exercise?.name || 'Unknown Exercise'}</h4>
                              <p className="text-sm text-muted-foreground">{exercise?.body_part}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveExercise(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                              <Label className="text-xs">Sets</Label>
                              <Input
                                type="number"
                                value={workoutEx.sets}
                                onChange={(e) =>
                                  handleUpdateExercise(index, { sets: parseInt(e.target.value) || 0 })
                                }
                                min="1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Reps</Label>
                              <Input
                                type="number"
                                value={workoutEx.reps}
                                onChange={(e) =>
                                  handleUpdateExercise(index, { reps: parseInt(e.target.value) || 0 })
                                }
                                min="1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Weight (kg)</Label>
                              <Input
                                type="number"
                                value={workoutEx.weight || ''}
                                onChange={(e) =>
                                  handleUpdateExercise(index, {
                                    weight: e.target.value ? parseFloat(e.target.value) : undefined,
                                  })
                                }
                                step="0.5"
                                placeholder="Optional"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Duration (min)</Label>
                              <Input
                                type="number"
                                value={workoutEx.duration}
                                onChange={(e) =>
                                  handleUpdateExercise(index, { duration: parseFloat(e.target.value) || 0 })
                                }
                                min="1"
                                step="0.5"
                              />
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Exercise
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Select Exercise</DialogTitle>
                          <DialogDescription>Choose an exercise to add to your workout</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                          {exercises.map((exercise) => (
                            <Button
                              key={exercise.id}
                              variant="outline"
                              className="h-auto p-4 flex flex-col items-start"
                              onClick={() => handleAddExercise(exercise)}
                            >
                              <span className="font-semibold">{exercise.name}</span>
                              <span className="text-xs text-muted-foreground">{exercise.body_part}</span>
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveWorkout} className="flex-1" disabled={workoutExercises.length === 0}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save Progress
                      </Button>
                      <Button onClick={handleFinishWorkout} variant="default" className="flex-1">
                        <Square className="w-4 h-4 mr-2" />
                        Finish Workout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={progressPeriod === 'day' ? 'default' : 'outline'}
              onClick={() => fetchProgress('day')}
            >
              Day
            </Button>
            <Button
              variant={progressPeriod === 'week' ? 'default' : 'outline'}
              onClick={() => fetchProgress('week')}
            >
              Week
            </Button>
            <Button
              variant={progressPeriod === 'month' ? 'default' : 'outline'}
              onClick={() => fetchProgress('month')}
            >
              Month
            </Button>
          </div>

          {loadingProgress ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : progress.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No progress data available</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Workout Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{formatDate(day.workout_date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {day.total_exercises} exercises • {day.total_duration_minutes} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-600">{day.total_calories}</p>
                        <p className="text-xs text-muted-foreground">calories</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workout History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingWorkout ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : workoutHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No workout history</p>
              ) : (
                <div className="space-y-3">
                  {workoutHistory.slice(0, 10).map((workout) => (
                    <div key={workout.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{formatDate(workout.workout_date)}</p>
                          <p className="text-sm text-muted-foreground">
                            {workout.total_exercises} exercises • {workout.total_duration_minutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">{workout.total_calories}</p>
                          <p className="text-xs text-muted-foreground">calories</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Your Goals</h3>
            <Button onClick={() => setShowGoalDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {loadingGoals ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No goals set. Create one to start tracking your progress!</p>
                <Button onClick={() => setShowGoalDialog(true)}>Create Goal</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.goal_type.replace(/_/g, ' ')}</CardTitle>
                      <Badge variant={goal.is_active ? 'default' : 'secondary'}>
                        {goal.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Target</span>
                        <span className="font-semibold">
                          {goal.target_value} {goal.unit || ''}
                        </span>
                      </div>
                      {goal.current_value !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current</span>
                          <span className="font-semibold">
                            {goal.current_value} {goal.unit || ''}
                          </span>
                        </div>
                      )}
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-2">{goal.description}</p>
                      )}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Start: {formatDate(goal.start_date)}
                        </p>
                        {goal.end_date && (
                          <p className="text-xs text-muted-foreground">
                            End: {formatDate(goal.end_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Goal Dialog */}
          <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>Set a fitness goal to track your progress</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Goal Type</Label>
                  <select
                    value={goalForm.goal_type}
                    onChange={(e) =>
                      setGoalForm({ ...goalForm, goal_type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="calories_per_day">Calories per Day</option>
                    <option value="calories_per_week">Calories per Week</option>
                    <option value="workouts_per_week">Workouts per Week</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="strength">Strength</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    value={goalForm.target_value}
                    onChange={(e) =>
                      setGoalForm({ ...goalForm, target_value: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                    placeholder="e.g., calories, kg, workouts"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={goalForm.start_date}
                    onChange={(e) => setGoalForm({ ...goalForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={goalForm.end_date}
                    onChange={(e) => setGoalForm({ ...goalForm, end_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    placeholder="Add a description for your goal..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveGoal} className="flex-1">
                    Save Goal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowGoalDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Exercise Details Dialog */}
      {selectedExercise && (
        <Dialog open={showExerciseDialog && !!selectedExercise} onOpenChange={setShowExerciseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedExercise.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedExercise.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>
                </div>
              )}
              {selectedExercise.instructions && (
                <div>
                  <Label>Instructions</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedExercise.instructions}
                  </p>
                </div>
              )}
              {selectedExercise.tips && (
                <div>
                  <Label>Tips</Label>
                  <p className="text-sm text-muted-foreground">{selectedExercise.tips}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Body Part</Label>
                  <p className="text-sm">{selectedExercise.body_part || 'N/A'}</p>
                </div>
                <div>
                  <Label>Equipment</Label>
                  <p className="text-sm">{selectedExercise.equipment || 'N/A'}</p>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <p className="text-sm">{selectedExercise.difficulty}</p>
                </div>
                <div>
                  <Label>MET Value</Label>
                  <p className="text-sm">{selectedExercise.met_value}</p>
                </div>
              </div>
              {activeWorkout && (
                <Button onClick={() => handleAddExercise(selectedExercise)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Workout
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GymRoute;

