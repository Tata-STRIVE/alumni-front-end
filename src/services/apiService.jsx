import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // You will need this for the interceptor

// Create an Axios instance with a base URL for your Spring Boot backend.
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json', // This is the default
    },
});


/**
 * Helper to determine the Tenant ID from the URL hostname for public requests.
 * Defaults to 'strive' for local development.
 */
const getTenantIdFromUrl = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    let currentTenantId = 'strive'; // Default for local development
    
    if (parts.length >= 2 && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        currentTenantId = parts[0].toLowerCase();
    }
    
    // Return UPPERCASE as required by backend tenantId
    return currentTenantId.toUpperCase();
};


/**
 * Axios Request Interceptor
 * This automatically adds the JWT token (if it exists) to the 'Authorization' header
 * for every request that goes to a secure endpoint.
 *
 * --- FIX for File Uploads ---
 * If the data is FormData (a file upload), we must delete the default 'Content-Type'
 * header so the browser can correctly set it to 'multipart/form-data'
 * with the required boundary.
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            
            // --- FIX IS HERE ---
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }
            // --- END OF FIX ---
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- AUTHENTICATION API CALLS ---
export const requestOtp = (mobileNumber, tenantId) => apiClient.post('/auth/login', { mobileNumber, tenantId: tenantId.toUpperCase() });
export const verifyOtp = (mobileNumber, tenantId, otp) => apiClient.post('/auth/verify-otp', { mobileNumber, tenantId: tenantId.toUpperCase(), otp });
export const registerAlumnus = (registrationData) => apiClient.post('/auth/register', registrationData);

// --- USER & PROFILE API CALLS ---
export const getMyProfile = () => apiClient.get('/users/me');
export const updateMyProfile = (profileData) => apiClient.put('/users/me', profileData);
export const getAlumnusUsers = () => apiClient.get('/users/alumnus/list'); 
export const requestMobileChangeOtp = (data) => apiClient.post('/users/me/change-mobile/request', data);
export const verifyMobileChangeOtp = (data) => apiClient.post('/users/me/change-mobile/verify', data);

// --- FILE UPLOAD API CALL ---
export const uploadProfilePhoto = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Send request to the 'FileController' endpoint
    return apiClient.post('/files/upload', formData);
    // Note: We don't set 'Content-Type' here. The interceptor handles it.
};


// --- JOB BOARD API CALLS ---
export const getJobs = () => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/jobs?tenantId=${tenantId}`);
};
export const applyForJob = (jobId) => apiClient.post(`/jobs/${jobId}/apply`);
export const submitJobForVerification = (jobData) => apiClient.post('/jobs/submit', jobData);
export const getMyJobApplications = () => apiClient.get('/jobs/my-applications');

// --- UPSKILLING API CALLS ---
export const getUpskillingOpportunities = () => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/upskilling?tenantId=${tenantId}`);
};
export const applyForUpskilling = (opportunityId) => apiClient.post(`/upskilling/${opportunityId}/apply`);
export const getMyUpskillingApplications = () => apiClient.get('/upskilling/my-applications');

// --- CONNECTIONS API CALLS ---
export const getConnections = () => apiClient.get('/connections');
export const getPendingRequests = () => apiClient.get('/connections/requests');
export const sendConnectionRequest = (receiverId) => apiClient.post(`/connections/request/${receiverId}`);
export const acceptConnectionRequest = (connectionId) => apiClient.post(`/connections/accept/${connectionId}`);
export const declineConnectionRequest = (connectionId) => apiClient.post(`/connections/decline/${connectionId}`);

// --- EMPLOYMENT HISTORY API CALLS ---
export const getMyEmploymentHistory = () => apiClient.get('/employment-history/me');
export const addEmploymentHistory = (historyData) => apiClient.post('/employment-history', historyData);
export const updateMyEmploymentHistory = (historyId, historyData) => apiClient.put(`/employment-history/${historyId}`, historyData);

// --- FEEDBACK API CALLS ---
export const submitFeedback = (feedbackData) => apiClient.post('/feedback', feedbackData);

// --- CONTENT API CALLS (Public Access) ---
export const getContentPosts = (type) => {
    const tenantId = getTenantIdFromUrl();
    console.log(`URI: content/${type}/tenantId/${tenantId}`);
    return apiClient.get(`/content/${type}/tenantId/${tenantId}`);
};

// --- MASTER DATA API CALLS (Public Access) ---
export const getCourses = (lang = 'en') => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/courses?lang=${lang}&tenantId=${tenantId}`);
};
export const getCenters = () => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/centers?tenantId=${tenantId}`);
};
export const getBatches = (lang = 'en') => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/batches?lang=${lang}&tenantId=${tenantId}`);
};
export const getBatchesForCourse = (courseId, lang = 'en') => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/courses/${courseId}/batches?lang=${lang}&tenantId=${tenantId}`);
};


// --- ADMIN-SPECIFIC API CALLS ---
export const getPendingApprovals = () => apiClient.get('/users/pending');
export const approveUser = (userId) => apiClient.post(`/users/${userId}/approve`);
export const createJobByAdmin = (jobData) => apiClient.post('/jobs', jobData);
export const getJobApplications = (jobId) => apiClient.get(`/jobs/${jobId}/applications`);
export const updateJobApplicationStatus = (appId, statusDto) => apiClient.put(`/jobs/applications/${appId}`, statusDto);
export const updateJob = (jobId, jobData) => apiClient.put(`/jobs/${jobId}`, jobData); // New
export const getPendingJobs = () => apiClient.get('/jobs/pending');
export const approveJob = (jobId) => apiClient.post(`/jobs/${jobId}/approve`);
export const getHistoryForUser = (userId) => apiClient.get(`/employment-history/user/${userId}`);
export const verifyEmploymentRecord = () => apiClient.get('/employment-history/pending');
export const deleteJob = (jobId) => apiClient.delete(`/jobs/${jobId}`); // New
export const reviewAlumniJob = (jobId, reviewData) => apiClient.post(`/jobs/${jobId}/review`, reviewData); // New

// --- THIS IS THE FIX ---
// Renamed from 'verifyEmploymentRecord' to 'reviewEmploymentRecord'
// Updated endpoint from '/verify' to '/review'
// Sends the new AdminReviewDto payload
export const reviewEmploymentRecord = (historyId, reviewData) => apiClient.post(`/employment-history/${historyId}/review`, reviewData);
// --- END OF FIX ---

export const getPendingEmploymentHistory = () => apiClient.get('/employment-history/pending');
export const getTotalAlumniCount = () => apiClient.get('/users/count');
export const createUpskillingOpportunity = (oppData) => apiClient.post('/upskilling', oppData);
export const getUpskillingApplications = (oppId) => apiClient.get(`/upskilling/${oppId}/applications`);
export const updateUpskillingApplicationStatus = (appId, status) => apiClient.put(`/upskilling/applications/${appId}`, { status });

// Admin Content, Course, Batch Management
export const createContentPost = (postData) => apiClient.post('/content', postData);
export const createCourse = (courseData) => apiClient.post('/courses', courseData);
export const updateCourse = (courseId, courseData) => apiClient.put(`/courses/${courseId}`, courseData);
export const createBatch = (batchData) => apiClient.post('/batches', batchData);
export const updateBatch = (batchId, batchData) => apiClient.put(`/batches/${batchId}`, batchData);


export default apiClient;

