// frontend/js/sell.js

let editMode = false;
let editListingId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!protectPage()) return;
  updateNavbar();
  checkEditMode();
  setupImagePreview();
});

// Check if editing existing listing
async function checkEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
  
  if (listingId) {
    editMode = true;
    editListingId = listingId;
    document.getElementById('formTitle').textContent = 'Edit Listing';
    document.getElementById('submitBtnText').textContent = 'Update Listing';
    await loadListingData(listingId);
  }
}

async function loadListingData(listingId) {
  try {
    const response = await fetch(`${API_ENDPOINTS.listings}/${listingId}`);
    const data = await response.json();
    
    if (data.success) {
      const listing = data.listing;
      
      // Check if user is owner
      const user = getUser();
      if (listing.seller._id !== user.id) {
        alert('You can only edit your own listings');
        window.location.href = 'dashboard.html';
        return;
      }
      
      // Fill form
      document.getElementById('title').value = listing.title;
      document.getElementById('description').value = listing.description;
      document.getElementById('category').value = listing.category;
      document.getElementById('condition').value = listing.condition;
      document.getElementById('price').value = listing.price;
      document.getElementById('imageUrl').value = listing.imageUrl;
      
      // Show preview
      showImagePreview(listing.imageUrl);
    }
  } catch (error) {
    alert('Error loading listing: ' + error.message);
  }
}

function setupImagePreview() {
  const imageUrlInput = document.getElementById('imageUrl');
  imageUrlInput.addEventListener('blur', () => {
    const url = imageUrlInput.value;
    if (url) {
      showImagePreview(url);
    }
  });
}

function showImagePreview(url) {
  const preview = document.getElementById('imagePreview');
  const img = document.getElementById('previewImg');
  
  img.src = url;
  img.onerror = () => {
    preview.classList.add('hidden');
  };
  img.onload = () => {
    preview.classList.remove('hidden');
  };
}

document.getElementById('listingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    category: document.getElementById('category').value,
    condition: document.getElementById('condition').value,
    price: document.getElementById('price').value,
    imageUrl: document.getElementById('imageUrl').value
  };
  
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');
  
  try {
    let response;
    
    if (editMode) {
      response = await authenticatedFetch(`${API_ENDPOINTS.listings}/${editListingId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
    } else {
      response = await authenticatedFetch(API_ENDPOINTS.listings, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    }
    
    const data = await response.json();
    
    if (data.success) {
      successDiv.textContent = editMode ? 'Listing updated successfully!' : 'Listing created successfully!';
      successDiv.classList.remove('hidden');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      errorDiv.textContent = data.message || 'Failed to save listing';
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    errorDiv.textContent = 'Error: ' + error.message;
    errorDiv.classList.remove('hidden');
  }
});