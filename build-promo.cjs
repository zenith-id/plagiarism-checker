const fs = require('fs');
const dir = 'videos/plagiarism-checker-promo/compositions/frames';
const names = ['01-hook', '02-value', '03-stats', '04-features', '05-howitworks', '06-cta'];
const scenes = [
  ['01-hook', 0, 8.5], ['02-value', 8, 9.5], ['03-stats', 17, 8.5],
  ['04-features', 25, 10.5], ['05-howitworks', 35, 10.5], ['06-cta', 45, 10],
];

let frames = '';
for (const n of names) {
  let h = fs.readFileSync(dir + '/' + n + '.html', 'utf8');
  h = h.replace(/^<template>/, '').replace(/<\/template>\s*$/, '');
  h = h.replace(/<script src="https:\/\/cdnjs[^"]*"><\/script>/, '');
  frames += '    <template id="tpl-' + n + '">' + h.trim() + '</template>\n\n';
}

const sceneDivs = scenes.map(s =>
  '      <div class="scene" data-frame="' + s[0] + '"  data-start="' + s[1] + '"  data-duration="' + s[2] + '"></div>'
).join('\n');

const runtime = fs.readFileSync('frontend/public/promo/index.html', 'utf8')
  .match(/<!-- ===== Player runtime ===== -->[\s\S]*<\/body>/)[0];

const out =
`<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #faf9f5; }
      #stage { position: relative; width: 100%; height: 100%; overflow: hidden; background: #faf9f5; }
      .scene { position: absolute; inset: 0; opacity: 0; will-change: opacity; }
      .scene.is-active { opacity: 1; }
    </style>
  </head>
  <body>
    <div id="stage">
${sceneDivs}
    </div>

    <!-- ===== Frame templates (inlined from compositions/frames/*.html) ===== -->
${frames}
    ${runtime}
  </body>
</html>
`;

fs.writeFileSync('frontend/public/promo/index.html', out);
console.log('written', out.length, 'bytes');
