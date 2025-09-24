// Mock Data - Based on provided application data
const mockData = {
  airQualityStations: [
    {
      id: 1,
      name: "Chennai Central",
      lat: 13.0827,
      lng: 80.2707,
      o3: 42.5,
      no2: 28.3,
      aqi: 78,
      status: "moderate"
    },
    {
      id: 2,
      name: "Delhi Connaught Place",
      lat: 28.6139,
      lng: 77.2090,
      o3: 65.2,
      no2: 45.8,
      aqi: 156,
      status: "unhealthy"
    },
    {
      id: 3,
      name: "Mumbai Bandra",
      lat: 19.0760,
      lng: 72.8777,
      o3: 38.7,
      no2: 32.1,
      aqi: 89,
      status: "moderate"
    },
    {
      id: 4,
      name: "Bangalore Whitefield",
      lat: 12.9716,
      lng: 77.7946,
      o3: 35.2,
      no2: 24.6,
      aqi: 72,
      status: "good"
    }
  ],
  forecastData: [
    {"time": "2025-09-24T00:00:00Z", "o3": 45.2, "no2": 29.8, "confidence": 0.89},
    {"time": "2025-09-24T06:00:00Z", "o3": 52.1, "no2": 34.2, "confidence": 0.85},
    {"time": "2025-09-24T12:00:00Z", "o3": 67.3, "no2": 41.5, "confidence": 0.82},
    {"time": "2025-09-24T18:00:00Z", "o3": 58.9, "no2": 37.8, "confidence": 0.87}
  ],
  historicalData: [
    {"date": "2025-09-20", "o3": 41.2, "no2": 27.5},
    {"date": "2025-09-21", "o3": 44.8, "no2": 31.2},
    {"date": "2025-09-22", "o3": 47.3, "no2": 33.8},
    {"date": "2025-09-23", "o3": 42.5, "no2": 28.3}
  ],
  modelMetrics: {
    convlstm: {"accuracy": 0.87, "rmse": 3.42, "mae": 2.18},
    transformer: {"accuracy": 0.91, "rmse": 2.89, "mae": 1.94}
  },
  chatResponses: [
    {
      query: "current air quality",
      response: "Current O₃ levels are moderate at 42.5 µg/m³. NO₂ is at 28.3 µg/m³. Overall AQI is 78 (Moderate). Consider limiting outdoor activities during peak hours."
    },
    {
      query: "tomorrow forecast",
      response: "Tomorrow's forecast shows O₃ peaking at 67.3 µg/m³ around noon with 82% confidence. NO₂ will reach 41.5 µg/m³. Plan indoor activities during midday hours."
    },
    {
      query: "model accuracy",
      response: "Our Transformer model achieves 91% accuracy with RMSE of 2.89. The ConvLSTM model shows 87% accuracy. Both models use Sentinel-5P satellite data for enhanced precision."
    },
    {
      query: "sentinel data",
      response: "We integrate real-time data from the Sentinel-5P TROPOMI sensor, providing high-resolution atmospheric composition measurements. This satellite data is combined with ERA5 meteorological data for comprehensive forecasting."
    }
  ]
};

// Application State
let currentUser = null;
let currentTheme = 'system';
let map = null;
let forecastChart = null;
let historicalChart = null;
let selectedLocation = mockData.airQualityStations[0];

// Wait for DOM to be fully loaded before getting elements
let elements = {};

