// ---------- GLOBAL STATE ----------
let applications = [];           // full dataset
let uniqueClients = [];          // sorted list of client names
let currentSelectedClient = "";  // currently active client
let lastUpdated = new Date();

// DOM elements
const container = document.getElementById("applications");
const desktopClientDiv = document.getElementById("desktopClientList");
const mobileClientDiv = document.getElementById("mobileClientList");
const mobileSelectedSpan = document.getElementById("mobileSelectedClient");
const mobileDrawer = document.getElementById("mobileDrawer");
const overlay = document.getElementById("mobileDrawerOverlay");
const openMenuBtn = document.getElementById("mobileMenuBtn");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");

// ---------- FETCH DATA FROM GITHUB ----------
async function loadApplications() {
  try {
    const res = await fetch("https://api.github.com/repos/sugaredcookie/linedata-config-store/contents/applications/applications.json");
    if (!res.ok) throw new Error("Network response failed");
    const data = await res.json();
    const decoded = JSON.parse(atob(data.content.replace(/\n/g, "")));
    applications = decoded;
    lastUpdated = new Date();
    updateLastUpdatedDisplay();
    extractUniqueClients();
    // initialize: first client selected
    if (uniqueClients.length > 0) {
      currentSelectedClient = uniqueClients[0];
      renderSidebarClients();
      applyFiltersAndRender();   // render apps for first client + filters
    } else {
      container.innerHTML = `<div class="col-span-full text-center py-20 text-slate-500">No client data found.</div>`;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="col-span-full text-center py-20 text-red-500">Failed to load applications.json. Check network or CORS.</div>`;
    if (desktopClientDiv) desktopClientDiv.innerHTML = `<div class="p-4 text-red-400 text-sm">Error loading clients</div>`;
  }
}

function updateLastUpdatedDisplay() {
  const el = document.getElementById('lastUpdated');
  if (el) el.textContent = `Last sync: ${lastUpdated.toLocaleString()}`;
}

// extract unique clients sorted
function extractUniqueClients() {
  const clientsSet = new Set();
  applications.forEach(app => {
    if (app.Client && app.Client.trim()) clientsSet.add(app.Client.trim());
  });
  uniqueClients = Array.from(clientsSet).sort((a, b) => a.localeCompare(b));
  const badge = document.getElementById("totalClientsBadge");
  if (badge) badge.innerText = `${uniqueClients.length} client${uniqueClients.length !== 1 ? 's' : ''}`;
}

// render sidebar (both desktop & mobile)
function renderSidebarClients() {
  if (!desktopClientDiv) return;
  desktopClientDiv.innerHTML = '';
  if (mobileClientDiv) mobileClientDiv.innerHTML = '';
  
  uniqueClients.forEach(client => {
    const isActive = (currentSelectedClient === client);
    // desktop item
    const desktopLink = document.createElement('button');
    desktopLink.className = `w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-150 text-sm font-medium mb-1 hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'client-active bg-primary/5' : 'text-slate-700 dark:text-slate-300'}`;
    desktopLink.innerHTML = `<i class="fa-regular fa-building w-4 ${isActive ? 'text-primary' : 'text-slate-400'}"></i><span>${escapeHtml(client)}</span>`;
    desktopLink.onclick = () => selectClient(client);
    desktopClientDiv.appendChild(desktopLink);
    
    // mobile drawer item
    if (mobileClientDiv) {
      const mobileLink = document.createElement('button');
      mobileLink.className = `w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition text-sm ${isActive ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`;
      mobileLink.innerHTML = `<i class="fa-regular fa-building ${isActive ? 'text-primary' : 'text-slate-400'}"></i><span>${escapeHtml(client)}</span>`;
      mobileLink.onclick = () => { selectClient(client); closeMobileDrawer(); };
      mobileClientDiv.appendChild(mobileLink);
    }
  });
  
  if (mobileSelectedSpan) mobileSelectedSpan.innerText = currentSelectedClient || "Select client";
}

// select client handler
function selectClient(client) {
  if (currentSelectedClient === client) return;
  currentSelectedClient = client;
  renderSidebarClients();
  applyFiltersAndRender();
  if (mobileSelectedSpan) mobileSelectedSpan.innerText = client;
}

// filter logic (respects selected client + filters)
function getFilteredApplications() {
  if (!applications.length) return [];
  // first filter by selected client
  let filtered = applications.filter(app => app.Client === currentSelectedClient);
  const searchTerm = document.getElementById("search")?.value.toLowerCase().trim() || "";
  const env = document.getElementById("environmentFilter")?.value || "ALL";
  const status = document.getElementById("statusFilter")?.value || "ALL";
  const versionTerm = document.getElementById("versionFilter")?.value.toLowerCase().trim() || "";
  
  if (searchTerm) filtered = filtered.filter(app => app.Application.toLowerCase().includes(searchTerm));
  if (env !== "ALL") filtered = filtered.filter(app => app.Environment === env);
  if (status !== "ALL") filtered = filtered.filter(app => app.Status === status);
  if (versionTerm) filtered = filtered.filter(app => app.Version.toLowerCase().includes(versionTerm));
  return filtered;
}

// render cards (identical style, keep all buttons working)
function renderApplications(data) {
  if (!container) return;
  container.innerHTML = "";
  if (!data.length) {
    container.innerHTML = `<div class="col-span-full text-center py-16 text-slate-500 bg-white/30 dark:bg-slate-900/30 rounded-2xl border border-dashed"><i class="fa-regular fa-folder-open text-3xl mb-2 block"></i>No applications match filters for <span class="font-semibold text-primary">${escapeHtml(currentSelectedClient)}</span>.</div>`;
    return;
  }
  
  data.forEach(app => {
    const envClass = (app.Environment || "").toLowerCase();
    let envColor = '';
    if (envClass === 'prod') envColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    else if (envClass === 'uat') envColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    else if (envClass === 'qa') envColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    else envColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    
    const card = document.createElement('div');
    card.className = "bg-white dark:bg-slate-800/90 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 dark:border-slate-700/80 overflow-hidden group flex flex-col h-full";
    card.innerHTML = `
      <div class="p-5 pb-3">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">${escapeHtml(app.Application)}</h3>
          <span class="px-3 py-1 text-[11px] font-bold rounded-full ${envColor} shadow-sm">${escapeHtml(app.Environment)}</span>
        </div>
        <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div class="flex justify-between"><span class="font-medium">Version:</span><span class="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">${escapeHtml(app.Version)}</span></div>
          <div><span class="font-medium">Client:</span> <span class="text-slate-800 dark:text-slate-200 font-medium">${escapeHtml(app.Client)}</span></div>
          <div><span class="font-medium">Owner:</span> ${escapeHtml(app.Owner)}</div>
          <div><span class="font-medium">Release:</span> ${escapeHtml(app.ReleaseDate)}</div>
          <div><span class="font-medium">Status:</span> <span class="inline-flex items-center gap-1"><i class="fa-regular fa-clock text-xs"></i> ${escapeHtml(app.Status)}</span></div>
        </div>
      </div>
      <div class="mt-auto p-5 pt-2 flex gap-3 border-t border-slate-100 dark:border-slate-700/50">
        <button data-client="${escapeHtml(app.Client)}" data-app="${escapeHtml(app.Application)}" class="details-trigger flex-1 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition flex items-center justify-center gap-1"><i class="fa-regular fa-eye"></i> Details</button>
        <button data-client="${escapeHtml(app.Client)}" data-app="${escapeHtml(app.Application)}" class="promote-trigger flex-1 py-2.5 text-sm font-semibold bg-primary hover:bg-red-700 text-white rounded-xl transition shadow-sm flex items-center justify-center gap-1"><i class="fa-regular fa-arrow-up-from-bracket"></i> Promote</button>
      </div>
    `;
    container.appendChild(card);
  });
  
  // attach dynamic event listeners
  document.querySelectorAll('.details-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const client = btn.getAttribute('data-client');
      const appName = btn.getAttribute('data-app');
      viewDetails(client, appName);
    });
  });
  document.querySelectorAll('.promote-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const client = btn.getAttribute('data-client');
      const appName = btn.getAttribute('data-app');
      promote(client, appName);
    });
  });
}

function applyFiltersAndRender() {
  if (!currentSelectedClient) return;
  const filteredData = getFilteredApplications();
  renderApplications(filteredData);
}

// ---------- MODAL & PROMOTE (fully compatible) ----------
window.viewDetails = function(client, applicationName) {
  const app = applications.find(a => a.Client === client && a.Application === applicationName);
  if (!app) return;
  const modal = document.getElementById("detailsModal");
  const title = document.getElementById("modalAppName");
  const content = document.getElementById("modalContent");
  title.textContent = app.Application;
  content.innerHTML = `
    <div class="grid grid-cols-2 gap-5 text-sm">
      <div><p class="text-slate-400 text-xs uppercase">Client</p><p class="font-semibold">${escapeHtml(app.Client)}</p></div>
      <div><p class="text-slate-400 text-xs uppercase">Version</p><p class="font-mono font-bold text-base">${escapeHtml(app.Version)}</p></div>
      <div><p class="text-slate-400 text-xs uppercase">Environment</p><p class="font-semibold">${escapeHtml(app.Environment)}</p></div>
      <div><p class="text-slate-400 text-xs uppercase">Owner</p><p class="font-semibold">${escapeHtml(app.Owner)}</p></div>
      <div><p class="text-slate-400 text-xs uppercase">Criticality</p><p>${escapeHtml(app.Criticality)}</p></div>
      <div><p class="text-slate-400 text-xs uppercase">Last Promotion</p><p>${escapeHtml(app.LastPromotionDate)}</p></div>
      <div class="col-span-2"><p class="text-slate-400 text-xs uppercase">Release Date</p><p>${escapeHtml(app.ReleaseDate)}</p></div>
    </div>
    <div class="mt-4 pt-3 border-t dark:border-slate-700"><span class="text-xs text-slate-400">Status</span><p class="font-medium text-base">${escapeHtml(app.Status)}</p></div>
  `;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

window.closeModal = function() {
  const modal = document.getElementById("detailsModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
};

window.promote = function(client, applicationName) {
  const app = applications.find(a => a.Client === client && a.Application === applicationName);
  if (!app) return;
  let target = "";
  switch(app.Environment) {
    case "DEV": target = "QA"; break;
    case "QA": target = "UAT"; break;
    case "UAT": target = "PROD"; break;
    case "PROD": alert(`${app.Application} is already in PROD`); return;
    default: alert("Unknown Environment"); return;
  }
  const title = encodeURIComponent(`[PROMOTION] ${app.Application} → ${target}`);
  const body = encodeURIComponent(`### Client\n${app.Client}\n### Application\n${app.Application}\n### Current Env\n${app.Environment}\n### Target\n${target}\n### Version\n${app.Version}\n### Reason\nPromotion request from dashboard`);
  window.open(`https://github.com/sugaredcookie/linedata_task_1/issues/new?title=${title}&body=${body}`, "_blank");
};

window.exportToCSV = function() {
  if (!applications.length) { alert("No data to export"); return; }
  let csv = `"Client","Application","Version","Environment","Owner","ReleaseDate","Status","Criticality","LastPromotionDate"\n`;
  applications.forEach(app => {
    csv += `"${app.Client}","${app.Application}","${app.Version}","${app.Environment}","${app.Owner}","${app.ReleaseDate}","${app.Status}","${app.Criticality}","${app.LastPromotionDate}"\n`;
  });
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `applications_export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

window.clearFilters = function() {
  const searchInput = document.getElementById("search");
  const envFilter = document.getElementById("environmentFilter");
  const statusFilter = document.getElementById("statusFilter");
  const versionInput = document.getElementById("versionFilter");
  if (searchInput) searchInput.value = "";
  if (envFilter) envFilter.value = "ALL";
  if (statusFilter) statusFilter.value = "ALL";
  if (versionInput) versionInput.value = "";
  applyFiltersAndRender();
};

function attachFilterListeners() {
  const search = document.getElementById("search");
  const env = document.getElementById("environmentFilter");
  const status = document.getElementById("statusFilter");
  const version = document.getElementById("versionFilter");
  if (search) search.addEventListener("input", () => applyFiltersAndRender());
  if (env) env.addEventListener("change", () => applyFiltersAndRender());
  if (status) status.addEventListener("change", () => applyFiltersAndRender());
  if (version) version.addEventListener("input", () => applyFiltersAndRender());
}

function closeMobileDrawer() {
  if (mobileDrawer) mobileDrawer.style.transform = "translateX(-100%)";
  if (overlay) overlay.classList.add("hidden");
}

function openMobileDrawer() {
  if (mobileDrawer) mobileDrawer.style.transform = "translateX(0)";
  if (overlay) overlay.classList.remove("hidden");
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

// Event handlers for mobile drawer
if (openMenuBtn) openMenuBtn.addEventListener("click", openMobileDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeMobileDrawer);
if (overlay) overlay.addEventListener("click", closeMobileDrawer);

// init everything
attachFilterListeners();
loadApplications();