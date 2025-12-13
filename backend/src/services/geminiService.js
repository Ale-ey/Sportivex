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
 * Filter time slots based on user gender and role
 */
const filterTimeSlotsByUser = (slots, userGender, userRole) => {
  if (!slots || slots.length === 0) {
    return [];
  }

  if (!userGender || !userRole) {
    // If no user info, only show mixed slots
    return slots.filter(slot => slot.genderRestriction === 'mixed');
  }

  const userGenderLower = userGender.toLowerCase();
  const userRoleLower = userRole.toLowerCase();

  // Determine allowed gender restrictions based on user gender
  let allowedGenderRestrictions = [];
  if (userGenderLower === 'male') {
    allowedGenderRestrictions = ['male', 'mixed'];
  } else if (userGenderLower === 'female') {
    allowedGenderRestrictions = ['female', 'mixed'];
  } else {
    allowedGenderRestrictions = ['mixed'];
  }

  // Filter by role - UG students cannot access faculty_pg slots
  if (userRoleLower === 'ug') {
    // UG students: male see [male, mixed], female see [female, mixed]
    // Remove faculty_pg from allowed restrictions for UG students
    const filtered = allowedGenderRestrictions.filter(r => r !== 'faculty_pg');
    return slots.filter(slot => filtered.includes(slot.genderRestriction));
  } else if (userRoleLower === 'pg' || userRoleLower === 'faculty' || userRoleLower === 'alumni') {
    // PG, Faculty, Alumni: can see [male/female/mixed, faculty_pg]
    if (!allowedGenderRestrictions.includes('faculty_pg')) {
      allowedGenderRestrictions.push('faculty_pg');
    }
    return slots.filter(slot => allowedGenderRestrictions.includes(slot.genderRestriction));
  } else {
    // Unknown role - only mixed slots
    return slots.filter(slot => slot.genderRestriction === 'mixed');
  }
};

/**
 * Get the next available time slot (first slot with available spots that hasn't passed)
 */
const getNextAvailableSlot = (slots) => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  // Filter slots that:
  // 1. Haven't ended yet (endTime > currentTime)
  // 2. Have available spots (availableSpots > 0)
  // 3. Are active
  const availableSlots = slots.filter(slot => {
    const hasEnded = currentTime > slot.endTime;
    const hasSpots = slot.availableSpots > 0;
    const isActive = slot.isActive !== false;
    return !hasEnded && hasSpots && isActive;
  });

  // Sort by start time and return the first one (next available)
  if (availableSlots.length === 0) {
    return null;
  }

  availableSlots.sort((a, b) => {
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;
    return 0;
  });

  return availableSlots[0];
};

/**
 * Fetch swimming time slots with availability information (filtered by user and showing only next available)
 */
