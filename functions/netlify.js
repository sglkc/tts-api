import main from "../index.js"

export default async function handler(req) {
  const body = await req.json().catch(() => false)
  const form = await req.formData().catch(() => false)
  const query = Object.fromEntries(new URL(req.url).searchParams)
  const payload = Object.assign({}, body, form, query)

  return await main(payload, '/var/task/bin/ffmpeg')
}
