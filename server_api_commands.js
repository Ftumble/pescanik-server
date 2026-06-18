const { lvl_to_int, version } = require('./global_params')
const srvrapicoms = require('./server_api_commands_insances')

exports.load_api_commands = function (commands) {
  add_command = function (name, func, lvl) {
    if (commands[name] === undefined) {
      commands[name] = {
        func: func,
        lvl, lvl
      }
    }
  }

  Object.keys(srvrapicoms).forEach(k => {
    add_command(k, srvrapicoms[k].func, srvrapicoms[k].lvl)
  })
}