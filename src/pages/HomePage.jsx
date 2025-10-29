import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContentPosts } from '../services/apiService';
import StoryModal from '../components/content/StoryModal'; // Import the new modal
import toast from 'react-hot-toast';

const HomePage = () => {
    const [stories, setStories] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null); // State for the modal content

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                // Fetch top 3 Success Stories
                const [storiesRes, eventsRes] = await Promise.all([
                    getContentPosts('SUCCESS_STORY'),
                    getContentPosts('EVENT')
                ]);
                
                // Sort by creation date and take the top 3
                const latestStories = storiesRes.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 3);
                
                // Sort by creation date and take the top 2 events
                 const latestEvents = eventsRes.data
                    .sort((a, b) => new Date(b.eventDate || b.createdAt) - new Date(a.eventDate || a.createdAt))
                    .slice(0, 2);

                setStories(latestStories);
                setEvents(latestEvents);

            } catch (error) { 
                console.error("Failed to fetch content for homepage:", error); 
                toast.error("Failed to load content for the Home Page.");
            } 
            finally { 
                setLoading(false); 
            }
        };
        fetchContent();
    }, []);

    const openModal = (post) => {
        setSelectedPost(post);
    };

    const closeModal = () => {
        setSelectedPost(null);
    };

    return (
        <div className="bg-white">
            <main>
                {/* Hero Section */}
                <div className="relative">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100" />
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
                            <div className="absolute inset-0">
                                <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2830&q=80&sat=-100" alt="Team collaborating"/>
                                <div className="absolute inset-0 bg-strive-blue mix-blend-multiply" />
                            </div>
                            <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                                <h1 className="text-center text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                                    <span className="block text-white">Your Journey</span>
                                    <span className="block text-strive-orange">Continues With Us</span>
                                </h1>
                                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                                    <Link to="/register" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-strive-orange hover:bg-opacity-90 sm:px-8">
                                        Join the Alumni Network
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Stories Section */}
                <div className="bg-gray-100 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Latest Alumni Success Stories</h2>
                        <div className="mt-12">
                            {loading ? (
                                <div className="text-center text-gray-500">Loading inspiring stories...</div>
                            ) : stories.length > 0 ? (
                                <div className="grid gap-8 lg:grid-cols-3">
                                    {stories.map((story) => (
                                        <div key={story.postId} className="bg-white rounded-lg shadow-md hover:-translate-y-1 transition-transform border border-l-4 border-strive-blue">
                                            <div className="p-6">
                                                <div className="flex items-center mb-3">
                                                    <img 
                                                        src={story.studentPhotoUrl || `https://placehold.co/40x40/005A9E/F47B20?text=${story.alumnusName ? story.alumnusName.charAt(0) : 'A'}`} 
                                                        alt={`${story.alumnusName} avatar`} 
                                                        className="w-10 h-10 rounded-full object-cover mr-3"
                                                        onError={(e) => {
                                                            e.target.onerror = null; 
                                                            e.target.src=`https://placehold.co/40x40/005A9E/F47B20?text=${story.alumnusName ? story.alumnusName.charAt(0) : 'A'}`;
                                                        }}
                                                    />
                                                    <h3 className="text-lg font-semibold text-strive-blue">{story.alumnusName || 'Alumnus'}</h3>
                                                </div>
                                                <p className="font-medium text-gray-700 mb-2">{story.title}</p>
                                                <p className="mt-3 text-sm text-gray-500 line-clamp-3">{story.content}</p>
                                                <div className="mt-4">
                                                    <button onClick={() => openModal(story)} className="text-strive-orange font-semibold text-sm hover:underline">
                                                        Read More &rarr;
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No stories posted yet. Check back soon!</p>
                            )}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/success-stories" className="text-lg font-semibold text-strive-blue hover:underline">
                                View All Success Stories
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Events & Announcements Section */}
                <div className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Upcoming Events & Announcements</h2>
                        <div className="mt-12 max-w-4xl mx-auto">
                            {loading ? (
                                <div className="text-center text-gray-500">Loading events...</div>
                            ) : events.length > 0 ? (
                                <div className="space-y-6">
                                    {events.map((event) => (
                                        <div key={event.postId} className="p-6 bg-gray-50 rounded-lg shadow-md border-l-4 border-strive-orange flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-strive-orange">{new Date(event.eventDate || event.createdAt).toLocaleDateString()}</p>
                                                <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                                                <p className="text-gray-600 line-clamp-1">{event.content}</p>
                                            </div>
                                            <button onClick={() => openModal(event)} className="text-sm bg-strive-blue text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex-shrink-0">
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No upcoming events or announcements at this time.</p>
                            )}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/events" className="text-lg font-semibold text-strive-blue hover:underline">
                                View All Events & Announcements
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Modal for Full Content */}
            {selectedPost && <StoryModal post={selectedPost} onClose={closeModal} />}
        </div>
    );
};

export default HomePage;
