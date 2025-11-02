import apiClient from '../services/apiService';

/**
 * Helper function to build the full, absolute URL for a file.
 * @param {string} relativePath - The path from the DB (e.g., "/api/files/download/...")
 * @returns {string|null} - The full URL (e.g., "http://localhost:8080/api/files/...")
 */
export const buildFileUrl = (relativePath) => {
    if (!relativePath) return null;
    
    // If it's already a full URL, return it.
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }

    // Get the base URL from the api client (e.g., http://localhost:8080)
    const baseUrl = apiClient.defaults.baseURL.replace('/api', ''); 
    
    // Handle paths that already start with /api (from new file service)
    if (relativePath.startsWith('/api')) {
         return `${baseUrl}${relativePath}`;
    }

    // Handle legacy paths that might just be TENANT/USER/FILE.png
    if (!relativePath.startsWith('/')) {
        return `${baseUrl}/api/files/download/${relativePath}`;
    }
    
    // Fallback for any other relative path
    return `${baseUrl}${relativePath}`;
};

