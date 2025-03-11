<template>
  <div class="home">
    <div class="card">
      <h2>Affiliation Lookup</h2>
      <p class="description">
        Enter affiliation strings to find matching ROR IDs. Enter one affiliation per line.
      </p>
      <div class="form-control">
        <textarea
          v-model="affiliationInput"
          placeholder="Enter affiliations here, one per line (e.g. 'MIT, Cambridge MA')"
          @keydown.meta.enter="submitAffiliations"
        ></textarea>
      </div>
      <div class="button-group">
        <button class="btn" @click="submitAffiliations">Get ROR IDs</button>
        <button class="btn btn-secondary" @click="runTests">Run Tests</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'HomeView',
  setup() {
    const affiliationInput = ref('')
    const router = useRouter()

    const submitAffiliations = () => {
      if (!affiliationInput.value.trim()) {
        alert('Please enter at least one affiliation')
        return
      }

      // Split input by new lines and filter out empty lines
      const affiliations = affiliationInput.value
        .split('\n')
        .map(a => a.trim())
        .filter(a => a)

      // Navigate to results page with affiliations as query params
      router.push({
        name: 'results',
        query: { affiliations: JSON.stringify(affiliations) }
      })
    }

    const runTests = () => {
      router.push({ name: 'tests' })
    }

    return {
      affiliationInput,
      submitAffiliations,
      runTests
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

.description {
  margin-bottom: 1rem;
  color: #666;
}

.button-group {
  display: flex;
  gap: 1rem;
}

textarea {
  min-height: 200px;
}
</style>
