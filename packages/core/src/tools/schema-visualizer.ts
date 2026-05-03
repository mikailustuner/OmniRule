import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';

async function main() {
  console.log(pc.bgBlue(pc.white(' OMNIRULE SCHEMA VISUALIZER ')));
  
  const prismaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  if (!await fs.pathExists(prismaPath)) {
    console.log(pc.yellow('! No Prisma schema found. Attempting to visualize project structure instead...'));
    await visualizeProjectStructure();
    return;
  }

  const content = await fs.readFile(prismaPath, 'utf-8');
  console.log(`${pc.blue('i')} Parsing Prisma schema and generating Mermaid diagram...\n`);

  let mermaid = 'erDiagram\n';
  const lines = content.split('\n');
  let currentModel = '';

  for (const line of lines) {
    const modelMatch = line.match(/model\s+(\w+)\s+{/);
    if (modelMatch) {
      currentModel = modelMatch[1];
      continue;
    }

    if (currentModel && line.includes('}')) {
      currentModel = '';
      continue;
    }

    if (currentModel) {
      const fieldMatch = line.trim().match(/^(\w+)\s+(\w+)/);
      if (fieldMatch) {
        const [_, field, type] = fieldMatch;
        // Check for relations (simple regex)
        if (type.includes('[]') || (type !== 'String' && type !== 'Int' && type !== 'DateTime' && type !== 'Boolean')) {
           // Relation detected (very simplified logic)
           const target = type.replace('?', '').replace('[]', '');
           if (target.match(/^[A-Z]/)) {
             mermaid += `    ${currentModel} ||--o{ ${target} : "relates"\n`;
           }
        }
      }
    }
  }

  console.log(pc.bold('Mermaid ER Diagram:'));
  console.log(pc.gray('```mermaid'));
  console.log(mermaid);
  console.log(pc.gray('```'));
}

async function visualizeProjectStructure() {
  const packagesPath = path.join(process.cwd(), 'packages');
  if (!await fs.pathExists(packagesPath)) return;

  const packages = await fs.readdir(packagesPath);
  let mermaid = 'graph TD\n';

  for (const pkg of packages) {
    const pkgJsonPath = path.join(packagesPath, pkg, 'package.json');
    if (await fs.pathExists(pkgJsonPath)) {
      const pkgJson = await fs.readJson(pkgJsonPath);
      const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
      
      for (const dep in deps) {
        if (dep.startsWith('@omnirule/')) {
          const depName = dep.split('/')[1];
          mermaid += `    ${pkg} --> ${depName}\n`;
        }
      }
    }
  }

  console.log(pc.bold('Package Dependency Graph:'));
  console.log(pc.gray('```mermaid'));
  console.log(mermaid);
  console.log(pc.gray('```'));
}

main().catch(console.error);
