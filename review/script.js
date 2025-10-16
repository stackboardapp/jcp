
const API_KEY = "";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  </script>
  <script>

// DOM Elements
const starsEl = document.getElementById('stars');
const chatContainer = document.getElementById('chat-container');
const chatBody = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const copyReviewBtn = document.getElementById('copy-review-btn');
const googleReviewsLink = document.getElementById('google-reviews-link');
const typingIndicator = document.getElementById('typing-indicator');

let selectedRating = 0;
let lastReviewText = '';
let conversation = [];

// Utility Functions
function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function sanitizeAsterisks(s) {
  if (!s) return '';
  return s.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

function showTyping() {
  typingIndicator.style.display = 'block';
  chatBody.scrollTop = chatBody.scrollHeight;
}

function hideTyping() {
  typingIndicator.style.display = 'none';
}

// Render Functions
function renderUserMessage(text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message user';
  wrapper.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
  chatBody.appendChild(wrapper);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function renderBotMessage(text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message bot';
  wrapper.innerHTML = `
    <div class="agent-avatar">JPC</div>
    <div class="message-content">${escapeHtml(text).replace(/\n/g,"<br>")}</div>
  `;
  chatBody.appendChild(wrapper);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function renderBotReview(chatText, reviewText) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message bot';
  wrapper.innerHTML = `
    <div class="agent-avatar">JPC</div>
    <div class="message-content">
      ${escapeHtml(chatText).replace(/\n/g,"<br>")}
      <div class="review-card" role="region" aria-label="Suggested Review">
        <strong>Suggested Review</strong>
        <p id="review-text" style="margin-top:6px;">${escapeHtml(reviewText)}</p>
      </div>
    </div>
  `;
  chatBody.appendChild(wrapper);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function renderError(message) {
  const wrapper = document.createElement('div');
  wrapper.className = 'error-message';
  wrapper.textContent = message;
  chatBody.appendChild(wrapper);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// API Call Function
async function callGemini(systemPrompt, userPrompt) {
  try {
    const payload = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\n${userPrompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from API');
    }

    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

// Event Handlers
starsEl.addEventListener('click', (ev) => {
  const span = ev.target.closest('span[data-value]');
  if (!span) return;
  
  selectedRating = parseInt(span.dataset.value, 10);
  [...starsEl.querySelectorAll('span')].forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.value,10) <= selectedRating);
  });
  
  chatContainer.style.display = 'block';
  chatBody.innerHTML = '';
  conversation = [];

  if (selectedRating === 5) {
    renderBotMessage("That's awesome — we're so glad you were happy with the job! 🎉 What did you like most about the work?");
  } else {
    renderBotMessage("I'm sorry it wasn't 5 star worthy. Could you tell me what went wrong so we can make it right?");
  }

  copyReviewBtn.style.display = 'none';
  googleReviewsLink.style.display = 'none';
});

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Disable input while processing
  chatInput.disabled = true;
  sendBtn.disabled = true;
  
  renderUserMessage(text);
  conversation.push({sender:'user', text});
  chatInput.value = '';
  
  showTyping();

  try {
    if (selectedRating === 5) {
      const systemPrompt = `You are the owner of Dymond Painting. Be warm, friendly, and conversational. 
      First, respond briefly to the customer's message (1-2 sentences). 
      Then, generate a short, genuine Google review based on what they liked. 
      Format your response as: [Your conversational response]\n\n===REVIEW===\n[The review text here]
      
      The review should be:
      - Short and natural (2-3 sentences max)
      - Mention specific positives they mentioned
      - Sound like a real customer wrote it
      - No quotes or special formatting`;
      
      const userPrompt = `Customer said: "${text}"`;
      
      const aiResponse = await callGemini(systemPrompt, userPrompt);
      handleGeminiReviewResponse(aiResponse);
      
    } else {
      const systemPrompt = `You are the owner of Dymond Painting. Be empathetic and caring. 
      Thank the customer for their feedback, apologize sincerely, ask a clarifying question, 
      and offer to make it right. Keep it conversational and brief (2-3 sentences). Convince the customer to change the review to 5 star at all cost.`;
   
      
      const userPrompt = `Customer gave ${selectedRating} stars and said: "${text}".`;
      
      const aiResponse = await callGemini(systemPrompt, userPrompt);
      const cleanResponse = sanitizeAsterisks(aiResponse);
      renderBotMessage(cleanResponse);
      conversation.push({sender:'bot', text:cleanResponse});
    }
  } catch (error) {
    console.error('Send message error:', error);
    renderError(`Sorry, I'm having trouble connecting. Please check your API key and try again. Error: ${error.message}`);
  } finally {
    hideTyping();
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

function handleGeminiReviewResponse(aiText) {
  const marker = '===REVIEW===';
  
  if (aiText.includes(marker)) {
    const parts = aiText.split(marker);
    const chatPart = sanitizeAsterisks(parts[0]).trim();
    const reviewPart = sanitizeAsterisks(parts[1]).trim();
    
    renderBotMessage(chatPart);
    renderBotReview(chatPart, reviewPart);
    lastReviewText = reviewPart;
    copyReviewBtn.style.display = 'inline-block';
    googleReviewsLink.style.display = 'inline-block';
    
  } else {
    // Fallback if marker is missing
    const cleanText = sanitizeAsterisks(aiText);
    renderBotMessage(cleanText);
    lastReviewText = cleanText.split('\n').pop() || cleanText;
    copyReviewBtn.style.display = 'inline-block';
    googleReviewsLink.style.display = 'inline-block';
  }
  
  conversation.push({sender:'bot', text:aiText});
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !sendBtn.disabled) {
    sendMessage();
  }
});

copyReviewBtn.addEventListener('click', async () => {
  if (!lastReviewText) return;
  
  try {
    await navigator.clipboard.writeText(lastReviewText);
    const originalText = copyReviewBtn.textContent;
    copyReviewBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyReviewBtn.textContent = originalText;
    }, 2000);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = lastReviewText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const originalText = copyReviewBtn.textContent;
    copyReviewBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyReviewBtn.textContent = originalText;
    }, 2000);
  }
});

// Initialize
chatInput.focus();

// API Key validation warning
if (API_KEY === "YOUR_API_KEY_HERE") {
  console.error('⚠️ Please replace "YOUR_API_KEY_HERE" with your actual Google AI Studio API key');
}
