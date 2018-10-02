javascript:(function(){function initPdf(){return new Promise(function(resolve,reject){let jsPdfEl=document.createElement('script');jsPdfEl.type='text/javascript';jsPdfEl.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.4.1/jspdf.min.js';jsPdfEl.onload=function(){pdfDoc=new jsPDF();resolve(pdfDoc)};document.querySelector('head').appendChild(jsPdfEl)})}
function getScoreImgUrl(scoreEl){let bkgImgUrl=scoreEl.style.backgroundImage;let pre=bkgImgUrl.indexOf("\(\"");let post=bkgImgUrl.indexOf("\"\)");let imgUrl=bkgImgUrl.substr(pre+2,post-5);return imgUrl}
function drawToCanvas({el,url}){return new Promise(function(resolve,reject){let canvas=document.createElement("canvas");let context=canvas.getContext('2d');let base_image=new Image();base_image.onload=()=>{canvas.width=base_image.width;canvas.height=base_image.height;context.drawImage(base_image,0,0,base_image.width,base_image.height);resolve(canvas)};base_image.src=url})}
function addCanvasToPdf(canvas){pdfDoc.addImage(canvas.toDataURL(),'PNG',0,0,pdfDoc.internal.pageSize.getWidth(),pdfDoc.internal.pageSize.getHeight())}
function checkIsLastPage(){let rightButton=document.querySelectorAll('#rightbut2')[0];if(rightButton&&rightButton.style.visibility==='hidden'){return!0}
return rightButton.style.background==="rgb(192, 192, 192)"}
async function main(){const pdfDoc=await initPdf();async function addCurrentScoreImgToPdf(){const scoreEl=document.querySelectorAll('#score')[0];let drawnCanvas=await drawToCanvas({el:scoreEl,url:getScoreImgUrl(scoreEl),});addCanvasToPdf(drawnCanvas)}
let isLastPage=checkIsLastPage();while(!isLastPage){await addCurrentScoreImgToPdf();changepage('r');pdfDoc.addPage();isLastPage=checkIsLastPage()}
await addCurrentScoreImgToPdf();const rawTitle=document.querySelector('h1').textContent;const formattedTitle=rawTitle.substr(0,rawTitle.indexOf('sheet music')).trim();pdfDoc.output('save',`${formattedTitle}.pdf`)}
main()})()
