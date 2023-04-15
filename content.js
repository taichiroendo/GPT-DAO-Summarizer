function extractTextContent() {
    const walkDocument = (node, callback) => {
      if (node.nodeType === Node.TEXT_NODE) {
        callback(node);
      } else {
        let child = node.firstChild;
        while (child) {
          walkDocument(child, callback);
          child = child.nextSibling;
        }
      }
    };
  
    const isHidden = (element) => {
      const style = window.getComputedStyle(element);
      return style.display === 'none' || style.visibility === 'hidden';
    };
  
    let extractedText = '';
    walkDocument(document.body, (textNode) => {
      const parent = textNode.parentNode;
      if (
        parent.tagName !== 'SCRIPT' &&
        parent.tagName !== 'STYLE' &&
        parent.tagName !== 'NOSCRIPT' &&
        parent.tagName !== 'IFRAME' &&
        !isHidden(parent)
      ) {
        extractedText += textNode.textContent.trim() + ' ';
      }
    });
  
    return extractedText;
  }
  

  async function getPromptWithContent(pageContent, promptString) {
    // Implement the logic to combine page content and prompt string
    // For example:
    return `${promptString}\n\n${pageContent}`;
  }
  
  chrome.runtime.onConnect.addListener(async (port) => {
    port.onMessage.addListener(async (msg) => {
      if (msg.action === 'extractText') {
        const text = extractTextContent();
  
        const promptWithContent = await getPromptWithContent(text, "以下のテキストを要約してください：");
  
        const { apiKey } = await chrome.storage.sync.get('apiKey');
        if (!apiKey) {
          port.postMessage({ error: 'API Key is not set. Please set it in the options page.' });
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
            port.postMessage({ text: text });
          } else {
            port.postMessage({ error: 'Error: No response from ChatGPT' });
          }
        } catch (error) {
          port.postMessage({ error: 'Error: Unable to fetch response from ChatGPT' });
        }
      }
    });
  });
  