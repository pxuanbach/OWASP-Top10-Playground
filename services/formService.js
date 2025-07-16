const axios = require('axios');
const dns = require('dns').promises;
const ip = require('ip');
const { URL } = require('url');

const ALLOWED_HOSTS = [
  'example.com',
  'api.example.com'
];

const BLACKLIST_REGEX = [
  /\.internal$/,
  /\.local$/,
  /^staging\./
];

// ---- (1) Insecure version ----
async function fetchURL(url) {
  const response = await axios.get(url);
  return response.data;
}

// ---- (2) Simple whitelist version ----
async function safeFetchURL(url) {
  const parsed = new URL(url);
  const hostname = parsed.hostname.toLowerCase();

  if (!ALLOWED_HOSTS.includes(hostname)) {
    throw new Error(`Blocked by SSRF protection! Host not allowed: ${hostname}`);
  }

  const response = await axios.get(url);
  return response.data;
}

// ---- (3) Advanced protection version ----
async function verySafeFetchURL(url) {
  const parsed = new URL(url);
  const hostname = parsed.hostname.toLowerCase();

  // 1️⃣ Block by regex blacklist
  for (const pattern of BLACKLIST_REGEX) {
    if (pattern.test(hostname)) {
      throw new Error(`Blocked by SSRF protection! Host blacklisted: ${hostname}`);
    }
  }

  // 2️⃣ Resolve IP
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err) {
    throw new Error(`DNS resolution failed for ${hostname}`);
  }

  for (const addr of addresses) {
    if (isPrivateIP(addr.address)) {
      throw new Error(`Blocked by SSRF protection! Private IP: ${addr.address}`);
    }
  }

  // 3️⃣ Fetch if passed all checks
  const response = await axios.get(url);
  return response.data;
}

// ---- Utility: Check Private IP ranges ----
function isPrivateIP(address) {
  // Handle IPv6 loopback
  if (address === '::1') return true;

  // IPv4 ranges
  return (
    ip.isLoopback(address) ||
    ip.isPrivate(address)
  );
}

module.exports = {
  fetchURL,
  safeFetchURL,
  verySafeFetchURL
};
