<pre>
Request: Supports GET and POST, query and body, JSON and FormData.
Options:
  text  (required)     Text to read
  lang  (default: en)  Speaker language, reference:
                       https://developers.google.com/admin-sdk/directory/v1/languages
  speed (default: 1)   Audio speed, higher value is faster
  pitch (default: 1)   Audio pitch, higher value is higher (yeah)
Example:
  (original female) <a href="/?text=こんにちは&lang=ja">/?text=こんにちは&lang=ja</a>
  (male pitch) <a href="/?text=こんにちは&lang=ja&pitch=0.8">/?text=こんにちは&lang=ja&pitch=0.8</a>
  (json) { "text": "Selamat dunia", "lang": "id" }
Repository:
  Please leave a star <a href="https://github.com/sglkc/tts-api">https://github.com/sglkc/tts-api</a> ;)
</pre>
