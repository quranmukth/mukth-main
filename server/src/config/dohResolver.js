/**
 * @module dohResolver
 * @description UNIVERSAL DNS-over-HTTPS (DoH) resolver for Egypt.
 * Automatically intercepts ALL .mongodb.net lookups to bypass ISP poisoning.
 */
import https from 'node:https';
import logger from './logger.js';

const _cache = new Map();

/**
 * Perform a DoH query via Google or Cloudflare.
 */
const fetchDoh = (hostname) =>
  new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`;
    const options = {
      headers: { 'Accept': 'application/dns-json', 'User-Agent': 'Mukth-Server-DoH/1.0' },
      timeout: 8000
    };
    
    https.get(url, options, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          if (json.Status !== 0 || !json.Answer) return reject(new Error('No answer'));
          // Return the last A record (usually the most direct IP)
          const aRecords = json.Answer.filter(a => a.type === 1);
          if (aRecords.length === 0) return reject(new Error('No A records'));
          resolve(aRecords[aRecords.length - 1].data);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });

/**
 * Universal lookup function for Mongoose.
 * Intercepts .mongodb.net and redirects them through DoH.
 */
export function makeDohLookup() {
  return async (hostname, options, callback) => {
    // 1. Check if it's an Atlas hostname
    const isAtlas = hostname.endsWith('.mongodb.net');

    // 2. Resolve 'mukth-db-shard' alias to 'ac-shobuu2-shard' if present
    let targetHost = hostname;
    if (hostname.includes('mukth-db-shard')) {
      targetHost = hostname.replace('mukth-db-shard', 'ac-shobuu2-shard');
    }

    if (isAtlas) {
      if (_cache.has(targetHost)) {
        return callback(null, _cache.get(targetHost), 4);
      }

      try {
        const ip = await fetchDoh(targetHost);
        _cache.set(targetHost, ip);
        logger.info(`🌐 DoH Bypassed: ${hostname} → ${ip}`);
        return callback(null, ip, 4);
      } catch (err) {
        logger.error(`❌ DoH Failed for ${hostname}: ${err.message}`);
        // Fallback to system DNS (will likely fail but it's the last resort)
      }
    }

    // Default: use system DNS for everything else (localhost, etc.)
    import('node:dns').then(dns => {
      dns.lookup(hostname, options, callback);
    });
  };
}

/**
 * Pre-warm cache for the initial hosts in the URI.
 */
export async function prewarmDohCache(mongoUri) {
  const hosts = mongoUri.match(/@([^/?]+)/)?.[1]?.split(',')
    .map(h => h.split(':')[0]) || [];

  logger.info(`🔍 Warming DoH cache for ${hosts.length} hosts...`);
  
  for (const h of hosts) {
    const lookup = makeDohLookup();
    await new Promise(r => lookup(h, {}, () => r()));
  }
}
