const fs = require('fs');
const path = require('path');

const agentsDir = './agents';
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(agentsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Regex to find the tools line in frontmatter
  const toolsRegex = /^tools: (\{.*\})$/m;
  const match = content.match(toolsRegex);
  
  if (match) {
    try {
      // Parse the JSON-like object
      const toolsObj = JSON.parse(match[1]);
      
      // Ensure bash is true
      toolsObj.bash = true;
      
      // Re-serialize with no duplicates
      const newToolsLine = `tools: ${JSON.stringify(toolsObj)}`;
      
      content = content.replace(toolsRegex, newToolsLine);
      fs.writeFileSync(filePath, content);
      console.log(`Cleaned ${file}`);
    } catch (e) {
      console.error(`Error parsing tools in ${file}:`, e.message);
    }
  }
});
