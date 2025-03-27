import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Get session data
    const { idToken, userRole, tokenExpiresAt } = getSession();

    // Check if session is expired or invalid
    if (!idToken || userRole !== 'faculty') {
        logout();
        return;
    }

    // Initialize session checker
    initSessionChecker();

    // Profile Picture Upload
    const profilePicInput = document.getElementById('profilePicInput');
    const profilePic = document.getElementById('profilePic');

    if (profilePicInput && profilePic) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    alert('Please select an image smaller than 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePic.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Navigation Menu Active State
    const navItems = document.querySelectorAll('.nav-item');
    const mainContent = document.querySelector('.main-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const pageType = this.textContent.trim();
            if (pageType === 'Dashboard') {
                mainContent.style.display = 'block';
            } else {
                mainContent.style.display = 'none';
            }
        });
    });

    // Create Check-in Functionality
    const createCheckinBtn = document.getElementById('createCheckinBtn');

    if (createCheckinBtn) {
        createCheckinBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showCheckinModal();
        });
    }

    function showCheckinModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Check-In (Default)</h2>
                    <button class="new-btn">New</button>
                </div>
                <form id="checkinForm">
                    <div class="form-group">
                        <label for="studentName">
                            Student Name
                            <i class="fas fa-star mandatory-toggle" data-field="studentName"></i>
                        </label>
                        <input type="text" id="studentName" placeholder="Enter the student name">
                    </div>
                    <div class="form-group">
                        <label for="location">
                            Location
                            <i class="fas fa-star mandatory-toggle" data-field="location"></i>
                        </label>
                        <div class="location-group">
                            <input type="text" id="location" readonly>
                            <button type="button" class="get-location-btn">
                                <i class="fas fa-map-marker-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="companionName">
                            Companion Name/s
                            <i class="fas fa-star mandatory-toggle" data-field="companionName"></i>
                        </label>
                        <input type="text" id="companionName" placeholder="Enter your companion">
                    </div>
                    <div class="form-group">
                        <label for="comments">
                            Comments
                            <i class="fas fa-star mandatory-toggle" data-field="comments"></i>
                        </label>
                        <textarea id="comments" placeholder="Do you have any comments?"></textarea>
                    </div>
                    <div class="modal-buttons">
                        <button type="submit">Create</button>
                        <button type="button" class="cancel">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const mandatoryFields = Array.from(modal.querySelectorAll('.mandatory-toggle.mandatory'))
                .map(toggle => toggle.getAttribute('data-field'));
            
            const formData = new FormData(this);
            const submissionData = {
                data: Object.fromEntries(formData),
                mandatoryFields: mandatoryFields
            };
            console.log('Check-in submitted:', submissionData);
            document.body.removeChild(modal);
        });
        
        const cancelBtn = modal.querySelector('.cancel');
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(modal);
        });

        const getLocationBtn = modal.querySelector('.get-location-btn');
        const locationInput = modal.querySelector('#location');
        getLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        locationInput.value = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`;
                    },
                    (error) => {
                        alert('Unable to retrieve location. Please enable location services.');
                        console.error('Geolocation error:', error);
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        });

        const newBtn = modal.querySelector('.new-btn');
        newBtn.addEventListener('click', function() {
            showNewPresetModal();
        });

        const mandatoryToggles = modal.querySelectorAll('.mandatory-toggle');
        mandatoryToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                this.classList.toggle('mandatory');
                const fieldId = this.getAttribute('data-field');
                const field = modal.querySelector(`#${fieldId}`);
                if (this.classList.contains('mandatory')) {
                    field.setAttribute('data-mandatory', 'true');
                } else {
                    field.removeAttribute('data-mandatory');
                }
            });
        });
    }

    function showNewPresetModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create a New Preset</h2>
                </div>
                <form id="presetForm">
                    <div class="form-group">
                        <label for="presetName">Preset Name</label>
                        <input type="text" id="presetName" placeholder="Enter preset name">
                    </div>
                    <div id="dynamicFields"></div>
                    <button type="button" class="add-field-btn">Add Field</button>
                    <div class="modal-buttons">
                        <button type="submit">Create</button>
                        <button type="button" class="cancel">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const presetData = {
                presetName: formData.get('presetName'),
                fields: []
            };
            
            const fieldGroups = modal.querySelectorAll('.custom-field-group');
            fieldGroups.forEach(group => {
                const label = group.querySelector('label input').value;
                const fieldType = group.getAttribute('data-field-type');
                const isMandatory = group.querySelector('.mandatory-toggle').classList.contains('mandatory');
                presetData.fields.push({
                    label: label,
                    type: fieldType,
                    mandatory: isMandatory
                });
            });
            
            console.log('Preset created:', presetData);
            document.body.removeChild(modal);
        });
        
        const cancelBtn = modal.querySelector('.cancel');
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(modal);
        });

        const addFieldBtn = modal.querySelector('.add-field-btn');
        const dynamicFields = modal.querySelector('#dynamicFields');
        let fieldCounter = 0;

        addFieldBtn.addEventListener('click', function() {
            const fieldTypeGroup = document.createElement('div');
            fieldTypeGroup.className = 'field-type-group';
            fieldTypeGroup.innerHTML = `
                <label for="fieldType${fieldCounter}">Type of Field</label>
                <select id="fieldType${fieldCounter}">
                    <option value="">Select a field type</option>
                    <option value="text">Text</option>
                    <option value="location">Location</option>
                    <option value="comments">Comments</option>
                </select>
            `;
            dynamicFields.appendChild(fieldTypeGroup);

            const fieldTypeSelect = fieldTypeGroup.querySelector('select');
            fieldTypeSelect.addEventListener('change', function() {
                const fieldType = this.value;
                if (fieldType) {
                    fieldTypeGroup.remove(); // Remove the dropdown after selection
                    addCustomField(dynamicFields, fieldType, fieldCounter);
                    fieldCounter++;
                }
            });
        });
    }

    function addCustomField(container, fieldType, fieldId) {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'custom-field-group';
        fieldGroup.setAttribute('data-field-type', fieldType);

        let fieldHTML = '';
        if (fieldType === 'text') {
            fieldHTML = `
                <input type="text" id="field${fieldId}" name="field${fieldId}" placeholder="Enter text">
            `;
        } else if (fieldType === 'location') {
            fieldHTML = `
                <div class="location-group">
                    <input type="text" id="field${fieldId}" name="field${fieldId}" readonly placeholder="Pick a location">
                    <button type="button" class="get-location-btn">
                        <i class="fas fa-map-marker-alt"></i>
                    </button>
                </div>
            `;
        } else if (fieldType === 'comments') {
            fieldHTML = `
                <textarea id="field${fieldId}" name="field${fieldId}" placeholder="Enter your comments"></textarea>
            `;
        }

        fieldGroup.innerHTML = `
            <label>
                <input type="text" value="New Field" class="field-label">
                <i class="fas fa-star mandatory-toggle" data-field="field${fieldId}"></i>
            </label>
            ${fieldHTML}
        `;

        container.appendChild(fieldGroup);

        // Add mandatory toggle functionality
        const mandatoryToggle = fieldGroup.querySelector('.mandatory-toggle');
        mandatoryToggle.addEventListener('click', function() {
            this.classList.toggle('mandatory');
            const fieldId = this.getAttribute('data-field');
            const field = fieldGroup.querySelector(`#${fieldId}`);
            if (this.classList.contains('mandatory')) {
                field.setAttribute('data-mandatory', 'true');
            } else {
                field.removeAttribute('data-mandatory');
            }
        });

        // Add location picker functionality if the field is a location
        if (fieldType === 'location') {
            const getLocationBtn = fieldGroup.querySelector('.get-location-btn');
            const locationInput = fieldGroup.querySelector(`#field${fieldId}`);
            getLocationBtn.addEventListener('click', function() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            locationInput.value = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`;
                        },
                        (error) => {
                            alert('Unable to retrieve location. Please enable location services.');
                            console.error('Geolocation error:', error);
                        }
                    );
                } else {
                    alert('Geolocation is not supported by your browser.');
                }
            });
        }
    }

    // Logout Button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to log out?')) {
                logout();
            }
        });
    }

    // Course Card Click Handler
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', function() {
            const courseCode = this.querySelector('h3').textContent;
            loadCourseDetails(courseCode);
        });
    });

    // Table Row Hover Effect
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'var(--gray-100)';
        });
        row.addEventListener('mouseout', function() {
            this.style.backgroundColor = '';
        });
    });

    function loadCourseDetails(courseCode) {
        const assignmentsSection = document.querySelector('.assignments-section');
        if (assignmentsSection) {
            const sectionTitle = assignmentsSection.querySelector('h2');
            sectionTitle.textContent = `Current Assignments: ${courseCode}`;
            console.log(`Loading details for ${courseCode}`);
        }
    }

    function checkNotifications() {
        const messagePanel = document.querySelector('.notification-panel:first-child .panel-content');
        const requestPanel = document.querySelector('.notification-panel:last-child .panel-content');
        console.log('Checking for new notifications...');
    }

    setInterval(checkNotifications, 300000);
});