import { Client, Databases } from 'appwrite';

// Appwrite configuration from environment variables with fallbacks
export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://backend.firefetch.org/v1';
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '69373be900166fcb421c';
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'candy-inventory';

// Collection IDs
export const STORES_COLLECTION = 'stores';
export const LOCATIONS_COLLECTION = 'locations';
export const ITEMS_COLLECTION = 'items';

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
