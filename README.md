# 8Notes PDF Downloader

This script enables downloading any sheet music from 8Notes as a PDF without the need for a paid subscription.

8Notes is an amazing community-supported repository of sheet music from various genres. Without a subscription, the user is limited to printing each page of the music one at a time by manually clicking through...and ain't nobody got time for that.

It is available as a JS bookmarklet or (eventually) a Chrome plugin.

## Usage

To use this script from your browser's bookmarks:

1. Copy the contents of [`bookmarklet.js`](bookmarklet.js) to your clipboard
2. Create a new bookmark in your browser of choice
3. Paste the bookmark code into the URL field of the new bookmark and name it something relevant (I suggest 8Notes Downloader, but I'm not your supervisor)
4. Navigate to any page of sheet music in the 8Notes catalogue and click on your bookmark
5. Within a few seconds you should be prompted to download the PDF of your song

## Tech

The images are scraped manually from the sheet music page and converted into [dataURLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) by first drawing them to a <canvas> element, then [jsPDF](https://github.com/MrRio/jsPDF) is used under the hood to generate the document.

[Dan's Javascript Minifier](https://www.danstools.com/javascript-minify/) is used produce the minified bookmarklet.

## Disclaimer

These PDFs aren't *quite* as good as what you'd get from a paid subscription. This script compiles a PDF from the freely available images whereas the subscription PDF is an editable document, so I encourage everybody to support the service by subscribing if possible!

I've tested this out on the latest versions of Chrome, Firefox, and Safari as of October 2018. If something isn't working for you or you'd like to test this out on another browser, please get in touch or submit a PR.

Or if it *is* working for you, I'd also be happy to hear about that - I don't bite :)
