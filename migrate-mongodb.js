#!/usr/bin/env node
/**
 * MongoDB Atlas Migration Script
 * Migrates all data from old cluster (Naik Consulting Group) to new cluster (Vaibhav's Org)
 *
 * Prerequisites:
 *   npm install mongodb
 *
 * Usage:
 *   node migrate-mongodb.js
 *
 * This script will:
 *   1. Connect to both old and new clusters
 *   2. Copy all collections from the 'urklist' database
 *   3. Preserve all documents, indexes, and collection structure
 *   4. NOT delete anything from the old cluster
 */

const { MongoClient } = require('mongodb');

// === CONNECTION STRINGS (from environment variables) ===
const OLD_URI = process.env.OLD_MONGODB_URI;
const NEW_URI = process.env.NEW_MONGODB_URI;

if (!OLD_URI || !NEW_URI) {
  console.error('Error: OLD_MONGODB_URI and NEW_MONGODB_URI environment variables must be set.');
  console.error('Usage: OLD_MONGODB_URI="mongodb+srv://..." NEW_MONGODB_URI="mongodb+srv://..." node migrate-mongodb.js');
  process.exit(1);
}

const DATABASE_NAME = 'urklist';

// Expected collections (for verification)
const EXPECTED_COLLECTIONS = [
  'Account', 'Brand', 'Category', 'Listing',
  'PipelineRun', 'Reservation', 'UnmatchedEmail', 'User'
];

async function migrate() {
  let oldClient, newClient;

  try {
    // Step 1: Connect to both clusters
    console.log('=== MongoDB Migration Script ===\n');

    console.log('Connecting to OLD cluster (Naik Consulting Group)...');
    oldClient = new MongoClient(OLD_URI);
    await oldClient.connect();
    console.log('  ✓ Connected to old cluster\n');

    console.log('Connecting to NEW cluster (Vaibhav\'s Org)...');
    newClient = new MongoClient(NEW_URI);
    await newClient.connect();
    console.log('  ✓ Connected to new cluster\n');

    const oldDb = oldClient.db(DATABASE_NAME);
    const newDb = newClient.db(DATABASE_NAME);

    // Step 2: List collections in old database
    const collections = await oldDb.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`Found ${collectionNames.length} collections in old "${DATABASE_NAME}" database:`);
    collectionNames.forEach(name => console.log(`  - ${name}`));
    console.log('');

    // Step 3: Migrate each collection
    let totalDocs = 0;
    const results = [];

    for (const collInfo of collections) {
      const collName = collInfo.name;
      console.log(`--- Migrating collection: ${collName} ---`);

      const oldColl = oldDb.collection(collName);
      const newColl = newDb.collection(collName);

      // Count documents in source
      const sourceCount = await oldColl.countDocuments();
      console.log(`  Source documents: ${sourceCount}`);

      if (sourceCount === 0) {
        console.log('  Skipping (empty collection)\n');
        results.push({ collection: collName, source: 0, migrated: 0, status: 'skipped (empty)' });
        continue;
      }

      // Check if destination already has data
      const existingCount = await newColl.countDocuments();
      if (existingCount > 0) {
        console.log(`  ⚠ Destination already has ${existingCount} documents.`);
        console.log('  Dropping existing data in destination before re-migrating...');
        await newColl.drop();
      }

      // Copy all documents in batches
      const BATCH_SIZE = 500;
      let migrated = 0;
      const cursor = oldColl.find({});

      let batch = [];
      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        batch.push(doc);

        if (batch.length >= BATCH_SIZE) {
          await newColl.insertMany(batch, { ordered: false });
          migrated += batch.length;
          process.stdout.write(`\r  Migrated: ${migrated}/${sourceCount}`);
          batch = [];
        }
      }

      // Insert remaining documents
      if (batch.length > 0) {
        await newColl.insertMany(batch, { ordered: false });
        migrated += batch.length;
      }

      console.log(`\r  Migrated: ${migrated}/${sourceCount}`);

      // Step 4: Copy indexes
      const indexes = await oldColl.indexes();
      const customIndexes = indexes.filter(idx => idx.name !== '_id_');

      if (customIndexes.length > 0) {
        console.log(`  Copying ${customIndexes.length} custom indexes...`);
        for (const idx of customIndexes) {
          try {
            const { key, ...options } = idx;
            delete options.v;
            delete options.ns;
            await newColl.createIndex(key, options);
            console.log(`    ✓ Index: ${idx.name}`);
          } catch (err) {
            console.log(`    ⚠ Index ${idx.name}: ${err.message}`);
          }
        }
      }

      // Verify
      const destCount = await newColl.countDocuments();
      const status = destCount === sourceCount ? '✓ OK' : `⚠ MISMATCH (${destCount})`;
      console.log(`  Verification: ${status}\n`);

      results.push({ collection: collName, source: sourceCount, migrated: destCount, status });
      totalDocs += destCount;
    }

    // Step 5: Summary
    console.log('\n=== MIGRATION SUMMARY ===\n');
    console.log('Collection           | Source | Migrated | Status');
    console.log('---------------------|--------|----------|--------');
    for (const r of results) {
      const name = r.collection.padEnd(20);
      const src = String(r.source).padStart(6);
      const mig = String(r.migrated).padStart(8);
      console.log(`${name} | ${src} | ${mig} | ${r.status}`);
    }
    console.log(`\nTotal documents migrated: ${totalDocs}`);
    console.log('\n✓ Migration complete!');
    console.log('\nMigration complete. Use your NEW_MONGODB_URI connection string in your app configuration.');

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (oldClient) await oldClient.close();
    if (newClient) await newClient.close();
  }
}

migrate();
