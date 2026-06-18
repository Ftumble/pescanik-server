const {
  standard_params,
  lvl_to_int, 
  version,
  date_offset,
  date_with_offset
} = require('./global_params')
const {
  exec
} = require('child_process')
const {
  return_option,
  respond,

} = require('./useful_funcs')

exports.echo = {
  func: function (q, resp) {
    var p = return_option(q, standard_params);
    
    if (p === undefined) {
      resp.statusCode = 400
      resp.send(respond('Neadekvatan broj argumenata...'))
      return;
    }

    resp.send(respond(p))
  },
  lvl: lvl_to_int['anonim']
}

exports.update = {
  func: function (q, resp) {
    const procId = process.pid
    exec(`start "" "C://server-update.bat" ${process.pid}`)
    resp.send(respond('Server restarting...'))
    setTimeout(() => process.kill(procId), 500)
  },
  lvl: lvl_to_int['anonim']
}

exports.v = exports.version = {
  func: function (q, resp) {
    resp.send(respond('v. ' + version))
  },
  lvl: lvl_to_int['anonim']
}

exports.set_date_offset = {
  func: function (q, resp) {
    if (return_option(q, [ 'reset' ]) !== undefined) {
      date_offset.d = 0
      date_offset.m = 0
      date_offset.y = 0

      resp.send(respond('Offset resetovan!'))
      return
    }

    let d = return_option(q, [ 'd', 'dan', 'day', 'date' ])
    let m = return_option(q, [ 'm', 'mesec', 'month' ])
    let y = return_option(q, [ 'y', 'year', 'godina', 'g' ])

    if (d === undefined && m === undefined && y === undefined) {
      resp.send(respond('nije unet datum...'))
      return
    }

    date_offset.d = Number(date_offset.d | d)
    date_offset.m = Number(date_offset.m | m)
    date_offset.y = Number(date_offset.y | y)

    resp.send(respond('Promenjen offset!'))

  },
  lvl: lvl_to_int['anonim']
}

exports.get_date_offset = {
  func: function (q, resp) {
      resp.send(respond(`d: ${date_offset.d}, m: ${date_offset.m}, y:${date_offset.y}`, {

    }))
  },
  lvl: lvl_to_int['anonim']
}

exports.info = {
  func: function (q, resp) {

    resp.send(respond(`Lista dostupnih komandi`, Object.keys(exports)))
  },
  lvl: lvl_to_int['anonim']
}