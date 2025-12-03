// frontend/js/chat.js

let conversations = [];
let currentConversation = null;
let currentMessages = [];
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!protectPage()) return;
  updateNavbar();
  loadConversations();
  
  // Check if specific conversation ID in URL
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get('id');
  if (conversationId) {
    setTimeout(() => selectConversation(conversationId), 500);
  }
});

async function loadConversations() {
  const container = document.getElementById('conversationList');
  
  try {
    const response = await authenticatedFetch(API_ENDPOINTS.chats);
    const data = await response.json();
    
    if (data.success && data.conversations.length > 0) {
      conversations = data.conversations;
      displayConversations();
    } else {
      container.innerHTML = '<p style="padding: 1rem; text-align: center;">No conversations yet</p>';
    }
  } catch (error) {
    container.innerHTML = '<p class="error-message">Error loading conversations</p>';
  }
}

function displayConversations() {
  const container = document.getElementById('conversationList');
  const user = getUser();
  
  container.innerHTML = conversations.map(conv => {
    const otherUser = conv.participants.find(p => p._id !== user.id);
    return `
      <div class="conversation-item ${currentConversation && currentConversation._id === conv._id ? 'active' : ''}" 
           onclick="selectConversation('${conv._id}')">
        <strong>${conv.listing?.title || 'Listing'}</strong>
        <p style="font-size: 0.9rem; color: var(--text-muted);">${otherUser?.name || 'User'}</p>
        ${conv.lastMessage ? `<p style="font-size: 0.85rem; color: var(--text-muted);">${conv.lastMessage.substring(0, 30)}...</p>` : ''}
      </div>
    `;
  }).join('');
}

async function selectConversation(conversationId) {
  const conv = conversations.find(c => c._id === conversationId);
  if (!conv) return;
  
  currentConversation = conv;
  displayConversations(); // Update active state
  
  // Update header
  const user = getUser();
  const otherUser = conv.participants.find(p => p._id !== user.id);
  document.getElementById('chatHeader').classList.remove('hidden');
  document.getElementById('chatTitle').textContent = conv.listing?.title || 'Conversation';
  document.getElementById('chatSubtitle').textContent = `Chatting with ${otherUser?.name || 'User'}`;
  
  // Show input area
  document.getElementById('chatInputArea').classList.remove('hidden');
  
  // Load messages
  await loadMessages(conversationId);
  
  // Start auto-refresh every 3 seconds
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => loadMessages(conversationId), 3000);
}

async function loadMessages(conversationId) {
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.chats}/${conversationId}`);
    const data = await response.json();
    
    if (data.success) {
      currentMessages = data.messages;
      displayMessages();
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

function displayMessages() {
  const container = document.getElementById('messagesArea');
  const user = getUser();
  
  if (currentMessages.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">No messages yet. Start the conversation!</p>';
    return;
  }
  
  container.innerHTML = currentMessages.map(msg => {
    const isSent = msg.sender._id === user.id;
    return `
      <div class="message ${isSent ? 'sent' : 'received'}">
        ${!isSent ? `<strong style="font-size: 0.85rem; margin-bottom: 0.25rem; display: block;">${msg.sender.name}</strong>` : ''}
        <div>${msg.text}</div>
        <small style="font-size: 0.75rem; opacity: 0.7; display: block; margin-top: 0.25rem;">
          ${new Date(msg.createdAt).toLocaleTimeString()}
        </small>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  
  if (!text || !currentConversation) return;
  
  try {
    const response = await authenticatedFetch(
      `${API_ENDPOINTS.chats}/${currentConversation._id}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ text })
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      input.value = '';
      await loadMessages(currentConversation._id);
    }
  } catch (error) {
    alert('Error sending message: ' + error.message);
  }
}

// Clear interval when leaving page
window.addEventListener('beforeunload', () => {
  if (refreshInterval) clearInterval(refreshInterval);
});