// frontend/js/main.js
// Home page functionality

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  loadLatestListings();
});

// Search from home page
function searchFromHome() {
  const search = document.getElementById('homeSearch').value;
  const category = document.getElementById('homeCategory').value;
  
  let url = 'browse.html?';
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (category !== 'All') url += `category=${encodeURIComponent(category)}`;
  
  window.location.href = url;
}

// Load latest listings for home page
async function loadLatestListings() {
  const container = document.getElementById('latestListings');
  
  try {
    const response = await fetch(`${API_ENDPOINTS.listings}?status=available`);
    const data = await response.json();
    
    if (data.success && data.listings.length > 0) {
      // Show only first 8 items
      const listings = data.listings.slice(0, 8);
      container.innerHTML = listings.map(listing => createListingCard(listing)).join('');
    } else {
      container.innerHTML = '<p class="text-center">No listings yet. Be the first to sell!</p>';
    }
  } catch (error) {
    container.innerHTML = '<p class="error-message text-center">Error loading listings</p>';
  }
}

// Create listing card HTML
function createListingCard(listing) {
  const sellerYear = listing.seller?.year || 'Student';
  return `
    <div class="card" onclick="window.location.href='listing.html?id=${listing._id}'">
      <img src="${listing.imageUrl}" alt="${listing.title}" class="card-img">
      <div class="card-body">
        <h3 class="card-title">${listing.title}</h3>
        <div class="card-price">₹${listing.price}</div>
        <div class="card-meta">
          <span class="badge badge-primary">${listing.category}</span>
          <span class="badge badge-success">${listing.condition}</span>
        </div>
        <p class="card-text">${listing.description.substring(0, 80)}...</p>
        <small class="text-muted">Sold by ${sellerYear}</small>
      </div>
    </div>
  `;
}