/**
 * create-icon.cjs
 * Converts src/assets/logo.png to build/icon.ico using png-to-ico
 */
const fs = require('fs');
const path = require('path');

// We'll use sharp if available, otherwise use electron's built-in nativeImage
// Actually, electron-builder can use PNG directly for Windows if it's large enough.
// We just need to ensure the icon path is correctly set.

const srcIcon = path.join(__dirname, '../src/assets/logo.png');
const destDir = path.join(__dirname, '../build');
const destIcon = path.join(destDir, 'icon.png');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(srcIcon, destIcon);
console.log(`✅ Icon copied to ${destIcon}`);
console.log('electron-builder will convert PNG → ICO automatically if the PNG is valid.');
