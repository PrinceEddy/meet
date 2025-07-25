// Global variables
let stories = JSON.parse(localStorage.getItem('stories')) || [];
let currentEditingStory = null;

// Authentication credentials (embedded in code as requested)
const EDITOR_CREDENTIALS = {
    username: 'Comm',
    password: 'Comm@25'
};

const ADMIN_CREDENTIALS = {
    username: 'Admin',
    password: 'Ad@25'
};

// DOM elements
const reporterBtn = document.getElementById('reporterBtn');
const editorBtn = document.getElementById('editorBtn'); 
const adminBtn = document.getElementById('adminBtn');
const sections = {
    reporter: document.getElementById('reporterSection'),
    editor: document.getElementById('editorSection'),
    admin: document.getElementById('adminSection')
};

// Tab elements
const writeStoryTab = document.getElementById('writeStoryTab');
const myStoriesTab = document.getElementById('myStoriesTab');
const writeStoryContent = document.getElementById('writeStoryContent');
const myStoriesContent = document.getElementById('myStoriesContent');

// Form elements
const storyForm = document.getElementById('storyForm');
const editStoryForm = document.getElementById('editStoryForm');
const editModal = document.getElementById('editModal');
const closeModal = document.querySelector('.close');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    showSection('reporter');
    displayReporterStories();
    displayEditorStories();
    displayAdminStories();
});

