#!/usr/bin/env node

// TS with Lodash for Arrays
// Day 21 of 300 Days of Code Challenge

import * as readline from 'readline';
import * as _ from 'lodash';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

// ─── Types ────────────────────────────────────────────────

interface Student {
  id: number;
  name: string;
  age: number;
  grade: number;
  subject: string;
  city: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
}

// ─── Sample Data ──────────────────────────────────────────

const students: Student[] = [
  { id: 1, name: 'Henry', age: 20, grade: 88, subject: 'Math', city: 'Lagos' },
  { id: 2, name: 'Amaka', age: 22, subject: 'Science', grade: 95, city: 'Abuja' },
  { id: 3, name: 'Emeka', age: 19, subject: 'Math', grade: 72, city: 'Lagos' },
  { id: 4, name: 'Fatima', age: 21, subject: 'English', grade: 90, city: 'Kano' },
  { id: 5, name: 'Chidi', age: 23, subject: 'Science', grade: 65, city: 'Abuja' },
  { id: 6, name: 'Ngozi', age: 20, subject: 'Math', grade: 78, city: 'Lagos' },
  { id: 7, name: 'Uche', age: 22, subject: 'English', grade: 85, city: 'Port Harcourt' },
  { id: 8, name: 'Bola', age: 19, subject: 'Science', grade: 91, city: 'Lagos' },
  { id: 9, name: 'Kemi', age: 21, subject: 'Math', grade: 55, city: 'Ibadan' },
  { id: 10, name: 'Tunde', age: 24, subject: 'English', grade: 82, city: 'Lagos' },
];

const products: Product[] = [
  { id: 1, name: 'Laptop', category: 'Electronics', price: 450000, inStock: true, rating: 4.5 },
  { id: 2, name: 'Phone', category: 'Electronics', price: 180000, inStock: true, rating: 4.2 },
  { id: 3, name: 'Headphones', category: 'Electronics', price: 25000, inStock: false, rating: 4.0 },
  { id: 4, name: 'Rice (50kg)', category: 'Food', price: 45000, inStock: true, rating: 4.8 },
  { id: 5, name: 'Cooking Oil', category: 'Food', price: 8500, inStock: true, rating: 4.3 },
  { id: 6, name: 'T-Shirt', category: 'Clothing', price: 5000, inStock: true, rating: 3.9 },
  { id: 7, name: 'Sneakers', category: 'Clothing', price: 35000, inStock: false, rating: 4.6 },
  { id: 8, name: 'Blender', category: 'Appliances', price: 22000, inStock: true, rating: 4.1 },
  { id: 9, name: 'Fan', category: 'Appliances', price: 18000, inStock: true, rating: 3.8 },
  { id: 10, name: 'Tablet', category: 'Electronics', price: 120000, inStock: true, rating: 4.4 },
];

// ─── Lodash Demos ─────────────────────────────────────────

function demoStudents(): void {
  console.log(chalk.bold.cyan('\n  STUDENT DATA — LODASH OPERATIONS\n'));

  // 1. _.orderBy
  const topStudents = _.orderBy(students, ['grade'], ['desc']).slice(0, 3);
  console.log(chalk.yellow('  1. Top 3 Students by Grade (_.orderBy):'));
  topStudents.forEach((s, i) => {
    console.log(chalk.white(`     ${i + 1}. ${s.name.padEnd(10)} Grade: ${s.grade}`));
  });

  // 2. _.groupBy
  const bySubject = _.groupBy(students, 'subject');
  console.log(chalk.yellow('\n  2. Students Grouped by Subject (_.groupBy):'));
  Object.entries(bySubject).forEach(([subject, group]) => {
    const names = group.map(s => s.name).join(', ');
    console.log(chalk.white(`     ${subject.padEnd(10)}: ${names}`));
  });

  // 3. _.meanBy
  const avgGrade = _.meanBy(students, 'grade');
  console.log(chalk.yellow('\n  3. Average Grade (_.meanBy):'));
  console.log(chalk.white(`     ${avgGrade.toFixed(2)}`));

  // 4. _.filter + _.map (chained)
  const lagosStudents = _.filter(students, { city: 'Lagos' });
  const lagosNames = _.map(lagosStudents, 'name');
  console.log(chalk.yellow('\n  4. Lagos Students (_.filter + _.map):'));
  console.log(chalk.white(`     ${lagosNames.join(', ')}`));

  // 5. _.minBy / _.maxBy
  const best = _.maxBy(students, 'grade');
  const worst = _.minBy(students, 'grade');
  console.log(chalk.yellow('\n  5. Highest & Lowest Grade (_.maxBy / _.minBy):'));
  console.log(chalk.white(`     Highest: ${best?.name} — ${best?.grade}`));
  console.log(chalk.white(`     Lowest : ${worst?.name} — ${worst?.grade}`));

  // 6. _.countBy
  const cityCount = _.countBy(students, 'city');
  console.log(chalk.yellow('\n  6. Students per City (_.countBy):'));
  Object.entries(cityCount).forEach(([city, count]) => {
    console.log(chalk.white(`     ${city.padEnd(15)}: ${count}`));
  });

  // 7. _.uniqBy (simulate duplicates)
  const withDups = [...students, students[0], students[1]];
  const unique = _.uniqBy(withDups, 'id');
  console.log(chalk.yellow('\n  7. Remove Duplicates (_.uniqBy):'));
  console.log(chalk.white(`     Before: ${withDups.length} records → After: ${unique.length} records`));

  console.log('');
}

