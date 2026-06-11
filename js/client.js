// Client Page Logic
let currentClient = '';

async function initClientPage() {
    initDarkMode();
    
    const urlParams = new URLSearchParams(window.location.search);
    currentClient = urlParams.get('client');
    
    if (!currentClient) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        await loadApplications();
        renderClientHeader();
        renderSidebar();
        renderProjects();
        setupEventListeners();
    } catch (error) {
        showToast('Failed to load client data', 'error');
    }
}

function renderClientHeader() {
    const clientNameEl = document.getElementById('clientName');
    if (clientNameEl) {
        clientNameEl.textContent = currentClient;
    }
}

function renderSidebar() {
    const clients = getClients();
    const sidebar = document.getElementById('sidebarClients');
    
    if (sidebar) {
        sidebar.innerHTML = clients.map(client => `
            <a href="client.html?client=${encodeURIComponent(client)}" 
               class="flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm ${client === currentClient ? 'client-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                <i class="fa-regular fa-building"></i> ${escapeHtml(client)}
            </a>
        `).join('');
    }
}

function renderProjects() {
    const projects = getProjects(currentClient);
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (!projectsGrid) return;
    
    if (projects.length === 0) {
        projectsGrid.innerHTML = '<div class="col-span-full text-center py-16 text-slate-500">No projects found for this client.</div>';
        return;
    }
    
    const projectCards = projects.map(project => {
        const qaDeployment = getLatestDeployment(currentClient, project, 'QA');
        const uatDeployment = getLatestDeployment(currentClient, project, 'UAT');
        const prodDeployment = getLatestDeployment(currentClient, project, 'PROD');
        
        return createProjectCard(project, currentClient, {
            qa: qaDeployment ? qaDeployment.Version : null,
            uat: uatDeployment ? uatDeployment.Version : null,
            prod: prodDeployment ? prodDeployment.Version : null
        });
    }).join('');
    
    projectsGrid.innerHTML = projectCards;
    
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const project = card.dataset.project;
            window.location.href = `project.html?client=${encodeURIComponent(currentClient)}&project=${encodeURIComponent(project)}`;
        });
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const projects = getProjects(currentClient);
            const filteredProjects = projects.filter(project => 
                project.toLowerCase().includes(term)
            );
            
            const projectsGrid = document.getElementById('projectsGrid');
            if (projectsGrid) {
                const filteredCards = filteredProjects.map(project => {
                    const qaDeployment = getLatestDeployment(currentClient, project, 'QA');
                    const uatDeployment = getLatestDeployment(currentClient, project, 'UAT');
                    const prodDeployment = getLatestDeployment(currentClient, project, 'PROD');
                    
                    return createProjectCard(project, currentClient, {
                        qa: qaDeployment ? qaDeployment.Version : null,
                        uat: uatDeployment ? uatDeployment.Version : null,
                        prod: prodDeployment ? prodDeployment.Version : null
                    });
                }).join('');
                
                projectsGrid.innerHTML = filteredCards || '<div class="col-span-full text-center py-16 text-slate-500">No matching projects found.</div>';
                
                document.querySelectorAll('.project-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const project = card.dataset.project;
                        window.location.href = `project.html?client=${encodeURIComponent(currentClient)}&project=${encodeURIComponent(project)}`;
                    });
                });
            }
        });
    }
}

initClientPage();