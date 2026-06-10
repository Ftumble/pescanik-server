const JSZip = require('jszip')
const { JSDOM } = require('jsdom')
const cheerio = require('cheerio')


global.DOMParser = new JSDOM().window.DOMParser 

const PROXY = ''
const url = "https://pescanik.net/tekstovi/page/";
var page_count = 1;
var last_page = undefined;



function load_page(page_count) {
  if (last_page != undefined && page_count < 1 && page_count > last_page) return
  document.getElementById("rezultati").innerHTML = '';

  fetch((url + page_count))
  .then(r => r.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    var pages = doc.querySelectorAll('.paginator > a');
    const last_page = pages[pages.length - 2].getAttribute('data-page-num');
    
    const podaci = doc.querySelectorAll(".category-tekstovi");
    
    podaci.forEach(el => {
      var img = el.querySelector('.post-thumbnail-wrap') == undefined ? undefined : el.querySelector('.post-thumbnail-wrap img').getAttribute('src');
      var link = el.querySelector('.entry-title a').getAttribute('href');
      var naziv = el.getAttribute('data-name');
      var autor = el.querySelector('.fn').textContent;
      

    });
  });
}

async function generisi_bez_slike(tekst, autor, link, datum) {
  const resp = await fetch((link))
  const html = await resp.text();
  const $ = cheerio.load(html);
  
  var output = '';

  $('.entry-content > p').each(function (i, el) {        
    output +=  `<p class="calibre4">${$(el).html()}</p>`;
  })
  
  const zip_object = return_epub_files(output, tekst, autor, datum, undefined);
  const zip = new JSZip();
  zip.file('META-INF/container.xml', zip_object.container);
  zip.file('content.opf', zip_object.content_opf);
  zip.file('mimetype', zip_object.mimetype);
  zip.file('page_styles.css', zip_object.page_style_css);
  zip.file('stylesheet.css', zip_object.stylesheet_css);
  zip.file('titlepage.xhtml', zip_object.titlepage_xhtml);
  zip.file('toc.ncx', zip_object.toc_ncx);

  return { naslov: `${tekst}, ${autor}`, 
    title: tekst,
    autor: autor,
    datum: datum, 
    link: link,
    content: zip };
} 

async function generisi_sa_slikom(tekst, autor, link, datum, slika) {
  const resp = await fetch((link))
  const html = await resp.text();
  const $ = cheerio.load(html);
  
  var output = '';

  $('.entry-content > p').each(function (i, el) {    
    output +=  `<p class="calibre4">${$(el).html()}</p>`;
  })

  const resp_slika = await fetch(slika);
  const bytes = await resp_slika.arrayBuffer();      
  
  const zip_object = return_epub_files(output, tekst, autor, datum, slika);
  const zip = new JSZip();
  zip.file('META-INF/container.xml', zip_object.container);
  zip.file('content.opf', zip_object.content_opf);
  zip.file('mimetype', zip_object.mimetype);
  zip.file('page_styles.css', zip_object.page_style_css);
  zip.file('stylesheet.css', zip_object.stylesheet_css);
  zip.file('titlepage.xhtml', zip_object.titlepage_xhtml);
  zip.file('toc.ncx', zip_object.toc_ncx);
  zip.file('cover.jpg', bytes);

  return { naslov: `${tekst}, ${autor}`, 
    title: tekst,
    autor: autor,
    datum: datum, 
    slika: slika,
    link: link,
    content: zip };
} 

async function zipuj_epube(epub) {
    const zip = JSZip();
    console.log(epub);
    
    const bytes = await epub.content.generateAsync({ type: 'uint8array' });
    zip.file(epub.naslov + '.epub', bytes)

    return zip
  } 
