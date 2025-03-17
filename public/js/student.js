import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Get session data
    const { idToken, userRole, tokenExpiresAt } = getSession();

    // Check if session is expired or invalid
    if (!idToken || userRole !== 'student') {
        logout();  // No token or invalid role, log out immediately
        return;
    }

    // If the token is about to expire within the next minute, try to refresh it first
    /*if (Date.now() > tokenExpiresAt - 60 * 1000) {
        console.log('Token is about to expire. Trying to refresh...');
        try {
            const refreshSuccess = await refreshTokens();
            if (refreshSuccess) {
                // Token successfully refreshed
                console.log('Token refreshed successfully');

            } else {
                console.log('Failed to refresh token');
                logout(); // Logout if refresh fails
                return;
            }
        } catch (error) {
            console.error('Error during token refresh:', error);
            logout(); // Logout on error
            return;
        }
    }*/

    // Initialize session checker to periodically check token expiration and refresh tokens if needed
    initSessionChecker();

    // Get Location Button
    const getLocationBtn = document.getElementById('getLocation');
    const coordinatesDisplay = document.getElementById('coordinates');

    // Additional Details Elements
    const editDetailsBtn = document.getElementById('editDetails');
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const saveDetailsBtn = document.getElementById('saveDetails');
    const cancelEditBtn = document.getElementById('cancelEdit');

    // Get Current Location
    getLocationBtn.addEventListener('click', function() {
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const coords = `${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`;
                    coordinatesDisplay.textContent = coords;
                    getLocationBtn.disabled = false;
                    getLocationBtn.innerHTML = 'Get Current Location';
                },
                function(error) {
                    console.error("Error getting location:", error);
                    alert("Unable to retrieve your location. Please check your settings and try again.");
                    getLocationBtn.disabled = false;
                    getLocationBtn.innerHTML = 'Get Current Location';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
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
    const mapsLink = document.querySelector('.maps-link');
    mapsLink.addEventListener('click', function(e) {
        e.preventDefault();
        const coordinates = coordinatesDisplay.textContent;
        window.open(`https://www.google.com/maps?q=${coordinates}`, '_blank');
    });

    // Add active state to navigation buttons
    const navButtons = document.querySelectorAll('.nav-menu button');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Logout button functionality
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to log out?')) {
            logout(); // Logout action
        }
    });

    // Auto-resize textarea
    const textarea = document.getElementById('commentsInput');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });


    }
});
