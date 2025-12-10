import { useCallback } from 'react';
import { horseRidingService } from '@/services/horseRidingService';
import { useHorseRidingStore } from '@/stores/horseRidingStore';
import toast from 'react-hot-toast';
import type {
  CreateTimeSlotRequest,
  UpdateTimeSlotRequest,
  CreateRuleRequest,
  UpdateRuleRequest,
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
  CreateRegistrationRequest,
  CreateEnrollmentRequest,
  CreateEquipmentPurchaseRequest,
  VerifyPaymentRequest,
} from '@/services/horseRidingService';

/**
 * Hook for user-facing horse riding operations
 */
export const useHorseRiding = () => {
  const {
    timeSlots,
    rules,
    equipment,
    registration,
    enrollments,
    purchases,
    loadingSlots,
    loadingRules,
    loadingEquipment,
    loadingRegistration,
    loadingEnrollments,
    loadingPurchases,
    setTimeSlots,
    setRules,
    setEquipment,
    setRegistration,
    setEnrollments,
    setPurchases,
    setLoadingSlots,
    setLoadingRules,
    setLoadingEquipment,
    setLoadingRegistration,
    setLoadingEnrollments,
    setLoadingPurchases,
    setSlotsError,
    setRulesError,
    setEquipmentError,
    setRegistrationError,
    setEnrollmentsError,
    setPurchasesError,
  } = useHorseRidingStore();

  // ==================== TIME SLOTS ====================

  const fetchTimeSlots = useCallback(async (filters?: { active?: boolean; day_of_week?: number }) => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const response = await horseRidingService.getTimeSlots(filters);
      if (response.success) {
        setTimeSlots(response.data.timeSlots);
      } else {
        throw new Error('Failed to fetch time slots');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch time slots';
      setSlotsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingSlots(false);
    }
  }, [setTimeSlots, setLoadingSlots, setSlotsError]);

  // ==================== RULES ====================

  const fetchRules = useCallback(async () => {
    setLoadingRules(true);
    setRulesError(null);
    try {
      console.log('Fetching rules from API...');
      const response = await horseRidingService.getRules();
      console.log('Rules API response:', response);
      if (response.success) {
        console.log('Setting rules:', response.data.rules?.length || 0);
        setRules(response.data.rules || []);
      } else {
        throw new Error('Failed to fetch rules');
      }
    } catch (error: any) {
      console.error('Error fetching rules:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch rules';
      setRulesError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingRules(false);
    }
  }, [setRules, setLoadingRules, setRulesError]);

  // ==================== EQUIPMENT ====================

  const fetchEquipment = useCallback(async () => {
    setLoadingEquipment(true);
    setEquipmentError(null);
    try {
      const response = await horseRidingService.getEquipment();
      if (response.success) {
        setEquipment(response.data.equipment);
      } else {
        throw new Error('Failed to fetch equipment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch equipment';
      setEquipmentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingEquipment(false);
    }
  }, [setEquipment, setLoadingEquipment, setEquipmentError]);

  // ==================== REGISTRATION ====================

  const fetchRegistration = useCallback(async () => {
    setLoadingRegistration(true);
    setRegistrationError(null);
    try {
      const response = await horseRidingService.getUserRegistration();
      if (response.success) {
        setRegistration(response.data.registration);
      } else {
        throw new Error('Failed to fetch registration');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch registration';
      setRegistrationError(errorMessage);
      // Don't show toast for 404 (no registration yet)
      if (error.response?.status !== 404) {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingRegistration(false);
    }
  }, [setRegistration, setLoadingRegistration, setRegistrationError]);

  const createRegistration = useCallback(async (data: CreateRegistrationRequest = {}) => {
    setLoadingRegistration(true);
    setRegistrationError(null);
    try {
      const response = await horseRidingService.createRegistration(data);
      if (response.success) {
        setRegistration(response.data.registration);
        if (response.data.requiresPayment && response.data.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = response.data.checkoutUrl;
        } else {
          toast.success('Registration created successfully!');
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create registration');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create registration';
      setRegistrationError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingRegistration(false);
    }
  }, [setRegistration, setLoadingRegistration, setRegistrationError]);

  const verifyRegistrationPayment = useCallback(async (data: VerifyPaymentRequest) => {
    setLoadingRegistration(true);
    setRegistrationError(null);
    try {
      const response = await horseRidingService.verifyRegistrationPayment(data);
      if (response.success) {
        setRegistration(response.data.registration);
        toast.success('Payment verified successfully!');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to verify payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify payment';
      setRegistrationError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingRegistration(false);
    }
  }, [setRegistration, setLoadingRegistration, setRegistrationError]);

  // ==================== ENROLLMENTS ====================

  const fetchEnrollments = useCallback(async (filters?: { status?: string; session_date?: string }) => {
    setLoadingEnrollments(true);
    setEnrollmentsError(null);
    try {
      const response = await horseRidingService.getUserEnrollments(filters);
      if (response.success) {
        setEnrollments(response.data.enrollments);
      } else {
        throw new Error('Failed to fetch enrollments');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch enrollments';
      setEnrollmentsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [setEnrollments, setLoadingEnrollments, setEnrollmentsError]);

  const createEnrollment = useCallback(async (data: CreateEnrollmentRequest) => {
    setLoadingEnrollments(true);
    setEnrollmentsError(null);
    try {
      const response = await horseRidingService.createEnrollment(data);
      if (response.success) {
        const { addEnrollment } = useHorseRidingStore.getState();
        addEnrollment(response.data.enrollment);
        toast.success('Enrolled successfully!');
        return response.data.enrollment;
      } else {
        throw new Error(response.message || 'Failed to create enrollment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create enrollment';
      setEnrollmentsError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingEnrollments(false);
    }
  }, [setEnrollmentsError, setLoadingEnrollments]);

  // ==================== EQUIPMENT PURCHASES ====================

  const fetchPurchases = useCallback(async () => {
    setLoadingPurchases(true);
    setPurchasesError(null);
    try {
      const response = await horseRidingService.getUserEquipmentPurchases();
      if (response.success) {
        setPurchases(response.data.purchases);
      } else {
        throw new Error('Failed to fetch purchases');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch purchases';
      setPurchasesError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingPurchases(false);
    }
  }, [setPurchases, setLoadingPurchases, setPurchasesError]);

  const createEquipmentPurchase = useCallback(async (data: CreateEquipmentPurchaseRequest) => {
    setLoadingPurchases(true);
    setPurchasesError(null);
    try {
      const response = await horseRidingService.createEquipmentPurchase(data);
      if (response.success) {
        if (response.data.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = response.data.checkoutUrl;
        } else {
          toast.success('Purchase created successfully!');
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create purchase');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create purchase';
      setPurchasesError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingPurchases(false);
    }
  }, [setPurchasesError, setLoadingPurchases]);

  const verifyEquipmentPurchasePayment = useCallback(async (data: VerifyPaymentRequest) => {
    setLoadingPurchases(true);
    setPurchasesError(null);
    try {
      const response = await horseRidingService.verifyEquipmentPurchasePayment(data);
      if (response.success) {
        const { updatePurchase } = useHorseRidingStore.getState();
        if (response.data.purchase) {
          updatePurchase(response.data.purchase.id, response.data.purchase);
        }
        toast.success('Payment verified successfully!');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to verify payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify payment';
      setPurchasesError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingPurchases(false);
    }
  }, [setPurchasesError, setLoadingPurchases]);

  return {
    // State
    timeSlots,
    rules,
    equipment,
    registration,
    enrollments,
    purchases,
    loadingSlots,
    loadingRules,
    loadingEquipment,
    loadingRegistration,
    loadingEnrollments,
    loadingPurchases,
    // Actions
    fetchTimeSlots,
    fetchRules,
    fetchEquipment,
    fetchRegistration,
    createRegistration,
    verifyRegistrationPayment,
    fetchEnrollments,
    createEnrollment,
    fetchPurchases,
    createEquipmentPurchase,
    verifyEquipmentPurchasePayment,
  };
};

/**
 * Hook for admin horse riding operations
 */
export const useAdminHorseRiding = () => {
  const {
    timeSlots,
    rules,
    equipment,
    loadingSlots,
    loadingRules,
    loadingEquipment,
    setTimeSlots,
    setRules,
    setEquipment,
    addTimeSlot,
    updateTimeSlot,
    removeTimeSlot,
    addRule,
    updateRule,
    removeRule,
    addEquipment,
    updateEquipment,
    removeEquipment,
    setLoadingSlots,
    setLoadingRules,
    setLoadingEquipment,
    setSlotsError,
    setRulesError,
    setEquipmentError,
  } = useHorseRidingStore();

  // ==================== TIME SLOTS ====================

  const fetchTimeSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const response = await horseRidingService.getTimeSlots();
      if (response.success) {
        const sorted = response.data.timeSlots.sort((a, b) => 
          a.start_time.localeCompare(b.start_time)
        );
        setTimeSlots(sorted);
      } else {
        throw new Error('Failed to fetch time slots');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch time slots';
      setSlotsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingSlots(false);
    }
  }, [setTimeSlots, setLoadingSlots, setSlotsError]);

  const createTimeSlot = useCallback(async (data: CreateTimeSlotRequest) => {
    try {
      const response = await horseRidingService.createTimeSlot(data);
      if (response.success) {
        addTimeSlot(response.data.timeSlot);
        toast.success('Time slot created successfully');
        return response.data.timeSlot;
      } else {
        throw new Error(response.message || 'Failed to create time slot');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create time slot';
      toast.error(errorMessage);
      throw error;
    }
  }, [addTimeSlot]);

  const updateTimeSlotById = useCallback(async (id: string, data: UpdateTimeSlotRequest) => {
    try {
      const response = await horseRidingService.updateTimeSlot(id, data);
      if (response.success) {
        updateTimeSlot(id, response.data.timeSlot);
        toast.success('Time slot updated successfully');
        return response.data.timeSlot;
      } else {
        throw new Error(response.message || 'Failed to update time slot');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update time slot';
      toast.error(errorMessage);
      throw error;
    }
  }, [updateTimeSlot]);

  const deleteTimeSlot = useCallback(async (id: string) => {
    try {
      const response = await horseRidingService.deleteTimeSlot(id);
      if (response.success) {
        removeTimeSlot(id);
        toast.success('Time slot deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete time slot');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete time slot';
      toast.error(errorMessage);
      throw error;
    }
  }, [removeTimeSlot]);

  // ==================== RULES ====================

  const fetchRules = useCallback(async () => {
    setLoadingRules(true);
    setRulesError(null);
    try {
      console.log('Admin: Fetching rules from API...');
      const response = await horseRidingService.getRules();
      console.log('Admin: Rules API response:', response);
      if (response.success) {
        console.log('Admin: Setting rules:', response.data.rules?.length || 0);
        // Only update if we have data - don't clear existing data
        if (response.data.rules && response.data.rules.length > 0) {
          setRules(response.data.rules);
        } else {
          // Only clear if explicitly empty
          setRules([]);
        }
      } else {
        throw new Error('Failed to fetch rules');
      }
    } catch (error: any) {
      console.error('Admin: Error fetching rules:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch rules';
      setRulesError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingRules(false);
    }
  }, [setRules, setLoadingRules, setRulesError]);

  const createRule = useCallback(async (data: CreateRuleRequest) => {
    try {
      const response = await horseRidingService.createRule(data);
      if (response.success) {
        addRule(response.data.rule);
        toast.success('Rule created successfully');
        return response.data.rule;
      } else {
        throw new Error(response.message || 'Failed to create rule');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create rule';
      toast.error(errorMessage);
      throw error;
    }
  }, [addRule]);

  const updateRuleById = useCallback(async (id: string, data: UpdateRuleRequest) => {
    try {
      const response = await horseRidingService.updateRule(id, data);
      if (response.success) {
        updateRule(id, response.data.rule);
        toast.success('Rule updated successfully');
        return response.data.rule;
      } else {
        throw new Error(response.message || 'Failed to update rule');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update rule';
      toast.error(errorMessage);
      throw error;
    }
  }, [updateRule]);

  const deleteRule = useCallback(async (id: string) => {
    try {
      const response = await horseRidingService.deleteRule(id);
      if (response.success) {
        removeRule(id);
        toast.success('Rule deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete rule');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete rule';
      toast.error(errorMessage);
      throw error;
    }
  }, [removeRule]);

  // ==================== EQUIPMENT ====================

  const fetchEquipment = useCallback(async () => {
    setLoadingEquipment(true);
    setEquipmentError(null);
    try {
      const response = await horseRidingService.getEquipment();
      if (response.success) {
        setEquipment(response.data.equipment);
      } else {
        throw new Error('Failed to fetch equipment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch equipment';
      setEquipmentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingEquipment(false);
    }
  }, [setEquipment, setLoadingEquipment, setEquipmentError]);

  const createEquipment = useCallback(async (data: CreateEquipmentRequest) => {
    try {
      const response = await horseRidingService.createEquipment(data);
      if (response.success) {
        addEquipment(response.data.equipment);
        toast.success('Equipment created successfully');
        return response.data.equipment;
      } else {
        throw new Error(response.message || 'Failed to create equipment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create equipment';
      toast.error(errorMessage);
      throw error;
    }
  }, [addEquipment]);

  const updateEquipmentById = useCallback(async (id: string, data: UpdateEquipmentRequest) => {
    try {
      const response = await horseRidingService.updateEquipment(id, data);
      if (response.success) {
        updateEquipment(id, response.data.equipment);
        toast.success('Equipment updated successfully');
        return response.data.equipment;
      } else {
        throw new Error(response.message || 'Failed to update equipment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update equipment';
      toast.error(errorMessage);
      throw error;
    }
  }, [updateEquipment]);

  const deleteEquipment = useCallback(async (id: string) => {
    try {
      const response = await horseRidingService.deleteEquipment(id);
      if (response.success) {
        removeEquipment(id);
        toast.success('Equipment deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete equipment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete equipment';
      toast.error(errorMessage);
      throw error;
    }
  }, [removeEquipment]);

  return {
    // State
    timeSlots,
    rules,
    equipment,
    loadingSlots,
    loadingRules,
    loadingEquipment,
    // Actions - Time Slots
    fetchTimeSlots,
    createTimeSlot,
    updateTimeSlotById,
    deleteTimeSlot,
    // Actions - Rules
    fetchRules,
    createRule,
    updateRuleById,
    deleteRule,
    // Actions - Equipment
    fetchEquipment,
    createEquipment,
    updateEquipmentById,
    deleteEquipment,
  };
};

