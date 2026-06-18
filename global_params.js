const fs = require('fs')

const params = JSON.parse(fs.readFileSync('./global_params.json').toLocaleString())

Object.keys(params).forEach(key => {
  exports[key] = params[key]
})

exports.date_offset = {
  d: 0,
  m: 0,
  y: 0
}

exports.date_with_offset = function (date) {
  date = new Date(date)

  date.setDate(date.getDate() - exports.date_offset.d);
  date.setMonth(date.getMonth() - exports.date_offset.m);
  date.setFullYear(date.getFullYear() - exports.date_offset.y);

  return date
}