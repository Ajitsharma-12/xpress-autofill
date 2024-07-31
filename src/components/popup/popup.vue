<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title text-center">Xpress - AutoFill</h5>
      <!-- <p class="card-text text-center">Choose an option below:</p> -->

      <!-- <button class="btn btn-custom btn-clear" id="clear-storage">
        <i class="bi bi-trash-fill"></i> Clear Data
      </button>
       -->
      <button class="btn btn-custom btn-randomFill" id="fake-fill">
        <i class="bi bi-magic"></i> Fill Fake Values
      </button>
      <button class="btn btn-custom btn-save" id="save-data">
        <i class="bi bi-save-fill"></i> Save Filled Data
      </button>
      <button class="btn btn-custom btn-manage" id="view-rules">
        <i class="bi bi-gear-fill"></i> Manage Rules
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PopupC'
}

document.addEventListener('DOMContentLoaded', () => {

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length === 0) {
      console.error('No active tab found');
      return;
    }
  });

  document.getElementById('view-rules').addEventListener('click', () => {
    chrome.tabs.create({url: 'index.html'});
  });

  document.getElementById('save-data').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length === 0) {
        console.error('No active tab found');
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, {action: 'saveFormData'}, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError.message);
          return;
        }
        if (response && response.status === 'success') {
          // alert('Form data saved and updated!');
          const saveButton = document.getElementById('save-data');
          saveButton.className = 'btn btn-custom btn-success';
          saveButton.innerHTML = '<i class="bi bi-check2-circle"></i>Data Saved !!!';
        } else {
          console.error('Failed to save form data');
          alert('Failed to save form data.');
        }
      });
    });
  });

  document.getElementById('fake-fill').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length === 0) {
        console.error('No active tab found');
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, {action: 'fillFakeValues'}, () => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError.message);
          return;
        }
      });
    });
  });

/*  document.getElementById('clear-storage').addEventListener('click', () => {
    chrome.storage.local.clear(() => {
      alert('All saved data cleared!');
    });
  });*/

})
</script>


<style>
body {
  width: 300px;
  padding: 10px;
  background-color: #f8f9fa;
  font-family: Arial, sans-serif;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.btn-custom {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-custom i {
  margin-right: 5px;
}

.btn-save {
  background-color: #0d6efd;
  color: #fff;
}

.btn-clear {
  background-color: #dc3545;
  color: #fff;
}

.btn-manage {
  background-color: #C70039;
  color: #fff;
}

.btn-randomFill {
  background-color: #7e5109;
  color: #fff;
}
</style>