function initializeEventListeners() {
    // Navigation buttons
    reporterBtn.addEventListener('click', () => showSection('reporter'));
    editorBtn.addEventListener('click', () => showSection('editor'));
    adminBtn.addEventListener('click', () => showSection('admin'));

    // Reporter tabs
    writeStoryTab.addEventListener('click', () => showTab('writeStory'));
    myStoriesTab.addEventListener('click', () => showTab('myStories'));

    // Forms
    storyForm.addEventListener('submit', handleStorySubmission);
    editStoryForm.addEventListener('submit', handleStoryEdit);

    // Image preview
    document.getElementById('storyImage').addEventListener('change', handleImagePreview);
    document.getElementById('editStoryImage').addEventListener('change', handleEditImagePreview);

    // Modal
    closeModal.addEventListener('click', closeEditModal);
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

function showSection(sectionName) {
    // Hide all sections
    Object.values(sections).forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    sections[sectionName].classList.add('active');

    // Add active class to corresponding button
    if (sectionName === 'reporter') reporterBtn.classList.add('active');
    else if (sectionName === 'editor') editorBtn.classList.add('active');
    else if (sectionName === 'admin') adminBtn.classList.add('active');

    // Reset editor/admin login if switching sections
    if (sectionName === 'editor') {
        document.getElementById('editorLogin').style.display = 'block';
        document.getElementById('editorContent').style.display = 'none';
        document.getElementById('editorUsername').value = '';
        document.getElementById('editorPassword').value = '';
    }
    if (sectionName === 'admin') {
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminContent').style.display = 'none';
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
    }
}

function showTab(tabName) {
    // Remove active class from tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected tab
    if (tabName === 'writeStory') {
        writeStoryTab.classList.add('active');
        writeStoryContent.classList.add('active');
    } else if (tabName === 'myStories') {
        myStoriesTab.classList.add('active');
        myStoriesContent.classList.add('active');
        displayReporterStories();
    }
}

function handleStorySubmission(e) {
    e.preventDefault();

    const reporterName = document.getElementById('reporterName').value;
    const storyTitle = document.getElementById('storyTitle').value;
    const storyContent = document.getElementById('storyContent').value;
    const storyImage = document.getElementById('storyImage').files[0];

    let imageData = null;
    if (storyImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            saveStory();
        };
        reader.readAsDataURL(storyImage);
    } else {
        saveStory();
    }

    function saveStory() {
        const story = {
            id: Date.now(),
            reporterName,
            title: storyTitle,
            content: storyContent,
            image: imageData,
            status: 'pending',
            submissionDate: new Date().toLocaleDateString(),
            submissionTime: new Date().toLocaleTimeString()
        };

        stories.push(story);
        localStorage.setItem('stories', JSON.stringify(stories));

        // Reset form
        storyForm.reset();
        document.getElementById('imagePreview').innerHTML = '';

        showMessage('Story submitted successfully!', 'success');
        displayReporterStories();
        displayEditorStories();
        displayAdminStories();
    }
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

function handleEditImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('editImagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function displayReporterStories() {
    const container = document.getElementById('reporterStories');
    const reporterStories = stories.filter(story => story.reporterName);

    if (reporterStories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No stories submitted yet.</p>';
        return;
    }

    container.innerHTML = reporterStories.map(story => `
        <div class="story-card ${story.status}">
            <div class="story-header">
                <div>
                    <div class="story-title">${story.title}</div>
                    <div class="story-meta">By ${story.reporterName} • ${story.submissionDate} at ${story.submissionTime}</div>
                </div>
                <span class="status-indicator status-${story.status}">${story.status}</span>
            </div>
            <div class="story-content">${story.content.substring(0, 200)}${story.content.length > 200 ? '...' : ''}</div>
            ${story.image ? `<img src="${story.image}" alt="Story image" class="story-image">` : ''}
            <div class="story-actions">
                <button class="action-btn edit-btn" onclick="openEditModal(${story.id})">Edit</button>
            </div>
        </div>
    `).join('');
}

function displayEditorStories() {
    const container = document.getElementById('editorStories');
    
    if (stories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No stories to review.</p>';
        return;
    }

    container.innerHTML = stories.map(story => `
        <div class="story-card ${story.status}">
            <div class="story-header">
                <div>
                    <div class="story-title">${story.title}</div>
                    <div class="story-meta">By ${story.reporterName} • ${story.submissionDate} at ${story.submissionTime}</div>
                </div>
                <span class="status-indicator status-${story.status}">${story.status}</span>
            </div>
            <div class="story-content">${story.content}</div>
            ${story.image ? `<img src="${story.image}" alt="Story image" class="story-image">` : ''}
            <div class="story-actions">
                <button class="action-btn edit-btn" onclick="openEditModal(${story.id})">Edit</button>
                <button class="action-btn approve-btn" onclick="approveStory(${story.id})">Approve</button>
                <button class="action-btn reject-btn" onclick="rejectStory(${story.id})">Reject</button>
            </div>
        </div>
    `).join('');
}

function displayAdminStories() {
    const container = document.getElementById('adminStories');
    
    if (stories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No stories in the system.</p>';
        return;
    }

    container.innerHTML = stories.map(story => `
        <div class="story-card ${story.status}">
            <div class="story-header">
                <div>
                    <div class="story-title">${story.title}</div>
                    <div class="story-meta">By ${story.reporterName} • ${story.submissionDate} at ${story.submissionTime}</div>
                </div>
                <span class="status-indicator status-${story.status}">${story.status}</span>
            </div>
            <div class="story-content">${story.content}</div>
            ${story.image ? `<img src="${story.image}" alt="Story image" class="story-image">` : ''}
            <div class="story-actions">
                <button class="action-btn edit-btn" onclick="openEditModal(${story.id})">Edit</button>
                <button class="action-btn approve-btn" onclick="approveStory(${story.id})">Approve</button>
                <button class="action-btn reject-btn" onclick="rejectStory(${story.id})">Reject</button>
                <button class="action-btn danger-btn" onclick="deleteStory(${story.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function openEditModal(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    currentEditingStory = storyId;
    
    document.getElementById('editReporterName').value = story.reporterName;
    document.getElementById('editStoryTitle').value = story.title;
    document.getElementById('editStoryContent').value = story.content;
    
    const editImagePreview = document.getElementById('editImagePreview');
    if (story.image) {
        editImagePreview.innerHTML = `<img src="${story.image}" alt="Current image">`;
    } else {
        editImagePreview.innerHTML = '';
    }
    
    editModal.style.display = 'block';
}

function closeEditModal() {
    editModal.style.display = 'none';
    currentEditingStory = null;
    editStoryForm.reset();
    document.getElementById('editImagePreview').innerHTML = '';
}

function handleStoryEdit(e) {
    e.preventDefault();
    
    if (!currentEditingStory) return;
    
    const storyIndex = stories.findIndex(s => s.id === currentEditingStory);
    if (storyIndex === -1) return;

    const reporterName = document.getElementById('editReporterName').value;
    const storyTitle = document.getElementById('editStoryTitle').value;
    const storyContent = document.getElementById('editStoryContent').value;
    const storyImage = document.getElementById('editStoryImage').files[0];

    function updateStory(imageData = null) {
        stories[storyIndex] = {
            ...stories[storyIndex],
            reporterName,
            title: storyTitle,
            content: storyContent,
            image: imageData || stories[storyIndex].image,
            status: 'pending' // Reset status to pending after edit
        };

        localStorage.setItem('stories', JSON.stringify(stories));
        
        closeEditModal();
        showMessage('Story updated successfully!', 'success');
        
        // Refresh all displays
        displayReporterStories();
        displayEditorStories();
        displayAdminStories();
    }

    if (storyImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            updateStory(e.target.result);
        };
        reader.readAsDataURL(storyImage);
    } else {
        updateStory();
    }
}

function approveStory(storyId) {
    const storyIndex = stories.findIndex(s => s.id === storyId);
    if (storyIndex !== -1) {
        stories[storyIndex].status = 'approved';
        localStorage.setItem('stories', JSON.stringify(stories));
        
        showMessage('Story approved!', 'success');
        displayReporterStories();
        displayEditorStories();
        displayAdminStories();
    }
}

function rejectStory(storyId) {
    const storyIndex = stories.findIndex(s => s.id === storyId);
    if (storyIndex !== -1) {
        stories[storyIndex].status = 'rejected';
        localStorage.setItem('stories', JSON.stringify(stories));
        
        showMessage('Story rejected!', 'error');
        displayReporterStories();
        displayEditorStories();
        displayAdminStories();
    }
}

function deleteStory(storyId) {
    if (confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
        stories = stories.filter(s => s.id !== storyId);
        localStorage.setItem('stories', JSON.stringify(stories));
        
        showMessage('Story deleted!', 'error');
        displayReporterStories();
        displayEditorStories();
        displayAdminStories();
    }
}

function clearAllStories() {
    if (confirm('Are you sure you want to delete ALL stories? This action cannot be undone.')) {
        stories = [];
        localStorage.setItem('stories', JSON.stringify(stories));
        
        showMessage('All stories cleared!', 'error');
        displayReporterStories();
        displayEditorStories();
        displayAdminStories();
    }
}

function editorAuth() {
    const username = document.getElementById('editorUsername').value;
    const password = document.getElementById('editorPassword').value;
    
    if (username === EDITOR_CREDENTIALS.username && password === EDITOR_CREDENTIALS.password) {
        document.getElementById('editorLogin').style.display = 'none';
        document.getElementById('editorContent').style.display = 'block';
        displayEditorStories();
        showMessage('Editor login successful!', 'success');
    } else {
        showMessage('Invalid credentials!', 'error');
    }
}

function adminAuth() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        displayAdminStories();
        showMessage('Admin login successful!', 'success');
    } else {
        showMessage('Invalid credentials!', 'error');
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the active section
    const activeSection = document.querySelector('.section.active');
    activeSection.insertBefore(messageDiv, activeSection.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
