<template>
  <div>
    <div class="container thank-you-container">
      <div v-html="markdownContent" class="markdown-content">
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';

export default {
  name: 'GettingStarted',
  data() {
    return {
      markdownContent: ''
    }
  },

  mounted() {
    this.fetchMarkdown();
  },
  methods: {
    async fetchMarkdown() {
      try {
        const response = await fetch('/getting-started.md');
        const markdown = await response.text();
        this.markdownContent = marked(markdown);
      } catch (error) {
        console.error('Error fetching markdown file:', error);
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
body {
  padding: 20px;
  color: #ffffff;
  background-color: #121212;
}

.container {
  max-width: 100%;
  overflow-x: auto;
}


.thank-you-container {
  margin-left: 20px;
  text-align: center;
}

.markdown-content {
  text-align: left;
  margin-top: 1rem;
}
</style>