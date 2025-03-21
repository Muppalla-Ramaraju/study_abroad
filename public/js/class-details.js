import { getSession, refreshTokens, logout, initSessionChecker } from './session.js';


document.addEventListener('DOMContentLoaded', async () => {

    const { idToken, userRole, tokenExpiresAt } = getSession();

    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('classId');

    if (!classId) {
        alert('Class ID is missing!');
        window.location.href = 'admin.html'; // Redirect to admin page
        return;
    }
    initSessionChecker();

    // Fetch class details by class ID
    const classDetails = await fetchClassDetails(classId);

    if (!classDetails) {
        alert('Failed to load class details.');
        window.location.href = 'admin.html';
        return;
    }

    // Populate class details
    document.querySelector('.class-details h2').textContent = classDetails.name;
    document.getElementById('members-count').textContent = classDetails.members;
    document.getElementById('faculty-name').textContent = classDetails.faculty;
    document.getElementById('last-active').textContent = classDetails.lastActive;

    // All student information
    await populateStudentDropDown();

    // Populate student list and faculty list
    populateStudentList(classDetails.students);
    populateFacultyList(classDetails.faculty);

    // Handle adding students
    document.getElementById('addStudentForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const studentEmail = document.getElementById('studentEmail').value;
        await addStudentToClass(classId, studentEmail);
    });

    // Handle adding faculty
    document.getElementById('addFacultyForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const facultyEmail = document.getElementById('facultyEmail').value;
        await addFacultyToClass(classId, facultyEmail);
    });
});

// Function to fetch for class information
/*async function fetchClassDetails(classId) {
    try {
        // This needs to be an endpoint so the system can use class id.
        const response = await fetch(`https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/classes/${classId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch class details:', error);
        return null;
    }
}*/

// This needs an endpoint to pull data.
async function populateStudentDropDown() {
    const studentDropDown = document.getElementById('studentEmail');
    console.log(studentDropDown)
    try {
        const response = await fetch(`https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/students`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const students = await response.json();
        
        // Clear existing options first (good practice)
        studentDropDown.innerHTML = '';
        
        // Add a default "Select student" option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select a student --';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        studentDropDown.appendChild(defaultOption);
        
        // Sort students alphabetically by firstName then lastName (optional)
        students.sort((a, b) => {
            if (a.firstName < b.firstName) return -1;
            if (a.firstName > b.firstName) return 1;
            return a.lastName.localeCompare(b.lastName);
        });
        
        // Add each student to the dropdown
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.email;
            option.textContent = `${student.firstName} ${student.lastName}`;
            studentDropDown.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to fetch student list:', error);
        // Show an error message to the user
        studentDropDown.innerHTML = '<option value="">Error loading students</option>';
    }
}

// This handles the functionality for adding the student to the class.
async function addStudentToClass(classId, studentEmail) {
    try {
        const response = await fetch(`https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/classes/${classId}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`
            },
            body: JSON.stringify({ studentEmail })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        populateStudentList(result.updated_students);

        alert('Student added successfully.');
    } catch (error) {
        console.error('Failed to add student to class:', error);
        alert('Failed to add student to class.');
    }
}

// This function adds the faculty to the class, also with error handling.
async function addFacultyToClass(classId, facultyEmail) {
    try {
        const response = await fetch(`https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/classes/${classId}/faculty`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('idToken')}`
            },
            body: JSON.stringify({ facultyEmail })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        populateFacultyList(result.updated_faculty);
        alert('Faculty added successfully.');

    } catch (error) {
        console.error('Failed to add faculty to class:', error);
        alert('Failed to add faculty to class.');
    }
}

// Populates students to a list.
function populateStudentList(students) {
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = ''; // Clear existing list

    students.forEach(student => {
        const li = document.createElement('li');
        li.textContent = student;
        studentList.appendChild(li);
    });
}

// Populates faculty to a list.
function populateFacultyList(faculty) {
    const facultyList = document.getElementById('faculty-list');
    facultyList.innerHTML = ''; // Clear existing list

    faculty.forEach(member => {
        const li = document.createElement('li');
        li.textContent = member;
        facultyList.appendChild(li);
    });
}
