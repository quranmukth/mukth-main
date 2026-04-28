
import mongoose from 'mongoose';
import https from 'node:https';

async function fetchDoh(hostname) {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`;
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/dns-json' } }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          if (json.Status !== 0 || !json.Answer) return reject(new Error('No answer'));
          const aRecords = json.Answer.filter(a => a.type === 1);
          if (aRecords.length === 0) return reject(new Error('No A records'));
          resolve(aRecords[aRecords.length - 1].data);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const hosts = [
    'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net',
    'ac-shobuu2-shard-00-01.kgqsqqy.mongodb.net',
    'ac-shobuu2-shard-00-02.kgqsqqy.mongodb.net'
];

const ips = {};

console.log('Resolving all shards...');
for (const h of hosts) {
    ips[h] = await fetchDoh(h);
    console.log(`${h} -> ${ips[h]}`);
}

const uri = `mongodb://admin:0gnbasio6t3v6qie@${hosts.join(':27017,')}:27017/mukth?ssl=true&authSource=admin&retryWrites=true&w=majority&replicaSet=atlas-m0-shard-0`;

console.log('Connecting to cluster...');

try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    lookup: (h, o, cb) => {
        if (ips[h]) return cb(null, ips[h], 4);
        // If it's a hostname we didn't resolve (like the internal rs members)
        // we might have a problem. But usually they match.
        cb(null, h, 4); 
    }
  });
  
  console.log('✅ SUCCESS: Connected to MongoDB Cluster!');
  await mongoose.connection.close();
} catch (err) {
  console.error('❌ FAILED:', err.message);
}
