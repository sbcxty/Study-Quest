// Application State
    const state = {
    currentUser: null,
    classes: [],
    subjects: [],
    exams: [],
    studySettings: {
        intensity: 3,
        maxSessionHours: 2,
        breakMinutes: 15,
        weekdayHours: { start: "6:00 PM", end: "10:00 PM" },
        weekendHours: { start: "9:00 AM", end: "6:00 PM" },
    },
    materials: [],
    missions: [],
    currentFolder: null,
    };

    // DOM Elements
    const authContainer = document.getElementById("auth-container");
    const setupWizard = document.getElementById("setup-wizard");
    const dashboard = document.getElementById("dashboard");

    // Authentication
    document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
        document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");
        document
        .getElementById(`${tab.dataset.tab}-tab`)
        .classList.add("active");
    });
    });

    document.getElementById("login-btn").addEventListener("click", () => {
    state.currentUser = {
        name: "Demo User",
        email: document.getElementById("login-email").value,
    };
    showSetupWizard();
    });

    document.getElementById("signup-btn").addEventListener("click", () => {
    state.currentUser = {
        name: document.getElementById("signup-name").value,
        email: document.getElementById("signup-email").value,
    };
    showSetupWizard();
    });

    // Setup Wizard Navigation
    function showSetupWizard() {
    authContainer.style.display = "none";
    setupWizard.style.display = "block";
    }

    function generatePlan() {
    // Collect classes
    const classEntries = document.querySelectorAll(
        "#class-entries .class-entry"
    );
    state.classes = Array.from(classEntries)
        .map((entry) => ({
        name: entry.querySelector(".subject-name").value,
        day: entry.querySelector(".subject-day").value,
        time: entry.querySelector(".subject-time").value,
        type: entry.querySelector(".subject-type").value,
        }))
        .filter((cls) => cls.name && cls.day);

    // Collect subjects
    const subjectEntries = document.querySelectorAll(
        "#subject-entries .class-entry"
    );
    state.subjects = Array.from(subjectEntries)
        .map((entry) => ({
        name: entry.querySelector(".course-name").value,
        difficulty: entry.querySelector(".course-difficulty").value,
        targetGrade: entry.querySelector(".course-grade").value,
        priority: entry.querySelector(".course-priority").value,
        }))
        .filter((subj) => subj.name);

    // Collect exams
    const examEntries = document.querySelectorAll(
        "#exam-entries .class-entry"
    );
    state.exams = Array.from(examEntries)
        .map((entry) => ({
        subject: entry.querySelector(".exam-subject").value,
        date: entry.querySelector(".exam-date").value,
        time: entry.querySelector(".exam-time").value,
        coverage: entry.querySelector(".exam-coverage").value,
        }))
        .filter((exam) => exam.subject && exam.date);

    // Collect study settings
    state.studySettings.intensity =
        document.getElementById("intensity-slider").value;
    state.studySettings.maxSessionHours = parseFloat(
        document.getElementById("max-session").value
    );
    state.studySettings.breakMinutes = parseInt(
        document.getElementById("break-time").value
    );

    // Generate initial missions using AI logic
    generateMissions();

    // Show dashboard
    setupWizard.style.display = "none";
    dashboard.style.display = "flex";

    // Initialize dashboard
    initializeDashboard();
    }

    document
    .getElementById("step-1-next")
    .addEventListener("click", generatePlan);

    // Add class/subject/exam entries
    document.getElementById("add-class-btn").addEventListener("click", () => {
    const entries = document.getElementById("class-entries");
    const newEntry = document.createElement("div");
    newEntry.className = "class-entry";
    newEntry.innerHTML = `
            <input type="text" placeholder="Subject name" class="subject-name">
            <select class="subject-day">
                <option value="">Day</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
            </select>
            <input type="text" placeholder="Time (e.g., 9:00 AM)" class="subject-time">
            <select class="subject-type">
                <option value="lecture">Lecture</option>
                <option value="lab">Lab</option>
                <option value="tutorial">Tutorial</option>
            </select>
            <button class="remove-btn" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
    entries.appendChild(newEntry);
    });

    document
    .getElementById("add-subject-btn")
    .addEventListener("click", () => {
        const entries = document.getElementById("subject-entries");
        const newEntry = document.createElement("div");
        newEntry.className = "class-entry";
        newEntry.innerHTML = `
            <input type="text" placeholder="Course name" class="course-name">
            <select class="course-difficulty">
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
            </select>
            <input type="text" placeholder="Target grade" class="course-grade">
            <select class="course-priority">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
            </select>
            <button class="remove-btn" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        entries.appendChild(newEntry);
    });

    document.getElementById("add-exam-btn").addEventListener("click", () => {
    const entries = document.getElementById("exam-entries");
    const newEntry = document.createElement("div");
    newEntry.className = "class-entry";
    newEntry.innerHTML = `
            <input type="text" placeholder="Subject" class="exam-subject">
            <input type="date" class="exam-date">
            <input type="text" placeholder="Time (e.g., 10:00 AM)" class="exam-time">
            <input type="text" placeholder="Coverage" class="exam-coverage">
            <button class="remove-btn" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
    entries.appendChild(newEntry);
    });

    // AI-powered mission generation
    function generateMissions() {
    state.missions = [];

    const today = new Date();
    const upcomingExams = state.exams
        .filter((exam) => {
        const examDate = new Date(exam.date);
        return examDate >= today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    state.subjects.forEach((subject) => {
        const subjectExams = upcomingExams.filter(
        (exam) =>
            exam.subject.toLowerCase().includes(subject.name.toLowerCase()) ||
            subject.name.toLowerCase().includes(exam.subject.toLowerCase())
        );

        let missionCount = 1;

        if (subject.priority === "high") {
        missionCount = 3;
        } else if (subject.priority === "medium") {
        missionCount = 2;
        }

        missionCount = Math.min(
        missionCount + parseInt(state.studySettings.intensity) - 2,
        5
        );

        for (let i = 0; i < missionCount; i++) {
        const mission = {
            id: `${subject.name}-${i}-${Date.now()}`,
            subject: subject.name,
            title: `Review ${subject.name} - ${getTopicForSubject(
            subject.name,
            i
            )}`,
            duration: getStudyDuration(
            subject.difficulty,
            state.studySettings.intensity
            ),
            difficulty: subject.difficulty,
            completed: false,
            dueDate:
            subjectExams.length > 0
                ? new Date(
                    new Date(subjectExams[0].date).getTime() -
                    i * 24 * 60 * 60 * 1000
                )
                : new Date(today.getTime() + i * 2 * 24 * 60 * 60 * 1000),
        };

        state.missions.push(mission);
        }
    });

    state.missions.sort((a, b) => a.dueDate - b.dueDate);
    }

    function getTopicForSubject(subjectName, index) {
    const topics = {
        Math: [
        "Algebra",
        "Calculus",
        "Geometry",
        "Statistics",
        "Trigonometry",
        ],
        Science: [
        "Biology",
        "Chemistry",
        "Physics",
        "Earth Science",
        "Anatomy",
        ],
        History: [
        "Ancient Civilizations",
        "World Wars",
        "Government",
        "Economics",
        "Geography",
        ],
        English: [
        "Grammar",
        "Literature",
        "Writing",
        "Vocabulary",
        "Reading Comprehension",
        ],
        "Computer Science": [
        "Programming",
        "Algorithms",
        "Data Structures",
        "Web Development",
        "Database",
        ],
    };

    for (const [key, value] of Object.entries(topics)) {
        if (subjectName.toLowerCase().includes(key.toLowerCase())) {
        return value[index % value.length];
        }
    }

    return `Topic ${index + 1}`;
    }

    function getStudyDuration(difficulty, intensity) {
    const baseTimes = {
        easy: 30,
        moderate: 45,
        hard: 60,
    };

    let duration = baseTimes[difficulty] || 45;
    duration = duration * (0.5 + intensity * 0.1);

    return Math.round(duration);
    }

    // Initialize Dashboard
    function initializeDashboard() {
    document.getElementById("current-date").textContent =
        new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        });

    document.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", () => {
        document
            .querySelectorAll(".nav-item")
            .forEach((i) => i.classList.remove("active"));
        document
            .querySelectorAll(".content-section")
            .forEach((s) => s.classList.remove("active"));

        item.classList.add("active");
        document
            .getElementById(`${item.dataset.section}-section`)
            .classList.add("active");
        });
    });

    renderTodayMissions();
    renderWeeklySchedule();
    renderSubjects();
    renderExams();
    renderMaterials();

    document
        .getElementById("update-settings")
        .addEventListener("click", updateSettings);

    setupModals();

    document
        .getElementById("add-folder-btn")
        .addEventListener("click", () => {
        populateSubjectDropdowns();
        document.getElementById("add-folder-modal").style.display = "block";
        });

    document
        .getElementById("add-subject-dash-btn")
        .addEventListener("click", () => {
        document.getElementById("add-subject-modal").style.display =
            "block";
        });

    document
        .getElementById("add-exam-dash-btn")
        .addEventListener("click", () => {
        populateSubjectDropdowns();
        document.getElementById("add-exam-modal").style.display = "block";
        });
    }

    // Setup Modal functionality
    function setupModals() {
    const materialsModal = document.getElementById("materials-modal");
    const closeModal = document.getElementById("close-modal");
    const fileUploadArea = document.getElementById("file-upload-area");
    const fileInput = document.getElementById("file-input");

    closeModal.onclick = () => {
        materialsModal.style.display = "none";
    };

    fileUploadArea.onclick = () => {
        fileInput.click();
    };

    fileInput.onchange = (e) => {
        handleFiles(e.target.files);
    };

    fileUploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        fileUploadArea.classList.add("dragover");
    });

    fileUploadArea.addEventListener("dragleave", () => {
        fileUploadArea.classList.remove("dragover");
    });

    fileUploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove("dragover");
        handleFiles(e.dataTransfer.files);
    });

    const addFolderModal = document.getElementById("add-folder-modal");
    const closeFolderModal = document.getElementById("close-folder-modal");

    closeFolderModal.onclick = () => {
        addFolderModal.style.display = "none";
    };

    document.getElementById("create-folder-btn").onclick = createNewFolder;

    const addSubjectModal = document.getElementById("add-subject-modal");
    const closeSubjectModal = document.getElementById(
        "close-subject-modal"
    );

    closeSubjectModal.onclick = () => {
        addSubjectModal.style.display = "none";
    };

    document.getElementById("create-subject-btn").onclick =
        createNewSubject;

    const addExamModal = document.getElementById("add-exam-modal");
    const closeExamModal = document.getElementById("close-exam-modal");

    closeExamModal.onclick = () => {
        addExamModal.style.display = "none";
    };

    document.getElementById("create-exam-btn").onclick = createNewExam;

    window.onclick = (event) => {
        if (event.target.classList.contains("modal")) {
        event.target.style.display = "none";
        }
    };
    }

    // Handle file uploads
    function handleFiles(files) {
    if (!state.currentFolder) return;

    const fileList = document.getElementById("file-list");

    Array.from(files).forEach((file) => {
        if (!state.currentFolder.files) {
        state.currentFolder.files = [];
        }

        const fileObj = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        };

        state.currentFolder.files.push(fileObj);

        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        fileItem.innerHTML = `
        <div class="file-info">
            <i class="fas fa-file-alt"></i>
            <span>${file.name}</span>
            <span style="font-size: 0.875rem; color: var(--soft-black);">(${formatFileSize(
            file.size
            )})</span>
        </div>
        <button class="delete-file" onclick="deleteFile('${file.name}')">
            <i class="fas fa-trash"></i>
        </button>
        `;
        fileList.appendChild(fileItem);
    });

    state.currentFolder.fileCount = state.currentFolder.files.length;
    renderMaterials();
    }

    window.deleteFile = function (fileName) {
    if (!state.currentFolder) return;

    state.currentFolder.files = state.currentFolder.files.filter(
        (f) => f.name !== fileName
    );
    state.currentFolder.fileCount = state.currentFolder.files.length;

    displayFolderFiles(state.currentFolder);
    renderMaterials();
    };

    function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    function displayFolderFiles(folder) {
    const fileList = document.getElementById("file-list");
    fileList.innerHTML = "";

    if (folder.files && folder.files.length > 0) {
        folder.files.forEach((file) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        fileItem.innerHTML = `
            <div class="file-info">
            <i class="fas fa-file-alt"></i>
            <span>${file.name}</span>
            <span style="font-size: 0.875rem; color: var(--soft-black);">(${formatFileSize(
                file.size
            )})</span>
            </div>
            <button class="delete-file" onclick="deleteFile('${file.name}')">
            <i class="fas fa-trash"></i>
            </button>
        `;
        fileList.appendChild(fileItem);
        });
    } else {
        fileList.innerHTML =
        '<p style="text-align: center; color: var(--soft-black);">No files uploaded yet</p>';
    }
    }

    function createNewFolder() {
    const name = document.getElementById("new-folder-name").value;
    const subject = document.getElementById("new-folder-subject").value;

    if (!name || !subject) {
        alert("Please fill in all fields");
        return;
    }

    const newFolder = {
        id: Date.now(),
        name: name,
        subject: subject,
        fileCount: 0,
        files: [],
    };

    state.materials.push(newFolder);
    renderMaterials();

    document.getElementById("add-folder-modal").style.display = "none";
    document.getElementById("new-folder-name").value = "";
    document.getElementById("new-folder-subject").value = "";
    }

    function createNewSubject() {
    const name = document.getElementById("new-subject-name").value;
    const difficulty = document.getElementById(
        "new-subject-difficulty"
    ).value;
    const targetGrade = document.getElementById("new-subject-grade").value;
    const priority = document.getElementById("new-subject-priority").value;

    if (!name || !targetGrade) {
        alert("Please fill in all fields");
        return;
    }

    const newSubject = {
        name: name,
        difficulty: difficulty,
        targetGrade: targetGrade,
        priority: priority,
    };

    state.subjects.push(newSubject);
    generateMissions();
    renderSubjects();
    renderTodayMissions();
    renderWeeklySchedule();

    document.getElementById("add-subject-modal").style.display = "none";
    document.getElementById("new-subject-name").value = "";
    document.getElementById("new-subject-grade").value = "";
    }

    function createNewExam() {
    const subject = document.getElementById("new-exam-subject").value;
    const date = document.getElementById("new-exam-date").value;
    const time = document.getElementById("new-exam-time").value;
    const coverage = document.getElementById("new-exam-coverage").value;

    if (!subject || !date || !time || !coverage) {
        alert("Please fill in all fields");
        return;
    }

    const newExam = {
        subject: subject,
        date: date,
        time: time,
        coverage: coverage,
    };

    state.exams.push(newExam);
    generateMissions();
    renderExams();
    renderTodayMissions();

    document.getElementById("add-exam-modal").style.display = "none";
    document.getElementById("new-exam-subject").value = "";
    document.getElementById("new-exam-date").value = "";
    document.getElementById("new-exam-time").value = "";
    document.getElementById("new-exam-coverage").value = "";
    }

    function populateSubjectDropdowns() {
    const folderSubjectSelect =
        document.getElementById("new-folder-subject");
    const examSubjectSelect = document.getElementById("new-exam-subject");

    const options = state.subjects
        .map((s) => `<option value="${s.name}">${s.name}</option>`)
        .join("");

    folderSubjectSelect.innerHTML =
        '<option value="">Select a subject</option>' + options;
    examSubjectSelect.innerHTML =
        '<option value="">Select a subject</option>' + options;
    }

    // Render Today's Missions
    function renderTodayMissions() {
    const container = document.getElementById("today-missions");
    container.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMissions = state.missions.filter((mission) => {
        const missionDate = new Date(mission.dueDate);
        missionDate.setHours(0, 0, 0, 0);
        return (
        missionDate.getTime() === today.getTime() && !mission.completed
        );
    });

    if (todayMissions.length === 0) {
        container.innerHTML =
        "<p>No missions for today! Enjoy your day off or add more subjects.</p>";
        return;
    }

    todayMissions.forEach((mission) => {
        const missionElement = document.createElement("div");
        missionElement.className = "mission-item";
        missionElement.innerHTML = `
                <div class="mission-checkbox">
                    <input type="checkbox" ${
                        mission.completed ? "checked" : ""
                    } data-id="${mission.id}">
                </div>
                <div class="mission-details">
                    <div class="mission-title">${mission.title}</div>
                    <div class="mission-meta">
                        <span><i class="fas fa-clock"></i> ${
                            mission.duration
                        } min</span>
                        <span class="difficulty-${
                            mission.difficulty
                        }"><i class="fas fa-signal"></i> ${
        mission.difficulty.charAt(0).toUpperCase() +
        mission.difficulty.slice(1)
        }</span>
                        <span><i class="fas fa-book"></i> ${
                            mission.subject
                        }</span>
                    </div>
                </div>
            `;
        container.appendChild(missionElement);
    });

    document
        .querySelectorAll('#today-missions input[type="checkbox"]')
        .forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
            const missionId = e.target.dataset.id;
            const mission = state.missions.find((m) => m.id === missionId);
            if (mission) {
            mission.completed = e.target.checked;
            renderTodayMissions();
            }
        });
        });
    }

    // Render Weekly Schedule
    function renderWeeklySchedule() {
    const container = document.getElementById("weekly-schedule");
    container.innerHTML = "";

    const days = [
        { name: "Monday", icon: "fas fa-sun" },
        { name: "Tuesday", icon: "fas fa-cloud" },
        { name: "Wednesday", icon: "fas fa-sun" },
        { name: "Thursday", icon: "fas fa-cloud" },
        { name: "Friday", icon: "fas fa-sun" },
        { name: "Saturday", icon: "fas fa-star" },
        { name: "Sunday", icon: "fas fa-heart" },
    ];

    days.forEach((day) => {
        const dayElement = document.createElement("div");
        dayElement.className = "schedule-day";

        const dayHeader = document.createElement("div");
        dayHeader.className = "day-header";
        dayHeader.innerHTML = `<i class="${day.icon}"></i> ${day.name}`;
        dayElement.appendChild(dayHeader);

        const dayClasses = state.classes.filter(
        (cls) => cls.day.toLowerCase() === day.name.toLowerCase()
        );
        dayClasses.forEach((cls) => {
        const classElement = document.createElement("div");
        classElement.className = "schedule-item";
        classElement.innerHTML = `
                    <div class="schedule-time">${cls.time}</div>
                    <div>${cls.name} (${cls.type})</div>
                `;
        dayElement.appendChild(classElement);
        });

        const studySessions = generateStudySessionsForDay(day.name);
        studySessions.forEach((session) => {
        const sessionElement = document.createElement("div");
        sessionElement.className = "schedule-item";
        sessionElement.style.backgroundColor = "var(--light-rose)";
        sessionElement.innerHTML = `
                    <div class="schedule-time">${session.time}</div>
                    <div>Study: ${session.subject}</div>
                `;
        dayElement.appendChild(sessionElement);
        });

        container.appendChild(dayElement);
    });
    }

    function generateStudySessionsForDay(day) {
    const sessions = [];
    const dayIndex = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ].indexOf(day.toLowerCase());

    if (dayIndex < 5) {
        const sessionCount = Math.min(
        parseInt(state.studySettings.intensity),
        2
        );

        for (let i = 0; i < sessionCount; i++) {
        const sessionHour = 18 + i * 2;
        if (sessionHour < 22) {
            sessions.push({
            time: `${sessionHour % 12 || 12}:00 ${
                sessionHour < 12 ? "AM" : "PM"
            }`,
            subject: getSubjectForDay(dayIndex, i),
            });
        }
        }
    } else {
        const sessionCount = Math.min(
        parseInt(state.studySettings.intensity) + 1,
        4
        );

        for (let i = 0; i < sessionCount; i++) {
        const sessionHour = 9 + i * 2;
        if (sessionHour < 18) {
            sessions.push({
            time: `${sessionHour % 12 || 12}:00 ${
                sessionHour < 12 ? "AM" : "PM"
            }`,
            subject: getSubjectForDay(dayIndex, i),
            });
        }
        }
    }

    return sessions;
    }

    function getSubjectForDay(dayIndex, sessionIndex) {
    if (state.subjects.length === 0) return "General Review";

    const subjectIndex = (dayIndex + sessionIndex) % state.subjects.length;
    return state.subjects[subjectIndex].name;
    }

    // Render Subjects
    function renderSubjects() {
    const container = document.getElementById("subjects-list");
    container.innerHTML = "";

    if (state.subjects.length === 0) {
        container.innerHTML =
        "<p>No subjects added yet. Add your subjects to get started!</p>";
        return;
    }

    state.subjects.forEach((subject) => {
        const subjectElement = document.createElement("div");
        subjectElement.className = "mission-item";
        subjectElement.innerHTML = `
                <div class="mission-details">
                    <div class="mission-title">${subject.name}</div>
                    <div class="mission-meta">
                        <span class="difficulty-${
                            subject.difficulty
                        }"><i class="fas fa-signal"></i> ${
        subject.difficulty.charAt(0).toUpperCase() +
        subject.difficulty.slice(1)
        }</span>
                        <span><i class="fas fa-bullseye"></i> Target: ${
                            subject.targetGrade
                        }</span>
                        <span class="priority-${
                            subject.priority
                        }"><i class="fas fa-flag"></i> ${
        subject.priority.charAt(0).toUpperCase() + subject.priority.slice(1)
        } Priority</span>
                    </div>
                </div>
            `;
        container.appendChild(subjectElement);
    });
    }

    // Render Exams
    function renderExams() {
    const container = document.getElementById("exams-list");
    container.innerHTML = "";

    if (state.exams.length === 0) {
        container.innerHTML =
        "<p>No exams added yet. Add your exams to prioritize your study!</p>";
        return;
    }

    const sortedExams = [...state.exams].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    sortedExams.forEach((exam) => {
        const examDate = new Date(exam.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysUntil = Math.ceil(
        (examDate - today) / (1000 * 60 * 60 * 24)
        );

        const examElement = document.createElement("div");
        examElement.className = "mission-item";
        examElement.innerHTML = `
                <div class="mission-details">
                    <div class="mission-title">${exam.subject} Exam</div>
                    <div class="mission-meta">
                        <span><i class="fas fa-calendar"></i> ${examDate.toLocaleDateString()}</span>
                        <span><i class="fas fa-clock"></i> ${
                            exam.time
                        }</span>
                        <span><i class="fas fa-book-open"></i> ${
                            exam.coverage
                        }</span>
                        <span>${daysUntil} day${
        daysUntil !== 1 ? "s" : ""
        } until exam</span>
                    </div>
                </div>
            `;
        container.appendChild(examElement);
    });
    }

    // Render Materials
    function renderMaterials() {
    const container = document.getElementById("materials-grid");
    container.innerHTML = "";

    if (state.materials.length === 0) {
        state.materials = [
        {
            id: 1,
            name: "Math Notes",
            subject: "Math",
            fileCount: 0,
            files: [],
        },
        {
            id: 2,
            name: "Science Labs",
            subject: "Science",
            fileCount: 0,
            files: [],
        },
        {
            id: 3,
            name: "History Essays",
            subject: "History",
            fileCount: 0,
            files: [],
        },
        {
            id: 4,
            name: "English Literature",
            subject: "English",
            fileCount: 0,
            files: [],
        },
        ];
    }

    state.materials.forEach((material) => {
        const materialElement = document.createElement("div");
        materialElement.className = "folder-item";
        materialElement.innerHTML = `
                <div class="folder-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="folder-name">${material.name}</div>
                <div class="folder-subject">${material.subject}</div>
                <div class="folder-count">${material.fileCount} file${
        material.fileCount !== 1 ? "s" : ""
        }</div>
            `;

        materialElement.onclick = () => openFolder(material);

        container.appendChild(materialElement);
    });
    }

    function openFolder(folder) {
    state.currentFolder = folder;
    document.getElementById("folder-title").textContent = folder.name;
    document.getElementById("file-input").value = "";

    displayFolderFiles(folder);

    document.getElementById("materials-modal").style.display = "block";
    }

    // Update Settings
    function updateSettings() {
    state.studySettings.intensity =
        document.getElementById("study-intensity").value;
    state.studySettings.maxSessionHours = parseFloat(
        document.getElementById("max-study-session").value
    );
    state.studySettings.breakMinutes = parseInt(
        document.getElementById("desired-break").value
    );

    generateMissions();
    renderTodayMissions();
    renderWeeklySchedule();

    alert("Settings updated! Your study plan has been optimized.");
    }

    // Initialize with demo data
    window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-email").value = "demo@studyquest.com";
    document.getElementById("login-password").value = "password";

    document.getElementById("signup-name").value = "Demo User";
    document.getElementById("signup-email").value = "demo@studyquest.com";
    document.getElementById("signup-password").value = "password";
    document.getElementById("signup-confirm").value = "password";
    });