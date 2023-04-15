document.getElementById('settings-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const apiKey = document.getElementById('apikey').value;
  await chrome.storage.sync.set({ apiKey });
  alert('API Key saved');
});
