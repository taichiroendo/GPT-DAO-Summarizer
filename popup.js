document.getElementById('prompt-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = document.getElementById('prompt').value;
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = '';
  
    const { apiKey } = await chrome.storage.sync.get('apiKey');
    if (!apiKey) {
      alert('API Key is not set. Please set it in the options page.');
      return;
    }
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello!' }]
      })
    };
  
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
        const data = await response.json();
      
        console.log('Response data:', data); // Add this line to log the response data
      
        if (data.choices && data.choices[0] && data.choices[0].message.content) {
          const text = data.choices[0].message.content.trim();
      
          for (const character of text) {
            const span = document.createElement('span');
            span.textContent = character;
            responseDiv.appendChild(span);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else {
          responseDiv.textContent = 'Error: No response from ChatGPT';
          console.error('Error: No response from ChatGPT', data); // Add this line to log the error
        }
      } catch (error) {
        console.error('Error:', error);
        responseDiv.textContent = 'Error: Unable to fetch response from ChatGPT';
      }      
  });
  