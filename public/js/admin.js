// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    // Session validation (added)
    const idToken = localStorage.getItem('idToken');
    const userRole = localStorage.getItem('userRole')?.toLowerCase();
    if (!idToken || userRole !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    lucide.createIcons();
    
    // Populate cards for both sections
    populateGroups();
    
    // Setup see all buttons
    setupSeeAllButtons();
    
    // Setup create group button
    setupCreateGroupButton();

    // Logout button functionality (added)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.clear(); // Clear session
                window.location.href = 'login.html'; // Redirect to login
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
            console.log('Create group button clicked');
            // Additional dropdown functionality can be added here
        });
    }
}