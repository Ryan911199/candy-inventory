/**
 * Script to add 'holiday' attribute to stores and items collections
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://backend.firefetch.org/v1')
  .setProject('69373be900166fcb421c')
  .setKey('standard_42196009213653bf938590819d94d60170251a74703a9f4ed6f7aa66fee0c2e1d6e1efea36ec5fce090c7b8020c0ad74cc6ea298ad4b0dfcb04c81113ed8c1b23cebc69439b68b0f3231ae1d1247ca874f677799dc191a9572697dab812b1182fd8629b00e343a726f6caeccb101d7714c864e9bef4f509dc5ba3aea82f36d04');

const databases = new Databases(client);
const DATABASE_ID = 'candy-inventory';

async function addHolidayAttribute() {
  console.log('Adding holiday attribute to collections...\n');

  // Add to stores collection
  try {
    console.log('1. Adding holiday attribute to stores collection...');
    await databases.createStringAttribute(
      DATABASE_ID,
      'stores',
      'holiday',
      50,        // size
      false,     // required
      'christmas', // default value
      false      // array
    );
    console.log('   ✓ Added holiday attribute to stores\n');
  } catch (error) {
    if (error.message?.includes('already exists') || error.code === 409) {
      console.log('   ℹ Holiday attribute already exists in stores\n');
    } else {
      console.log(`   ✗ Error: ${error.message}\n`);
    }
  }

  // Add to items collection
  try {
    console.log('2. Adding holiday attribute to items collection...');
    await databases.createStringAttribute(
      DATABASE_ID,
      'items',
      'holiday',
      50,        // size
      false,     // required
      null,      // default value (null for backwards compatibility)
      false      // array
    );
    console.log('   ✓ Added holiday attribute to items\n');
  } catch (error) {
    if (error.message?.includes('already exists') || error.code === 409) {
      console.log('   ℹ Holiday attribute already exists in items\n');
    } else {
      console.log(`   ✗ Error: ${error.message}\n`);
    }
  }

  // Create index on stores for faster holiday queries
  try {
    console.log('3. Creating index on stores (storeNumber + holiday)...');
    await databases.createIndex(
      DATABASE_ID,
      'stores',
      'store_holiday_idx',
      'key',
      ['storeNumber', 'holiday']
    );
    console.log('   ✓ Created index\n');
  } catch (error) {
    if (error.message?.includes('already exists') || error.code === 409) {
      console.log('   ℹ Index already exists\n');
    } else {
      console.log(`   ✗ Error: ${error.message}\n`);
    }
  }

  // Create index on items for faster holiday queries
  try {
    console.log('4. Creating index on items (storeNumber + holiday)...');
    await databases.createIndex(
      DATABASE_ID,
      'items',
      'item_holiday_idx',
      'key',
      ['storeNumber', 'holiday']
    );
    console.log('   ✓ Created index\n');
  } catch (error) {
    if (error.message?.includes('already exists') || error.code === 409) {
      console.log('   ℹ Index already exists\n');
    } else {
      console.log(`   ✗ Error: ${error.message}\n`);
    }
  }

  console.log('Done! Note: Attributes may take a few seconds to become available.');
}

addHolidayAttribute();
