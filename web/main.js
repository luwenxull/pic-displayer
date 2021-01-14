const axios = require("axios");

const app = document.getElementById("app");

let pageSize = 40;
let pageIndex = 1;
let hasNext = true;
let pending = false;

function getUrlParams() {
  let match;
  const urlParams = {},
    pl = /\+/g, // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) {
      return decodeURIComponent(s.replace(pl, " "));
    },
    query = window.location.search.substring(1);

  while ((match = search.exec(query)))
    urlParams[decode(match[1])] = decode(match[2]);
  return urlParams;
}

function load() {
  let pPath = getUrlParams().pPath || "";
  axios
    .get(`/files?path=${pPath}&pageSize=${pageSize}&pageIndex=${pageIndex}`)
    .then((res) => {
      pending = false;
      hasNext = res.data.length === pageSize;
      pageIndex += 1;
      const fragment = document.createDocumentFragment();
      res.data.forEach((file) => {
        const div = document.createElement("div");
        if (file.isDirectory) {
          div.innerText = file.name;
          div.onclick = function () {
            location.assign(location.pathname + `?pPath=${pPath + file.name}/`);
          };
          div.classList.add("dir");
        } else {
          div.classList.add("file");
          const img = document.createElement("img");
          img.src = `/file?path=${pPath + file.name}`;
          div.append(img);
        }
        fragment.append(div);
      });
      app.append(fragment);
    });
}

load();

app.addEventListener("scroll", function (event) {
  const element = event.target;
  if (
    element.scrollHeight - element.scrollTop <= element.clientHeight + 100 &&
    !pending &&
    hasNext
  ) {
    pending = true;
    load();
  }
});
