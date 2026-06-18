exports.same_day = function (date1, date2) {
  date1 = new Date(date1)
  date2 = new Date(date2)

  return date1.getDate()     == date2.getDate()     && 
        date1.getMonth()    == date2.getMonth()    &&
        date1.getFullYear() == date2.getFullYear()
} 

exports.return_option = function (q, options) {
  for (let i = 0; i < options.length; ++i) {
    const op = options[i]
    
    if (q[op] !== undefined) return q[op];
  }

  return undefined
}

exports.respond = function (msg, obj) {
  return JSON.stringify({
    message: msg,
    obj: obj
  })
}