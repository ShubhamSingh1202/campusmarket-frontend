// frontend/js/browse.js

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  loadFiltersFromURL();
  loadListings();
});

// Load filters from URL parameters
function loadFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('search')) {
    document.getElementById('searchInput').value = urlParams.get('search');
  }
  if (urlParams.has('category')) {
    document.getElementById('categoryFilter').value = urlParams.get('category');
  }
  if (urlParams.has('minPrice')) {
    document.getElementById('minPrice').value = urlParams.get('minPrice');
  }
  if (urlParams.has('maxPrice')) {
    document.getElementById('maxPrice').value = urlParams.get('maxPrice');
  }
}

// Apply filters
function applyFilters() {
  loadListings();
}

// Load listings with filters
async function loadListings() {
  const container = document.getElementById('listingsGrid');
  container.innerHTML = '<div class="loading">Loading listings...</div>';
  
  // Build query params
  const params = new URLSearchParams();
  
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  const minPrice = document.getElementById('minPrice').value;
  const maxPrice = document.getElementById('maxPrice').value;
  
  if (search) params.append('search', search);
  if (category && category !== 'All') params.append('category', category);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);
  params.append('status', 'available');
  
  try {
    const response = await fetch(`${API_ENDPOINTS.listings}?${params}`);
    const data = await response.json();
    
    if (data.success && data.listings.length > 0) {
      container.innerHTML = data.listings.map(listing => createListingCard(listing)).join('');
    } else {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
          <h3>No listings found</h3>
          <p>Try adjusting your filters or be the first to sell something!</p>
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = '<p class="error-message text-center">Error loading listings</p>';
  }
}

function createListingCard(listing) {
  return `
    <div class="card" onclick="window.location.href='listing.html?id=${listing._id}'">
      <img src="${listing.imageUrl}" alt="${listing.title}" class="card-img" 
           onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
      <div class="card-body">
        <h3 class="card-title">${listing.title}</h3>
        <div class="card-price">₹${listing.price}</div>
        <div class="card-meta">
          <span class="badge badge-primary">${listing.category}</span>
          <span class="badge badge-success">${listing.condition}</span>
        </div>
        <p class="card-text">${listing.description.substring(0, 100)}...</p>
        <small style="color: var(--text-muted);">
          ${listing.seller?.name || 'Student'} • ${listing.seller?.year || ''}
        </small>
      </div>
    </div>
  `;
}