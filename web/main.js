const axios = require("axios");

const app = document.getElementById("app");

let pageSize = 40;
let pageIndex = 1;
let hasNext = true;
let pending = false;

function load() {
  axios.get(`/pic?pageSize=${pageSize}&pageIndex=${pageIndex}`).then((res) => {
    pending = false;
    hasNext = res.data.length === pageSize;
    pageIndex += 1;
    const fragment = document.createDocumentFragment();
    res.data.forEach((path) => {
      const div = document.createElement("div");
      const img = document.createElement("img");
      img.src = "/pic/" + path;
      div.append(img);
      // div.innerText = "hel";
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
