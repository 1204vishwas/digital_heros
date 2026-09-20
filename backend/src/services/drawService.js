import db from '../db/database.js';

export const drawService = {
  // Generate 5 random winning numbers between 1 and 45 (uniform)
  generateRandomNumbers() {
    const pool = Array.from({ length: 45 }, (_, i) => i + 1);
    const chosen = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(idx, 1)[0]);
    }
    return chosen.sort((a, b) => a - b);
  },

  // Generate 5 winning numbers weighted by score frequency (Algorithmic mode, PRD § 06)
  generateAlgorithmicNumbers() {
    // 1. Compute frequency of each score (1-45) across all active subscribers' current scores
    const counts = {};
    for (let i = 1; i <= 45; i++) counts[i] = 1; // Laplace smoothing: base weight of 1

    const activeScores = db.prepare(`
      SELECT s.score
      FROM scores s
      JOIN users u ON s.user_id = u.id
      WHERE u.subscription_status = 'active'
    `).all();

    activeScores.forEach(row => {
      if (counts[row.score] !== undefined) {
        counts[row.score] += 3; // Boost weight for frequent scores
      }
    });

    const pool = [];
    Object.keys(counts).forEach(numStr => {
      const num = parseInt(numStr, 10);
      const weight = counts[num];
      for (let w = 0; w < weight; w++) {
        pool.push(num);
      }
    });

    // Select 5 distinct numbers using the weighted pool
    const selected = new Set();
    while (selected.size < 5 && pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected.add(pool[randomIndex]);
    }

    // Fallback if pool depleted
    while (selected.size < 5) {
      selected.add(Math.floor(Math.random() * 45) + 1);
    }

    return Array.from(selected).sort((a, b) => a - b);
  },

  // Calculate current prize pool based on active subscribers & rollover
  calculatePrizePool() {
    const activeSubs = db.prepare(`
      SELECT COUNT(*) as count, SUM(subscription_price) as total_rev
      FROM users
      WHERE subscription_status = 'active'
    `).get();

    const activeCount = activeSubs.count || 0;
    // Base monthly pool contribution from subscriptions
    // E.g. $10 per active subscriber or 50% of subscriber revenue
    const subscriptionContribution = (activeSubs.total_rev || 0) * 0.50;

    const rolloverSetting = db.prepare(`
      SELECT value FROM system_settings WHERE key = 'jackpot_rollover'
    `).get();
    const currentRollover = rolloverSetting ? parseFloat(rolloverSetting.value) : 10000.0;

    const currentMonthPool = Math.max(subscriptionContribution, activeCount * 9.50);
    const totalPool = currentMonthPool + currentRollover;

    return {
      activeSubscribersCount: activeCount,
      subscriptionContribution: Math.round(subscriptionContribution * 100) / 100,
      currentRollover: Math.round(currentRollover * 100) / 100,
      totalPool: Math.round(totalPool * 100) / 100,
      tier5Pool: Math.round((currentMonthPool * 0.40 + currentRollover) * 100) / 100, // 40% + Rollover
      tier4Pool: Math.round((currentMonthPool * 0.35) * 100) / 100,                   // 35%
      tier3Pool: Math.round((currentMonthPool * 0.25) * 100) / 100                    // 25%
    };
  },

  // Evaluate matches between winning numbers and all active subscribers
  evaluateSubscribers(winningNumbers) {
    const winningSet = new Set(winningNumbers);

    // Get active subscribers with their scores
    const subscribers = db.prepare(`
      SELECT id, name, email, subscription_plan, subscription_price, charity_id
      FROM users
      WHERE subscription_status = 'active'
    `).all();

    const winners = {
      tier5: [], // 5-match
      tier4: [], // 4-match
      tier3: []  // 3-match
    };

    const subscriberScoresStmt = db.prepare(`
      SELECT score FROM scores
      WHERE user_id = ?
      ORDER BY score_date DESC, created_at DESC
      LIMIT 5
    `);

    subscribers.forEach(sub => {
      const userScores = subscriberScoresStmt.all(sub.id).map(r => r.score);
      const matched = userScores.filter(s => winningSet.has(s));
      const matchCount = matched.length;

      const participantInfo = {
        userId: sub.id,
        name: sub.name,
        email: sub.email,
        scores: userScores,
        matchedNumbers: matched,
        matchCount
      };

      if (matchCount === 5) {
        winners.tier5.push(participantInfo);
      } else if (matchCount === 4) {
        winners.tier4.push(participantInfo);
      } else if (matchCount === 3) {
        winners.tier3.push(participantInfo);
      }
    });

    return { subscribersCount: subscribers.length, winners };
  },

  // Run a simulation (PRD § 06 "Simulation before publish")
  simulateDraw(mode = 'random', customNumbers = null) {
    const winningNumbers = customNumbers && customNumbers.length === 5
      ? customNumbers.sort((a, b) => a - b)
      : (mode === 'algorithmic' ? this.generateAlgorithmicNumbers() : this.generateRandomNumbers());

    const pool = this.calculatePrizePool();
    const evaluation = this.evaluateSubscribers(winningNumbers);

    // Calculate payouts per winner in each tier (PRD § 07: "Prizes split equally among multiple winners in the same tier")
    const tier5Count = evaluation.winners.tier5.length;
    const tier4Count = evaluation.winners.tier4.length;
    const tier3Count = evaluation.winners.tier3.length;

    const tier5PayoutPerWinner = tier5Count > 0 ? Math.round((pool.tier5Pool / tier5Count) * 100) / 100 : 0;
    const tier4PayoutPerWinner = tier4Count > 0 ? Math.round((pool.tier4Pool / tier4Count) * 100) / 100 : 0;
    const tier3PayoutPerWinner = tier3Count > 0 ? Math.round((pool.tier3Pool / tier3Count) * 100) / 100 : 0;

    // Rollover check: If 5-match has no winner, tier5Pool carries forward!
    const nextRollover = tier5Count === 0 ? pool.tier5Pool : 0;

    return {
      mode,
      winningNumbers,
      pool,
      nextRollover,
      winners: {
        tier5: evaluation.winners.tier5.map(w => ({ ...w, prizeAmount: tier5PayoutPerWinner, matchType: '5-match' })),
        tier4: evaluation.winners.tier4.map(w => ({ ...w, prizeAmount: tier4PayoutPerWinner, matchType: '4-match' })),
        tier3: evaluation.winners.tier3.map(w => ({ ...w, prizeAmount: tier3PayoutPerWinner, matchType: '3-match' }))
      },
      summary: {
        totalSubscribers: evaluation.subscribersCount,
        tier5WinnersCount: tier5Count,
        tier4WinnersCount: tier4Count,
        tier3WinnersCount: tier3Count,
        totalWinners: tier5Count + tier4Count + tier3Count
      }
    };
  },

  // Publish official draw (PRD § 06 & § 07)
  publishDraw(mode = 'random', customNumbers = null) {
    const simulation = this.simulateDraw(mode, customNumbers);
    const dateStr = new Date().toISOString().split('T')[0];
    const drawCode = `DH-DRAW-${Date.now().toString().slice(-6)}`;

    const tx = db.transaction(() => {
      // 1. Insert Draw Record
      const insertDrawStmt = db.prepare(`
        INSERT INTO draws (
          draw_code, draw_date, mode, winning_numbers, status,
          active_subscribers_count, total_pool, jackpot_rollover_in, jackpot_rollover_out,
          tier_5_pool, tier_4_pool, tier_3_pool,
          tier_5_winners_count, tier_4_winners_count, tier_3_winners_count
        ) VALUES (?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const drawResult = insertDrawStmt.run(
        drawCode,
        dateStr,
        simulation.mode,
        JSON.stringify(simulation.winningNumbers),
        simulation.summary.totalSubscribers,
        simulation.pool.totalPool,
        simulation.pool.currentRollover,
        simulation.nextRollover,
        simulation.pool.tier5Pool,
        simulation.pool.tier4Pool,
        simulation.pool.tier3Pool,
        simulation.summary.tier5WinnersCount,
        simulation.summary.tier4WinnersCount,
        simulation.summary.tier3WinnersCount
      );

      const drawId = drawResult.lastInsertRowid;

      // 2. Insert Draw Winners (Verification: pending, Payment: pending)
      const insertWinnerStmt = db.prepare(`
        INSERT INTO draw_winners (
          draw_id, user_id, match_type, matched_numbers, prize_amount, verification_status, payment_status
        ) VALUES (?, ?, ?, ?, ?, 'pending', 'pending')
      `);

      const allWinners = [
        ...simulation.winners.tier5,
        ...simulation.winners.tier4,
        ...simulation.winners.tier3
      ];

      for (const w of allWinners) {
        insertWinnerStmt.run(
          drawId,
          w.userId,
          w.matchType,
          JSON.stringify(w.matchedNumbers),
          w.prizeAmount
        );
      }

      // 3. Update system jackpot rollover
      db.prepare(`
        UPDATE system_settings SET value = ? WHERE key = 'jackpot_rollover'
      `).run(simulation.nextRollover.toFixed(2));

      return { drawId, drawCode, ...simulation };
    });

    return tx();
  },

  // Get past draws history
  getDrawsHistory(limit = 10) {
    return db.prepare(`
      SELECT * FROM draws
      WHERE status = 'published'
      ORDER BY draw_date DESC, id DESC
      LIMIT ?
    `).all(limit).map(d => ({
      ...d,
      winning_numbers: JSON.parse(d.winning_numbers)
    }));
  },

  // Get latest published draw
  getLatestDraw() {
    const draw = db.prepare(`
      SELECT * FROM draws
      WHERE status = 'published'
      ORDER BY draw_date DESC, id DESC
      LIMIT 1
    `).get();

    if (!draw) return null;
    return {
      ...draw,
      winning_numbers: JSON.parse(draw.winning_numbers)
    };
  }
};
