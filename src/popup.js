//document.querySelector("h1").innerHTML = (new Date).getTime();

/*

RJ142885: 同人软件，http://www.dlsite.com/maniax/work/=/product_id/RJ163312.html
BJ065594: 电子书籍 http://www.dlsite.com/books/work/=/product_id/BJ065594.html
VJ009547：动画 http://www.dlsite.com/pro/work/=/product_id/VJ009549.html
*/

function findItems(str) {
  var items = [];
  var match = str.match(/([\s,.;，。、 ；])?(RJ[0-9]+)([\s,.;，。、 ；])?/i);
  if (match) {
    items.push({ type: "dlsite", id: match[2] });
  }
  return items;
}

function process(item) {
  var url =
    "http://www.dlsite.com/maniax/work/=/product_id/" + item.id + ".html";
  chrome.cookies.set(
    {
      url: "http://www.dlsite.com/",
      domain: "dlsite.com",
      path: "/",
      name: "adultchecked",
      value: "1"
    },
    function() {
      document.querySelector("iframe").src = url;
      document.querySelector("iframe").style.display = "block";
    }
  );
  return { url };
}

function ajax(url, cb) {
  var http = new XMLHttpRequest();
  http.open("GET", url, true);
  http.onload = function() {
    cb(0, http.responseText);
  };
  http.send();
}

chrome.tabs.executeScript(
  {
    code:
      "(function(){return {title: document.title, selection: window.getSelection().toString()};})();"
  },
  function(pageinfo) {
    console.log("get pageinfo", pageinfo[0]);
    var items;
    if (pageinfo[0].selection) {
      items = findItems(pageinfo[0].selection);
    }
    if (!items || items.length == 0) {
      items = findItems(pageinfo[0].title);
    }

    if (!items || items.length == 0) {
      document.querySelector("h1").innerHTML = "No item found";
    } else {
      let { url } = process(items[0]);
      document.querySelector(
        "h1"
      ).innerHTML = `${items[0].type.toUpperCase()} <a href="${url}" target="_blank">${
        items[0].id
      }</a>`;
    }
  }
);
