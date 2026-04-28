
import mongoose from 'mongoose';
import { setServers } from 'node:dns';

setServers(['8.8.8.8', '8.8.4.4']);

const host = 'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net';
const user = 'admin';
const pass = '0gnbasio6t3v6qie';

async function run() {
  const uri = `mongodb://${user}:${pass}@${host}:27017/admin?ssl=true&directConnection=true`;
  console.log('Connecting to single shard to get cluster info...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected!');
    const isMaster = await mongoose.connection.db.admin().command({ isMaster: 1 });
    console.log('IsMaster Result:', JSON.stringify(isMaster, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

run();
