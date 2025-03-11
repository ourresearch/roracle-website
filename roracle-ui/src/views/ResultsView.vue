<template>
  <div class="results">
    <div class="results-header">
      <h2>ROR ID Matching Results</h2>
      <div class="stats">
        <div class="stat">
          <strong>{{ results.length }}</strong> affiliations
        </div>
        <div class="stat">
          <strong>{{ totalOrganizations }}</strong> organizations
        </div>
        <div class="stat">
          <strong>{{ averageOrgsPerAffiliation.toFixed(1) }}</strong> orgs per affiliation
        </div>
      </div>
      <button class="btn" @click="downloadCSV">Download CSV</button>
    </div>

    <div v-if="loading" class="loading">
      <p>Loading results...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="btn" @click="goHome">Go Back</button>
    </div>

    <div v-else-if="results.length === 0" class="no-results">
      <p>No results found. Please try a different search.</p>
      <button class="btn" @click="goHome">Go Back</button>
    </div>

    <div v-else class="results-list">
      <div v-for="(result, index) in results" :key="index" class="card result-card">
        <h3 class="affiliation">{{ result.affiliation }}</h3>
        <div class="organizations">
          <div 
            v-for="org in result.organizations" 
            :key="org.id" 
            class="tag"
            @mouseenter="showTooltip(org)"
            @mouseleave="hideTooltip"
            @click="openRORPage(org.id)"
          >
            {{ org.names[0] }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="tooltipOrg" class="tooltip" :style="tooltipStyle">
      <h4>{{ tooltipOrg.names[0] }}</h4>
      <p>Alternate names:</p>
      <ul>
        <li v-for="(name, i) in tooltipOrg.names.slice(1)" :key="i">{{ name }}</li>
      </ul>
      <p v-if="tooltipOrg.location">Location: {{ tooltipOrg.location }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchRORRecords } from '../services/api'

export default {
  name: 'ResultsView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const results = ref([])
    const loading = ref(true)
    const error = ref(null)
    const tooltipOrg = ref(null)
    const tooltipStyle = reactive({
      top: '0px',
      left: '0px'
    })

    const totalOrganizations = computed(() => {
      return results.value.reduce((total, result) => {
        return total + (result.organizations?.length || 0)
      }, 0)
    })

    const averageOrgsPerAffiliation = computed(() => {
      if (results.value.length === 0) return 0
      return totalOrganizations.value / results.value.length
    })

    onMounted(async () => {
      try {
        const query = route.query.affiliations
        if (!query) {
          error.value = 'No affiliations provided'
          loading.value = false
          return
        }

        const affiliations = JSON.parse(query)
        
        // Process each affiliation
        const resultsData = []
        for (const affiliation of affiliations) {
          const data = await fetchRORRecords(affiliation)
          resultsData.push({
            affiliation,
            organizations: data.results || []
          })
        }
        
        results.value = resultsData
      } catch (err) {
        error.value = `Error fetching results: ${err.message}`
      } finally {
        loading.value = false
      }
    })

    const goHome = () => {
      router.push({ name: 'home' })
    }

    const showTooltip = (org) => {
      tooltipOrg.value = org
      // In a real implementation, we'd calculate the position based on the mouse event
      // For now, just use fixed position for demo
      tooltipStyle.top = '50%'
      tooltipStyle.left = '50%'
    }

    const hideTooltip = () => {
      tooltipOrg.value = null
    }

    const openRORPage = (rorId) => {
      window.open(rorId, '_blank')
    }

    const downloadCSV = () => {
      // Create CSV content
      const headers = ['Affiliation', 'ROR IDs']
      const rows = results.value.map(result => [
        result.affiliation,
        result.organizations.map(org => org.id).join(' ')
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'roracle-results.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      results,
      loading,
      error,
      totalOrganizations,
      averageOrgsPerAffiliation,
      tooltipOrg,
      tooltipStyle,
      goHome,
      showTooltip,
      hideTooltip,
      openRORPage,
      downloadCSV
    }
  }
}
</script>

<style scoped>
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.affiliation {
  margin-bottom: 0.75rem;
}

.organizations {
  display: flex;
  flex-wrap: wrap;
  margin: -0.25rem;
}

.loading, .error, .no-results {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  margin: 2rem 0;
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
  transform: translate(-50%, -50%);
}

.tooltip h4 {
  margin-bottom: 0.5rem;
}

.tooltip ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}
</style>
