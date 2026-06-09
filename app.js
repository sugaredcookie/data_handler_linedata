let applications = [];
let lastUpdated = new Date();

fetch("https://raw.githubusercontent.com/sugaredcookie/linedata-config-store/main/applications/applications.json")
  .then(res => res.json())
  .then(data => {
    applications = data;
    lastUpdated = new Date();
    renderApplications(applications);
    updateLastUpdated();
  })
  .catch(error => {
    console.error("Failed to load data", error);
    document.getElementById("applications").innerHTML = `
      <p class="col-span-full text-center py-20 text-red-500 text-lg">
        Failed to load applications data. Please check the JSON file.
      </p>`;
  });

function updateLastUpdated() {
  const el = document.getElementById('lastUpdated');
  if (el) el.textContent = `Last updated: ${lastUpdated.toLocaleString()}`;
}

function renderApplications(data) {
  const container = document.getElementById("applications");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center py-20 text-slate-500 text-lg">No applications match your filters.</p>`;
    return;
  }

  data.forEach(app => {
    const envClass = app.Environment.toLowerCase();

    container.innerHTML += `
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-2xl font-semibold text-slate-900 dark:text-white group-hover:text-primary">${app.Application}</h3>
          <span class="px-4 py-1 text-xs font-semibold rounded-full 
            ${envClass === 'prod' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 
              envClass === 'uat' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 
              envClass === 'qa' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 
              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}">
            ${app.Environment}
          </span>
        </div>

        <div class="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
          <p><span class="font-medium">Version:</span> <span class="font-mono">${app.Version}</span></p>
          <p><span class="font-medium">Owner:</span> ${app.Owner}</p>
          <p><span class="font-medium">Release:</span> ${app.ReleaseDate}</p>
          <p><span class="font-medium">Status:</span> ${app.Status}</p>
        </div>

        <div class="mt-8 flex gap-3">
          <button onclick="viewDetails('${app.Application}')" 
                  class="flex-1 py-3.5 text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition">
            View Details
          </button>
          <button onclick="promote('${app.Application}')" 
                  class="flex-1 py-3.5 text-sm font-semibold bg-primary hover:bg-red-700 text-white rounded-2xl transition">
            Promote
          </button>
        </div>
      </div>
    `;
  });
}

// Beautiful Modal
function viewDetails(name) {
  const app = applications.find(a => a.Application === name);
  if (!app) return;

  const modal = document.getElementById('detailsModal');
  const content = document.getElementById('modalContent');
  const title = document.getElementById('modalAppName');

  title.textContent = app.Application;

  content.innerHTML = `
    <div class="grid grid-cols-2 gap-6 text-sm">
      <div>
        <p class="text-slate-500 dark:text-slate-400">Version</p>
        <p class="font-mono text-xl font-semibold text-slate-900 dark:text-white">${app.Version}</p>
      </div>
      <div>
        <p class="text-slate-500 dark:text-slate-400">Environment</p>
        <p class="font-semibold">${app.Environment}</p>
      </div>
      <div>
        <p class="text-slate-500 dark:text-slate-400">Owner</p>
        <p class="font-semibold">${app.Owner}</p>
      </div>
      <div>
        <p class="text-slate-500 dark:text-slate-400">Release Date</p>
        <p class="font-semibold">${app.ReleaseDate}</p>
      </div>
    </div>
    <div class="mt-6 pt-6 border-t dark:border-slate-700">
      <p class="text-slate-500 dark:text-slate-400 mb-2">Status</p>
      <p class="text-lg font-medium">${app.Status}</p>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal() {
  const modal = document.getElementById('detailsModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function promote(applicationName) {
  const app = applications.find(a => a.Application === applicationName);
  if (!app) return;

  let target = "";
  switch(app.Environment) {
    case "DEV": target = "QA"; break;
    case "QA": target = "UAT"; break;
    case "UAT": target = "PROD"; break;
    case "PROD":
      alert(`${app.Application} is already in PROD`);
      return;
    default:
      alert("Unknown Environment");
      return;
  }

  const title = encodeURIComponent(`[PROMOTION] ${app.Application} → ${target}`);
  const body = encodeURIComponent(`
### Application
${app.Application}

### Current Environment
${app.Environment}

### Target Environment
${target}

### Version
${app.Version}

### Reason
Promotion request from dashboard`);

  window.open(`https://github.com/sugaredcookie/linedata_task_1/issues/new?title=${title}&body=${body}`, "_blank");
}

// Filters
function filterApplications() {
  const term = document.getElementById("search").value.toLowerCase().trim();
  const env = document.getElementById("environmentFilter").value;
  const status = document.getElementById("statusFilter").value;
  const versionTerm = document.getElementById("versionFilter").value.toLowerCase().trim();

  let filtered = applications;

  if (term) filtered = filtered.filter(app => app.Application.toLowerCase().includes(term));
  if (env !== "ALL") filtered = filtered.filter(app => app.Environment === env);
  if (status !== "ALL") filtered = filtered.filter(app => app.Status === status);
  if (versionTerm) filtered = filtered.filter(app => app.Version.toLowerCase().includes(versionTerm));

  renderApplications(filtered);
}

function clearFilters() {
  document.getElementById("search").value = "";
  document.getElementById("environmentFilter").value = "ALL";
  document.getElementById("statusFilter").value = "ALL";
  document.getElementById("versionFilter").value = "";
  renderApplications(applications);
}

// Export CSV
function exportToCSV() {
  if (applications.length === 0) {
    alert("No data to export");
    return;
  }
  let csv = "Application,Version,Environment,Owner,ReleaseDate,Status\n";
  applications.forEach(app => {
    csv += `"${app.Application}","${app.Version}","${app.Environment}","${app.Owner}","${app.ReleaseDate}","${app.Status}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `applications_export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  const isDark = document.documentElement.classList.contains('dark');
  icon.classList.toggle('fa-moon', !isDark);
  icon.classList.toggle('fa-sun', isDark);
}

// Initialize
document.getElementById("search").addEventListener("input", filterApplications);
document.getElementById("environmentFilter").addEventListener("change", filterApplications);
document.getElementById("statusFilter").addEventListener("change", filterApplications);
document.getElementById("versionFilter").addEventListener("input", filterApplications);

window.onload = () => {
  const savedDark = localStorage.getItem('darkMode') === 'true';
  if (savedDark) document.documentElement.classList.add('dark');
  updateThemeIcon();
};