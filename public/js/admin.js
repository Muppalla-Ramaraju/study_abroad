import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get session data
    const { idToken, userRole, tokenExpiresAt } = getSession();
    
    // Check if session is expired or invalid
    if (!idToken || userRole !== 'admin') {
        logout();
        window.location.href = 'login.html';
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

    lucide.createIcons();

    // Populate cards for both sections
    populateGroups();

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

// Sample data for groups - 6 items in each array
const currentGroups = [
    {
        id: 1,
        name: 'ISTM 631 Group A',
        members: 25,
        faculty: 'Dr. Sarah Martinez',
        lastActive: '2 hours ago'
    },
    {
        id: 2,
        name: 'ISTM 615 Group B',
        members: 30,
        faculty: 'Dr. James Wilson',
        lastActive: '4 hours ago'
    },
    {
        id: 3,
        name: 'ISTM 645 Group C',
        members: 28,
        faculty: 'Dr. Emily Chen',
        lastActive: '1 day ago'
    },
    {
        id: 4,
        name: 'ISTM 631 Group D',
        members: 27,
        faculty: 'Dr. Michael Brown',
        lastActive: '3 hours ago'
    },
    {
        id: 5,
        name: 'ISTM 615 Group E',
        members: 29,
        faculty: 'Dr. Lisa Anderson',
        lastActive: '5 hours ago'
    },
    {
        id: 6,
        name: 'ISTM 645 Group F',
        members: 26,
        faculty: 'Dr. Robert Taylor',
        lastActive: '2 days ago'
    }
];

const previousGroups = [
    {
        id: 7,
        name: 'ISTM 631 Fall 2023',
        members: 25,
        faculty: 'Dr. Sarah Martinez',
        lastActive: '3 months ago'
    },
    {
        id: 8,
        name: 'ISTM 615 Fall 2023',
        members: 30,
        faculty: 'Dr. James Wilson',
        lastActive: '3 months ago'
    },
    {
        id: 9,
        name: 'ISTM 645 Fall 2023',
        members: 28,
        faculty: 'Dr. Emily Chen',
        lastActive: '3 months ago'
    },
    {
        id: 10,
        name: 'ISTM 631 Summer 2023',
        members: 24,
        faculty: 'Dr. Michael Brown',
        lastActive: '6 months ago'
    },
    {
        id: 11,
        name: 'ISTM 615 Summer 2023',
        members: 29,
        faculty: 'Dr. Lisa Anderson',
        lastActive: '6 months ago'
    },
    {
        id: 12,
        name: 'ISTM 645 Summer 2023',
        members: 27,
        faculty: 'Dr. Robert Taylor',
        lastActive: '6 months ago'
    }
];

// Function to populate groups with initial 3 visible
function populateGroups() {
    const currentGroupsContainer = document.querySelector('.current-groups');
    const previousGroupsContainer = document.querySelector('.previous-groups');
    
    // Clear existing content
    currentGroupsContainer.innerHTML = '';
    previousGroupsContainer.innerHTML = '';
    
    // Add current groups (initially first 3)
    currentGroups.forEach((group, index) => {
        const card = createCard(group);
        
        // Hide groups after first 3
        if (index >= 3) {
            card.classList.add('row-hidden');
        }
        
        currentGroupsContainer.appendChild(card);
    });
    
    // Add previous groups (initially first 3)
    previousGroups.forEach((group, index) => {
        const card = createCard(group);
        
        // Hide groups after first 3
        if (index >= 3) {
            card.classList.add('row-hidden');
        }
        
        previousGroupsContainer.appendChild(card);
    });
    
    // Hide "See All" buttons if there are 3 or fewer groups
    if (currentGroups.length <= 3) {
        document.querySelector('.see-all-btn[data-section="current"]').classList.add('hidden');
    }
    
    if (previousGroups.length <= 3) {
        document.querySelector('.see-all-btn[data-section="previous"]').classList.add('hidden');
    }

    // Refresh "See All" button visibility
    const currentSeeAllBtn = document.querySelector('.see-all-btn[data-section="current"]');
    if (currentGroups.length > 3) {
        currentSeeAllBtn.classList.remove('hidden');
    } else {
        currentSeeAllBtn.classList.add('hidden');
    }

    // Update last active time
    const lastActiveElements = document.querySelectorAll('.last-active');
    lastActiveElements.forEach(element => {
        const lastActive = new Date(element.dataset.lastActive);
        element.textContent = formatLastActive(lastActive);
    });

}

// Function to create a card element
function createCard(group) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', group.id);
    
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

async function fetchClasses() {
    try {
        const response = await fetch('https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/classes/add', { // Replace with your API Gateway endpoint

            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`
            }
        });
        const data = await response.json();
        currentGroups = data; // Assuming the API returns an array of classes
        populateGroups();
    } catch (error) {
        console.error('Error fetching classes:', error);
    }
}



const handleAddClass = async (event) => {
    event.preventDefault();

    const className = document.getElementById('className').value;
    const facultyName = document.getElementById('facultyName').value;

    try {
        const response = await fetch('https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/classes/add', {
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

        const data = await response.json(); //  Properly handle the response
        if (response.ok) {
            console.log('Class added:', data);
            alert(`Class added: ${data.name} by ${data.faculty}`);
            
            //  Add the new class to the local state
            currentGroups.unshift({
                id: data.classId, // Ensure the ID is set correctly
                name: data.name,
                faculty: data.faculty,
                members: data.members || 0,
                lastActive: data.lastActive
            });

            //  Refresh the UI to reflect the new class
            populateGroups();

            //  Close the modal after adding
            document.querySelector('.modal').remove();
        } else {
            console.error('Error adding class:', data.error);
            alert(`Failed to add class: ${data.error}`);
        }
    } catch (error) {
        console.error('Error adding class:', error);
        alert(`Failed to add class: ${error.message}`);
    }
};



