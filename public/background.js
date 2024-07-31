chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Check if 'gettingStartedShown' is already set
    chrome.storage.local.get('gettingStartedShown', (result) => {
      if (!result.gettingStartedShown) {
        // Set 'gettingStartedShown' to true
        chrome.storage.local.set({ gettingStartedShown: true });

        // Create a new tab with thanks.html
        chrome.tabs.create({ url: 'index.html' });
      }
    });
  }
});