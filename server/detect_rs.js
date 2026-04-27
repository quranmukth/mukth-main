import { MongoClient } from 'mongodb';
import https from 'node:https';

async function fetchDoh(hostname) {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/dns-json' } }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(JSON.parse(raw).Answer.pop().data));
    }).on('error', reject);
  });
}

const host = 'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net';
const uri = `mongodb://admin:0gnbasio6t3v6qie@${host}:27017/mukth?ssl=true&authSource=admin`;

console.log('Detecting Replica Set Name...');
const ip = await fetchDoh(host);
const client = new MongoClient(uri, { 
  serverSelectionTimeoutMS: 10000,
  lookup: (h, o, cb) => cb(null, ip, 4)
});

try {
  await client.connect();
  const isMaster = await client.db('admin').command({ isMaster: 1 });
  console.log('✅ Connected!');
  console.log('REAL Replica Set Name:', isMaster.setName);
  await client.close();
} catch (err) {
  console.log('❌ Failed:', err.message);
  process.exit(1);
}
