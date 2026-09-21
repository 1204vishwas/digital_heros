import bcrypt from 'bcryptjs';
import db from './database.js';

console.log('🌱 Seeding Digital Heroes Database...');

// Clear existing tables in clean order
db.exec(`
  DELETE FROM draw_winners;
  DELETE FROM draws;
  DELETE FROM donations;
  DELETE FROM charity_events;
  DELETE FROM scores;
  DELETE FROM users;
  DELETE FROM charities;
`);

// 1. Seed Charities
const insertCharity = db.prepare(`
  INSERT INTO charities (name, slug, mission, description, category, logo_url, cover_image, website_url, target_amount, raised_amount, is_featured)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const charities = [
  {
    name: 'First Tee Junior Impact',
    slug: 'first-tee-junior-impact',
    mission: 'Empowering underprivileged youth through mentorship, education, and the values of golf.',
    description: 'First Tee Junior Impact provides life skills education, mentorship, and equipment access to children in underserved communities. By combining personal development with the discipline of golf, we build resilient young leaders on and off the course.',
    category: 'Youth & Education',
    logo_url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=200&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&auto=format&fit=crop&q=80',
    website_url: 'https://firsttee.org',
    target_amount: 500000,
    raised_amount: 324500,
    is_featured: 1
  },
  {
    name: 'Birdies for Brain Tumors',
    slug: 'birdies-for-brain-tumors',
    mission: 'Accelerating neuro-oncology research and patient family grants through sports philanthropy.',
    description: 'Founded by tour professionals whose families were affected by brain cancer, this foundation funds cutting-edge surgical trials and provides emergency living grants for families undergoing intensive oncology care.',
    category: 'Health & Research',
    logo_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=80',
    website_url: 'https://braintumor.org',
    target_amount: 750000,
    raised_amount: 489000,
    is_featured: 1
  },
  {
    name: 'Greens for Good Environmental Trust',
    slug: 'greens-for-good-environmental-trust',
    mission: 'Transforming golf landscapes into regenerative wildlife corridors and clean water catchments.',
    description: 'Greens for Good works directly with course architects and regional councils to rewild non-play acreage, plant native pollinator corridors, and restore natural wetlands alongside recreational spaces.',
    category: 'Environment',
    logo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80',
    website_url: 'https://greensforgood.org',
    target_amount: 400000,
    raised_amount: 218000,
    is_featured: 1
  },
  {
    name: 'Fairway Veterans Support Alliance',
    slug: 'fairway-veterans-support-alliance',
    mission: 'Therapeutic outdoor recreation and transitional career programs for combat veterans.',
    description: 'The Fairway Veterans Support Alliance brings adaptive sports therapy to wounded warriors and military veterans, offering holistic community integration and certifications in turf science and sports management.',
    category: 'Veterans & First Responders',
    logo_url: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=200&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80',
    website_url: 'https://veteransfairway.org',
    target_amount: 600000,
    raised_amount: 376000,
    is_featured: 0
  },
  {
    name: 'Hope on the Green',
    slug: 'hope-on-the-green',
    mission: 'Destigmatizing mental health and preventing crisis through mindful outdoor athletic spaces.',
    description: 'A mental health sanctuary initiative providing free walk-and-talk sessions, clinical counseling referrals, and stress-reduction clinics through community sporting clubs.',
    category: 'Mental Health',
    logo_url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&auto=format&fit=crop&q=80',
    website_url: 'https://hopeonthegreen.org',
    target_amount: 350000,
    raised_amount: 194000,
    is_featured: 0
  },
  {
    name: 'Fore-Sight Blind Golfers Guild',
    slug: 'fore-sight-blind-golfers-guild',
    mission: 'Empowering visually impaired athletes with trained guides, adaptive technology, and competition.',
    description: 'The Guild provides certified sight-guides, specialized audio tactile tracking gear, and subsidizes tournament travel for blind and vision-impaired golfers across the country.',
    category: 'Accessibility & Inclusion',
    logo_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&auto=format&fit=crop&q=80',
    website_url: 'https://foresightgolf.org',
    target_amount: 300000,
    raised_amount: 142500,
    is_featured: 0
  }
];

const charityIds = {};
charities.forEach(c => {
  const info = insertCharity.run(
    c.name, c.slug, c.mission, c.description, c.category,
    c.logo_url, c.cover_image, c.website_url, c.target_amount, c.raised_amount, c.is_featured
  );
  charityIds[c.slug] = info.lastInsertRowid;
});

// 2. Seed Charity Events
const insertEvent = db.prepare(`
  INSERT INTO charity_events (charity_id, title, event_date, location, description)
  VALUES (?, ?, ?, ?, ?)
`);

insertEvent.run(
  charityIds['first-tee-junior-impact'],
  '2026 Junior Hope Invitational & Pro-Am',
  '2026-10-15',
  'Pebble Creek Championship Course, CA',
  'A full-day scramble paired with youth academy players, followed by a keynote dinner and charity auction.'
);

insertEvent.run(
  charityIds['first-tee-junior-impact'],
  'Summer Youth Clinic & Equipment Drive',
  '2026-11-08',
  'Pinehurst Learning Center, NC',
  'Hands-on coaching day distributing over 300 custom club sets to underprivileged youth.'
);

insertEvent.run(
  charityIds['birdies-for-brain-tumors'],
  'Annual Gala Scramble for Cancer Research',
  '2026-10-22',
  'Torrey Vista Golf Club, CA',
  'Join neurosurgeons, tour ambassadors, and survivor families for our largest annual fundraiser.'
);

insertEvent.run(
  charityIds['greens-for-good-environmental-trust'],
  'Wetland Restoration Volunteer Field Day',
  '2026-11-14',
  'Emerald Bay Nature Reserve, OR',
  'Planting 2,000 native shoreline saplings alongside golf community volunteers and conservationists.'
);

insertEvent.run(
  charityIds['fairway-veterans-support-alliance'],
  'Veterans Day Honor Classic',
  '2026-11-11',
  'National Memorial Golf Links, VA',
  'Saluting our service members with an 18-hole scramble, adaptive clinic, and scholarship awards.'
);

// 3. Seed Users
const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, subscription_plan, subscription_status, subscription_price, renewal_date, charity_id, charity_percentage)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const passwordHashAdmin = bcrypt.hashSync('admin123', 10);
const passwordHashGolfer = bcrypt.hashSync('golfer123', 10);
const passwordHashDemo = bcrypt.hashSync('demo123', 10);

// Admin
const adminInfo = insertUser.run(
  'Digital Heroes Admin',
  'admin@digitalheroes.com',
  passwordHashAdmin,
  'admin',
  'yearly',
  'active',
  4990.0,
  '2027-03-20',
  charityIds['first-tee-junior-impact'],
  20.0
);

// Primary Subscriber (Callum Vance)
const callumInfo = insertUser.run(
  'Callum Vance',
  'golfer@digitalheroes.com',
  passwordHashGolfer,
  'subscriber',
  'monthly',
  'active',
  499.0,
  '2026-10-21',
  charityIds['birdies-for-brain-tumors'],
  15.0 // 15% contribution
);
const callumId = callumInfo.lastInsertRowid;

// Additional 14 Subscribers for realistic draw simulation & analytics
const sampleUsers = [
  { name: 'Elena Rostova', email: 'elena@example.com', plan: 'yearly', status: 'active', charity: 'first-tee-junior-impact', pct: 25, scores: [38, 42, 29, 36, 40] },
  { name: 'Marcus Sterling', email: 'marcus@example.com', plan: 'monthly', status: 'active', charity: 'greens-for-good-environmental-trust', pct: 10, scores: [34, 39, 31, 37, 44] },
  { name: 'Aria Montgomery', email: 'aria@example.com', plan: 'monthly', status: 'active', charity: 'birdies-for-brain-tumors', pct: 20, scores: [28, 33, 35, 41, 38] },
  { name: 'David Chen', email: 'david@example.com', plan: 'yearly', status: 'active', charity: 'fairway-veterans-support-alliance', pct: 15, scores: [36, 40, 32, 29, 43] },
  { name: 'Sarah Jenkins', email: 'sarah@example.com', plan: 'monthly', status: 'active', charity: 'hope-on-the-green', pct: 10, scores: [30, 36, 38, 41, 35] },
  { name: 'Kobe Bryant Jr', email: 'kobe@example.com', plan: 'yearly', status: 'active', charity: 'first-tee-junior-impact', pct: 30, scores: [41, 39, 44, 38, 36] },
  { name: 'Oliver Hayes', email: 'oliver@example.com', plan: 'monthly', status: 'active', charity: 'fore-sight-blind-golfers-guild', pct: 12, scores: [26, 31, 35, 39, 42] },
  { name: 'Chloe Dubois', email: 'chloe@example.com', plan: 'yearly', status: 'active', charity: 'greens-for-good-environmental-trust', pct: 18, scores: [35, 37, 40, 34, 38] },
  { name: 'Liam O’Connor', email: 'liam@example.com', plan: 'monthly', status: 'active', charity: 'fairway-veterans-support-alliance', pct: 15, scores: [32, 38, 41, 36, 39] },
  { name: 'Zoe Morales', email: 'zoe@example.com', plan: 'monthly', status: 'cancelled', charity: 'hope-on-the-green', pct: 10, scores: [29, 34, 36, 38, 40] },
  { name: 'Tariq Al-Mansoor', email: 'tariq@example.com', plan: 'yearly', status: 'active', charity: 'birdies-for-brain-tumors', pct: 20, scores: [37, 43, 35, 38, 41] },
  { name: 'Hannah Schmidt', email: 'hannah@example.com', plan: 'monthly', status: 'active', charity: 'first-tee-junior-impact', pct: 15, scores: [31, 36, 39, 42, 35] },
  { name: 'Julian Thorne', email: 'julian@example.com', plan: 'monthly', status: 'lapsed', charity: 'greens-for-good-environmental-trust', pct: 10, scores: [33, 35, 38, 30, 42] },
  { name: 'Maya Patel', email: 'maya@example.com', plan: 'yearly', status: 'active', charity: 'fore-sight-blind-golfers-guild', pct: 22, scores: [38, 40, 36, 42, 44] }
];

const insertScore = db.prepare(`
  INSERT INTO scores (user_id, score, score_date)
  VALUES (?, ?, ?)
`);

// Seed Callum's 5 rolling scores (PRD § 05)
const callumScores = [
  { score: 36, date: '2026-03-08' },
  { score: 41, date: '2026-03-11' },
  { score: 28, date: '2026-03-14' },
  { score: 39, date: '2026-03-17' },
  { score: 33, date: '2026-03-20' }
];
callumScores.forEach(s => insertScore.run(callumId, s.score, s.date));

// Seed additional users & their rolling scores
const createdSubscriberIds = [];
sampleUsers.forEach((u, idx) => {
  const info = insertUser.run(
    u.name,
    u.email,
    passwordHashDemo,
    'subscriber',
    u.plan,
    u.status,
    u.plan === 'yearly' ? 4990.0 : 499.0,
    '2026-10-25',
    charityIds[u.charity],
    u.pct
  );
  const uid = info.lastInsertRowid;
  if (u.status === 'active') createdSubscriberIds.push(uid);

  // Insert their 5 scores with distinct dates
  u.scores.forEach((sc, scIdx) => {
    const day = (scIdx * 3 + 1).toString().padStart(2, '0');
    insertScore.run(uid, sc, `2026-03-${day}`);
  });
});

// 4. Seed Direct Donations (PRD § 08.1)
const insertDonation = db.prepare(`
  INSERT INTO donations (user_id, charity_id, amount, donation_type, donor_name, note)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertDonation.run(callumId, charityIds['birdies-for-brain-tumors'], 500.0, 'direct_donation', 'Callum Vance', 'In memory of Uncle Dave.');
insertDonation.run(callumId, charityIds['birdies-for-brain-tumors'], 74.85, 'subscription_split', 'Callum Vance', 'Monthly sub split (15%)');
insertDonation.run(null, charityIds['first-tee-junior-impact'], 2500.0, 'direct_donation', 'Anonymous Supporter', 'Great work supporting young golfers!');
insertDonation.run(null, charityIds['greens-for-good-environmental-trust'], 1000.0, 'direct_donation', 'Highland Park GC', 'Wetland conservation sponsorship.');

// 5. Seed Past Official Draw & Winners (PRD § 06, § 07, § 09)
const insertDraw = db.prepare(`
  INSERT INTO draws (
    draw_code, draw_date, mode, winning_numbers, status,
    active_subscribers_count, total_pool, jackpot_rollover_in, jackpot_rollover_out,
    tier_5_pool, tier_4_pool, tier_3_pool,
    tier_5_winners_count, tier_4_winners_count, tier_3_winners_count
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// February Draw: numbers [14, 28, 33, 36, 41]
// Callum's scores are [36, 41, 28, 39, 33] -> Callum matches 4 numbers: [28, 33, 36, 41]!
const draw1Info = insertDraw.run(
  'DH-DRAW-2026-02',
  '2026-02-28',
  'algorithmic',
  JSON.stringify([14, 28, 33, 36, 41]),
  'published',
  15,
  680000.0, // total pool
  1000000.0, // rollover in
  1272000.0, // rollover out
  272000.0, // tier 5 pool (40%)
  238000.0, // tier 4 pool (35%)
  170000.0, // tier 3 pool (25%)
  0,        // tier 5 winners (rolled over!)
  1,        // tier 4 winner (Callum Vance!)
  2         // tier 3 winners
);
const draw1Id = draw1Info.lastInsertRowid;

const insertWinner = db.prepare(`
  INSERT INTO draw_winners (
    draw_id, user_id, match_type, matched_numbers, prize_amount, proof_url, verification_status, payment_status, paid_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Callum Vance won 4-match prize!
insertWinner.run(
  draw1Id,
  callumId,
  '4-match',
  JSON.stringify([28, 33, 36, 41]),
  238000.00,
  'https://images.unsplash.com/photo-1592919505780-303950717480?w=600&auto=format&fit=crop&q=80',
  'approved',
  'paid',
  '2026-03-02 14:20:00'
);

// Two other sample winners
if (createdSubscriberIds.length >= 2) {
  insertWinner.run(
    draw1Id,
    createdSubscriberIds[0],
    '3-match',
    JSON.stringify([28, 36, 41]),
    85000.00,
    'https://images.unsplash.com/photo-1592919505780-303950717480?w=600&auto=format&fit=crop&q=80',
    'approved',
    'paid',
    '2026-03-03 11:15:00'
  );

  // A pending winner for admin verification demo (PRD § 09)
  insertWinner.run(
    draw1Id,
    createdSubscriberIds[1],
    '3-match',
    JSON.stringify([33, 36, 41]),
    85000.00,
    'https://images.unsplash.com/photo-1592919505780-303950717480?w=600&auto=format&fit=crop&q=80',
    'pending',
    'pending',
    null
  );
}

// Update current system jackpot rollover setting (₹14,25,000)
db.prepare('UPDATE system_settings SET value = ? WHERE key = ?').run('1425000.00', 'jackpot_rollover');

console.log('✅ Database seeded successfully with Indian Rupees (INR ₹)!');
console.log('----------------------------------------------------');
console.log('🔑 Credentials:');
console.log('   Admin:  admin@digitalheroes.com  /  admin123');
console.log('   Golfer: golfer@digitalheroes.com /  golfer123');
console.log('----------------------------------------------------');
