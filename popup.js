document.addEventListener('DOMContentLoaded', async () => {
  const responseDiv = document.getElementById('extracted-text');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true });

  if (tab && tab.id) {
    try {
      // content.js を実行します
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });

      const popupPort = chrome.runtime.connect({ name: 'popup' });

      // 修正: contentScriptLoaded メッセージを受信したら、extractText メッセージを送信
      popupPort.onMessage.addListener((response) => {
        if (response.action === 'contentScriptLoaded') {
          popupPort.postMessage({ action: 'extractText' });
        } else if (response.error) {
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
