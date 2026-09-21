/**
 * Indian Rupee (INR) formatting utilities
 * Uses the Indian numbering system (Lakhs & Crores, e.g., ₹14,25,000)
 */

export const formatINR = (value, options = {}) => {
  const num = Number(value) || 0;
  
  // Format with standard Indian Numbering system
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options.fractionDigits !== undefined ? options.fractionDigits : 0,
    minimumFractionDigits: options.fractionDigits !== undefined ? options.fractionDigits : 0
  }).format(num);

  return formatted;
};

// Shorthand formatter e.g. 14.25 Lakhs
export const formatINRShorthand = (value) => {
  const num = Number(value) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return formatINR(num);
};