function demoProducts(): void {
  console.log(chalk.bold.cyan('\n  PRODUCT DATA — LODASH OPERATIONS\n'));

  // 1. _.partition
  const [inStock, outOfStock] = _.partition(products, 'inStock');
  console.log(chalk.yellow('  1. In Stock vs Out of Stock (_.partition):'));
  console.log(chalk.white(`     In Stock    : ${inStock.map(p => p.name).join(', ')}`));
  console.log(chalk.white(`     Out of Stock: ${outOfStock.map(p => p.name).join(', ')}`));

  // 2. _.groupBy + _.mapValues to get avg price per category
  const byCategory = _.groupBy(products, 'category');
  const avgPricePerCat = _.mapValues(byCategory, group =>
    _.meanBy(group, 'price').toFixed(0)
  );
  console.log(chalk.yellow('\n  2. Average Price per Category (_.groupBy + _.mapValues):'));
  Object.entries(avgPricePerCat).forEach(([cat, avg]) => {
    console.log(chalk.white(`     ${cat.padEnd(15)}: ₦${Number(avg).toLocaleString()}`));
  });

  // 3. _.sumBy
  const totalValue = _.sumBy(inStock, 'price');
  console.log(chalk.yellow('\n  3. Total Value of In-Stock Items (_.sumBy):'));
  console.log(chalk.white(`     ₦${totalValue.toLocaleString()}`));

  // 4. _.orderBy by rating desc
  const topRated = _.orderBy(products, ['rating'], ['desc']).slice(0, 3);
  console.log(chalk.yellow('\n  4. Top 3 Rated Products (_.orderBy):'));
  topRated.forEach((p, i) => {
    console.log(chalk.white(`     ${i + 1}. ${p.name.padEnd(15)} ⭐ ${p.rating}`));
  });

  // 5. _.pick / _.omit
  const picked = _.pick(products[0], ['name', 'price', 'rating']);
  console.log(chalk.yellow('\n  5. Pick specific fields from Laptop (_.pick):'));
  console.log(chalk.white(`     ${JSON.stringify(picked)}`));

  // 6. _.chunk (split into pages)
  const pages = _.chunk(products, 3);
  console.log(chalk.yellow('\n  6. Products split into pages of 3 (_.chunk):'));
  pages.forEach((page, i) => {
    console.log(chalk.white(`     Page ${i + 1}: ${page.map(p => p.name).join(', ')}`));
  });

  // 7. _.sortBy multiple fields
  const sorted = _.sortBy(products, ['category', 'price']);
  console.log(chalk.yellow('\n  7. Sorted by Category then Price (_.sortBy):'));
  sorted.forEach(p => {
    console.log(chalk.white(`     ${p.category.padEnd(12)} ${p.name.padEnd(15)} ₦${p.price.toLocaleString()}`));
  });

  console.log('');
}

