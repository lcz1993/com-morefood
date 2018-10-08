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
  validateDefaultErrno: 1001, // validate default errno|验证错误

  // 以下针对小程序，可以公开的接口与不可以公开的接口既需要登录的接口
  default_module: 'api',
  weixin: {
    appid: 'wx316af34c36f1546e', // 小程序 appid
    secret: '339501f621c61694e7e18aa9f43fecd6', // 小程序密钥
    mch_id: '1503371891', // 商户帐号ID
    partner_key: 'f13934f7872c049b8006fa8b3620c89a', // 微信支付密钥
    notify_url: '' // 微信异步通知，例：https://www.nideshop.com/api/pay/notify
  },
  // 可以公开访问的Controller
  publicController: [
    // 格式为controller
    'api/index',
    'api/address'
  ],

  // 可以公开访问的Action
  publicAction: [
    // 格式为： controller+action

  ]
};
