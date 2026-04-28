
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

const host = 'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net';
const uri = `mongodb://admin:0gnbasio6t3v6qie@${host}:27017/mukth?ssl=true&authSource=admin&retryWrites=true&w=majority&directConnection=true`;

console.log('Testing connection to:', host);

try {
  const ip = await fetchDoh(host);
  console.log('Resolved IP:', ip);
  
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    lookup: (h, o, cb) => {
        if (h === host) return cb(null, ip, 4);
        cb(new Error('Unexpected lookup: ' + h));
    }
  });
  
  console.log('✅ SUCCESS: Connected to MongoDB!');
  await mongoose.connection.close();
} catch (err) {
  console.error('❌ FAILED:', err.message);
}
