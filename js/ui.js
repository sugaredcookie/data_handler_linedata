// ==========================================================================
// Date & Time Telemetry Formatters
// ==========================================================================
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

// ==========================================================================
// Telemetry Shimmer Loaders & Notification Toasts
// ==========================================================================
function showLoader() {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in';
        loader.innerHTML = `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 transform scale-100 transition-transform">
                <i class="fa-solid fa-circle-notch fa-spin text-primary text-3xl"></i>
                <p class="text-slate-400 font-medium text-xs uppercase tracking-wider">Syncing Cluster Lifecycle...</p>
            </div>
        `;
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
    const borderColor = type === 'success' ? 'border-emerald-500/30' : type === 'error' ? 'border-primary/30' : 'border-amber-500/30';
    const icon = type === 'success' ? 'fa-circle-check text-emerald-400' : type === 'error' ? 'fa-circle-exclamation text-primary' : 'fa-triangle-exclamation text-amber-400';
    
    toast.className = `toast p-4 min-w-[320px] rounded-xl border flex items-start gap-3 shadow-premium backdrop-blur-xl bg-slate-900/90 ${borderColor}`;
    toast.innerHTML = `
        <i class="fa-solid ${icon} text-lg mt-0.5"></i>
        <div class="flex-1 space-y-1">
            <p class="text-sm text-slate-200 font-medium leading-relaxed">${message}</p>
            <a href="https://github.com/sugaredcookie/linedata_task_1/actions" target="_blank" class="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline uppercase tracking-wider pt-0.5">
                <i class="fa-brands fa-github"></i> Track Live Run Logs
            </a>
        </div>
        <button class="text-slate-500 hover:text-slate-300 transition-colors"><i class="fa-solid fa-xmark text-sm"></i></button>
    `;
    
    container.appendChild(toast);
    const closeBtn = toast.querySelector('button');
    closeBtn.onclick = () => toast.remove();
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 4000);
    }, 4000);
}

// ==========================================================================
// Layout Blueprint Cards Render Generators
// ==========================================================================
function createClientCard(client, stats) {
    return `
        <div onclick="location.href='client.html?client=${encodeURIComponent(client)}'" 
             class="client-card rounded-2xl p-6 transition-all duration-300 border border-slate-800/80 bg-slate-900/30 backdrop-blur-md group relative overflow-hidden" data-client="${escapeHtml(client)}">
            <div class="flex items-start justify-between mb-5">
                <div class="space-y-1">
                    <h3 class="text-lg font-black text-white group-hover:text-primary transition-colors duration-300">${escapeHtml(client.replace('_', ' '))}</h3>
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">${stats.projectCount} Services Active</p>
                </div>
                <div class="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary/50 group-hover:text-primary transition-colors duration-300 shadow-inner">
                    <i class="fa-solid fa-building-columns text-md"></i>
                </div>
            </div>
            <div class="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium">
                <span class="text-slate-500">Telemetry Pulse:</span>
                <span class="font-mono text-slate-300 flex items-center gap-1.5 font-semibold">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ${stats.latestDeployment ? stats.latestDeployment.slice(0, 10) : 'N/A'}
                </span>
            </div>
        </div>
    `;
}

function createProjectCard(project, client, versions) {
    return `
        <div onclick="location.href='project.html?client=${encodeURIComponent(client)}&project=${encodeURIComponent(project)}'" 
             class="project-card rounded-2xl p-6 transition-all duration-300 border border-slate-800/80 bg-slate-900/30 backdrop-blur-md group relative overflow-hidden" data-project="${escapeHtml(project)}">
            <div class="flex items-start justify-between mb-4">
                <div class="space-y-0.5">
                    <h3 class="text-lg font-black text-white group-hover:text-primary transition-colors duration-300">${escapeHtml(project)}</h3>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cluster Module</p>
                </div>
                <i class="fa-solid fa-diagram-project text-slate-600 group-hover:text-primary/40 transition-colors text-xl"></i>
            </div>
            
            <div class="space-y-2 pt-3 border-t border-slate-800/40 text-xs font-semibold">
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">PROD Core:</span>
                  <span class="font-mono text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">${versions.prod || '—'}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">UAT Sandbox:</span>
                  <span class="font-mono text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">${versions.uat || '—'}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">QA Verification:</span>
                  <span class="font-mono text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">${versions.qa || '—'}</span>
                </div>
            </div>
        </div>
    `;
}

// ==========================================================================
// Octopus Style Matrix & Progression Mechanics
// ==========================================================================
function createEnvironmentSummary(envData) {
    const envColors = {
        QA: 'from-amber-500/5 to-transparent border-amber-500/20 text-amber-400',
        UAT: 'from-blue-500/5 to-transparent border-blue-500/20 text-blue-400',
        PROD: 'from-emerald-500/5 to-transparent border-emerald-500/20 text-emerald-400'
    };
    
    const envIcons = {
        QA: 'fa-server',
        UAT: 'fa-cubes',
        PROD: 'fa-circle-nodes'
    };
    
    return ['QA', 'UAT', 'PROD'].map(env => {
        const data = envData[env] || {};
        return `
            <div class="env-summary-card bg-gradient-to-br ${envColors[env]} rounded-xl p-5 border shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-sm font-black tracking-wider uppercase opacity-80">${env} Cluster</h3>
                    <i class="fa-solid ${envIcons[env]} text-sm opacity-60"></i>
                </div>
                <p class="font-mono font-bold text-white text-base truncate mt-2">${escapeHtml(data.releaseId || '—')}</p>
                <div class="flex items-center justify-center gap-1.5 mt-1">
                    <span class="text-[11px] text-slate-400 font-mono">${escapeHtml(data.version || 'Not Deployed')}</span>
                </div>
                <p class="text-[10px] text-slate-500 font-mono mt-3">${data.deploymentDate ? formatDate(data.deploymentDate) : 'No Telemetry Record'}</p>
            </div>
        `;
    }).join('');
}

