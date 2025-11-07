// src/components/admin/UpskillingManagement.jsx
import React, { useEffect, useState } from 'react';
import {
  getUpskillingOpportunities,
  deleteUpskillingOpportunity,
} from '../../services/apiService';
import PostUpskillingModal from './PostUpskillingModal';
import UpskillingApplicantsModal from './UpskillingApplicantsModal';
import toast from 'react-hot-toast';

const UpskillingManagement = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await getUpskillingOpportunities();
      setOpportunities(res.data);
    } catch (err) {
      toast.error('Failed to load opportunities');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await deleteUpskillingOpportunity(id);
      toast.success('Opportunity deleted successfully');
      fetchOpportunities();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upskilling Opportunities</h2>
        <button
          onClick={() => {
            setEditingOpportunity(null);
            setShowPostModal(true);
          }}
          className="bg-strive-blue text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          + Add Opportunity
        </button>
      </div>

      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Title</th>
            <th className="border px-3 py-2 text-left">Description</th>
            <th className="border px-3 py-2 text-left">Start Date</th>
            <th className="border px-3 py-2 text-left">End Date</th>
            <th className="border px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => (
            <tr key={opp.opportunityId} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{opp.title}</td>
              <td className="border px-3 py-2">{opp.description}</td>
              <td className="border px-3 py-2">{opp.startDate}</td>
              <td className="border px-3 py-2">{opp.endDate}</td>
              <td className="border px-3 py-2 text-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedOpportunity(opp);
                    setShowApplicantsModal(true);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Applications
                </button>
                <button
                  onClick={() => {
                    setEditingOpportunity(opp);
                    setShowPostModal(true);
                  }}
                  className="text-green-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(opp.opportunityId)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {opportunities.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No opportunities found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showPostModal && (
        <PostUpskillingModal
          onClose={() => setShowPostModal(false)}
          onSaved={fetchOpportunities}
          existingOpportunity={editingOpportunity}
        />
      )}

      {showApplicantsModal && selectedOpportunity && (
        <UpskillingApplicantsModal
          opportunity={selectedOpportunity}
          onClose={() => {
            setShowApplicantsModal(false);
            setSelectedOpportunity(null);
          }}
        />
      )}
    </div>
  );
};

export default UpskillingManagement;
