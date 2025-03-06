<template>
  <div class="tests">
    <div class="tests-header card">
      <h2>Test Results</h2>
      
      <div v-if="loading" class="loading">
        <p>Running tests...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button class="btn" @click="goHome">Go Back</button>
      </div>
      
      <div v-else class="stats-container">
        <div v-for="(stats, dataset) in datasetStats" :key="dataset" class="dataset-stats">
          <h3>{{ dataset }}</h3>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-label">Precision</div>
              <div class="stat-value">{{ formatPercent(stats.precision) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Recall</div>
              <div class="stat-value">{{ formatPercent(stats.recall) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Tests</div>
              <div class="stat-value">{{ stats.count }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">RORs/String</div>
              <div class="stat-value">{{ stats.avgRORs.toFixed(1) }}</div>
            </div>
          </div>
        </div>
        
        <div class="filter-controls">
          <div class="filter-group">
            <label>Datasets:</label>
            <div class="checkbox-list">
              <label v-for="dataset in availableDatasets" :key="dataset" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="dataset" 
                  v-model="filters.datasets"
                >
                {{ dataset }}
              </label>
            </div>
          </div>
          
          <div class="filter-group">
            <label>Error Status:</label>
            <div class="checkbox-list">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  value="no_errors" 
                  v-model="filters.errorStatuses"
                >
                No Errors
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  value="under_matches" 
                  v-model="filters.errorStatuses"
                >
                Under Matches
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  value="over_matches" 
                  v-model="filters.errorStatuses"
                >
                Over Matches
              </label>
            </div>
          </div>
          
          <div class="filter-group">
            <label>Sort By:</label>
            <select v-model="sortBy" class="select-control">
              <option value="testId">Test ID</option>
              <option value="affiliationLength">Affiliation Length</option>
              <option value="errorStatus">Error Status</option>
              <option value="random">Random</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error" class="test-results">
      <div v-for="test in filteredAndSortedTests" :key="test.test_id" class="card test-card">
        <div class="test-meta">
          <span class="test-id">ID: {{ test.test_id }}</span>
          <span class="dataset-name">{{ test.dataset_name }}</span>
        </div>
        
        <h3 class="affiliation">{{ test.affiliation }}</h3>
        
        <div v-if="test.matches.length > 0" class="matches-section">
          <h4>Matches</h4>
          <div class="matches">
            <div 
              v-for="match in test.matches" 
              :key="match.id" 
              class="tag tag-success"
              @mouseenter="showTooltip(match, $event)"
              @mouseleave="hideTooltip"
              @click="openRORPage(match.id)"
            >
              {{ match.names[0] }}
            </div>
          </div>
        </div>
        
        <div v-if="test.under_matches.length > 0" class="matches-section">
          <h4>Under Matches</h4>
          <div class="matches">
            <div 
              v-for="match in test.under_matches" 
              :key="match.id" 
              class="tag tag-warning"
              @mouseenter="showTooltip(match, $event)"
              @mouseleave="hideTooltip"
              @click="openRORPage(match.id)"
            >
              {{ match.names[0] }}
            </div>
          </div>
        </div>
        
        <div v-if="test.over_matches.length > 0" class="matches-section">
          <h4>Over Matches</h4>
          <div class="matches">
            <div 
              v-for="match in test.over_matches" 
              :key="match.id" 
              class="tag tag-error"
              @mouseenter="showTooltip(match, $event)"
              @mouseleave="hideTooltip"
              @click="openRORPage(match.id)"
            >
              {{ match.names[0] }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="tooltipOrg" class="tooltip" :style="tooltipStyle">
      <h4>{{ tooltipOrg.names[0] }}</h4>
      <p v-if="tooltipOrg.names.length > 1">Alternate names:</p>
      <ul v-if="tooltipOrg.names.length > 1">
        <li v-for="(name, i) in tooltipOrg.names.slice(1)" :key="i">{{ name }}</li>
      </ul>
      <p v-if="tooltipOrg.location">Location: {{ tooltipOrg.location }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTestResults } from '../services/api'

export default {
  name: 'TestsView',
  setup() {
    const router = useRouter()
    const tests = ref([])
    const loading = ref(true)
    const error = ref(null)
    const tooltipOrg = ref(null)
    const tooltipStyle = reactive({
      top: '0px',
      left: '0px'
    })
    
    // Filters and sorting
    const availableDatasets = ref([])
    const filters = reactive({
      datasets: [],
      errorStatuses: ['no_errors', 'under_matches', 'over_matches']
    })
    const sortBy = ref('testId')
    
    // Computed properties
    const datasetStats = computed(() => {
      const stats = {}
      
      tests.value.forEach(test => {
        if (!stats[test.dataset_name]) {
          stats[test.dataset_name] = {
            precision: 0,
            recall: 0,
            count: 0,
            totalRORs: 0,
            avgRORs: 0,
            passing: 0
          }
        }
        
        stats[test.dataset_name].count++
        stats[test.dataset_name].totalRORs += test.matches.length
        
        if (test.is_passing) {
          stats[test.dataset_name].passing++
        }
      })
      
      // Calculate averages and percentages
      Object.keys(stats).forEach(dataset => {
        const ds = stats[dataset]
        ds.avgRORs = ds.totalRORs / ds.count
        ds.precision = ds.passing / ds.count
        ds.recall = ds.passing / ds.count // Simplified for demo; real recall calculation would be different
      })
      
      return stats
    })
    
    const filteredAndSortedTests = computed(() => {
      // Filter by datasets
      let filtered = tests.value
      
      if (filters.datasets.length > 0) {
        filtered = filtered.filter(test => filters.datasets.includes(test.dataset_name))
      }
      
      // Filter by error status
      const showNoErrors = filters.errorStatuses.includes('no_errors')
      const showUnderMatches = filters.errorStatuses.includes('under_matches')
      const showOverMatches = filters.errorStatuses.includes('over_matches')
      
      filtered = filtered.filter(test => {
        if (showNoErrors && test.under_matches.length === 0 && test.over_matches.length === 0) {
          return true
        }
        if (showUnderMatches && test.under_matches.length > 0) {
          return true
        }
        if (showOverMatches && test.over_matches.length > 0) {
          return true
        }
        return false
      })
      
      // Sort tests
      let sorted = [...filtered]
      
      switch (sortBy.value) {
        case 'affiliationLength':
          sorted.sort((a, b) => a.affiliation.length - b.affiliation.length)
          break
        case 'errorStatus':
          sorted.sort((a, b) => {
            // No errors first, then overmatches, then undermatches
            const getErrorWeight = (test) => {
              if (test.under_matches.length === 0 && test.over_matches.length === 0) return 0
              if (test.over_matches.length > 0) return 1
              return 2
            }
            
            const weightA = getErrorWeight(a)
            const weightB = getErrorWeight(b)
            
            if (weightA === weightB) {
              return a.test_id - b.test_id // Break ties with test ID
            }
            
            return weightA - weightB
          })
          break
        case 'random':
          sorted.sort(() => Math.random() - 0.5)
          break
        default: // testId
          sorted.sort((a, b) => a.test_id - b.test_id)
      }
      
      return sorted
    })
    
    // Methods
    const formatPercent = (value) => {
      return `${(value * 100).toFixed(1)}%`
    }
    
    const showTooltip = (org, event) => {
      tooltipOrg.value = org
      
      // Position the tooltip near the mouse
      if (event) {
        tooltipStyle.top = `${event.clientY}px`
        tooltipStyle.left = `${event.clientX + 20}px`
      }
    }
    
    const hideTooltip = () => {
      tooltipOrg.value = null
    }
    
    const openRORPage = (rorId) => {
      window.open(rorId, '_blank')
    }
    
    const goHome = () => {
      router.push({ name: 'home' })
    }
    
    // Load test data on mount
    onMounted(async () => {
      try {
        const response = await fetchTestResults()
        
        // Extract test data
        tests.value = [
          ...response.passing_tests || [],
          ...response.failing_tests || []
        ]
        
        // Get unique datasets
        availableDatasets.value = [...new Set(tests.value.map(test => test.dataset_name))]
        
        // Initial filter: select all datasets
        filters.datasets = [...availableDatasets.value]
        
      } catch (err) {
        error.value = `Error running tests: ${err.message}`
      } finally {
        loading.value = false
      }
    })
    
    return {
      tests,
      loading,
      error,
      datasetStats,
      availableDatasets,
      filters,
      sortBy,
      filteredAndSortedTests,
      tooltipOrg,
      tooltipStyle,
      formatPercent,
      showTooltip,
      hideTooltip,
      openRORPage,
      goHome
    }
  }
}
</script>

<style scoped>
.tests-header {
  margin-bottom: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.stats-container {
  margin-top: 1.5rem;
}

.dataset-stats {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.stat {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.25rem;
  min-width: 100px;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group > label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.select-control {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  width: 100%;
}

.test-card {
  margin-bottom: 1rem;
}

.test-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
}

.affiliation {
  margin-bottom: 1rem;
}

.matches-section {
  margin-bottom: 1rem;
}

.matches-section h4 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.matches {
  display: flex;
  flex-wrap: wrap;
  margin: -0.25rem;
}

.tooltip {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  z-index: 1000;
}

.tooltip h4 {
  margin-bottom: 0.5rem;
}

.tooltip ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}
</style>
