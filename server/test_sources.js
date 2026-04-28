
import mongoose from 'mongoose';
import { setServers } from 'node:dns';

setServers(['8.8.8.8', '8.8.4.4']);

const host = 'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net';
const user = 'admin';
const pass = '0gnbasio6t3v6qie';

async function test(source) {
  const uri = `mongodb://${user}:${pass}@${host}:27017/mukth?ssl=true&authSource=${source}&directConnection=true`;
  console.log(`Testing authSource=${source}...`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ SUCCESS with ${source}`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log(`❌ FAILED with ${source}: ${err.message}`);
    return false;
  }
}

async function run() {
  const sources = ['admin', 'mukth', '$external'];
  for (const s of sources) {
    if (await test(s)) break;
  }
}

run();
