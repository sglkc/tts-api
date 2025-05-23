import main from "../index.js"

export default async function handler(req) {
  const body = await req.json().catch(() => false)
  const form = await req.formData().catch(() => false)
  const query = Object.fromEntries(new URL(req.url).searchParams)
  const payload = Object.assign({}, body, form, query)

  try {
    return await main(payload, '/tmp/', '/var/task/bin/ffmpeg')
  } catch (error) {
    return new Response(error, {
      status: 500,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      }
    })
  }
}
