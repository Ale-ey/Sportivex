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

    console.log('Scanning QR code:', qrCodeValue);

    // Check if QR code exists in gym_qr_codes FIRST (priority)
    const { data: gymQR, error: gymQRError } = await supabase
      .from('gym_qr_codes')
      .select('*')
      .eq('qr_code_value', qrCodeValue)
      .eq('is_active', true)
      .maybeSingle();

    console.log('Gym QR check:', { found: !!gymQR, error: gymQRError?.message });

    // Check if QR code exists in swimming_qr_codes
    const { data: swimmingQR, error: swimmingQRError } = await supabase
      .from('swimming_qr_codes')
      .select('*')
      .eq('qr_code_value', qrCodeValue)
      .eq('is_active', true)
      .maybeSingle();

    console.log('Swimming QR check:', { found: !!swimmingQR, error: swimmingQRError?.message });

    // Determine QR code type and process accordingly
    // Priority: Gym QR codes are checked first
    if (gymQR && !swimmingQR) {
      // Gym QR code - process gym attendance
      console.log('✓ Detected GYM QR code. Location:', gymQR.location || 'N/A');
      console.log('→ Routing to gym attendance processing...');
      const result = await processGymQRScan(qrCodeValue, user);
      console.log('Gym QR scan result:', result.success ? '✓ SUCCESS' : '✗ FAILED', result.message);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        qrType: 'gym',
        location: gymQR.location
      });
    } else if (swimmingQR && !gymQR) {
      // Swimming QR code - process swimming attendance
      console.log('✓ Detected SWIMMING QR code. Location:', swimmingQR.location_name || 'N/A');
      console.log('→ Routing to swimming attendance processing...');
      const result = await processSwimmingQRScan(qrCodeValue, user);
      console.log('Swimming QR scan result:', result.success ? '✓ SUCCESS' : '✗ FAILED', result.message);
      return res.status(result.success ? 200 : 400).json({
        ...result,
        qrType: 'swimming',
        location: swimmingQR.location_name
      });
    } else if (gymQR && swimmingQR) {
      // Both exist (shouldn't happen, but handle it)
      console.error('ERROR: QR code exists in both gym and swimming tables!', qrCodeValue);
      return res.status(400).json({
        success: false,
        message: 'QR code exists in both systems. Please contact admin.',
        qrType: 'ambiguous'
      });
    } else {
      // QR code not found in either system
      console.log('QR code not found in either system:', qrCodeValue);
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


