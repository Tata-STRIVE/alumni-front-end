import axios from 'axios';

// Create an Axios instance with a base URL for your Spring Boot backend.
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json',
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
    
    return currentTenantId.toUpperCase();
};


/**
 * Axios Request Interceptor
 * This automatically adds the JWT token (if it exists) to the 'Authorization' header
 * for every request that goes to a secure endpoint.
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- AUTHENTICATION API CALLS ---
export const requestOtp = (mobileNumber, tenantId) => apiClient.post('/auth/login', { mobileNumber, tenantId });
export const verifyOtp = (mobileNumber, tenantId, otp) => apiClient.post('/auth/verify-otp', { mobileNumber, tenantId, otp });
export const registerAlumnus = (registrationData) => apiClient.post('/auth/register', registrationData);

// --- USER & PROFILE API CALLS ---
export const getMyProfile = () => apiClient.get('/users/me');
export const updateMyProfile = (profileData) => apiClient.put('/users/me', profileData);
export const getAlumnusUsers = () => apiClient.get('/users/alumnus/list'); // UPDATED to new controller path

// --- JOB BOARD API CALLS ---
export const getJobs = () => apiClient.get('/jobs');
export const applyForJob = (jobId) => apiClient.post(`/jobs/${jobId}/apply`);
export const submitJobForVerification = (jobData) => apiClient.post('/jobs/submit', jobData);
export const getMyJobApplications = () => apiClient.get('/jobs/my-applications');

// --- UPSKILLING API CALLS ---
export const getUpskillingOpportunities = () => apiClient.get('/upskilling');
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

// --- CONTENT API CALLS ---
// export const getContentPosts = (type) => apiClient.get(`/content/${type}`);
export const createContentPost = (postData) => apiClient.post('/content', postData);

// --- MASTER DATA API CALLS (Used by public and admin) ---
//export const getCourses = (lang = 'en') => apiClient.get(`/courses?lang=${lang}`);
//export const getCenters = () => apiClient.get('/centers');
//export const getBatches = (lang = 'en') => apiClient.get(`/batches?lang=${lang}`);
//export const getBatchesForCourse = (courseId, lang = 'en') => apiClient.get(`/courses/${courseId}/batches?lang=${lang}`);


// --- ADMIN COURSE & BATCH MANAGEMENT API CALLS (NEW) ---

// Course Management
export const createCourse = (courseData) => apiClient.post('/courses', courseData);
export const updateCourse = (courseId, courseData) => apiClient.put(`/courses/${courseId}`, courseData);

// Batch Management
export const createBatch = (batchData) => apiClient.post('/batches', batchData);
export const updateBatch = (batchId, batchData) => apiClient.put(`/batches/${batchId}`, batchData);

// --- ADMIN DASHBOARD & APPROVAL API CALLS ---
export const getPendingApprovals = () => apiClient.get('/users/pending');
export const approveUser = (userId) => apiClient.post(`/users/${userId}/approve`);
export const createJobByAdmin = (jobData) => apiClient.post('/jobs', jobData);
export const getJobApplications = (jobId) => apiClient.get(`/jobs/${jobId}/applications`);
export const updateJobApplicationStatus = (appId, status) => apiClient.put(`/jobs/applications/${appId}`, status); // Status is expected as { status: 'STATUS' }
export const getPendingJobs = () => apiClient.get('/jobs/pending');
export const approveJob = (jobId) => apiClient.post(`/jobs/${jobId}/approve`);
export const getHistoryForUser = (userId) => apiClient.get(`/employment-history/user/${userId}`);
export const verifyEmploymentRecord = (historyId) => apiClient.post(`/employment-history/${historyId}/verify`);
export const getPendingEmploymentHistory = () => apiClient.get('/employment-history/pending');
export const getTotalAlumniCount = () => apiClient.get('/users/count');



// --- CONTENT API CALLS (Public Access) ---

/**
 * Fetches public content (Success Stories, Events, etc.) by type.
 * @param {string} type - The post type (e.g., 'SUCCESS_STORY', 'EVENT').
 * @returns {Promise<AxiosResponse>}
 */
export const getContentPosts = (type) => {
    const tenantId = getTenantIdFromUrl();
        console.log('Tenant ID: ', tenantId);

      console.log(`URI: content/${type}/tenantId/${tenantId}`);

    return apiClient.get(`/content/${type}/tenantId/${tenantId}`);
};

// --- MASTER DATA API CALLS (Public Access) ---

/**
 * Gets all courses for the tenant.
 * @param {string} lang - Language code (e.g., 'en', 'hi').
 * @returns {Promise<AxiosResponse>}
 */
export const getCourses = (lang = 'en') => {
    const tenantId = getTenantIdFromUrl();
    
    console.log('Tenant ID:', tenantId);
    // Pass tenantId as a parameter, if the backend uses it for public endpoints
    return apiClient.get(`/courses?lang=${lang}&tenantId=${tenantId}`);
};

/**
 * Gets all centers for the tenant.
 * @returns {Promise<AxiosResponse>}
 */
export const getCenters = () => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/centers?tenantId=${tenantId}`);
};

/**
 * Gets all batches for the tenant.
 * @param {string} lang - Language code (e.g., 'en', 'hi').
 * @returns {Promise<AxiosResponse>}
 */
export const getBatches = (lang = 'en') => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/batches?lang=${lang}&tenantId=${tenantId}`);
};

/**
 * Gets batches for a specific course.
 * @param {number} courseId
 * @param {string} lang
 * @returns {Promise<AxiosResponse>}
 */
export const getBatchesForCourse = (courseId, lang = 'en') => {
    const tenantId = getTenantIdFromUrl();
    return apiClient.get(`/courses/${courseId}/batches?lang=${lang}&tenantId=${tenantId}`);
};






export default apiClient;
