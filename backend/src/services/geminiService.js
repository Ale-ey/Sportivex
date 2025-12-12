import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { getActiveTimeSlots, getAttendanceCount } from './swimmingService.js';
import { getTimeSlots as getHorseRidingTimeSlots, getEquipment, getRules as getHorseRidingRules } from './horseRidingService.js';
import { getTodayDate } from '../utils/timeSlotDetermination.js';

/**
 * Initialize Gemini AI client
 * The client gets the API key from the environment variable `GEMINI_API_KEY`
 */
const ai = new GoogleGenAI({});

/**
 * Fetch swimming time slots with availability information
 */
const fetchSwimmingTimeSlots = async () => {
  try {
    const { success, timeSlots } = await getActiveTimeSlots(true);
    if (!success || !timeSlots || timeSlots.length === 0) {
      return [];
    }

    const today = getTodayDate();
    const slotsWithAvailability = await Promise.all(
      timeSlots.map(async (slot) => {
        const attendanceResult = await getAttendanceCount(slot.id, today);
        const count = attendanceResult.count || 0;
        return {
          id: slot.id,
          startTime: slot.start_time,
          endTime: slot.end_time,
          genderRestriction: slot.gender_restriction,
          maxCapacity: slot.max_capacity,
          currentCount: count,
          availableSpots: slot.max_capacity - count,
          trainer: slot.trainer?.name || null,
          isActive: slot.is_active
        };
      })
    );

    return slotsWithAvailability;
  } catch (error) {
    console.error("Error fetching swimming time slots:", error);
    return [];
  }
};

/**
 * Fetch horse riding time slots
 */
const fetchHorseRidingTimeSlots = async () => {
  try {
    const { success, timeSlots } = await getHorseRidingTimeSlots({ active: true });
    if (!success || !timeSlots || timeSlots.length === 0) {
      return [];
    }

    return timeSlots.map(slot => ({
      id: slot.id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      dayOfWeek: slot.day_of_week,
      maxCapacity: slot.max_capacity,
      instructor: slot.instructor_id || null,
      isActive: slot.is_active
    }));
  } catch (error) {
    console.error("Error fetching horse riding time slots:", error);
    return [];
  }
};

/**
 * Fetch horse riding equipment with prices
 */
const fetchHorseRidingEquipment = async () => {
  try {
    const { success, equipment } = await getEquipment();
    if (!success || !equipment || equipment.length === 0) {
      return [];
    }

    return equipment.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: parseFloat(item.price),
      stockQuantity: item.stock_quantity,
      isAvailable: item.is_available
    }));
  } catch (error) {
    console.error("Error fetching horse riding equipment:", error);
    return [];
  }
};

/**
 * Fetch swimming rules
 */
const fetchSwimmingRules = async () => {
  try {
    const { data, error } = await supabase
      .from('swimming_rules_regulations')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error("Error fetching swimming rules:", error);
      return [];
    }

    return (data || []).map(rule => ({
      title: rule.title,
      content: rule.content,
      category: rule.category || "General"
    }));
  } catch (error) {
    console.error("Error fetching swimming rules:", error);
    return [];
  }
};

/**
 * Fetch horse riding rules
 */
const fetchHorseRidingRules = async () => {
  try {
    const { success, rules } = await getHorseRidingRules();
    if (!success || !rules || rules.length === 0) {
      return [];
    }

    return rules.map(rule => ({
      title: rule.title,
      content: rule.content,
      category: rule.category || "General"
    }));
  } catch (error) {
    console.error("Error fetching horse riding rules:", error);
    return [];
  }
};

/**
 * Build context string from database data
 */
