// Project Page Logic - Octopus Style Deployment Matrix with Fixed Promotion/Rollback Logic
let currentClient = '';
let currentProject = '';

async function initProjectPage() {
    initDarkMode();
    
    const urlParams = new URLSearchParams(window.location.search);
    currentClient = urlParams.get('client');
    currentProject = urlParams.get('project');
    
    if (!currentClient || !currentProject) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        await loadApplications();
        renderHeader();
        renderSidebar();
        renderEnvironmentSummary();
        renderPromotionAction();
        renderReleaseMatrix();
    } catch (error) {
        showToast('Failed to load project data', 'error');
    }
}

function renderHeader() {
    document.getElementById('projectName').textContent = currentProject;
    document.getElementById('clientName').textContent = currentClient;
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

function renderEnvironmentSummary() {
    const environments = ['QA', 'UAT', 'PROD'];
    const envData = {};
    
    environments.forEach(env => {
        const deployment = getLatestDeployment(currentClient, currentProject, env);
        envData[env] = {
            releaseId: deployment ? deployment.ReleaseId : null,
            version: deployment ? deployment.Version : null,
            deploymentDate: deployment ? deployment.DeploymentDate : null
        };
    });
    
    const summaryContainer = document.getElementById('envSummary');
    if (summaryContainer) {
        summaryContainer.innerHTML = createEnvironmentSummary(envData);
    }
}

function renderPromotionAction() {
    const qaDeployment = getLatestDeployment(currentClient, currentProject, 'QA');
    const uatDeployment = getLatestDeployment(currentClient, currentProject, 'UAT');
    const prodDeployment = getLatestDeployment(currentClient, currentProject, 'PROD');
    
    const actionContainer = document.getElementById('promotionAction');
    if (!actionContainer) return;
    
    // Case 1: QA and UAT have different Release IDs -> Promote QA to UAT
    if (qaDeployment && uatDeployment && qaDeployment.ReleaseId !== uatDeployment.ReleaseId) {
        actionContainer.innerHTML = createPromotionButton(
            'QA', 'UAT', currentClient, currentProject, 
            qaDeployment.ReleaseId, qaDeployment.Version
        );
        return;
    }
    
    // Case 2: QA and UAT have same Release ID, but PROD is different -> Promote UAT to PROD
    if (qaDeployment && uatDeployment && prodDeployment && 
        qaDeployment.ReleaseId === uatDeployment.ReleaseId && 
        uatDeployment.ReleaseId !== prodDeployment.ReleaseId) {
        actionContainer.innerHTML = createPromotionButton(
            'UAT', 'PROD', currentClient, currentProject, 
            uatDeployment.ReleaseId, uatDeployment.Version
        );
        return;
    }
    
    // Case 3: QA exists but no UAT, and no PROD conflict
    if (qaDeployment && !uatDeployment) {
        actionContainer.innerHTML = createPromotionButton(
            'QA', 'UAT', currentClient, currentProject, 
            qaDeployment.ReleaseId, qaDeployment.Version
        );
        return;
    }
    
    // Case 4: UAT exists but no PROD
    if (uatDeployment && !prodDeployment) {
        actionContainer.innerHTML = createPromotionButton(
            'UAT', 'PROD', currentClient, currentProject, 
            uatDeployment.ReleaseId, uatDeployment.Version
        );
        return;
    }
    
    // Case 5: All environments same release or no promotion needed
    actionContainer.innerHTML = '';
}

function renderReleaseMatrix() {
    const releases = getAllReleases(currentClient, currentProject);
    const matrixBody = document.getElementById('matrixBody');
    const currentProdReleaseId = getCurrentProdRelease(currentClient, currentProject);
    
    if (!matrixBody) return;
    
    if (releases.length === 0) {
        matrixBody.innerHTML = '<tr><td colspan="5" class="text-center py-12 text-slate-500">No releases found for this project</td></tr>';
        return;
    }
    
    matrixBody.innerHTML = releases.map(release => 
        createMatrixRow(release, currentClient, currentProject, currentProdReleaseId)
    ).join('');
}

// Promotion Function - Uses correct GitHub issue format
window.promoteRelease = function(client, project, sourceEnv, targetEnv, releaseId, version) {
    createPromotionIssue(client, project, sourceEnv, targetEnv, releaseId, version);
    showToast(`Promotion request created for ${project} from ${sourceEnv} to ${targetEnv}`, 'success');
};

// Rollback Function - Uses correct GitHub issue format, only shown for PROD releases
window.rollbackRelease = function(client, project, releaseId, version) {
    createRollbackIssue(client, project, releaseId, version);
    showToast(`Rollback request created for ${project} release ${releaseId}`, 'warning');
};

// Start the page
initProjectPage();