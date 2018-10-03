/* this utility allows you to download a PDF of any 8Notes sheet music without a paid account
*
* created by Graham Batzler
* github.com/batzlerg
*
* N.B. - if possible, please purchase a subscription to 8Notes to support their service,
* this utility is only intended as a tool of convenience for the financially challenged among us
*/

(function () {
  // useful helper for setting inline styles within innerHTML
  function formatInline(str) {
    return str.replace(/\s+/g, ' ').trim();
  }

  // add jsPdf dep and initialize the pdf document
  function initPdf() {
    return new Promise(function (resolve, reject) {
      let jsPdfEl = document.createElement('script');
      jsPdfEl.type = 'text/javascript';
      jsPdfEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.4.1/jspdf.min.js';
      jsPdfEl.onload = () => resolve(new jsPDF());
      jsPdfEl.className = 'toCleanup';
      document.head.appendChild(jsPdfEl);
    })
  }

  // parse the image url of the current sheet of music
  function getScoreImgUrl(scoreEl) {
    // raw format = background-image: "url:("foobar")"
    let bkgImgUrl = scoreEl.style.backgroundImage;
    // this would be much more concise if JS had a lookbehind regex operator...
    let pre = bkgImgUrl.indexOf("\(\"");
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
  function addCanvasToPdf({ canvas, pdfDoc }) {
    const blob = canvas.toDataURL();
    const imgType = 'PNG';
    const offset = 0; // used for x and y offset
    const width = pdfDoc.internal.pageSize.getWidth();
    const height = pdfDoc.internal.pageSize.getHeight();
    pdfDoc.addImage(blob, imgType, offset, offset, width, height);
  }

  // check if we're on the last page of the sheet music
  // (since we're compiling the pdf manually from the individual free images)
  function checkIsLastPage() {
    let rightButton = document.querySelectorAll('#rightbut2')[0];
    // buttons are hidden on sheet music with a single page
    if (rightButton && rightButton.style.visibility === 'hidden') {
      return true;
    }
    // I couldn't find a better way of detecting that we've reached the end of the score
    // so I'm checking for greyed-out styles on the element
    return rightButton.style.background.includes('rgb(192, 192, 192)');
  }

  // display loading indicator
  function setLoading() {
    let loadingDiv = document.createElement('div');
    loadingDiv.className = ['loadingDiv', 'toCleanup'].join(' ');
    loadingDiv.textContent = 'generating your PDF, please wait...';
    loadingDiv.style = `
      z-index: 999999;
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 3em 0;
      border: 1px solid black;
      background-color: honeydew;
      text-align: center;
      font-size: 1.4em;`
    document.body.appendChild(loadingDiv);
  }

  // remove loading indicator, notify of success, prompt for download
  function completeLoading({ formattedTitle, promptFileDownload }) {
    const loadingDiv = document.querySelector('.loadingDiv');

    const closeAndCleanup = () => {
      const toCleanup = document.querySelectorAll('.toCleanup');
      // convert NodeList to array with .slice so we can iterate
      // more conveniently and in a cross-browser compatible way
      for (let el of [].slice.call(toCleanup)) {
        el.parentNode.removeChild(el);
      }
    };

    const closeButton = document.createElement('button');
    closeButton.onclick = closeAndCleanup;
    closeButton.ariaLabel = 'close';
    closeButton.style = `
      position: absolute;
      top: 1em;
      right: 1em;
      padding: .2em;
      background-color: mintcream;
      cursor: pointer`;
    const closeButtonInner = document.createElement('span');
    closeButtonInner.textContent = 'x';
    closeButtonInner.style = `
      display: inline-flex;
      justify-content: center;
      align-items: center;
      position: relative;
      top: -0.1em;
      height: 1.4em;
      width: 1.4em;
      font-size: 2em;
      color: silver`;
    closeButton.appendChild(closeButtonInner);

    const styles = {
      mainLine: `
        padding: .5em 0;
        font-size: 1.2em;`,
      title: `
        padding: .2em;
        text-decoration: underline;
        font-weight: bold;
      `,
    };

    const content = document.createElement('div');
    content.innerHTML = `
      thanks for waiting!
      <div style="${formatInline(styles.mainLine)}">
        your download of
        <span style="${formatInline(styles.title)}">${formattedTitle}</span>
        is beginning now.
      </div>
      to manually download the file, click here:
    `;

    const downloadLink = document.createElement('a');
    downloadLink.onclick = promptFileDownload;
    downloadLink.textContent = 'download PDF';
    downloadLink.style = 'cursor: pointer';

    loadingDiv.innerHTML = '';
    loadingDiv.appendChild(closeButton);
    loadingDiv.appendChild(content);
    loadingDiv.appendChild(downloadLink);

    setTimeout(closeAndCleanup, 500000);
  }

  // tie it all together. let's get to pdf-ing!
  async function main() {
    setLoading();
    const pdfDoc = await initPdf();

    async function addCurrentScoreImgToPdf() {
      const scoreEl = document.querySelectorAll('#score')[0];
      let canvas = await drawToCanvas({
        el: scoreEl,
        url: getScoreImgUrl(scoreEl),
      });
      addCanvasToPdf({ canvas, pdfDoc });
    }

    // loop through pages until we've added each to the PDF
    let isLastPage = checkIsLastPage();
    while (!isLastPage) {
      await addCurrentScoreImgToPdf();

      // this is 8Notes' own global change page function
      // using it is much cleaner than simulating a click in the DOM
      // buuut if the page's API changes I'll have to update this
      changepage('r');

      pdfDoc.addPage();
      isLastPage = checkIsLastPage();
    }
    // can't forget about our final page
    await addCurrentScoreImgToPdf();

    // raw format = {{Composer}} - {{Title}} sheet music for {{Instrument}}
    const rawTitle = document.querySelector('h1').textContent;
    const formattedTitle = rawTitle.substr(0, rawTitle.indexOf('sheet music')).trim();
    const promptFileDownload = () => pdfDoc.output('save', `${formattedTitle}.pdf`);

    completeLoading({ promptFileDownload, formattedTitle });
    promptFileDownload();
  }

  main();
})();
