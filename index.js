const express = require('express')
const cors = require('cors')
const fs = require('fs')
const { danasnji_tekstovi } = require('./epub-funkcije')
const readline = require('node:readline');
const { 
  handle_command_console,
  api_handler 
} = require('./command_handler')
const {
  load_sitemaps
} = require('./epub-funkcije-nuovo')
const {
  lvl_to_int,
  version
} = require('./global_params')
const { load_users } = require('./user_handler')

const app = express()

const PORT = process.env.PORT | 3000

const GIST_TOKEN = fs.readFileSync('C://server-token.txt').toLocaleString()

const CLFL_METRICS = 'http://127.0.0.1:2024{I}/metrics'
let clfl_url = undefined

async function update_github_gist() {
  const resp = await fetch('https://api.github.com/gists/075aaefa91fd318312410888a1cd81f9', {
    method: 'PATCH',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `token ${GIST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: 'Update-uje se link za pristup serveru',
      files: {
        'pescanik-url.txt': {
          content: clfl_url
        }
      }
    })
  })  

  if (!resp.ok) return false

  return true
}

async function fetch_cloudflare(i) {
  if (i == undefined) i = 1;
  if (i > 5) return;
  
  const resp = await fetch(CLFL_METRICS.replace('{I}', i), {
    signal: AbortSignal.timeout(1000)
  })

  if (resp.status <= 400) {
    clfl_url = /https:\/\/(\w|\-)+\.\w+\.com/i
      .exec(/{userHostname="https:\/\/(\w|\-)+\.\w+\.com"}/i
        .exec(await resp.text())[0]
      )[0]
    
    if (update_github_gist()) {
      console.log('Uspesno update-ovan github-gist!');
    } else {
      console.log('Doslo je do greske prilikom update-ovanja github-gist-a...');
    }
      
  } else await fetch_cloudflare(i + 1)
}

function start() {
  load_users()
  
  console.log();
  
  handle_command_console('init', lvl_to_int['programer'])

  if (process.argv.includes('-clfl'))
    { 
      fetch_cloudflare().then(() => {
        if (clfl_url == undefined) {
          console.log('Ne mogu da pronadjem cf...');
          setTimeout(1000, () => {
            start()
          })
          return;
        }
        
        console.log('Cloudflare link je: ' + clfl_url);
        
        get_command()
      })
  }
  else get_command()
}

app.listen(PORT, (err) => {
  console.log('slusam na portu ' + PORT + "...");
  start()
})

app.use(cors())

app.get('/v', (req, resp) => {
  resp.statusCode = 200
  resp.send(version)
})

app.get('/baza', (req, resp) => {
  console.log(req.ip);

  resp.statusCode = 200
  resp.send(JSON.stringify({
    autor: "David Bovie",
    knjiga: "Marsovci 1"
  }))
})

var dtekstovi = {};
var last_updated = undefined

app.get('/danasnji-tekstovi', (req, resp) => {
  console.log(req.ip + ' trazi danasnje tekstove...');
  dtekstovi = {}
  if (last_updated === undefined) last_updated = Date.now()

  danasnji_tekstovi().then(epubs => {
    var output = ''
    for (let i = 0; i < epubs.length; ++i) {
      output += epubs[i].link + (i == epubs.length - 1 ? '' : '|')
      dtekstovi[epubs[i].link] = epubs[i]
    }

    resp.send(output)
    console.log(req.ip + ' je dobio danasnje tekstove...');
  })

})

app.get("/tekst", (req, resp, err) => {
  console.log(req.ip + ' trazi tekst ' + req.query.url + '...', req.query.machine);

  if (dtekstovi[req.query.url] === undefined) resp.send('ok')
  else {
    const epub = dtekstovi[req.query.url].content;
    epub.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    }).then(epubBuffer => {
      resp.set({
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': 'attachment; filename="moja_knjiga.epub"',
        'Content-Length': epubBuffer.length
      })

      resp.send(epubBuffer)
      console.log(req.ip + ' je dobio tekst ' + req.query.url + '...');
    })
  }
})

app.get('/api', (req, resp, err) => {
  console.log(req.url);
  
  api_handler(req, resp)
})

app.get('/api/info', (req, resp, err) => {
  req.url = req.url.replace(/\?.+/i, '') + '?c=info'

  api_handler(req, resp)
})

async function get_command() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(``, command => {
    command = command.trim();
    handle_command_console(command + (command.startsWith('clfl') ? ' ' + clfl_url : ''), lvl_to_int['main-console']).then(() => {
      rl.close();
      get_command();
    })
  });
}

exports.get_cloudflare_url = function () { return clfl_url }