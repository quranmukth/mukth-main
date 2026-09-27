/**
 * Helper to build client-side fallback WhatsApp links if needed
 */
export function buildWhatsAppUrl(phone, text) {
  const cleanPhone = (phone || '201000000000').replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
