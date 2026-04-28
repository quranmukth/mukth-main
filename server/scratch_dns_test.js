
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
          if (json.Status !== 0 || !json.Answer) return resolve(null);
          resolve(json.Answer.filter(a => a.type === 1).map(a => a.data));
        } catch (e) { resolve(null); }
      });
    }).on('error', (e) => resolve(null));
  });
}

const host1 = 'mukth-db-shard-00-00.kgqsqqy.mongodb.net';
const host2 = 'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net';

console.log('Resolving hosts via Google DoH...');
const ips1 = await fetchDoh(host1);
const ips2 = await fetchDoh(host2);

console.log(`${host1} ->`, ips1 || 'FAILED');
console.log(`${host2} ->`, ips2 || 'FAILED');
