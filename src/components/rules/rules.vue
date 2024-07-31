<template>
  <div>
    <div class="tab-content p-3">
      <div class="tab-pane fade show active" id="rules-tab-pane" role="tabpanel" aria-labelledby="rules-tab">
        <div class="container">
          <div class="d-flex justify-content-between mb-4">
            <h4 class="text-light">Saved Data (These values will be AutoFilled when you visit the mapped website)</h4>
            <button id="add-row" class="btn btn-success btn-add" :class="{ hidden: !selectedUrl }" @click="addRule">Add Rule</button>
          </div>
          <div id="rules-list">
            <div class="d-flex align-items-center mb-4">
              <select class="form-select me-2" v-model="selectedUrl" @change="handleUrlChange">
                <option value="">Select URL</option>
                <option v-for="url in urls" :key="url" :value="url">{{ url }}</option>
              </select>
              <i class="bi bi-pencil ms-3 text-light" data-bs-toggle="tooltip" v-if="selectedUrl" data-bs-placement="top" title="Edit the URL" @click="showEditUrlModal"></i>
              <i class="bi bi-trash ms-3 text-light" data-bs-toggle="tooltip" v-if="selectedUrl" data-bs-placement="top" title="Delete the URL" @click="deleteUrl"></i>
            </div>
            <div v-if="Object.keys(rulesData).length > 0" class="table-responsive">
              <table class="table table-dark table-striped table-bordered">
                <thead>
                <tr>
                  <th class="actions-cell">Actions</th>
                  <th>Query Selector</th>
                  <th>Field Name</th>
                  <th>Value</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(rule, selector) in rulesData" :key="selector">
                  <td class="text-center">
                    <button class="btn btn-warning btn-sm mx-1" @click="editRule(selector)">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm mx-1" @click="deleteRule(selector)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                  <td>{{ selector }}</td>
                  <td>{{ rule.name }}</td>
                  <td>{{ Array.isArray(rule.value) ? rule.value.join(', ') : rule.value }}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit URL Modal -->
    <div class="modal fade" id="editUrlModal" tabindex="-1" aria-labelledby="editUrlModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content bg-dark text-light">
          <div class="modal-header">
            <h5 class="modal-title" id="editUrlModalLabel">Edit URL (You can also use regex and frame the website url)</h5>
            <button type="button" class="btn-close btn-close-light" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateUrl">
              <div class="mb-3">
                <label for="newUrl" class="form-label">Edit URL</label>
                <input type="text" class="form-control" id="newUrl" v-model="newUrl" required>
              </div>
              <button type="submit" class="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Rule Modal -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content bg-dark text-light">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Edit / Add Rule</h5>
            <button type="button" class="btn-close btn-close-light" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateRule">
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" v-model="editForm.name" required>
              </div>
              <div class="mb-3">
                <label for="selector" class="form-label">Selector</label>
                <input type="text" class="form-control" id="selector" v-model="editForm.selector" required>
              </div>
              <div class="mb-3">
                <label for="value" class="form-label">Value</label>
                <input type="text" class="form-control" id="value" v-model="editForm.value" required>
              </div>
              <button type="submit" class="btn btn-primary">Update</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal, Tooltip } from 'bootstrap';

