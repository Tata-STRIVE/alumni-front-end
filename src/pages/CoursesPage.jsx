import React, { useState } from 'react';

const CoursesPage = () => {
    // This data would typically be fetched from an API
    const [courses] = useState([
        { id: 1, name: 'Retail Management', description: 'Learn the fundamentals of retail operations, customer service, and inventory management to excel in the fast-paced retail sector.' },
        { id: 2, name: 'IT Support', description: 'Gain critical skills in hardware, software, and network troubleshooting to become a certified IT support professional.' },
        { id: 3, name: 'Automotive Technician', description: 'Get hands-on training in modern vehicle maintenance, diagnostics, and repair from industry experts.' },
        { id: 4, name: 'Entrepreneurship Development Program (EDP)', description: 'Develop the essential skills to start, manage, and grow your own successful business venture.' },
    ]);

    return (
        <div className="bg-white min-h-screen">
            <main>
                {/* Colorful Page Header */}
                 <div className="bg-gradient-to-r from-strive-blue to-blue-700 py-20 text-white text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Our Courses</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
                        Skill development programs that pave the way for a successful career.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="bg-gray-100 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-8 md:grid-cols-2">
                            {courses.map((course) => (
                                <div key={course.id} className="bg-white rounded-lg shadow-lg p-8 flex">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-strive-blue text-white">
                                            <i className="fa fa-briefcase"></i>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-gray-900">{course.name}</h3>
                                        <p className="mt-2 text-base text-gray-500">{course.description}</p>
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

export default CoursesPage;