const buildContext = async () => {
  const [
    swimmingSlots,
    horseRidingSlots,
    equipment,
    swimmingRules,
    horseRidingRules
  ] = await Promise.all([
    fetchSwimmingTimeSlots(),
    fetchHorseRidingTimeSlots(),
    fetchHorseRidingEquipment(),
    fetchSwimmingRules(),
    fetchHorseRidingRules()
  ]);

  let context = "You are a helpful assistant for Sportivex, a sports facility management system. ";
  context += "You have access to real-time information about swimming and horse riding facilities.\n\n";

  // Swimming time slots context
  context += "=== SWIMMING TIME SLOTS ===\n";
  if (swimmingSlots.length === 0) {
    context += "No active swimming time slots are currently available.\n\n";
  } else {
    context += `There are ${swimmingSlots.length} active swimming time slot(s):\n`;
    swimmingSlots.forEach((slot, index) => {
      context += `${index + 1}. Time: ${slot.startTime} - ${slot.endTime}\n`;
      context += `   Gender Restriction: ${slot.genderRestriction}\n`;
      context += `   Capacity: ${slot.currentCount}/${slot.maxCapacity} (${slot.availableSpots} spots available)\n`;
      if (slot.trainer) {
        context += `   Trainer: ${slot.trainer}\n`;
      }
      context += "\n";
    });
  }

  // Horse riding time slots context
  context += "=== HORSE RIDING TIME SLOTS ===\n";
  if (horseRidingSlots.length === 0) {
    context += "No active horse riding time slots are currently available.\n\n";
  } else {
    context += `There are ${horseRidingSlots.length} active horse riding time slot(s):\n`;
    horseRidingSlots.forEach((slot, index) => {
      context += `${index + 1}. Time: ${slot.startTime} - ${slot.endTime}\n`;
      if (slot.dayOfWeek !== null && slot.dayOfWeek !== undefined) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        context += `   Day: ${days[slot.dayOfWeek]}\n`;
      } else {
        context += `   Day: All days\n`;
      }
      context += `   Max Capacity: ${slot.maxCapacity}\n`;
      context += "\n";
    });
  }

  // Equipment context
  context += "=== HORSE RIDING EQUIPMENT & PRICES ===\n";
  if (equipment.length === 0) {
    context += "No equipment is currently available.\n\n";
  } else {
    context += `There are ${equipment.length} equipment item(s) available:\n`;
    equipment.forEach((item, index) => {
      context += `${index + 1}. ${item.name}\n`;
      if (item.description) {
        context += `   Description: ${item.description}\n`;
      }
      context += `   Price: PKR ${item.price.toFixed(2)}\n`;
      context += `   Stock: ${item.stockQuantity} available\n`;
      context += `   Status: ${item.isAvailable ? 'Available' : 'Not Available'}\n`;
      context += "\n";
    });
  }

  // Swimming rules context
  context += "=== SWIMMING RULES & REGULATIONS ===\n";
  if (swimmingRules.length === 0) {
    context += "No swimming rules are currently available.\n\n";
  } else {
    context += `There are ${swimmingRules.length} active rule(s):\n`;
    swimmingRules.forEach((rule, index) => {
      context += `${index + 1}. [${rule.category}] ${rule.title}\n`;
      context += `   ${rule.content}\n\n`;
    });
  }

  // Horse riding rules context
  context += "=== HORSE RIDING RULES & REGULATIONS ===\n";
  if (horseRidingRules.length === 0) {
    context += "No horse riding rules are currently available.\n\n";
  } else {
    context += `There are ${horseRidingRules.length} active rule(s):\n`;
    horseRidingRules.forEach((rule, index) => {
      context += `${index + 1}. [${rule.category}] ${rule.title}\n`;
      context += `   ${rule.content}\n\n`;
    });
  }

  context += "\n=== INSTRUCTIONS ===\n";
  context += "Answer user questions based on the information provided above. ";
  context += "Be helpful, accurate, and concise. ";
  context += "If you don't have information about something, say so clearly. ";
  context += "When mentioning prices, always specify the currency (PKR). ";
  context += "When mentioning time slots, include availability information if available.\n";

  return context;
};

/**
 * Generate intelligent response using Gemini AI with database context
 * 
 * @param {string} userQuery - The user's question
 * @param {string} model - The model to use (default: "gemini-2.5-flash")
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export const generateIntelligentResponse = async (userQuery, model = "gemini-2.5-flash") => {
  try {
    if (!userQuery || typeof userQuery !== "string" || userQuery.trim().length === 0) {
      return {
        success: false,
        error: "Query is required and must be a non-empty string"
      };
    }

    // Build context from database
    const context = await buildContext();
    
    // Create the full prompt with context
    const fullPrompt = `${context}\n\nUser Question: ${userQuery.trim()}\n\nAssistant Response:`;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt.trim()
    });

    if (!response || !response.text) {
      return {
        success: false,
        error: "No response received from Gemini API"
      };
    }

    return {
      success: true,
      text: response.text
    };
  } catch (error) {
    console.error("Error generating intelligent response with Gemini:", error);
    return {
      success: false,
      error: error.message || "Failed to generate response with Gemini API"
    };
  }
};

/**
 * Generate content using Gemini AI (simple version - kept for backward compatibility)
 * 
 * @param {string} prompt - The prompt/question to send to Gemini
 * @param {string} model - The model to use (default: "gemini-2.5-flash")
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export const generateContent = async (prompt, model = "gemini-2.5-flash") => {
  try {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return {
        success: false,
        error: "Prompt is required and must be a non-empty string"
      };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt.trim()
    });

    if (!response || !response.text) {
      return {
        success: false,
        error: "No response received from Gemini API"
      };
    }

    return {
      success: true,
      text: response.text
    };
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return {
      success: false,
      error: error.message || "Failed to generate content with Gemini API"
    };
  }
};

/**
 * Generate content with conversation history
 * 
 * @param {Array<{role: string, content: string}>} messages - Array of conversation messages
 * @param {string} model - The model to use (default: "gemini-2.5-flash")
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export const generateContentWithHistory = async (messages, model = "gemini-2.5-flash") => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        success: false,
        error: "Messages array is required and must not be empty"
      };
    }

    // Format messages for Gemini API
    const contents = messages.map(msg => ({
      role: msg.role || "user",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: model,
      contents: contents
    });

    if (!response || !response.text) {
      return {
        success: false,
        error: "No response received from Gemini API"
      };
    }

    return {
      success: true,
      text: response.text
    };
  } catch (error) {
    console.error("Error generating content with history:", error);
    return {
      success: false,
      error: error.message || "Failed to generate content with Gemini API"
    };
  }
};

