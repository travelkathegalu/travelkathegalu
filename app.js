document.addEventListener('DOMContentLoaded', () => {
    // --- Fetch Live Instagram Stats ---
    async function fetchLiveStats() {
        try {
            const followerEl = document.getElementById('live-followers');
            const postEl = document.getElementById('live-posts');
            if(followerEl) followerEl.textContent = "...";
            if(postEl) postEl.textContent = "...";
            
            const response = await fetch('http://127.0.0.1:5000/api/stats');
            const data = await response.json();
            
            if (data.followers !== undefined) {
                // Formatting followers (e.g. 13240 -> 13.2K)
                let formattedFollowers = data.followers >= 1000 ? (data.followers / 1000).toFixed(1) + 'K' : data.followers;
                if(followerEl) followerEl.textContent = formattedFollowers;
                if(postEl) postEl.textContent = data.total_posts;
            } else if (data.error) {
                console.error("IG fetch error:", data.error);
                if(followerEl) followerEl.textContent = "Error";
                if(postEl) postEl.textContent = "Error";
            }
        } catch (error) {
            console.error("Failed to fetch live stats. Backend might be down.", error);
            const followerEl = document.getElementById('live-followers');
            const postEl = document.getElementById('live-posts');
            if(followerEl && followerEl.textContent === "...") followerEl.textContent = "13.2K";
            if(postEl && postEl.textContent === "...") postEl.textContent = "123";
        }
    }
    fetchLiveStats();

    // --- Dynamic Greeting ---
    const greetingText = document.getElementById('greeting');
    if (greetingText) {
        const hour = new Date().getHours();
        if (hour < 12) greetingText.textContent = "Good Morning";
        else if (hour < 18) greetingText.textContent = "Good Afternoon";
        else greetingText.textContent = "Good Evening";
    }

    // --- Navigation / Tab Switching ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active');
            });

            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Render chart if dashboard tab is active and chart doesn't exist
            if (targetId === 'dashboard' && reachChartInstance === null) {
                initChart();
            }
        });
    });

    // --- Chart.js Initialization ---
    let reachChartInstance = null;
    
    function initChart() {
        const ctx = document.getElementById('reachChart');
        if (!ctx) return;
        
        // Create Gradient
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        reachChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Daily Reach',
                    data: [12400, 15000, 18500, 16200, 22000, 35000, 42000],
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#3b82f6',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4 // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#94a3b8',
                        bodyColor: '#fff',
                        padding: 12,
                        displayColors: false,
                        cornerRadius: 8,
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: { color: '#94a3b8', callback: function(value) { return value/1000 + 'k'; } }
                    },
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // Initialize chart immediately if dashboard is visible on load
    if (document.getElementById('dashboard').classList.contains('active')) {
        initChart();
    }

    // --- Copy to Clipboard for Vault ---
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const vaultCard = e.target.closest('.vault-card');
            const hashtags = vaultCard.querySelector('.hashtags').textContent;
            
            navigator.clipboard.writeText(hashtags).then(() => {
                const icon = btn.querySelector('i');
                icon.className = 'fa-solid fa-check text-success';
                setTimeout(() => {
                    icon.className = 'fa-regular fa-copy';
                }, 2000);
            });
        });
    });

    // --- Kanban Drag and Drop Logic ---
    const draggables = document.querySelectorAll('.kanban-card');
    const containers = document.querySelectorAll('.kanban-cards');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
            setTimeout(() => draggable.style.opacity = '0.5', 0);
        });
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            draggable.style.opacity = '1';
        });
    });

    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            container.classList.add('drag-over');
            const afterElement = getDragAfterElement(container, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', () => {
            container.classList.remove('drag-over');
            updateKanbanCounts();
        });
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updateKanbanCounts() {
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(col => {
            const count = col.querySelectorAll('.kanban-card').length;
            const badge = col.querySelector('.column-header span');
            if(badge) badge.textContent = count;
        });
    }
});
