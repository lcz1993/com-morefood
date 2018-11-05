// invoked in worker
require('./global');
require('./model');
require('./tags');
const redis = require('redis');
think.beforeStartServer(async() => {
  // 加载网站配置
  const webconfig = await think.model('cmswing/setup').getset();
  think.config('setup', webconfig);
  // 加载小程序配置
  const appconfig = await think.model('cmswing/setupapp').getset();
  think.config('setupapp', appconfig);
  // 加载扩展配置
  const extconfig = await think.model('cmswing/ext').getset();
  think.config('ext', extconfig);
  // 配置redis
  const client = redis.createClient('6379', '127.0.0.1');
  think.config('client', client);
  think.config('redis', redis);
});
