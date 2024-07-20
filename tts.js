import fs from 'node:fs/promises'
import Ffmpeg from 'fluent-ffmpeg'
import * as TTS from '@sefinek/google-tts-api'

export default async function main(payload) {
  const { text, lang = 'en', speed = 1, pitch = 1 } = payload

  if (!text || !text.length) {
    return new Response(await fs.readFile('./README.md'), {
      status: 200,
      statusText: '`text` is missing',
      headers: {
        'content-type': 'text/html; charset=utf-8',
      }
    })
  }

  const audios = await TTS.getAllAudioBase64(text, { lang })
  const ffmpeg = Ffmpeg()
  let i = 0

  for (const audio of audios) {
    const file = `${i}.mp3`

    await fs.writeFile(file, audio.base64, 'base64')
    ffmpeg.addInput(file)
    i++
  }

  const sample = 44100
  const setrate = sample * (pitch || 1)
  const tempo = speed || (1 + (1 - pitch))

  await new Promise((resolve, reject) => ffmpeg
    .audioFilter([
      { filter: 'aresample', options: sample },
      { filter: 'asetrate', options: setrate },
      { filter: 'atempo', options: tempo },
    ])
    .on('end', resolve)
    .on('error', reject)
    .save('./output.mp3')
  )

  return new Response(await fs.readFile('./output.mp3'), {
    status: 200,
    headers: {
      'content-type': 'audio/mp3',
      'content-disposition': 'inline',
    }
  })}
