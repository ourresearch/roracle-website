<template>
  <header class="header">
    <div class="container">
      <h1 class="site-title">RORacle UI</h1>
      <p class="site-description">Affiliation to ROR ID matching service</p>
    </div>
  </header>

  <main class="container">
    <router-view />
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; {{ new Date().getFullYear() }} RORacle</p>
    </div>
  </footer>
</template>

<style>
.header {
  background-color: var(--primary-color);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.site-title {
  margin-bottom: 0.5rem;
}

.site-description {
  opacity: 0.8;
}

.footer {
  background-color: var(--text-color);
  color: white;
  padding: 1.5rem 0;
  margin-top: 2rem;
  text-align: center;
}
</style>
