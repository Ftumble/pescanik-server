const express = require('express')
const cors = require('cors')
const fs = require('fs')
const { danasnji_tekstovi } = require('./epub-funkcije')


const app = express()

const PORT = process.env.PORT | 3000

app.listen(PORT, (err) => {
  console.log('slusam na portu ' + PORT + "...");
})

app.use(cors())

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
  console.log(req.ip + ' trazi tekst ' + req.query.url + '...');

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
