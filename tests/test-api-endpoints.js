const fs = require('fs');
const path = require('path');

console.log('🧪 Testing API Endpoints and Data Integrity\n');

// Test 1: Books manifest
console.log('📚 Testing books manifest...');
try {
  const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
  console.log('✅ books.json loaded successfully');
  console.log(`✅ Total books: ${booksData.totalBooks}`);
  console.log(`✅ Books array length: ${booksData.books.length}`);
  
  if (booksData.totalBooks !== booksData.books.length) {
    console.log('❌ Mismatch between totalBooks and books array length');
  }
} catch (error) {
  console.log('❌ Failed to load books.json:', error.message);
}

// Test 2: Book file integrity
console.log('\n📁 Testing book file integrity...');
const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
let validBooks = 0;
let invalidBooks = 0;

booksData.books.slice(0, 20).forEach(book => {
  try {
    fs.accessSync(book.path);
    const content = fs.readFileSync(book.path, 'utf8');
    if (content.length > 100) {
      validBooks++;
    } else {
      console.log(`⚠️ Book too short: ${book.title}`);
      invalidBooks++;
    }
  } catch (error) {
    console.log(`❌ Missing file: ${book.path}`);
    invalidBooks++;
  }
});

console.log(`✅ Valid books (sample): ${validBooks}/20`);
if (invalidBooks > 0) {
  console.log(`❌ Invalid books (sample): ${invalidBooks}/20`);
}

// Test 3: Category distribution
console.log('\n📊 Testing category distribution...');
const categories = {};
booksData.books.forEach(book => {
  if (!categories[book.category]) categories[book.category] = 0;
  categories[book.category]++;
});

const sortedCategories = Object.entries(categories)
  .sort((a, b) => b[1] - a[1]);

console.log('Top categories:');
sortedCategories.slice(0, 8).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} books`);
});

// Test 4: ID uniqueness
console.log('\n🔍 Testing book ID uniqueness...');
const ids = new Set();
let duplicates = 0;
booksData.books.forEach(book => {
  if (ids.has(book.id)) {
    console.log(`❌ Duplicate ID found: ${book.id}`);
    duplicates++;
  } else {
    ids.add(book.id);
  }
});

if (duplicates === 0) {
  console.log('✅ All book IDs are unique');
} else {
  console.log(`❌ Found ${duplicates} duplicate IDs`);
}

// Test 5: Required fields
console.log('\n🏷️ Testing required fields...');
let missingFields = 0;
booksData.books.slice(0, 10).forEach(book => {
  const required = ['id', 'title', 'category', 'directory', 'path'];
  required.forEach(field => {
    if (!book[field]) {
      console.log(`❌ Missing ${field} in book: ${book.title || 'Unknown'}`);
      missingFields++;
    }
  });
});

if (missingFields === 0) {
  console.log('✅ All required fields present (sample)');
} else {
  console.log(`❌ Found ${missingFields} missing fields (sample)`);
}

console.log('\n🎉 Testing complete!');