function createPromotionButton(currentEnv, targetEnv, client, project, releaseId, version, globalDataset = []) {
    // Intelligent Safety Gatekeeper: Restrict immediate PROD jumps if build hasn't signed-off UAT
    let isLocked = false;
    let fallbackMessage = `Promote to ${targetEnv}`;
    
    if (targetEnv === 'PROD') {
        const hasUatSignoff = globalDataset.some(a => 
            a.Client === client && a.Project === project && a.Environment === 'UAT' && a.Status === 'DEPLOYED' && a.Version === version
        );
        if (!hasUatSignoff) {
            isLocked = true;
            fallbackMessage = "UAT Verification Required";
        }
    }

    return `
        <div class="bg-gradient-to-r from-primary/5 via-slate-900/40 to-transparent rounded-2xl p-6 border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div class="space-y-1">
                    <h3 class="text-md font-bold text-white flex items-center gap-2">
                        <i class="fa-solid fa-circle-nodes text-primary animate-pulse text-xs"></i> Pipeline Progression Trigger
                    </h3>
                    <p class="text-xs font-semibold text-slate-400">Target Path: <span class="text-white">${currentEnv}</span> <i class="fa-solid fa-arrow-right text-[10px] mx-1 text-slate-600"></i> <span class="text-primary">${targetEnv}</span></p>
                    <p class="text-[11px] font-mono text-slate-500 pt-1">Payload Context: [${releaseId}] Baseline: ${version}</p>
                </div>
                
                <button ${isLocked ? 'disabled' : ''} 
                        onclick="window.promoteRelease('${client}', '${project}', '${currentEnv}', '${targetEnv}', '${releaseId}', '${version}')" 
                        class="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
                          isLocked 
                            ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none' 
                            : 'bg-primary hover:bg-red-700 text-white shadow-primary/10 active:scale-[0.98]'
                        }" 
                        title="${isLocked ? 'UAT sign-off criteria missing for this version sequence' : ''}">
                    <i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-arrow-up-from-bracket'}"></i> ${fallbackMessage}
                </button>
            </div>
        </div>
    `;
}

function createMatrixCell(deployment, releaseId, version) {
    if (!deployment) {
        return `
            <div class="flex items-center justify-center py-4">
                <span class="text-slate-700 font-mono text-sm font-bold">—</span>
            </div>
        `;
    }
    
    return `
        <div class="flex flex-col items-center justify-center space-y-1.5 py-2">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                <i class="fa-solid fa-circle-check text-[9px] animate-pulse"></i> Deployed
            </div>
            <div class="text-[11px] font-mono font-bold text-slate-300">${escapeHtml(deployment.version || version)}</div>
            <div class="text-[10px] font-mono font-medium text-slate-500">${formatDate(deployment.deploymentDate)}</div>
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
            <td class="p-4 align-middle border-b border-slate-800/60 bg-slate-900/10">
                ${createMatrixCell(deployment, release.releaseId, release.version)}
            </td>
        `;
    }).join('');
    
    if (!hasAnyDeployment) return '';
    
    // Only reveal operational rollback triggers if matching the running active signature
    const showRollback = release.releaseId === currentProdReleaseId;
    
    return `
        <tr class="hover:bg-slate-800/30 transition-colors group">
          <td class="p-4 align-middle border-b border-slate-800/60 pl-6">
              <div class="font-mono font-bold text-white text-sm group-hover:text-primary transition-colors">${escapeHtml(release.releaseId)}</div>
              <div class="text-[11px] font-mono font-medium text-slate-500 mt-0.5">${escapeHtml(release.version)}</div>
          </td>
          ${cells}
          <td class="p-4 align-middle border-b border-slate-800/60 text-right pr-6">
              ${showRollback ? `
                  <button onclick="window.rollbackRelease('${client}', '${project}', '${release.releaseId}', '${release.version}')"
                          class="ml-auto px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
                      <i class="fa-solid fa-rotate-left"></i> Rollback
                  </button>
              ` : '<span class="text-slate-700 font-mono text-sm font-bold block text-center">—</span>'}
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

// ==========================================================================
// GitHub Downstream Automation Issue Triggers
// ==========================================================================
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
Promotion request pipeline dispatch executed from deployment controller dashboard interface layer.`);
    
    window.open(`https://github.com/sugaredcookie/linedata_task_1/issues/new?title=${title}&body=${body}`, '_blank');
}

function createRollbackIssue(client, project, releaseId, version) {
    const title = encodeURIComponent(`[ROLLBACK] ${project} Line Restore`);
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
Rollback pipeline execution dispatched manually from operational telemetry control sheet.`);
    
    window.open(`https://github.com/sugaredcookie/linedata_task_1/issues/new?title=${title}&body=${body}`, '_blank');
}

// Ensure canvas instantiation remains strict dark mode standard layout
function initDarkMode() {
    document.documentElement.classList.add('dark');
}