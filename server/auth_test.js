import mongoose from 'mongoose';
import https from 'node:https';

async function dohResolve(hostname) {
  const url = `https://dns.google/resolve?name=${hostname}&type=A`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'Accept': 'application/dns-json' } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const json = JSON.parse(data);
        resolve(json.Answer[json.Answer.length - 1].data);
      });
    });
  });
}

const host = 'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net';
const user = 'admin';
const pass = '0gnbasio6t3v6qie';
const rs = 'atlas-7p6w8m-shard-0';

async function testAuth(authSource) {
  const uri = `mongodb://${user}:${pass}@${host}:27017/mukth?ssl=true&replicaSet=${rs}&authSource=${authSource}`;
  console.log(`Testing with replicaSet and authSource=${authSource}...`);
  try {
    const ip = await dohResolve(host);
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 15000,
      lookup: (h, o, cb) => cb(null, ip, 4)
    });
    console.log(`✅ Auth SUCCESS with authSource=${authSource}`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log(`❌ Auth FAILED: ${err.message}`);
    return false;
  }
}

const sources = ['admin', 'mukth'];
for (const s of sources) {
  if (await testAuth(s)) break;
}
process.exit(0);
