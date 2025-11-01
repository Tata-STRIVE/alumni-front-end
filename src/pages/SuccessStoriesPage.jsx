import React, { useState, useEffect } from 'react';
import { getContentPosts } from '../services/apiService';
import toast from 'react-hot-toast';
import StoryModal from '../components/content/StoryModal'; // Import the new modal

const SuccessStoriesPage = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPost, setSelectedPost] = useState(null); // State for the modal content

    useEffect(() => {
        const fetchStories = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch posts of type 'SUCCESS_STORY' from the backend API
                const response = await getContentPosts('SUCCESS_STORY');
                setStories(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); // Sort by creation date descending
            } catch (err) {
                setError('Failed to load success stories.');
                toast.error('Failed to load success stories.');
                console.error("API Error fetching Success Stories:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);



       const openModal = (post) => {
        setSelectedPost(post);
    };

    const closeModal = () => {
        setSelectedPost(null);
    };
    const renderStoryCard = (story) => {
        // Use the fields from the ContentPostDto (alumnusName, alumnusBatchName, alumnusCenterName, etc.)
        const batchInfo = [story.alumnusBatchName, story.alumnusCenterName].filter(Boolean).join(', ');

        return (
            <div key={story.postId} className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                <div className="flex items-start p-6">
                    {/* Placeholder for Alumnus Photo */}
                    <img 
                        src={story.studentPhotoUrl || `https://placehold.co/80x80/005A9E/F47B20?text=${story.alumnusName ? story.alumnusName.charAt(0) : 'A'}`} 
                        alt={`${story.alumnusName} profile`} 
                        className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-strive-orange"
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src=`https://placehold.co/80x80/005A9E/F47B20?text=${story.alumnusName ? story.alumnusName.charAt(0) : 'A'}`;
                        }}
                    />
                    <div>
                        <h3 className="text-xl font-bold text-strive-blue">{story.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-strive-orange">{story.alumnusName || 'Alumnus'}</p>
                        {batchInfo && (
                            <p className="text-xs text-gray-500">{batchInfo}</p>
                        )}
                    </div>
                </div>
                <div className="p-6 pt-0">
                    <p className="mt-2 text-gray-600 line-clamp-4">{story.content}</p>
                

<button onClick={() => openModal(story)} className="text-strive-orange font-semibold text-sm hover:underline">
                                                        Read Full Story &rarr;
                                                    </button>

                </div>
            </div>
        );
    };

    return (
        <div className="bg-white min-h-screen">
            <main>
                {/* Colorful Page Header */}
                <div className="bg-gradient-to-r from-strive-orange to-orange-500 py-20 text-white text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Success Stories</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-orange-100">
                        Discover the inspiring journeys of STRIVE alumni who achieved success.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="bg-gray-100 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? <div className="text-center">Loading...</div> : error ? <div className="text-center text-red-500">{error}</div> : (
                            <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
                                {stories.length > 0 ? stories.map(renderStoryCard) : (
                                    <div className="lg:col-span-3 text-center text-gray-500 p-8 border rounded-md bg-white">
                                        No success stories have been posted yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

               {/* Modal for Full Content */}
            {selectedPost && <StoryModal post={selectedPost} onClose={closeModal} />}
 
        </div>
    );
};

export default SuccessStoriesPage;
