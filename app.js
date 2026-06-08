let applications = [];

fetch("./data/applications.json")
  .then(res => res.json())
  .then(data => {

    applications = data;

    renderApplications(
      applications
    );

  }).catch(e => {
    console.error("Failed to load json", e);
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

        <button>
          View Details
        </button>

        <button>
          Promote
        </button>

      </div>
    `;

  });

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
        applications.filter(app =>
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
              app.Environment
                === env
          );

      }

      renderApplications(
        filtered
      );

    }
  );

