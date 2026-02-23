const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

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

for (const file of allFiles) {
    try {
        const content = fs.readFileSync(file, 'utf8');

        // Skip files that clearly have no links or images to speed up AST parsing
        if (!content.includes('<a') && !content.includes('<Link') && !content.includes('<img') && !content.includes('<Image')) continue;

        const ast = parser.parse(content, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        });

        const issues = [];

        traverse(ast, {
            JSXOpeningElement(path) {
                const nameNode = path.node.name;
                if (!nameNode) return;

                const tagName = nameNode.name;

                // Check standard links and Next.js Links
                if (tagName === 'a' || tagName === 'Link') {
                    const attrs = path.node.attributes;

                    // 1. Check for vague link text (primitive check within text children)
                    // (A full check requires looking at children, but we'll do a simple check)

                    // 2. Check for missing rel="noopener noreferrer" on external links
                    let isExternal = false;
                    let hasRel = false;
                    let hrefValue = "";

                    for (const attr of attrs) {
                        if (attr.type === 'JSXAttribute') {
                            if (attr.name.name === 'href' && attr.value && attr.value.type === 'StringLiteral') {
                                hrefValue = attr.value.value;
                                if (hrefValue.startsWith('http')) {
                                    isExternal = true;
                                }
                            }
                            if (attr.name.name === 'rel') {
                                hasRel = true;
                            }
                        }
                    }

                    if (isExternal && !hasRel) {
                        issues.push(`Line ${path.node.loc.start.line}: External link (href="${hrefValue}") missing rel="noopener noreferrer"`);
                    }

                    // 3. Check for vague or empty links (no aria-label and empty/vague children)
                    let hasAriaLabel = false;
                    for (const attr of attrs) {
                        if (attr.type === 'JSXAttribute' && attr.name.name === 'aria-label') {
                            hasAriaLabel = true;
                        }
                    }

                    // Look at children text if no aria-label
                    if (!hasAriaLabel && path.parent.children) {
                        const textChildren = path.parent.children
                            .filter(c => c.type === 'JSXText')
                            .map(c => c.value.trim())
                            .filter(Boolean)
                            .join(' ');

                        const lowerText = textChildren.toLowerCase();
                        if (lowerText === 'اضغط هنا' || lowerText === 'المزيد' || lowerText === 'click here' || lowerText === 'more') {
                            issues.push(`Line ${path.node.loc.start.line}: Vague link text ('${textChildren}') without aria-label`);
                        }

                        // If it only wraps an icon/image and has no text and no aria label
                        if (textChildren === '' && path.parent.children.some(c => c.type === 'JSXElement')) {
                            issues.push(`Line ${path.node.loc.start.line}: Link wrapping an element (e.g. icon/image) missing text or aria-label`);
                        }
                    }
                }

                // Check Images
                if (tagName === 'img' || tagName === 'Image') {
                    const attrs = path.node.attributes;
                    let hasAlt = false;
                    let altValue = "";

                    for (const attr of attrs) {
                        if (attr.type === 'JSXAttribute') {
                            if (attr.name.name === 'alt') {
                                hasAlt = true;
                                if (attr.value && attr.value.type === 'StringLiteral') {
                                    altValue = attr.value.value;
                                }
                            }
                        }
                    }

                    if (!hasAlt) {
                        issues.push(`Line ${path.node.loc.start.line}: <${tagName}> missing 'alt' attribute`);
                    } else if (altValue === "" && tagName === "img") {
                        // Empty alt is okay for decorative, but log it for manual review
                        // issues.push(`<${tagName}> has empty 'alt' attribute (verify if decorative)`);
                    } else if (altValue.toLowerCase().includes('.png') || altValue.toLowerCase().includes('.jpg')) {
                        issues.push(`Line ${path.node.loc.start.line}: <${tagName}> alt text is a filename ('${altValue}')`);
                    }
                }
            }
        });

        if (issues.length > 0) {
            report.push({
                file: file.replace(__dirname + path.sep, ''),
                issues
            });
        }

    } catch (e) {
        console.error(`Error parsing ${file}: ${e.message}`);
    }
}

fs.writeFileSync(path.join(__dirname, 'accessibility-links-report.json'), JSON.stringify(report, null, 2));
console.log(`Audited ${allFiles.length} files for link/image accessibility. Found issues in ${report.length} files.`);
