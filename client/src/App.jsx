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
import Trash from './pages/Trash';

function AdminRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const isAdmin = user.role === 'Master Admin' || user.role === 'Superadmin' || user.role === 'Admin';
    return isAdmin ? children : <Navigate to="/" />;
}

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
                    <Route index element={<Dashboard />} />
                    <Route path="employees" element={<AdminRoute><Employees /></AdminRoute>} />
                    <Route path="employees/new" element={<AdminRoute><EmployeeForm /></AdminRoute>} />
                    <Route path="employees/:id" element={<AdminRoute><EmployeeDetails /></AdminRoute>} />
                    <Route path="employees/:id/edit" element={<AdminRoute><EmployeeForm /></AdminRoute>} />
                    <Route path="leads" element={<LeadsList />} />
                    <Route path="leads/new" element={<LeadForm />} />
                    <Route path="leads/:id" element={<LeadDetails />} />
                    <Route path="leads/:id/edit" element={<LeadForm />} />
                    <Route path="followups" element={<Followups />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="trash" element={<AdminRoute><Trash /></AdminRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
