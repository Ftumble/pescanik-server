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
const { load_commands } = require('./server_commands')
const {
  exec
} = require('child_process')

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

exports.api_handler = async function (req, resp) {
  if (command_dictionary === undefined) load_commands((command_dictionary = {}))

  const q = req.query

  var command
  
  if (q.c !== undefined) command = q.c
  else if (q.comm !== undefined) command = q.comm
  else if (q.command !== undefined) command = q.command

  var params

  if (q.p !== undefined) params = q.p
  else if (q.params !== undefined) params = q.params
  else if (q.parameters !== undefined) params = q.parameters

  /*if (command_dictionary[command] != undefined) output = await command_dictionary[command].func(params);
  else output = "Unknown command '" + command + "'";*/

  if (command == 'update') {
    exec(`start "" "C://server-update.bat" ${process.pid}`)
    setTimeout(500, () => process.kill(procId))
  }

  resp.send('hello')
  console.log('update-ovan?');
  
}