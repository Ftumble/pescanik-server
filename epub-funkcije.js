const JSZip = require('jszip')
const { JSDOM } = require('jsdom')
const cheerio = require('cheerio')
const { return_epub_files } = require('./epub-parser')


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