function demoArrayUtils(): void {
  console.log(chalk.bold.cyan('\n  ARRAY UTILITIES — LODASH OPERATIONS\n'));

  const nums = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
  const a = [1, 2, 3, 4, 5];
  const b = [3, 4, 5, 6, 7];

  // _.uniq
  console.log(chalk.yellow('  1. Remove duplicates from array (_.uniq):'));
  console.log(chalk.white(`     Input : [${nums.join(', ')}]`));
  console.log(chalk.white(`     Output: [${_.uniq(nums).join(', ')}]`));

  // _.intersection
  console.log(chalk.yellow('\n  2. Common elements between two arrays (_.intersection):'));
  console.log(chalk.white(`     A: [${a.join(', ')}]  B: [${b.join(', ')}]`));
  console.log(chalk.white(`     Common: [${_.intersection(a, b).join(', ')}]`));

  // _.difference
  console.log(chalk.yellow('\n  3. Elements in A not in B (_.difference):'));
  console.log(chalk.white(`     [${_.difference(a, b).join(', ')}]`));

  // _.flatten
  const nested = [[1, 2], [3, 4], [5, [6, 7]]];
  console.log(chalk.yellow('\n  4. Flatten nested array (_.flatten):'));
  console.log(chalk.white(`     Before: ${JSON.stringify(nested)}`));
  console.log(chalk.white(`     After : [${_.flatten(nested).join(', ')}]`));

  // _.zip
  const names = ['Henry', 'Amaka', 'Emeka'];
  const scores = [88, 95, 72];
  const zipped = _.zip(names, scores);
  console.log(chalk.yellow('\n  5. Zip two arrays together (_.zip):'));
  zipped.forEach(pair => {
    console.log(chalk.white(`     ${pair[0]} → ${pair[1]}`));
  });

  // _.shuffle
  const shuffled = _.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  console.log(chalk.yellow('\n  6. Shuffle an array (_.shuffle):'));
  console.log(chalk.white(`     [${shuffled.join(', ')}]`));

  // _.take / _.takeRight
  const sorted = _.sortBy(nums);
  console.log(chalk.yellow('\n  7. Take first 3 and last 3 (_.take / _.takeRight):'));
  console.log(chalk.white(`     Sorted     : [${sorted.join(', ')}]`));
  console.log(chalk.white(`     First 3    : [${_.take(sorted, 3).join(', ')}]`));
  console.log(chalk.white(`     Last 3     : [${_.takeRight(sorted, 3).join(', ')}]`));

  console.log('');
}

// ─── Main Application ─────────────────────────────────────

async function runLodashDemo(): Promise<void> {
  console.clear();
  console.log(chalk.bold.blue('═'.repeat(55)));
  console.log(chalk.bold.blue('        TYPESCRIPT WITH LODASH FOR ARRAYS'));
  console.log(chalk.bold.blue('═'.repeat(55)));
  console.log(chalk.white('\n   Powerful array operations with Lodash!\n'));
  console.log(chalk.bold.blue('═'.repeat(55)));

  let continueRunning = true;

  while (continueRunning) {
    console.log(chalk.bold.cyan('\n  MENU\n'));
    console.log(chalk.white('   1. Student data operations'));
    console.log(chalk.white('   2. Product data operations'));
    console.log(chalk.white('   3. Array utility operations'));
    console.log(chalk.white('   4. Run all demos'));
    console.log(chalk.white('   5. Exit\n'));

    const choice = await askQuestion(chalk.cyan('  Choose an option (1-5): '));

    if (choice === '5') {
      console.log(chalk.blue('\n  Lodash mastered! Day 21 done! 👋\n'));
      break;
    }

    try {
      switch (choice) {
        case '1':
          demoStudents();
          break;
        case '2':
          demoProducts();
          break;
        case '3':
          demoArrayUtils();
          break;
        case '4':
          demoStudents();
          demoProducts();
          demoArrayUtils();
          break;
        default:
          console.log(chalk.red('\n  Invalid option! Please choose 1-5.\n'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }

    const again = await askQuestion(chalk.cyan('  Run another demo? (yes/no): '));
    if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
      console.log(chalk.blue('\n  Lodash mastered! Day 21 done! 👋\n'));
      continueRunning = false;
    }
  }

  rl.close();
}

runLodashDemo();
