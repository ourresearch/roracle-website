import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRORRecords, Organization } from '../services/api';

const Results: React.FC = () => {
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [results, setResults] = useState<Map<string, Organization[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve affiliation text from session storage
        const affiliationText = sessionStorage.getItem('affiliationText');
        
        if (!affiliationText) {
          navigate('/');
          return;
        }
        
        // Split by newlines to get individual affiliations
        const affiliationList = affiliationText
          .split('\n')
          .filter(line => line.trim() !== '');
          
        setAffiliations(affiliationList);
        
        // Process each affiliation
        const resultsMap = new Map<string, Organization[]>();
        
        for (const affiliation of affiliationList) {
          try {
            const data = await getRORRecords(affiliation);
            resultsMap.set(affiliation, data.results);
          } catch (error) {
            console.error(`Error fetching results for '${affiliation}':`, error);
            resultsMap.set(affiliation, []);
          }
        }
        
        setResults(resultsMap);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to fetch results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getTotalOrganizations = () => {
    let count = 0;
    results.forEach(orgs => {
      count += orgs.length;
    });
    return count;
  };

  const getAverageOrganizationsPerAffiliation = () => {
    if (results.size === 0) return 0;
    return getTotalOrganizations() / results.size;
  };

  const downloadCSV = () => {
    let csv = 'Affiliation,ROR IDs\n';
    
    results.forEach((orgs, affiliation) => {
      const rorIds = orgs.map(org => org.id).join(' ');
      // Escape quotes in CSV
      const escapedAffiliation = affiliation.replace(/"/g, '""');
      csv += `"${escapedAffiliation}","${rorIds}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roracle_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Organization Pill component
  const OrganizationPill: React.FC<{ organization: Organization }> = ({ organization }) => {
    const [showPopover, setShowPopover] = useState(false);
    
    const mainName = organization.names[0];
    const alternateNames = organization.names.slice(1);
    
    return (
      <div className="relative inline-block">
        <a
          href={organization.id}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm mr-2 mb-2 hover:bg-gray-300 transition-colors"
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
        >
          {mainName}
        </a>
        
        {showPopover && alternateNames.length > 0 && (
          <div className="absolute z-10 bg-white border border-gray-200 shadow-lg rounded-md p-3 mt-1 w-64">
            <p className="text-sm font-semibold mb-2">Alternate Names:</p>
            <ul className="text-xs">
              {alternateNames.map((name, index) => (
                <li key={index} className="mb-1">{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Affiliation Card component
  const AffiliationCard: React.FC<{ affiliation: string; organizations: Organization[] }> = ({ affiliation, organizations }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <p className="text-sm text-gray-800 mb-3">{affiliation}</p>
        <div>
          {organizations.map((org, index) => (
            <OrganizationPill key={index} organization={org} />
          ))}
          {organizations.length === 0 && (
            <p className="text-sm text-gray-500 italic">No organizations found</p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <button
            onClick={downloadCSV}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            Download CSV
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-500">Affiliations</p>
            <p className="text-2xl font-bold">{affiliations.length}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-500">Organizations</p>
            <p className="text-2xl font-bold">{getTotalOrganizations()}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-500">Avg. Orgs per Affiliation</p>
            <p className="text-2xl font-bold">{getAverageOrganizationsPerAffiliation().toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {affiliations.map((affiliation, index) => (
          <AffiliationCard 
            key={index} 
            affiliation={affiliation} 
            organizations={results.get(affiliation) || []} 
          />
        ))}
      </div>
    </div>
  );
};

export default Results;
