let naviBar, titleEl, authorEl, downloadBtn, downloadTxtLink;
const STR_DOWNLOAD = "Download text";

window.addEventListener("load", () => {
  // alert('ok');
  naviBar = document.querySelector("#head_nav");
  titleEl = document.querySelector(".novel_title");
  authorEl = document.querySelector(".novel_writername");
  downloadTxtLink = Array.from(
    document.querySelectorAll(".undernavi li a")
  ).find(el => el.innerText == "TXTダウンロード");

  downloadBtn = document.createElement("button");
  downloadBtn.innerHTML = STR_DOWNLOAD;
  downloadBtn.addEventListener("click", downloadTxt);
  naviBar.appendChild(downloadBtn, titleEl);
});

async function downloadTxt() {
  try {
    downloadBtn.disabled = true;
    downloadBtn.innerText = "Getting list...";

    let title = titleEl.innerText;
    let author = authorEl.innerText;
    let url = location.href;

    let str = `${title}\n${author}\n${url}\n\n`;
    let listText = await downloadUrl(downloadTxtLink.href);
    const parser = new DOMParser();
    const listHtmlDoc = parser.parseFromString(listText, "text/html");

    let chapters = Array.from(
      listHtmlDoc.querySelectorAll('select[name="no"] option')
    ).map(el => ({
      no: el.getAttribute("value"),
      title: el.innerText
    }));
    str += chapters.map(c => c.title).join("\n") + "\n\n";
    console.log(str);

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
        if (i == 5) {
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
  if(!contentType) contentType = 'application/octet-stream';
  var a = document.createElement('a');
  var blob = new Blob([content], {'type':contentType});
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}