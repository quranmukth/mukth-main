
import mongoose from 'mongoose';
import { setServers } from 'node:dns';

setServers(['8.8.8.8', '8.8.4.4']);

const user = 'admin';
const pass = '0gnbasio6t3v6qie';
const uri = `mongodb+srv://${user}:${pass}@mukth-db.kgqsqqy.mongodb.net/mukth?retryWrites=true&w=majority`;

async function run() {
  console.log('Testing +srv with setServers...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ SUCCESS!');
    await mongoose.disconnect();
  } catch (err) {
    console.log('❌ FAILED:', err.message);
  }
}

run();