function initializeElements() {
  elements = {
    themeToggle: document.getElementById('theme-toggle'),
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    dashboardBtn: document.getElementById('dashboard-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    getStartedBtn: document.getElementById('get-started-btn'),
    learnMoreBtn: document.getElementById('learn-more-btn'),
    authModal: document.getElementById('auth-modal'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    switchToRegister: document.getElementById('switch-to-register'),
    switchToLogin: document.getElementById('switch-to-login'),
    landingPage: document.getElementById('landing-page'),
    dashboard: document.getElementById('dashboard'),
    settingsPanel: document.getElementById('settings-panel'),
    settingsBtn: document.getElementById('settings-btn'),
    locationSelect: document.getElementById('location-select'),
    modelSelect: document.getElementById('model-select'),
    chatbotToggle: document.getElementById('chatbot-toggle'),
    chatbotWindow: document.getElementById('chatbot-window'),
    chatbotClose: document.getElementById('chatbot-close'),
    chatbotInput: document.getElementById('chatbot-input-field'),
    chatbotSend: document.getElementById('chatbot-send'),
    chatbotMessages: document.getElementById('chatbot-messages'),
    toastContainer: document.getElementById('toast-container'),
    loadingSpinner: document.getElementById('loading-spinner')
  };
}

// Utility Functions
function showElement(element) {
  if (element) {
    element.classList.remove('hidden');
  }
}

function hideElement(element) {
  if (element) {
    element.classList.add('hidden');
  }
}

function toggleElement(element) {
  if (element) {
    element.classList.toggle('hidden');
  }
}

function showLoading() {
  showElement(elements.loadingSpinner);
}

function hideLoading() {
  hideElement(elements.loadingSpinner);
}

function showToast(message, type = 'info') {
  if (!elements.toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Theme Management
function initTheme() {
  const savedTheme = 'system'; // Default to system for sandbox environment
  setTheme(savedTheme);
}

function setTheme(theme) {
  currentTheme = theme;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-color-scheme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-color-scheme', theme);
  }
  
  updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
  if (!elements.themeToggle) return;
  
  const isDark = document.documentElement.getAttribute('data-color-scheme') === 'dark';
  const sunIcon = elements.themeToggle.querySelector('.sun-icon');
  const moonIcon = elements.themeToggle.querySelector('.moon-icon');
  
  if (sunIcon && moonIcon) {
    if (isDark) {
      hideElement(sunIcon);
      showElement(moonIcon);
    } else {
      showElement(sunIcon);
      hideElement(moonIcon);
    }
  }
}

function toggleTheme() {
  const currentScheme = document.documentElement.getAttribute('data-color-scheme');
  const newTheme = currentScheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  showToast(`Switched to ${newTheme} theme`, 'success');
}

// Modal Management
function showModal(modal) {
  if (!modal) return;
  
  // Hide all other modals first
  hideAllModals();
  showElement(modal);
  
  // Focus trap for accessibility
  modal.focus();
}

function hideAllModals() {
  hideElement(elements.authModal);
  hideElement(elements.settingsPanel);
  hideElement(elements.chatbotWindow);
}

// Authentication
function showAuthModal(formType = 'login') {
  if (!elements.authModal) return;
  
  showModal(elements.authModal);
  
  if (formType === 'login') {
    showElement(elements.loginForm);
    hideElement(elements.registerForm);
  } else {
    hideElement(elements.loginForm);
    showElement(elements.registerForm);
  }
}

function hideAuthModal() {
  hideElement(elements.authModal);
}

function login(email, password) {
  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  showLoading();
  
  // Simulate API call
  setTimeout(() => {
    currentUser = {
      id: 1,
      name: "John Doe",
      email: email
    };
    
    updateAuthState();
    hideAuthModal();
    showDashboard();
    hideLoading();
    showToast('Welcome back! Logged in successfully.', 'success');
  }, 1000);
}

function register(name, email, password) {
  if (!name || !email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  
  showLoading();
  
  // Simulate API call
  setTimeout(() => {
    currentUser = {
      id: 1,
      name: name,
      email: email
    };
    
    updateAuthState();
    hideAuthModal();
    showDashboard();
    hideLoading();
    showToast('Account created successfully! Welcome to AirQ Intelligence.', 'success');
  }, 1000);
}

function logout() {
  currentUser = null;
  updateAuthState();
  showLandingPage();
  showToast('Logged out successfully.', 'info');
}

function updateAuthState() {
  if (currentUser) {
    hideElement(elements.loginBtn);
    hideElement(elements.registerBtn);
    showElement(elements.dashboardBtn);
    showElement(elements.logoutBtn);
  } else {
    showElement(elements.loginBtn);
    showElement(elements.registerBtn);
    hideElement(elements.dashboardBtn);
    hideElement(elements.logoutBtn);
  }
}

// Navigation
function showLandingPage() {
  showElement(elements.landingPage);
  hideElement(elements.dashboard);
  hideAllModals();
}

function showDashboard() {
  hideElement(elements.landingPage);
  showElement(elements.dashboard);
  hideAllModals();
  
  // Initialize dashboard components after a small delay
  setTimeout(() => {
    initDashboard();
  }, 100);
}

// Dashboard Initialization
function initDashboard() {
  initMap();
  initCharts();
  updateOverviewCards();
  populateLocationSelect();
}

function initMap() {
  const mapElement = document.getElementById('air-quality-map');
  if (!mapElement) return;
  
  if (map) {
    map.remove();
    map = null;
  }
  
  try {
    map = L.map('air-quality-map').setView([20.5937, 78.9629], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add air quality stations
    mockData.airQualityStations.forEach(station => {
      const color = getAQIColor(station.status);
      
      const marker = L.circleMarker([station.lat, station.lng], {
        radius: 12,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6
      }).addTo(map);
      
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif;">
          <strong>${station.name}</strong><br>
          O₃: ${station.o3} µg/m³<br>
          NO₂: ${station.no2} µg/m³<br>
          AQI: ${station.aqi} (${station.status})
        </div>
      `);
      
      marker.on('click', () => {
        selectedLocation = station;
        updateDashboardData();
      });
    });
  } catch (error) {
    console.log('Map initialization error:', error);
    // Fallback for map errors
    mapElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; background: var(--color-bg-1); border-radius: var(--radius-base); color: var(--color-text);">Interactive Map Loading...</div>';
  }
}

function getAQIColor(status) {
  const colors = {
    'good': '#00e676',
    'moderate': '#ffab40',
    'unhealthy': '#ff7043',
    'very-unhealthy': '#e57373',
    'hazardous': '#ad1457'
  };
  return colors[status] || colors.moderate;
}

function initCharts() {
  initForecastChart();
  initHistoricalChart();
}

function initForecastChart() {
  const ctx = document.getElementById('forecast-chart');
  if (!ctx) return;
  
  if (forecastChart) {
    forecastChart.destroy();
    forecastChart = null;
  }
  
  try {
    const labels = mockData.forecastData.map(d => {
      const date = new Date(d.time);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });
    
    forecastChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'O₃ (µg/m³)',
            data: mockData.forecastData.map(d => d.o3),
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'NO₂ (µg/m³)',
            data: mockData.forecastData.map(d => d.no2),
            borderColor: '#FFC185',
            backgroundColor: 'rgba(255, 193, 133, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Confidence',
            data: mockData.forecastData.map(d => d.confidence * 100),
            borderColor: '#B4413C',
            backgroundColor: 'rgba(180, 65, 60, 0.1)',
            fill: false,
            yAxisID: 'y1',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: '24-Hour Forecast'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Concentration (µg/m³)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Confidence (%)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
  } catch (error) {
    console.log('Forecast chart error:', error);
  }
}

function initHistoricalChart() {
  const ctx = document.getElementById('historical-chart');
  if (!ctx) return;
  
  if (historicalChart) {
    historicalChart.destroy();
    historicalChart = null;
  }
  
  try {
    const labels = mockData.historicalData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    historicalChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Historical O₃',
            data: mockData.historicalData.map(d => d.o3),
            backgroundColor: '#1FB8CD',
            borderColor: '#1FB8CD',
            borderWidth: 1
          },
          {
            label: 'Historical NO₂',
            data: mockData.historicalData.map(d => d.no2),
            backgroundColor: '#FFC185',
            borderColor: '#FFC185',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Historical Data (Last 4 Days)'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Concentration (µg/m³)'
            }
          }
        }
      }
    });
  } catch (error) {
    console.log('Historical chart error:', error);
  }
}

function updateOverviewCards() {
  const station = selectedLocation;
  
  const o3Element = document.getElementById('current-o3');
  const no2Element = document.getElementById('current-no2');
  const aqiElement = document.getElementById('current-aqi');
  
  if (o3Element) o3Element.textContent = `${station.o3} µg/m³`;
  if (no2Element) no2Element.textContent = `${station.no2} µg/m³`;
  if (aqiElement) aqiElement.textContent = station.aqi;
  
  // Update status indicators
  const statusClasses = {
    'good': 'status--good',
    'moderate': 'status--moderate',
    'unhealthy': 'status--unhealthy'
  };
  
  document.querySelectorAll('.status').forEach((el, index) => {
    el.className = `status ${statusClasses[station.status] || 'status--moderate'}`;
    if (index === 0 || index === 2) {
      el.textContent = station.status.charAt(0).toUpperCase() + station.status.slice(1);
    } else {
      el.textContent = station.no2 < 30 ? 'Good' : 'Moderate';
    }
  });
}

function populateLocationSelect() {
  if (!elements.locationSelect) return;
  
  elements.locationSelect.innerHTML = '<option value="">Select Location</option>';
  
  mockData.airQualityStations.forEach(station => {
    const option = document.createElement('option');
    option.value = station.id;
    option.textContent = station.name;
    elements.locationSelect.appendChild(option);
  });
}

function updateDashboardData() {
  updateOverviewCards();
  showToast(`Updated data for ${selectedLocation.name}`, 'success');
}

// Model Selection
function updateModelMetrics(modelType) {
  const metrics = mockData.modelMetrics[modelType];
  const accuracyElement = document.getElementById('model-accuracy');
  const rmseElement = document.getElementById('model-rmse');
  
  if (accuracyElement) accuracyElement.textContent = `${Math.round(metrics.accuracy * 100)}%`;
  if (rmseElement) rmseElement.textContent = metrics.rmse.toFixed(2);
}

// Chatbot
function initChatbot() {
  if (!elements.chatbotMessages) return;
  
  // Clear existing messages
  elements.chatbotMessages.innerHTML = '';
  
  // Add welcome message
  addBotMessage("Hello! I'm your AI air quality assistant. Ask me about current conditions, forecasts, or air quality data.");
}

function addBotMessage(message) {
  if (!elements.chatbotMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot-message';
  messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
  elements.chatbotMessages.appendChild(messageDiv);
  elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;
}

function addUserMessage(message) {
  if (!elements.chatbotMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user-message';
  messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
  elements.chatbotMessages.appendChild(messageDiv);
  elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;
}

function handleChatbotMessage(userMessage) {
  addUserMessage(userMessage);
  
  // Simple keyword matching for responses
  const lowerMessage = userMessage.toLowerCase();
  let response = "I'm sorry, I don't understand that question. Try asking about current air quality, forecasts, or model accuracy.";
  
  for (const chatResponse of mockData.chatResponses) {
    if (lowerMessage.includes(chatResponse.query)) {
      response = chatResponse.response;
      break;
    }
  }
  
  // Add some context-specific responses
  if (lowerMessage.includes('current') || lowerMessage.includes('now')) {
    response = `Current conditions at ${selectedLocation.name}: O₃ is ${selectedLocation.o3} µg/m³, NO₂ is ${selectedLocation.no2} µg/m³. AQI is ${selectedLocation.aqi} (${selectedLocation.status}).`;
  } else if (lowerMessage.includes('forecast') || lowerMessage.includes('tomorrow')) {
    const nextReading = mockData.forecastData[1];
    response = `Tomorrow's forecast shows O₃ at ${nextReading.o3} µg/m³ and NO₂ at ${nextReading.no2} µg/m³ with ${Math.round(nextReading.confidence * 100)}% confidence.`;
  } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    response = "I can help you with: ✓ Current air quality data ✓ Forecasts and predictions ✓ Model accuracy information ✓ Sentinel-5P satellite data ✓ Air quality explanations";
  }
  
  setTimeout(() => {
    addBotMessage(response);
  }, 1000);
}

// Password Strength Checker
function checkPasswordStrength(password) {
  let strength = 0;
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');
  
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  
  if (strengthBar) {
    strengthBar.style.setProperty('--strength-width', `${strength}%`);
    const color = strength < 50 ? '#ff5252' : strength < 75 ? '#ff9800' : '#4caf50';
    strengthBar.style.setProperty('--strength-color', color);
  }
  
  if (strengthText) {
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    strengthText.textContent = labels[Math.floor(strength / 25)] || 'Weak';
  }
}

// Event Listeners
function initEventListeners() {
  // Theme toggle
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleTheme();
    });
  }
  
  // Navigation buttons
  if (elements.loginBtn) {
    elements.loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('login');
    });
  }
  
  if (elements.registerBtn) {
    elements.registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('register');
    });
  }
  
  if (elements.getStartedBtn) {
    elements.getStartedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('register');
    });
  }
  
  if (elements.dashboardBtn) {
    elements.dashboardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showDashboard();
    });
  }
  
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  if (elements.learnMoreBtn) {
    elements.learnMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const featuresSection = document.querySelector('.features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  // Modal close handlers
  document.addEventListener('click', (e) => {
    // Close auth modal
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
      hideAuthModal();
    }
    
    // Close settings panel
    if (e.target.classList.contains('settings-overlay') || e.target.classList.contains('settings-close')) {
      hideElement(elements.settingsPanel);
    }
  });
  
  // Auth form switches
  if (elements.switchToRegister) {
    elements.switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('register');
    });
  }
  
  if (elements.switchToLogin) {
    elements.switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal('login');
    });
  }
  
  // Form submissions
  const loginFormElement = elements.loginForm?.querySelector('form');
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]')?.value || '';
      const password = e.target.querySelector('input[type="password"]')?.value || '';
      login(email, password);
    });
  }
  
  const registerFormElement = elements.registerForm?.querySelector('form');
  if (registerFormElement) {
    registerFormElement.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = e.target.querySelector('input[type="text"]')?.value || '';
      const email = e.target.querySelector('input[type="email"]')?.value || '';
      const password = e.target.querySelector('input[type="password"]')?.value || '';
      register(name, email, password);
    });
  }
  
  // Password strength checker
  const passwordInput = elements.registerForm?.querySelector('input[type="password"]');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      checkPasswordStrength(e.target.value);
    });
  }
  
  // Dashboard controls
  if (elements.settingsBtn) {
    elements.settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showModal(elements.settingsPanel);
    });
  }
  
  if (elements.locationSelect) {
    elements.locationSelect.addEventListener('change', (e) => {
      const stationId = parseInt(e.target.value);
      const station = mockData.airQualityStations.find(s => s.id === stationId);
      if (station) {
        selectedLocation = station;
        updateDashboardData();
        
        // Update map view
        if (map) {
          map.setView([station.lat, station.lng], 8);
        }
      }
    });
  }
  
  if (elements.modelSelect) {
    elements.modelSelect.addEventListener('change', (e) => {
      updateModelMetrics(e.target.value);
      showToast(`Switched to ${e.target.value.toUpperCase()} model`, 'info');
    });
  }
  
  // Chatbot
  if (elements.chatbotToggle) {
    elements.chatbotToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleElement(elements.chatbotWindow);
    });
  }
  
  if (elements.chatbotClose) {
    elements.chatbotClose.addEventListener('click', (e) => {
      e.preventDefault();
      hideElement(elements.chatbotWindow);
    });
  }
  
  if (elements.chatbotSend) {
    elements.chatbotSend.addEventListener('click', (e) => {
      e.preventDefault();
      const message = elements.chatbotInput?.value?.trim() || '';
      if (message) {
        handleChatbotMessage(message);
        elements.chatbotInput.value = '';
      }
    });
  }
  
  if (elements.chatbotInput) {
    elements.chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        elements.chatbotSend?.click();
      }
    });
  }
  
  // Theme select in settings
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      setTheme(e.target.value);
    });
  }
}

