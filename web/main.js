const axios = require("axios");

const app = document.getElementById("app");

let pageSize = 50;
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

let images = [];

function load() {
  let pPath = getUrlParams().pPath || "";
  return axios
    .get(`/files?path=${pPath}&pageSize=${pageSize}&pageIndex=${pageIndex}`)
    .then((res) => {
      pending = false;
      hasNext = res.data.length === pageSize;
      pageIndex += 1;
      const fragment = document.createDocumentFragment();
      res.data.forEach((file, i) => {
        const div = document.createElement("div");
        const j = images.length + i;
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

          div.onclick = function () {
            let k = j;
            const wrapper = document.createElement("div");
            wrapper.classList.add("dialog-wrapper");

            const img = document.createElement("img");
            img.src = `/file?path=${pPath + file.name}`;
            style(wrapper, {
              position: "relative",
              padding: "24px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
            });
            style(img, {
              "border-radius": "4px",
            });
            if (document.body.clientHeight < document.body.clientWidth) {
              style(wrapper, {
                height: "100%",
              });
              style(img, {
                height: "100%",
              });
            } else {
              style(wrapper, {
                width: "100%",
              });
              style(img, {
                width: "100%",
              });
            }
            wrapper.append(img);

            const left = document.createElement("img");
            left.src = "/arrow-left.svg";
            left.classList.add("arrow", "left");
            const right = document.createElement("img");
            right.src = "/arrow-right.svg";
            right.classList.add("arrow", "right");

            left.innerText = "<";
            right.innerText = ">";

            left.onclick = function () {
              if (images[k - 1] && !images[k - 1].isDirectory) {
                img.src = `/file?path=${pPath}${images[k - 1].name}`;
                k--;
              }
            };

            right.onclick = function () {
              if (images[k + 1]) {
                img.src = `/file?path=${pPath}${images[k + 1].name}`;
                k++;
              } else if (hasNext) {
                load().then(() => {
                  right.click();
                });
              }
            };

            const close = document.createElement("img");
            close.src = "/close.svg";
            close.classList.add("arrow", "close");

            wrapper.append(left);
            wrapper.append(right);
            wrapper.append(close);

            close.onclick = dialog(wrapper);
          };
        }
        fragment.append(div);
      });
      images = images.concat(res.data);
      app.append(fragment);
    });
}

load();

app.addEventListener("scroll", function (event) {
  const element = event.target;
  console.log(
    element.scrollHeight - element.scrollTop,
    element.clientHeight + 100
  );
  if (
    element.scrollHeight - element.scrollTop <= element.clientHeight + 100 &&
    !pending &&
    hasNext
  ) {
    pending = true;
    load();
  }
});

function style(dom, styles) {
  for (const key of Object.keys(styles)) {
    dom.style[key] = styles[key];
  }
}

function dialog(dom) {
  const container = document.createElement("div");
  const cover = document.createElement("div");
  style(container, {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: "flex",
    "justify-content": "center",
    "align-items": "center",
  });
  style(cover, {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: "#6666",
    "z-index": -1,
  });
  container.append(cover);
  container.append(dom);
  document.body.append(container);

  return function () {
    document.body.removeChild(container);
  };
}
