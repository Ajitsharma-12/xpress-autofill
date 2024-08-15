<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <img src="icons/meteor-solid.png" alt="Icon" width="30" height="30" class="d-inline-block align-text-top">
          Xpress - AutoFill
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav" role="tablist">
            <li class="nav-item">
              <button class="nav-link" :class="{ active: activeTab === 'getting-started' }" @click="setActiveTab('getting-started')" role="tab">Documentation</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" :class="{ active: activeTab === 'rules' }" @click="setActiveTab('rules')" role="tab">Saved Entries</button>
            </li>
            <!-- <li class="nav-item">
              <button class="nav-link" :class="{ active: activeTab === 'variables' }" @click="setActiveTab('variables')" role="tab">Variables</button>
            </li> -->
          </ul>
        </div>
      </div>
    </nav>
    <div class="tab-content">
      <div class="tab-pane fade" :class="{ show: activeTab === 'rules', active: activeTab === 'rules' }" role="tabpanel">
        <div class="container">
          <RulesComponent />
        </div>
      </div>

      <div class="tab-pane fade" :class="{ show: activeTab === 'variables', active: activeTab === 'variables' }" role="tabpanel">
        <div class="container">
          <h2>Variables</h2>
          <p>Variables Section</p>
        </div>
      </div>

      <div class="tab-pane fade" :class="{ show: activeTab === 'getting-started', active: activeTab === 'getting-started' }" role="tabpanel">
        <GettingStarted />
      </div>
    </div>
  </div>
</template>

<script>
import RulesComponent from "@/components/rules/rules.vue";
import GettingStarted from "@/components/post-install/gettingstarted.vue";

export default {
  name: 'ManageComponent',
  components: {
    RulesComponent,
    GettingStarted
  },
  data() {
    return {
      activeTab: localStorage.getItem('activeTab') || 'getting-started'
    };
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
      localStorage.setItem('activeTab', tab);
    }
  }
}
</script>

<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #e0e0e0; /* Light text color for dark mode */
  background-color: #121212; /* Dark background color */
}

.navbar {
  background-color: #1f1f1f; /* Darker background for navbar */
}

.nav-link {
  color: #e0e0e0; /* Light text color for nav links */
}

.nav-link.active {
  color: #1e90ff; /* Accent color for active nav link */
}

.container {
  max-width: 100%;
  overflow-x: auto;
}

h2 {
  color: #e0e0e0; /* Light text color for headings */
}

p {
  color: #b0b0b0; /* Slightly lighter color for paragraphs */
}
</style>
