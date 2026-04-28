
import mongoose from 'mongoose';
import { setServers } from 'node:dns';

setServers(['8.8.8.8', '8.8.4.4']);

const hosts = [
  'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net',
  'ac-shobuu2-shard-00-01.kgqsqqy.mongodb.net',
  'ac-shobuu2-shard-00-02.kgqsqqy.mongodb.net'
];
const user = 'admin';
const pass = '0gnbasio6t3v6qie';

async function test(host) {
  const uri = `mongodb://${user}:${pass}@${host}:27017/mukth?ssl=true&authSource=admin&directConnection=true`;
  console.log(`Testing host=${host}...`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ SUCCESS with ${host}`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log(`❌ FAILED with ${host}: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const h of hosts) {
    await test(h);
  }
}

run();
