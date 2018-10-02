/* this utility allows you to download a PDF of any 8Notes sheet music without a paid account
*
* created by Graham Batzler
* github.com/batzlerg
*
* N.B. - if possible, please purchase a subscription to 8Notes to support their service,
* this utility is only intended as a tool of convenience for the financially challenged among us
*/

(function () {

  // add jsPdf dep and initialize the pdf document
  function initPdf() {
    return new Promise(function (resolve, reject) {
      let jsPdfEl = document.createElement('script');
      jsPdfEl.type = 'text/javascript';
      jsPdfEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.4.1/jspdf.min.js';
      jsPdfEl.onload = function() {
        pdfDoc = new jsPDF();
        resolve(pdfDoc);
      };
      document.querySelector('head').appendChild(jsPdfEl);
    })
  }

  // parse the image url of the current sheet of music
  function getScoreImgUrl(scoreEl) {
    let bkgImgUrl = scoreEl.style.backgroundImage; // url:("foobar")
    let pre = bkgImgUrl.indexOf("\(\""); // if only JS had a lookbehind regex operator
    let post = bkgImgUrl.indexOf("\"\)");
    let imgUrl = bkgImgUrl.substr(pre+2, post-5);
    return imgUrl;
  }

  // draw the image url to a canvas element
  function drawToCanvas({ el, url }) {
    return new Promise(function (resolve, reject) {
      let canvas = document.createElement("canvas");
      let context = canvas.getContext('2d');
      let base_image = new Image();
      base_image.onload = () => {
        canvas.width = base_image.width;
        canvas.height = base_image.height;
        context.drawImage(base_image, 0, 0, base_image.width, base_image.height);
        resolve(canvas);
      };
      base_image.src = url;
    })
  }

  // convert the canvas to a dataUrl blob and draw it into the jsPdf document
  function addCanvasToPdf(canvas) {
    pdfDoc.addImage(canvas.toDataURL(), 'PNG', 0, 0, pdfDoc.internal.pageSize.getWidth(), pdfDoc.internal.pageSize.getHeight());
  }

  // check if we're on the last page of the sheet music
  // (since we're compiling the pdf manually from the individual free images)
  function checkIsLastPage() {
    let rightButton = document.querySelectorAll('#rightbut2')[0];
    if (rightButton && rightButton.style.visibility === 'hidden') { // buttons aren't displayed on sheet music with single pages
      return true;
    }
    return rightButton.style.background.indexOf("rgb(192, 192, 192)"); // greyed out
  }

  // display loading indicator
  function setLoading() {
    let loadingDiv = document.createElement('div');
    Object.assign(loadingDiv.style, {
      width: '100%',
      border: '1px solid black',
      position: 'absolute',
      padding: '5em 0',
      top: '0',
      left: '0',
      backgroundColor: 'mintcream',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 999999,
    });
    loadingDiv.textContent = "generating your PDF, please wait...";
    loadingDiv.className = "loadingDiv";
    document.body.appendChild(loadingDiv);
  }

  // remove loading indicator, notify of success, prompt for download
  function completeLoading({ formattedTitle, getFile }) {
    const loadingDiv = document.querySelector('.loadingDiv');
    const downloadLink = document.createElement('a');
    downloadLink.onclick = getFile;
    downloadLink.target = '_blank';
    downloadLink.textContent = 'download PDF';
    downloadLink.style.cursor = 'pointer';
    loadingDiv.innerHTML = `thanks for waiting!<div>your download of <i>${formattedTitle}</i> is beginning now.</div>to manually download the file, click here: `;
    loadingDiv.appendChild(downloadLink);
    setTimeout(() => {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }, 5000);
  }

  // tie it all together. let's get to pdf-ing!
  async function main() {
    setLoading();
    const pdfDoc = await initPdf();

    async function addCurrentScoreImgToPdf() {
      const scoreEl = document.querySelectorAll('#score')[0];
      let drawnCanvas = await drawToCanvas({
        el: scoreEl,
        url: getScoreImgUrl(scoreEl),
      });
      addCanvasToPdf(drawnCanvas);
    }

    let isLastPage = checkIsLastPage();
    while (!isLastPage) {
      await addCurrentScoreImgToPdf();
      changepage('r'); // 8Notes global method for changing page, cleaner than simulating a click
      pdfDoc.addPage();
      isLastPage = checkIsLastPage();
    }

    await addCurrentScoreImgToPdf();
    const rawTitle = document.querySelector('h1').textContent;
    const formattedTitle = rawTitle.substr(0, rawTitle.indexOf('sheet music')).trim();
    completeLoading({
      getFile: () => pdfDoc.output('save', `${formattedTitle}.pdf`),
      formattedTitle,
    });
    pdfDoc.output('save', `${formattedTitle}.pdf`);
  }

  main();
})();
