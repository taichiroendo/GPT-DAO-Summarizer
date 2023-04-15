chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js'],
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });
});
