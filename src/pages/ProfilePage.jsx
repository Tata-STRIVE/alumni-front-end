import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, getMyEmploymentHistory, addEmploymentHistory, updateMyProfile, updateMyEmploymentHistory } from '../services/apiService';
import EmploymentHistoryModal from '../components/profile/EmploymentHistoryModal';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ email: '', currentCompany: '', currentCity: '' });
    const [editingHistoryItem, setEditingHistoryItem] = useState(null);

    const hasPresentJob = history.some(h => 
        h.endDate === null && (!editingHistoryItem || h.employmentId !== editingHistoryItem.employmentId)
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, historyRes] = await Promise.all([
                getMyProfile(),
                getMyEmploymentHistory()
            ]);
            setProfile(profileRes.data);
            setHistory(historyRes.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
            setEditData({
                email: profileRes.data.email || '',
                currentCompany: profileRes.data.currentCompany || '',
                currentCity: profileRes.data.currentCity || ''
            });
        } catch (err) {
            toast.error('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmitHistory = async (historyData) => {
        const isEditingRecord = !!editingHistoryItem;
        const toastId = toast.loading(isEditingRecord ? 'Updating record...' : 'Adding record...');
        
        try {
            if (isEditingRecord) {
                await updateMyEmploymentHistory(editingHistoryItem.employmentId, historyData);
            } else {
                await addEmploymentHistory(historyData);
            }
            await fetchData();
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
    
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setEditData({
                email: profile.email || '',
                currentCompany: profile.currentCompany || '',
                currentCity: profile.currentCity || ''
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Saving profile...');
        try {
            const { data } = await updateMyProfile(editData);
            setProfile(data);
            setIsEditing(false);
            login(localStorage.getItem('token')); 
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) return <div className="text-center py-10 text-gray-500">Loading profile...</div>;
    if (!profile) return <div className="text-center py-10 text-red-500">Could not load profile.</div>;

    return (
        <>
            <main className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                    <button 
                        onClick={handleEditToggle} 
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isEditing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-strive-blue text-white hover:bg-opacity-90'}`}
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
                                    <div className="w-32 h-32 rounded-full bg-strive-orange text-white mx-auto mb-4 flex items-center justify-center">
                                        <span className="text-5xl font-bold">{user.fullName.charAt(0)}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                                    <p className="text-gray-600">{profile.mobileNumber}</p>
                                    <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${profile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {profile.status}
                                    </span>
                                </div>
                                <div className="mt-6 space-y-4">
                                    {/* --- Email (Editable) --- */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Email</label>
                                        {isEditing ? (
                                            <input type="email" name="email" value={editData.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                        ) : (
                                            <p className="text-gray-900 font-semibold">{profile.email || 'Not set'}</p>
                                        )}
                                    </div>
                                    {/* --- Current Company (Editable) --- */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Current Company</label>
                                        {isEditing ? (
                                            <input type="text" name="currentCompany" value={editData.currentCompany} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                        ) : (
                                            <p className="text-gray-900 font-semibold">{profile.currentCompany || 'Not set'}</p>
                                        )}
                                    </div>
                                    {/* --- Current City (Editable) --- */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Current City</label>
                                        {isEditing ? (
                                            <input type="text" name="currentCity" value={editData.currentCity} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                        ) : (
                                            <p className="text-gray-900 font-semibold">{profile.currentCity || 'Not set'}</p>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button type="submit" disabled={loading} className="w-full mt-4 px-4 py-2 bg-strive-green text-white rounded-md font-semibold hover:bg-opacity-90 disabled:bg-gray-400">
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Employment History Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold">Employment History</h3>
                                    <button type="button" onClick={() => setIsModalOpen(true)} className="text-sm bg-strive-orange text-white px-4 py-2 rounded-md hover:bg-opacity-90">
                                        + Add New
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {history.length > 0 ? history.map(h => (
                                        <div key={h.employmentId} className="p-4 border rounded-md">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg text-strive-blue">{h.jobTitle}</p>
                                                    <p className="text-md text-gray-700">{h.companyName}</p>
                                                    <p className="text-sm text-gray-500">{h.location}</p> 
                                                    <p className="text-sm text-gray-500">{h.startDate} - {h.endDate || 'Present'}</p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${h.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {h.status.replace('_', ' ')}
                                                    </span>
                                                    {/* --- THE FIX IS HERE --- */}
                                                    {/* Only show "Edit" if the job is PENDING or it is the current "Present" job */}
                                                    {(h.status === 'PENDING_VERIFICATION' || h.endDate === null) && (
                                                        <button type="button" onClick={() => handleEditHistory(h)} className="text-xs text-strive-blue font-semibold hover:underline">
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
            {isModalOpen && (
                <EmploymentHistoryModal 
                    onClose={handleCloseModal} 
                    onSubmit={handleSubmitHistory}
                    hasPresentJob={hasPresentJob}
                    existingHistory={editingHistoryItem} 
                />
            )}
        </>
    );
};

export default ProfilePage;

