import fs, { readFile } from 'node:fs/promises'
import { Readable } from 'node:stream'
import Ffmpeg from 'fluent-ffmpeg'
import * as TTS from '@sefinek/google-tts-api'
import { execSync } from 'node:child_process'

export default async function main(payload) {
  const { text, lang = 'en', speed, pitch = 1 } = payload
  const dir = await fs.readdir('/opt/build/repo/bin')

  console.log(process.env, dir)
  console.log(execSync("/opt/build/repo/bin/ffmpeg --help", { stdio: 'inherit' }).toString())

  if (!text || !text.length) {
    return new Response(await readFile('./README.md'), {
      status: 200,
      statusText: '`text` is missing',
      headers: {
        'content-type': 'text/html; charset=utf-8',
      }
    })
  }

  const audios = await TTS.getAllAudioBase64(text, { lang })
  const ffmpeg = Ffmpeg()

  audios.forEach(({ base64 }) => {
    const buffer = Buffer.from(base64, 'base64')
    const stream = Readable.from(buffer)

    ffmpeg.addInput(stream).format('mp3')
  })

  const sample = 44100
  const setrate = sample * pitch
  const tempo = speed || (1 + (1 - pitch))
  const chunks = []

  await new Promise((resolve, reject) => ffmpeg
    .audioFilter([
      { filter: 'aresample', options: sample },
      { filter: 'asetrate', options: setrate },
      { filter: 'atempo', options: tempo },
    ])
    .on('end', resolve)
    .on('error', reject)
    .outputFormat('mp3')
    .pipe()
    .on('data', chunk => chunks.push(chunk))
  )

  const result = Buffer.concat(chunks)

  return new Response(result, {
    status: 200,
    headers: {
      'content-type': 'audio/mp3',
      'content-disposition': 'inline',
    }
  })}
