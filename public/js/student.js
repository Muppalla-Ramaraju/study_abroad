import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Get session data
    const { idToken, userRole, tokenExpiresAt } = getSession();

    // Check if session is expired or invalid
    if (!idToken || userRole !== 'student') {
        logout();  // No token or invalid role, log out immediately
        return;
    }

    // Initialize session checker
    initSessionChecker();

    // DOM Elements
    const getLocationBtn = document.getElementById('getLocation');
    const coordinatesDisplay = document.getElementById('coordinates');
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

    // Get Current Location with API Integration
    getLocationBtn.addEventListener('click', async function() {
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

            const coords = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
            coordinatesDisplay.textContent = coords;

            // Send to API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    id: idToken, // Using idToken as unique identifier
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            console.log('Location stored successfully');

        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "Unable to process location");
        } finally {
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = 'Get Current Location';
        }
    });

    // Additional Details Edit Mode Toggle
    editDetailsBtn.addEventListener('click', function() {
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
        
        document.getElementById('withWhomInput').value = document.getElementById('withWhomText').textContent;
        document.getElementById('currentPlaceInput').value = document.getElementById('currentPlaceText').textContent;
        document.getElementById('commentsInput').value = document.getElementById('commentsText').textContent;
    });

    // Save Details
    saveDetailsBtn.addEventListener('click', function() {
        document.getElementById('withWhomText').textContent = document.getElementById('withWhomInput').value;
        document.getElementById('currentPlaceText').textContent = document.getElementById('currentPlaceInput').value;
        document.getElementById('commentsText').textContent = document.getElementById('commentsInput').value;

        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
    });

    // Cancel Edit
    cancelEditBtn.addEventListener('click', function() {
        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
    });

    // Copy Functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
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
    mapsLink.addEventListener('click', function(e) {
        e.preventDefault();
        const coordinates = coordinatesDisplay.textContent;
        if (coordinates) {
            window.open(`https://www.google.com/maps?q=${coordinates}`, '_blank');
        }
    });

    // Navigation Buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Logout Button
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to log out?')) {
            logout();
        }
    });

    // Textarea Auto-resize
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = `${this.scrollHeight}px`;
        });
    }
});
