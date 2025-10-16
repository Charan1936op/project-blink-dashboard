// Application state
const AppState = {
    currentTab: 'overview',
    animationIntervals: [],
    trafficLightInterval: null,

    initialized: false
};

// DOM Elements
const Elements = {
    tabButtons: null,
    tabContents: null,
    statNumbers: null,
    improvementNumbers: null,
    trainingNumbers: null,
    liveCounters: null,
    trafficLights: null,
    controlSliders: null
};

// Initialize the application
function initializeApp() {
    if (AppState.initialized) return;
    
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start animations
    startAnimations();
    
    // Initialize tab content
    showTab('overview');
    
    AppState.initialized = true;
    console.log('Project-BLINK Dashboard initialized');
}

// Cache frequently used DOM elements
function cacheElements() {
    Elements.tabButtons = document.querySelectorAll('.tab-btn');
    Elements.tabContents = document.querySelectorAll('.tab-content');
    Elements.statNumbers = document.querySelectorAll('.stat-number');
    Elements.improvementNumbers = document.querySelectorAll('.improvement-number');
    Elements.trainingNumbers = document.querySelectorAll('.training-number');

    Elements.trafficLights = document.querySelectorAll('.traffic-light');

}

// Set up event listeners
function setupEventListeners() {
    // Tab navigation
    Elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            showTab(tabId);
        });
    });
    

    
    // Window resize handler
    window.addEventListener('resize', handleResize);
}

// Tab navigation handler
function showTab(tabId) {
    // Update tab buttons
    Elements.tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        }
    });
    
    // Update tab content
    Elements.tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
    
    AppState.currentTab = tabId;
    
    // Trigger tab-specific animations
    setTimeout(() => {
        triggerTabAnimations(tabId);
    }, 100);
}

// Trigger animations based on active tab
function triggerTabAnimations(tabId) {
    switch(tabId) {
        case 'overview':
            animateImprovementNumbers();
            break;
        case 'training':
            animateTrainingNumbers();
            break;
        case 'analysis':
            animateLiveMetrics();
            break;

    }
}

// Start all animations
function startAnimations() {
    // Animate header stats
    animateStatNumbers();
    
    // Start traffic light cycling
    startTrafficLightAnimation();
    
    // Add intersection observers for scroll animations
    setupScrollAnimations();
}

// Animate header statistics
function animateStatNumbers() {
    Elements.statNumbers.forEach(element => {
        const targetValue = parseFloat(element.getAttribute('data-value'));
        const isPercentage = element.textContent.includes('%');
        const isRanked = element.textContent.includes('#');
        
        animateCounter(element, 0, targetValue, 2000, (value) => {
            if (isRanked) {
                return `#${Math.round(value)}`;
            } else if (isPercentage) {
                return `${Math.round(value)}%`;
            } else {
                return Math.round(value).toString();
            }
        });
    });
}

// Animate improvement percentages
function animateImprovementNumbers() {
    Elements.improvementNumbers.forEach(element => {
        const targetValue = parseFloat(element.getAttribute('data-value'));
        
        animateCounter(element, 0, targetValue, 1500, (value) => {
            return `${Math.round(value)}%`;
        });
    });
}

// Animate training statistics
function animateTrainingNumbers() {
    Elements.trainingNumbers.forEach(element => {
        const targetValue = parseFloat(element.getAttribute('data-value'));
        
        if (!isNaN(targetValue)) {
            animateCounter(element, 0, targetValue, 2000, (value) => {
                return Math.round(value).toString();
            });
        }
    });
}

// Animate live metrics with random fluctuations
function animateLiveMetrics() {
    const liveMetrics = document.querySelectorAll('.live-metrics .metric-number');
    
    liveMetrics.forEach(element => {
        const baseValue = parseFloat(element.getAttribute('data-value'));
        if (!isNaN(baseValue)) {
            const interval = setInterval(() => {
                const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
                const newValue = baseValue * (1 + fluctuation);
                
                if (baseValue > 1000) {
                    element.textContent = Math.round(newValue).toLocaleString();
                } else {
                    element.textContent = newValue.toFixed(1);
                }
            }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
            
            AppState.animationIntervals.push(interval);
        }
    });
}



// Generic counter animation function
function animateCounter(element, start, end, duration, formatter) {
    const startTime = performance.now();
    const range = end - start;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const currentValue = start + (range * easeProgress);
        
        element.textContent = formatter(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Traffic light animation
function startTrafficLightAnimation() {
    if (AppState.trafficLightInterval) {
        clearInterval(AppState.trafficLightInterval);
    }
    
    let currentLight = 0; // 0 = red, 1 = yellow, 2 = green
    const lights = ['red', 'yellow', 'green'];
    const timings = [3000, 1000, 3000]; // Red: 3s, Yellow: 1s, Green: 3s
    
    function cycleTrafficLights() {
        // Update main header traffic light
        const headerLight = document.querySelector('.header .traffic-light');
        if (headerLight) {
            const lightElements = headerLight.querySelectorAll('.light');
            lightElements.forEach(light => light.classList.remove('active'));
            lightElements[currentLight].classList.add('active');
        }
        
        // Update demo intersection lights with random patterns
        const demoLights = document.querySelectorAll('.traffic-light-demo');
        demoLights.forEach((lightGroup, index) => {
            const lightElements = lightGroup.querySelectorAll('.light');
            lightElements.forEach(light => light.classList.remove('active'));
            
            // Create varied patterns for different demo lights
            const lightIndex = (currentLight + index) % 3;
            lightElements[lightIndex].classList.add('active');
        });
        
        // Schedule next light change
        setTimeout(() => {
            currentLight = (currentLight + 1) % 3;
            cycleTrafficLights();
        }, timings[currentLight]);
    }
    
    // Start the cycle
    cycleTrafficLights();
}



// Set up scroll-triggered animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease-out forwards';
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    const animatedElements = document.querySelectorAll([
        '.stat-card',
        '.improvement-card', 
        '.training-stat',
        '.metric-card',
        '.junction-card',
        '.arch-card',
        '.chart-section'
    ].join(','));
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Handle window resize
function handleResize() {
    // Adjust layout for mobile devices
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        document.body.classList.add('mobile-layout');
    } else {
        document.body.classList.remove('mobile-layout');
    }
}

// Cleanup function
function cleanup() {
    // Clear all intervals
    AppState.animationIntervals.forEach(interval => clearInterval(interval));
    AppState.animationIntervals = [];
    
    if (AppState.trafficLightInterval) {
        clearInterval(AppState.trafficLightInterval);
        AppState.trafficLightInterval = null;
    }
    

}

// Utility functions
const Utils = {
    // Format numbers with commas
    formatNumber: (num) => {
        return num.toLocaleString();
    },
    
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Generate random number in range
    randomInRange: (min, max) => {
        return Math.random() * (max - min) + min;
    }
};

// Enhanced error handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Export for debugging (development only)
if (typeof window !== 'undefined') {
    window.ProjectBLINK = {
        AppState,
        Elements,
        showTab,
        Utils,
        cleanup
    };
}