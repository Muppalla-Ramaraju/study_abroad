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
    const addressDisplay = document.getElementById('addressDisplay');
    const withWhomInput = document.getElementById('withWhomInput');
    const currentPlaceInput = document.getElementById('currentPlaceInput');
    const commentsInput = document.getElementById('commentsInput');
    const checkInBtn = document.getElementById('checkInBtn');
    const mapsLink = document.getElementById('mapsLink');
    const navButtons = document.querySelectorAll('.nav-menu button');
    const logoutBtn = document.querySelector('.logout-btn');
    const sosButton = document.getElementById('sosButton');
    const emergencyForm = document.getElementById('emergencyForm');
    const emergencyDetails = document.getElementById('emergencyDetails');
    const submitEmergencyDetails = document.getElementById('submitEmergencyDetails');
    const skipEmergencyDetails = document.getElementById('skipEmergencyDetails');

    // API Configuration
    const API_ENDPOINT = 'https://y4p26puv7l.execute-api.us-east-1.amazonaws.com/locations/locations';
    const GEOAPIFY_API_KEY = 'f6a76cacf081475897b4d70fd23f3d62';

    // Get user name from local storage
    const userName = localStorage.getItem('name');

    // Track location data
    let currentLocation = {
        latitude: null,
        longitude: null,
        address: null
    };

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

    // Function to get current position
    async function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    // Function to send check-in data
    async function sendCheckInData(isEmergency = false, emergencyMessage = '') {
        if (!currentLocation.latitude || !currentLocation.longitude) {
            alert('Please get your current location first.');
            return false;
        }

        try {
            const payload = {
                id: idToken,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                address: currentLocation.address,
                name: userName,
                peers: withWhomInput.value,
                place: currentPlaceInput.value,
                comments: commentsInput.value,
                emergency: isEmergency,
                emergencyDetails: emergencyMessage
            };

            console.log('Payload being sent to API:', payload);

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('API request failed');

            const responseData = await response.json();
            console.log('Check-in data sent successfully:', responseData);

            // Update maps link if provided
            if (responseData.mapsLink) {
                mapsLink.textContent = 'View on Google Maps';
                mapsLink.href = responseData.mapsLink;
                mapsLink.classList.remove('hidden');
            }

            return true;
        } catch (error) {
            console.error("Error sending check-in data:", error);
            alert(error.message || "Unable to process check-in");
            return false;
        }
    }

    // Get Current Location with API Integration
    getLocationBtn.addEventListener('click', async function () {
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';

        try {
            const position = await getCurrentPosition();

            const latitude = position.coords.latitude.toFixed(6);
            const longitude = position.coords.longitude.toFixed(6);
            const coords = `${latitude},${longitude}`;
            
            // Update display
            coordinatesDisplay.textContent = coords;

            // Reverse geocode to get the address
            const address = await getAddressFromCoordinates(latitude, longitude);
            addressDisplay.textContent = address;

            // Store location data for later use
            currentLocation = {
                latitude,
                longitude,
                address
            };

            // Update Google Maps link
            mapsLink.href = `https://www.google.com/maps?q=${coords}`;
            mapsLink.classList.remove('hidden');

        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "Unable to get location");
        } finally {
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = 'Get Current Location';
        }
    });

    // Check-In Button
    checkInBtn.addEventListener('click', async function() {
        this.disabled = true;
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const success = await sendCheckInData();
            if (success) {
                alert('Check-in successful!');
                
                // Clear form inputs
                commentsInput.value = '';
                withWhomInput.value = 'None';
                currentPlaceInput.value = '';
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            this.disabled = false;
            this.innerHTML = originalText;
        }
    });

    // SOS Button Functionality
    sosButton.addEventListener('click', async function () {
        this.disabled = true;
        const originalText = this.textContent;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            // If we don't have location yet, get it first
            if (!currentLocation.latitude || !currentLocation.longitude) {
                const position = await getCurrentPosition();
                
                const latitude = position.coords.latitude.toFixed(6);
                const longitude = position.coords.longitude.toFixed(6);
                const coords = `${latitude},${longitude}`;
                
                // Update display
                coordinatesDisplay.textContent = coords;

                // Reverse geocode to get the address
                const address = await getAddressFromCoordinates(latitude, longitude);
                addressDisplay.textContent = address;

                // Store location data
                currentLocation = {
                    latitude,
                    longitude,
                    address
                };

                // Update Google Maps link
                mapsLink.href = `https://www.google.com/maps?q=${coords}`;
                mapsLink.classList.remove('hidden');
            }

            // Show emergency form to collect details
            emergencyForm.classList.remove('hidden');

        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "Unable to send emergency signal");
        } finally {
            this.disabled = false;
            this.textContent = originalText;
        }
    });

    // Emergency form event listeners
    submitEmergencyDetails.addEventListener('click', async function () {
        const detailsText = emergencyDetails.value;
        emergencyForm.classList.add('hidden');
        
        const success = await sendCheckInData(true, detailsText);
        if (success) {
            alert('Emergency signal sent successfully with details.');
        }
    });

    skipEmergencyDetails.addEventListener('click', async function () {
        emergencyForm.classList.add('hidden');
        
        const success = await sendCheckInData(true, '');
        if (success) {
            alert('Emergency signal sent successfully.');
        }
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
    if (commentsInput) {
        commentsInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = `${this.scrollHeight}px`;
        });
    }

    if (emergencyDetails) {
        emergencyDetails.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = `${this.scrollHeight}px`;
        });
    }

    // Populate student dropdown
    async function populateStudentDropdown() {
        const apiUrl = "https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/students";

        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch student data");
            }
            const students = await response.json();

            // Keep the "None" option
            const noneOption = withWhomInput.querySelector('option[value="None"]');
            withWhomInput.innerHTML = "";
            withWhomInput.appendChild(noneOption);
            
            // Add student options
            students.forEach(student => {
                const option = document.createElement("option");
                option.value = student.name;
                option.textContent = student.name;
                withWhomInput.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading students:", error);
        }
    }

    // Initialize data
    populateStudentDropdown();
});