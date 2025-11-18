// Kenyan telco prefixes based on phone number ranges
const TELCO_PREFIXES = {
  safaricom: ['700', '701', '702', '703', '704', '705', '706', '707', '708', '709', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719', '720', '721', '722', '723', '724', '725', '726', '727', '728', '729', '739', '740', '741', '742', '743', '744', '745', '746', '747', '748', '749', '750', '751', '752', '753', '754', '755', '756', '757', '758', '759', '768', '769'],
  airtel: ['730', '731', '732', '733', '734', '735', '736', '737', '738', '760', '761', '762', '763', '764', '765', '766', '767'],
  telkom: ['770', '771', '772', '773', '774', '775', '776', '777', '778', '779'],
  equitel: ['780', '781', '782', '783', '784', '785', '786', '787', '788', '789']
};

/**
 * Detect telco provider from phone number
 * @param {string} phoneNumber - Phone number in format +254XXXXXXXXX or 254XXXXXXXXX
 * @returns {string|null} - Telco name or null if not detected
 */
export const detectTelco = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.length < 5) return null;
  
  // Remove + prefix if present
  const cleanNumber = phoneNumber.replace(/^\+/, '');
  
  // Extract the 3-digit prefix (positions 3-6 in 254XXXXXXXXX)
  const prefix = cleanNumber.substring(3, 6);
  
  for (const [telco, prefixes] of Object.entries(TELCO_PREFIXES)) {
    if (prefixes.includes(prefix)) {
      return telco.charAt(0).toUpperCase() + telco.slice(1);
    }
  }
  
  return null;
};

/**
 * Convert scientific notation to standard form
 * @param {string|number} value - Value that might be in scientific notation
 * @returns {string} - Value in standard form
 */
const convertFromScientificNotation = (value) => {
  const str = value.toString();
  // Check if in scientific notation
  if (/e/i.test(str)) {
    // Use toLocaleString to convert, then remove commas
    return parseFloat(value).toLocaleString('fullwide', { useGrouping: false });
  }
  return str;
};

/**
 * Validate and format phone number to +254XXXXXXXXX format
 * @param {string} phoneNumber - Raw phone number input
 * @returns {object} - { isValid: boolean, formatted: string, errors: string[] }
 */
export const validateAndFormatPhone = (phoneNumber) => {
  const errors = [];
  
  if (!phoneNumber) {
    return { isValid: false, formatted: '', errors: ['Phone number is empty'] };
  }
  
  // Convert from scientific notation if needed
  let phoneStr = convertFromScientificNotation(phoneNumber);
  
  // Remove all non-digit characters
  let cleaned = phoneStr.replace(/\D/g, '');
  
  // Handle common cases
  if (cleaned.startsWith('254')) {
    // Already in correct format or close to it
  } else if (cleaned.startsWith('0')) {
    // Local format: 0797693561 -> 254797693561
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    // Missing country code and leading zero: 797693561 -> 254797693561
    cleaned = '254' + cleaned;
  } else if (cleaned.length === 10) {
    // Missing country code: 0797693561 -> 254797693561
    if (cleaned.startsWith('7')) {
      cleaned = '254' + cleaned;
    } else {
      errors.push('Invalid phone number format');
    }
  }
  
  // Validate final format
  if (cleaned.length !== 12) {
    errors.push(`Invalid length: expected 12 digits, got ${cleaned.length}`);
  }
  
  if (!cleaned.startsWith('254')) {
    errors.push('Invalid country code: must start with 254');
  }
  
  if (!/^\d+$/.test(cleaned)) {
    errors.push('Phone number contains non-digit characters');
  }
  
  // Validate Kenyan mobile number range (7xx or 1xx for some providers)
  const thirdDigit = cleaned.charAt(3);
  if (thirdDigit !== '7' && thirdDigit !== '1') {
    errors.push('Invalid Kenyan mobile number (must start with 254-7xx or 254-1xx)');
  }
  
  const isValid = errors.length === 0;
  
  return {
    isValid,
    formatted: isValid ? '+' + cleaned : '',
    errors
  };
};

/**
 * Batch validate phone numbers
 * @param {string[]} phoneNumbers - Array of phone numbers
 * @returns {object[]} - Array of validation results with telco info
 */
export const batchValidatePhones = (phoneNumbers) => {
  return phoneNumbers.map((phone, index) => {
    const validation = validateAndFormatPhone(phone);
    const telco = validation.isValid ? detectTelco(validation.formatted) : null;
    
    return {
      index,
      original: phone,
      ...validation,
      telco
    };
  });
};
