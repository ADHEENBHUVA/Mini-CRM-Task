import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employee/Employees';
import EmployeeForm from './pages/Employee/EmployeeForm';
import LeadsList from './pages/LeadsList';
import LeadForm from './pages/LeadForm';
import LeadDetails from './pages/LeadDetails';
import Profile from './pages/Profile';
import EmployeeDetails from './pages/Employee/EmployeeDetails';
import Followups from './pages/Followups';

// Admin features have been stripped out from the Employee Portal

function App() {
    return (
        <Router>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    className: 'dark:bg-[#1E293B] dark:text-white bg-white text-slate-900 border border-slate-200 dark:border-[#334155] shadow-lg rounded-xl',
                    style: { padding: '16px', maxWidth: '350px' }
                }}
            />
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Protected Routes inside DashboardLayout */}
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/leads" replace />} />
                    <Route path="leads" element={<LeadsList />} />
                    <Route path="leads/new" element={<LeadForm />} />
                    <Route path="leads/:id" element={<LeadDetails />} />
                    <Route path="leads/:id/edit" element={<LeadForm />} />
                    <Route path="followups" element={<Followups />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
