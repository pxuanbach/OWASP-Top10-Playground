const ALLOWED_HOSTS = [
  'example.com',
  'api.example.com'
];

const BLACKLIST_REGEX = [
  /\.internal$/,
  /\.local$/,
  /^staging\./
];

module.exports = {
  ALLOWED_HOSTS,
  BLACKLIST_REGEX
};
