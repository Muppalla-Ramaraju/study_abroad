document.addEventListener('DOMContentLoaded', function () {
    // Session validation
    const idToken = localStorage.getItem('idToken');
    const userRole = localStorage.getItem('userRole');
    if (!idToken || userRole !== 'faculty') {
        alert('You are not logged in or not authorized to access this page.');
        window.location.href = 'login.html';
        return;
    }

    // Profile Picture Upload
    const profilePicInput = document.getElementById('profilePicInput');
    const profilePic = document.getElementById('profilePic');

    if (profilePicInput && profilePic) {
        profilePicInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }

                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Please select an image smaller than 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
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
        item.addEventListener('click', function () {
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
    const presetCheckin = document.getElementById('presetCheckin');
    const customCheckin = document.getElementById('customCheckin');

    if (presetCheckin) {
        presetCheckin.addEventListener('click', function (e) {
            e.preventDefault();
            showCheckinModal('preset');
        });
    }

    if (customCheckin) {
        customCheckin.addEventListener('click', function (e) {
            e.preventDefault();
            showCheckinModal('custom');
        });
    }

    function showCheckinModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';

        let formContent = '';
        if (type === 'preset') {
            formContent = `
                <select name="preset" required>
                    <option value="">Select a Preset</option>
                    <option value="office">Office Hours</option>
                    <option value="research">Research Meeting</option>
                    <option value="thesis">Thesis Defense</option>
                </select>
            `;
        }

        modal.innerHTML = `
            <div class="modal-content">
                <h2>${type === 'preset' ? 'Select Preset Check-in' : 'Create New Check-in'}</h2>
                <form id="checkinForm">
                    ${formContent}
                    <input type="text" placeholder="Student Name" required>
                    <input type="text" placeholder="Location" required>
                    <input type="text" placeholder="Companion Name">
                    <textarea placeholder="Comments"></textarea>
                    <div class="modal-buttons">
                        <button type="submit">Create</button>
                        <button type="button" class="cancel">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Add your form submission logic here (e.g., API call)
            console.log('Check-in submitted:', new FormData(this));
            document.body.removeChild(modal);
        });

        const cancelBtn = modal.querySelector('.cancel');
        cancelBtn.addEventListener('click', function () {
            document.body.removeChild(modal);
        });
    }

    // Course Card Click Handler
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', function () {
            const courseCode = this.querySelector('h3').textContent;
            loadCourseDetails(courseCode);
        });
    });

    // Table Row Hover Effect
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseover', function () {
            this.style.backgroundColor = 'var(--gray-100)';
        });
        row.addEventListener('mouseout', function () {
            this.style.backgroundColor = '';
        });
    });

    // Helper Functions
    function loadCourseDetails(courseCode) {
        const assignmentsSection = document.querySelector('.assignments-section');
        if (assignmentsSection) {
            const sectionTitle = assignmentsSection.querySelector('h2');
            sectionTitle.textContent = `Current Assignments: ${courseCode}`;
            console.log(`Loading details for ${courseCode}`);
        }
    }

    // Optional: Add automatic notifications check
    function checkNotifications() {
        const messagePanel = document.querySelector('.notification-panel:first-child .panel-content');
        const requestPanel = document.querySelector('.notification-panel:last-child .panel-content');
        console.log('Checking for new notifications...');
        // Add API call here if needed
    }

    // Check for notifications every 5 minutes
    setInterval(checkNotifications, 300000);

    // Logout Button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to log out?')) {
                // Clear session
                localStorage.removeItem('idToken');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userRole');
                // Redirect to login page
                window.location.href = 'login.html'; // Updated to match your file structure
            }
        });
    }

    // Token refresh function
    async function refreshTokens() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;

        try {
            const response = await fetch('https://fgwxjjo7j9.execute-api.us-east-1.amazonaws.com/test/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken, action: 'refresh' })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('idToken', data.idToken);
                localStorage.setItem('accessToken', data.accessToken);
                return true;
            }
            throw new Error('Token refresh failed');
        } catch (error) {
            console.error('Refresh error:', error);
            localStorage.clear();
            window.location.href = 'login.html';
            return false;
        }
    }

    // Periodically check token expiration and refresh if needed
    setInterval(() => {
        const tokenExpiresIn = localStorage.getItem('tokenExpiresIn');
        if (tokenExpiresIn && parseInt(tokenExpiresIn) < Date.now() / 1000 + 60) { // Refresh 1 minute before expiration
            refreshTokens();
        }
    }, 5 * 60 * 1000); // Check every 5 minutes
});

// Add CSS for modal
const modalStyles = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        width: 90%;
        max-width: 500px;
    }

    .modal-content h2 {
        margin-bottom: 1.5rem;
        color: var(--gray-700);
    }

    .modal-content form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .modal-content input,
    .modal-content select,
    .modal-content textarea {
        padding: 0.75rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.25rem;
        font-size: 1rem;
    }

    .modal-content textarea {
        min-height: 100px;
        resize: vertical;
    }

    .modal-buttons {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1rem;
    }

    .modal-buttons button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 1rem;
    }

    .modal-buttons button[type="submit"] {
        background-color: var(--tamu-maroon);
        color: white;
    }

    .modal-buttons button.cancel {
        background-color: var(--gray-300);
        color: var(--gray-700);
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);
