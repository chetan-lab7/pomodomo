// Initialize application when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initBackgroundAnimation();
    setupEventListeners();
    
    // Set current date and user
    document.querySelectorAll('.update-date').forEach(el => {
        el.textContent = "2025-05-19 08:58:18";
    });
    
    document.querySelectorAll('.username').forEach(el => {
        el.textContent = "chetan-lab7";
    });
    
    // Load theme preference
    loadThemePreference();
});

// Create background animation
function initBackgroundAnimation() {
    const bg = document.getElementById('background-animation');
    if (!bg) return;
    
    const icons = ['⏰', '⌛', '📊', '🎯', '✓', '📅', '⏱️', '💡', '🔔', '📝', '📒', '⚡', '🧠'];
    const particleCount = window.innerWidth < 600 ? 10 : 20;
    
    bg.innerHTML = '';
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'game-particle';
        particle.textContent = icons[Math.floor(Math.random() * icons.length)];
        particle.style.fontSize = `${Math.random() * 20 + 10}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation
        const duration = Math.random() * 60 + 30;
        particle.style.animation = `floating ${duration}s infinite`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        
        bg.appendChild(particle);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const themeToggleLink = document.querySelector('.theme-toggle-link');
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (themeToggleLink) themeToggleLink.addEventListener('click', function(e) {
        e.preventDefault();
        toggleTheme();
    });
}

// Toggle theme between light and dark
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-toggle i');
    
    if (body.classList.contains('light-theme')) {
        // Switch to dark theme
        body.classList.remove('light-theme');
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    } else {
        // Switch to light theme
        body.classList.add('light-theme');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    }
}

// Load theme preference from local storage
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
}