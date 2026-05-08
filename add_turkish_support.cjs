const fs = require('fs');
const path = require('path');

const skillsDir = path.join(__dirname, 'skills');
const dirs = fs.readdirSync(skillsDir);

const ruleText = `
## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
`;

let updatedCount = 0;

for (const dir of dirs) {
    const skillMdPath = path.join(skillsDir, dir, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
        let content = fs.readFileSync(skillMdPath, 'utf8');
        // Prevent duplicate appending
        if (!content.includes('Universal Language Support') && !content.includes('Turkish Native')) {
            content += '\n' + ruleText;
            fs.writeFileSync(skillMdPath, content);
            updatedCount++;
        }
    }
}

console.log(`Successfully added Turkish language support rules to ${updatedCount} skills.`);