function return_epub_files(tekst, title, autor, datum, slika) {
  const ima_slike = slika != undefined;
  const container = 
`<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
</rootfiles>
</container>`;
  const content_opf = 
`<?xml version="1.0"  encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="uuid_id">
<metadata xmlns:opf="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:calibre="http://calibre.kovidgoyal.net/2009/metadata">
<dc:title>${title}</dc:title>
<dc:creator opf:role="aut" opf:file-as="${autor}">${autor}</dc:creator>
<dc:contributor opf:role="bkp">calibre (8.10.0) [https://calibre-ebook.com]</dc:contributor>
<dc:date>0101-01-01T00:00:00+00:00</dc:date>
<dc:identifier id="uuid_id" opf:scheme="uuid">1b26e289-f393-4fa4-a7cc-c74434428e5e</dc:identifier>
<dc:language>en</dc:language>
<dc:identifier opf:scheme="calibre">1b26e289-f393-4fa4-a7cc-c74434428e5e</dc:identifier>
<meta name="calibre:title_sort" content="${title}"/>
<meta name="calibre:timestamp" content="${datum}"/>
<meta name="cover" content="cover"/>
</metadata>
<manifest>
<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>
<item id="txt" href="txt.html" media-type="application/xhtml+xml"/>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
<item id="page_css" href="page_styles.css" media-type="text/css"/>
<item id="css" href="stylesheet.css" media-type="text/css"/>
${ima_slike ? '<item id="cover" href="cover.jpeg" media-type="image/jpeg"/>' : ''}
</manifest>
<spine toc="ncx">
<itemref idref="titlepage"/>
</spine>
<guide>
<reference type="cover" href="titlepage.xhtml" title="Cover"/>
</guide>
</package>`;
  const mimetype = 'application/epub+zip'
  const page_style_css = 
`@page {
margin-bottom: 5pt;
margin-top: 5pt;
}`;
  const stylesheet_css = 
`.calibre {
display: block;
font-size: 1em;
line-height: 1.2;
padding-left: 0;
padding-right: 0;
margin: 0 5pt;
}
.calibre1 {
display: block;
font-size: 1.375em;
font-weight: bold;
line-height: 1.2;
text-align: center;
margin: 0.83em 0;
}
.calibre2 {
font-size: 1.09091em;
line-height: 1.2;
margin-bottom: 0.5em;
}
.calibre3 {
display: block;
text-align: center;
margin: 1em 0;
}
.calibre4 {
display: block;
margin: 1em 0;
}
.calibre5 {
display: block;
font-size: 1.125em;
font-weight: bold;
line-height: 1.2;
margin: 1em 0;
}
.calibre6 {
display: block;
}
.calibre7 {
display: block;
font-size: 1.375em;
font-weight: bold;
line-height: 1.2;
margin: 0.83em 0;
}`;
  const titlepage_xhtml = '<?xml version=\'1.0\' encoding=\'utf-8\'?>' +
'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">' +
'<head>' +
  '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>' +
  '<meta name="calibre:cover" content="true"/>' +
  '<title>Cover</title>' +
'<link rel="stylesheet" type="text/css" href="stylesheet.css"/>' +
'</head>' +
`<${'b'}ody>` +
  '<div>' +
      `${ima_slike ? '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="470" height="270" viewBox="0 0 470 270"  style="margin: auto; display: block;" preserveAspectRatio="none">\n<image width="470" height="270"  xlink:href="cover.jpg"/>\n</svg>' : ''}` +
      `<h1 id="page_1" class="calibre1"><span class="calibre2">${title}</span></h1><h2 id="page_1" class="calibre1"><span class="calibre2"><i>${autor}</i></span></h2>${tekst}` +
  '</div>' +
`</${'b'}ody>` +
'</html>';
  const toc_ncx =`<?xml version='1.0' encoding='utf-8'?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="eng">
<head>
<meta name="dtb:uid" content="1b26e289-f393-4fa4-a7cc-c74434428e5e"/>
<meta name="dtb:depth" content="2"/>
<meta name="dtb:generator" content="calibre (8.10.0)"/>
<meta name="dtb:totalPageCount" content="0"/>
<meta name="dtb:maxPageNumber" content="0"/>
</head>
<docTitle>
<text>${title}, ${autor}</text>
</docTitle>
<navMap>
<navPoint id="uPAUCsBZWK7jkMWOChhaRiD" playOrder="1">
<navLabel>
  <text>Start</text>
</navLabel>
<content src="titlepage.xhtml"/>
</navPoint>
</navMap>
</ncx>
`;

  return { 
    container: container,
    content_opf: content_opf,
    mimetype: mimetype,
    page_style_css: page_style_css,
    stylesheet_css: stylesheet_css,
    titlepage_xhtml: titlepage_xhtml,
    toc_ncx: toc_ncx
  }

}    

