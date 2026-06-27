const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
    { regex: /bg-white(?!\s+dark:)/g, replace: 'bg-white dark:bg-gray-800' },
    { regex: /text-gray-900(?!\s+dark:)/g, replace: 'text-gray-900 dark:text-white' },
    { regex: /text-gray-800(?!\s+dark:)/g, replace: 'text-gray-800 dark:text-gray-100' },
    { regex: /text-gray-700(?!\s+dark:)/g, replace: 'text-gray-700 dark:text-gray-200' },
    { regex: /text-gray-600(?!\s+dark:)/g, replace: 'text-gray-600 dark:text-gray-300' },
    { regex: /text-gray-500(?!\s+dark:)/g, replace: 'text-gray-500 dark:text-gray-400' },
    { regex: /bg-gray-50(?!\s+dark:)/g, replace: 'bg-gray-50 dark:bg-gray-700' },
    { regex: /bg-gray-100(?!\s+dark:)/g, replace: 'bg-gray-100 dark:bg-gray-700' },
    { regex: /border-gray-200(?!\s+dark:)/g, replace: 'border-gray-200 dark:border-gray-700' },
    { regex: /border-gray-300(?!\s+dark:)/g, replace: 'border-gray-300 dark:border-gray-600' },
    { regex: /bg-background(?!\s+dark:)/g, replace: 'bg-background dark:bg-transparent' } // Let the parent's dark:bg-gray-900 shine through
];

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const { regex, replace } of replacements) {
                if (regex.test(content)) {
                    content = content.replace(regex, replace);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(srcDir);
console.log('Done.');
