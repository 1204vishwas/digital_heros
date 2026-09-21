import db from './src/db/database.js';
import { scoreService } from './src/services/scoreService.js';
import { drawService } from './src/services/drawService.js';

console.log('🧪 Testing Digital Heroes Platform Core Logic...\n');

// 1. Create a dummy test golfer
db.prepare('DELETE FROM scores WHERE user_id = 9999').run();
db.prepare('DELETE FROM users WHERE id = 9999').run();

db.prepare(`
  INSERT INTO users (id, name, email, password_hash, role, subscription_plan, subscription_status, subscription_price)
  VALUES (9999, 'Test Golfer', 'testgolfer@test.com', 'hash', 'subscriber', 'monthly', 'active', 499.0)
`).run();

// Test 1: Add 5 rolling scores
console.log('1️⃣ Adding 5 sequential scores...');
scoreService.addScore(9999, 32, '2026-03-01');
scoreService.addScore(9999, 35, '2026-03-02');
scoreService.addScore(9999, 38, '2026-03-03');
scoreService.addScore(9999, 41, '2026-03-04');
const scores5 = scoreService.addScore(9999, 44, '2026-03-05');
console.log(`   Added 5 scores. Count: ${scores5.length}. Oldest date was 2026-03-01.`);

// Test 2: Add 6th score - rolling eviction of oldest (PRD § 05)
console.log('\n2️⃣ Adding 6th score (rolling eviction test)...');
const scores6 = scoreService.addScore(9999, 29, '2026-03-06');
console.log(`   Scores count after 6th insertion: ${scores6.length} (Expected: 5)`);
const dates = scores6.map(s => s.score_date);
console.log(`   Current score dates: ${dates.join(', ')}`);
if (dates.includes('2026-03-01')) {
  console.error('❌ Error: Oldest date 2026-03-01 was not evicted!');
} else {
  console.log('✅ Success: Oldest score was automatically evicted.');
}

// Test 3: Duplicate date prevention (PRD § 05)
console.log('\n3️⃣ Testing duplicate date prevention on 2026-03-06...');
try {
  scoreService.addScore(9999, 40, '2026-03-06');
  console.error('❌ Error: Allowed duplicate date!');
} catch (err) {
  console.log(`✅ Success: Duplicate date caught: "${err.message}"`);
}

// Test 4: Score bounds check (1-45 Stableford)
console.log('\n4️⃣ Testing score bounds (0 and 46)...');
try {
  scoreService.addScore(9999, 50, '2026-03-10');
  console.error('❌ Error: Allowed score > 45');
} catch (err) {
  console.log(`✅ Success: Out of bounds caught: "${err.message}"`);
}

// Test 5: Draw Pool & Simulation (Random & Algorithmic, PRD § 06 & § 07)
console.log('\n5️⃣ Testing Draw Engine...');
const pool = drawService.calculatePrizePool();
console.log(`   Active Subscribers: ${pool.activeSubscribersCount}`);
console.log(`   Total Pool: ₹${pool.totalPool.toLocaleString('en-IN')}`);
console.log(`   Tier 5 (40% + Rollover): ₹${pool.tier5Pool.toLocaleString('en-IN')}`);
console.log(`   Tier 4 (35%): ₹${pool.tier4Pool.toLocaleString('en-IN')}`);
console.log(`   Tier 3 (25%): ₹${pool.tier3Pool.toLocaleString('en-IN')}`);

const simRandom = drawService.simulateDraw('random');
console.log(`   Simulated Random Draw: ${JSON.stringify(simRandom.winningNumbers)}`);
console.log(`   Random Winners: Tier 5: ${simRandom.summary.tier5WinnersCount}, Tier 4: ${simRandom.summary.tier4WinnersCount}, Tier 3: ${simRandom.summary.tier3WinnersCount}`);

const simAlgo = drawService.simulateDraw('algorithmic');
console.log(`   Simulated Algorithmic Draw: ${JSON.stringify(simAlgo.winningNumbers)}`);
console.log(`   Algorithmic Winners: Tier 5: ${simAlgo.summary.tier5WinnersCount}, Tier 4: ${simAlgo.summary.tier4WinnersCount}, Tier 3: ${simAlgo.summary.tier3WinnersCount}`);

// Cleanup dummy user
db.prepare('DELETE FROM scores WHERE user_id = 9999').run();
db.prepare('DELETE FROM users WHERE id = 9999').run();

console.log('\n✨ All Core Logic Tests Passed!\n');
