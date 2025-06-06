/**
 * Muza Productions - Computational Brutalism Design System
 * JavaScript Module v1.0
 * 
 * This file contains all interactive functionality for the Muza design system.
 * Designed to be modular and easy to implement across multiple pages.
 * 
 * Features:
 * - Animated mesh background
 * - Theme toggle (light/dark mode)
 * - Smooth scroll animations
 * - Card entrance animations
 * 
 * Usage:
 * 1. Include this script at the end of your HTML body
 * 2. Ensure you have a canvas element with id="meshCanvas"
 * 3. Ensure you have a button element with id="themeToggle"
 * 4. Call initializeMuza() when DOM is loaded
 */

// Global variables for mesh animation
let meshCanvas, meshCtx;
let meshNodes = [];
let mouseX = 0;
let mouseY = 0;
let animationId;

/**
 * Initialize the entire Muza design system
 * Call this function when the DOM is fully loaded
 */
function initializeMuza() {
    initializeTheme();
    initializeMeshBackground();
    initializeAnimations();
    initializeEventListeners();
}

/**
 * Theme Management
 * Handles dark/light mode switching with localStorage persistence
 */
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Check for saved theme preference or default to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleText(themeToggle, currentTheme);

    // Add click event to toggle button
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleText(themeToggle, newTheme);
    });
}

/**
 * Update theme toggle button text
 * @param {HTMLElement} button - The theme toggle button
 * @param {string} theme - Current theme ('light' or 'dark')
 */
function updateThemeToggleText(button, theme) {
    button.textContent = theme === 'dark' ? '☀ LIGHT' : '◐ DARK';
}

/**
 * Mesh Background Animation
 * Creates an animated network of connected nodes
 */
function initializeMeshBackground() {
    meshCanvas = document.getElementById('meshCanvas');
    if (!meshCanvas) return;

    meshCtx = meshCanvas.getContext('2d');
    
    // Set initial canvas size
    resizeCanvas();
    
    // Create initial nodes
    createNodes();
    
    // Start animation loop
    animateMesh();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        createNodes(); // Recreate nodes for new canvas size
    });
}

/**
 * Resize canvas to match window dimensions
 */
function resizeCanvas() {
    if (!meshCanvas) return;
    meshCanvas.width = window.innerWidth;
    meshCanvas.height = window.innerHeight;
}

/**
 * Create mesh nodes with random positions and velocities
 * Number of nodes: 50 (adjustable for performance)
 */
function createNodes() {
    meshNodes = [];
    const nodeCount = 50; // Adjust for performance vs visual density
    
    for (let i = 0; i < nodeCount; i++) {
        meshNodes.push({
            x: Math.random() * meshCanvas.width,
            y: Math.random() * meshCanvas.height,
            vx: (Math.random() - 0.5) * 0.5, // Velocity X
            vy: (Math.random() - 0.5) * 0.5, // Velocity Y
            radius: Math.random() * 2 + 1    // Node size
        });
    }
}

/**
 * Update node positions and handle edge bouncing
 */
function updateNodes() {
    meshNodes.forEach(node => {
        // Move nodes based on velocity
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > meshCanvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > meshCanvas.height) node.vy *= -1;
        
        // Mouse interaction - nodes are attracted to cursor
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            node.vx += dx * 0.00005;
            node.vy += dy * 0.00005;
        }
    });
}

/**
 * Draw connections between nearby nodes
 * Connection distance: 180px (adjustable)
 */
function drawConnections() {
    const meshColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--mesh-color').trim();
    meshCtx.strokeStyle = meshColor;
    meshCtx.lineWidth = 0.8;
    
    for (let i = 0; i < meshNodes.length; i++) {
        for (let j = i + 1; j < meshNodes.length; j++) {
            const dx = meshNodes[i].x - meshNodes[j].x;
            const dy = meshNodes[i].y - meshNodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 180) {
                // Fade connection based on distance
                const opacity = 1 - (distance / 180);
                const currentColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--mesh-color').trim();
                
                meshCtx.strokeStyle = currentColor.replace(/[\d\.]+\)$/g, (opacity * 0.6) + ')');
                
                meshCtx.beginPath();
                meshCtx.moveTo(meshNodes[i].x, meshNodes[i].y);
                meshCtx.lineTo(meshNodes[j].x, meshNodes[j].y);
                meshCtx.stroke();
            }
        }
    }
}

/**
 * Draw mesh nodes with theme-aware styling
 */
function drawNodes() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    meshCtx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    
    meshNodes.forEach(node => {
        // Add subtle glow effect
        meshCtx.shadowColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
        meshCtx.shadowBlur = 4;
        
        meshCtx.beginPath();
        meshCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        meshCtx.fill();
        
        // Reset shadow for performance
        meshCtx.shadowBlur = 0;
    });
}

/**
 * Main animation loop for mesh background
 */
function animateMesh() {
    if (!meshCtx) return;
    
    meshCtx.clearRect(0, 0, meshCanvas.width, meshCanvas.height);
    
    updateNodes();
    drawConnections();
    drawNodes();
    
    animationId = requestAnimationFrame(animateMesh);
}

/**
 * Initialize scroll-triggered animations
 * Uses Intersection Observer for performance
 */
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate cards on scroll
    const cards = document.querySelectorAll('.project-card, .benefit-item, .example-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

/**
 * Initialize global event listeners
 */
function initializeEventListeners() {
    // Mouse tracking for mesh interaction
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Utility function to open demo links in new tab
 * @param {string} url - The URL to open
 */
function openDemo(url) {
    window.open(url, '_blank');
}

/**
 * Clean up function for performance
 * Call this if you need to destroy the mesh animation
 */
function destroyMeshAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Initialize everything when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMuza);
} else {
    // DOM is already loaded
    initializeMuza();
}

// Export functions for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeMuza,
        openDemo,
        destroyMeshAnimation
    };
}