async function danasnji_tekstovi() {
  //document.getElementById("rezultati").innerHTML = '';

  const resp = await fetch((url + 1))
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  /*var pages = doc.querySelectorAll('.paginator > a');
  last_page = pages[pages.length - 2].getAttribute('data-page-num');*/

  const podaci = doc.querySelectorAll(".category-tekstovi");
  var epubs = [];
  var sadasnjost = new Date(Date.now())
  sadasnjost = new Date(sadasnjost.getFullYear(), sadasnjost.getMonth(), sadasnjost.getDate())
  sadasnjost.setHours(2, 0, 0, 0)
  console.log(sadasnjost);
  

  for (let i = 0; i < podaci.length; ++i) {
    var el = podaci[i];

    var img = el.querySelector('.post-thumbnail-wrap') == undefined ? undefined : el.querySelector('.post-thumbnail-wrap img').getAttribute('src');
    var link = el.querySelector('.entry-title a').getAttribute('href');
    var naziv = el.getAttribute('data-name');
    var autor = el.querySelector('.fn').textContent;
    var datum = el.querySelector('.entry-meta .data-link time').getAttribute('datetime');
    
    if (Number(sadasnjost) >= Date.parse(datum)) break

    //console.log('prosao', datum);
  

    const epub = img == undefined ? await generisi_bez_slike(naziv, autor, link, datum) : await generisi_sa_slikom(naziv, autor, link, datum, img);
    epubs.push(epub);
  }

  return epubs
}

async function load_first_page() {
  //document.getElementById("rezultati").innerHTML = '';
  console.log(url + 1);
  
  const resp = await fetch((url + 1))
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  /*var pages = doc.querySelectorAll('.paginator > a');
  last_page = pages[pages.length - 2].getAttribute('data-page-num');*/
  
  const podaci = doc.querySelectorAll(".category-tekstovi");
  var epubs = [];
  for (let i = 0; i < podaci.length; ++i) {
    var el = podaci[i];

    var img = el.querySelector('.post-thumbnail-wrap') == undefined ? undefined : el.querySelector('.post-thumbnail-wrap img').getAttribute('src');
    var link = el.querySelector('.entry-title a').getAttribute('href');
    var naziv = el.getAttribute('data-name');
    var autor = el.querySelector('.fn').textContent;
    var datum = el.querySelector('.entry-meta .data-link time').getAttribute('datetime');

    const epub = img == undefined ? await generisi_bez_slike(naziv, autor, link, datum) : await generisi_sa_slikom(naziv, autor, link, datum, img);
    epubs.push(epub);
  }

  zipuj_epube(epubs)
}

function daj_epub_obj(link) {
  fetch((url + page_count))
  .then(r => r.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    var pages = doc.querySelectorAll('.paginator > a');
    const last_page = pages[pages.length - 2].getAttribute('data-page-num');
    
    const podaci = doc.querySelectorAll(".category-tekstovi");
    
    podaci.forEach(el => {
      var img = el.querySelector('.post-thumbnail-wrap') == undefined ? undefined : el.querySelector('.post-thumbnail-wrap img').getAttribute('src');
      var link = el.querySelector('.entry-title a').getAttribute('href');
      var naziv = el.getAttribute('data-name');
      var autor = el.querySelector('.fn').textContent;
    })
  });
}

function daj_epub(epub_obj) {

}

exports.daj_epub_obj = daj_epub_obj
exports.daj_epub = daj_epub
exports.danasnji_tekstovi = danasnji_tekstovi