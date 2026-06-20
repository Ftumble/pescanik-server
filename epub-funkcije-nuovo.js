const JSZip = require('jszip')
const { JSDOM } = require('jsdom')
const cheerio = require('cheerio')
const fs = require('fs')
const {
  same_day
} = require('./useful_funcs')

const black_list = [
  'https://pescanik.net/donacije/'
]

const download_options = [
  "danasnji", "jucerasnji", "od_autora", "datuma", "sve"
]

const download_options_aliases = {
  'd': 'danasnji', 'j': 'jucerasnji', 'o': 'od_autora', 'da': 'datuma', 's': 'sve'
}

const download_GLOBAL_info = {
  set_autor: undefined,
  set_date: undefined,
  set_option: download_options[0]
}

const URL = 'https://pescanik.net/sitemap_index.xml'

const GLOBAL_INFO = {
  last_saved: undefined,
  last_loaded: undefined,
  loaded_output: 'loaded_sitemap_explorer.json',
  loaded_today: function() {
    if (this.last_loaded === undefined) return false

    return same_day(Date.now(), this.last_loaded)
  }
}

function sitemap_default() {
  return {
    root: URL,
    curr: URL
  }
}

var sitemap_explorer = sitemap_default();

async function load_sitemap(url) {
  if (url == undefined) {
    sitemap_explorer = sitemap_default();

    url = URL
  } else if (sitemap_explorer[url] != undefined) {
    return;
  }
    
  sitemap_explorer[url] = [];
  console.log(`[${url}] loading`);
  const resp = await fetch(url)
  
  const html = await resp.text();
  //console.log(html);
  
  const $ = cheerio.load(html);

  const redovi = $('loc');

  redovi.each((i, red) => {
    const curr_url = $(red).text().trim().replaceAll('\n', '').replaceAll('\r', '');
    if (!black_list.includes(curr_url)) sitemap_explorer[url].push(curr_url)
  })

  console.log(`[${url}] loaded`);

  for (let i = 0; i < sitemap_explorer[url].length; ++i) {
    if (sitemap_explorer[url][i].includes('.xml')) await load_sitemap(sitemap_explorer[url][i])
  }
}

async function relevant_sitemap() {
  const resp = await fetch(URL)
  
  const html = await resp.text();
  //console.log(html);
  
  const $ = cheerio.load(html);

  const redovi = $('loc');

  let relevant = '';

  redovi.each((i, red) => {
    const curr_url = $(red).text().trim().replaceAll('\n', '').replaceAll('\r', '');
    if (curr_url.includes('post-sitemap')) relevant = curr_url;
  })

  console.log(relevant);
}

exports.load_sitemap = async function() {
  await load_sitemap();
  GLOBAL_INFO.last_loaded = new Date(Date.now())
}
exports.current_folder = function() {  
  return sitemap_explorer[sitemap_explorer.curr];
}
exports.root_folder = function() {
  return sitemap_explorer[sitemap_explorer.root]
}
exports.walk = function (path) {
  if (path == 'root') path = sitemap_explorer.root
  if (sitemap_explorer[path] == undefined) return false
  sitemap_explorer.curr = path;
  return true
}
exports.sitemap_explorer_clear = function() {
  sitemap_explorer = sitemap_default()
}
exports.relevant_sitemap = relevant_sitemap;
exports.save_loaded_sitemaps = async function() {
  var last_curr = sitemap_explorer.curr;
  sitemap_explorer.curr = sitemap_explorer.root
  fs.writeFileSync(GLOBAL_INFO.loaded_output, JSON.stringify(sitemap_explorer));
  sitemap_explorer.curr = last_curr

  console.log("Sacuvan sitemap_explorer u " + GLOBAL_INFO.loaded_output + "!");
}
exports.load_saved_sitemaps = async function() {
  if (fs.existsSync(GLOBAL_INFO.loaded_output)) {
    var str = fs.readFileSync(GLOBAL_INFO.loaded_output).toLocaleString();
    sitemap_explorer = JSON.parse(str);
    if (sitemap_explorer.root != URL) {
      console.log('Desila se greska prilikom ucitavanja fajla...');
      sitemap_explorer = sitemap_default()
    } else console.log('Ucitan sitemap!');
  } else {
    console.log('Ne postoji sacuvan sitemap_explorer...');
  }
}
exports.set_download_options = function (option) {
  var og_option = option
  if (!download_options.includes(option.toLowerCase())) 
    option = download_options_aliases[option];

  if (option == undefined)
  {
    console.log(`'${og_option}' nije validna opcija...`);
    return
  }

  download_GLOBAL_info.set_option = option
  console.log(`Opcija skidanja je postavljena na '${option}'`);
  
}
exports.get_download_options = async function () {
  console.log(download_GLOBAL_info.set_option == undefined ? 'Ne postoji opcija skidanja...' : "'" + download_GLOBAL_info.set_option + "'");
}
exports.download_options = {
  dwn: download_options,
  ali: download_options_aliases
}
exports.dev = function() {
  console.log(JSON.stringify(GLOBAL_INFO));
  console.log(GLOBAL_INFO.loaded_today()); 
}