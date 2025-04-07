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
    const { idToken, userRole } = getSession();

    if (!idToken || userRole !== 'admin') {
        logout();
        window.location.href = 'login.html';
        return;
    }

    //session check
    initSessionChecker();

    lucide.createIcons();
    await fetchAndPopulateClasses();
    setupSeeAllButtons();
    setupCreateGroupButton();

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                logout();
            }
        });
    }
});

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

        const now = new Date();
        currentGroups = allGroups.filter(group => new Date(group.createdOn).getTime() > (now.getTime() - ACTIVE_THRESHOLD));
        previousGroups = allGroups.filter(group => new Date(group.createdOn).getTime() <= (now.getTime() - ACTIVE_THRESHOLD));

        populateGroups();

    } catch (error) {
        console.error('Failed to fetch classes:', error);
        alert(`Failed to load classes: ${error.message}`);
    }
}

function populateGroups() {
    const currentGroupsContainer = document.querySelector('.current-groups');
    const previousGroupsContainer = document.querySelector('.previous-groups');

    currentGroupsContainer.innerHTML = '';
    previousGroupsContainer.innerHTML = '';

    function appendGroups(groups, container) {
        groups.forEach((group, index) => {
            const card = createCard(group);
            if (index >= 3) {
                card.classList.add('row-hidden');
            }
            container.appendChild(card);
        });
    }

    appendGroups(currentGroups, currentGroupsContainer);
    appendGroups(previousGroups, previousGroupsContainer);

    const currentSeeAllBtn = document.querySelector('.see-all-btn[data-section="current"]');
    const previousSeeAllBtn = document.querySelector('.see-all-btn[data-section="previous"]');

    currentSeeAllBtn.classList.toggle('hidden', currentGroups.length <= 3);
    previousSeeAllBtn.classList.toggle('hidden', previousGroups.length <= 3);
}

function createCard(group) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', group.classId);

    const createdOnDate = new Date(group.createdOn).toLocaleDateString();

    card.innerHTML = `
        <h3>${group.name}</h3>
        <div class="card-info">
            <p>Faculty: <span>${group.faculty}</span></p>
            <p>Created On: <span>${createdOnDate}</span></p>
        </div>
    `;

    card.addEventListener('click', () => handleCardClick(group));

    return card;
}

function handleCardClick(group) {
    console.log(`Clicked group: ${group.name}`);
    window.location.href = `class-details.html?classId=${group.classId}`;
}

function setupSeeAllButtons() {
    const seeAllButtons = document.querySelectorAll('.see-all-btn');

    seeAllButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            const container = document.querySelector(`.${section}-groups`);
            const hiddenCards = container.querySelectorAll('.row-hidden');

            hiddenCards.forEach(card => {
                card.classList.remove('row-hidden');
            });

            button.classList.add('hidden');
        });
    });
}

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
        const response = await fetch(`${API_ENDPOINT}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`
            },
            body: JSON.stringify({
                className,
                facultyName
                // createdOn should be added server-side for integrity
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
        }

        const newClass = await response.json();

        allGroups.push({
            classId: newClass.classId,
            name: newClass.name,
            faculty: newClass.faculty,
            createdOn: newClass.createdOn
        });

        const now = new Date();
        currentGroups = allGroups.filter(group => new Date(group.createdOn).getTime() > (now.getTime() - ACTIVE_THRESHOLD));
        previousGroups = allGroups.filter(group => new Date(group.createdOn).getTime() <= (now.getTime() - ACTIVE_THRESHOLD));

        populateGroups();
        document.querySelector('.modal').remove();
    } catch (error) {
        console.error('Error adding class:', error);
        alert(`Failed to add class: ${error.message}`);
    }
};
