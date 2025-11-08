#!/usr/bin/env tsx
/**
 * Script to generate favicon.ico from favicon.svg
 * Run with: npm run generate:favicon
 */

import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const appDir = join(process.cwd(), 'src/app');
const faviconSvgPath = join(appDir, 'favicon.svg');
const iconSvgPath = join(appDir, 'icon.svg');
const faviconIcoPath = join(appDir, 'favicon.ico');

async function generateFavicon() {
  try {
    console.log('🔄 Generating favicon.ico from icon.svg...');
    
    // Use icon.svg as the source (or favicon.svg if icon.svg doesn't exist)
    const svgPath = existsSync(iconSvgPath) ? iconSvgPath : faviconSvgPath;
    const svgBuffer = readFileSync(svgPath);
    
    // Generate favicon.ico in app directory (Next.js App Router convention)
    // Next.js automatically serves files from src/app/ at root
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(faviconIcoPath);
    
    console.log('✅ Generated favicon.ico successfully!');
    console.log(`   - ${faviconIcoPath}`);
    console.log('\n💡 The favicon will now be visible on Vercel and in browser tabs.');
    console.log('   Note: Files are in src/app/ (Next.js App Router convention)');
    
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();

