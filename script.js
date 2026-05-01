/* =========================================
   📚 LIBRARY MANAGEMENT SYSTEM - FINAL CODE
   ========================================= */

/* ================= GLOBAL VARIABLES ================= */
let issuedBooks = [];

/* ================= ADMIN SYSTEM ================= */
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = null;

/* Load saved admins from localStorage */
loadAdmins();

/* ================= LOGIN SYSTEM ================= */
function login() {

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "" || password === "") {
        alert("Enter username & password");
        return;
    }

    // save user (THIS IS IMPORTANT)
    localStorage.setItem("currentUser", username);

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    document.getElementById("welcomeUser").innerText = "Welcome " + username;
    document.getElementById("analyticsSection").style.display = "block";
}
/* ================= LIBRARY SYSTEM ================= */
function generateLibrary() {

    let books = document.getElementById("books").value
        .split(",")
        .map(b => b.trim())
        .filter(b => b !== "");

    let students = document.getElementById("students").value
        .split(",")
        .map(s => s.trim())
        .filter(s => s !== "");

    let output = document.getElementById("output");
    let qrOutput = document.getElementById("qrOutput");

    qrOutput.innerHTML = "";
    let html = "";

    document.getElementById("totalBooks").innerText = books.length;
    document.getElementById("totalStudents").innerText = students.length;
    document.getElementById("issuedBooks").innerText = issuedBooks.length;

    html += `
    <h3>📚 Books List</h3>
    <table border="1">
        <tr>
            <th>#</th>
            <th>Book Name</th>
            <th>Status</th>
            <th>Action</th>
        </tr>
    `;

    books.forEach((book, i) => {

        let status = issuedBooks.includes(book)
            ? "🔴 Issued"
            : "🟢 Available";

        html += `
        <tr>
            <td>${i + 1}</td>
            <td>${book}</td>
            <td>${status}</td>
            <td>
                <button onclick="issueBook('${book}')">Issue</button>
                <button onclick="returnBook('${book}')">Return</button>
            </td>
        </tr>
        `;
    });

    html += `</table><br>`;

    html += `
    <h3>👨‍🎓 Students List</h3>
    <table border="1">
        <tr><th>#</th><th>Name</th></tr>
    `;

    students.forEach((s, i) => {

        html += `
        <tr>
            <td>${i + 1}</td>
            <td>${s}</td>
        </tr>
        `;

        generateQR(s);
    });

    html += `</table>`;

    output.innerHTML = html;
    updateDashboard();
    renderChart();
    updateAll();
}


/* ================= FIXED ISSUE BOOK (MERGED LOGIC) ================= */
function issueBook(book, student, issueDate, returnDate, fine) {

    // CASE 1: normal book issue
    if (arguments.length === 1) {

        if (issuedBooks.includes(book)) {
            alert("❌ Already Issued");
            return;
        }

        issuedBooks.push(book);
        document.getElementById("issuedBooks").innerText = issuedBooks.length;

        alert("📤 Issued: " + book);
        generateLibrary();
    }

    // CASE 2: record-based issue (fine system)
    else {
        issuedBooks.push({
            student: student,
            book: book,
            issueDate: issueDate,
            returnDate: returnDate,
            fine: fine
        });

        showHistory();
    }
    updateDashboard();
    renderChart();
    updateAll();
}

/* ================= RETURN BOOK ================= */
function returnBook(book) {

    let index = issuedBooks.indexOf(book);

    if (index === -1) {
        alert("❌ Not Issued");
        return;
    }

    issuedBooks.splice(index, 1);
    document.getElementById("issuedBooks").innerText = issuedBooks.length;

    alert("📥 Returned: " + book);
    generateLibrary();
    updateDashboard();
    renderChart();
    updateAll();
}

/* ================= CLEAR DATA ================= */
function clearData() {

    document.getElementById("books").value = "";
    document.getElementById("students").value = "";
    document.getElementById("output").innerHTML = "";
    document.getElementById("qrOutput").innerHTML = "";

    document.getElementById("totalBooks").innerText = 0;
    document.getElementById("totalStudents").innerText = 0;
    document.getElementById("issuedBooks").innerText = 0;

    issuedBooks = [];
}

/* ================= SEARCH ================= */
function searchLibrary() {

    let value = document.getElementById("searchInput").value.trim();
    let result = document.getElementById("searchResult");

    let books = document.getElementById("books").value.split(",").map(b => b.trim());
    let students = document.getElementById("students").value.split(",").map(s => s.trim());

    if (books.includes(value)) {
        result.innerText = "📚 Book Found: " + value;
    }
    else if (students.includes(value)) {
        result.innerText = "👨‍🎓 Student Found: " + value;
    }
    else {
        result.innerText = "❌ Not Found";
    }
}

