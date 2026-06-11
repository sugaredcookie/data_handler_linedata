function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function showLoader() {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center';
        loader.innerHTML = '<div class="bg-slate-900 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 border border-slate-700"><i class="fa-solid fa-circle-notch fa-spin text-primary text-3xl"></i><p class="text-slate-300">Loading...</p></div>';
        document.body.appendChild(loader);
    }
    loader.classList.remove('hidden');
}

function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.classList.add('hidden');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    const borderColor = type === 'success' ? 'border-emerald-500' : type === 'error' ? 'border-red-500' : 'border-amber-500';
    const icon = type === 'success' ? 'fa-circle-check text-emerald-500' : type === 'error' ? 'fa-circle-exclamation text-red-500' : 'fa-triangle-exclamation text-amber-500';
    
    toast.className = `toast bg-slate-800 rounded-xl shadow-lg p-4 min-w-[280px] border-l-4 ${borderColor} flex items-center gap-3`;
    
    toast.innerHTML = `
        <i class="fa-solid ${icon} text-xl"></i>
        <div class="flex-1">
            <p class="text-sm text-slate-200">${message}</p>
        </div>
        <button class="text-slate-400 hover:text-slate-200"><i class="fa-solid fa-xmark"></i></button>
    `;
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('button');
    closeBtn.onclick = () => toast.remove();
    
    setTimeout(() => toast.remove(), 4000);
}

