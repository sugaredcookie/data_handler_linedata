// Homepage Application Logic
let allApplications = [];

async function initHomepage() {
    initDarkMode();
    
    try {
        allApplications = await loadApplications();
        updateStatistics();
        renderClients();
        setupEventListeners();
    } catch (error) {
        showToast('Failed to load dashboard data', 'error');
    }
}

function updateStatistics() {
    const stats = getStatistics();
    document.getElementById('totalClients').textContent = stats.totalClients;
    document.getElementById('totalProjects').textContent = stats.totalProjects;
    document.getElementById('totalReleases').textContent = stats.totalReleases;
    document.getElementById('latestDeployment').textContent = stats.latestDeployment;
}

function renderClients() {
    const clients = getClients();
    const desktopList = document.getElementById('desktopClientList');
    const mobileList = document.getElementById('mobileClientList');
    const clientsGrid = document.getElementById('clientsGrid');
    
    if (!clientsGrid) return;
    
    // Build client cards with stats
    const clientStats = clients.map(client => {
        const projects = getProjects(client);
        let latestDeployment = null;
        
        projects.forEach(project => {
            const deployments = getProjectDeployments(client, project);
            deployments.forEach(dep => {
                if (!latestDeployment || new Date(dep.DeploymentDate) > new Date(latestDeployment)) {
                    latestDeployment = dep.DeploymentDate;
                }
            });
        });
        
        return { client, projectCount: projects.length, latestDeployment: latestDeployment ? formatDate(latestDeployment) : 'N/A' };
    });
    
    // Render grid
    clientsGrid.innerHTML = clientStats.map(stat => createClientCard(stat.client, stat)).join('');
    
    // Render sidebar
    if (desktopList) {
        desktopList.innerHTML = clients.map(client => `
            <a href="client.html?client=${encodeURIComponent(client)}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300 text-sm">
                <i class="fa-regular fa-building text-slate-400"></i> ${escapeHtml(client)}
            </a>
        `).join('');
    }
    
    if (mobileList) {
        mobileList.innerHTML = clients.map(client => `
            <a href="client.html?client=${encodeURIComponent(client)}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
                <i class="fa-regular fa-building"></i> ${escapeHtml(client)}
            </a>
        `).join('');
    }
    
    // Add click handlers
    document.querySelectorAll('.client-card').forEach(card => {
        card.addEventListener('click', () => {
            const client = card.dataset.client;
            window.location.href = `client.html?client=${encodeURIComponent(client)}`;
        });
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value;
            const filtered = searchApplications(term);
            const clients = getClients();
            const filteredClients = clients.filter(client => {
                const hasMatch = filtered.some(app => app.Client === client);
                return hasMatch;
            });
            
            const clientStats = filteredClients.map(client => {
                const projects = getProjects(client);
                let latestDeployment = null;
                projects.forEach(project => {
                    const deployments = getProjectDeployments(client, project);
                    deployments.forEach(dep => {
                        if (!latestDeployment || new Date(dep.DeploymentDate) > new Date(latestDeployment)) {
                            latestDeployment = dep.DeploymentDate;
                        }
                    });
                });
                return { client, projectCount: projects.length, latestDeployment: latestDeployment ? formatDate(latestDeployment) : 'N/A' };
            });
            
            const clientsGrid = document.getElementById('clientsGrid');
            if (clientsGrid) {
                clientsGrid.innerHTML = clientStats.map(stat => createClientCard(stat.client, stat)).join('');
                document.querySelectorAll('.client-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const client = card.dataset.client;
                        window.location.href = `client.html?client=${encodeURIComponent(client)}`;
                    });
                });
            }
        });
    }
    
    // Mobile drawer
    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeDrawerBtn');
    const overlay = document.getElementById('mobileDrawerOverlay');
    const drawer = document.getElementById('mobileDrawer');
    
    if (menuBtn) {
        menuBtn.onclick = () => {
            if (drawer) drawer.style.transform = 'translateX(0)';
            if (overlay) overlay.classList.remove('hidden');
        };
    }
    
    const closeDrawer = () => {
        if (drawer) drawer.style.transform = 'translateX(-100%)';
        if (overlay) overlay.classList.add('hidden');
    };
    
    if (closeBtn) closeBtn.onclick = closeDrawer;
    if (overlay) overlay.onclick = closeDrawer;
}

// Start the app
initHomepage();