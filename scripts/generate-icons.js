const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if sharp is available, install if not
try {
  require.resolve('sharp');
} catch {
  console.log('Installing sharp...');
  execSync('npm install sharp --no-save', { stdio: 'inherit' });
}

const sharp = require('sharp');

const svgPath = path.join(__dirname, 'icon-source.svg');
const svgBuffer = fs.readFileSync(svgPath);

const rootDir = path.join(__dirname, '..');

// Define all the output targets
const targets = [
  // Web favicon & navbar logo
  { path: path.join(rootDir, 'public', 'logo.png'), size: 192 },
  { path: path.join(rootDir, 'src', 'assets', 'logo', 'logo.png'), size: 512 },

  // Android launcher icons (ic_launcher)
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-ldpi', 'ic_launcher.png'), size: 36 },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-mdpi', 'ic_launcher.png'), size: 48 },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-hdpi', 'ic_launcher.png'), size: 72 },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xhdpi', 'ic_launcher.png'), size: 96 },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxhdpi', 'ic_launcher.png'), size: 144 },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png'), size: 192 },

  // Android launcher round icons
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-ldpi', 'ic_launcher_round.png'), size: 36, round: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-mdpi', 'ic_launcher_round.png'), size: 48, round: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-hdpi', 'ic_launcher_round.png'), size: 72, round: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xhdpi', 'ic_launcher_round.png'), size: 96, round: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxhdpi', 'ic_launcher_round.png'), size: 144, round: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher_round.png'), size: 192, round: true },

  // Android foreground icons (108dp with safe zone, rendered at 1.5x mipmap size)
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-ldpi', 'ic_launcher_foreground.png'), size: 54, foreground: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-mdpi', 'ic_launcher_foreground.png'), size: 72, foreground: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-hdpi', 'ic_launcher_foreground.png'), size: 108, foreground: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xhdpi', 'ic_launcher_foreground.png'), size: 144, foreground: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxhdpi', 'ic_launcher_foreground.png'), size: 216, foreground: true },
  { path: path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher_foreground.png'), size: 288, foreground: true },
];

async function generateIcons() {
  for (const target of targets) {
    console.log(`Generating ${target.path} (${target.size}x${target.size})...`);

    let pipeline = sharp(svgBuffer).resize(target.size, target.size);

    if (target.round) {
      // Create circular mask
      const radius = Math.floor(target.size / 2);
      const circleMask = Buffer.from(
        `<svg width="${target.size}" height="${target.size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/></svg>`
      );
      const base = await pipeline.png().toBuffer();
      pipeline = sharp(base).composite([{
        input: circleMask,
        blend: 'dest-in'
      }]);
    }

    if (target.foreground) {
      // For adaptive icons: render icon content on transparent background
      // The foreground is the full icon without background, padded to 108dp canvas
      const iconSize = Math.floor(target.size * 0.66); // icon takes ~66% of foreground canvas
      const offset = Math.floor((target.size - iconSize) / 2);
      
      const iconBuffer = await sharp(svgBuffer).resize(iconSize, iconSize).png().toBuffer();
      
      // Create transparent canvas with the icon centered
      const canvas = Buffer.from(
        `<svg width="${target.size}" height="${target.size}"><rect width="${target.size}" height="${target.size}" fill="transparent"/></svg>`
      );
      pipeline = sharp(canvas).composite([{
        input: iconBuffer,
        top: offset,
        left: offset
      }]);
    }

    await pipeline.png().toFile(target.path);
  }

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
