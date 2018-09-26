// default config
module.exports = {
  port: 8080,
  http_: 1, // 1:http,2:https
  document_model_type: {2: '主题', 1: '目录', 3: '段落'}, // 文档模型配置 (文档模型核心配置，请勿更改)
  user_administrator: [1], // 数组格式，可以配置多个[1,2,3]

  host: '0.0.0.0', // server host
  workers: 0, // server workers num, if value is 0 then get cpus num | 服务器工作者号，如果值为0，则得到CPU 。
  createServer: undefined, // create server function | 创建服务器函数
  startServerTimeout: 3000, // before start server time | 在启动服务器时间之前
  reloadSignal: 'SIGUSR2', // reload process signal | 再加载过程信号
  onUnhandledRejection: err => think.logger.error(err), // unhandledRejection handle
  onUncaughtException: err => think.logger.error(err), // uncaughtException handle
  processKillTimeout: 10 * 1000, // process kill timeout, default is 10s | 进程杀死超时，默认为10s
  enableAgent: false, // enable agent worker| 启用代理工作人员
  jsonpCallbackField: 'callback', // jsonp callback field|JSONP回调字段
  jsonContentType: 'application/json', // json content type|JSON内容类型
  errnoField: 'errno', // errno field|
  errmsgField: 'errmsg', // errmsg field|
  defaultErrno: 1000, // default errno|
  validateDefaultErrno: 1001 // validate default errno|验证错误
};
