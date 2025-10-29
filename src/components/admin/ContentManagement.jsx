import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// Import your existing API functions, including the new getAlumnusUsers
import { getCourses, getBatches, getCenters, createContentPost, getContentPosts, getAlumnusUsers } from '../../services/apiService';
import CourseEditModal from './CourseEditModal';
import BatchEditModal from './BatchEditModal';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css'; 

// --- Sub-Component for Displaying Existing Posts ---
const ContentPostsList = ({ postType, posts, loading, error }) => {
    
    const getColor = (type) => {
        switch (type) {
            case 'SUCCESS_STORY': return 'border-strive-orange';
            case 'EVENT': return 'border-strive-green';
            default: return 'border-gray-400';
        }
    };
    
    const handleDelete = (postId) => {
        toast.error(`Delete functionality for Post ID ${postId} is not implemented yet.`);
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
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{post.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                            {post.postType === 'SUCCESS_STORY' && (
                                <p className="text-xs text-blue-500 mt-2">Alumnus: {post.alumnusName} | Batch: {post.alumnusBatchName}</p>
                            )}
                             {post.postType === 'EVENT' && (
                                <p className="text-xs text-gray-500 mt-2">Date: {new Date(post.eventDate).toLocaleDateString()} {new Date(post.eventDate).toLocaleTimeString()}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Posted by {post.authorName} on {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                             <button className="text-sm text-blue-600 font-semibold hover:underline">Edit</button>
                             <button onClick={() => handleDelete(post.postId)} className="text-sm text-red-500 font-semibold hover:underline">Delete</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


/**
 * Reusable form component for creating Success Stories and Events.
 * Fix: Now handles mandatory alumnusUserId for SUCCESS_STORY.
 */
const ContentPostForm = ({ 
    contentType, 
    onPostCreated, 
    alumnusUsers = [] // Prop with list of users
}) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [studentPhotoUrl, setStudentPhotoUrl] = useState('');
    const [alumnusUserId, setAlumnusUserId] = useState(''); // Holds the selected user ID (string)
    const [eventDate, setEventDate] = useState(null); 
    const [loading, setLoading] = useState(false);
    
    // Styles
    const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-strive-blue focus:border-strive-blue";
    const buttonStyles = "inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-strive-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-strive-blue disabled:bg-gray-400";


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const backendPostType = contentType === 'STORY' ? 'SUCCESS_STORY' : contentType;

        // --- CRITICAL VALIDATION FIX ---
        if (backendPostType === 'SUCCESS_STORY' && !alumnusUserId) {
             toast.error("Please select an Alumnus for the Success Story. This field is mandatory.");
             setLoading(false);
             return;
        }

        // Initialize payload structure
        let postData = {
            title,
            content,
            postType: backendPostType,
            studentPhotoUrl: null, // Default null for unused/optional
            alumnusUserId: null, // Default null for unused
            eventDate: null, // Default null for unused
        };
        
        // --- PAYLOAD CONSTRUCTION FIX ---
        if (backendPostType === 'SUCCESS_STORY') {
            postData.studentPhotoUrl = studentPhotoUrl || null;
            // Passed the selected string ID (which is validated above)
            postData.alumnusUserId = alumnusUserId; 
        } else if (backendPostType === 'EVENT') {
            // Format date to ISO string (as required by ContentPostCreateDto)
            postData.eventDate = eventDate ? eventDate.toISOString() : null;
        }

        try {
            console.log('Submitting post data:', postData);
            await createContentPost(postData);
            toast.success(`New ${contentType === 'STORY' ? 'Success Story' : 'Event'} posted successfully!`);
            
            // Clear form
            setTitle('');
            setContent('');
            setStudentPhotoUrl('');
            setAlumnusUserId(''); // Clear the selected user ID
            setEventDate(null);
            if (onPostCreated) {
                onPostCreated(); 
            }
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
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Create New {contentType === 'STORY' ? 'Success Story' : 'Event'}</h3>
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
                                required // MANDATORY: This works because the first <option> has value=""
                                className={inputStyles}
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
                        <div>
                            <label htmlFor={`studentPhotoUrl-${contentType}`} className="block text-sm font-medium text-gray-700">Alumni Photo URL (Optional)</label>
                            <input
                                type="url"
                                id={`studentPhotoUrl-${contentType}`}
                                value={studentPhotoUrl}
                                placeholder="https://placehold.co/100x100"
                                onChange={(e) => setStudentPhotoUrl(e.target.value)}
                                className={inputStyles}
                            />
                        </div>
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
                            required
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
                <div className="text-right pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={buttonStyles}
                    >
                        {loading ? 'Posting...' : `Post ${contentType === 'STORY' ? 'Story' : 'Event'}`}
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
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('stories'); 

    // Data state
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [centers, setCenters] = useState([]);
    const [alumnusUsers, setAlumnusUsers] = useState([]); // List of users for the dropdown
    
    // Content Posts state
    const [stories, setStories] = useState([]);
    const [events, setEvents] = useState([]);
    
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postError, setPostError] = useState(null);

    // --- FIX: Modal state variables must be defined here ---
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    
    // Consolidated Data Fetching Logic
    useEffect(() => {
        const loadMasterData = async () => {
            setLoadingMasterData(true);
            try {
                const [coursesRes, batchesRes, centersRes, alumnusRes] = await Promise.all([
                    getCourses(i18n.language),
                    getBatches(i18n.language),
                    getCenters(),
                    getAlumnusUsers() // Fetches the list of alumni
                ]);
                setCourses(coursesRes.data || []);
                setBatches(batchesRes.data || []);
                setCenters(centersRes.data || []);
                setAlumnusUsers(alumnusRes.data || []); // Save alumnus list
            } catch (err) {
                console.error("Failed to load content master data", err);
                toast.error("Failed to load Courses/Batches/Centers/Alumni.");
            }
            setLoadingMasterData(false);
        };
        loadMasterData();
    }, [i18n.language]);
    
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
    const handlePostCreated = () => {
        fetchContentPosts(activeTab);
    };

    // --- Content Rendering Logic (Remains unchanged) ---
    
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

    const renderSubContent = () => {
        const loading = loadingMasterData || loadingPosts;

        if (loading && (activeTab === 'courses' || activeTab === 'batches' || activeTab === 'stories' || activeTab === 'events')) {
             return <div className="text-center p-8 text-gray-500">Loading data...</div>;
        }

        switch(activeTab) {
            case 'courses':
                return (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Courses</h2>
                            <button onClick={() => setIsCourseModalOpen(true)} className={actionButton}>
                                + Add New Course
                            </button>
                        </div>
                        <div className="space-y-4">
                            {courses.map(course => (
                                <div key={course.courseId} className="p-4 bg-white rounded-md border shadow-sm flex justify-between items-center">
                                    <h3 className="font-semibold text-lg text-strive-blue">{course.name}</h3>
                                    <button className={editButton}>Edit</button>
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
                            <button onClick={() => setIsBatchModalOpen(true)} className={actionButton}>
                                + Add New Batch
                            </button>
                        </div>
                         <div className="space-y-4">
                            {batches.map(batch => (
                                <div key={batch.batchId} className="p-4 bg-white rounded-md border shadow-sm flex justify-between items-center">
                                    <h3 className="font-semibold text-lg text-strive-blue">{batch.batchName}</h3>
                                    <button className={editButton}>Edit</button>
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
                            alumnusUsers={alumnusUsers} // Pass the fetched list
                            onPostCreated={handlePostCreated}
                        />
                        <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Existing Success Stories ({stories.length})</h3>
                        <ContentPostsList 
                            postType="SUCCESS_STORY" 
                            posts={stories} 
                            loading={loadingPosts}
                            error={postError}
                        />
                    </div>
                );

            case 'events':
                return (
                    <div className="p-4 space-y-8">
                        <ContentPostForm 
                            contentType="EVENT"
                            alumnusUsers={alumnusUsers} // Pass, though unused, for consistency
                            onPostCreated={handlePostCreated} 
                        />
                        <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Existing Events ({events.length})</h3>
                        <ContentPostsList 
                            postType="EVENT" 
                            posts={events} 
                            loading={loadingPosts}
                            error={postError}
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
                    onClose={() => setIsCourseModalOpen(false)}
                />
            )}
            {isBatchModalOpen && (
                <BatchEditModal
                    onClose={() => setIsBatchModalOpen(false)}
                    courses={courses}
                    centers={centers}
                />
            )}
        </div>
    );
};

export default ContentManagement;
