document.addEventListener('DOMContentLoaded', async () => {
  const responseDiv = document.getElementById('extracted-text');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true });

  if (tab && tab.id) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });

      const port = chrome.tabs.connect(tab.id);
      port.postMessage({ action: 'extractText' });

      port.onMessage.addListener((response) => {
        if (response.error) {
          console.error(response.error);
          responseDiv.textContent = 'Error: Unable to fetch page text';
        } else if (response.text) {
          responseDiv.textContent = response.text;
        } else {
          responseDiv.textContent = 'Error: Unable to fetch page text';
        }
      });

    } catch (error) {
      console.error('Error:', error);
      responseDiv.textContent = 'Error: Unable to fetch page text';
    }
  } else {
    responseDiv.textContent = 'Error: No active tab found';
  }
});