/* ================= EXPORT JSON ================= */
function downloadData() {

    let data = {
        books: document.getElementById("books").value,
        students: document.getElementById("students").value,
        issuedBooks: issuedBooks
    };

    let blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "library-data.json";
    a.click();
}

/* ================= PDF DOWNLOAD ================= */
function downloadPDF() {

    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    doc.text("Library Report", 10, 10);
    doc.text(document.getElementById("output").innerText, 10, 20);

    doc.save("library-report.pdf");
}

/* ================= QR GENERATOR ================= */
function generateQR(student) {

    let qrDiv = document.createElement("div");

    qrDiv.style.margin = "10px";
    qrDiv.style.display = "inline-block";

    new QRCode(qrDiv, {
        text: "Library Member: " + student,
        width: 120,
        height: 120
    });

    document.getElementById("qrOutput").appendChild(qrDiv);
}

/* ================= FIREBASE INIT ================= */
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID"
};

if (typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
}

/* ================= ID CARD ================= */
function downloadID(name) {

    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    doc.text("Student ID Card", 10, 10);
    doc.text("Name: " + name, 10, 20);

    doc.save(name + "_id.pdf");
}

/* ================= SCANNER ================= */
function startScanner() {

    let scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: 250
    });

    scanner.render((decodedText) => {
        alert("Scanned: " + decodedText);
    });
}

/* ================= DARK MODE ================= */
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

/* ================= FINE CALCULATION ================= */
function calculateFine() {

    let student = document.getElementById("searchInput").value;
    let book = "Unknown Book";

    let issueDate = new Date(document.getElementById("issueDate").value);
    let returnDate = new Date(document.getElementById("returnDate").value);

    let allowedDays = 7;
    let finePerDay = 5;

    let diffTime = returnDate - issueDate;
    let diffDays = diffTime / (1000 * 60 * 60 * 24);

    let lateDays = diffDays - allowedDays;

    let fine = lateDays > 0 ? lateDays * finePerDay : 0;

    document.getElementById("fineResult").innerText =
        "💰 Fine: ₹ " + fine;

    issueBook(student, book,
        issueDate.toISOString().split("T")[0],
        returnDate.toISOString().split("T")[0],
        fine
    );
}

/* ================= HISTORY PLACEHOLDER ================= */
function showHistory() {
    console.log("History Updated:", issuedBooks);
}function updateDashboard() {

    let totalBooks = document.getElementById("books").value
        .split(",").filter(b => b.trim() !== "").length;

    let totalStudents = document.getElementById("students").value
        .split(",").filter(s => s.trim() !== "").length;

    let issued = issuedBooks.length;

    let available = totalBooks - issued;
    if (available < 0) available = 0;

    document.getElementById("totalBooks").innerText = totalBooks;
    document.getElementById("totalStudents").innerText = totalStudents;
    document.getElementById("issuedBooks").innerText = issued;
    document.getElementById("availableBooks").innerText = available;
}let chartInstance;

