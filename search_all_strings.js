const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\jahan\\.gemini\\antigravity\\brain\\42c65725-4574-4d8b-8022-d0909dd83905\\.system_generated\\steps\\56\\content.md';

try {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  console.log('File size:', content.length, 'bytes');

  const keywords = ["rera", "pr/gj", "Vaishno", "Circle", "Gota", "Ahmedabad", "BHK", "Developer", "Lakh", "Crore", "price", "contact", "phone", "email"];
  
  console.log('\n--- Scanning for keywords (Safe Indexing) ---');
  keywords.forEach(kw => {
    let idx = -1;
    let count = 0;
    console.log(`\nMatches for "${kw}":`);
    while (true) {
      idx = content.toLowerCase().indexOf(kw.toLowerCase(), idx + 1);
      if (idx === -1) break;
      count++;
      if (count <= 3) {
        // extract context of 120 chars around it
        const start = Math.max(0, idx - 50);
        const end = Math.min(content.length, idx + 100);
        const chunk = content.substring(start, end).replace(/\n/g, ' ').trim();
        console.log(`  - Index ${idx}: ...${chunk}...`);
      }
    }
    console.log(`Total count: ${count}`);
  });

} catch (err) {
  console.error('Error reading file:', err);
}
