let applications = [];

fetch("./data/applications.json")
  .then(res => res.json())
  .then(data => {

    applications = data;

    renderApplications(
      applications
    );

  })
  .catch(error => {

    console.error(
      "Failed to load JSON",
      error
    );

  });

function renderApplications(data) {

  const container =
    document.getElementById(
      "applications"
    );

  container.innerHTML = "";

  data.forEach(app => {

    container.innerHTML += `
      <div class="card">

        <h3>${app.Application}</h3>

        <p>
          Version:
          ${app.Version}
        </p>

        <p>
          Environment:
          ${app.Environment}
        </p>

        <p>
          Status:
          ${app.Status}
        </p>

        <div class="actions">

            <button
                class="details-btn"
            >
                View Details
            </button>

            <button
                class="promote-btn"
                onclick="promote('${app.Application}')"
            >
                Promote
            </button>

        </div>

      </div>
    `;

  });

}

function viewDetails(applicationName) {

  const app =
    applications.find(
      app =>
        app.Application === applicationName
    );

  if (!app) return;

  alert(
`Application: ${app.Application}

Version: ${app.Version}

Environment: ${app.Environment}

Owner: ${app.Owner}

Release Date: ${app.ReleaseDate}

Status: ${app.Status}`
  );

}

function promote(applicationName) {

  const app =
    applications.find(
      app =>
        app.Application === applicationName
    );

  if (!app) return;

  let targetEnvironment;

  switch(app.Environment) {

    case "DEV":
      targetEnvironment = "QA";
      break;

    case "QA":
      targetEnvironment = "UAT";
      break;

    case "UAT":
      targetEnvironment = "PROD";
      break;

    case "PROD":
      alert(
        `${app.Application} is already in PROD`
      );
      return;

    default:
      alert(
        "Unknown Environment"
      );
      return;

  }

  const title =
    encodeURIComponent(
      `[PROMOTION] ${app.Application}`
    );

  const body =
    encodeURIComponent(
`### Application Name

${app.Application}

### Current Environment

${app.Environment}

### Target Environment

${targetEnvironment}

### Version

${app.Version}

### Reason

Promotion Request`
    );

  window.open(
    `https://github.com/sugaredcookie/linedata_task_1/issues/new?title=${title}&body=${body}`,
    "_blank"
  );

}

document
  .getElementById("search")
  .addEventListener(
    "input",
    e => {

      const term =
        e.target.value
          .toLowerCase();

      const filtered =
        applications.filter(
          app =>
            app.Application
              .toLowerCase()
              .includes(term)
        );

      renderApplications(
        filtered
      );

    }
  );

document
  .getElementById(
    "environmentFilter"
  )
  .addEventListener(
    "change",
    e => {

      const env =
        e.target.value;

      let filtered =
        applications;

      if(env !== "ALL") {

        filtered =
          applications.filter(
            app =>
              app.Environment === env
          );

      }

      renderApplications(
        filtered
      );

    }
  );