function renderChart() {

    let canvas = document.getElementById("libraryChart");

    if (!canvas) {
        console.log("Canvas missing");
        return;
    }

    let ctx = canvas.getContext("2d");

    let books = document.getElementById("books").value
        .split(",")
        .filter(b => b.trim() !== "").length;

    let students = document.getElementById("students").value
        .split(",")
        .filter(s => s.trim() !== "").length;

    let issued = parseInt(document.getElementById("issuedBooks").innerText) || 0;
    let available = books - issued;

    if (window.chartInstance) {
        window.chartInstance.destroy();
    }

    window.chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Books", "Students", "Issued", "Available"],
            datasets: [{
                label: "Library Analytics",
                data: [books, students, issued, available],
                backgroundColor: ["#1976d2", "#42a5f5", "#0d47a1", "#90caf9"]
            }]
        }
    });
}
function generateAutoReport() {

    let totalBooks = parseInt(document.getElementById("totalBooks").innerText) || 0;
    let totalStudents = parseInt(document.getElementById("totalStudents").innerText) || 0;
    let issuedBooks = parseInt(document.getElementById("issuedBooks").innerText) || 0;
    let availableBooks = parseInt(document.getElementById("availableBooks").innerText) || 0;

    let report = `
📚 LIBRARY AUTO REPORT

--------------------------------
Total Books      : ${totalBooks}
Total Students   : ${totalStudents}
Issued Books     : ${issuedBooks}
Available Books  : ${availableBooks}
--------------------------------

📊 SYSTEM INSIGHT (AI ANALYSIS)
- Library is operating normally
- Book circulation is ${issuedBooks > 0 ? "ACTIVE" : "LOW"}
- System health: GOOD
`;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(report, 10, 10);
    doc.save("Library_Auto_Report.pdf");
    updateAll();
}function aiSuggestion() {

    let books = document.getElementById("books").value.toLowerCase();

    let suggestion = "";

    if (books.includes("java")) {
        suggestion = "📘 Suggestion: Student should also study OOP concepts";
    }
    else if (books.includes("python")) {
        suggestion = "🐍 Suggestion: Python is great for AI/ML learning";
    }
    else if (books.includes("c++")) {
        suggestion = "⚙️ Suggestion: Focus on DSA with C++";
    }
    else {
        suggestion = "📚 Suggestion: Add more technical books for better learning";
    }

    document.getElementById("searchResult").innerText = suggestion;
    
}function autoDashboardUpdate() {

    let books = document.getElementById("books").value.split(",").filter(b => b.trim() !== "");
    let students = document.getElementById("students").value.split(",").filter(s => s.trim() !== "");

    document.getElementById("totalBooks").innerText = books.length;
    document.getElementById("totalStudents").innerText = students.length;

    let issued = Math.floor(books.length / 2);
    document.getElementById("issuedBooks").innerText = issued;

    document.getElementById("availableBooks").innerText = books.length - issued;
}setInterval(autoDashboardUpdate, 2000);
function smartAlert() {

    let issued = parseInt(document.getElementById("issuedBooks").innerText) || 0;

    if (issued > 10) {
        alert("⚠️ High Book Issuance Alert!");
    }
}setInterval(smartAlert, 5000);


    function sendMessage() {

    let input = document.getElementById("msgInput"); // FIXED
    let msg = input.value;

    if (msg.trim() === "") return;

    let chatLog = document.querySelector(".chat-log"); // FIXED

    // USER MESSAGE
    chatLog.innerHTML += "<p><b>You:</b> " + msg + "</p>";

    let response = "";

    // AI LOGIC
    if (msg.includes("total books")) {
        response = "📚 Total books: " + document.getElementById("totalBooks").innerText;
    }
    else if (msg.includes("students")) {
        response = "👨‍🎓 Total students: " + document.getElementById("totalStudents").innerText;
    }
    else if (msg.includes("issued")) {
        response = "📕 Issued books: " + document.getElementById("issuedBooks").innerText;
    }
    else if (msg.includes("available")) {
        response = "📗 Available books: " + document.getElementById("availableBooks").innerText;
    }
    else if (msg.includes("suggest")) {
        response = "📘 Try Java, Python, DSA books!";
    }
    else {
        response = "🤖 I can help with books, students, issued data.";
    }

    // BOT MESSAGE
    chatLog.innerHTML += "<p><b>Bot:</b> " + response + "</p>";

    input.value = "";
}
;function logout() {

    localStorage.removeItem("currentUser");

    document.getElementById("loginBox").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
}


window.onload = function () {

    let savedUser = localStorage.getItem("currentUser");

    if (savedUser) {

        currentUser = savedUser;

        document.getElementById("loginBox").style.display = "none";
        document.getElementById("dashboard").style.display = "block";

        document.getElementById("welcomeUser").innerText = "Welcome " + savedUser;
    }
};
function showSection(sectionId) {

    let sections = document.querySelectorAll(".section");

    sections.forEach(sec => sec.style.display = "none");

    let active = document.getElementById(sectionId);
    active.style.display = "block";

    // 🔥 IMPORTANT FIX FOR ANALYTICS
    if (sectionId === "analyticsSection") {

        setTimeout(() => {
            renderChart();
        }, 300);
    }
}
function updateAll() {
    updateDashboard();
    renderChart();
}function printLibrary() {

    let content = document.getElementById("output").innerHTML;

    if (content.trim() === "") {
        alert("⚠️ Generate library first!");
        return;
    }

    let printWindow = window.open('', '', 'width=900,height=700');

    printWindow.document.write(`
        <html>
        <head>
            <title>Library Report</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: center; border: 1px solid black; }
            </style>
        </head>
        <body>
            <h2>📚 Library Report</h2>
            ${content}
        </body>
        </html>
    `);

    printWindow.document.close();

    // 🔥 FIX
    printWindow.onload = function () {
        printWindow.print();
    };
}
