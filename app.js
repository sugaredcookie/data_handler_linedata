let applications = [];

fetch("./data/applications.json")
  .then(res => res.json())
  .then(data => {
    applications = data;
    renderApplications(applications);
  })
  .catch(error => {
    console.error("Failed to load applications.json", error);
    document.getElementById("applications").innerHTML = `
      <p class="text-center text-red-500 col-span-full py-12 text-lg">Failed to load application data.</p>`;
  });

function renderApplications(data) {
  const container = document.getElementById("applications");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<p class="text-center text-slate-500 col-span-full py-12 text-lg">No applications found.</p>`;
    return;
  }

  data.forEach(app => {
    const envClass = app.Environment.toLowerCase();

    container.innerHTML += `
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group">
        <div class="flex justify-between items-start mb-5">
          <h3 class="text-2xl font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
            ${app.Application}
          </h3>
          <span class="px-4 py-1.5 text-xs font-semibold rounded-full 
            ${envClass === 'prod' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 
              envClass === 'uat' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 
              envClass === 'qa' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 
              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}">
            ${app.Environment}
          </span>
        </div>

        <div class="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p><span class="font-medium text-slate-500">Version:</span> <span class="font-mono">${app.Version}</span></p>
          <p><span class="font-medium text-slate-500">Owner:</span> ${app.Owner}</p>
          <p><span class="font-medium text-slate-500">Release Date:</span> ${app.ReleaseDate}</p>
          <p><span class="font-medium text-slate-500">Status:</span> ${app.Status}</p>
        </div>

        <div class="mt-8 flex gap-3">
          <button onclick="viewDetails('${app.Application}')" 
                  class="flex-1 py-3.5 text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-colors">
            View Details
          </button>
          <button onclick="promote('${app.Application}')" 
                  class="flex-1 py-3.5 text-sm font-semibold bg-primary hover:bg-red-700 text-white rounded-2xl transition-all active:scale-95">
            Promote
          </button>
        </div>
      </div>
    `;
  });
}

function viewDetails(applicationName) {
  const app = applications.find(a => a.Application === applicationName);
  if (!app) return;
  alert(`Application: ${app.Application}\n\nVersion: ${app.Version}\nEnvironment: ${app.Environment}\nOwner: ${app.Owner}\nRelease Date: ${app.ReleaseDate}\nStatus: ${app.Status}`);
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
  const body = encodeURIComponent(`### Application\n${app.Application}\n\n### Current\n${app.Environment}\n\n### Target\n${target}\n\n### Version\n${app.Version}`);

  window.open(`https://github.com/sugaredcookie/linedata_task_1/issues/new?title=${title}&body=${body}`, "_blank");
}

// Sorting + Filtering
function filterApplications() {
  const term = document.getElementById("search").value.toLowerCase().trim();
  const env = document.getElementById("environmentFilter").value;
  const status = document.getElementById("statusFilter").value;
  const sortMode = document.getElementById("sortSelect").value;

  let filtered = applications;

  if (term) filtered = filtered.filter(app => app.Application.toLowerCase().includes(term));
  if (env !== "ALL") filtered = filtered.filter(app => app.Environment === env);
  if (status !== "ALL") filtered = filtered.filter(app => app.Status === status);

  // Sorting
  filtered.sort((a, b) => {
    if (sortMode === "name-asc") return a.Application.localeCompare(b.Application);
    if (sortMode === "name-desc") return b.Application.localeCompare(a.Application);
    if (sortMode === "version-desc") return b.Version.localeCompare(a.Version);
    if (sortMode === "date-desc") return new Date(b.ReleaseDate) - new Date(a.ReleaseDate);
    return 0;
  });

  renderApplications(filtered);
}

// Export to CSV
function exportToCSV() {
  const csvContent = Papa.unparse(applications); // Requires PapaParse if not included
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'applications_export.csv';
  a.click();
}

// Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const icon = document.getElementById('themeIcon');
  icon.classList.toggle('fa-moon', !isDark);
  icon.classList.toggle('fa-sun', isDark);
}

// Clear Filters
function clearFilters() {
  document.getElementById("search").value = "";
  document.getElementById("environmentFilter").value = "ALL";
  document.getElementById("statusFilter").value = "ALL";
  document.getElementById("sortSelect").value = "name-asc";
  renderApplications(applications);
}

// Initialize listeners
document.getElementById("search").addEventListener("input", filterApplications);
document.getElementById("environmentFilter").addEventListener("change", filterApplications);
document.getElementById("statusFilter").addEventListener("change", filterApplications);
document.getElementById("sortSelect").addEventListener("change", filterApplications);

window.onload = () => {
  const savedDark = localStorage.getItem('darkMode') === 'true';
  if (savedDark) document.documentElement.classList.add('dark');
  updateThemeIcon();
};