function createClientCard(client, stats) {
    return `
        <div class="client-card rounded-2xl p-6 transition-all cursor-pointer" data-client="${client}">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-xl font-bold text-white">${escapeHtml(client)}</h3>
                    <p class="text-sm text-slate-400 mt-1">${stats.projectCount} projects</p>
                </div>
                <div class="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <i class="fa-solid fa-building text-primary text-xl"></i>
                </div>
            </div>
            <div class="pt-4 border-t border-slate-800">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-400">Latest Deployment</span>
                    <span class="font-medium text-slate-300">${stats.latestDeployment || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

function createProjectCard(project, client, versions) {
    return `
        <div class="project-card rounded-2xl p-6 transition-all cursor-pointer" data-project="${project}">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-white">${escapeHtml(project)}</h3>
                <i class="fa-solid fa-diagram-project text-primary/50 text-2xl"></i>
            </div>
            <div class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">PROD Version</span>
                    <span class="font-mono text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded">${versions.prod || '—'}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">UAT Version</span>
                    <span class="font-mono text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">${versions.uat || '—'}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-400">QA Version</span>
                    <span class="font-mono text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded">${versions.qa || '—'}</span>
                </div>
            </div>
        </div>
    `;
}

function createEnvironmentSummary(envData) {
    const envColors = {
        QA: 'from-amber-500/10 to-transparent border-amber-500/20',
        UAT: 'from-blue-500/10 to-transparent border-blue-500/20',
        PROD: 'from-emerald-500/10 to-transparent border-emerald-500/20'
    };
    
    const envIcons = {
        QA: 'fa-flask text-amber-500',
        UAT: 'fa-vial text-blue-500',
        PROD: 'fa-rocket text-emerald-500'
    };
    
    return Object.entries(envData).map(([env, data]) => `
        <div class="env-summary-card bg-gradient-to-br ${envColors[env]} rounded-xl p-5 border">
            <i class="fa-solid ${envIcons[env]} text-2xl mb-3"></i>
            <h3 class="text-lg font-bold text-white">${env}</h3>
            <p class="font-mono text-sm text-slate-300 mt-2">${data.releaseId || '—'}</p>
            <p class="text-xs text-slate-400 mt-1">${data.version || 'Not Deployed'}</p>
            <p class="text-xs text-slate-500 mt-2">${data.deploymentDate ? formatDate(data.deploymentDate) : ''}</p>
        </div>
    `).join('');
}

function createPromotionButton(currentEnv, targetEnv, client, project, releaseId, version) {
    return `
        <div class="bg-gradient-to-r from-primary/10 to-slate-900 rounded-2xl p-6 border border-primary/20 bg-slate-900/50">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 class="text-lg font-bold text-white">Promote Release</h3>
                    <p class="text-sm text-slate-400 mt-1">From ${currentEnv} → ${targetEnv}</p>
                    <p class="text-xs font-mono text-primary mt-2">Release: ${releaseId} | Version: ${version}</p>
                </div>
                <button onclick="window.promoteRelease('${client}', '${project}', '${currentEnv}', '${targetEnv}', '${releaseId}', '${version}')" 
                        class="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-arrow-right"></i> Promote to ${targetEnv}
                </button>
            </div>
        </div>
    `;
}

function createMatrixCell(deployment, releaseId, version) {
    if (!deployment) {
        return `
            <div class="text-center py-2">
                <span class="text-slate-600 text-2xl">—</span>
            </div>
        `;
    }
    
    return `
        <div class="text-center space-y-2 py-2">
            <div class="inline-flex items-center justify-center w-8 h-8 bg-emerald-900/30 rounded-lg">
                <i class="fa-solid fa-check text-emerald-400 text-lg"></i>
            </div>
            <div class="text-xs font-mono text-slate-300">${escapeHtml(deployment.version || version)}</div>
            <div class="text-xs text-slate-500">${formatDate(deployment.deploymentDate)}</div>
        </div>
    `;
}

function createMatrixRow(release, client, project, currentProdReleaseId) {
    const environments = ['QA', 'UAT', 'PROD'];
    let hasAnyDeployment = false;
    
    const cells = environments.map(env => {
        const deployment = release.deployments[env];
        if (deployment) hasAnyDeployment = true;
        return `
            <td class="p-4 align-top border-b border-slate-800">
                ${createMatrixCell(deployment, release.releaseId, release.version)}
            </td>
        `;
    }).join('');
    
    if (!hasAnyDeployment) return '';
    
    // Only show rollback if this release is currently deployed in PROD
    const showRollback = release.releaseId === currentProdReleaseId;
    
    return `
        <tr class="hover:bg-slate-800/50 transition">
            <td class="p-4 align-top border-b border-slate-800">
                <div class="font-mono font-semibold text-white">${escapeHtml(release.releaseId)}</div>
                <div class="text-xs text-slate-400 mt-1">${escapeHtml(release.version)}</div>
            </td>
            ${cells}
            <td class="p-4 align-top border-b border-slate-800">
                ${showRollback ? `
                    <button onclick="window.rollbackRelease('${client}', '${project}', '${release.releaseId}', '${release.version}')"
                            class="px-3 py-1.5 text-xs bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition flex items-center gap-1">
                        <i class="fa-solid fa-rotate-left"></i> Rollback
                    </button>
                ` : '<span class="text-slate-600 text-xs">—</span>'}
            </td>
        </tr>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// GitHub Issue Creation Functions
function createPromotionIssue(client, project, sourceEnv, targetEnv, releaseId, version) {
    const title = encodeURIComponent(`[PROMOTION] ${project} → ${targetEnv}`);
    const body = encodeURIComponent(`Client
${client}

Project
${project}

Source Environment
${sourceEnv}

Target Environment
${targetEnv}

Release ID
${releaseId}

Version
${version}

Request Type
PROMOTION

Change Reason
Promotion requested from dashboard`);
    
    window.open(`https://github.com/sugaredcookie/linedata_task_1/issues/new?title=${title}&body=${body}`, '_blank');
}

function createRollbackIssue(client, project, releaseId, version) {
    const title = encodeURIComponent(`[ROLLBACK] ${project}`);
    const body = encodeURIComponent(`Client
${client}

Project
${project}

Target Environment
PROD

Release ID
${releaseId}

Version
${version}

Request Type
ROLLBACK

Change Reason
Rollback requested from dashboard`);
    
    window.open(`https://github.com/sugaredcookie/linedata_task_1/issues/new?title=${title}&body=${body}`, '_blank');
}

// Dark Mode is always enabled - no toggle needed
function initDarkMode() {
    // Dark mode is always active - no toggle functionality
    document.documentElement.classList.add('dark');
}