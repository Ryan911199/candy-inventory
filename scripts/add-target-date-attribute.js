/**
 * Migration script to add targetDate attribute to stores collection
 * Run with: node scripts/add-target-date-attribute.js
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://backend.firefetch.org/v1')
  .setProject('69373be900166fcb421c')
  .setKey('standard_42196009213653bf938590819d94d60170251a74703a9f4ed6f7aa66fee0c2e1d6e1efea36ec5fce090c7b8020c0ad74cc6ea298ad4b0dfcb04c81113ed8c1b23cebc69439b68b0f3231ae1d1247ca874f677799dc191a9572697dab812b1182fd8629b00e343a726f6caeccb101d7714c864e9bef4f509dc5ba3aea82f36d04');

const databases = new Databases(client);
const DATABASE_ID = 'candy-inventory';
const STORES_COLLECTION = 'stores';

async function addTargetDateAttribute() {
  try {
    console.log('Adding targetDate attribute to stores collection...');

    // Create the targetDate attribute (string for ISO date format)
    await databases.createStringAttribute(
      DATABASE_ID,
      STORES_COLLECTION,
      'targetDate',
      255,      // max size
      false,    // required
      '2025-12-21', // default value
      false     // array
    );

    console.log('Successfully added targetDate attribute!');
    console.log('Note: The attribute may take a moment to become available.');
  } catch (error) {
    if (error.code === 409) {
      console.log('Attribute already exists - no action needed.');
    } else {
      console.error('Error adding attribute:', error.message);
      throw error;
    }
  }
}

addTargetDateAttribute();
