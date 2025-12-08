/**
 * Fix Appwrite collection permissions to allow public access
 * This is needed because the browser SDK doesn't use an API key
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://backend.firefetch.org/v1')
  .setProject('69373be900166fcb421c')
  .setKey('standard_42196009213653bf938590819d94d60170251a74703a9f4ed6f7aa66fee0c2e1d6e1efea36ec5fce090c7b8020c0ad74cc6ea298ad4b0dfcb04c81113ed8c1b23cebc69439b68b0f3231ae1d1247ca874f677799dc191a9572697dab812b1182fd8629b00e343a726f6caeccb101d7714c864e9bef4f509dc5ba3aea82f36d04');

const databases = new Databases(client);
const DATABASE_ID = 'candy-inventory';

const COLLECTIONS = ['stores', 'locations', 'items'];

// Public permissions for read, create, update, delete
const PUBLIC_PERMISSIONS = [
  Permission.read(Role.any()),
  Permission.create(Role.any()),
  Permission.update(Role.any()),
  Permission.delete(Role.any())
];

async function fixPermissions() {
  console.log('Fixing collection permissions...\n');

  for (const collectionId of COLLECTIONS) {
    try {
      console.log(`Updating ${collectionId} collection...`);

      await databases.updateCollection(
        DATABASE_ID,
        collectionId,
        collectionId, // name (using same as id)
        PUBLIC_PERMISSIONS,
        true, // documentSecurity
        true  // enabled
      );

      console.log(`  ✓ ${collectionId} - permissions updated\n`);
    } catch (error) {
      console.log(`  ✗ ${collectionId} - error: ${error.message}\n`);
    }
  }

  console.log('Done! Collections now have public read/write access.');
  console.log('\nNote: This allows anyone to access the data without authentication.');
  console.log('For a production app, consider implementing proper authentication.');
}

fixPermissions();
