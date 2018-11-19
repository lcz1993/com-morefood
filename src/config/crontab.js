module.exports = [{
  cron: '*/1 * * * *',
  handle: 'admin/crontab/cloa',
  type: 'one',
  enable: false // 关闭当前定时器，默认true
}, {
  cron: '1 0 1 * *',
  handle: 'admin/crontab/score',
  type: 'one',
  enable: true // 关闭当前定时器，默认true
}];
