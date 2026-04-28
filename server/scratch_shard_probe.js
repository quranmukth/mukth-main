
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

const base = 'ac-shobuu2-shard-00-';
const suffixes = ['00', '01', '02'];
const domain = '.kgqsqqy.mongodb.net';

console.log('Probing shards...');
for (const s of suffixes) {
    const host = base + s + domain;
    const ips = await fetchDoh(host);
    console.log(`${host} ->`, ips || 'FAILED');
}
