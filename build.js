const { mkdir, copyFile, readFile, writeFile } = require('fs').promises;
const { join } /*****************************/ = require('path');
const { minify } /***************************/ = require('terser');
const rimraf /*******************************/ = require('rimraf');

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// CARE!!!
// DO NOT RENAME FILES BECAUSE IT WILL BREAK LINKS!
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function copyFilesInParallel(fileNames) {
  return Promise.all(
    fileNames.map((fileName) =>
      copyFile(fileName, join(__dirname, 'dist', fileName))
    )
  );
}

function minifyAndWriteToDist(fileName) {
  return readFile(fileName, { encoding: 'utf-8' })
    .then(minify)
    .then(({ code }) => writeFile(join(__dirname, 'dist', fileName), code));
}

function build() {
  // Clean potentially full dist directory.
  rimraf('dist', () => {
    mkdir('dist')
      .then(() =>
        copyFilesInParallel([
          'index.html',
          'index.css',
          'android-chrome-192x192.png',
          'android-chrome-512x512.png',
          'apple-touch-icon.png',
          'favicon.ico',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'site.webmanifest',
        ])
      )
      .then(() => minifyAndWriteToDist('index.js'));
    // Don't catch error and fail loudly.
  });
}

build();
