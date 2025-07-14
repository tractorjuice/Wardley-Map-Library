const fs = require('fs');
const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
console.log('✅ Total books:', booksData.totalBooks);
console.log('✅ Books array length:', booksData.books.length);

// Find some of the newly added books
const newBooks = booksData.books.filter(book => 
  book.title.includes('AI Supremacy') || 
  book.title.includes('GenAI Agents') || 
  book.title.includes('Ace Your Foundation')
);

console.log('\n📚 Sample newly added books:');
newBooks.slice(0, 5).forEach(book => {
  console.log('- ' + book.title);
  console.log('  ID: ' + book.id);
  console.log('  Category: ' + book.category);
});

// Check categories
const categories = {};
booksData.books.forEach(book => {
  if (!categories[book.category]) categories[book.category] = 0;
  categories[book.category]++;
});

console.log('\n📊 Top categories:');
Object.entries(categories)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([cat, count]) => console.log('  ' + cat + ': ' + count + ' books'));

// Check if any books have broken paths
console.log('\n🔍 Checking book file paths...');
let missingFiles = 0;
booksData.books.slice(0, 10).forEach(book => {
  try {
    fs.accessSync(book.path);
  } catch (e) {
    console.log('❌ Missing:', book.path);
    missingFiles++;
  }
});

if (missingFiles === 0) {
  console.log('✅ All sampled book files exist');
} else {
  console.log(`❌ Found ${missingFiles} missing files in sample`);
}