const fetchSwimmingTimeSlots = async (userGender = null, userRole = null) => {
  try {
    const { success, timeSlots } = await getActiveTimeSlots(true);
    if (!success || !timeSlots || timeSlots.length === 0) {
      return null;
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

    // Filter by user gender and role
    const filteredSlots = filterTimeSlotsByUser(slotsWithAvailability, userGender, userRole);

    // Return only the next available slot
    return getNextAvailableSlot(filteredSlots);
  } catch (error) {
    console.error("Error fetching swimming time slots:", error);
    return null;
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
 * Build context string from database data (filtered by user)
 */
const buildContext = async (user = null) => {
  const userGender = user?.gender || null;
  const userRole = user?.role || null;

  const [
    swimmingSlot,
    horseRidingSlots,
    equipment,
    swimmingRules,
    horseRidingRules
  ] = await Promise.all([
    fetchSwimmingTimeSlots(userGender, userRole),
    fetchHorseRidingTimeSlots(),
    fetchHorseRidingEquipment(),
    fetchSwimmingRules(),
    fetchHorseRidingRules()
  ]);

  let context = "You are a helpful assistant for Sportivex, a sports facility management system. ";
  context += "You have access to real-time information about swimming and horse riding facilities.\n\n";
  context += "⚠️ CRITICAL INSTRUCTION: You MUST ONLY use the information provided in the database context below. ";
  context += "DO NOT use any general knowledge, external information, or your training data. ";
  context += "If the information is not in the database context, you must clearly state that the information is not available in the system. ";
  context += "NEVER provide general market prices, general product information, or any information not explicitly listed below.\n\n";

  // Swimming time slots context (only next available slot, filtered by user)
  context += "=== NEXT AVAILABLE SWIMMING TIME SLOT ===\n";
  if (!swimmingSlot) {
    context += "No available swimming time slots at the moment that match your eligibility.\n\n";
  } else {
    context += "Next Available Time Slot:\n";
    context += `Time: ${swimmingSlot.startTime} - ${swimmingSlot.endTime}\n`;
    context += `Gender Restriction: ${swimmingSlot.genderRestriction}\n`;
    context += `Capacity: ${swimmingSlot.currentCount}/${swimmingSlot.maxCapacity} (${swimmingSlot.availableSpots} spots available)\n`;
    if (swimmingSlot.trainer) {
      context += `Trainer: ${swimmingSlot.trainer}\n`;
    }
    context += "\n";
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

  context += "\n=== STRICT INSTRUCTIONS ===\n";
  context += "1. ONLY use information from the database context provided above. DO NOT use general knowledge.\n";
  context += "2. If information is not in the database, respond with: 'I don't have that information in the system database. Please contact the facility for more details.'\n";
  context += "3. For equipment prices, ONLY mention prices that are explicitly listed in the 'HORSE RIDING EQUIPMENT & PRICES' section above.\n";
  context += "4. When mentioning prices, always specify the currency (PKR) as shown in the database.\n";
  context += "5. IMPORTANT: The swimming time slot shown is the NEXT AVAILABLE slot that matches the user's eligibility (gender and role). Only show this one slot, not all available slots.\n";
  context += "6. The time slot shown is already filtered based on the user's gender and role - UG students cannot see faculty_pg slots, and users only see slots matching their gender restrictions.\n";
  context += "7. Be accurate, concise, and helpful, but ONLY based on the provided database information.\n";
  context += "8. If asked about equipment, products, or prices not listed above, state that the information is not available in the system.\n";
  context += "9. DO NOT provide general market information, general product descriptions, or any information not explicitly in the database context.\n";

  return context;
};

/**
 * Generate intelligent response using Gemini AI with database context
 * 
 * @param {string} userQuery - The user's question
 * @param {string} model - The model to use (default: "gemini-2.5-flash")
 * @param {Object} user - User object with gender and role (optional)
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export const generateIntelligentResponse = async (userQuery, model = "gemini-2.5-flash", user = null) => {
  try {
    if (!userQuery || typeof userQuery !== "string" || userQuery.trim().length === 0) {
      return {
        success: false,
        error: "Query is required and must be a non-empty string"
      };
    }

    // Build context from database (filtered by user)
    const context = await buildContext(user);
    
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
 * @param {Object} user - User object with gender and role (optional)
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export const generateContentWithHistory = async (messages, model = "gemini-2.5-flash", user = null) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        success: false,
        error: "Messages array is required and must not be empty"
      };
    }

    // Build database context to include with the conversation (filtered by user)
    const context = await buildContext(user);
    
    // Format messages for Gemini API
    // Gemini API expects roles: "user" or "model" (not "assistant")
    const formattedMessages = messages.map((msg, index) => {
      let role = msg.role || "user";
      // Map "assistant" to "model" for Gemini API compatibility
      if (role === "assistant") {
        role = "model";
      }
      // Ensure only valid roles are used
      if (role !== "user" && role !== "model") {
        role = "user";
      }
      
      // Prepend context to the first user message only
      let content = msg.content;
      if (index === 0 && role === "user") {
        content = context + "\n\nUser Question: " + content;
      }
      
      return {
        role: role,
        parts: [{ text: content }]
      };
    });

    const contents = formattedMessages;

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

