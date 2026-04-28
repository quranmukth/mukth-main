
import mongoose from 'mongoose';
import { setServers } from 'node:dns';

setServers(['8.8.8.8', '8.8.4.4']);

const host = 'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net';
const user = 'mukth';
const pass = '0gnbasio6t3v6qie';

async function run() {
  const uri = `mongodb://${user}:${pass}@${host}:27017/mukth?ssl=true&authSource=admin&directConnection=true`;
  console.log(`Testing user=mukth...`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ SUCCESS!`);
    await mongoose.disconnect();
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
  }
}

run();
