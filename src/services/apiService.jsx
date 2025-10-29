import axios from 'axios';

// Create an Axios instance with a base URL for your Spring Boot backend.
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

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
// NEW: API call to update the user's profile
export const updateMyProfile = (profileData) => apiClient.put('/users/me', profileData);
// --- NEW ADMIN USER LIST CALL ---
export const getAlumnusUsers = () => apiClient.get('/users/alumnus/list');

// --- JOB BOARD API CALLS ---
export const getJobs = () => apiClient.get('/jobs');
export const applyForJob = (jobId) => apiClient.post(`/jobs/${jobId}/apply`);
export const submitJobForVerification = (jobData) => apiClient.post('/jobs/submit', jobData);
//  Get all job applications for the logged-in user
export const getMyJobApplications = () => apiClient.get('/jobs/my-applications');

// --- UPSKILLING API CALLS ---
export const getUpskillingOpportunities = () => apiClient.get('/upskilling');
export const applyForUpskilling = (opportunityId) => apiClient.post(`/upskilling/${opportunityId}/apply`);
//  Get all upskilling applications for the logged-in user
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
export const getContentPosts = (type) => apiClient.get(`/content/${type}`);
export const createContentPost = (postData) => apiClient.post('/content', postData);


// --- ADMIN-SPECIFIC API CALLS ---
export const getPendingApprovals = () => apiClient.get('/users/pending');
export const approveUser = (userId) => apiClient.post(`/users/${userId}/approve`);
export const createJobByAdmin = (jobData) => apiClient.post('/jobs', jobData);
export const getJobApplications = (jobId) => apiClient.get(`/jobs/${jobId}/applications`);
export const updateJobApplicationStatus = (appId, status) => apiClient.put(`/jobs/applications/${appId}`, { status });
export const getPendingJobs = () => apiClient.get('/jobs/pending');
export const approveJob = (jobId) => apiClient.post(`/jobs/${jobId}/approve`);
export const getHistoryForUser = (userId) => apiClient.get(`/employment-history/user/${userId}`);
export const verifyEmploymentRecord = (historyId) => apiClient.post(`/employment-history/${historyId}/verify`);
export const getPendingEmploymentHistory = () => apiClient.get('/employment-history/pending');
export const getTotalAlumniCount = () => apiClient.get('/users/count');
export const createUpskillingOpportunity = (oppData) => apiClient.post('/upskilling', oppData);
export const getUpskillingApplications = (oppId) => apiClient.get(`/upskilling/${oppId}/applications`);
export const updateUpskillingApplicationStatus = (appId, status) => apiClient.put(`/upskilling/applications/${appId}`, { status });
export const getCourses = (lang = 'en') => apiClient.get(`/courses?lang=${lang}`);
export const getCenters = () => apiClient.get('/centers');
export const getBatches = (lang = 'en') => apiClient.get(`/batches?lang=${lang}`);
export const getBatchesForCourse = (courseId, lang = 'en') => apiClient.get(`/courses/${courseId}/batches?lang=${lang}`);


export default apiClient;
