// Debug script for API connections
console.log("Debug API connections");

const API_BASE_URL = 'https://api.roracle.org';

// Test datasets endpoint
fetch(`${API_BASE_URL}/tests/datasets`)
  .then(response => {
    console.log("Datasets Response Status:", response.status);
    console.log("Datasets Response OK:", response.ok);
    return response.json();
  })
  .then(data => {
    console.log("Datasets Response Data:", data);
    
    // Test the first dataset's tests endpoint if available
    if (data.results && data.results.length > 0) {
      const firstDataset = data.results[0].name;
      console.log("Testing dataset:", firstDataset);
      
      return fetch(`${API_BASE_URL}/tests/datasets/${firstDataset}`);
    }
  })
  .then(response => {
    if (!response) return;
    console.log("Tests Response Status:", response.status);
    console.log("Tests Response OK:", response.ok);
    return response.json();
  })
  .then(data => {
    if (!data) return;
    console.log("Tests Response Data Structure:", Object.keys(data));
    console.log("Tests Meta Data:", data.meta);
    console.log("Tests Results Length:", data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      console.log("First Test Result:", data.results[0]);
    } else {
      console.log("No test results found in the response");
    }
  })
  .catch(error => {
    console.error("API Error:", error);
  });
