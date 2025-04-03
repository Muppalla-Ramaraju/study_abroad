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

    // Populate student dropdown
    await populateStudentDropdown();

    // Populate current students list
    await populateCurrentStudentsList(classId);

    // Handle Add Student Button
    document.getElementById("addStudentForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        await addStudentToClass(classId);
    });

    // Populate faculty dropdown
    await populateFacultyDropdown();

    // Populate current faculty list
    await populateCurrentFacultyList(classId);

    // Handle Add Faculty Button
    document.getElementById("addFacultyForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        await addFacultyToClass(classId);
    });
});

// Populate student dropdown
async function populateStudentDropdown() {
    const studentDropdown = document.getElementById("studentEmail");
    const apiUrl = "https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/students";

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch student data");
        }
        const students = await response.json();

        studentDropdown.innerHTML = ""; // Clear existing options
        students.forEach(student => {
            const option = document.createElement("option");
            option.value = student.name;
            option.textContent = student.name;
            studentDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading students:", error);
    }
}

// Populate current students list
async function populateCurrentStudentsList(classId) {
    const studentList = document.getElementById("student-list");
    const apiUrl = `https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/students/list`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ classId }) // Send classId in the request body
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch student data");
        }
        
        const data = await response.json();
        const students = data.studentsList || [];
        
        // Update student count in the UI
        document.getElementById("members-count").textContent = students.length;
        
        // Clear and populate the student list
        studentList.innerHTML = ''; 
        
        students.forEach(student => {
            const li = document.createElement("li");
            li.className = "student-item";
            
            // Create a container for student name
            const nameSpan = document.createElement("span");
            nameSpan.textContent = student;
            nameSpan.className = "student-name";
            li.appendChild(nameSpan);
            
            // Create remove button
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.className = "remove-btn";
            removeBtn.addEventListener("click", () => removeStudentFromClass(classId, student));
            li.appendChild(removeBtn);
            
            studentList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching students list:", error);
        studentList.innerHTML = '<li>Failed to load students</li>';
    }
}

// Add student to class
async function addStudentToClass(classId) {
    const studentDropdown = document.getElementById("studentEmail");
    const selectedStudent = studentDropdown.value;

    if (!selectedStudent) {
        alert("Please select a student.");
        return;
    }

    const apiUrl = "https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/students/add";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student: selectedStudent,
                classId: classId  // Sending classId in the request body
            })
        });

        if (!response.ok) {
            throw new Error("Failed to add student to class.");
        }

        alert("Student added successfully!");
        
        // Refresh student list
        await populateCurrentStudentsList(classId);

    } catch (error) {
        console.error("Error adding student:", error);
    }
}

// Remove student from class
async function removeStudentFromClass(classId, studentName) {
    if (!confirm(`Are you sure you want to remove ${studentName} from this class?`)) {
        return;
    }
    
    const apiUrl = "https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/students/remove";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                student: studentName,
                classId: classId
            })
        });

        // Refresh student list
        await populateCurrentStudentsList(classId);
        
        alert("Student removed successfully!");

    } catch (error) {
        console.error("Error removing student:", error);
        alert("Failed to remove student. Please try again or contact support.");
    }
}

// Populate faculty dropdown
async function populateFacultyDropdown() {
    const facultyDropdown = document.getElementById("facultyEmail");
    const apiUrl = "https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/faculty";

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch faculty data");
        }
        const faculty = await response.json();

        facultyDropdown.innerHTML = ""; // Clear existing options
        faculty.forEach(facultyMember => {
            const option = document.createElement("option");
            option.value = facultyMember.name;
            option.textContent = facultyMember.name;
            facultyDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading faculty:", error);
    }
}

// Populate current faculty list for a class
/*async function populateCurrentFacultyList(classId) {
    const membersCount = document.getElementById("members-count"); // Get members count element

    // Check if the members-count element exists
    if (!membersCount) {
        console.error("members-count element not found in the DOM");
        return;
    }

    const apiUrl = `https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/faculty/list`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ classId }) // Send classId in the request body
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch faculty data");
        }
        
        const data = await response.json();
        const facultyMembers = data.facultyList || [];
        
        // Increment the members count by 1 for each faculty member
        membersCount.textContent = parseInt(membersCount.textContent, 10) + facultyMembers.length; 
        
    } catch (error) {
        console.error("Error fetching faculty list:", error);
        membersCount.textContent = 'Failed to load member count';
    }
}*/

async function populateCurrentFacultyList(classId) {
    const facultyList = document.getElementById("faculty-list");
    const membersCount = document.getElementById("members-count"); // Get members count element

    // Check if the faculty-list or members-count element exists
    if (!facultyList || !membersCount) {
        console.error("faculty-list or members-count element not found in the DOM");
        return;
    }

    const apiUrl = `https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/faculty/list`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ classId }) // Send classId in the request body
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch faculty data");
        }
        
        const data = await response.json();
        const facultyMembers = data.facultyList || [];
        
        // Increment members count by 1 each time data is fetched
        membersCount.textContent = parseInt(membersCount.textContent, 10) + 1; 
        
        // Clear and populate the faculty list
        facultyList.innerHTML = ''; 
        
        facultyMembers.forEach(faculty => {
            const li = document.createElement("li");
            li.className = "faculty-item";
            
            // Create a container for faculty name
            const nameSpan = document.createElement("span");
            nameSpan.textContent = faculty;
            nameSpan.className = "faculty-name";
            li.appendChild(nameSpan);
            
            // Create remove button
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.className = "remove-btn";
            removeBtn.addEventListener("click", () => removeFacultyFromClass(classId, faculty));
            li.appendChild(removeBtn);
            
            facultyList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching faculty list:", error);
        facultyList.innerHTML = '<li>Failed to load faculty members</li>';
    }
}


// Add faculty to class
async function addFacultyToClass(classId) {
    const facultyDropdown = document.getElementById("facultyEmail");
    const selectedFaculty = facultyDropdown.value;

    if (!selectedFaculty) {
        alert("Please select a faculty member.");
        return;
    }

    const apiUrl = "https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/faculty/add";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                faculty: selectedFaculty,
                classId: classId  // Sending classId in the request body
            })
        });

        if (!response.ok) {
            throw new Error("Failed to add faculty to class.");
        }

        alert("Faculty added successfully!");
        
        // Refresh faculty list
        await populateCurrentFacultyList(classId);

    } catch (error) {
        console.error("Error adding faculty:", error);
    }
}

// Remove faculty from class
async function removeFacultyFromClass(classId, facultyName) {
    if (!confirm(`Are you sure you want to remove ${facultyName} from this class?`)) {
        return;
    }
    
    const apiUrl = "https://cso6luevsi.execute-api.us-east-1.amazonaws.com/prod/faculty/remove";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                faculty: facultyName,
                classId: classId
            })
        });

        // Refresh faculty list
        await populateCurrentFacultyList(classId);
        
        alert("Faculty removed successfully!");

    } catch (error) {
        console.error("Error removing faculty:", error);
        alert("Failed to remove faculty. Please try again or contact support.");
    }
}
