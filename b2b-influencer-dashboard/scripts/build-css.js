const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcFile = path.join(projectRoot, 'app', 'globals.source.css');
const destFile = path.join(projectRoot, 'app', 'globals.css');

async function compileCss() {
  try {
    if (!fs.existsSync(srcFile)) {
      console.error(`[build-css] Source file not found: ${srcFile}`);
      return;
    }
    const css = fs.readFileSync(srcFile, 'utf8');
    const result = await postcss([
      tailwind({ base: projectRoot })
    ]).process(css, { from: srcFile, to: destFile });

    fs.writeFileSync(destFile, result.css);
    console.log(`[build-css] Compiled globals.css successfully (${result.css.length} bytes)`);
  } catch (err) {
    console.error('[build-css] Build error:', err);
  }
}

compileCss().then(() => {
  if (process.argv.includes('--watch')) {
    console.log('[build-css] Watching for changes in app and src...');
    let debounceTimer = null;
    const triggerRecompile = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log('[build-css] File changed, recompiling...');
        compileCss();
      }, 200);
    };

    const watchDirs = [
      path.join(projectRoot, 'app'),
      path.join(projectRoot, 'src')
    ];

    watchDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
          if (!filename) return;
          if (filename.endsWith('globals.css')) return; // Ignore output file to avoid infinite loops
          if (/\.(tsx|ts|jsx|js|html|css)$/.test(filename)) {
            triggerRecompile();
          }
        });
      }
    });
  }
});

