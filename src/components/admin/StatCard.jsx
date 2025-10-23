import React from 'react';

/**
 * A reusable component to display a key statistic on the admin dashboard.
 */
const StatCard = ({ icon, title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="p-3 rounded-full bg-strive-blue text-white mr-4">
            <i className={`fa ${icon} fa-lg`}></i>
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default StatCard;
