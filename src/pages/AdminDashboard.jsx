import React, { useState, useEffect } from 'react';

// --- MOCK API SERVICE ---
// Created mock functions to replace the missing apiService file.
// These simulate responses from your backend.
const mockApiService = {
  getPendingApprovals: () => Promise.resolve({ data: [
    { userId: 1, fullName: "Alice Johnson", mobileNumber: "555-0101", email: "alice@example.com" },
    { userId: 2, fullName: "Bob Smith", mobileNumber: "555-0102", email: "bob@example.com" },
  ]}),
  approveUser: (userId) => {
    console.log(`Mock: Approving user ${userId}`);
    return Promise.resolve({ data: { status: 'success', userId } });
  },
  
  getJobs: () => Promise.resolve({ data: [
    { jobId: 101, title: "Software Engineer", companyName: "Tech Corp", location: "New York, NY" },
    { jobId: 102, title: "Product Manager", companyName: "Innovate Inc", location: "San Francisco, CA" },
  ]}),
  getJobApplications: (jobId) => Promise.resolve({ data: [
    { applicationId: 1001, applicantName: "Charlie Brown", status: 'Pending', resume: "link-to-resume.pdf" },
    { applicationId: 1002, applicantName: "Dana Scully", status: 'Reviewed', resume: "link-to-resume-2.pdf" },
  ]}),
  updateJobApplicationStatus: (applicationId, newStatus) => {
    console.log(`Mock: Updating app ${applicationId} to ${newStatus}`);
    return Promise.resolve({ data: { status: 'success', applicationId, newStatus } });
  },
  
  getPendingJobs: () => Promise.resolve({ data: [
    { jobId: 201, title: "UX Designer", companyName: "Creative LLC", authorName: "Eva Mendes" },
  ]}),
  approveJob: (jobId) => {
    console.log(`Mock: Approving job ${jobId}`);
    return Promise.resolve({ data: { status: 'success', jobId } });
  },
  
  getPendingEmploymentHistory: () => Promise.resolve({ data: [
    { employmentId: 301, authorName: "Frank West", jobTitle: "Data Analyst", companyName: "Numbers Co", startDate: "2022-01-01" },
  ]}),
  verifyEmploymentRecord: (historyId) => {
    console.log(`Mock: Verifying history ${historyId}`);
    return Promise.resolve({ data: { status: 'success', historyId } });
  },
  
  getTotalAlumniCount: () => Promise.resolve({ data: { count: 1250 } }),
};

// Destructure mock functions to be used in the component
const { 
    getPendingApprovals, approveUser, 
    getJobs, getJobApplications, updateJobApplicationStatus,
    getPendingJobs, approveJob,
    getPendingEmploymentHistory, verifyEmploymentRecord,
    getTotalAlumniCount
} = mockApiService;

// --- MOCK COMPONENTS ---
// Created mock components to replace missing imports.

const AdminHeader = ({ role }) => (
  <header className="bg-white shadow-md">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-gray-800">Alumni Admin (Preview)</div>
      <div className="text-sm text-gray-600">
        Role: <span className="font-medium text-strive-blue">{role}</span>
      </div>
    </nav>
  </header>
);

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className={`text-3xl text-strive-blue ${icon}`}>
      {/* A simple placeholder for an icon class */}
      {icon === 'fa-users' && '👥'}
      {icon === 'fa-user-plus' && '👤+'}
      {icon === 'fa-hourglass-half' && '⏳'}
      {icon === 'fa-id-card-clip' && '💳'}
      {icon === 'fa-check-double' && '✅'}
    </div>
    <div>
      <div className="text-gray-500 text-sm font-medium">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  </div>
);

