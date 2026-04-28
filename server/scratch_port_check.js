
import { Socket } from 'net';

const hosts = [
  'ac-shobuu2-shard-00-00.kgqsqqy.mongodb.net',
  'ac-shobuu2-shard-00-01.kgqsqqy.mongodb.net',
  'ac-shobuu2-shard-00-02.kgqsqqy.mongodb.net'
];

async function checkPort(host, port = 27017) {
  return new Promise((resolve) => {
    const socket = new Socket();
    socket.setTimeout(5000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function run() {
  console.log('Checking TCP connectivity to port 27017...');
  for (const host of hosts) {
    const ok = await checkPort(host);
    console.log(`${host} -> ${ok ? 'OPEN' : 'CLOSED'}`);
  }
}

run();
