import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Waves,
  Target,
  Trophy,
  QrCode,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Check,
  Users,
  ToggleLeft,
  ToggleRight,
  Activity,
  Dumbbell,
} from 'lucide-react';
import { adminService, type LeagueRegistration } from '@/services/adminService';
import { type TimeSlot } from '@/services/swimmingService';
import { badmintonService, type Court } from '@/services/badmintonService';
import type { League, CreateLeagueRequest } from '@/services/adminService';
import { useAdminSwimming } from '@/hooks/useAdminSwimming';
import { useAdminHorseRiding } from '@/hooks/useHorseRiding';
import { horseRidingService } from '@/services/horseRidingService';
import toast from 'react-hot-toast';

const AdminRoute: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slots' | 'courts' | 'leagues' | 'qr-scanner' | 'horse-riding'>('slots');
  const [horseRidingSubTab, setHorseRidingSubTab] = useState<'slots' | 'rules' | 'equipment' | 'registrations'>('slots');
  
  // Swimming Slots - Using Zustand store via hook
  const {
    timeSlots,
    loadingSlots,
    fetchTimeSlots,
    createTimeSlot,
    updateTimeSlotById,
    deleteTimeSlot,
  } = useAdminSwimming();
  
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [slotForm, setSlotForm] = useState({
    startTime: '',
    endTime: '',
    genderRestriction: 'mixed' as 'male' | 'female' | 'faculty_pg' | 'mixed',
    trainerId: '',
    maxCapacity: 20,
    isActive: true,
  });

  // Badminton Courts State
  const [courts, setCourts] = useState<Court[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(false);

  // Leagues State
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [showLeagueDialog, setShowLeagueDialog] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [leagueForm, setLeagueForm] = useState<CreateLeagueRequest>({
    name: '',
    description: '',
    sport_type: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_participants: undefined,
    prize: '',
    registration_fee: undefined,
  });

  // QR Codes State
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loadingQRCodes, setLoadingQRCodes] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrForm, setQrForm] = useState({
    qrCodeValue: '',
    locationName: '',
    description: '',
    qrType: 'swimming' as 'gym' | 'swimming',
  });
  const [gymQRCodes, setGymQRCodes] = useState<any[]>([]);
  const [loadingGymQRCodes, setLoadingGymQRCodes] = useState(false);

  // Delete confirmation dialogs
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [deleteLeagueId, setDeleteLeagueId] = useState<string | null>(null);
  const [deleteQRCodeId, setDeleteQRCodeId] = useState<string | null>(null);
  const [deleteHorseRidingSlotId, setDeleteHorseRidingSlotId] = useState<string | null>(null);
  const [deleteHorseRidingRuleId, setDeleteHorseRidingRuleId] = useState<string | null>(null);
  const [deleteHorseRidingEquipmentId, setDeleteHorseRidingEquipmentId] = useState<string | null>(null);

  // League Registrations State
  const [showRegistrationsDialog, setShowRegistrationsDialog] = useState(false);
  const [selectedLeagueName, setSelectedLeagueName] = useState<string>('');
  const [registrations, setRegistrations] = useState<LeagueRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Horse Riding Registrations State
  const [horseRidingRegistrations, setHorseRidingRegistrations] = useState<any[]>([]);
  const [loadingHorseRidingRegistrations, setLoadingHorseRidingRegistrations] = useState(false);

  // Horse Riding - Using Zustand store via hook
  const {
    timeSlots: horseRidingSlots,
    rules: horseRidingRules,
    equipment: horseRidingEquipment,
    loadingSlots: loadingHorseRidingSlots,
    loadingRules: loadingHorseRidingRules,
    loadingEquipment: loadingHorseRidingEquipment,
    fetchTimeSlots: fetchHorseRidingSlots,
    createTimeSlot: createHorseRidingSlot,
    updateTimeSlotById: updateHorseRidingSlot,
    deleteTimeSlot: deleteHorseRidingSlot,
    fetchRules: fetchHorseRidingRules,
    createRule: createHorseRidingRule,
    updateRuleById: updateHorseRidingRule,
    deleteRule: deleteHorseRidingRule,
    fetchEquipment: fetchHorseRidingEquipment,
    createEquipment: createHorseRidingEquipment,
    updateEquipmentById: updateHorseRidingEquipment,
    deleteEquipment: deleteHorseRidingEquipment,
  } = useAdminHorseRiding();

  // Horse Riding Form States
  const [showHorseRidingSlotDialog, setShowHorseRidingSlotDialog] = useState(false);
  const [editingHorseRidingSlot, setEditingHorseRidingSlot] = useState<any>(null);
  const [horseRidingSlotForm, setHorseRidingSlotForm] = useState({
    start_time: '',
    end_time: '',
    day_of_week: null as number | null,
    max_capacity: 5,
    instructor_id: '',
    is_active: true,
  });

  const [showHorseRidingRuleDialog, setShowHorseRidingRuleDialog] = useState(false);
  const [editingHorseRidingRule, setEditingHorseRidingRule] = useState<any>(null);
  const [horseRidingRuleForm, setHorseRidingRuleForm] = useState({
    title: '',
    content: '',
    category: '',
    display_order: 0,
    is_active: true,
  });

  const [showHorseRidingEquipmentDialog, setShowHorseRidingEquipmentDialog] = useState(false);
  const [editingHorseRidingEquipment, setEditingHorseRidingEquipment] = useState<any>(null);
  const [horseRidingEquipmentForm, setHorseRidingEquipmentForm] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    stock_quantity: 0,
    is_available: true,
  });

  // Fetch data on mount and tab change
  useEffect(() => {
    if (activeTab === 'slots') {
      fetchTimeSlots();
    } else if (activeTab === 'courts') {
      fetchCourts();
    } else if (activeTab === 'leagues') {
      fetchLeagues();
    } else if (activeTab === 'qr-scanner') {
      fetchQRCodes();
    } else if (activeTab === 'horse-riding') {
      fetchHorseRidingData();
    }
  }, [activeTab, fetchTimeSlots]);

  const fetchHorseRidingData = async () => {
    await Promise.all([
      fetchHorseRidingSlots(),
      fetchHorseRidingRules(),
      fetchHorseRidingEquipment(),
    ]);
  };

  // Fetch registrations when registrations tab is active
  useEffect(() => {
    if (activeTab === 'horse-riding' && horseRidingSubTab === 'registrations') {
      fetchHorseRidingRegistrations();
    }
  }, [activeTab, horseRidingSubTab]);

  // ==================== SWIMMING SLOTS ====================

  const handleCreateSlot = async () => {
    if (!slotForm.startTime || !slotForm.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createTimeSlot({
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      genderRestriction: slotForm.genderRestriction,
      trainerId: slotForm.trainerId || undefined,
      maxCapacity: slotForm.maxCapacity,
    });

    if (result.success) {
      setShowSlotDialog(false);
      resetSlotForm();
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;
    if (!slotForm.startTime || !slotForm.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await updateTimeSlotById(editingSlot.id, {
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      genderRestriction: slotForm.genderRestriction,
      trainerId: slotForm.trainerId || undefined,
      maxCapacity: slotForm.maxCapacity,
      isActive: slotForm.isActive,
    });

    if (result.success) {
      setShowSlotDialog(false);
      setEditingSlot(null);
      resetSlotForm();
    }
  };

  const handleDeleteSlot = async (id: string) => {
    setDeleteSlotId(id);
  };

  const confirmDeleteSlot = async () => {
    if (deleteSlotId) {
      await deleteTimeSlot(deleteSlotId);
      setDeleteSlotId(null);
    }
  };

  const resetSlotForm = () => {
    setSlotForm({
      startTime: '',
      endTime: '',
      genderRestriction: 'mixed',
      trainerId: '',
      maxCapacity: 20,
      isActive: true,
    });
  };

  const openEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      startTime: slot.start_time,
      endTime: slot.end_time,
      genderRestriction: slot.gender_restriction as any,
      trainerId: slot.trainer_id || '',
      maxCapacity: slot.max_capacity,
      isActive: slot.is_active ?? true,
    });
    setShowSlotDialog(true);
  };

  // ==================== BADMINTON COURTS ====================

  const fetchCourts = async () => {
    setLoadingCourts(true);
    try {
      const response = await badmintonService.getCourts();
      if (response.success) {
        setCourts(response.courts);
      }
    } catch (error) {
      toast.error('Failed to fetch courts');
    } finally {
      setLoadingCourts(false);
    }
  };

  const handleUpdateCourtStatus = async (courtId: string, status: 'available' | 'occupied' | 'maintenance') => {
    try {
      const response = await adminService.updateCourtStatus(courtId, status);
      if (response.success) {
        toast.success(`Court status updated to ${status}`);
        fetchCourts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update court status');
    }
  };

  // ==================== LEAGUES ====================

  const fetchLeagues = async () => {
    setLoadingLeagues(true);
    try {
      const response = await adminService.getLeagues();
      if (response.success) {
        setLeagues(response.data.leagues);
      }
    } catch (error) {
      toast.error('Failed to fetch leagues');
    } finally {
      setLoadingLeagues(false);
    }
  };

  const handleCreateLeague = async () => {
    try {
      const response = await adminService.createLeague(leagueForm);
      if (response.success) {
        toast.success('League created successfully');
        setShowLeagueDialog(false);
        resetLeagueForm();
        fetchLeagues();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create league');
    }
  };

  const handleUpdateLeague = async () => {
    if (!editingLeague) return;
    try {
      const response = await adminService.updateLeague(editingLeague.id, leagueForm);
      if (response.success) {
        toast.success('League updated successfully');
        setShowLeagueDialog(false);
        setEditingLeague(null);
        resetLeagueForm();
        fetchLeagues();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update league');
    }
  };

  const handleDeleteLeague = async (id: string) => {
    setDeleteLeagueId(id);
  };

  const confirmDeleteLeague = async () => {
    if (!deleteLeagueId) return;
    try {
      const response = await adminService.deleteLeague(deleteLeagueId);
      if (response.success) {
        toast.success('League deleted successfully');
        fetchLeagues();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete league');
    } finally {
      setDeleteLeagueId(null);
    }
  };

  const resetLeagueForm = () => {
    setLeagueForm({
      name: '',
      description: '',
      sport_type: '',
      start_date: '',
      end_date: '',
      registration_deadline: '',
      max_participants: undefined,
      prize: '',
      registration_fee: undefined,
    });
  };

  const handleToggleRegistration = async (leagueId: string, currentStatus: boolean) => {
    try {
      const response = await adminService.toggleLeagueRegistration(leagueId, !currentStatus);
      if (response.success) {
        toast.success(`Registration ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        fetchLeagues();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle registration');
    }
  };

  const handleViewRegistrations = async (leagueId: string) => {
    const league = leagues.find(l => l.id === leagueId);
    setSelectedLeagueName(league?.name || 'League');
    setShowRegistrationsDialog(true);
    setLoadingRegistrations(true);
    try {
      const response = await adminService.getLeagueRegistrations(leagueId);
      if (response.success) {
        setRegistrations(response.data.registrations);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const fetchHorseRidingRegistrations = async () => {
    setLoadingHorseRidingRegistrations(true);
    try {
      const response = await horseRidingService.getAllRegistrations();
      if (response.success) {
        setHorseRidingRegistrations(response.data.registrations);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch registrations');
    } finally {
      setLoadingHorseRidingRegistrations(false);
    }
  };

  // ==================== HORSE RIDING ====================

  const resetHorseRidingSlotForm = () => {
    setHorseRidingSlotForm({
      start_time: '',
      end_time: '',
      day_of_week: null,
      max_capacity: 5,
      instructor_id: '',
      is_active: true,
    });
  };

  const resetHorseRidingRuleForm = () => {
    setHorseRidingRuleForm({
      title: '',
      content: '',
      category: '',
      display_order: 0,
      is_active: true,
    });
  };

  const resetHorseRidingEquipmentForm = () => {
    setHorseRidingEquipmentForm({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      stock_quantity: 0,
      is_available: true,
    });
  };

  const handleCreateHorseRidingSlot = async () => {
    try {
      await createHorseRidingSlot({
        start_time: horseRidingSlotForm.start_time,
        end_time: horseRidingSlotForm.end_time,
        day_of_week: horseRidingSlotForm.day_of_week,
        max_capacity: horseRidingSlotForm.max_capacity,
        instructor_id: horseRidingSlotForm.instructor_id || null,
        is_active: horseRidingSlotForm.is_active,
      });
      setShowHorseRidingSlotDialog(false);
      resetHorseRidingSlotForm();
      // Don't refetch - the hook already updates the store
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateHorseRidingSlot = async () => {
    if (!editingHorseRidingSlot) return;
    try {
      await updateHorseRidingSlot(editingHorseRidingSlot.id, {
        start_time: horseRidingSlotForm.start_time,
        end_time: horseRidingSlotForm.end_time,
        day_of_week: horseRidingSlotForm.day_of_week,
        max_capacity: horseRidingSlotForm.max_capacity,
        instructor_id: horseRidingSlotForm.instructor_id || null,
        is_active: horseRidingSlotForm.is_active,
      });
      setShowHorseRidingSlotDialog(false);
      setEditingHorseRidingSlot(null);
      resetHorseRidingSlotForm();
      // Don't refetch - the hook already updates the store
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteHorseRidingSlot = (id: string) => {
    setDeleteHorseRidingSlotId(id);
  };

  const confirmDeleteHorseRidingSlot = async () => {
    if (!deleteHorseRidingSlotId) return;
    try {
      await deleteHorseRidingSlot(deleteHorseRidingSlotId);
      // Don't refetch - the hook already updates the store
    } catch (error) {
      // Error handled in hook
    } finally {
      setDeleteHorseRidingSlotId(null);
    }
  };

  const openEditHorseRidingSlot = (slot: any) => {
    setEditingHorseRidingSlot(slot);
    setHorseRidingSlotForm({
      start_time: slot.start_time,
      end_time: slot.end_time,
      day_of_week: slot.day_of_week,
      max_capacity: slot.max_capacity,
      instructor_id: slot.instructor_id || '',
      is_active: slot.is_active ?? true,
    });
    setShowHorseRidingSlotDialog(true);
  };

  const handleCreateHorseRidingRule = async () => {
    try {
      await createHorseRidingRule({
        title: horseRidingRuleForm.title,
        content: horseRidingRuleForm.content,
        category: horseRidingRuleForm.category || null,
        display_order: horseRidingRuleForm.display_order,
        is_active: horseRidingRuleForm.is_active,
      });
      setShowHorseRidingRuleDialog(false);
      resetHorseRidingRuleForm();
      // Don't refetch - the hook already updates the store
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateHorseRidingRule = async () => {
    if (!editingHorseRidingRule) return;
    try {
      await updateHorseRidingRule(editingHorseRidingRule.id, {
        title: horseRidingRuleForm.title,
        content: horseRidingRuleForm.content,
        category: horseRidingRuleForm.category || null,
        display_order: horseRidingRuleForm.display_order,
        is_active: horseRidingRuleForm.is_active,
      });
      setShowHorseRidingRuleDialog(false);
      setEditingHorseRidingRule(null);
      resetHorseRidingRuleForm();
      // Don't refetch - the hook already updates the store
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteHorseRidingRule = (id: string) => {
    setDeleteHorseRidingRuleId(id);
  };

  const confirmDeleteHorseRidingRule = async () => {
    if (!deleteHorseRidingRuleId) return;
    try {
      await deleteHorseRidingRule(deleteHorseRidingRuleId);
      // Don't refetch - the hook already updates the store
    } catch (error) {
      // Error handled in hook
    } finally {
      setDeleteHorseRidingRuleId(null);
    }
  };

  const openEditHorseRidingRule = (rule: any) => {
    setEditingHorseRidingRule(rule);
    setHorseRidingRuleForm({
      title: rule.title,
      content: rule.content,
      category: rule.category || '',
      display_order: rule.display_order,
      is_active: rule.is_active ?? true,
    });
    setShowHorseRidingRuleDialog(true);
  };

  const handleCreateHorseRidingEquipment = async () => {
    try {
      await createHorseRidingEquipment({
        name: horseRidingEquipmentForm.name,
        description: horseRidingEquipmentForm.description || null,
        price: horseRidingEquipmentForm.price,
        image_url: horseRidingEquipmentForm.image_url || null,
        stock_quantity: horseRidingEquipmentForm.stock_quantity,
        is_available: horseRidingEquipmentForm.is_available,
      });
      setShowHorseRidingEquipmentDialog(false);
      resetHorseRidingEquipmentForm();
      fetchHorseRidingEquipment();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateHorseRidingEquipment = async () => {
    if (!editingHorseRidingEquipment) return;
    try {
      await updateHorseRidingEquipment(editingHorseRidingEquipment.id, {
        name: horseRidingEquipmentForm.name,
        description: horseRidingEquipmentForm.description || null,
        price: horseRidingEquipmentForm.price,
        image_url: horseRidingEquipmentForm.image_url || null,
        stock_quantity: horseRidingEquipmentForm.stock_quantity,
        is_available: horseRidingEquipmentForm.is_available,
      });
      setShowHorseRidingEquipmentDialog(false);
      setEditingHorseRidingEquipment(null);
      resetHorseRidingEquipmentForm();
      // Don't refetch - the hook already updates the store
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteHorseRidingEquipment = (id: string) => {
    setDeleteHorseRidingEquipmentId(id);
  };

  const confirmDeleteHorseRidingEquipment = async () => {
    if (!deleteHorseRidingEquipmentId) return;
    try {
      await deleteHorseRidingEquipment(deleteHorseRidingEquipmentId);
      // Don't refetch - the hook already updates the store
    } catch (error) {
      // Error handled in hook
    } finally {
      setDeleteHorseRidingEquipmentId(null);
    }
  };

  const openEditHorseRidingEquipment = (equipment: any) => {
    setEditingHorseRidingEquipment(equipment);
    setHorseRidingEquipmentForm({
      name: equipment.name,
      description: equipment.description || '',
      price: equipment.price,
      image_url: equipment.image_url || '',
      stock_quantity: equipment.stock_quantity,
      is_available: equipment.is_available ?? true,
    });
    setShowHorseRidingEquipmentDialog(true);
  };

  const openEditLeague = (league: League) => {
    setEditingLeague(league);
    setLeagueForm({
      name: league.name,
      description: league.description || '',
      sport_type: league.sport_type,
      start_date: league.start_date,
      end_date: league.end_date,
      registration_deadline: league.registration_deadline,
      max_participants: league.max_participants,
      prize: league.prize || '',
      registration_fee: league.registration_fee,
    });
    setShowLeagueDialog(true);
  };

  // ==================== QR CODES ====================

  const fetchQRCodes = async () => {
    setLoadingQRCodes(true);
    setLoadingGymQRCodes(true);
    try {
      const [swimmingResponse, gymResponse] = await Promise.all([
        adminService.getQRCodes(),
        adminService.getGymQRCodes(),
      ]);
      if (swimmingResponse.success) {
        setQrCodes(swimmingResponse.data.qrCodes);
      }
      if (gymResponse.success) {
        setGymQRCodes(gymResponse.data.qrCodes);
      }
    } catch (error) {
      toast.error('Failed to fetch QR codes');
    } finally {
      setLoadingQRCodes(false);
      setLoadingGymQRCodes(false);
    }
  };

  const handleCreateQRCode = async () => {
    try {
      let response;
      if (qrForm.qrType === 'gym') {
        response = await adminService.createGymQRCode({
          description: qrForm.description,
          location: qrForm.locationName,
        });
      } else {
        response = await adminService.createQRCode({
          locationName: qrForm.locationName,
          description: qrForm.description,
        });
      }
      if (response.success) {
        toast.success('QR code created successfully');
        setShowQRDialog(false);
        setQrForm({ qrCodeValue: '', locationName: '', description: '', qrType: 'swimming' });
        fetchQRCodes();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create QR code');
    }
  };

  const handleDeleteQRCode = async (id: string) => {
    setDeleteQRCodeId(id);
  };

  const handleDeleteGymQRCode = async (id: string) => {
    try {
      const response = await adminService.deleteGymQRCode(id);
      if (response.success) {
        toast.success('Gym QR code deleted successfully');
        fetchQRCodes();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete gym QR code');
    }
  };

  const confirmDeleteQRCode = async () => {
    if (!deleteQRCodeId) return;
    try {
      const response = await adminService.deleteQRCode(deleteQRCodeId);
      if (response.success) {
        toast.success('QR code deleted successfully');
        fetchQRCodes();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete QR code');
    } finally {
      setDeleteQRCodeId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#023E8A] mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage swimming slots, badminton courts, leagues, and attendance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'slots' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('slots')}
          className="rounded-b-none"
        >
          <Waves className="w-4 h-4 mr-2" />
          Swimming Slots
        </Button>
        <Button
          variant={activeTab === 'courts' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('courts')}
          className="rounded-b-none"
        >
          <Target className="w-4 h-4 mr-2" />
          Badminton Courts
        </Button>
        <Button
          variant={activeTab === 'leagues' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('leagues')}
          className="rounded-b-none"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Leagues
        </Button>
        <Button
          variant={activeTab === 'qr-scanner' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('qr-scanner')}
          className="rounded-b-none"
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Codes
        </Button>
        <Button
          variant={activeTab === 'horse-riding' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('horse-riding')}
          className="rounded-b-none"
        >
          <Activity className="w-4 h-4 mr-2" />
          Horse Riding
        </Button>
      </div>

      {/* Swimming Slots Tab */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Time Slots Management</h3>
            <Button onClick={() => { setEditingSlot(null); resetSlotForm(); setShowSlotDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Slot
            </Button>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeSlots.map((slot) => (
                <Card key={slot.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        {slot.start_time} - {slot.end_time}
                      </CardTitle>
                      <Badge variant={slot.is_active ? 'default' : 'secondary'}>
                        {slot.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Gender</span>
                        <Badge variant="outline">{slot.gender_restriction}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Capacity</span>
                        <span className="font-semibold">
                          {slot.currentCount || 0} / {slot.max_capacity}
                        </span>
                      </div>
                      {slot.trainer && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Trainer</span>
                          <span className="text-sm">{slot.trainer.name}</span>
                        </div>
                      )}
                      {slot.created_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Created</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(slot.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditSlot(slot)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Slot Dialog */}
          <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSlot ? 'Edit Time Slot' : 'Create Time Slot'}</DialogTitle>
                <DialogDescription>
                  {editingSlot ? 'Update the time slot details' : 'Create a new swimming pool time slot'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Gender Restriction</Label>
                  <select
                    value={slotForm.genderRestriction}
                    onChange={(e) => setSlotForm({ ...slotForm, genderRestriction: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="mixed">Mixed</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="faculty_pg">Faculty/PG</option>
                  </select>
                </div>
                <div>
                  <Label>Max Capacity</Label>
                  <Input
                    type="number"
                    value={slotForm.maxCapacity}
                    onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: parseInt(e.target.value) || 20 })}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Trainer ID (Optional)</Label>
                  <Input
                    value={slotForm.trainerId}
                    onChange={(e) => setSlotForm({ ...slotForm, trainerId: e.target.value })}
                    placeholder="Enter trainer user ID"
                  />
                </div>
                {editingSlot && (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {slotForm.isActive ? 'Slot is currently active' : 'Slot is currently inactive'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={slotForm.isActive ? 'default' : 'secondary'}
                      onClick={() => setSlotForm({ ...slotForm, isActive: !slotForm.isActive })}
                      className="flex items-center gap-2"
                    >
                      {slotForm.isActive ? (
                        <>
                          <Check className="w-4 h-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Inactive
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={editingSlot ? handleUpdateSlot : handleCreateSlot}
                    className="flex-1"
                  >
                    {editingSlot ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSlotDialog(false);
                      setEditingSlot(null);
                      resetSlotForm();
                    }}
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

      {/* Badminton Courts Tab */}
      {activeTab === 'courts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Court Management</h3>
          </div>

          {loadingCourts ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courts.map((court) => (
                <Card key={court.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{court.name}</CardTitle>
                      <Badge
                        variant={
                          court.status === 'available'
                            ? 'default'
                            : court.status === 'occupied'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {court.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Court Number</span>
                        <span className="font-semibold">{court.court_number}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={court.status === 'available' ? 'default' : 'outline'}
                          onClick={() => handleUpdateCourtStatus(court.id, 'available')}
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant={court.status === 'maintenance' ? 'destructive' : 'outline'}
                          onClick={() => handleUpdateCourtStatus(court.id, 'maintenance')}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Close
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leagues Tab */}
      {activeTab === 'leagues' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Leagues Management</h3>
            <Button onClick={() => { setEditingLeague(null); resetLeagueForm(); setShowLeagueDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create League
            </Button>
          </div>

          {loadingLeagues ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leagues.map((league) => (
                <Card key={league.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{league.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={league.registration_enabled ? "default" : "secondary"}
                          className={league.registration_enabled ? "bg-green-100 text-green-700" : ""}
                        >
                          {league.registration_enabled ? 'Registration Open' : 'Registration Closed'}
                        </Badge>
                        <Badge variant="outline">{league.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {league.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{league.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sport:</span>
                          <Badge variant="secondary" className="ml-2">{league.sport_type}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Max Participants:</span>
                          <span className="ml-2 font-medium">{league.max_participants || 'Unlimited'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Start:</span>
                          <span className="ml-2">{new Date(league.start_date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End:</span>
                          <span className="ml-2">{new Date(league.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Registration Deadline:</span>
                          <span className="ml-2">{new Date(league.registration_deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {league.prize && (
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-md">
                          <span className="text-sm text-muted-foreground">Prize Pool:</span>
                          <span className="font-semibold text-orange-600">{league.prize}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                        <span className="text-sm text-muted-foreground">Registration Fee:</span>
                        <span className="font-semibold text-blue-600">
                          {league.registration_fee !== undefined && league.registration_fee > 0
                            ? `$${league.registration_fee.toFixed(2)}`
                            : 'Free'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                        <div>
                          <Label className="text-xs">Registration Status</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {league.registration_enabled ? 'Registration is currently open' : 'Registration is currently closed'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={league.registration_enabled ? 'default' : 'secondary'}
                          onClick={() => handleToggleRegistration(league.id, league.registration_enabled ?? true)}
                          className="flex items-center gap-2"
                        >
                          {league.registration_enabled ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              Enabled
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              Disabled
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRegistrations(league.id)}
                          className="flex-1"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          View Registrations
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditLeague(league)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteLeague(league.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* League Dialog */}
          <Dialog open={showLeagueDialog} onOpenChange={setShowLeagueDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLeague ? 'Edit League' : 'Create League'}</DialogTitle>
                <DialogDescription>
                  {editingLeague ? 'Update the league details' : 'Create a new league or competition'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>League Name *</Label>
                  <Input
                    value={leagueForm.name}
                    onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
                    placeholder="e.g., Summer Swimming Championship"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={leagueForm.description}
                    onChange={(e) => setLeagueForm({ ...leagueForm, description: e.target.value })}
                    placeholder="League description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Sport Type *</Label>
                  <Input
                    value={leagueForm.sport_type}
                    onChange={(e) => setLeagueForm({ ...leagueForm, sport_type: e.target.value })}
                    placeholder="e.g., Swimming, Badminton, Gym"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={leagueForm.start_date}
                      onChange={(e) => setLeagueForm({ ...leagueForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={leagueForm.end_date}
                      onChange={(e) => setLeagueForm({ ...leagueForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Registration Deadline *</Label>
                  <Input
                    type="date"
                    value={leagueForm.registration_deadline}
                    onChange={(e) => setLeagueForm({ ...leagueForm, registration_deadline: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Participants</Label>
                    <Input
                      type="number"
                      value={leagueForm.max_participants || ''}
                      onChange={(e) =>
                        setLeagueForm({
                          ...leagueForm,
                          max_participants: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label>Prize</Label>
                    <Input
                      value={leagueForm.prize}
                      onChange={(e) => setLeagueForm({ ...leagueForm, prize: e.target.value })}
                      placeholder="e.g., $5,000"
                    />
                  </div>
                </div>
                <div>
                  <Label>Registration Fee</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={leagueForm.registration_fee !== undefined ? leagueForm.registration_fee : ''}
                    onChange={(e) =>
                      setLeagueForm({
                        ...leagueForm,
                        registration_fee: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g., 50.00 (leave empty for free)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the registration fee in your currency. Leave empty for free registration.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={editingLeague ? handleUpdateLeague : handleCreateLeague}
                    className="flex-1"
                  >
                    {editingLeague ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLeagueDialog(false);
                      setEditingLeague(null);
                      resetLeagueForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Registrations Dialog */}
          <Dialog open={showRegistrationsDialog} onOpenChange={setShowRegistrationsDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>League Registrations - {selectedLeagueName}</DialogTitle>
                <DialogDescription>
                  View all registrations for this league
                </DialogDescription>
              </DialogHeader>
              {loadingRegistrations ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="mt-4">
                  {registrations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No registrations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="mb-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">
                          Total Registrations: <span className="text-primary">{registrations.length}</span>
                        </p>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">CMS ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Gender</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Registered At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {registrations.map((registration) => (
                              <tr key={registration.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    {registration.user?.profile_picture_url && (
                                      <img
                                        src={registration.user.profile_picture_url}
                                        alt={registration.user.name}
                                        className="w-8 h-8 rounded-full"
                                      />
                                    )}
                                    <div>
                                      <span className="font-medium">{registration.user?.name || 'Unknown'}</span>
                                      {(registration.user as any)?.institution && (
                                        <span className="text-xs text-muted-foreground block">{(registration.user as any).institution}</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{registration.user?.email || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{registration.user?.cms_id || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{(registration.user as any)?.phone || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">{(registration.user as any)?.gender || 'N/A'}</td>
                                <td className="px-4 py-3">
                                  <Badge
                                    variant={
                                      registration.status === 'registered' || registration.status === 'confirmed'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                  >
                                    {registration.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge
                                    variant={
                                      (registration as any).payment_status === 'succeeded'
                                        ? 'default'
                                        : (registration as any).payment_status === 'pending'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                  >
                                    {(registration as any).payment_status || 'N/A'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {new Date(registration.registered_at).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      )}

      {/* QR Codes Tab */}
      {activeTab === 'qr-scanner' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">QR Code Management</h3>
            <Button onClick={() => setShowQRDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create QR Code
            </Button>
          </div>

          {loadingQRCodes || loadingGymQRCodes ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : qrCodes.length === 0 && gymQRCodes.length === 0 ? (
            <Card className="border border-[#E2F5FB]">
              <CardContent className="p-8 text-center">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No QR codes found. Create one to get started!
                </p>
                <Button onClick={() => setShowQRDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create QR Code
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Swimming QR Codes */}
              {qrCodes.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Waves className="w-5 h-5" />
                    Swimming QR Codes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {qrCodes.map((qr) => {
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr.qr_code_value)}`;
                
                return (
                  <Card key={qr.id} className="border border-[#E2F5FB]">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{qr.location_name}</CardTitle>
                        <Badge variant={qr.is_active ? 'default' : 'secondary'}>
                          {qr.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* QR Code Display */}
                        <div className="flex flex-col items-center p-4 bg-white rounded-lg border-2 border-dashed border-[#E2F5FB]">
                          <img
                            src={qrCodeUrl}
                            alt={`QR Code for ${qr.location_name}`}
                            className="w-full max-w-[250px] h-auto rounded-lg"
                          />
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Scan this QR code for attendance
                          </p>
                        </div>

                        {/* QR Code Details */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">QR Code Value</span>
                            <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                              {qr.qr_code_value}
                            </code>
                          </div>
                          {qr.description && (
                            <div>
                              <span className="text-sm text-muted-foreground">Description:</span>
                              <p className="text-sm mt-1">{qr.description}</p>
                            </div>
                          )}
                          {qr.created_at && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Created</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(qr.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = qrCodeUrl;
                              link.download = `${qr.location_name}_QR_Code.png`;
                              link.click();
                            }}
                            className="flex-1"
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteQRCode(qr.id)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    );
                  })}
                  </div>
                </div>
              )}

              {/* Gym QR Codes */}
              {gymQRCodes.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5" />
                    Gym QR Codes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gymQRCodes.map((qr) => {
                      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr.qr_code_value)}`;
                      
                      return (
                        <Card key={qr.id} className="border border-[#E2F5FB]">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">{qr.location || 'Gym QR Code'}</CardTitle>
                              <Badge variant={qr.is_active ? 'default' : 'secondary'}>
                                {qr.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* QR Code Display */}
                              <div className="flex flex-col items-center p-4 bg-white rounded-lg border-2 border-dashed border-[#E2F5FB]">
                                <img
                                  src={qrCodeUrl}
                                  alt={`QR Code for ${qr.location || 'Gym'}`}
                                  className="w-full max-w-[250px] h-auto rounded-lg"
                                />
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                  Scan this QR code for attendance
                                </p>
                              </div>

                              {/* QR Code Details */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">QR Code Value</span>
                                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                                    {qr.qr_code_value}
                                  </code>
                                </div>
                                {qr.description && (
                                  <div>
                                    <span className="text-sm text-muted-foreground">Description:</span>
                                    <p className="text-sm mt-1">{qr.description}</p>
                                  </div>
                                )}
                                {qr.created_at && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(qr.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = qrCodeUrl;
                                    link.download = `${qr.location || 'Gym'}_QR_Code.png`;
                                    link.click();
                                  }}
                                  className="flex-1"
                                >
                                  <QrCode className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteGymQRCode(qr.id)}
                                  className="flex-1"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QR Code Dialog */}
          <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create QR Code</DialogTitle>
                <DialogDescription>Create a new QR code for attendance scanning</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>QR Code Type *</Label>
                  <select
                    value={qrForm.qrType}
                    onChange={(e) => setQrForm({ ...qrForm, qrType: e.target.value as 'gym' | 'swimming' })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                  >
                    <option value="swimming">Swimming</option>
                    <option value="gym">Gym</option>
                  </select>
                </div>
                <div>
                  <Label>Location Name *</Label>
                  <Input
                    value={qrForm.locationName}
                    onChange={(e) => setQrForm({ ...qrForm, locationName: e.target.value })}
                    placeholder={qrForm.qrType === 'gym' ? 'e.g., Gym Entrance' : 'e.g., Swimming Pool Reception'}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={qrForm.description}
                    onChange={(e) => setQrForm({ ...qrForm, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateQRCode} className="flex-1">
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQRDialog(false);
                      setQrForm({ qrCodeValue: '', locationName: '', description: '', qrType: 'swimming' });
                    }}
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

      {/* Horse Riding Tab */}
      {activeTab === 'horse-riding' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Horse Riding Management</h3>
          </div>
          {/* Sub-tabs for Horse Riding */}
          <div className="flex gap-2 border-b">
            <Button
              variant={horseRidingSubTab === 'slots' ? 'default' : 'ghost'}
              className="rounded-b-none"
              onClick={() => setHorseRidingSubTab('slots')}
            >
              Time Slots
            </Button>
            <Button
              variant={horseRidingSubTab === 'rules' ? 'default' : 'ghost'}
              className="rounded-b-none"
              onClick={() => setHorseRidingSubTab('rules')}
            >
              Rules
            </Button>
            <Button
              variant={horseRidingSubTab === 'equipment' ? 'default' : 'ghost'}
              className="rounded-b-none"
              onClick={() => setHorseRidingSubTab('equipment')}
            >
              Equipment
            </Button>
            <Button
              variant={horseRidingSubTab === 'registrations' ? 'default' : 'ghost'}
              className="rounded-b-none"
              onClick={() => setHorseRidingSubTab('registrations')}
            >
              <Users className="w-4 h-4 mr-2" />
              Registrations
            </Button>
          </div>

          {/* Time Slots Section */}
          {horseRidingSubTab === 'slots' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Time Slots Management</h3>
              <Button onClick={() => { setEditingHorseRidingSlot(null); resetHorseRidingSlotForm(); setShowHorseRidingSlotDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Time Slot
              </Button>
            </div>

            {loadingHorseRidingSlots ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {horseRidingSlots.map((slot) => (
                  <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {slot.start_time} - {slot.end_time}
                        </CardTitle>
                        <Badge variant={slot.is_active ? 'default' : 'secondary'}>
                          {slot.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Day of Week</span>
                          <span className="text-sm">
                            {slot.day_of_week !== null 
                              ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day_of_week]
                              : 'All Days'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Max Capacity</span>
                          <span className="text-sm font-medium">{slot.max_capacity}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditHorseRidingSlot(slot)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteHorseRidingSlot(slot.id)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Rules Section */}
          {horseRidingSubTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Rules Management</h3>
              <Button onClick={() => { setEditingHorseRidingRule(null); resetHorseRidingRuleForm(); setShowHorseRidingRuleDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>

            {loadingHorseRidingRules ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {horseRidingRules.map((rule) => (
                  <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{rule.title}</CardTitle>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {rule.category && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Category</span>
                            <Badge variant="outline">{rule.category}</Badge>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-3">{rule.content}</p>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditHorseRidingRule(rule)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteHorseRidingRule(rule.id)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Equipment Section */}
          {horseRidingSubTab === 'equipment' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Equipment Management</h3>
              <Button onClick={() => { setEditingHorseRidingEquipment(null); resetHorseRidingEquipmentForm(); setShowHorseRidingEquipmentDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Equipment
              </Button>
            </div>

            {loadingHorseRidingEquipment ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {horseRidingEquipment.map((eq) => (
                  <Card key={eq.id} className="hover:shadow-lg transition-shadow">
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
                          <p className="text-sm text-muted-foreground line-clamp-2">{eq.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Price</span>
                          <span className="text-lg font-bold text-[#023E8A]">Rs. {eq.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Stock</span>
                          <span className="text-sm font-medium">{eq.stock_quantity}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditHorseRidingEquipment(eq)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteHorseRidingEquipment(eq.id)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Registrations Section */}
          {horseRidingSubTab === 'registrations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Horse Riding Registrations</h3>
              </div>

              {loadingHorseRidingRegistrations ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="mt-4">
                  {horseRidingRegistrations.length === 0 ? (
                    <Card className="border border-[#E2F5FB]">
                      <CardContent className="p-8 text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No registrations yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      <div className="mb-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">
                          Total Registrations: <span className="text-primary">{horseRidingRegistrations.filter((r: any) => r.payment_status === 'succeeded' && (r.status === 'paid' || r.status === 'enrolled')).length}</span>
                          {' '}(Showing paid and registered only)
                        </p>
                      </div>
                      <Card className="border border-[#E2F5FB]">
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">CMS ID</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Registered</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {horseRidingRegistrations
                                  .filter((r: any) => r.payment_status === 'succeeded' && (r.status === 'paid' || r.status === 'enrolled'))
                                  .map((registration: any) => (
                                    <tr key={registration.id} className="hover:bg-muted/50">
                                      <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                          {registration.user?.profile_picture_url && (
                                            <img
                                              src={registration.user.profile_picture_url}
                                              alt={registration.user.name}
                                              className="w-8 h-8 rounded-full"
                                            />
                                          )}
                                          <div>
                                            <span className="font-medium">{registration.user?.name || 'Unknown'}</span>
                                            {registration.user?.gender && (
                                              <span className="text-xs text-muted-foreground block">{registration.user.gender}</span>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">{registration.user?.email || 'N/A'}</td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">{registration.user?.cms_id || 'N/A'}</td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">{registration.user?.phone || 'N/A'}</td>
                                      <td className="px-4 py-3">
                                        <Badge
                                          variant={
                                            registration.status === 'paid' || registration.status === 'enrolled'
                                              ? 'default'
                                              : registration.status === 'pending'
                                              ? 'secondary'
                                              : 'destructive'
                                          }
                                        >
                                          {registration.status}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3">
                                        <Badge
                                          variant={
                                            registration.payment_status === 'succeeded'
                                              ? 'default'
                                              : registration.payment_status === 'pending'
                                              ? 'secondary'
                                              : 'destructive'
                                          }
                                        >
                                          {registration.payment_status}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {new Date(registration.registered_at).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Horse Riding Dialogs - Outside tab section */}
      <Dialog open={showHorseRidingSlotDialog} onOpenChange={setShowHorseRidingSlotDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingHorseRidingSlot ? 'Edit Time Slot' : 'Create Time Slot'}</DialogTitle>
                <DialogDescription>
                  {editingHorseRidingSlot ? 'Update the time slot details' : 'Create a new time slot for horse riding'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time *</Label>
                    <Input
                      type="time"
                      value={horseRidingSlotForm.start_time}
                      onChange={(e) => setHorseRidingSlotForm({ ...horseRidingSlotForm, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Time *</Label>
                    <Input
                      type="time"
                      value={horseRidingSlotForm.end_time}
                      onChange={(e) => setHorseRidingSlotForm({ ...horseRidingSlotForm, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Day of Week</Label>
                  <select
                    value={horseRidingSlotForm.day_of_week !== null ? horseRidingSlotForm.day_of_week : ''}
                    onChange={(e) => setHorseRidingSlotForm({ ...horseRidingSlotForm, day_of_week: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Days</option>
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
                <div>
                  <Label>Max Capacity</Label>
                  <Input
                    type="number"
                    value={horseRidingSlotForm.max_capacity}
                    onChange={(e) => setHorseRidingSlotForm({ ...horseRidingSlotForm, max_capacity: parseInt(e.target.value) || 5 })}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Instructor ID (Optional)</Label>
                  <Input
                    value={horseRidingSlotForm.instructor_id}
                    onChange={(e) => setHorseRidingSlotForm({ ...horseRidingSlotForm, instructor_id: e.target.value })}
                    placeholder="Enter instructor user ID"
                  />
                </div>
                {editingHorseRidingSlot && (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {horseRidingSlotForm.is_active ? 'Slot is currently active' : 'Slot is currently inactive'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={horseRidingSlotForm.is_active ? 'default' : 'secondary'}
                      onClick={() => setHorseRidingSlotForm({ ...horseRidingSlotForm, is_active: !horseRidingSlotForm.is_active })}
                      className="flex items-center gap-2"
                    >
                      {horseRidingSlotForm.is_active ? (
                        <>
                          <Check className="w-4 h-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Inactive
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={editingHorseRidingSlot ? handleUpdateHorseRidingSlot : handleCreateHorseRidingSlot}
                    className="flex-1"
                  >
                    {editingHorseRidingSlot ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowHorseRidingSlotDialog(false);
                      setEditingHorseRidingSlot(null);
                      resetHorseRidingSlotForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Rule Dialog */}
          <Dialog open={showHorseRidingRuleDialog} onOpenChange={setShowHorseRidingRuleDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingHorseRidingRule ? 'Edit Rule' : 'Create Rule'}</DialogTitle>
                <DialogDescription>
                  {editingHorseRidingRule ? 'Update the rule details' : 'Create a new rule for horse riding'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={horseRidingRuleForm.title}
                    onChange={(e) => setHorseRidingRuleForm({ ...horseRidingRuleForm, title: e.target.value })}
                    placeholder="e.g., Safety Guidelines"
                  />
                </div>
                <div>
                  <Label>Content *</Label>
                  <Textarea
                    value={horseRidingRuleForm.content}
                    onChange={(e) => setHorseRidingRuleForm({ ...horseRidingRuleForm, content: e.target.value })}
                    placeholder="Rule content..."
                    rows={5}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={horseRidingRuleForm.category}
                      onChange={(e) => setHorseRidingRuleForm({ ...horseRidingRuleForm, category: e.target.value })}
                      placeholder="e.g., Safety, Equipment"
                    />
                  </div>
                  <div>
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={horseRidingRuleForm.display_order}
                      onChange={(e) => setHorseRidingRuleForm({ ...horseRidingRuleForm, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                {editingHorseRidingRule && (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {horseRidingRuleForm.is_active ? 'Rule is currently active' : 'Rule is currently inactive'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={horseRidingRuleForm.is_active ? 'default' : 'secondary'}
                      onClick={() => setHorseRidingRuleForm({ ...horseRidingRuleForm, is_active: !horseRidingRuleForm.is_active })}
                      className="flex items-center gap-2"
                    >
                      {horseRidingRuleForm.is_active ? (
                        <>
                          <Check className="w-4 h-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Inactive
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={editingHorseRidingRule ? handleUpdateHorseRidingRule : handleCreateHorseRidingRule}
                    className="flex-1"
                  >
                    {editingHorseRidingRule ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowHorseRidingRuleDialog(false);
                      setEditingHorseRidingRule(null);
                      resetHorseRidingRuleForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Equipment Dialog */}
          <Dialog open={showHorseRidingEquipmentDialog} onOpenChange={setShowHorseRidingEquipmentDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingHorseRidingEquipment ? 'Edit Equipment' : 'Create Equipment'}</DialogTitle>
                <DialogDescription>
                  {editingHorseRidingEquipment ? 'Update the equipment details' : 'Create a new equipment item'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={horseRidingEquipmentForm.name}
                    onChange={(e) => setHorseRidingEquipmentForm({ ...horseRidingEquipmentForm, name: e.target.value })}
                    placeholder="e.g., Horse Riding Shoes"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={horseRidingEquipmentForm.description}
                    onChange={(e) => setHorseRidingEquipmentForm({ ...horseRidingEquipmentForm, description: e.target.value })}
                    placeholder="Equipment description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (PKR) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={horseRidingEquipmentForm.price}
                      onChange={(e) => setHorseRidingEquipmentForm({ ...horseRidingEquipmentForm, price: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 6000"
                    />
                  </div>
                  <div>
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={horseRidingEquipmentForm.stock_quantity}
                      onChange={(e) => setHorseRidingEquipmentForm({ ...horseRidingEquipmentForm, stock_quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Image URL (Optional)</Label>
                  <Input
                    value={horseRidingEquipmentForm.image_url}
                    onChange={(e) => setHorseRidingEquipmentForm({ ...horseRidingEquipmentForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {editingHorseRidingEquipment && (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                    <div>
                      <Label>Availability</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {horseRidingEquipmentForm.is_available ? 'Equipment is currently available' : 'Equipment is currently unavailable'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={horseRidingEquipmentForm.is_available ? 'default' : 'secondary'}
                      onClick={() => setHorseRidingEquipmentForm({ ...horseRidingEquipmentForm, is_available: !horseRidingEquipmentForm.is_available })}
                      className="flex items-center gap-2"
                    >
                      {horseRidingEquipmentForm.is_available ? (
                        <>
                          <Check className="w-4 h-4" />
                          Available
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Unavailable
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={editingHorseRidingEquipment ? handleUpdateHorseRidingEquipment : handleCreateHorseRidingEquipment}
                    className="flex-1"
                  >
                    {editingHorseRidingEquipment ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowHorseRidingEquipmentDialog(false);
                      setEditingHorseRidingEquipment(null);
                      resetHorseRidingEquipmentForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialogs for Horse Riding */}
          <AlertDialog open={deleteHorseRidingSlotId !== null} onOpenChange={(open) => !open && setDeleteHorseRidingSlotId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this time slot? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteHorseRidingSlotId(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteHorseRidingSlot}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteHorseRidingRuleId !== null} onOpenChange={(open) => !open && setDeleteHorseRidingRuleId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Rule</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this rule? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteHorseRidingRuleId(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteHorseRidingRule}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deleteHorseRidingEquipmentId !== null} onOpenChange={(open) => !open && setDeleteHorseRidingEquipmentId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this equipment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteHorseRidingEquipmentId(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteHorseRidingEquipment}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

      {/* Delete Confirmation Dialogs */}
      
      {/* Delete Slot Confirmation */}
      <AlertDialog open={deleteSlotId !== null} onOpenChange={(open) => !open && setDeleteSlotId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time slot? This action cannot be undone.
              All associated attendance records and waitlist entries will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSlotId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSlot}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete League Confirmation */}
      <AlertDialog open={deleteLeagueId !== null} onOpenChange={(open) => !open && setDeleteLeagueId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete League</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this league? This action cannot be undone.
              All associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteLeagueId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLeague}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete QR Code Confirmation */}
      <AlertDialog open={deleteQRCodeId !== null} onOpenChange={(open) => !open && setDeleteQRCodeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this QR code? This action cannot be undone.
              Users will no longer be able to scan this QR code for check-ins.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteQRCodeId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteQRCode}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRoute;


