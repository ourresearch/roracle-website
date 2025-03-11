import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Results from './pages/Results';
import Tests from './pages/Tests';

// TypeScript will automatically infer the types based on the components

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Application Toolbar */}
        <header className="bg-black text-white py-4 px-6 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold hover:text-gray-300 transition-colors">
              RORacle
            </Link>
            <nav className="flex space-x-6">
              <Link to="/" className="hover:text-gray-300 transition-colors">
                Home
              </Link>
              <Link to="/tests" className="hover:text-gray-300 transition-colors">
                Tests
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/tests/:testId" element={<Tests />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-4 px-6">
          <div className="container mx-auto text-center text-sm">
            <p>© {new Date().getFullYear()} RORacle - Named Entity Recognition for Scholarly Organizations</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
