const API_URL = 'http://localhost:5000/students';

async function fetchStudents() {
    const response = await fetch(API_URL);
    const students = await response.json();
    const table = document.getElementById('studentTable');
    table.innerHTML = students.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.department}</td>
            <td>${new Date(student.enrollmentDate).toLocaleDateString()}</td>
            <td>
                <button onclick="deleteStudent('${student._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function addStudent(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const department = document.getElementById('department').value;
    const enrollmentDate = document.getElementById('enrollmentDate').value;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, department, enrollmentDate })
    });
    fetchStudents();
}

async function deleteStudent(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchStudents();
}

document.getElementById('studentForm').addEventListener('submit', addStudent);

fetchStudents();
//================================================================
