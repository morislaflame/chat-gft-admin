/**
 * Утилиты для форматирования данных
 */

export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options || defaultOptions);
};

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number, currency: string = 'stars') => {
  return `${amount} ${currency}`;
};

export const formatPercentage = (value: number, total: number) => {
  return total > 0 ? Math.round((value / total) * 100) : 0;
};

export const truncateText = (text: string, maxLength: number = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (firstName?: string, lastName?: string, username?: string) => {
  if (firstName) return firstName.charAt(0).toUpperCase();
  if (lastName) return lastName.charAt(0).toUpperCase();
  if (username) return username.charAt(0).toUpperCase();
  return 'U';
};
