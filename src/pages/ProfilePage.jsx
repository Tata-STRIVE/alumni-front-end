import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    getMyProfile, 
    getMyEmploymentHistory, 
    addEmploymentHistory, 
    updateMyProfile, 
    updateMyEmploymentHistory, 
    uploadProfilePhoto,
    requestMobileChangeOtp,
    verifyMobileChangeOtp   
} from '../services/apiService';
import EmploymentHistoryModal from '../components/profile/EmploymentHistoryModal';
import toast from 'react-hot-toast';
import apiClient from '../services/apiService'; // Import apiClient to get the baseURL

/**
 * Modal for the secure 2-step mobile number change
 */
const ChangeMobileModal = ({ onClose, onMobileChangeSuccess }) => {
    const [step, setStep] = useState(1); // 1: Enter new number, 2: Enter OTP
    const [newMobile, setNewMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await requestMobileChangeOtp({ newMobileNumber: newMobile });
            setStep(2);
            toast.success(`OTP sent to ${newMobile}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await verifyMobileChangeOtp({ newMobileNumber: newMobile, otp });
            toast.success('Mobile number updated successfully! Please log in again.');
            onMobileChangeSuccess(); // This should trigger a logout
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Change Mobile Number</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800">&times;</button>
                </div>
                
                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="p-6 space-y-4">
                        <p className="text-sm text-gray-600">Enter your new mobile number. An OTP will be sent to verify it.</p>
                        {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
                        <div>
                            <label htmlFor="newMobile" className="block text-sm font-medium text-gray-700">New Mobile Number</label>
                            <input
                                type="tel"
                                id="newMobile"
                                value={newMobile}
                                onChange={(e) => setNewMobile(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="9876543210"
                            />
                        </div>
                        <div className="pt-2 text-right">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-strive-blue hover:bg-opacity-90 disabled:bg-gray-400"
                            >
                                {loading ? 'Sending OTP...' : 'Get OTP'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
                        <p className="text-sm text-gray-600">An OTP has been sent to <strong>{newMobile}</strong>. Please enter it below.</p>
                        {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Verification OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="123456"
                            />
                        </div>
                        <div className="pt-2 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => { setStep(1); setError(''); }}
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Change Number
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-strive-green hover:bg-opacity-90 disabled:bg-gray-400"
                            >
                                {loading ? 'Verifying...' : 'Verify & Update'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};


/**
 * Main Profile Page Component
 */
const ProfilePage = () => {
    const { user, login, logout } = useAuth(); 
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // This state holds the data being edited in the form
    const [editData, setEditData] = useState({
        email: '',
        currentCompany: '',
        currentCity: '',
        highestEducationQualification: '',
        profilePictureUrl: '', 
    });

    const [editingHistoryItem, setEditingHistoryItem] = useState(null);
    const [isChangeMobileModalOpen, setIsChangeMobileModalOpen] = useState(false);
    const fileInputRef = useRef(null); 

    // --- FIX 2: State for new file selection ---
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    // --- End of FIX 2 ---

    const hasPresentJob = history.some(h => 
        h.endDate === null && (!editingHistoryItem || h.employmentId !== editingHistoryItem.employmentId)
    );

    // Fetches all data for the profile page
    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, historyRes] = await Promise.all([
                getMyProfile(),
                getMyEmploymentHistory()
            ]);
            
            setProfile(profileRes.data);
            setHistory(historyRes.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
            
            // Initialize editData state with fetched profile data, using fallbacks
            setEditData({
                email: profileRes.data.email || '',
                currentCompany: profileRes.data.currentCompany || '',
                currentCity: profileRes.data.currentCity || '',
                highestEducationQualification: profileRes.data.highestEducationQualification || '',
                profilePictureUrl: profileRes.data.profilePictureUrl || '',
            });
        } catch (err) {
            toast.error('Failed to load profile data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => { 
        if(user) { // Only fetch data if user is logged in
            fetchData(); 
        }
    }, [user]); // Re-run if user context changes

    // --- Employment History Modal Handlers ---
    const handleSubmitHistory = async (historyData) => {
        const isEditingRecord = !!editingHistoryItem;
        const toastId = toast.loading(isEditingRecord ? 'Updating record...' : 'Adding record...');
        
        try {
            if (isEditingRecord) {
                await updateMyEmploymentHistory(editingHistoryItem.employmentId, historyData);
            } else {
                await addEmploymentHistory(historyData);
            }
            await fetchData(); // Refresh all page data
            setIsModalOpen(false);
            setEditingHistoryItem(null);
            toast.success(isEditingRecord ? 'Record updated!' : 'Record added!', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save record.', { id: toastId });
        }
    };

    const handleEditHistory = (historyItem) => {
        setEditingHistoryItem(historyItem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingHistoryItem(null);
    };
    
    // --- Profile Edit Handlers ---
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        // --- FIX: Clear file previews on cancel ---
        setSelectedFile(null);
        setPreviewUrl(null);
        // --- End of FIX ---
        if (!isEditing && profile) {
            // Reset editData to profile's current state when "Edit" is clicked
            setEditData({
                email: profile.email || '',
                currentCompany: profile.currentCompany || '',
                currentCity: profile.currentCity || '',
                highestEducationQualification: profile.highestEducationQualification || '',
                profilePictureUrl: profile.profilePictureUrl || '',
            });
        }
    };

    // Handles changes to all text inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    // --- FIX 2: Updated File Change Handler ---
    // This now only selects the file and creates a local preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }

        setSelectedFile(file);
        // Create a temporary local URL for preview
        setPreviewUrl(URL.createObjectURL(file));
        toast.success('Photo selected. Click "Save Changes" to apply.');
        
        // Reset file input to allow re-uploading the same file if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    // --- End of FIX 2 ---


    // Handles saving the entire profile form
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Saving profile...');
        
        try {
            let profileData = { ...editData };

            // --- FIX 2: Transactional File Upload ---
            // If a new file was selected, upload it first
            if (selectedFile) {
                toast.loading('Uploading photo...', { id: toastId });
                const uploadResponse = await uploadProfilePhoto(selectedFile);
                const newPhotoUrl = uploadResponse.data.fileUrl;
                
                // Add the *new* URL to the data we are about to save
                profileData.profilePictureUrl = newPhotoUrl;
            }
            // --- End of FIX 2 ---

            toast.loading('Saving profile data...', { id: toastId });
            
            // Send the entire 'profileData' object to the backend
            const { data } = await updateMyProfile(profileData);
            
            setProfile(data); // Set profile to the saved data
            setIsEditing(false);
            setSelectedFile(null); // Clear selections
            setPreviewUrl(null);
            
            // Re-login to update JWT if email (or other sensitive data) changed
            login(localStorage.getItem('token')); 
            
            toast.success('Profile updated successfully!', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };
    
    // --- Mobile Change Modal Handler ---
    const handleMobileChangeSuccess = () => {
        setIsChangeMobileModalOpen(false);
        logout(); // Force logout after successful mobile change
    };

    // --- FIX 1: Helper to build the full, absolute URL for display ---
    const buildFileUrl = (relativePath) => {
        if (!relativePath) {
            return null;
        }
        // Use the base URL from the imported apiClient instance
        // This ensures it points to http://localhost:8080/api
        // and constructs the correct download path.
        return `http://localhost:8080${relativePath}`;
    };
    // --- End of FIX 1 ---


    // --- Render Logic ---
    if (loading && !profile) return <div className="text-center py-10 text-gray-500">Loading profile...</div>;
    if (!profile) return <div className="text-center py-10 text-red-500">Could not load profile.</div>;
    // --- FIX 1 & 2: Updated logic for photoSrc ---
    let photoSrc = null;
    if (previewUrl) {
        // 1. Highest priority: Show the new local file preview
        photoSrc = previewUrl;
    } else if (isEditing && editData.profilePictureUrl) {
        // 2. Show the URL from the edit form (which might be new or old)
        photoSrc = buildFileUrl(editData.profilePictureUrl);
    } else if (profile && profile.profilePictureUrl) {
        // 3. Show the saved URL from the main profile object
        photoSrc = buildFileUrl(profile.profilePictureUrl);
    }
    // --- End of FIX 1 & 2 ---


    return (
        <>
            <main className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                    <button 
                        onClick={handleEditToggle} 
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                            isEditing 
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                            : 'bg-strive-blue text-white hover:bg-opacity-90'
                        }`}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
                
                <form onSubmit={handleProfileSave}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Details Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="text-center">
                                    {/* Profile Picture Display */}
                                    <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden bg-gray-200 text-gray-500 border border-gray-300">
                                        {photoSrc ? (
                                            <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-5xl font-bold">{profile.fullName?.charAt(0) || '?'}</span>
                                        )}
                                    </div>
                                    
                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg"
                                    />
                                    {/* "Change Photo" Button (only in edit mode) */}
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-sm text-strive-blue font-semibold hover:underline mb-4"
                                        >
                                            Change Photo
                                        </button>
                                    )}
                                    
                                    <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                                    <p className="text-gray-600">{profile.mobileNumber}</p>
                                    <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                        profile.status === 'ACTIVE' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {profile.status}
                                    </span>
                                </div>
                                
                                {/* Form Fields */}
                                <div className="mt-6 space-y-4">
                                    {/* Email (Editable) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Email</label>
                                        {isEditing ? (
                                            <input type="email" name="email" value={editData.email || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                        ) : (
                                            <p className="text-gray-900 font-semibold">{profile.email || 'Not set'}</p>
                                        )}
                                    </div>

                                    {/* Highest Education (Editable) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Highest Education</label>
                                        {isEditing ? (
                                            <input type="text" name="highestEducationQualification" value={editData.highestEducationQualification || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                        ) : (
                                            <p className="text-gray-900 font-semibold">{profile.highestEducationQualification || 'Not set'}</p>
                                        )}
                                    </div>
                                    
                                    {/* Current Company (Editable) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Current Company</label>
                                        {isEditing ? (
                                            <input type="text" name="currentCompany" value={editData.currentCompany || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                        ) : (
                                            <p className="text-gray-900 font-semibold">{profile.currentCompany || 'Not set'}</p>
                                        )}
                                    </div>
                                    
                                    {/* Current City (Editable) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Current City</label>
                                        {isEditing ? (
                                            <input type="text" name="currentCity" value={editData.currentCity || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                        ) : (
                                            <p className="text-gray-900 font-semibold">{profile.currentCity || 'Not set'}</p>
                                        )}
                                    </div>
                                    
                                    {/* Save Button (only in edit mode) */}
                                    {isEditing && (
                                        <button type="submit" disabled={loading} className="w-full mt-4 px-4 py-2 bg-strive-green text-white rounded-md font-semibold hover:bg-opacity-90 disabled:bg-gray-400">
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Change Mobile Button (always visible) */}
                            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                                <h3 className="text-lg font-semibold text-gray-800">Security</h3>
                                <p className="text-sm text-gray-600 mt-2">Need to change your login mobile number?</p>
                                <button
                                    type="button"
                                    onClick={() => setIsChangeMobileModalOpen(true)}
                                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md font-semibold hover:bg-gray-200"
                                >
                                    Request Mobile Number Change
                                </button>
                            </div>
                        </div>

                        {/* Employment History Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold">Employment History</h3>
                                    <button type="button" onClick={() => setIsModalOpen(true)} className="text-sm bg-strive-orange text-white px-4 py-2 rounded-md hover:bg-opacity-9g0">
                                        + Add New
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {history.length > 0 ? history.map(h => (
                                        <div key={h.employmentId} className="p-4 border rounded-md shadow-sm bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg text-strive-blue">{h.jobTitle}</p>
                                                    <p className="text-md text-gray-700">{h.companyName}</p>
                                                    <p className="text-sm text-gray-500">{h.location || 'No location provided'}</p> 
                                                    <p className="text-sm text-gray-500">{new Date(h.startDate).toLocaleDateString()} - {h.endDate ? new Date(h.endDate).toLocaleDateString() : 'Present'}</p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                        h.status === 'VERIFIED' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {h.status.replace('_', ' ')}
                                                    </span>
                                                    {/* Only allow editing PENDING records or the current 'Present' job (to add an end date) */}
                                                    {(h.status === 'PENDING_VERIFICATION' || h.endDate === null) && (
                                                        <button type
                                                            ="button" 
                                                            onClick={() => handleEditHistory(h)} 
                                                            className="text-xs text-strive-blue font-semibold hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-gray-500">No employment history added.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
            
            {/* Employment History Modal */}
            {isModalOpen && (
                <EmploymentHistoryModal 
                    onClose={handleCloseModal} 
                    onSubmit={handleSubmitHistory}
                    hasPresentJob={hasPresentJob}
                    existingHistory={editingHistoryItem} 
                />
            )}
            
            {/* Change Mobile Modal */}
            {isChangeMobileModalOpen && (
                <ChangeMobileModal 
                    onClose={() => setIsChangeMobileModalOpen(false)}
                    onMobileChangeSuccess={handleMobileChangeSuccess}
                />
            )}
        </>
    );
};

export default ProfilePage;

