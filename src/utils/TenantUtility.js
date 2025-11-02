/**
 * Determines the current tenant ID based on the window's hostname.
 * This logic ensures public content can be loaded even when the user is not logged in.
 * * Assumes URL structure: [tenantId].app.com or local development environment.
 * @returns {string} The derived tenant ID (e.g., 'strive', 'partnera').
 */
export const getPublicTenantId = () => {
    const hostname = window.location.hostname;
    const tenants = { 'strive': 'STRIVE', 'partnera': 'PARTNERA' }; // Map of valid tenants

    // Default for local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'strive'; 
    }

    const parts = hostname.split('.');
    let currentTenantId = null;

    // Check if the first part of the domain is a known tenant ID
    if (parts.length >= 2) {
        const subdomain = parts[0].toLowerCase();
        if (tenants[subdomain]) {
            currentTenantId = subdomain;
        }
    }
    
    // Return the determined ID or the default ('strive') if lookup fails
    return (currentTenantId || 'strive').toUpperCase();
};
