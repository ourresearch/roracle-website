// API service for RORacle UI

// Types for API responses
export interface Organization {
  id: string;
  names: string[];
  location: string;
}

export interface RORResponse {
  meta: {
    total_results: number;
  };
  results: Organization[];
}

export interface TestResult {
  test_id: number;
  dataset_name: string;
  is_passing: boolean;
  affiliation: string;
  matches: Organization[];
  under_matches: Organization[];
  over_matches: Organization[];
  no_matches_expected: boolean;
  meta?: {
    elapsed: number;
  };
}

export interface DatasetInfo {
  name: string;
  count: number;
}

export interface DatasetResponse {
  meta: {
    total_datasets: number;
    total_tests: number;
  };
  results: DatasetInfo[];
}

export interface TestsResponse {
  meta: {
    total_results: number;
    precision: number;
    recall: number;
    elapsed: number;
  };
  results: TestResult[];
}

// Raw API response from tests endpoint
interface RawTestsResponse {
  meta: {
    total_tests: number;
    passing: number;
    failing: number;
    errors: number;
    pass_rate_percent: number;
    total_elapsed: number;
    performance: {
      precision: number;
      recall: number;
      f_score: number;
    }
  };
  passing_tests: TestResult[];
  failing_tests: TestResult[];
  error_tests: TestResult[];
}

const API_BASE_URL = 'https://api.roracle.org';

/**
 * Get ROR records for a given affiliation string
 */
export const getRORRecords = async (affiliation: string): Promise<RORResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ror-records?affiliation=${encodeURIComponent(affiliation)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching ROR records:', error);
    throw error;
  }
};

/**
 * Get a list of available datasets
 */
export const getDatasets = async (): Promise<DatasetResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tests/datasets`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }
};

/**
 * Run tests for a specific dataset
 */
export const getDatasetTests = async (datasetName: string): Promise<TestsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tests/datasets/${datasetName}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Get the raw response with passing_tests, failing_tests, error_tests
    const rawData: RawTestsResponse = await response.json();
    
    // Mark tests with the appropriate passing status
    const passingTests = rawData.passing_tests?.map(test => ({ ...test, is_passing: true })) || [];
    const failingTests = rawData.failing_tests?.map(test => ({ ...test, is_passing: false })) || [];
    const errorTests = rawData.error_tests?.map(test => ({ ...test, is_passing: false })) || [];
    
    // Combine all test results into a single array
    const combinedResults = [...passingTests, ...failingTests, ...errorTests];
    
    // Create the properly formatted response
    return {
      meta: {
        total_results: rawData.meta.total_tests,
        precision: rawData.meta.performance.precision,
        recall: rawData.meta.performance.recall,
        elapsed: rawData.meta.total_elapsed
      },
      results: combinedResults
    };
  } catch (error) {
    console.error('Error fetching dataset tests:', error);
    throw error;
  }
};

/**
 * Get a single test result by ID
 */
export const getSingleTest = async (testId: number): Promise<TestResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
};
