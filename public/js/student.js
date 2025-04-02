import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';

document.addEventListener('DOMContentLoaded', async function () {
    // Get session data
    const { idToken, userRole, tokenExpiresAt } = getSession();

    // Check if session is expired or invalid
    if (!idToken || userRole !== 'student') {
        logout(); // No token or invalid role, log out immediately
        return;
    }

    // Initialize session checker
    initSessionChecker();

    // DOM Elements
    const getLocationBtn = document.getElementById('getLocation');
    const coordinatesDisplay = document.getElementById('coordinates');
    const addressDisplay = document.getElementById('addressDisplay'); // Added for address display
    const editDetailsBtn = document.getElementById('editDetails');
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const saveDetailsBtn = document.getElementById('saveDetails');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const mapsLink = document.querySelector('.maps-link');
    const navButtons = document.querySelectorAll('.nav-menu button');
    const logoutBtn = document.querySelector('.logout-btn');
    const textarea = document.getElementById('commentsInput');

    // API Configuration
    const API_ENDPOINT = 'https://y4p26puv7l.execute-api.us-east-1.amazonaws.com/locations/locations';
    const GEOAPIFY_API_KEY = 'f6a76cacf081475897b4d70fd23f3d62'; // Your Geoapify API key

    // Function to get address from coordinates using Geoapify Reverse Geocoding API
    async function getAddressFromCoordinates(lat, lon) {
        const reverseGeocodingUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`;
        try {
            const response = await fetch(reverseGeocodingUrl);
            if (!response.ok) throw new Error('Failed to fetch address');
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                return data.features[0].properties.formatted; // Full formatted address
            } else {
                throw new Error('No address found');
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            return 'Address not found';
        }
    }

    // Get Current Location with API Integration
    getLocationBtn.addEventListener('click', async function () {
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });

            const latitude = position.coords.latitude.toFixed(6);
            const longitude = position.coords.longitude.toFixed(6);
            const coords = `${latitude},${longitude}`;
            coordinatesDisplay.textContent = coords;

            // Reverse geocode to get the address
            const address = await getAddressFromCoordinates(latitude, longitude);
            
            // Display the address
            addressDisplay.textContent = address;

            // Send location and address to your API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    id: idToken,
                    latitude: latitude,
                    longitude: longitude,
                    address: address // Include the address in the payload
                })
            });

            if (!response.ok) throw new Error('API request failed');
            
            const responseData = await response.json();
            console.log('Location and address stored successfully:', responseData);

            // Display Google Maps link
            const mapsLinkUrl = responseData.mapsLink;
            if (mapsLinkUrl) {
                mapsLink.textContent = 'View on Google Maps';
                mapsLink.href = mapsLinkUrl;
            }

        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "Unable to process location");
        } finally {
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = 'Get Current Location';
        }
    });

    // Additional Details Edit Mode Toggle
    editDetailsBtn.addEventListener('click', function () {
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');

        document.getElementById('withWhomInput').value = document.getElementById('withWhomText').textContent;
        document.getElementById('currentPlaceInput').value = document.getElementById('currentPlaceText').textContent;
        document.getElementById('commentsInput').value = document.getElementById('commentsText').textContent;
    });

    // Save Details
    saveDetailsBtn.addEventListener('click', function () {
        document.getElementById('withWhomText').textContent = document.getElementById('withWhomInput').value;
        document.getElementById('currentPlaceText').textContent = document.getElementById('currentPlaceInput').value;
        document.getElementById('commentsText').textContent = document.getElementById('commentsInput').value;

        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
    });

    // Cancel Edit
    cancelEditBtn.addEventListener('click', function () {
        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
    });

    // Copy Functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function () {
            const textToCopy = this.previousElementSibling?.textContent || '';
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        const icon = this.querySelector('i');
                        icon.className = 'fas fa-check copy-success';
                        setTimeout(() => {
                            icon.className = 'fas fa-copy';
                        }, 1000);
                    })
                    .catch(err => {
                        console.error('Failed to copy text:', err);
                        alert('Failed to copy text to clipboard');
                    });
            }
        });
    });

    // Google Maps Link
    mapsLink.addEventListener('click', function (e) {
        e.preventDefault();
        const coordinates = coordinatesDisplay.textContent;
        if (coordinates) {
            window.open(`https://www.google.com/maps?q=${coordinates}`, '_blank');
        }
    });

    // Navigation Buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Logout Button
    logoutBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to log out?')) {
            logout();
        }
    });

    // Textarea Auto-resize
    if (textarea) {
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = `${this.scrollHeight}px`;
        });
    }
});
