const { setTimeout } = require("timers/promises");
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
const {
  return_option,
  respond
} = require('./useful_funcs')
const { load_commands } = require('./server_commands')
const { load_api_commands } = require('./server_api_commands')
const {
  command_params
} = require('./global_params')
const {
  is_user_valid,
  user_strength
} = require('./user_handler')

function write_directory(dir) {
    for (let i = 0; i < dir.length; ++i) {
      console.log(`[${i + 1}] ${dir[i]}`);    
    }
}

function is_param(params, param) {  
  return params.split(' ').includes(param)
}

var command_dictionary = undefined

exports.handle_command_console = async function (command, acc) {
  if (command_dictionary === undefined) load_commands((command_dictionary = {}))

  const comm = command.split(' ')[0];
  const params = command.split(' ');
  var par = "";

  for (let i = 1; i < params.length; ++i) {
    par += params[i] + (i == params.length - 1 ? "" : " ");
  }
  var output;
  if (command_dictionary[comm] != undefined) output = acc >= command_dictionary[comm].lvl ? await command_dictionary[comm].func(par) : 'Access denied';
  else output = "Unknown command '" + comm + "'";

  if (output != undefined) console.log(output);
  
  return;
}

var api_command_dictionary = undefined

exports.api_handler = async function (req, resp) {
  if (api_command_dictionary === undefined) load_api_commands((api_command_dictionary = {}))
    
  const q = req.query
  console.log(JSON.stringify(q));
  const cstr = return_option(q, command_params)
  if (cstr === undefined) {
    resp.send(respond('Nema komandnog parametra...'))
    return
  }

  let u_lvl = user_strength(return_option(q, [ 'ut', 'user-token', 'token' ]))
  const com = api_command_dictionary[cstr]
  if (com === undefined) {
    resp.send(respond('Nepoznata komanda \'' + com + '\'...'))
    return
  }

  if (Number(u_lvl) < Number(com.lvl)) {
    resp.send(respond('Nemate pravo pristupa...'))
    return
  }
  

  com.func(q, resp)

  /*

  if (command == 'update') {
    exec(`start "" "C://server-update.bat" ${process.pid}`)
    setTimeout(500, () => process.kill(procId))
  }*/

  if (!resp.headersSent) console.log('Nije poslat zahtev?', JSON.stringify(q));
    
  
}