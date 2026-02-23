const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, fileList = []) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (e) {
        return fileList;
    }
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath, fileList);
        } else {
            if (['.tsx', '.js', '.jsx'].includes(path.extname(file))) {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

const allFiles = walk(srcDir);
const report = [];

const HEADING_REGEX = /<h([1-6])\b[^>]*>/gi;

for (const file of allFiles) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const headings = [];
        let match;

        // We only want to analyze files that actually render headings
        while ((match = HEADING_REGEX.exec(content)) !== null) {
            headings.push({
                level: parseInt(match[1]),
                index: match.index
            });
        }

        if (headings.length > 0) {
            let h1Count = 0;
            let skippedLevels = false;
            let lastLevel = 0;
            let issues = [];

            headings.forEach(h => {
                if (h.level === 1) h1Count++;

                // Check for skipped levels (e.g., h1 directly to h3) if lastLevel wasn't 0
                // and we aren't just starting a new section hierarchy (though strict WCAG doesn't strictly forbid 
                // jumping back UP to h1/h2 from h4, jumping DOWN from h2 to h4 is skipped).
                if (lastLevel > 0 && h.level > lastLevel + 1) {
                    skippedLevels = true;
                    issues.push(`Skipped heading level: h${lastLevel} -> h${h.level}`);
                }
                lastLevel = h.level;
            });

            if (h1Count > 1) {
                issues.push(`Multiple h1 tags found (${h1Count})`);
            } else if (h1Count === 0 && file.endsWith('page.tsx')) {
                // It's a page component without an h1 (might be inherited from layout, but worth noting)
                issues.push(`Page component has no h1 tag`);
            }

            if (issues.length > 0) {
                report.push({
                    file: path.relative(__dirname, file),
                    headings: headings.map(h => `h${h.level}`),
                    issues
                });
            }
        }
    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
}

fs.writeFileSync(path.join(__dirname, 'heading-audit-report.json'), JSON.stringify(report, null, 2));
console.log(`Audited ${allFiles.length} files. Found ${report.length} files with potential heading issues.`);
