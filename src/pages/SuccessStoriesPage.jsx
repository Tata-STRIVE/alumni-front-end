import React, { useState, useEffect } from 'react';
import { getContentPosts } from '../services/apiService';

const SuccessStoriesPage = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStories = async () => {
            setLoading(true);
            try {
                // In a real app, this fetches 'SUCCESS_STORY' posts from the backend
                const mockData = [
                    { postId: 1, title: 'From Trainee to Manager', batch: 'Batch Name 1 , Jan 2020 '  ,location : ' TSSDC Hyderabad' , content: 'Suresh Kumar shares his inspiring journey of growth and leadership..is an account of someone or something that achieves great success, often against difficult odds, such as Steve Jobs founding Apple after dropping out of college, or the founders of Flipkart building a company from a garage.', authorName: 'Suresh Kumar' },
                    { postId: 2, title: 'Landing a Dream IT Job', batch: 'Batch Name 4 , Jan 2021 '  ,location : ' TSSDC Aligarh' , content: 'Rakesh Kumar talks about how the IT Support course helped him join a top MNC...', authorName: 'Rakesh Kumar' },
                    { postId: 3, title: 'Entrepreneurial Success', batch: 'Batch Name 16 , Jul 2020 '  ,location : ' TSSDC Mumbai' ,content: 'Anjali Verma started her own boutique after completing the EDP program...', authorName: 'Anjali Verma' },
                     { postId: 4, title: 'A New Career in Automotive', batch: 'Batch Name 17 , Dec 2024 '  ,location : ' TSSDC Pune' , content: 'Amit Patel discusses his transition into a skilled automotive technician after his training.', authorName: 'Amit Patel' },
                
                  { postId:5, title: 'From Trainee to Manager', batch: 'Batch Name 1 , Jan 2020 '  ,location : ' TSSDC Hyderabad' , content: 'Suresh Kumar shares his inspiring journey of growth and leadership..is an account of someone or something that achieves great success, often against difficult odds, such as Steve Jobs founding Apple after dropping out of college, or the founders of Flipkart building a company from a garage.', authorName: 'Suresh Kumar' },
                    { postId: 6, title: 'Landing a Dream IT Job', batch: 'Batch Name 4 , Jan 2021 '  ,location : ' TSSDC Aligarh' , content: 'Rakesh Kumar talks about how the IT Support course helped him join a top MNC...', authorName: 'Rakesh Kumar' },
                    { postId: 7, title: 'Entrepreneurial Success', batch: 'Batch Name 16 , Jul 2020 '  ,location : ' TSSDC Mumbai' ,content: 'Anjali Verma started her own boutique after completing the EDP program...', authorName: 'Anjali Verma' },
                     { postId: 8, title: 'A New Career in Automotive', batch: 'Batch Name 17 , Dec 2024 '  ,location : ' TSSDC Pune' , content: 'Amit Patel discusses his transition into a skilled automotive technician after his training.', authorName: 'Amit Patel' },
               
                
                    ];
                setStories(mockData);
            } catch (err) {
                setError('Failed to load success stories.');
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    return (
        <div className="bg-white min-h-screen">
            <main>
                {/* Colorful Page Header */}
                <div className="bg-gradient-to-r from-strive-orange to-orange-500 py-20 text-white text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Success Stories</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-orange-100">
                        Discover the inspiring journeys of STRIVE alumni.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="bg-gray-100 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? <div className="text-center">Loading...</div> : error ? <div className="text-center text-red-500">{error}</div> : (
                            <div className="grid gap-8 lg:grid-cols-3">
                                {stories.map((story) => (
                                    <div key={story.postId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                        <div className="p-8 border-l-4 border-strive-blue">
                                            <h3 className="text-2xl font-bold text-strive-blue">{story.title}</h3>
                                              <h4 className="mt-4 text-sm font-semibold text-blue-500">{story.batch}</h4>
                                                <h3 className="mt-4 text-sm font-semibold text-orange-500">{story.location}</h3>
                                            <p className="mt-4 text-gray-600">{story.content}</p>
                                            <p className="mt-4 text-sm font-semibold text-gray-500">- {story.authorName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuccessStoriesPage;

