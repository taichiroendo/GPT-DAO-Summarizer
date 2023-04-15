console.log("content.js loaded");

function extractTextContent() {
  console.log("extractTextContent");
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
      parent.tagName !== 'NOSCRIPT' && parent.tagName !== 'IFRAME' && !isHidden(parent) ) { extractedText += textNode.textContent.trim() + ' '; } });

return extractedText; }

console.log("test13");

const contentPort = chrome.runtime.connect({ name: 'content' });

contentPort.onMessage.addListener(async (msg) => {
  if (msg.action === 'extractText') {
    const text = extractTextContent();
    console.log("text", text);
    contentPort.postMessage({ action: 'extractText', text: text });
  }
});



window.addEventListener('load', () => {
  contentPort.postMessage({ action: 'contentScriptLoaded' });
});
