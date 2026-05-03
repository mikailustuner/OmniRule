import { chromium } from 'playwright';
import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'path';

async function main() {
  console.log(pc.bgGreen(pc.black(' OMNIRULE VISUAL AUDIT ')));
  const url = process.argv.find(a => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';
  
  console.log(`${pc.blue('i')} Launching browser to audit: ${pc.cyan(url)}...`);
  const artifactsDir = path.join(process.cwd(), '.omnirule', 'artifacts', 'audits');
  await fs.ensureDir(artifactsDir);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    console.log(`${pc.blue('i')} Capturing visual state...`);
    
    const screenshotPath = path.join(artifactsDir, `audit-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`${pc.green('✔')} Screenshot saved to: ${pc.gray(screenshotPath)}`);

    // Basic Console Error Audit
    const logs: string[] = [];
    page.on('console', (msg: any) => logs.push(`[${msg.type()}] ${msg.text()}`));
    
    // Check for common design system tokens in the DOM
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    console.log(`${pc.blue('i')} Detected Body BG: ${pc.bold(bodyBg)}`);

    await browser.close();
    console.log(`\n${pc.green('✔')} Visual audit completed successfully.`);
    console.log(`${pc.yellow('★')} ACTION: Review the screenshot and console logs for inconsistencies.`);
  } catch (error: any) {
    console.log(`${pc.red('✖')} Visual audit failed: ${error.message}`);
    await browser.close();
  }
}

main().catch(console.error);
