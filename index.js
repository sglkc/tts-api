import fs from 'node:fs'
import * as TTS from '@sefinek/google-tts-api'
import Ffmpeg from 'fluent-ffmpeg'
import Fastify from 'fastify'

const app = Fastify()

app.get('/', async (req, res) => {
  const { text, lang, speed, pitch } = req.query
  const audios = await TTS.getAllAudioBase64(text, { lang })
  const ffmpeg = Ffmpeg()

  audios.forEach((audio, id) => {
    const file = `${id}.mp3`

    fs.writeFileSync(file, audio.base64, 'base64')
    ffmpeg.addInput(file)
  })

  if (speed || pitch) {
    const sample = 44100
    const setrate = sample * (pitch || 1)
    const tempo = speed || (1 + (1 - pitchFilter))

    ffmpeg.audioFilter([
      { filter: 'aresample', options: sample },
      { filter: 'asetrate', options: setrate },
      { filter: 'atempo', options: tempo },
    ])
  }

  ffmpeg
    .on('end', () => {
      const buffer = fs.readFileSync('output.mp3')

      res.header('content-disposition', 'inline')
      res.header('content-type', 'audio/mp3')
      res.send(buffer)
    })
    .on('error', (err) => {
      console.error(err)
      res.code(500)
    })
    .save('./output.mp3')

  return res
})

app.listen({ port: 3000 }).then(console.log)
