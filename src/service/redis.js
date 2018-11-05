module.exports = class extends think.Service {
  async set(key, value) {
    const redis = think.config('redis');
    const client = think.config('client');
    await client.set(key, value, redis.print);
  }
  async get(key) {
    const client = think.config('client');
    let result = '';
    await client.get(key, function(res) {
      console.log(res);
      result = res;
    });
    return result;
  }
};
