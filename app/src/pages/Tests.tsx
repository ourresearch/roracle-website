import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDatasets, getSingleTest, getDatasetTests, Organization, TestResult, DatasetInfo } from '../services/api';

interface MetricsData {
  total: number;
  passing: number;
  failing: number;
  precision: number;
  recall: number;
}

const Tests: React.FC = () => {
  const { testId } = useParams<{ testId?: string }>();
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'passing' | 'failing'>('all');
  const [metrics, setMetrics] = useState<MetricsData>({
    total: 0,
    passing: 0,
    failing: 0,
    precision: 0,
    recall: 0
  });

  // Fetch datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await getDatasets();
        setDatasets(data.results);
        
        // Set first dataset as default if none selected
        if (!selectedDataset && data.results.length > 0) {
          setSelectedDataset(data.results[0].name);
        }
      } catch (error) {
        console.error('Error fetching datasets:', error);
        setError('Failed to fetch datasets. Please try again.');
      }
    };

    fetchDatasets();
  }, [selectedDataset]);

  // Fetch test results based on selected dataset or specific test
  useEffect(() => {
    const fetchTestResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let results: TestResult[] = [];
        
        if (testId) {
          const data = await getSingleTest(Number(testId));
          results = [data];
        } else if (selectedDataset) {
          const data = await getDatasetTests(selectedDataset);
          results = data.results || [];
        } else {
          return;
        }
        setTestResults(results);
        
        // Calculate metrics
        calculateMetrics(results);
      } catch (error) {
        console.error('Error fetching test results:', error);
        setError('Failed to fetch test results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestResults();
  }, [testId, selectedDataset]);

  const calculateMetrics = (results: TestResult[]) => {
    const total = results.length;
    const passing = results.filter(r => r.is_passing).length;
    const failing = total - passing;
    
    // Calculate precision and recall
    let totalExpected = 0;
    let totalFound = 0;
    let truePositives = 0;
    
    results.forEach(result => {
      // Count expected organizations (matches + under_matches)
      const expectedCount = result.matches.length + result.under_matches.length;
      totalExpected += expectedCount;
      
      // Count found organizations (matches + over_matches)
      const foundCount = result.matches.length + result.over_matches.length;
      totalFound += foundCount;
      
      // True positives are the matches
      truePositives += result.matches.length;
    });
    
    // Avoid division by zero
    const precision = totalFound > 0 ? truePositives / totalFound : 0;
    const recall = totalExpected > 0 ? truePositives / totalExpected : 0;
    
    setMetrics({
      total,
      passing,
      failing,
      precision,
      recall
    });
  };

  const filteredResults = () => {
    switch (filter) {
      case 'passing':
        return testResults.filter(r => r.is_passing);
      case 'failing':
        return testResults.filter(r => !r.is_passing);
      default:
        return testResults;
    }
  };

  // Organization Pill component with color based on match type
  const OrganizationPill: React.FC<{ 
    organization: Organization; 
    matchType: 'match' | 'under_match' | 'over_match'
  }> = ({ organization, matchType }) => {
    const [showPopover, setShowPopover] = useState(false);
    
    const mainName = organization.names[0];
    const alternateNames = organization.names.slice(1);
    
    // Determine styling based on match type
    let pillStyle = '';
    switch (matchType) {
      case 'match':
        pillStyle = 'bg-green-100 text-green-800 hover:bg-green-200';
        break;
      case 'under_match':
        pillStyle = 'bg-white text-green-800 border border-green-500 hover:bg-green-50';
        break;
      case 'over_match':
        pillStyle = 'bg-red-100 text-red-800 hover:bg-red-200';
        break;
    }
    
    return (
      <div className="relative inline-block">
        <a
          href={organization.id}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm mr-2 mb-2 transition-colors ${pillStyle}`}
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

  // Affiliation Card component with test metadata
  const TestCard: React.FC<{ result: TestResult }> = ({ result }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="text-[10px] text-gray-500 mb-1">
          Test ID: {result.test_id} • Dataset: {result.dataset_name}
        </div>
        <p className="text-sm text-gray-800 mb-3">{result.affiliation}</p>
        <div>
          {/* Matches */}
          {result.matches.map((org, index) => (
            <OrganizationPill key={`match-${index}`} organization={org} matchType="match" />
          ))}
          
          {/* Undermatches */}
          {result.under_matches.map((org, index) => (
            <OrganizationPill key={`under-${index}`} organization={org} matchType="under_match" />
          ))}
          
          {/* Overmatches */}
          {result.over_matches.map((org, index) => (
            <OrganizationPill key={`over-${index}`} organization={org} matchType="over_match" />
          ))}
          
          {result.matches.length === 0 && 
           result.under_matches.length === 0 && 
           result.over_matches.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              {result.no_matches_expected ? 'No matches expected' : 'No organizations found'}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading && !testResults.length) {
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
      {/* Header with metrics and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold mb-4 md:mb-0">Test Results</h2>
          
          {/* Dataset selector */}
          {!testId && (
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <select 
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={selectedDataset || ''}
                onChange={(e) => setSelectedDataset(e.target.value)}
              >
                {datasets.map((dataset) => (
                  <option key={dataset.name} value={dataset.name}>
                    {dataset.name} ({dataset.count} tests)
                  </option>
                ))}
              </select>
              
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'passing' | 'failing')}
              >
                <option value="all">All Results</option>
                <option value="passing">Passing Only</option>
                <option value="failing">Failing Only</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-500">Tests</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-600">Passing</p>
            <p className="text-2xl font-bold text-green-700">{metrics.passing}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-600">Failing</p>
            <p className="text-2xl font-bold text-red-700">{metrics.failing}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-500">Precision</p>
            <p className="text-2xl font-bold">{(metrics.precision * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-500">Recall</p>
            <p className="text-2xl font-bold">{(metrics.recall * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>
      
      {/* Test results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredResults().map((result) => (
          <TestCard key={result.test_id} result={result} />
        ))}
      </div>
      
      {filteredResults().length === 0 && (
        <div className="bg-gray-100 p-8 rounded-md text-center">
          <p className="text-gray-500">No test results found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default Tests;
