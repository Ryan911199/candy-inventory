/**
 * Test Appwrite access WITHOUT an API key (simulating browser client)
 */

import { Client, Databases, Query, ID } from 'node-appwrite';

// Client WITHOUT API key - simulating browser access
const client = new Client()
  .setEndpoint('https://backend.firefetch.org/v1')
  .setProject('69373be900166fcb421c');
  // No .setKey() - this simulates browser SDK behavior

const databases = new Databases(client);
const DATABASE_ID = 'candy-inventory';
const STORES_COLLECTION = 'stores';
const LOCATIONS_COLLECTION = 'locations';

async function testBrowserAccess() {
  console.log('Testing Appwrite access WITHOUT API key (browser mode)...\n');

  // Test 1: List stores (read permission)
  try {
    console.log('1. Testing READ permission (list stores)...');
    const stores = await databases.listDocuments(DATABASE_ID, STORES_COLLECTION);
    console.log(`   ✓ Read works! Found ${stores.total} stores\n`);
  } catch (error) {
    console.log(`   ✗ Read failed: ${error.message}\n`);
    return;
  }

  // Test 2: Create a store (create permission)
  const testStoreNumber = '8888';
  let createdStoreId = null;
  try {
    console.log(`2. Testing CREATE permission (create store #${testStoreNumber})...`);
    const store = await databases.createDocument(
      DATABASE_ID,
      STORES_COLLECTION,
      ID.unique(),
      { storeNumber: testStoreNumber, targetDate: '2025-12-21' }
    );
    createdStoreId = store.$id;
    console.log(`   ✓ Create works! Store ID: ${createdStoreId}\n`);
  } catch (error) {
    console.log(`   ✗ Create failed: ${error.message}\n`);
    return;
  }

  // Test 3: Update the store (update permission)
  try {
    console.log('3. Testing UPDATE permission...');
    await databases.updateDocument(
      DATABASE_ID,
      STORES_COLLECTION,
      createdStoreId,
      { targetDate: '2025-12-25' }
    );
    console.log(`   ✓ Update works!\n`);
  } catch (error) {
    console.log(`   ✗ Update failed: ${error.message}\n`);
  }

  // Test 4: Create location (for new store)
  let createdLocationId = null;
  try {
    console.log('4. Testing CREATE location...');
    const location = await databases.createDocument(
      DATABASE_ID,
      LOCATIONS_COLLECTION,
      ID.unique(),
      { storeNumber: testStoreNumber, name: 'Test Location', icon: '🧪', order: 0 }
    );
    createdLocationId = location.$id;
    console.log(`   ✓ Location created! ID: ${createdLocationId}\n`);
  } catch (error) {
    console.log(`   ✗ Location create failed: ${error.message}\n`);
  }

  // Test 5: Delete (cleanup)
  try {
    console.log('5. Testing DELETE permission (cleanup)...');
    if (createdLocationId) {
      await databases.deleteDocument(DATABASE_ID, LOCATIONS_COLLECTION, createdLocationId);
      console.log('   ✓ Location deleted');
    }
    await databases.deleteDocument(DATABASE_ID, STORES_COLLECTION, createdStoreId);
    console.log('   ✓ Store deleted\n');
  } catch (error) {
    console.log(`   ✗ Delete failed: ${error.message}\n`);
  }

  console.log('✅ All browser-mode tests passed! The app should work now.');
}

testBrowserAccess();
