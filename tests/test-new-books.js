const fs = require('fs');

console.log('🆕 Testing Newly Added Books\n');

const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));

// Identify newly added books by their UUID pattern (8 characters)
const newBooks = booksData.books.filter(book => {
  // Look for books with 8-character UUIDs (newly added)
  const uuidMatch = book.directory.match(/_([a-f0-9]{8})$/);
  return uuidMatch && uuidMatch[1].length === 8;
});

console.log(`📊 Found ${newBooks.length} newly added books`);

// Test newly added books
console.log('\n📚 Sample newly added books:');
newBooks.slice(0, 10).forEach((book, index) => {
  console.log(`${index + 1}. ${book.title}`);
  console.log(`   ID: ${book.id}`);
  console.log(`   Category: ${book.category}`);
  console.log(`   Directory: ${book.directory}`);
  
  // Check if file exists and has content
  try {
    const content = fs.readFileSync(book.path, 'utf8');
    console.log(`   ✅ File exists (${content.length} chars)`);
  } catch (error) {
    console.log(`   ❌ File missing or unreadable`);
  }
  console.log('');
});

// Check for specific books we moved
const testBooks = [
  'AI Supremacy',
  'Ace Your Foundation',
  'Are the GenAI Agents',
  'DeepSeek Disruption',
  'World War III'
];

console.log('\n🎯 Testing specific moved books:');
testBooks.forEach(searchTerm => {
  const found = newBooks.find(book => book.title.includes(searchTerm));
  if (found) {
    console.log(`✅ Found: ${found.title}`);
  } else {
    console.log(`❌ Missing: ${searchTerm}`);
  }
});

// Category breakdown for new books
console.log('\n📊 New books by category:');
const newBookCategories = {};
newBooks.forEach(book => {
  if (!newBookCategories[book.category]) newBookCategories[book.category] = 0;
  newBookCategories[book.category]++;
});

Object.entries(newBookCategories)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} books`);
  });

console.log('\n✅ New books integration test complete!');