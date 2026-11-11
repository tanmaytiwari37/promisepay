import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateAgreement from './pages/CreateAgreement';
import AgreementReview from './pages/AgreementReview';
import SubmitWork from './pages/SubmitWork';
import VerificationReport from './pages/VerificationReport';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-indigo-600">PromisePay</Link>
                </div>
                <nav className="ml-8 flex space-x-4 items-center">
                  <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Dashboard</Link>
                  <Link to="/create-agreement" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Create Agreement</Link>
                  <Link to="/agreement-review" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Review</Link>
                  <Link to="/submit-work" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Submit Work</Link>
                  <Link to="/verification-report" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Verification</Link>
                </nav>
              </div>
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700">Register</Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-agreement" element={<CreateAgreement />} />
            <Route path="/agreement-review" element={<AgreementReview />} />
            <Route path="/submit-work" element={<SubmitWork />} />
            <Route path="/verification-report" element={<VerificationReport />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
