import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import pc from 'picocolors';

async function main() {
  console.log(pc.bgBlue(pc.white(' OMNIRULE INSTALLATION ENGINE ')));

  const args = process.argv.slice(2);
  const isOpencode = args.includes('--opencode');
  
  // Resolve Target Directory
  let targetDir: string;
  if (isOpencode) {
    targetDir = path.join(os.homedir(), '.config', 'opencode');
  } else {
    targetDir = path.join(process.cwd(), '.omnirule-local');
  }

  console.log(`${pc.blue('i')} Target Location: ${pc.cyan(targetDir)}`);

  try {
    // 1. Ensure Target Directory Exists
    await fs.ensureDir(targetDir);
    console.log(`${pc.green('✔')} Target directory ready.`);

    // 2. Define Assets to Copy
    const assets = [
      { src: 'userspec/opencode.json', dest: 'opencode.json' },
      { src: 'agents', dest: 'agents' },
      { src: 'commands', dest: 'commands' },
      { src: 'instructions', dest: 'instructions' },
      { src: 'rules', dest: 'rules' },
      { src: 'skills', dest: 'skills' },
      { src: 'plugins', dest: 'plugins' },
      { src: 'packages/core/src/tools', dest: 'tools' },
      { src: 'packages/core/src/lib', dest: 'lib' },
      { src: 'index.ts', dest: 'index.ts' },
      { src: 'package.json', dest: 'package.json' }
    ];

    console.log(`${pc.blue('i')} Deploying OmniRule assets...`);

    for (const asset of assets) {
      const srcPath = path.join(process.cwd(), asset.src);
      const destPath = path.join(targetDir, asset.dest);

      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath, { overwrite: true });
        console.log(`  ${pc.green('→')} ${pc.white(asset.src.padEnd(30))} [DEPLOYED]`);
      } else {
        console.log(`  ${pc.yellow('!')} ${pc.white(asset.src.padEnd(30))} [SKIPPED - NOT FOUND]`);
      }
    }

    // 3. Patch package.json in target to fix script paths
    const targetPkgPath = path.join(targetDir, 'package.json');
    if (await fs.pathExists(targetPkgPath)) {
      const pkg = await fs.readJson(targetPkgPath);
      if (pkg.scripts) {
        for (const [key, value] of Object.entries(pkg.scripts)) {
          if (typeof value === 'string' && value.includes('tsx packages/core/src/')) {
            // Flatten paths: packages/core/src/tools/x.ts -> tools/x.ts
            pkg.scripts[key] = value.replace('packages/core/src/', '');
          }
        }
        await fs.writeJson(targetPkgPath, pkg, { spaces: 2 });
        console.log(`${pc.green('✔')} Script paths patched for global environment.`);
      }
    }

    // 4. Patch opencode.json in target to replace {{CONFIG_DIR}}
    const targetConfigPath = path.join(targetDir, 'opencode.json');
    if (await fs.pathExists(targetConfigPath)) {
      let configStr = await fs.readFile(targetConfigPath, 'utf-8');
      configStr = configStr.replace(/\{\{CONFIG_DIR\}\}/g, targetDir);
      await fs.writeFile(targetConfigPath, configStr);
      console.log(`${pc.green('✔')} opencode.json dynamic paths resolved.`);
    }

    // 5. Finalization
    console.log(`\n${pc.bgGreen(pc.black(' INSTALLATION SUCCESSFUL '))}`);
    console.log(`${pc.blue('i')} OmniRule fleet is now configured at: ${pc.bold(targetDir)}`);
    console.log(`${pc.yellow('★')} NEXT STEP: You can now use OpenCode with this global configuration.`);
    
    if (isOpencode) {
      console.log(pc.gray(`Configured with --opencode flag for system-wide agent orchestration.`));
    }

  } catch (error: any) {
    console.error(`\n${pc.bgRed(pc.white(' INSTALLATION FAILED '))}`);
    console.error(pc.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

main().catch(console.error);
