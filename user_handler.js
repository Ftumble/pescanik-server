const { lvl_to_int } = require('./global_params')

const users = {}

const user_types = function () {
  return Object.keys(lvl_to_int)
}

exports.type_of_user = function (u_id) {
  const l = user_types()

  for (let i = 0; i < l.length; ++i) {
    if (users[l[i]].includes(u_id)) return l[i]
  }

  return undefined
}

exports.is_user_valid = function (u_id) {
  const l = user_types()

  for (let i = 0; i < l.length; ++i) {
    if (users[l[i]].includes(u_id)) return true
  }


  return false
}

exports.user_strength = function (u_id) {
  const l = user_types()

  for (let i = 0; i < l.length; ++i) {
    if (users[l[i]].includes(u_id)) return lvl_to_int[l[i]]
  }

  return -1
}

exports.load_users = function () {
  user_types().forEach(u_type => {
    users[u_type] = []
  })

  users['programer'].push('&*&*&*&*')
  users['main-console'].push('$%$%$%$%')
  users['admin'].push('0')
  users['anonim'].push(undefined)
  users['anonim'].push('undefined')
  users['anonim'].push(null)
  users['anonim'].push('null')  
}