// Real-time data simulation
function startRealTimeUpdates() {
  setInterval(() => {
    if (currentUser && !elements.dashboard?.classList.contains('hidden')) {
      // Simulate slight variations in air quality data
      mockData.airQualityStations.forEach(station => {
        station.o3 += (Math.random() - 0.5) * 2;
        station.no2 += (Math.random() - 0.5) * 1.5;
        station.o3 = Math.max(0, station.o3);
        station.no2 = Math.max(0, station.no2);
        
        // Update AQI based on O3 and NO2 levels
        station.aqi = Math.round((station.o3 + station.no2) * 1.2);
        
        // Update status based on AQI
        if (station.aqi < 50) station.status = 'good';
        else if (station.aqi < 100) station.status = 'moderate';
        else station.status = 'unhealthy';
      });
      
      // Update current location display
      updateOverviewCards();
    }
  }, 30000); // Update every 30 seconds
}

// Initialization
function init() {
  // Initialize elements after DOM is ready
  initializeElements();
  
  // Ensure all modals are hidden initially
  hideAllModals();
  
  // Initialize components
  initTheme();
  initEventListeners();
  updateAuthState();
  initChatbot();
  startRealTimeUpdates();
  
  // Set initial model metrics
  updateModelMetrics('transformer');
  
  // Add system theme change listener
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (currentTheme === 'system') {
        setTheme('system');
      }
    });
  }
  
  // Add loading animation to features when they come into view
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
  });
  
  console.log('AirQ Intelligence Application Initialized');
  console.log('DESIGNED AND OPERATED BY UDHAY - ID 25040132019');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}