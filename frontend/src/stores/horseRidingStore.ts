import { create } from 'zustand';

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  day_of_week: number | null;
  max_capacity: number;
  instructor_id: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Rule {
  id: string;
  title: string;
  content: string;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Registration {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  amount_paid: number;
  payment_status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  registration_fee: number;
  status: 'pending' | 'paid' | 'enrolled' | 'cancelled' | 'expired';
  registered_at: string;
  enrolled_at: string | null;
  expires_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Enrollment {
  id: string;
  registration_id: string;
  time_slot_id: string;
  user_id: string;
  session_date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  time_slot?: TimeSlot;
}

export interface EquipmentPurchase {
  id: string;
  user_id: string;
  equipment_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  payment_status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
  purchased_at: string;
  fulfilled_at: string | null;
  created_at?: string;
  updated_at?: string;
  equipment?: Equipment;
}

interface HorseRidingState {
  // Time Slots
  timeSlots: TimeSlot[];
  loadingSlots: boolean;
  slotsError: string | null;

  // Rules
  rules: Rule[];
  loadingRules: boolean;
  rulesError: string | null;

  // Equipment
  equipment: Equipment[];
  loadingEquipment: boolean;
  equipmentError: string | null;

  // Registration
  registration: Registration | null;
  loadingRegistration: boolean;
  registrationError: string | null;

  // Enrollments
  enrollments: Enrollment[];
  loadingEnrollments: boolean;
  enrollmentsError: string | null;

  // Equipment Purchases
  purchases: EquipmentPurchase[];
  loadingPurchases: boolean;
  purchasesError: string | null;

  // Actions - Time Slots
  setTimeSlots: (slots: TimeSlot[]) => void;
  addTimeSlot: (slot: TimeSlot) => void;
  updateTimeSlot: (id: string, slot: Partial<TimeSlot>) => void;
  removeTimeSlot: (id: string) => void;
  setLoadingSlots: (loading: boolean) => void;
  setSlotsError: (error: string | null) => void;

  // Actions - Rules
  setRules: (rules: Rule[]) => void;
  addRule: (rule: Rule) => void;
  updateRule: (id: string, rule: Partial<Rule>) => void;
  removeRule: (id: string) => void;
  setLoadingRules: (loading: boolean) => void;
  setRulesError: (error: string | null) => void;

  // Actions - Equipment
  setEquipment: (equipment: Equipment[]) => void;
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  setLoadingEquipment: (loading: boolean) => void;
  setEquipmentError: (error: string | null) => void;

  // Actions - Registration
  setRegistration: (registration: Registration | null) => void;
  setLoadingRegistration: (loading: boolean) => void;
  setRegistrationError: (error: string | null) => void;

  // Actions - Enrollments
  setEnrollments: (enrollments: Enrollment[]) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  updateEnrollment: (id: string, enrollment: Partial<Enrollment>) => void;
  setLoadingEnrollments: (loading: boolean) => void;
  setEnrollmentsError: (error: string | null) => void;

  // Actions - Purchases
  setPurchases: (purchases: EquipmentPurchase[]) => void;
  addPurchase: (purchase: EquipmentPurchase) => void;
  updatePurchase: (id: string, purchase: Partial<EquipmentPurchase>) => void;
  setLoadingPurchases: (loading: boolean) => void;
  setPurchasesError: (error: string | null) => void;
}

export const useHorseRidingStore = create<HorseRidingState>((set) => ({
  // Initial State - Time Slots
  timeSlots: [],
  loadingSlots: false,
  slotsError: null,

  // Initial State - Rules
  rules: [],
  loadingRules: false,
  rulesError: null,

  // Initial State - Equipment
  equipment: [],
  loadingEquipment: false,
  equipmentError: null,

  // Initial State - Registration
  registration: null,
  loadingRegistration: false,
  registrationError: null,

  // Initial State - Enrollments
  enrollments: [],
  loadingEnrollments: false,
  enrollmentsError: null,

  // Initial State - Purchases
  purchases: [],
  loadingPurchases: false,
  purchasesError: null,

  // Actions - Time Slots
  setTimeSlots: (slots) => set({ timeSlots: slots }),
  addTimeSlot: (slot) => set((state) => ({ timeSlots: [...state.timeSlots, slot] })),
  updateTimeSlot: (id, updates) =>
    set((state) => ({
      timeSlots: state.timeSlots.map((slot) => (slot.id === id ? { ...slot, ...updates } : slot)),
    })),
  removeTimeSlot: (id) =>
    set((state) => ({ timeSlots: state.timeSlots.filter((slot) => slot.id !== id) })),
  setLoadingSlots: (loading) => set({ loadingSlots: loading }),
  setSlotsError: (error) => set({ slotsError: error }),

  // Actions - Rules
  setRules: (rules) => set({ rules }),
  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  updateRule: (id, updates) =>
    set((state) => ({
      rules: state.rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)),
    })),
  removeRule: (id) => set((state) => ({ rules: state.rules.filter((rule) => rule.id !== id) })),
  setLoadingRules: (loading) => set({ loadingRules: loading }),
  setRulesError: (error) => set({ rulesError: error }),

  // Actions - Equipment
  setEquipment: (equipment) => set({ equipment }),
  addEquipment: (equipment) => set((state) => ({ equipment: [...state.equipment, equipment] })),
  updateEquipment: (id, updates) =>
    set((state) => ({
      equipment: state.equipment.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq)),
    })),
  removeEquipment: (id) => set((state) => ({ equipment: state.equipment.filter((eq) => eq.id !== id) })),
  setLoadingEquipment: (loading) => set({ loadingEquipment: loading }),
  setEquipmentError: (error) => set({ equipmentError: error }),

  // Actions - Registration
  setRegistration: (registration) => set({ registration }),
  setLoadingRegistration: (loading) => set({ loadingRegistration: loading }),
  setRegistrationError: (error) => set({ registrationError: error }),

  // Actions - Enrollments
  setEnrollments: (enrollments) => set({ enrollments }),
  addEnrollment: (enrollment) => set((state) => ({ enrollments: [...state.enrollments, enrollment] })),
  updateEnrollment: (id, updates) =>
    set((state) => ({
      enrollments: state.enrollments.map((enrollment) =>
        enrollment.id === id ? { ...enrollment, ...updates } : enrollment
      ),
    })),
  setLoadingEnrollments: (loading) => set({ loadingEnrollments: loading }),
  setEnrollmentsError: (error) => set({ enrollmentsError: error }),

  // Actions - Purchases
  setPurchases: (purchases) => set({ purchases }),
  addPurchase: (purchase) => set((state) => ({ purchases: [...state.purchases, purchase] })),
  updatePurchase: (id, updates) =>
    set((state) => ({
      purchases: state.purchases.map((purchase) =>
        purchase.id === id ? { ...purchase, ...updates } : purchase
      ),
    })),
  setLoadingPurchases: (loading) => set({ loadingPurchases: loading }),
  setPurchasesError: (error) => set({ purchasesError: error }),
}));

