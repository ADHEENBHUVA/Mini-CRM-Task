import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import LeadsList from './pages/LeadsList';
import LeadForm from './pages/LeadForm';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Protected Routes inside DashboardLayout */}
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="leads" element={<LeadsList />} />
                    <Route path="leads/new" element={<LeadForm />} />
                    <Route path="followups" element={<div className="font-bold text-2xl">Followups Work In Progress...</div>} />
                    <Route path="profile" element={<div className="font-bold text-2xl">Profile Work In Progress</div>} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
