import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// Import your existing API functions, including the new getAlumnusUsers
import { 
    getCourses, 
    getBatches, 
    getCenters, 
    createContentPost, 
    getContentPosts, 
    getAlumnusUsers,
    uploadProfilePhoto, // --- 1. IMPORT THE FILE UPLOAD SERVICE ---
    createCourse, 
    updateCourse, 
    createBatch,  
    updateBatch,
    updateContentPost, // --- NEW: IMPORT FOR EDIT ---
    deleteContentPost  // --- NEW: IMPORT FOR DELETE ---
} from '../../services/apiService';
import CourseEditModal from './CourseEditModal';
import BatchEditModal from './BatchEditModal';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css'; 
import { buildFileUrl } from '../../utils/fileUrl'; // --- IMPORT NEW HELPER ---
import { useAuth } from "../../context/AuthContext";


// --- Sub-Component for Displaying Existing Posts ---
const ContentPostsList = ({ postType, posts, loading, error, onEdit, onDelete }) => {
    
    const getColor = (type) => {
        switch (type) {
            case 'SUCCESS_STORY': return 'border-strive-orange';
            case 'EVENT': return 'border-strive-green';
            default: return 'border-gray-400';
        }
    };

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Loading {postType.replace('_', ' ')}s...</div>;
    }
    
    if (error) {
        return <div className="text-center p-4 text-red-600 bg-red-50 rounded-md">{error}</div>;
    }

    if (posts.length === 0) {
        return <p className="text-gray-500 p-8 text-center">No existing {postType.replace('_', ' ').toLowerCase()} posts found.</p>;
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <div key={post.postId} className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${getColor(post.postType)}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                            {/* --- ADDED PHOTO PREVIEW --- */}
                            {post.postType === 'SUCCESS_STORY' && (
                                <img 
                                    src={buildFileUrl(post.studentPhotoUrl) || `https://placehold.co/80x80/005A9E/F47B20?text=${post.alumnusName ? post.alumnusName.charAt(0) : 'A'}`}
                                    alt="Alumni"
                                    className="w-20 h-20 rounded-md object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src=`https://placehold.co/80x80/005A9E/F47B20?text=${post.alumnusName ? post.alumnusName.charAt(0) : 'A'}`;
                                    }}
                                />
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{post.title}</h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                                {post.postType === 'SUCCESS_STORY' && (
                                    <p className="text-xs text-blue-500 mt-2">Alumnus: {post.alumnusName} | Batch: {post.alumnusBatchName}</p>
                                )}
                                {post.postType === 'EVENT' && (
                                    <p className="text-xs text-gray-500 mt-2">Date: {post.eventDate ? new Date(post.eventDate).toLocaleString() : 'N/A'}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">Posted by {post.authorName} on {new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col space-y-2">
                             {/* --- HOOK UP BUTTONS --- */}
                             <button onClick={() => onEdit(post)} className="text-sm text-blue-600 font-semibold hover:underline">Edit</button>
                             <button onClick={() => onDelete(post.postId, post.title)} className="text-sm text-red-500 font-semibold hover:underline">Delete</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


/**
 * Reusable form component for creating Success Stories and Events.
 * Fix: Now handles photo upload for SUCCESS_STORY.
 */
const ContentPostForm = ({ 
    contentType, 
    onPostCreated, 
    alumnusUsers = [],
    existingPost, // NEW: For editing
    onCancelEdit // NEW: For cancelling edit
}) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [alumnusUserId, setAlumnusUserId] = useState(''); 
    const [eventDate, setEventDate] = useState(null); 
    const [loading, setLoading] = useState(false);

    // --- 2. ADD NEW STATE FOR FILE UPLOAD ---
    const [studentPhotoUrl, setStudentPhotoUrl] = useState(''); // Holds the *URL*
    const [selectedFile, setSelectedFile] = useState(null); // Holds the *File object*
    const [previewUrl, setPreviewUrl] = useState(null); // Holds the local preview URL
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    // --- END OF NEW STATE ---

    const isEditMode = !!existingPost;

    // Pre-fill form if editing
    useEffect(() => {
        if (isEditMode) {
            setTitle(existingPost.title || '');
            setContent(existingPost.content || '');
            if (existingPost.postType === 'SUCCESS_STORY') {
                // --- FIX: Use alumnusUserId from DTO ---
                setAlumnusUserId(existingPost.alumnusUserId || '');
                setStudentPhotoUrl(existingPost.studentPhotoUrl || '');
                setPreviewUrl(buildFileUrl(existingPost.studentPhotoUrl)); // Show existing photo
            }
            if (existingPost.postType === 'EVENT') {
                setEventDate(existingPost.eventDate ? new Date(existingPost.eventDate) : null);
            }
        } else {
            // Clear form if not editing (e.g., switching from edit to create)
            setTitle('');
            setContent('');
            setAlumnusUserId('');
            setEventDate(null);
            setStudentPhotoUrl('');
            setPreviewUrl(null);
            setSelectedFile(null);
        }
    }, [existingPost, isEditMode]);
    
    // Styles
    const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-strive-blue focus:border-strive-blue";
    const buttonStyles = "inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-strive-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-strive-blue disabled:bg-gray-400";

    // --- 3. IMPLEMENT FILE CHANGE HANDLER ---
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file)); // Show local preview immediately

        setIsUploading(true);
        const toastId = toast.loading('Uploading photo...');
        try {
            const response = await uploadProfilePhoto(file); // Use existing service
            const newPhotoUrl = response.data.fileUrl; // Get the URL from the backend
            
            setStudentPhotoUrl(newPhotoUrl); // Save the URL to state
            
            toast.success('Photo uploaded successfully!', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to upload photo.', { id: toastId });
            setSelectedFile(null); // Clear selection on error
            setPreviewUrl(isEditMode ? buildFileUrl(existingPost.studentPhotoUrl) : null); // Revert preview
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    // --- END OF FILE HANDLER ---

    const clearForm = () => {
        setTitle('');
        setContent('');
        setAlumnusUserId(''); 
        setEventDate(null);
        setStudentPhotoUrl('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsUploading(false);
        if (onCancelEdit) onCancelEdit();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const backendPostType = contentType === 'STORY' ? 'SUCCESS_STORY' : contentType;

        if (backendPostType === 'SUCCESS_STORY' && !alumnusUserId) {
             toast.error("Please select an Alumnus for the Success Story. This field is mandatory.");
             setLoading(false);
             return;
        }

        // 4. UPDATE PAYLOAD TO USE studentPhotoUrl FROM STATE
        let postData = {
            title,
            content,
            postType: backendPostType,
            studentPhotoUrl: null, 
            alumnusUserId: null, 
            eventDate: null, 
        };
        
        if (backendPostType === 'SUCCESS_STORY') {
            postData.studentPhotoUrl = studentPhotoUrl || null; // Use the URL from state
            postData.alumnusUserId = alumnusUserId; 
        } else if (backendPostType === 'EVENT') {
            postData.eventDate = eventDate ? eventDate.toISOString() : null;
        }

        try {
            // --- 5. IMPLEMENT EDIT/CREATE LOGIC ---
            if (isEditMode) {
                // When editing, we must pass the AlumnusID from state
                postData.alumnusUserId = alumnusUserId;
                await updateContentPost(existingPost.postId, postData);
                toast.success(`Post updated successfully!`);
            } else {
                await createContentPost(postData);
                toast.success(`New ${contentType === 'STORY' ? 'Success Story' : 'Event'} posted successfully!`);
            }
            // --- END OF EDIT/CREATE LOGIC ---
            
            clearForm();
            if (onPostCreated) onPostCreated(); 

        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || `Failed to post ${contentType.toLowerCase()}.`;
            toast.error(errorMsg);
            console.error(`Error posting ${contentType}:`, err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg border max-w-3xl mx-auto shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {isEditMode ? `Edit ${contentType === 'STORY' ? 'Success Story' : 'Event'}` : `Create New ${contentType === 'STORY' ? 'Success Story' : 'Event'}`}
            </h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor={`title-${contentType}`} className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id={`title-${contentType}`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className={inputStyles}
                    />
                </div>

                {/* Conditional Fields: STORY */}
                {contentType === 'STORY' && (
                    <>
                        <div>
                            <label htmlFor={`alumnus-${contentType}`} className="block text-sm font-medium text-gray-700">Alumnus <span className="text-red-500">*</span></label>
                            <select
                                id={`alumnus-${contentType}`}
                                value={alumnusUserId}
                                onChange={(e) => setAlumnusUserId(e.target.value)}
                                required 
                                className={`${inputStyles} ${isEditMode ? 'bg-gray-100' : ''}`}
                               // disabled={isEditMode} // FIX: Disable, but value is now handled in handleSubmit
                            >
                                <option value="">Select an Alumnus (Required)</option> 
                                {alumnusUsers.map(user => (
                                    <option key={user.userId} value={user.userId}>
                                        {user.fullName} ({user.userId})
                                    </option>
                                ))}
                            </select>
                            {alumnusUsers.length === 0 && <p className="mt-2 text-xs text-red-500">No alumnus users found or loaded.</p>}
                        </div>
                        
                        {/* --- 5. REPLACE TEXT INPUT WITH FILE UPLOADER --- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alumni Photo (Optional)</label>
                            <div className="mt-1 flex items-center space-x-4">
                                {/* Preview Image */}
                                <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center border">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">No Photo</span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200"
                                >
                                    {isUploading ? 'Uploading...' : (previewUrl ? 'Change Photo' : 'Upload Photo')}
                                </button>
                            </div>
                        </div>
                        {/* --- END OF FILE UPLOADER --- */}
                    </>
                )}

                {/* Conditional Fields: EVENT */}
                {contentType === 'EVENT' && (
                    <div>
                        <label htmlFor={`eventDate-${contentType}`} className="block text-sm font-medium text-gray-700">Event Date & Time <span className="text-red-500">*</span></label>
                        <DatePicker
                            selected={eventDate}
                            onChange={(date) => setEventDate(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            id={`eventDate-${contentType}`}
                            className={inputStyles} 
                            placeholderText="Select date and time"
                            required={contentType === 'EVENT'} // Only required for events
                        />
                    </div>
                )}

                <div>
                    <label htmlFor={`content-${contentType}`} className="block text-sm font-medium text-gray-700">Content / Description <span className="text-red-500">*</span></label>
                    <textarea
                        id={`content-${contentType}`}
                        rows="6" 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        className={inputStyles}
                    ></textarea>
                </div>
                <div className="text-right pt-2 flex justify-end space-x-3">
                    {isEditMode && (
                        <button
                            type="button"
                            onClick={clearForm}
                            className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || isUploading}
                        className={buttonStyles}
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : `Post ${contentType === 'STORY' ? 'Story' : 'Event'}`)}
                    </button>
                </div>
            </div>
        </form>
    );
};


/**
 * The main hub component for managing tenant-specific content.
 */
const ContentManagement = () => {

      const { isAdmin, user } = useAuth();
  console.log("Current Role:", user?.role, "Is Admin:", isAdmin);
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('stories'); 

    // Data state
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [centers, setCenters] = useState([]);
    const [alumnusUsers, setAlumnusUsers] = useState([]); 
    
    // Content Posts state
    const [stories, setStories] = useState([]);
    const [events, setEvents] = useState([]);
    
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postError, setPostError] = useState(null);

    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingBatch, setEditingBatch] = useState(null);
    const userRole = localStorage.getItem("role"); 
    // --- State for editing content posts ---
    const [editingPost, setEditingPost] = useState(null);
    
    // Consolidated Data Fetching Logic
    const loadMasterData = useCallback(async () => {
        setLoadingMasterData(true);
        try {
            console.log("Loading content master data..." , isAdmin);
            const [coursesRes, batchesRes, centersRes, alumnusRes] = await Promise.all([
                getCourses(i18n.language, isAdmin),
                getBatches(i18n.language),
                getCenters(),
                getAlumnusUsers() 
            ]);
            setCourses(coursesRes.data || []);
            setBatches(batchesRes.data || []);
            setCenters(centersRes.data || []);
            setAlumnusUsers(alumnusRes.data || []); 
        } catch (err) {
            console.error("Failed to load content master data", err);
            toast.error("Failed to load Courses/Batches/Centers/Alumni.");
        }
        setLoadingMasterData(false);
    }, [i18n.language]);

    useEffect(() => {
        loadMasterData();
    }, [loadMasterData]);
    
    // Fetch Content Posts (Stories/Events) when tab changes
    const fetchContentPosts = useCallback(async (type) => {
        setLoadingPosts(true);
        setPostError(null);
        const backendType = type === 'stories' ? 'SUCCESS_STORY' : (type === 'events' ? 'EVENT' : null);
        
        if (!backendType) {
            setLoadingPosts(false);
            return;
        }

        try {
            const { data } = await getContentPosts(backendType);
            if (type === 'stories') {
                setStories(data || []);
            } else if (type === 'events') {
                setEvents(data || []);
            }
        } catch (err) {
            console.error(`Failed to load ${type}:`, err);
            setPostError(`Failed to load ${type} content.`);
        } finally {
            setLoadingPosts(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'stories' || activeTab === 'events') {
            fetchContentPosts(activeTab);
        }
    }, [activeTab, fetchContentPosts]);
    
    // Helper to refresh posts after creation/deletion
    const handlePostSaved = () => {
        fetchContentPosts(activeTab);
        setEditingPost(null); // Clear editing state
    };

    const handleContentEdit = (post) => {
        setEditingPost(post);
        // Ensure the correct form is visible
        setActiveTab(post.postType === 'SUCCESS_STORY' ? 'stories' : 'events');
    };

    // --- 6. IMPLEMENT DELETE LOGIC ---
    const handleContentDelete = async (postId, postTitle) => {
        if (window.confirm(`Are you sure you want to delete the post: "${postTitle}"?`)) {
            const toastId = toast.loading('Deleting post...');
            try {
                await deleteContentPost(postId);
                toast.success('Post deleted successfully.', { id: toastId });
                handlePostSaved(); // Refresh list
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to delete post.', { id: toastId });
            }
        }
    };
    // --- END OF DELETE LOGIC ---
    
    const handleCourseSaved = () => {
        loadMasterData(); // Refresh courses
    };
    
    const handleBatchSaved = () => {
        loadMasterData(); // Refresh batches
    };

    // --- Content Rendering Logic ---
    
    const actionButton = "bg-strive-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90";
    const editButton = "text-sm text-strive-orange font-semibold hover:underline";
    
    const tabButton = (tabName) => {
      const isActive = activeTab === tabName;
      return `whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
        isActive
          ? 'border-strive-blue text-strive-blue'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`;
    };


    const getCourseDisplayName = (course) => {
  if (!course?.translations || course.translations.length === 0) return "Unnamed Course";

  const currentLang = i18n.language?.toLowerCase() || "en";

  // Find translation matching current UI language
  const translation = course.translations.find(
    (t) => t.languageCode?.toLowerCase() === currentLang
  );

  // Fallback: English or first translation
  return (
    translation?.name ||
    course.translations.find((t) => t.languageCode?.toLowerCase() === "en")?.name ||
    course.translations[0]?.name ||
    "Unnamed Course"
  );
};

    const renderSubContent = () => {
        const loading = loadingMasterData || loadingPosts;

        // --- FIX: Corrected typo from activeBTab to activeTab ---
        if (loading && (activeTab === 'courses' || activeTab === 'batches' || activeTab === 'stories' || activeTab === 'events')) {
             return <div className="text-center p-8 text-gray-500">Loading data...</div>;
        }
        // --- END OF FIX ---

        switch(activeTab) {
            case 'courses':
                return (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Courses</h2>
                            <button onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }} className={actionButton}>
                                + Add New Course
                            </button>
                        </div>
                        <div className="space-y-4">
                            {courses.map(course => (
                                <div key={course.courseId} className="p-4 bg-white rounded-md border shadow-sm flex justify-between items-center">
                                  <h3 className="font-semibold text-lg text-strive-blue">{getCourseDisplayName(course)}
</h3>
                                    <button onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }} className={editButton}>Edit</button>
                                </div>
                            ))}
                             {courses.length === 0 && !loading && <p className="text-gray-500">No courses found.</p>}
                        </div>
                    </div>
                );

            case 'batches':
                 return (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Batches</h2>
                            <button onClick={() => { setEditingBatch(null); setIsBatchModalOpen(true); }} className={actionButton}>
                                + Add New Batch
                            </button>
                        </div>
                         <div className="space-y-4">
                            {batches.map(batch => (
                                <div key={batch.batchId} className="p-4 bg-white rounded-md border shadow-sm flex justify-between items-center">
                                    <h3 className="font-semibold text-lg text-strive-blue">{batch.batchName}</h3>
                                    <button onClick={() => { setEditingBatch(batch); setIsBatchModalOpen(true); }} className={editButton}>Edit</button>
                                </div>
                            ))}
                            {batches.length === 0 && !loading && <p className="text-gray-500">No batches found.</p>}
                        </div>
                    </div>
                );

            case 'stories':
                return (
                    <div className="p-4 space-y-8">
                        <ContentPostForm 
                            contentType="STORY" 
                            alumnusUsers={alumnusUsers} 
                            onPostCreated={handlePostSaved}
                            existingPost={editingPost && editingPost.postType === 'SUCCESS_STORY' ? editingPost : null}
                            onCancelEdit={() => setEditingPost(null)}
                        />
                        <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Existing Success Stories ({stories.length})</h3>
                        <ContentPostsList 
                            postType="SUCCESS_STORY" 
                            posts={stories} 
                            loading={loadingPosts}
                            error={postError}
                            onEdit={handleContentEdit}
                            onDelete={handleContentDelete}
                        />
                    </div>
                );

            case 'events':
                return (
                    <div className="p-4 space-y-8">
                        <ContentPostForm 
                            contentType="EVENT"
                            alumnusUsers={alumnusUsers} 
                            onPostCreated={handlePostSaved}
                            existingPost={editingPost && editingPost.postType === 'EVENT' ? editingPost : null}
                            onCancelEdit={() => setEditingPost(null)}
                        />
                        <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Existing Events ({events.length})</h3>
                        <ContentPostsList 
                            postType="EVENT" 
                            posts={events} 
                            loading={loadingPosts}
                            error={postError}
                            onEdit={handleContentEdit}
                            onDelete={handleContentDelete}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-inner min-h-[600px]">
            {/* Sub-navigation */}
            <div className="mb-6 border-b border-gray-300 bg-white rounded-t-lg shadow-sm">
                <nav className="-mb-px flex space-x-6 px-4 overflow-x-auto" aria-label="Content Tabs">
                    <button onClick={() => setActiveTab('courses')} className={tabButton('courses')}>Manage Courses</button>
                    <button onClick={() => setActiveTab('batches')} className={tabButton('batches')}>Manage Batches</button>
                    <button onClick={() => setActiveTab('stories')} className={tabButton('stories')}>Success Stories</button>
                    <button onClick={() => setActiveTab('events')} className={tabButton('events')}>Events</button>
                </nav>
            </div>

            <div className="bg-gray-50 rounded-lg shadow">
                 {renderSubContent()}
            </div>
            
            {/* Modals for editing Courses/Batches */}
            {isCourseModalOpen && (
                <CourseEditModal
                    existingCourse={editingCourse}
                    onClose={() => setIsCourseModalOpen(false)}
                    onCourseSaved={handleCourseSaved}
                />
            )}
            {isBatchModalOpen && (
                <BatchEditModal
                    existingBatch={editingBatch}
                    onClose={() => setIsBatchModalOpen(false)}
                    onBatchSaved={handleBatchSaved}
                    courses={courses}
                    centers={centers}
                />
            )}
        </div>
    );
};

export default ContentManagement;

