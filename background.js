let backgroundPort = null;

async function getPromptWithContent(pageContent, promptString) {
  return `${promptString}\n\n${pageContent}`;
}

chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === 'content') {
    port.onMessage.addListener(async (msg) => {
      if (msg.action === 'contentScriptLoaded') {
        if (backgroundPort) {
          backgroundPort.postMessage({ action: 'contentScriptLoaded' });
        }
      } else if (msg.action === 'extractText') {
        if (backgroundPort) {
          const text = msg.text;
          const promptWithContent = await getPromptWithContent(text, "以下のテキストを要約してください：");

          const { apiKey } = await chrome.storage.sync.get('apiKey');
          if (!apiKey) {
            backgroundPort.postMessage({ error: 'API Key is not set. Please set it in the options page.' });
            return;
          }

          const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: promptWithContent }],
            }),
          };

          try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
            const data = await response.json();

            if (data.choices && data.choices[0] && data.choices[0].message.content) {
              const text = data.choices[0].message.content.trim();
              backgroundPort.postMessage({ text: text });
            } else {
              backgroundPort.postMessage({ error: 'Error: No response from ChatGPT' });
            }
          } catch (error) {
            backgroundPort.postMessage({ error: 'Error: Unable to fetch response from ChatGPT' });
          }
        }
      }
    });
  } else if (port.name === 'popup') {
    backgroundPort = port;

    port.onDisconnect.addListener(() => {
      backgroundPort = null;
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {

});
