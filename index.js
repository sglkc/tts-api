import fs from 'node:fs'
import * as TTS from '@sefinek/google-tts-api'
import Ffmpeg from 'fluent-ffmpeg'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'

const app = Fastify()

app.register(fastifyHelmet)
app.register(fastifyCors, { origin: '*' })
app.get('/', handler)
app.post('/', handler)
app.listen({ port: 3000 }).then(console.log).catch(console.error)

async function handler(req, res) {
  const payload = Object.assign({}, req.query, req.body)
  const { text, lang = 'en', speed = 1, pitch = 1 } = payload

  if (!text || !text.length) {
    res.header('content-type', 'text/html; charset=utf-8')
    res.code(400).send(
      `<pre>
Request: Supports GET and POST, query and body, JSON and form body.
Options:
  text  (required)     Text to read
  lang  (default: en)  Speaker language, reference: https://developers.google.com/admin-sdk/directory/v1/languages
  speed (default: 1)   Audio speed, higher value is faster
  pitch (default: 1)   Audio pitch, higher value is higher (yeah)
Example:
  (original female) <a href="/?text=こんにちは&lang=ja">/?text=こんにちは&lang=ja</a>
  (male pitch) <a href="/?text=こんにちは&lang=ja&pitch=0.8">/?text=こんにちは&lang=ja&pitch=0.8</a>
</pre>`
    )

    return res
  }

  const audios = await TTS.getAllAudioBase64(text, { lang })
  const ffmpeg = Ffmpeg()

  audios.forEach((audio, id) => {
    const file = `${id}.mp3`

    fs.writeFileSync(file, audio.base64, 'base64')
    ffmpeg.addInput(file)
  })

  const sample = 44100
  const setrate = sample * (pitch || 1)
  const tempo = speed || (1 + (1 - pitch))

  ffmpeg
    .audioFilter([
      { filter: 'aresample', options: sample },
      { filter: 'asetrate', options: setrate },
      { filter: 'atempo', options: tempo },
    ])
    .on('end', () => {
      const buffer = fs.readFileSync('output.mp3')

      res.header('content-disposition', 'inline')
      res.header('content-type', 'audio/mp3')
      res.send(buffer)
    })
    .on('error', (err) => {
      console.error(err)
      res.code(500).send(err)
    })
    .save('./output.mp3')

  return res
}
