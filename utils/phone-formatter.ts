export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // If 11 digits and starts with 1, remove the 1 and format
  if (digits.length === 11 && digits[0] === '1') {
    const cleaned = digits.slice(1);
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if can't format
  return phone;
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}