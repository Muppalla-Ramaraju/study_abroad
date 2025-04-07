import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';

document.addEventListener('DOMContentLoaded', async function () {
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
        profilePicInput.addEventListener('change', function (e) {
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

    if (createCheckinBtn) {
        createCheckinBtn.addEventListener('click', function (e) {
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
                    <h2>Please Enter Your Message</h2>
                </div>
                <form id="messageForm">
                    <div class="form-group">
                        <textarea id="announcement" name="announcement" placeholder="Enter your announcement for students" maxlength="1000"></textarea>
                    </div>
                    <div class="modal-buttons">
                        <button type="submit">Post</button>
                        <button type="button" class="cancel">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('#messageForm');
        const textarea = modal.querySelector('#announcement');

        // Ensure Enter key creates a new line and does not submit
        form.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && e.target === textarea && !e.shiftKey) {
                e.stopPropagation(); // Prevent any parent handlers
            }
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            const announcement = formData.get('announcement');
            console.log('Announcement posted:', announcement);
            document.body.removeChild(modal);
        });

        const cancelBtn = modal.querySelector('.cancel');
        cancelBtn.addEventListener('click', function () {
            document.body.removeChild(modal);
        });

        // Focus the textarea immediately
        textarea.focus();
    }

    // Logout Button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to log out?')) {
                logout();
            }
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

    function loadCourseDetails(courseCode) {
        const assignmentsSection = document.querySelector('.assignments-section');
        if (assignmentsSection) {
            const sectionTitle = assignmentsSection.querySelector('h2');
            sectionTitle.textContent = `Current Assignments: ${courseCode}`;
            console.log(`Loading details for ${courseCode}`);
        }
    }

    function checkNotifications() {
        console.log('Checking for new notifications...');
    }

    setInterval(checkNotifications, 300000);

    // Fetch and Display Student Details in a Table
    const getStudentDetailsBtn = document.getElementById('getStudentDetailsBtn');
    const studentDetailsContainer = document.getElementById('studentDetailsContainer');

    if (getStudentDetailsBtn && studentDetailsContainer) {
        getStudentDetailsBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(
                    'https://s4rruk7vn6.execute-api.us-east-1.amazonaws.com/prod/LocationFaculty'
                );
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const studentDetails = await response.json();
                displayStudentDetails(studentDetails);
            } catch (error) {
                console.error(error);
                studentDetailsContainer.innerHTML =
                    '<p>Error fetching student details. Please try again later.</p>';
            }
        });
    }

    function displayStudentDetails(details) {
        studentDetailsContainer.innerHTML =
            '<table class="student-details-table"><thead><tr><th>Name</th><th>Address</th><th>Date</th><th>Time</th><th>Latitude</th><th>Longitude</th><th>Maps Link</th></tr></thead><tbody>' +
            details
                .map(
                    student =>
                        `<tr><td>${student.name}</td><td>${student.address}</td><td>${student.date}</td><td>${student.time}</td><td>${student.latitude.toFixed(
                            6
                        )}</td><td>${student.longitude.toFixed(
                            6
                        )}</td><td><a href="${student.mapsLink}" target="_blank">View on Map</a></td></tr>`
                )
                .join('') +
            '</tbody></table>';
    }
});
