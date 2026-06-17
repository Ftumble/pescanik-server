const { lvl_to_int } = require('./global_params')

exports.load_commands = function (commands) {
  add_command = function (name, func, lvl) {
    if (commands[name] === undefined) {
      commands[name] = {
        func: func,
        lvl, lvl
      }
    }
  }

  add_command('init', async function () {
    return ''
  }, lvl_to_int['programer'])

  add_command('exit', async function () {
    console.log('Zatvara se server...');
    process.kill(process.pid)
  }, lvl_to_int['admin'])

  add_command('clear-danasnji', async function () {
    danasnji_tekstovi = {};
    return 'Tekstovi ocisceni!'
  }, lvl_to_int['admin'])

  add_command('echo', async function(param) {
    return ('[SERVER]: ' + param);
  }, lvl_to_int['anonim'])

  add_command('load', async function(params) {
    if (is_param(params, 'saved')) {
      await load_saved_sitemaps();
      return;
    }
    await load_sitemap();
    console.log('Sitemaps loaded, to go through them use walk-sm and ls-sm'); 
    if (is_param(params, 'save')) save_loaded_sitemaps()
  }, lvl_to_int['user'])

  add_command('walk-sm', async function(params) {
    const sms = (is_param(params, "root") ? root_folder() : current_folder())
    
    if (sms == undefined) console.log('Sitemap not initialized...');
    else if (walk(params) == false) {
      console.log(`'${params}' is not a valid path...`);
      return;
    } else console.log('Current directory is changed!');
  }, lvl_to_int['user'])

  add_command('ls-sm', async function(params) {
    const sms = (is_param("root") ? root_folder() : current_folder())
    if (sms == undefined) console.log('Sitemap not initialized...');
    else write_directory(sms);
  }, lvl_to_int['user'])

  add_command('clear-sm', async function() {
    await sitemap_explorer_clear();
    console.log('Sitemap-explorer cache cleared!');
  }, lvl_to_int['user'])

  add_command("relevant-sm", async function() {
    await relevant_sitemap();
  }, lvl_to_int['user'])

  add_command("save-loaded", async function() {
    await save_loaded_sitemaps()
  }, lvl_to_int['user'])

  add_command("set-dwn-opt", async function (params) {
    await set_download_options(params)
  }, lvl_to_int['user'])

  add_command("dwn-opt", async function () {
    await get_download_options()
  }, lvl_to_int['admin'])

  add_command("dwn-opts", async function () {    
    for (let i = 0; i < download_options.dwn.length; ++i) {
      console.log(`'${download_options.dwn[i]}' <--> '${Object.keys(download_options.ali)[i]}'`);
    }
  }, lvl_to_int['admin'])

  add_command('clfl', async function (param) {
    if (param.split(' ').length == 1) console.log(`'${param}'`);
    else console.log('Clfl f-ja ne prima argumente...');
    
  }, lvl_to_int['anonim'])

  add_command("dev", async function() {
      await dev();
  }, lvl_to_int['admin'])
}