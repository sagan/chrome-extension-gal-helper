var cmid;

var pass = "";

var cm_clickHandler = function(clickData, tab) {
  chrome.tabs.create({
    url:
      "http://pan.baidu.com/s/" +
      clickData.selectionText.trim() +
      (pass ? "?pass=" + pass : "")
  });
};

var cm_searchClickHandler = function(clickData, tab) {
  var se = clickData.selectionText.trim();
  chrome.tabs.create({
    url: "http://www.sobaidupan.com/search.asp?r=0&wd=" + encodeURIComponent(se)
  });
};

var options = {
  title: "打开百度网盘",
  contexts: ["selection"],
  onclick: cm_clickHandler
};

var optionsSearch = {
  title: "搜索百度网盘",
  contexts: ["selection"],
  onclick: cm_searchClickHandler
};

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.request === "updateContextMenu") {
    //console.log('received msg', msg);
    var se = msg.selection.trim();
    if (se.length > 15) {
      if (cmid != null) {
        chrome.contextMenus.remove(cmid);
        cmid = null;
      }
      return;
    }

    var isBaiduPanCode = false;
    if (!se.match(/^[RBV]J\d+$/i)) {
      var match = se.match(/^(\/?s\/)?([a-z0-9]{4,})/i);
      if (match && !match[2].match(/^[0-9]+$/)) {
        isBaiduPanCode = true;
        pass = "";
        if (msg.context) {
          var index = msg.context.indexOf(match[2]);
          if (index != -1) {
            var afterSelectionText = msg.context.substr(
              index + match[2].length
            );
            var matchPass = afterSelectionText.match(/\b([a-z0-9]{4})\b/i);
            if (matchPass) {
              pass = matchPass[1];
            }
          }
        }
      }
    }
    if (isBaiduPanCode) {
      var o = clone(options);
      if (pass) o.title += " (密码: " + pass + ")";
      if (cmid == null) cmid = chrome.contextMenus.create(o);
      else chrome.contextMenus.update(cmid, o);
    } else {
      if (cmid == null) cmid = chrome.contextMenus.create(clone(optionsSearch));
      else chrome.contextMenus.update(cmid, clone(optionsSearch));
    }
  }
});

chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    if (details.statusCode == 302) {
      var pass = parseUrl(details.url, "pass");
      //console.log('detect request to baidupan', details, pass);
      if (pass) {
        for (var i = 0; i < details.responseHeaders.length; i++) {
          if (details.responseHeaders[i].name.toLowerCase() == "location") {
            if (
              details.responseHeaders[i].value.indexOf("?shareid=") != -1 &&
              details.responseHeaders[i].value.indexOf("pass=") == -1
            ) {
              details.responseHeaders[i].value += "&pass=" + pass;
              return { responseHeaders: details.responseHeaders };
            }
            break;
          }
        }
      }
    }
  },
  { urls: ["*://pan.baidu.com/s/*"], types: ["main_frame"] },
  ["blocking", "responseHeaders"]
);

function clone(obj) {
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

function parseUrl(str, variable) {
  var url = document.createElement("a");
  url.href = str;
  return !variable ? url : getQueryVariable(variable, url);
}

function getQueryVariable(variable, url) {
  url = url || window.location;
  if (typeof url == "object") url = url.search;
  var query = url.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}
