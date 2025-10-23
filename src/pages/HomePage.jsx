import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContentPosts } from '../services/apiService';
// Header and Footer are removed as they are now handled by MainLayout

const HomePage = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Using mock data for simplicity
                const mockStories = [
                    { postId: 1, title: 'From Trainee to Manager', content: 'Suresh Kumar shares his journey...' },
                    { postId: 2, title: 'Landing a Dream IT Job', content: 'Rakesh Kumar talks about his success...' },
                    { postId: 3, title: 'Entrepreneurial Success', content: 'Anjali Verma started her own boutique...' },
                ];
                setStories(mockStories);
            } catch (error) { console.error("Failed to fetch content:", error); } 
            finally { setLoading(false); }
        };
        fetchContent();
    }, []);

    return (
        // Note: No <PublicHeader /> or <Footer /> needed here
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Stories Section */}
                <div className="bg-gray-100 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 text-center">Alumni Success Stories</h2>
                        <div className="mt-12 grid gap-8 lg:grid-cols-3">
                            {stories.map((story) => (
                                <div key={story.postId} className="bg-white rounded-lg shadow-md hover:-translate-y-2 transition-transform">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-strive-blue">{story.title}</h3>
                                        <p className="mt-3 text-base text-gray-500">{story.content}</p>
                                        <div className="mt-4"><Link to="/success-stories" className="text-strive-orange font-semibold">Read More &rarr;</Link></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;

