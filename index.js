/**
 * Run ./api.js if you want to use a server!
 */

import { readFile } from 'node:fs/promises'
import { Readable } from 'node:stream'
import Ffmpeg from 'fluent-ffmpeg'
import * as TTS from '@sefinek/google-tts-api'

export default async function main(payload, ffmpegPath = null) {
  const { text, lang = 'en', speed, pitch = 1 } = payload
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Cache-Control': 'public, max-age=31536000, immutable'
  }

  if (!text || !text.length) {
    return new Response(await readFile('./README.md'), {
      status: 200,
      statusText: '`text` is missing',
      headers: {
        'content-type': 'text/html; charset=utf-8',
        ...headers
      }
    })
  }

  const audios = await TTS.getAllAudioBase64(text, { lang })
  const ffmpeg = Ffmpeg()

  if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath)

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

  return new Response(Buffer.concat(chunks), {
    status: 200,
    headers: {
      'content-type': 'audio/mp3',
      'content-disposition': 'inline',
      ...headers
    }
  })}