export default {
  name: 'RulesC',
  data() {
    return {
      selectedUrl: '',
      urls: [],
      rulesData: {},
      editForm: {
        name: '',
        selector: '',
        oldSelector: '',
        value: ''
      },
      newUrl: ''
    };
  },
  methods: {
    deleteUrl() {
      if (confirm('Are you sure you want to delete this Url (It will remove all values that were saved against this Url) ?')) {
        const index = this.urls.indexOf(this.selectedUrl);
        this.urls.splice(index, 1);
        chrome.storage.local.remove(this.selectedUrl);
        this.selectedUrl = '';
        this.reloadUrlSelectAndTable();
      }
    },
    reloadUrlSelectAndTable() {
      this.fetchUrls();
      this.rulesData = {};
    },
    fetchUrls() {
      chrome.storage.local.get(null, (result) => {
        this.urls = Object.keys(result);
      });
    },
    fetchRules(url) {
      for (const key in this.rulesData) {
        if (Object.prototype.hasOwnProperty.call(this.rulesData, key)) {
          delete this.rulesData[key];
        }
      }
      chrome.storage.local.get(url, (result) => {
        Object.assign(this.rulesData, result[url] || {});
      });
    },
    handleUrlChange() {
      if (this.selectedUrl) {
        this.fetchRules(this.selectedUrl);
      }
    },
    addRule() {
      Object.assign(this.editForm, {
        name: '',
        selector: '',
        oldSelector: '',
        value: ''
      });
      this.$refs.editModal.show();
    },
    editRule(selector) {
      const rule = this.rulesData[selector];
      if (rule) {
        this.editForm.name = rule.name;
        this.editForm.selector = selector;
        this.editForm.value = rule.value;
        this.editForm.oldSelector = selector;
        this.$refs.editModal.show();
      }
    },
    updateRule() {
      if (this.editForm.selector) {
        const oldSelector = this.editForm.oldSelector;
        const newSelector = this.editForm.selector;

        if (oldSelector !== newSelector) {
          delete this.rulesData[oldSelector];
        }

        this.rulesData[newSelector] = { name: this.editForm.name, value: this.editForm.value };
        this.saveData();
        this.$refs.editModal.hide();
      }
    },
    deleteRule(selector) {
      if (confirm('Are you sure you want to delete this field?')) {
        delete this.rulesData[selector];
        this.saveData();
      }
    },
    saveData() {
      if (this.selectedUrl) {
        chrome.storage.local.set({ [this.selectedUrl]: this.rulesData });
      }
    },
    showEditUrlModal() {
      this.newUrl = this.selectedUrl;
      this.$refs.editUrlModal.show();
    },
    updateUrl() {
      if (this.newUrl && this.newUrl !== this.selectedUrl) {
        chrome.storage.local.get(null, (result) => {
          const existingUrls = Object.keys(result);

          if (!existingUrls.includes(this.newUrl)) {
            const existingRules = result[this.selectedUrl] || {};

            chrome.storage.local.set({ [this.newUrl]: existingRules }, () => {
              chrome.storage.local.remove(this.selectedUrl, () => {
                this.urls = this.urls.map(url => url === this.selectedUrl ? this.newUrl : url);
                this.selectedUrl = this.newUrl;
                this.newUrl = '';
                this.$refs.editUrlModal.hide();
              });
            });
          } else {
            alert('The URL already exists.');
          }
        });
      } else if (this.newUrl === this.selectedUrl) {
        alert('The new URL must be different from the current URL.');
      } else {
        alert('Please enter a valid URL.');
      }
    }
  },
  mounted() {
    this.fetchUrls();

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new Tooltip(tooltipTriggerEl));

    // Initialize modals
    this.$refs.editUrlModal = new Modal(document.getElementById('editUrlModal'));
    this.$refs.editModal = new Modal(document.getElementById('editModal'));
  }
}
</script>

<style scoped>
/* General Modal Styles */
.modal-content {
  background-color: #343a40; /* Dark background */
  color: #f8f9fa; /* Light text color */
}

/* Input Field Styles */
.modal-content .form-control {
  background-color: #ffffff; /* White background for input fields */
  color: #212529; /* Dark text color for readability */
  border: 1px solid #ced4da; /* Light border to match Bootstrap's default */
}
/* Select Dropdown Styles */
.form-select {
  background-color: #f5f5dc; /* White background for select dropdown */
  color: #212529; /* Dark text color for readability */
}

.modal-content .form-control::placeholder {
  color: #adb5bd; /* Lighter placeholder color */
}

/* Modal Close Button Styles */
.btn-close-light {
  filter: invert(1);
}

/* Table Styles */
.table-dark {
  background-color: #343a40; /* Dark background for table */
  color: #f8f9fa; /* Light text color */
}

.table-dark .table-striped tbody tr:nth-of-type(odd) {
  background-color: #495057; /* Darker row background for odd rows */
}

/* Additional Styling */
.btn-warning, .btn-danger {
  margin: 0 2px;
}

.bg-secondary {
  background-color: #6c757d; /* Dark secondary background color */
}

.text-light {
  color: #f8f9fa; /* Light text color */
}
</style>