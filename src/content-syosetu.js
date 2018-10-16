const parser = new DOMParser();
const STR_DOWNLOAD = "TXT一括ダウンロード";
const STR_DOWNLOAD_ERROR = "✕ ダウンロード失敗、錯誤：";
const STR_DOWNLOAD_FINISH = "✓ ダウンロード完成";
const STR_DOWNLOAD_LIST = "リストを取得...";
const STR_DOWNLOAD_CHAPTER = "チャプターを取得...";
let downloadBtn;

window.addEventListener("load", () => {
  let naviBar = document.querySelector("#head_nav");

  downloadBtn = document.createElement("button");
  downloadBtn.setAttribute("title", STR_DOWNLOAD);
  downloadBtn.setAttribute(
    "style",
    `font-size: 12px;padding: 5px 10px;background: #fffaf4;border: 2px solid #f4c28d;color: #efac6a;text-align: center;font-weight: bold;cursor: pointer;`
  );
  downloadBtn.innerHTML = "TXT ↓";
  downloadBtn.addEventListener("click", downloadTxt);
  naviBar.appendChild(document.createElement("li"));
  naviBar.querySelector(
    "li:last-child"
  ).innerHTML = `<a href="https://noc.syosetu.com/top/top/" title="ホーム">⌂</a>`;
  naviBar.appendChild(document.createElement("li"));
  naviBar.querySelector("li:last-child").appendChild(downloadBtn);
});

async function downloadTxt() {
  try {
    downloadBtn.disabled = true;
    downloadBtn.textContent = STR_DOWNLOAD_LIST;

    let url = Array.from(document.querySelectorAll(".novel_bn a")).find(
      el => el.textContent.trim() == "目次"
    );
    url = (url || location).href;
    let selfText = await downloadUrl(url);
    let selfHtmlDoc = parser.parseFromString(selfText, "text/html");
    let title = selfHtmlDoc.querySelector(".novel_title").textContent.trim();
    let author = selfHtmlDoc
      .querySelector(".novel_writername")
      .textContent.trim();
    let desc = selfHtmlDoc.querySelector("#novel_ex");
    desc = desc ? desc.textContent.trim() : "";
    let mtime = selfHtmlDoc
      .querySelector('meta[name="WWWC"]')
      .getAttribute("content")
      .trim();
    let mdate = mtime.split(/\s+/)[0].replace(/\//g, "-");
    let str = `${title}\n${author}\n${mtime}\n${url}\n\n${desc}\n\n`;

    let downloadTxtLink = Array.from(
      selfHtmlDoc.querySelectorAll(".undernavi li a")
    ).find(el => el.textContent == "TXTダウンロード");
    let listText = await downloadUrl(downloadTxtLink.href);
    let listHtmlDoc = parser.parseFromString(listText, "text/html");

    let chapterDownloadLink =
      listHtmlDoc.querySelector('form[name="dl"]').getAttribute("action") +
      "?hankaku=0&code=utf-8&kaigyo=lf";
    if (listHtmlDoc.querySelector('select[name="no"]')) {
      let chapters = Array.from(
        listHtmlDoc.querySelectorAll('select[name="no"] option')
      ).map(el => ({
        no: el.getAttribute("value"),
        title: el.textContent.trim()
      }));
      str += chapters.map(c => c.title).join("\n") + "\n\n";
      // console.log(str);return;

      for (let i = 0; i < chapters.length; i++) {
        let chapter = chapters[i];
        downloadBtn.textContent =
          STR_DOWNLOAD_CHAPTER + `${i + 1}/${chapters.length}`;
        let text = await downloadUrl(chapterDownloadLink + `&no=${chapter.no}`);

        str += chapter.title + "\n\n" + text + "\n\n";
        await sleep(100);
        // console.log(str); break;
      }
    } else {
      str += await downloadUrl(chapterDownloadLink);
    }

    browserDownload(str, `${title} (${author}) (更新日：${mdate}) (syosetu).txt`);
    console.log("download finish", str.length);
    downloadBtn.disabled = false;
    downloadBtn.textContent = STR_DOWNLOAD_FINISH;
  } catch (e) {
    downloadBtn.disabled = false;
    downloadBtn.textContent = STR_DOWNLOAD_ERROR + e;
  }
}

async function downloadUrl(url) {
  let i = 0;
  while (true) {
    i++;
    try {
      let res = await fetch(url);
      if (res.status != 200) {
        // if (i == 10) {
        //   throw new Error(`download ${url} failed after ${i} tries`);
        // }
        await sleep(Math.min(i * 1000, 10000));
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
