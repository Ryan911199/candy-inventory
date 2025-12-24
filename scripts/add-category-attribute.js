/**
 * Script to add 'category' attribute to items collection
 * Categories: 'candy' or 'gm' (general merchandise)
 * 
 * This script also migrates existing items to have the 'candy' category
 * since all existing items were candy items before this update.
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://backend.firefetch.org/v1')
  .setProject('69373be900166fcb421c')
  .setKey('standard_42196009213653bf938590819d94d60170251a74703a9f4ed6f7aa66fee0c2e1d6e1efea36ec5fce090c7b8020c0ad74cc6ea298ad4b0dfcb04c81113ed8c1b23cebc69439b68b0f3231ae1d1247ca874f677799dc191a9572697dab812b1182fd8629b00e343a726f6caeccb101d7714c864e9bef4f509dc5ba3aea82f36d04');

const databases = new Databases(client);
const DATABASE_ID = 'candy-inventory';

async function addCategoryAttribute() {
  console.log('Adding category attribute to items collection...\n');

  // Add category attribute to items collection
  try {
    console.log('1. Adding category attribute to items collection...');
    await databases.createStringAttribute(
      DATABASE_ID,
      'items',
      'category',
      20,        // size (enough for 'candy' or 'gm')
      false,     // required
      'candy',   // default value (existing items are candy)
      false      // array
    );
    console.log('   ✓ Added category attribute to items\n');
  } catch (error) {
    if (error.message?.includes('already exists') || error.code === 409) {
      console.log('   ℹ Category attribute already exists in items\n');
    } else {
      console.log(`   ✗ Error: ${error.message}\n`);
    }
  }

  // Create index on items for faster category queries
  try {
    console.log('2. Creating index on items (storeNumber + holiday + category)...');
    await databases.createIndex(
      DATABASE_ID,
      'items',
      'item_category_idx',
      'key',
      ['storeNumber', 'holiday', 'category']
    );
    console.log('   ✓ Created index\n');
  } catch (error) {
    if (error.message?.includes('already exists') || error.code === 409) {
      console.log('   ℹ Index already exists\n');
    } else {
      console.log(`   ✗ Error: ${error.message}\n`);
    }
  }

  // Wait for attribute to be available
  console.log('3. Waiting for attribute to be available (5 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('   ✓ Done waiting\n');

  // Migrate existing items to have category = 'candy'
  try {
    console.log('4. Migrating existing items to category=candy...');
    
    // Get all items without a category
    let offset = 0;
    let totalMigrated = 0;
    const limit = 100;
    
    while (true) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'items',
        [Query.limit(limit), Query.offset(offset)]
      );
      
      if (response.documents.length === 0) break;
      
      for (const item of response.documents) {
        if (!item.category) {
          try {
            await databases.updateDocument(
              DATABASE_ID,
              'items',
              item.$id,
              { category: 'candy' }
            );
            totalMigrated++;
          } catch (updateError) {
            console.log(`   ⚠ Could not update item ${item.$id}: ${updateError.message}`);
          }
        }
      }
      
      offset += limit;
      console.log(`   ... processed ${offset} items so far`);
      
      if (response.documents.length < limit) break;
    }
    
    console.log(`   ✓ Migrated ${totalMigrated} items to category=candy\n`);
  } catch (error) {
    console.log(`   ✗ Error during migration: ${error.message}\n`);
  }

  console.log('Done! Category attribute has been added and existing items migrated.');
}

addCategoryAttribute();
