import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';

// Define API endpoint
const API_ENDPOINT = 'https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/classes';

// Time frame for active groups (in milliseconds) - 1 month
const ACTIVE_THRESHOLD = 30 * 24 * 60 * 60 * 1000;

// Global variables to store classes fetched from the API
let allGroups = [];
let currentGroups = [];
let previousGroups = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Get session data
    const { idToken, userRole, tokenExpiresAt } = getSession();

    // Check if session is expired or invalid
    if (!idToken || userRole !== 'admin') {
        logout();
        window.location.href = 'login.html';
        return;
    }

    // Initialize session checker to periodically check token expiration and refresh tokens if needed
    initSessionChecker();

    lucide.createIcons();

    // Fetch and populate classes
    await fetchAndPopulateClasses();

    // Setup see all buttons
    setupSeeAllButtons();

    // Setup create group button
    setupCreateGroupButton();

    // Logout button functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                logout(); // Logout action
            }
        });
    }
});

// New function to fetch and populate classes from the API
async function fetchAndPopulateClasses() {
    try {
        const response = await fetch(`${API_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        allGroups = await response.json();

        // Distinguish between current and previous classes using logic, using a field or date
        const now = new Date();
        currentGroups = allGroups.filter(group => new Date(group.lastActive).getTime() > (now.getTime() - ACTIVE_THRESHOLD));
        previousGroups = allGroups.filter(group => new Date(group.lastActive).getTime() <= (now.getTime() - ACTIVE_THRESHOLD));

        // Populate the groups in the UI
        populateGroups();

    } catch (error) {
        console.error('Failed to fetch classes:', error);
        alert(`Failed to load classes: ${error.message}`);
    }
}

// Function to populate groups with initial 3 visible
function populateGroups() {
    const currentGroupsContainer = document.querySelector('.current-groups');
    const previousGroupsContainer = document.querySelector('.previous-groups');

    // Clear existing content
    currentGroupsContainer.innerHTML = '';
    previousGroupsContainer.innerHTML = '';

    // Function to append groups to a container
    function appendGroups(groups, container) {
        groups.forEach((group, index) => {
            const card = createCard(group);

            // Hide groups after first 3
            if (index >= 3) {
                card.classList.add('row-hidden');
            }

            container.appendChild(card);
        });
    }

    // Add current groups (initially first 3)
    appendGroups(currentGroups, currentGroupsContainer);

    // Add previous groups (initially first 3)
    appendGroups(previousGroups, previousGroupsContainer);

    //  Visibility of "See All" buttons
    const currentSeeAllBtn = document.querySelector('.see-all-btn[data-section="current"]');
    const previousSeeAllBtn = document.querySelector('.see-all-btn[data-section="previous"]');

    currentSeeAllBtn.classList.toggle('hidden', currentGroups.length <= 3);
    previousSeeAllBtn.classList.toggle('hidden', previousGroups.length <= 3);
}

// Function to create a card element
function createCard(group) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', group.classId); // Changed to classId

    card.innerHTML = `
        <h3>${group.name}</h3>
        <div class="card-info">
            <p>Members: <span>${group.members}</span></p>
            <p>Faculty: <span>${group.faculty}</span></p>
            <p>Last Active: <span>${group.lastActive}</span></p>
        </div>
    `;

    card.addEventListener('click', () => handleCardClick(group));

    return card;
}

// Function to handle card clicks
function handleCardClick(group) {
    console.log(`Clicked group: ${group.name}`);
    // Additional functionality can be added here
}

// Setup see all buttons functionality
function setupSeeAllButtons() {
    const seeAllButtons = document.querySelectorAll('.see-all-btn');

    seeAllButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            const container = document.querySelector(`.${section}-groups`);
            const hiddenCards = container.querySelectorAll('.row-hidden');

            // Show all hidden cards
            hiddenCards.forEach(card => {
                card.classList.remove('row-hidden');
            });

            // Hide the "See All" button after it's clicked
            button.classList.add('hidden');
        });
    });
}

// Setup create group button functionality
function setupCreateGroupButton() {
    const createGroupBtn = document.querySelector('.create-group-btn');

    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', () => {
            showAddClassModal();
        });
    }
}

function showAddClassModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Class</h2>
            <form id="addClassForm">
                <input type="text" id="className" placeholder="Class Name" required>
                <input type="text" id="facultyName" placeholder="Faculty Name" required>
                <button type="submit">Add Class</button>
                <button type="button" class="cancel">Cancel</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const form = modal.querySelector('#addClassForm');
    form.addEventListener('submit', handleAddClass);

    const cancelBtn = modal.querySelector('.cancel');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

const handleAddClass = async (event) => {
    event.preventDefault();

    const className = document.getElementById('className').value;
    const facultyName = document.getElementById('facultyName').value;

    try {
        const response = await fetch(`${API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`
            },
            body: JSON.stringify({
                className,
                facultyName
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const newClass = await response.json();

        //  Add the new class to the local state
        allGroups.push({
            classId: newClass.classId, // Ensure the ID is set correctly
            name: newClass.name,
            faculty: newClass.faculty,
            members: newClass.members || 0,
            lastActive: newClass.lastActive
        });

        // Distinguish between current and previous classes using logic, using a field or date
        const now = new Date();
        currentGroups = allGroups.filter(group => new Date(group.lastActive).getTime() > (now.getTime() - ACTIVE_THRESHOLD));
        previousGroups = allGroups.filter(group => new Date(group.lastActive).getTime() <= (now.getTime() - ACTIVE_THRESHOLD));

        //  Refresh the UI to reflect the new class
        populateGroups();

        //  Close the modal after adding
        document.querySelector('.modal').remove();
    } catch (error) {
        console.error('Error adding class:', error);
        alert(`Failed to add class: ${error.message}`);
    }
};




