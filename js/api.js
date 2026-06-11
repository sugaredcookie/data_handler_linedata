// Data Layer - API and Data Management
let applicationsData = [];
let isLoading = false;

const DATA_URL = "https://api.github.com/repos/sugaredcookie/linedata-config-store/contents/applications/applications.json";

async function loadApplications() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        showLoader();
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const decoded = JSON.parse(atob(data.content.replace(/\n/g, "")));
        applicationsData = decoded;
        
        localStorage.setItem('applications_cache', JSON.stringify({
            data: applicationsData,
            timestamp: Date.now()
        }));
        
        hideLoader();
        return applicationsData;
    } catch (error) {
        console.error('Failed to load applications:', error);
        
        // Try cache
        const cached = localStorage.getItem('applications_cache');
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 5 * 60 * 1000) {
                applicationsData = data;
                hideLoader();
                showToast('Using cached data (offline mode)', 'warning');
                return applicationsData;
            }
        }
        
        hideLoader();
        showToast('Failed to load data. Please check your connection.', 'error');
        throw error;
    } finally {
        isLoading = false;
    }
}

function getClients() {
    const clientsSet = new Set();
    applicationsData.forEach(app => {
        if (app.Client) clientsSet.add(app.Client);
    });
    return Array.from(clientsSet).sort();
}

function getProjects(client) {
    const projectsSet = new Set();
    applicationsData.forEach(app => {
        if (app.Client === client && app.Project) {
            projectsSet.add(app.Project);
        }
    });
    return Array.from(projectsSet).sort();
}

function getProjectDeployments(client, project) {
    return applicationsData.filter(app => 
        app.Client === client && app.Project === project
    );
}

function getLatestDeployment(client, project, environment) {
    const deployments = applicationsData.filter(app => 
        app.Client === client && 
        app.Project === project && 
        app.Environment === environment
    );
    
    if (deployments.length === 0) return null;
    
    return deployments.sort((a, b) => 
        new Date(b.DeploymentDate) - new Date(a.DeploymentDate)
    )[0];
}

function getDeploymentForRelease(client, project, releaseId, environment) {
    return applicationsData.find(app =>
        app.Client === client &&
        app.Project === project &&
        app.ReleaseId === releaseId &&
        app.Environment === environment
    );
}

function getAllReleases(client, project) {
    const releases = new Map();
    applicationsData.forEach(app => {
        if (app.Client === client && app.Project === project) {
            if (!releases.has(app.ReleaseId)) {
                releases.set(app.ReleaseId, {
                    releaseId: app.ReleaseId,
                    version: app.Version,
                    deployments: {}
                });
            }
            const release = releases.get(app.ReleaseId);
            release.deployments[app.Environment] = {
                deployed: true,
                deploymentDate: app.DeploymentDate,
                version: app.Version,
                status: app.Status
            };
        }
    });
    
    return Array.from(releases.values()).sort((a, b) => 
        b.releaseId.localeCompare(a.releaseId)
    );
}

function getCurrentProdRelease(client, project) {
    const prodDeployment = getLatestDeployment(client, project, 'PROD');
    return prodDeployment ? prodDeployment.ReleaseId : null;
}

function getStatistics() {
    const clients = getClients();
    const projectsSet = new Set();
    const releasesSet = new Set();
    let latestDate = null;
    
    applicationsData.forEach(app => {
        if (app.Project) projectsSet.add(`${app.Client}|${app.Project}`);
        if (app.ReleaseId) releasesSet.add(app.ReleaseId);
        if (app.DeploymentDate) {
            const date = new Date(app.DeploymentDate);
            if (!latestDate || date > latestDate) latestDate = date;
        }
    });
    
    return {
        totalClients: clients.length,
        totalProjects: projectsSet.size,
        totalReleases: releasesSet.size,
        latestDeployment: latestDate ? formatDate(latestDate) : 'N/A'
    };
}

function searchApplications(searchTerm) {
    if (!searchTerm) return applicationsData;
    
    const term = searchTerm.toLowerCase();
    return applicationsData.filter(app => 
        (app.Client && app.Client.toLowerCase().includes(term)) ||
        (app.Project && app.Project.toLowerCase().includes(term)) ||
        (app.ReleaseId && app.ReleaseId.toLowerCase().includes(term)) ||
        (app.Version && app.Version.toLowerCase().includes(term))
    );
}