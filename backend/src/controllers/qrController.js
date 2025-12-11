import { supabaseAdmin as supabase } from '../config/supabase.js';
import { processGymQRScan } from '../services/gymService.js';
import { processSwimmingQRScan } from '../services/swimmingService.js';

/**
 * Unified QR code scanner - detects QR code type and processes accordingly
 */
export const scanUnifiedQR = async (req, res) => {
  try {
    const { qrCodeValue } = req.body;
    const user = req.user;

    if (!qrCodeValue) {
      return res.status(400).json({
        success: false,
        message: 'QR code value is required'
      });
    }

    // Check if QR code exists in gym_qr_codes
    const { data: gymQR, error: gymQRError } = await supabase
      .from('gym_qr_codes')
      .select('*')
      .eq('qr_code_value', qrCodeValue)
      .eq('is_active', true)
      .maybeSingle();

    // Check if QR code exists in swimming_qr_codes
    const { data: swimmingQR, error: swimmingQRError } = await supabase
      .from('swimming_qr_codes')
      .select('*')
      .eq('qr_code_value', qrCodeValue)
      .eq('is_active', true)
      .maybeSingle();

    // Determine QR code type and process accordingly
    if (gymQR && !swimmingQR) {
      // Gym QR code
      const result = await processGymQRScan(qrCodeValue, user);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        qrType: 'gym'
      });
    } else if (swimmingQR && !gymQR) {
      // Swimming QR code
      const result = await processSwimmingQRScan(qrCodeValue, user);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        qrType: 'swimming'
      });
    } else if (gymQR && swimmingQR) {
      // Both exist (shouldn't happen, but handle it)
      return res.status(400).json({
        success: false,
        message: 'QR code exists in both systems. Please contact admin.',
        qrType: 'ambiguous'
      });
    } else {
      // QR code not found in either system
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive QR code',
        qrType: 'unknown'
      });
    }
  } catch (error) {
    console.error('Error in scanUnifiedQR:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during QR code scanning'
    });
  }
};

export default {
  scanUnifiedQR
};

