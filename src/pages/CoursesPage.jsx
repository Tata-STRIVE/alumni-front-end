import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCourses, getCenters } from '../services/apiService';
import toast from 'react-hot-toast';

/**
 * Renders the batch details within a course card.
 */
const BatchDetails = ({ batches }) => {
    if (!batches || batches.length === 0) {
        return <p className="text-sm text-gray-500 italic mt-2">No upcoming batches announced.</p>;
    }

    return (
        <div className="mt-4 border-t pt-3">
            <h4 className="font-semibold text-sm text-strive-blue mb-2">Upcoming Batches:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {batches.map((batch) => (
                    <div key={batch.batchId} className="p-2 bg-blue-50 rounded-md border border-blue-200">
                        <p className="font-medium text-xs text-gray-800">{batch.batchName}</p>
                        <p className="text-xs text-gray-600">
                            Location: {batch.centerName}, {batch.centerCity}
                        </p>
                        <p className="text-xs text-gray-600">
                            Start Date: {new Date(batch.startDate).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Main component for viewing and filtering all available courses.
 */
const CoursesPage = () => {
    const { i18n } = useTranslation();
    const [allCourses, setAllCourses] = useState([]);
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedCourseName, setSelectedCourseName] = useState('');
    const [selectedCenterCity, setSelectedCenterCity] = useState('');

    useEffect(() => {
        const fetchMasterData = async () => {
            setLoading(true);
            try {
                // Fetch all courses (includes translations and batches nested inside)
                const coursesRes = await getCourses(i18n.language);
                
                // Fetch all centers (for filtering by city/state)
                const centersRes = await getCenters();
                
                setAllCourses(coursesRes.data || []);
                setCenters(centersRes.data || []);
            } catch (err) {
                console.error("Failed to load courses or centers:", err);
                toast.error("Failed to load course information. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchMasterData();
    }, [i18n.language]);

    // Generate unique list of course names for the dropdown
    const uniqueCourseNames = [...new Set(allCourses.map(course => course.name))];

    // Generate unique list of cities/states from centers
    const uniqueCenterCities = [...new Set(centers.map(center => center.city))];

    // --- Filtering Logic ---
    const filteredCourses = allCourses.filter(course => {
        const courseMatch = !selectedCourseName || course.name === selectedCourseName;
        
        if (!selectedCenterCity) {
            return courseMatch;
        }

        // Check if any of the course's upcoming batches are in the selected city
        const cityMatch = course.upcomingBatches?.some(batch => 
            batch.centerCity === selectedCenterCity
        );

        return courseMatch && cityMatch;
    });

    return (
        <div className="bg-gray-100 min-h-screen">
            <main>
                {/* Colorful Page Header */}
                 <div className="bg-gradient-to-r from-strive-blue to-blue-700 py-20 text-white text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Our Courses</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
                        Skill development programs that pave the way for a successful career.
                    </p>
                    <div className="mt-8">
                         <a href="https://karyapath.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-strive-orange hover:bg-opacity-90">
                            Career Counseling (Karyapath Link)
                        </a>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white py-8 shadow-inner">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Filter Courses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Filter by Course Name */}
                            <div>
                                <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700">Filter by Program</label>
                                <select 
                                    id="course-filter" 
                                    value={selectedCourseName} 
                                    onChange={e => setSelectedCourseName(e.target.value)} 
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-strive-blue focus:border-strive-blue sm:text-sm rounded-md"
                                >
                                    <option value="">All Programs</option>
                                    {uniqueCourseNames.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Filter by Center City */}
                            <div>
                                <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700">Filter by Center City/State</label>
                                <select 
                                    id="city-filter" 
                                    value={selectedCenterCity} 
                                    onChange={e => setSelectedCenterCity(e.target.value)} 
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-strive-blue focus:border-strive-blue sm:text-sm rounded-md"
                                >
                                    <option value="">All Locations</option>
                                    {uniqueCenterCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading courses and batches...</div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg font-medium">No courses found matching your criteria.</p>
                                <button onClick={() => { setSelectedCourseName(''); setSelectedCenterCity(''); }} className="mt-4 text-sm text-strive-orange hover:underline">
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {filteredCourses.map((course) => (
                                    <div key={course.courseId} className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-strive-orange hover:shadow-2xl transition-shadow">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-strive-blue text-white">
                                                    {/* Using the iconUrl if available, otherwise a placeholder */}
                                                    {course.iconUrl ? (
                                                        <img src={course.iconUrl} alt="Course Icon" className="h-full w-full object-cover rounded-md" />
                                                    ) : (
                                                        <i className="fa fa-briefcase"></i>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                                            </div>
                                        </div>
                                        
                                        <p className="mt-4 text-base text-gray-600">{course.description}</p>
                                        
                                        {/* Career Path */}
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-sm text-gray-800">Career Path:</h4>
                                            <p className="text-sm text-gray-500">{course.careerPath || 'Not specified'}</p>
                                        </div>
                                        
                                        {/* Eligibility */}
                                        <div className="mt-2">
                                            <h4 className="font-semibold text-sm text-gray-800">Eligibility:</h4>
                                            <p className="text-sm text-gray-500">{course.eligibilityCriteria || 'Contact center for details'}</p>
                                        </div>

                                        {/* Upcoming Batches */}
                                        <BatchDetails batches={course.upcomingBatches} />
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

export default CoursesPage;
