// frontend/js/listing.js

let currentListing = null;

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  loadListing();
});

async function loadListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
  
  if (!listingId) {
    document.getElementById('listingContainer').innerHTML = 
      '<p class="error-message">Invalid listing ID</p>';
    return;
  }
  
  try {
    const response = await fetch(`${API_ENDPOINTS.listings}/${listingId}`);
    const data = await response.json();
    
    if (data.success) {
      currentListing = data.listing;
      displayListing(data.listing);
    } else {
      document.getElementById('listingContainer').innerHTML = 
        '<p class="error-message">Listing not found</p>';
    }
  } catch (error) {
    document.getElementById('listingContainer').innerHTML = 
      '<p class="error-message">Error loading listing</p>';
  }
}

function displayListing(listing) {
  const user = getUser();
  const isOwner = user && user.id === listing.seller._id;
  const isSold = listing.status === 'sold';
  
  document.getElementById('listingContainer').innerHTML = `
    <div class="listing-detail">
      <div class="listing-image">
        <img src="${listing.imageUrl}" alt="${listing.title}"
             onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
      </div>
      
      <div class="listing-info">
        <h1>${listing.title}</h1>
        <div class="card-price" style="font-size: 2rem; margin: 1rem 0;">₹${listing.price}</div>
        
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <span class="badge badge-primary">${listing.category}</span>
          <span class="badge badge-success">${listing.condition}</span>
          ${isSold ? '<span class="badge badge-danger">SOLD</span>' : '<span class="badge badge-success">AVAILABLE</span>'}
        </div>
        
        <h3>Description</h3>
        <p style="margin-bottom: 1.5rem;">${listing.description}</p>
        
        <h3>Seller Information</h3>
        <p><strong>Name:</strong> ${listing.seller.name}</p>
        <p><strong>Department:</strong> ${listing.seller.department}</p>
        <p><strong>Year:</strong> ${listing.seller.year}</p>
        ${listing.seller.email ? `<p><strong>Email:</strong> ${listing.seller.email}</p>` : ''}
        
        <p style="color: var(--text-muted); margin-top: 1rem;">
          Posted on ${new Date(listing.createdAt).toLocaleDateString()}
        </p>
        
        ${!isSold ? `
          <div class="listing-actions">
            ${!isOwner && user ? `
              <button class="btn-primary" onclick="requestToBuy()">Request to Buy</button>
              <button class="btn-secondary" onclick="startChat()">Chat with Seller</button>
            ` : ''}
            ${!user ? `
              <a href="login.html" class="btn-primary">Login to Buy</a>
            ` : ''}
            ${isOwner ? `
              <a href="sell.html?id=${listing._id}" class="btn-secondary">Edit Listing</a>
              <button class="btn-danger" onclick="deleteListing()">Delete</button>
            ` : ''}
          </div>
        ` : '<p class="error-message">This item has been sold.</p>'}
      </div>
    </div>
  `;
}

async function requestToBuy() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  if (!confirm('Send a buy request to the seller?')) return;
  
  try {
    const response = await authenticatedFetch(API_ENDPOINTS.orders, {
      method: 'POST',
      body: JSON.stringify({ listingId: currentListing._id })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Request sent successfully! Check your dashboard for updates.');
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message || 'Failed to send request');
    }
  } catch (error) {
    alert('Error sending request: ' + error.message);
  }
}

async function startChat() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.chats}/start`, {
      method: 'POST',
      body: JSON.stringify({
        listingId: currentListing._id,
        recipientId: currentListing.seller._id
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      window.location.href = `chat.html?id=${data.conversation._id}`;
    } else {
      alert('Failed to start chat');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function deleteListing() {
  if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
  
  try {
    const response = await authenticatedFetch(`${API_ENDPOINTS.listings}/${currentListing._id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Listing deleted successfully');
      window.location.href = 'dashboard.html';
    } else {
      alert('Failed to delete listing');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}