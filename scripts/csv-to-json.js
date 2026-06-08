const fs = require("fs");

const csv = fs.readFileSync(
  "data/applications.csv",
  "utf8"
);

const lines = csv.trim().split("\n");

const headers = lines[0]
  .split(",")
  .map(h => h.trim());

const data = lines
  .slice(1)
  .map(line => {

    const values = line
      .split(",")
      .map(v => v.trim());

    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = values[index];
    });

    return obj;

  });

fs.writeFileSync(
  "data/applications.json",
  JSON.stringify(data, null, 2)
);

console.log(
  "CSV converted to JSON successfully"
);