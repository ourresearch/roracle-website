import React, { useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
// Import API service (though not used directly yet, prepared for future enhancements)
import { getRORRecords } from '../services/api';

const Home: React.FC = () => {
  const [affiliationText, setAffiliationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!affiliationText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Store the affiliation text in session storage to use on the results page
      sessionStorage.setItem('affiliationText', affiliationText);
      
      // We could use the API service directly here for validation or pre-processing
      // Example (commented out for now):
      // const firstAffiliation = affiliationText.split('\n')[0].trim();
      // if (firstAffiliation) {
      //   await getRORRecords(firstAffiliation);
      // }
      
      // Redirect to results page
      navigate('/results');
    } catch (error) {
      console.error('Error submitting affiliations:', error);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">RORacle - Named Entity Recognition for Scholarly Organizations</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Enter Affiliation Strings</h2>
        <p className="text-gray-600 mb-4">
          Paste one or more affiliation strings from scholarly articles. 
          RORacle will identify organizations and return their ROR IDs.
        </p>
        
        <div className="mb-4">
          <textarea
            className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter affiliation strings here, one per line..."
            value={affiliationText}
            onChange={(e) => setAffiliationText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <p className="text-sm text-gray-500 mt-1">Press Cmd + Enter to submit</p>
        </div>
        
        <button
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isSubmitting || !affiliationText.trim()}
        >
          {isSubmitting ? 'Processing...' : 'Submit'}
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">About RORacle</h2>
        <p className="text-gray-600">
          RORacle takes affiliation strings from the metadata of scholarly journal articles and performs 
          named entity recognition to discover individual scholarly organizations named in those strings. 
          It returns the ROR ID for each organization it discovers.
        </p>
      </div>
    </div>
  );
};

export default Home;
