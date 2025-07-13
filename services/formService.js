const axios = require('axios');

async function fetchURL(url) {
  const response = await axios.get(url);
  return response.data;
}

module.exports = {
  fetchURL
};