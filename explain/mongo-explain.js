import mongoose from 'mongoose';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

// ── BEFORE INDEX ────────────────────────────────────────────
console.log('\n=== BEFORE INDEX ===');

const planBefore = await db.collection('orders')
  .find({
    status:    'active',
    createdAt: { $gte: new Date('2024-01-01') },
  })
  .explain('executionStats');

const statsBefore = planBefore.executionStats;
console.log({
  executionTimeMillis: statsBefore.executionTimeMillis,
  totalDocsExamined:   statsBefore.totalDocsExamined,
  totalKeysExamined:   statsBefore.totalKeysExamined,
  nReturned:           statsBefore.nReturned,
  stage:               statsBefore.executionStages.stage,  // COLLSCAN
  ratio:               `${statsBefore.totalDocsExamined} examined / ${statsBefore.nReturned} returned`,
});

// ── CREATE INDEX ────────────────────────────────────────────
console.log('\nCreating index...');
await db.collection('orders').createIndex(
  { status: 1, createdAt: -1 },
  { name: 'idx_status_createdAt' }
);
console.log('Index created.\n');

// ── AFTER INDEX ─────────────────────────────────────────────
console.log('=== AFTER INDEX ===');

const planAfter = await db.collection('orders')
  .find({
    status:    'active',
    createdAt: { $gte: new Date('2024-01-01') },
  })
  .explain('executionStats');

const statsAfter = planAfter.executionStats;
console.log({
  executionTimeMillis: statsAfter.executionTimeMillis,
  totalDocsExamined:   statsAfter.totalDocsExamined,
  totalKeysExamined:   statsAfter.totalKeysExamined,
  nReturned:           statsAfter.nReturned,
  stage:               planAfter.queryPlanner.winningPlan.inputStage?.stage, // IXSCAN
  ratio:               `${statsAfter.totalDocsExamined} examined / ${statsAfter.nReturned} returned`,
});

console.log(`totalDocsExamined dropped: ${statsBefore.totalDocsExamined} → ${statsAfter.totalDocsExamined}`);
console.log(`Time dropped:              ${statsBefore.executionTimeMillis}ms → ${statsAfter.executionTimeMillis}ms`);
console.log('The ratio to watch: totalDocsExamined / nReturned — should be close to 1:1');

await mongoose.disconnect();
