import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';

document.addEventListener('DOMContentLoaded', async function () {
    // Get session data
    const { idToken, userRole, tokenExpiresAt, name } = getSession();

    // Check if session is expired or invalid
    if (!idToken || userRole !== 'student') {
        logout(); // No token or invalid role, log out immediately
        return;
    }

    // Initialize session checker
    initSessionChecker();

    
    // DOM Elements
    let getLocationBtn = document.getElementById('getLocation');
    let coordinatesDisplay = document.getElementById('coordinates');
    let addressDisplay = document.getElementById('addressDisplay');
    let withWhomInput = document.getElementById('withWhomInput');
    let currentPlaceInput = document.getElementById('currentPlaceInput');
    let commentsInput = document.getElementById('commentsInput');
    let checkInBtn = document.getElementById('checkInBtn');
    let mapsLink = document.getElementById('mapsLink');
    const navButtons = document.querySelectorAll('.nav-menu button');
    const logoutBtn = document.querySelector('.logout-btn');
    let sosButton = document.getElementById('sosButton');
    let emergencyForm = document.getElementById('emergencyForm');
    let emergencyDetails = document.getElementById('emergencyDetails');
    let submitEmergencyDetails = document.getElementById('submitEmergencyDetails');
    let skipEmergencyDetails = document.getElementById('skipEmergencyDetails');

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

    // Create a template for dashboard content
    const dashboardTemplate = document.querySelector('.main-content').cloneNode(true);
    let currentPage = 'dashboard'; // Track current page

    // Function to get address from coordinates using Geoapify Reverse Geocoding API
    async function getAddressFromCoordinates(lat, lon) {
        const reverseGeocodingUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`;
        try {
            const response = await fetch(reverseGeocodingUrl);
            if (!response.ok) throw new Error('Failed to fetch address');
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                return data.features[0].properties.formatted;
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
                timeout: 10000,
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
            const selectedPeers = Array.from(withWhomInput.selectedOptions)
                .map(option => option.value)
                .filter(value => value !== "None")
                .join(", ");

            const payload = {
                id: idToken,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                address: currentLocation.address,
                name: userName,
                peers: selectedPeers || 'None',
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

    // Initialize event listeners
    function initializeEventListeners() {
        getLocationBtn.addEventListener('click', async function () {
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';

            try {
                const position = await getCurrentPosition();

                const latitude = position.coords.latitude.toFixed(6);
                const longitude = position.coords.longitude.toFixed(6);
                const coords = `${latitude},${longitude}`;
                
                coordinatesDisplay.textContent = coords;

                const address = await getAddressFromCoordinates(latitude, longitude);
                addressDisplay.textContent = address;

                currentLocation = {
                    latitude,
                    longitude,
                    address
                };

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

        checkInBtn.addEventListener('click', async function() {
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            try {
                const success = await sendCheckInData();
                if (success) {
                    alert('Check-in successful!');
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

        sosButton.addEventListener('click', async function () {
            this.disabled = true;
            const originalText = this.textContent;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            try {
                if (!currentLocation.latitude || !currentLocation.longitude) {
                    const position = await getCurrentPosition();
                    
                    const latitude = position.coords.latitude.toFixed(6);
                    const longitude = position.coords.longitude.toFixed(6);
                    const coords = `${latitude},${longitude}`;
                    
                    coordinatesDisplay.textContent = coords;

                    const address = await getAddressFromCoordinates(latitude, longitude);
                    addressDisplay.textContent = address;

                    currentLocation = {
                        latitude,
                        longitude,
                        address
                    };

                    mapsLink.href = `https://www.google.com/maps?q=${coords}`;
                    mapsLink.classList.remove('hidden');
                }

                emergencyForm.classList.remove('hidden');

            } catch (error) {
                console.error("Error:", error);
                alert(error.message || "Unable to send emergency signal");
            } finally {
                this.disabled = false;
                this.textContent = originalText;
            }
        });

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

        mapsLink.addEventListener('click', function (e) {
            e.preventDefault();
            const coordinates = coordinatesDisplay.textContent;
            if (coordinates) {
                window.open(`https://www.google.com/maps?q=${coordinates}`, '_blank');
            }
        });

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
    }

    // Populate student dropdown
    async function populateStudentDropdown() {
        const currentUserName = localStorage.getItem('name');
        if (!currentUserName) {
            console.error("User name not found in session");
            return;
        }
    
        const apiUrl = "https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/classes/studentsinsideclass";
    
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: currentUserName
                })
            });
            
            if (!response.ok) {
                throw new Error("Failed to fetch student data");
            }
            
            const students = await response.json();
    
            withWhomInput.innerHTML = ""; // Clear existing options
            withWhomInput.setAttribute('multiple', 'true');
            withWhomInput.size = Math.min(5, students.length + 1);
            
            const noneOption = document.createElement("option");
            noneOption.value = "None";
            noneOption.textContent = "None";
            withWhomInput.appendChild(noneOption);
            
            students.forEach(student => {
                if (student.name !== currentUserName) {
                    const option = document.createElement("option");
                    option.value = student.name;
                    option.textContent = student.name;
                    withWhomInput.appendChild(option);
                }
            });
    
            const helperText = document.querySelector('.helper-text') || document.createElement("p");
            helperText.textContent = "Hold Ctrl/Cmd to select multiple students";
            helperText.className = "helper-text";
            if (!document.querySelector('.helper-text')) {
                withWhomInput.parentNode.appendChild(helperText);
            }
            
        } catch (error) {
            console.error("Error loading students:", error);
        }
    }

    // Navigation Buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function () {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const page = this.getAttribute('data-page');
            const mainContent = document.querySelector('.main-content');

            if (page !== currentPage) {
                // Save current state before switching
                const currentState = {
                    currentPlace: currentPlaceInput.value,
                    comments: commentsInput.value,
                    selectedPeers: Array.from(withWhomInput.selectedOptions).map(option => option.value),
                    coordinates: coordinatesDisplay.textContent,
                    address: addressDisplay.textContent,
                    locationFetched: currentLocation.latitude && currentLocation.longitude
                };

                if (page === 'profile') {
                    mainContent.innerHTML = '<h1>Profile Page</h1><p>This is the profile section.</p>';
                } else if (page === 'help') {
                    mainContent.innerHTML = '<h1>Help Page</h1><p>This is the help section.</p>';
                } else if (page === 'dashboard') {
                    // Restore dashboard content
                    mainContent.innerHTML = dashboardTemplate.innerHTML;

                    // Reinitialize DOM elements
                    getLocationBtn = document.getElementById('getLocation');
                    coordinatesDisplay = document.getElementById('coordinates');
                    addressDisplay = document.getElementById('addressDisplay');
                    withWhomInput = document.getElementById('withWhomInput');
                    currentPlaceInput = document.getElementById('currentPlaceInput');
                    commentsInput = document.getElementById('commentsInput');
                    checkInBtn = document.getElementById('checkInBtn');
                    mapsLink = document.getElementById('mapsLink');
                    sosButton = document.getElementById('sosButton');
                    emergencyForm = document.getElementById('emergencyForm');
                    emergencyDetails = document.getElementById('emergencyDetails');
                    submitEmergencyDetails = document.getElementById('submitEmergencyDetails');
                    skipEmergencyDetails = document.getElementById('skipEmergencyDetails');

                    // Restore state
                    currentPlaceInput.value = currentState.currentPlace;
                    commentsInput.value = currentState.comments;
                    coordinatesDisplay.textContent = currentState.coordinates;
                    addressDisplay.textContent = currentState.address;
                    if (currentState.locationFetched) {
                        currentLocation = {
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                            address: currentState.address
                        };
                        mapsLink.href = `https://www.google.com/maps?q=${currentState.coordinates}`;
                        mapsLink.classList.remove('hidden');
                    }

                    // Restore selected peers
                    withWhomInput.innerHTML = ""; // Clear to avoid duplicates
                    const noneOption = document.createElement("option");
                    noneOption.value = "None";
                    noneOption.textContent = "None";
                    withWhomInput.appendChild(noneOption);
                    populateStudentDropdown().then(() => {
                        currentState.selectedPeers.forEach(peer => {
                            const options = withWhomInput.options;
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].value === peer) {
                                    options[i].selected = true;
                                    break;
                                }
                            }
                        });
                    });

                    initializeEventListeners();
                }
                currentPage = page;
            }
        });
    });

    // Initialize data and set default active page
    initializeEventListeners();
    populateStudentDropdown();
    document.querySelector('[data-page="dashboard"]').classList.add('active');

    logoutBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to log out?')) {
            logout();
        }
    });
});