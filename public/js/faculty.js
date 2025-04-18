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

    // DOM Elements
    const navItems = document.querySelectorAll('.nav-item');
    const mainContent = document.querySelector('.main-content');
    const desktopLogoutBtn = document.getElementById('desktopLogoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');
    const getStudentDetailsBtn = document.getElementById('getStudentDetailsBtn');
    const studentDetailsContainer = document.getElementById('studentDetailsContainer');
    const createCheckinBtn = document.getElementById('createStatusBtn');

    // Navigation Menu Active State
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            const pageType = this.getAttribute('data-page');
            if (pageType === 'dashboard') {
                mainContent.style.display = 'block';
            } else if (pageType === 'profile') {
                mainContent.innerHTML = '<h1>Profile Page</h1><p>This is the profile section.</p>';
                mainContent.style.display = 'block';
            } else if (pageType === 'help') {
                mainContent.innerHTML = '<h1>Help Page</h1><p>This is the help section.</p>';
                mainContent.style.display = 'block';
            }
            sidebar.classList.remove('active');
            backdrop.classList.remove('active');
        });
    });

    // Hamburger Menu Toggle
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function () {
            sidebar.classList.toggle('active');
            backdrop.classList.toggle('active');
        });
    }

    // Backdrop Click to Close Menu
    if (backdrop) {
        backdrop.addEventListener('click', function () {
            sidebar.classList.remove('active');
            backdrop.classList.remove('active');
        });
    }

    // Logout Buttons
    [desktopLogoutBtn, mobileLogoutBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function () {
                if (confirm('Are you sure you want to log out?')) {
                    logout();
                    sidebar.classList.remove('active');
                    backdrop.classList.remove('active');
                }
            });
        }
    });

    // Create Check-in Functionality
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
                e.stopPropagation();
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

        textarea.focus();
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
    if (getStudentDetailsBtn && studentDetailsContainer) {
        getStudentDetailsBtn.addEventListener('click', async () => {
            try {
                const facultyName = localStorage.getItem('name');
                if (!facultyName) {
                    throw new Error("Faculty name not found in local storage.");
                }

                const payload = { facultyName };

                const response = await fetch(
                    'https://s4rruk7vn6.execute-api.us-east-1.amazonaws.com/prod/LocationFaculty',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    }
                );

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const rawData = await response.json();
                console.log("Raw API Response:", rawData);

                let studentDetails;
                try {
                    studentDetails =
                        typeof rawData.body === "string"
                            ? JSON.parse(rawData.body)
                            : rawData.body || rawData;
                } catch (err) {
                    throw new Error("Failed to parse API response");
                }

                if (!Array.isArray(studentDetails)) throw new Error("Invalid data format");

                displayStudentDetails(studentDetails);
                
            } catch (error) {
                console.error(error);
                studentDetailsContainer.innerHTML =
                    '<p class="error-message">Error loading student data. Please try again later.</p>';
            }
        });
    }

    function displayStudentDetails(details) {
        if (!Array.isArray(details) || details.length === 0) {
            studentDetailsContainer.innerHTML =
                '<p class="no-data">No student check-ins found.</p>';
            return;
        }

        studentDetailsContainer.innerHTML =
            '<table class="student-details-table"><thead><tr><th>Name</th><th>Address</th><th>Date</th><th>Time</th><th>Latitude</th><th>Longitude</th><th>Maps Link</th></tr></thead><tbody>' +
            details.map(student => `
                    <tr>
                        <td>${student.name || "N/A"}</td>
                        <td>${student.address || "N/A"}</td>
                        <td>${student.date || "N/A"}</td>
                        <td>${student.time || "N/A"}</td>
                        <td>${student.latitude?.toFixed(6)}</td>
                        <td>${student.longitude?.toFixed(6)}</td>
                        <td><a href="${student.mapsLink}" target="_blank">View Map</a></td>
                    </tr>`).join("") +
            '</tbody></table>';
    }
});