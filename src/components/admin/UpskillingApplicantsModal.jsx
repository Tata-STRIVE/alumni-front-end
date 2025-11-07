import React, { useState, useEffect } from 'react';
import { getUpskillingApplications, updateUpskillingApplicationStatus } from '../../services/apiService';
import toast from 'react-hot-toast';

const UpskillingApplicantsModal = ({ opportunity, onClose }) => {
  const [applicants, setApplicants] = useState([]);

  const fetchApplicants = async () => {
    try {
      const { data } = await getUpskillingApplications(opportunity.opportunityId);
      setApplicants(data);
    } catch (err) {
      toast.error('Failed to fetch applicants');
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateUpskillingApplicationStatus(appId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchApplicants();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Applicants — {opportunity.title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {applicants.length === 0 ? (
            <p className="text-gray-500">No applicants yet.</p>
          ) : (
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Mobile</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.applicationId}>
                    <td className="border p-2">{a.applicantName}</td>
                    <td className="border p-2">{a.applicantMobile}</td>
                    <td className="border p-2">{a.status}</td>
                    <td className="border p-2 space-x-1">
                      {['SHORTLISTED', 'SELECTED', 'REJECTED'].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(a.applicationId, s)}
                          className={`px-3 py-1 rounded text-white text-xs ${
                            s === 'REJECTED'
                              ? 'bg-red-600'
                              : s === 'SELECTED'
                              ? 'bg-green-600'
                              : 'bg-yellow-500'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpskillingApplicantsModal;
  