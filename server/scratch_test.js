import https from 'node:https';

async function testSrv(id) {
  const url = `https://dns.google/resolve?name=_mongodb._tcp.mukth-db.${id}.mongodb.net&type=SRV`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'Accept': 'application/dns-json' } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
}

console.log('Testing SRV records...');
const ids = ['kgqsqqy', '7p6w8m'];
for (const id of ids) {
  const json = await testSrv(id);
  console.log(`ID: ${id} | Status: ${json.Status} | Answers: ${json.Answer ? json.Answer.length : 0}`);
  if (json.Answer) {
    console.log('Targets:', json.Answer.map(a => a.data));
  }
}
