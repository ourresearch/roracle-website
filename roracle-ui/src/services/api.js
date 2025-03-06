import axios from 'axios'

// Base URL for the RORacle API
const API_BASE_URL = 'https://api.roracle.org'

/**
 * Fetch ROR records for the given affiliation string
 * @param {string} affiliation - Affiliation string to lookup
 * @returns {Promise<Object>} - Response with ROR records
 */
export const fetchRORRecords = async (affiliation) => {
  try {
    const encodedAffiliation = encodeURIComponent(affiliation)
    const response = await axios.get(`${API_BASE_URL}/ror-records?affiliation=${encodedAffiliation}`)
    return response.data
  } catch (error) {
    console.error('Error fetching ROR records:', error)
    throw error
  }
}

/**
 * Fetch test results from the RORacle API
 * @returns {Promise<Object>} - Response with test results
 */
export const fetchTestResults = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tests`)
    return response.data
  } catch (error) {
    console.error('Error fetching test results:', error)
    throw error
  }
}

/**
 * Fetch API documentation
 * @returns {Promise<Object>} - Response with API documentation
 */
export const fetchAPIDocumentation = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/docs`)
    return response.data
  } catch (error) {
    console.error('Error fetching API documentation:', error)
    throw error
  }
}
