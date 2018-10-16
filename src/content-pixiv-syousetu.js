const parser = new DOMParser();
const STR_DOWNLOAD = "TXT一括ダウンロード";
const STR_DOWNLOAD_ERROR = "✕ ダウンロード失敗、錯誤：";
const STR_DOWNLOAD_FINISH = "✓ ダウンロード完成";
const STR_DOWNLOAD_LIST = "リストを取得...";
const STR_DOWNLOAD_CHAPTER = "チャプターを取得...";
let downloadBtn;

window.addEventListener("load", () => {
  let naviBar = document.querySelector(".tabs");

  downloadBtn = document.createElement("button");
  downloadBtn.setAttribute("title", STR_DOWNLOAD);
  downloadBtn.setAttribute(
    "style",
    `font-size: 12px;padding: 5px 10px;background: #fffaf4;border: 2px solid #f4c28d;color: #efac6a;text-align: center;font-weight: bold;cursor: pointer;`
  );
  downloadBtn.innerHTML = "TXT ↓";
  downloadBtn.addEventListener("click", downloadTxt);
  naviBar.appendChild(document.createElement("li"));
  naviBar.querySelector("li:last-child").appendChild(downloadBtn);
});

async function downloadTxt() {
  try {
    downloadBtn.disabled = true;
    downloadBtn.innerText = STR_DOWNLOAD_LIST;

    let url = location.href;
    let htmlDoc = parser.parseFromString(await downloadUrl(url), "text/html");
    let author = htmlDoc
      .querySelector(".profile .user-name")
      .textContent.trim();
    let title, desc, str;
    let mdate = -1;

    if (htmlDoc.querySelector("ul.type-series")) {
      let series = Array.from(htmlDoc.querySelectorAll("ul.type-series li a"))
        .filter(
          (el, i, a) =>
            el.textContent.trim() != "一覧を見る" && i != a.length - 1
        )
        .map(el => ({ url: el.href, title: el.textContent.trim() }));
      title = htmlDoc.querySelector(".area_title").textContent.trim();
      desc = "";
      url = series[0].url;
      str = series.map(chapter => chapter.title).join("\n") + "\n\n";

      for (let i = 0; i < series.length; i++) {
        let chapter = series[i];
        downloadBtn.innerText =
          STR_DOWNLOAD_CHAPTER + `${i + 1}/${series.length}`;
        let htmlDoc = parser.parseFromString(
          await downloadUrl(chapter.url),
          "text/html"
        );
        mdate = Math.max(mdate, getMdate(htmlDoc));
        let text = htmlDoc
          .querySelector("textarea#novel_text")
          .textContent.trim();
        str += chapter.title + "\n\n" + text + "\n\n";
        await sleep(50);
      }
    } else {
      title = htmlDoc.querySelector(".work-info h1.title").textContent.trim();
      desc = htmlDoc.querySelector(".work-info p.caption").textContent.trim();
      mdate = getMdate(htmlDoc);
      str = htmlDoc.querySelector("textarea#novel_text").textContent.trim();
    }

    mdate = mdate.toString();
    mdate = `${mdate.slice(0, 4)}-${mdate.slice(4, 6)}-${mdate.slice(6, 8)}`;
    str = `${title}\n${author}\n更新日: ${mdate}\n${url}\n\n${desc}\n\n` + str;

    browserDownload(str, `${title} (${author}) (更新日：${mdate}) (pixiv).txt`);
    console.log("download finish\n", str.length);
    downloadBtn.disabled = false;
    downloadBtn.innerText = STR_DOWNLOAD_FINISH;
  } catch (e) {
    downloadBtn.disabled = false;
    downloadBtn.innerText = STR_DOWNLOAD_ERROR + e;
  }
}

async function downloadUrl(url) {
  let i = 0;
  while (true) {
    i++;
    try {
      let res = await fetch(url, { credentials: "include" });
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

function getMdate(htmlDoc) {
  let mtime = Array.from(htmlDoc.querySelectorAll(".meta li"))
    .find(el => el.textContent.trim().match(/^\d{4}\s*年/))
    .textContent.trim()
    .split(/\s*[年月日]\s*/);
  return parseInt(
    mtime[0].padStart(4, "0") +
      mtime[1].padStart(2, "0") +
      mtime[2].padStart(2, "0")
  );
}
