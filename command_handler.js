const { danasnji_tekstovi } = require("./epub-funkcije");
const { 
  load_sitemap,
  current_folder,
  root_folder,
  walk,
  sitemap_explorer_clear,
  relevant_sitemap,
  save_loaded_sitemaps,
  load_saved_sitemaps,
  set_download_options,
  get_download_options,
  download_options,
  dev,
} = require("./epub-funkcije-nuovo");

function write_directory(dir) {
    for (let i = 0; i < dir.length; ++i) {
      console.log(`[${i + 1}] ${dir[i]}`);    
    }
}

function is_param(params, param) {  
  return params.split(' ').includes(param)
}

const command_dictionary = {
  exit: async function () {
    console.log('Zatvara se server...');
    process.kill(process.pid)
  },
  "clear-danasnji": async function () {
    danasnji_tekstovi = {};
  },
  echo: async function(param) {
    console.log('[SERVER]: ' + param); 
  },
  load: async function(params) {
    if (is_param(params, 'saved')) {
      await load_saved_sitemaps();
      return;
    }
    await load_sitemap();
    console.log('Sitemaps loaded, to go through them use walk-sm and ls-sm');
    if (is_param(params, 'save')) save_loaded_sitemaps()
  },
  "walk-sm": async function(params) {
    const sms = (is_param(params, "root") ? root_folder() : current_folder())
    
    if (sms == undefined) console.log('Sitemap not initialized...');
    else if (walk(params) == false) {
      console.log(`'${params}' is not a valid path...`);
      return;
    } else console.log('Current directory is changed!');
  },
  "ls-sm": async function(params) {
    const sms = (is_param("root") ? root_folder() : current_folder())
    if (sms == undefined) console.log('Sitemap not initialized...');
    else write_directory(sms);
  },
  "clear-sm": async function() {
    await sitemap_explorer_clear();
    console.log('Sitemap-explorer cache cleared!');
  },
  "relevant-sm": async function() {
    await relevant_sitemap();
  },
  "save-loaded": async function() {
    await save_loaded_sitemaps()
  },
  "set-dwn-opt": async function (params) {
    await set_download_options(params)
  },
  "dwn-opt": async function () {
    await get_download_options()
  },
  "dwn-opts": async function () {    
    for (let i = 0; i < download_options.dwn.length; ++i) {
      console.log(`'${download_options.dwn[i]}' <--> '${Object.keys(download_options.ali)[i]}'`);
    }
  },
  'clfl': async function (param) {
    if (param.split(' ').length == 1) console.log(`'${param}'`);
    else console.log('Clfl f-ja ne prima argumente...');
    
  },  
  "dev": async function() {
      await dev();
  }
}

exports.handle_command = async function (command) {
  const comm = command.split(' ')[0];
  const params = command.split(' ');
  var par = "";

  for (let i = 1; i < params.length; ++i) {
    par += params[i] + (i == params.length - 1 ? "" : " ");
  }

  if (command_dictionary[comm] != undefined) await command_dictionary[comm](par);
  else console.log("Unknown command '" + comm + "'");
  

  return;
}