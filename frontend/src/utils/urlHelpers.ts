const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getFullAssetUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

export const createBlobUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeBlobUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};
