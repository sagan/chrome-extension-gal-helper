const parser = new DOMParser();
const STR_DOWNLOAD = "Download text";
let downloadBtn;

window.addEventListener("load", () => {
  let naviBar = document.querySelector("#head_nav");

  downloadBtn = document.createElement("button");
  downloadBtn.innerHTML = STR_DOWNLOAD;
  downloadBtn.addEventListener("click", downloadTxt);
  naviBar.appendChild(downloadBtn);
});

async function downloadTxt() {
  try {
    downloadBtn.disabled = true;
    downloadBtn.innerText = "Getting list...";

    let url = location.href;
    let selfText = await downloadUrl(url);
    let selfHtmlDoc = parser.parseFromString(selfText, "text/html");
    let title = selfHtmlDoc.querySelector(".novel_title").innerText.trim();
    let author = selfHtmlDoc.querySelector(".novel_writername").innerText.trim();
    let desc = selfHtmlDoc.querySelector("#novel_ex").innerText.trim();
    let mtime = selfHtmlDoc.querySelector('meta[name="WWWC"]').getAttribute("content").trim();
    let str = `${title}\n${author}\n${mtime}\n${url}\n\n${desc}\n\n`;

    let downloadTxtLink = Array.from(
      selfHtmlDoc.querySelectorAll(".undernavi li a")
    ).find(el => el.innerText == "TXTダウンロード");
    let listText = await downloadUrl(downloadTxtLink.href);
    let listHtmlDoc = parser.parseFromString(listText, "text/html");
    let chapters = Array.from(
      listHtmlDoc.querySelectorAll('select[name="no"] option')
    ).map(el => ({
      no: el.getAttribute("value"),
      title: el.innerText.trim(),
    }));
    str += chapters.map(c => c.title).join("\n") + "\n\n";
    // console.log(str);return;

    let chapterDownloadLink =
      listHtmlDoc.querySelector('form[name="dl"]').getAttribute("action") +
      "?hankaku=0&code=utf-8&kaigyo=lf";

    for (let i = 0; i < chapters.length; i++) {
      let chapter = chapters[i];
      downloadBtn.innerText = `Download chapter ${i + 1}/${chapters.length}...`;
      let text = await downloadUrl(chapterDownloadLink + `&no=${chapter.no}`);

      str += chapter.title + "\n\n" + text + "\n\n";
      await sleep(100);
      // console.log(str); break;
    }

    browserDownload(str, `${title} (${author}).txt`);
    console.log("download finish", str.length);
    downloadBtn.disabled = false;
    downloadBtn.innerText = "Finish";
  } catch (e) {
    downloadBtn.disabled = false;
    downloadBtn.innerText = "Error " + e;
  }
}

async function downloadUrl(url) {
  let i = 0;
  while (true) {
    i++;
    try {
      let res = await fetch(url);
      if (res.status != 200) {
        if (i == 10) {
          throw new Error(`download ${url} failed after ${i} tries`);
        }
        await sleep(i * 1000);
        continue;
      }
      let txt = await res.text();
      return txt;
    } catch (e) {}
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function browserDownload(content, filename, contentType) {
  if (!contentType) contentType = "application/octet-stream";
  var a = document.createElement("a");
  var blob = new Blob([content], { type: contentType });
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
