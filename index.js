const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("web/static"));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

app.get("/files", (req, res) => {
  const { pageIndex, pageSize, path: p = "" } = req.query;
  fs.readdir(
    path.resolve(__dirname, "resources", p),
    {
      withFileTypes: true,
    },
    (err, files) => {
      res.send(
        files
          .filter((file) => {
            return !file.name.startsWith(".");
          })
          .map((file) => {
            return {
              isDirectory: file.isDirectory() || file.isSymbolicLink(),
              name: file.name,
              ctime: fs.statSync(
                path.resolve(__dirname, "resources", p, file.name)
              ).ctime,
            };
          })
          .sort((a, b) => {
            if (a.isDirectory === b.isDirectory) {
              return b.ctime - a.ctime;
            } else {
              return a.isDirectory ? -1 : 1;
            }
          })
          .slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
      );
    }
  );
});

app.get("/file", (req, res) => {
  const { path: p } = req.query;
  res.sendFile(path.resolve(__dirname, "resources", p));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
