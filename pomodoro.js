// Initialize application when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    initBackgroundAnimation();
    setupEventListeners();
    
    // Set current date and user
    document.querySelectorAll('.update-date').forEach(el => {
        el.textContent = "2025-05-19 08:58:18";
    });
    
    document.querySelectorAll('.username').forEach(el => {
        el.textContent = "chetan-lab7";
    });
    
    // Load saved data and theme preference
    loadData();
    loadThemePreference();
});

// Initialize app state
function initApp() {
    window.appState = {
        pomodoro: {
            duration: 25 * 60, // 25 minutes in seconds
            timeLeft: 25 * 60,
            isRunning: false,
            interval: null,
            sessions: 0,
            mode: 'focus'
        }
    };
}

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
    
    // Pomodoro timer
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const timerModes = document.querySelectorAll('.timer-mode');
    const setCustomTimeBtn = document.getElementById('set-custom-time');
    
    if (startTimerBtn) startTimerBtn.addEventListener('click', startTimer);
    if (pauseTimerBtn) pauseTimerBtn.addEventListener('click', pauseTimer);
    if (resetTimerBtn) resetTimerBtn.addEventListener('click', resetTimer);
    if (setCustomTimeBtn) setCustomTimeBtn.addEventListener('click', setCustomTime);
    
    timerModes.forEach(mode => {
        mode.addEventListener('click', function() {
            setTimerMode(this.dataset.mode, parseInt(this.dataset.minutes));
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Only process if not in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // Space - Start/Pause Timer
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (window.appState.pomodoro.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
    
    // R - Reset Timer
    if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetTimer();
    }
    
    // 1 - Focus Mode
    if (e.key === '1') {
        e.preventDefault();
        setTimerMode('focus', 25);
    }
    
    // 2 - Short Break
    if (e.key === '2') {
        e.preventDefault();
        setTimerMode('short-break', 5);
    }
    
    // 3 - Long Break
    if (e.key === '3') {
        e.preventDefault();
        setTimerMode('long-break', 15);
    }
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

// Show notification
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationContent = notification.querySelector('.notification-content');
    
    if (!notification || !notificationMessage) return;
    
    // Set message and icon
    notificationMessage.textContent = message;
    
    if (isError) {
        notificationContent.classList.add('error');
        notification.querySelector('.notification-icon').className = 'notification-icon fas fa-exclamation-circle';
    } else {
        notificationContent.classList.remove('error');
        notification.querySelector('.notification-icon').className = 'notification-icon fas fa-check-circle';
    }
    
    // Show notification
    notification.classList.add('active');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// Save data to local storage
function saveData() {
    if (!window.appState) return;
    localStorage.setItem('pomodoroSessions', window.appState.pomodoro.sessions);
}

// Load data from local storage
function loadData() {
    try {
        const savedSessions = localStorage.getItem('pomodoroSessions');
        if (savedSessions) {
            window.appState.pomodoro.sessions = parseInt(savedSessions) || 0;
            updateSessionCount();
        }
    } catch (e) {
        console.error('Error loading pomodoro sessions:', e);
    }
}

// ===== POMODORO TIMER =====

// Start the Pomodoro timer
function startTimer() {
    if (window.appState.pomodoro.isRunning) return;
    
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    
    window.appState.pomodoro.isRunning = true;
    
    window.appState.pomodoro.interval = setInterval(() => {
        if (window.appState.pomodoro.timeLeft > 0) {
            window.appState.pomodoro.timeLeft--;
            updateTimerDisplay();
        } else {
            completePomodoro();
        }
    }, 1000);
}

// Pause the Pomodoro timer
function pauseTimer() {
    if (!window.appState.pomodoro.isRunning) return;
    
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    
    window.appState.pomodoro.isRunning = false;
    clearInterval(window.appState.pomodoro.interval);
}

// Reset the Pomodoro timer
function resetTimer() {
    pauseTimer();
    
    // Reset to current mode's duration
    window.appState.pomodoro.timeLeft = window.appState.pomodoro.duration;
    updateTimerDisplay();
    showNotification('Timer reset');
}

// Set timer mode
function setTimerMode(mode, minutes) {
    pauseTimer();
    
    // Update active mode button
    document.querySelectorAll('.timer-mode').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.timer-mode[data-mode="${mode}"]`).classList.add('active');
    
    // Set timer duration
    window.appState.pomodoro.mode = mode;
    window.appState.pomodoro.duration = minutes * 60;
    window.appState.pomodoro.timeLeft = minutes * 60;
    
    // Update timer display and color
    updateTimerDisplay();
    updateTimerColor(mode);
    
    showNotification(`${mode.replace('-', ' ')} mode - ${minutes} minutes`);
}

// Set custom time for the Pomodoro timer
function setCustomTime() {
    const customMinutesInput = document.getElementById('custom-minutes');
    let minutes = parseInt(customMinutesInput.value) || 25;
    
    // Validate input (between 1 and 60 minutes)
    minutes = Math.min(Math.max(minutes, 1), 60);
    customMinutesInput.value = minutes;
    
    // Deactivate mode buttons
    document.querySelectorAll('.timer-mode').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Set custom mode
    window.appState.pomodoro.mode = 'custom';
    window.appState.pomodoro.duration = minutes * 60;
    window.appState.pomodoro.timeLeft = minutes * 60;
    
    updateTimerDisplay();
    updateTimerColor('custom');
    
    showNotification(`Custom timer set to ${minutes} minutes`);
}

// Update the timer display
function updateTimerDisplay() {
    const timerText = document.getElementById('timer-text');
    const timerProgress = document.getElementById('timer-progress');
    
    if (!timerText || !timerProgress || !window.appState.pomodoro) return;
    
    // Format time as MM:SS
    const minutes = Math.floor(window.appState.pomodoro.timeLeft / 60);
    const seconds = window.appState.pomodoro.timeLeft % 60;
    
    timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress circle
    const progressPercentage = (1 - window.appState.pomodoro.timeLeft / window.appState.pomodoro.duration) * 100;
    timerProgress.style.background = `conic-gradient(var(--pomodoro-focus) ${progressPercentage}%, transparent ${progressPercentage}%)`;
}

// Update timer color based on mode
function updateTimerColor(mode) {
    if (mode === 'focus') {
        document.documentElement.style.setProperty('--pomodoro-focus', '#6c5ce7');
    } else if (mode === 'short-break') {
        document.documentElement.style.setProperty('--pomodoro-focus', '#1dd1a1');
    } else if (mode === 'long-break') {
        document.documentElement.style.setProperty('--pomodoro-focus', '#54a0ff');
    } else {
        document.documentElement.style.setProperty('--pomodoro-focus', '#ff9f43');
    }
}

// Complete a Pomodoro session
function completePomodoro() {
    pauseTimer();
    
    // Play notification sound
    try {
        const audio = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
        audio.play();
    } catch (e) {
        console.error('Error playing sound:', e);
    }
    
    // Increment session count if it was a focus session
    if (window.appState.pomodoro.mode === 'focus') {
        window.appState.pomodoro.sessions++;
        updateSessionCount();
        saveData();
    }
    
    // Show notification based on completed mode
    if (window.appState.pomodoro.mode === 'focus') {
        showNotification('Focus session completed! Take a break.', false);
    } else if (window.appState.pomodoro.mode === 'short-break') {
        showNotification('Break over! Ready to focus again?', false);
    } else if (window.appState.pomodoro.mode === 'long-break') {
        showNotification('Long break completed! Ready for the next session?', false);
    } else {
        showNotification('Timer completed!', false);
    }
    
    // Reset timer
    resetTimer();
}

// Update session count display
function updateSessionCount() {
    const sessionCount = document.getElementById('session-count');
    if (sessionCount) {
        sessionCount.textContent = window.appState.pomodoro.sessions.toString();
    }
}

// Initialize the app when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Set correct date and user information
        document.querySelectorAll('.update-date').forEach(el => {
            el.textContent = "2025-05-19 09:16:39";
        });
        
        document.querySelectorAll('.username').forEach(el => {
            el.textContent = "chetan-lab7";
        });
    });
} else {
    // Set correct date and user information
    document.querySelectorAll('.update-date').forEach(el => {
        el.textContent = "2025-05-19 09:16:39";
    });
    
    document.querySelectorAll('.username').forEach(el => {
        el.textContent = "chetan-lab7";
    });
}