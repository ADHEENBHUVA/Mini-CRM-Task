import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-blue-600 mb-4">Mini CRM system</h1>
                <p className="text-gray-600">Frontend and Backend boilerplates initialized manually!</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;
