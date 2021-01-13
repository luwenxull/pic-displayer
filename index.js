const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("web/static"));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

app.get("/pic", (req, res) => {
  const { pageIndex, pageSize } = req.query;
  fs.readdir(path.resolve(__dirname, "resources"), (err, files) => {
    res.send(files.slice((pageIndex - 1) * pageSize, pageIndex * pageSize));
  });
});

app.get("/pic/:p", (req, res) => {
  const { p } = req.params;
  res.sendFile(path.resolve(__dirname, "resources", p));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
