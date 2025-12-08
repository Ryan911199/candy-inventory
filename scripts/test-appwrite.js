/**
 * Test script to debug Appwrite connection and store creation
 */

import { Client, Databases, Query, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://backend.firefetch.org/v1')
  .setProject('69373be900166fcb421c')
  .setKey('standard_42196009213653bf938590819d94d60170251a74703a9f4ed6f7aa66fee0c2e1d6e1efea36ec5fce090c7b8020c0ad74cc6ea298ad4b0dfcb04c81113ed8c1b23cebc69439b68b0f3231ae1d1247ca874f677799dc191a9572697dab812b1182fd8629b00e343a726f6caeccb101d7714c864e9bef4f509dc5ba3aea82f36d04');

const databases = new Databases(client);
const DATABASE_ID = 'candy-inventory';
const STORES_COLLECTION = 'stores';

async function testAppwrite() {
  console.log('Testing Appwrite connection...\n');

  // Test 1: List databases
  try {
    console.log('1. Checking if database exists...');
    const db = await databases.get(DATABASE_ID);
    console.log(`   ✓ Database "${db.name}" found\n`);
  } catch (error) {
    console.log(`   ✗ Database error: ${error.message}\n`);
    return;
  }

  // Test 2: List collections
  try {
    console.log('2. Checking stores collection...');
    const collection = await databases.getCollection(DATABASE_ID, STORES_COLLECTION);
    console.log(`   ✓ Collection "${collection.name}" found`);
    console.log(`   Attributes: ${collection.attributes.map(a => a.key).join(', ')}\n`);
  } catch (error) {
    console.log(`   ✗ Collection error: ${error.message}\n`);
    return;
  }

  // Test 3: List existing stores
  try {
    console.log('3. Listing existing stores...');
    const stores = await databases.listDocuments(DATABASE_ID, STORES_COLLECTION);
    console.log(`   ✓ Found ${stores.total} stores`);
    if (stores.documents.length > 0) {
      console.log(`   Sample: ${JSON.stringify(stores.documents[0], null, 2)}\n`);
    } else {
      console.log('');
    }
  } catch (error) {
    console.log(`   ✗ List error: ${error.message}\n`);
  }

  // Test 4: Try to create a test store
  const testStoreNumber = '9999';
  try {
    console.log(`4. Trying to create test store #${testStoreNumber}...`);

    // First check if it exists
    const existing = await databases.listDocuments(DATABASE_ID, STORES_COLLECTION, [
      Query.equal('storeNumber', testStoreNumber)
    ]);

    if (existing.documents.length > 0) {
      console.log(`   Store already exists, deleting first...`);
      await databases.deleteDocument(DATABASE_ID, STORES_COLLECTION, existing.documents[0].$id);
    }

    // Try to create without targetDate first
    console.log('   Trying WITHOUT targetDate...');
    try {
      const store1 = await databases.createDocument(
        DATABASE_ID,
        STORES_COLLECTION,
        ID.unique(),
        { storeNumber: testStoreNumber }
      );
      console.log(`   ✓ Created without targetDate: ${JSON.stringify(store1)}`);
      await databases.deleteDocument(DATABASE_ID, STORES_COLLECTION, store1.$id);
    } catch (e) {
      console.log(`   ✗ Failed without targetDate: ${e.message}`);
    }

    // Try to create with targetDate
    console.log('   Trying WITH targetDate...');
    try {
      const store2 = await databases.createDocument(
        DATABASE_ID,
        STORES_COLLECTION,
        ID.unique(),
        { storeNumber: testStoreNumber, targetDate: '2025-12-21' }
      );
      console.log(`   ✓ Created with targetDate: ${JSON.stringify(store2)}`);
      await databases.deleteDocument(DATABASE_ID, STORES_COLLECTION, store2.$id);
    } catch (e) {
      console.log(`   ✗ Failed with targetDate: ${e.message}`);
    }

  } catch (error) {
    console.log(`   ✗ Create error: ${error.message}`);
    console.log(`   Full error: ${JSON.stringify(error, null, 2)}\n`);
  }

  console.log('\nDone!');
}

testAppwrite();