const ApplicantsModal = ({ job, applicants, isLoading, onClose, onUpdateStatus }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900">Applicants for {job.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        
        <div className="overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center p-8 text-gray-500">Loading applicants...</div>
          ) : (
            <div className="space-y-4">
              {applicants.length > 0 ? applicants.map(app => (
                <div key={app.applicationId} className="border rounded-md p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                  <div>
                    <div className="font-semibold text-gray-800">{app.applicantName}</div>
                    <div className="text-sm text-gray-500">{app.resume}</div>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.applicationId, e.target.value)}
                      className="text-sm rounded-md border-gray-300 shadow-sm focus:ring-strive-blue focus:border-strive-blue"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              )) : (
                <div className="text-center p-8 text-gray-500">No applicants for this job yet.</div>
              )}
            </div>
          )}
        </div>

        <div className="border-t p-4 bg-gray-50 text-right rounded-b-lg">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


// --- ADMIN DASHBOARD COMPONENT ---

const AdminDashboard = ({ role }) => {
    // Added 'content_creation' as a possible tab value
    const [activeTab, setActiveTab] = useState('approvals');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [pendingHistory, setPendingHistory] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    const [alumniCount, setAlumniCount] = useState(0);

    // State for the applicants modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // Add the new API call to the list
            const [usersRes, jobsRes, pendingJobsRes, pendingHistoryRes, countRes] = await Promise.all([ 
                getPendingApprovals(), 
                getJobs(), 
                getPendingJobs(),
                getPendingEmploymentHistory(),
                getTotalAlumniCount() // Fetch the total count
            ]);
            setPendingUsers(usersRes.data);
            setJobs(jobsRes.data);
            setPendingJobs(pendingJobsRes.data);
            setPendingHistory(pendingHistoryRes.data);
            setAlumniCount(countRes.data.count); // Set the new state
        } catch (err) { 
            setError('Failed to load dashboard data.');
            console.error(err);
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);
    
    // Handler for approving a new user
    const handleApproveUser = async (userId) => {
        try {
            await approveUser(userId);
            setMessage('User approved successfully!');
            fetchData(); // Refetch all data to update the lists
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { setError('Failed to approve user.'); }
    };
    
    // Handler for approving a pending job
    const handleApproveJob = async (jobId) => {
        try {
            await approveJob(jobId);
            setMessage('Job approved successfully and is now live!');
            fetchData(); // Refetch all data
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { setError('Failed to approve job.'); }
    };

    // Handler for approving pending employment history
    const handleApproveHistory = async (historyId) => {
        try {
            await verifyEmploymentRecord(historyId);
            setMessage('Employment record verified successfully!');
            fetchData(); // Refetch all data
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { setError('Failed to verify record.'); }
    };
    
    // Handler for opening the applicants modal
    const handleViewApplicants = async (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
        setModalLoading(true);
        try {
            const response = await getJobApplications(job.jobId);
            setApplicants(response.data);
        } catch (err) { setError('Failed to load applicants for this job.'); } 
        finally { setModalLoading(false); }
    };

    // Handler for updating an applicant's status from the modal
    const handleUpdateApplicantStatus = async (applicationId, newStatus) => {
        try {
            await updateJobApplicationStatus(applicationId, newStatus);
            setApplicants(prev => prev.map(app => app.applicationId === applicationId ? { ...app, status: newStatus } : app));
        } catch (err) { setError('Failed to update applicant status.'); }
    };
    
    // Renders the content for the currently active tab
    const renderContent = () => {
        if (loading) return <div className="p-8 text-center text-gray-500">Loading content...</div>;
        if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;

        switch (activeTab) {
            case 'approvals':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Full Name</th>
                                    <th scope="col" className="px-6 py-3">Mobile Number</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingUsers.length > 0 ? pendingUsers.map(pUser => (
                                    <tr key={pUser.userId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{pUser.fullName}</td>
                                        <td className="px-6 py-4">{pUser.mobileNumber}</td>
                                        <td className="px-6 py-4">{pUser.email}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleApproveUser(pUser.userId)} className="bg-strive-green text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-opacity-90">Approve</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center py-8 text-gray-500">No pending user approvals.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            case 'job_verifications':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Job Title & Company</th>
                                    <th scope="col" className="px-6 py-3">Submitted By</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingJobs.length > 0 ? pendingJobs.map(job => (
                                    <tr key={job.jobId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{job.title}</div>
                                            <div className="text-sm text-gray-500">{job.companyName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{job.authorName}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleApproveJob(job.jobId)} className="bg-strive-green text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-opacity-90">Approve Job</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="text-center py-8 text-gray-500">No jobs are pending verification.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            
            case 'employment_verification':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Alumnus Name</th>
                                    <th scope="col" className="px-6 py-3">Company & Role</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingHistory.length > 0 ? pendingHistory.map(hist => (
                                    <tr key={hist.employmentId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{hist.authorName}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{hist.jobTitle}</div>
                                            <div className="text-sm text-gray-500">{hist.companyName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{hist.startDate}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleApproveHistory(hist.employmentId)} className="bg-strive-green text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-opacity-90">Verify</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center py-8 text-gray-500">No employment records are pending verification.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );

            case 'jobs':
                return (
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Job Title</th>
                                    <th scope="col" className="px-6 py-3">Company</th>
                                    <th scope="col" className="px-6 py-3">Location</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr key={job.jobId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                                        <td className="px-6 py-4">{job.companyName}</td>
                                        <td className="px-6 py-4">{job.location}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleViewApplicants(job)} className="text-strive-blue hover:underline text-xs font-semibold">View Applicants</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            
            // NEW CONTENT CREATION TAB CONTENT
            case 'content_creation':
                return (
                    <div className="p-4 bg-white rounded-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Content</h2>
                        <div className="text-gray-600">
                            <p className="mb-2">Use this section to draft and publish news, announcements, or articles for the alumni community.</p>
                            <div className="p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Future Implementation:</span> This area should be replaced with a rich text editor (like TinyMCE or Quill) and a form to submit the content to your backend API.
                                </p>
                                <button className="mt-4 bg-strive-blue text-white px-4 py-2 rounded-md font-semibold hover:bg-strive-blue/90">Publish Content</button>
                            </div>
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminHeader role={role} />
            <main className="container mx-auto px-6 py-8">
                {/* Updated Stat Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                   <StatCard icon="fa-users" title="Total Alumni" value={loading ? '...' : alumniCount} />
                   <StatCard icon="fa-user-plus" title="User Approvals" value={loading ? '...' : pendingUsers.length} />
                   <StatCard icon="fa-hourglass-half" title="Pending Jobs" value={loading ? '...' : pendingJobs.length} />
                   <StatCard icon="fa-id-card-clip" title="Pending History" value={loading ? '...' : pendingHistory.length} />
                   <StatCard icon="fa-check-double" title="Active Jobs" value={loading ? '...' : jobs.length} />
                </div>
                
                {message && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-6">{message}</div>}

                {/* Updated Tab Navigation */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        {/* Added overflow-x-auto for smaller screens */}
                        <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                            <button onClick={() => setActiveTab('approvals')} className={`${activeTab === 'approvals' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>User Approvals</button>
                            <button onClick={() => setActiveTab('job_verifications')} className={`${activeTab === 'job_verifications' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Job Verifications</button>
                            <button onClick={() => setActiveTab('employment_verification')} className={`${activeTab === 'employment_verification' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>History Verifications</button>
                            <button onClick={() => setActiveTab('jobs')} className={`${activeTab === 'jobs' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Job Management</button>
                            
                            {/* NEW TAB BUTTON */}
                            <button onClick={() => setActiveTab('content_creation')} className={`${activeTab === 'content_creation' ? 'border-strive-blue text-strive-blue' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Content Creation</button>
                        </nav>
                    </div>
                    <div className="p-6">
                        {renderContent()}
                    </div>
                </div>
            </main>
            {isModalOpen && (
                <ApplicantsModal
                    job={selectedJob}
                    applicants={applicants}
                    isLoading={modalLoading}
                    onClose={() => setIsModalOpen(false)}
                    onUpdateStatus={handleUpdateApplicantStatus}
                />
            )}
        </div>
    );
};

export default AdminDashboard;

