const fs = require('fs')

const params = JSON.parse(fs.readFileSync('./global_params.json').toLocaleString())

Object.keys(params).forEach(key => {
  exports[key] = params[key]
})