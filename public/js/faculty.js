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

    // Store initial dashboard content and student data
    const initialDashboardContent = mainContent.innerHTML;
    let studentData = null;

    // Function to fetch and display student details
    async function fetchStudentDetails(container, table) {
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

            studentData = studentDetails; // Store the data
            displayStudentDetails(studentDetails, container);
            displayAdditionalDetails(studentDetails, table);
            
        } catch (error) {
            console.error(error);
            container.innerHTML =
                '<p class="error-message">Error loading student data. Please try again later.</p>';
            table.innerHTML =
                '<tr><td colspan="7" class="error-message">Error loading additional details. Please try again later.</td></tr>';
        }
    }

    // Function to attach or re-attach event listeners for dashboard buttons
    function attachDashboardEventListeners() {
        const getStudentDetailsBtn = document.getElementById('getStudentDetailsBtn');
        const studentDetailsContainer = document.getElementById('studentDetailsContainer');
        const additionalDetailsTable = document.getElementById('additionalDetailsTable');

        if (getStudentDetailsBtn && studentDetailsContainer && additionalDetailsTable) {
            // Remove existing listeners to prevent duplicates
            getStudentDetailsBtn.replaceWith(getStudentDetailsBtn.cloneNode(true));
            const newGetStudentDetailsBtn = document.getElementById('getStudentDetailsBtn');
            
            newGetStudentDetailsBtn.addEventListener('click', () => {
                fetchStudentDetails(studentDetailsContainer, additionalDetailsTable);
            });
        }
    }

    // Navigation Menu Active State
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            const pageType = this.getAttribute('data-page');
            if (pageType === 'dashboard') {
                // Restore original dashboard content
                mainContent.innerHTML = initialDashboardContent;
                // Restore student data if available
                const studentDetailsContainer = document.getElementById('studentDetailsContainer');
                const additionalDetailsTable = document.getElementById('additionalDetailsTable');
                if (studentData && studentDetailsContainer && additionalDetailsTable) {
                    displayStudentDetails(studentData, studentDetailsContainer);
                    displayAdditionalDetails(studentData, additionalDetailsTable);
                }
                // Re-attach event listeners
                attachDashboardEventListeners();
            } else if (pageType === 'profile') {
                mainContent.innerHTML = '<h1>Profile Page</h1><p>This is the profile section.</p>';
            } else if (pageType === 'help') {
                mainContent.innerHTML = '<h1>Help Page</h1><p>This is the help section.</p>';
            }
            mainContent.style.display = 'block';
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

    function checkNotifications() {
        console.log('Checking for new notifications...');
    }

    setInterval(checkNotifications, 300000);

    // Initial event listener setup
    attachDashboardEventListeners();

    function displayStudentDetails(details, container) {
        if (!Array.isArray(details) || details.length === 0) {
            container.innerHTML =
                '<p class="no-data">No student check-ins found.</p>';
            return;
        }

        container.innerHTML =
            '<table class="student-details-table"><thead><tr><th>Name</th><th>Address</th><th>Date</th><th>Time</th><th>Latitude</th><th>Longitude</th><th>Maps Link</th></tr></thead><tbody>' +
            details.map(student => `
                    <tr>
                        <td>${student.name || "N/A"}</td>
                        <td>${student.address || "N/A"}</td>
                        <td>${student.date || "N/A"}</td>
                        <td>${student.time || "N/A"}</td>
                        <td>${student.latitude?.toFixed(6) || "N/A"}</td>
                        <td>${student.longitude?.toFixed(6) || "N/A"}</td>
                        <td><a href="${student.mapsLink}" target="_blank">View Map</a></td>
                    </tr>`).join("") +
            '</tbody></table>';
    }

    function displayAdditionalDetails(details, table) {
        if (!Array.isArray(details) || details.length === 0) {
            table.innerHTML =
                '<tr><td colspan="7" class="no-data">No additional details found.</td></tr>';
            return;
        }

        table.innerHTML = details.map(student => `
            <tr>
                <td>${student.name || "N/A"}</td>
                <td>${student.peers || "None"}</td>
                <td>${student.place || "N/A"}</td>
                <td>${student.studentStatus || "None"}</td>
                <td>${student.comments || "N/A"}</td>
                <td>${student.emergency ? "Yes" : "No"}</td>
                <td>${student.emergencyDetails || "N/A"}</td>
            </tr>`).join("");
    }
});