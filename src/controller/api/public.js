const QcloudSms = require('qcloudsms_js');
module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  // 获取短信验证码
  async getCodeAction() {
    const tel = this.post('tel');
    if (!global.is_phone(tel)) {
      return this.fail();
    }
    const code = global.make_code(6);
    const cloud = this.config('cloud');
    const appid = cloud.appid;
    const appkey = cloud.appkey;
    const templateId = cloud.templateId;
    const smsSign = cloud.smsSign;
    // 实例化QcloudSms
    const qcloudsms = QcloudSms(appid, appkey);
    const ssender = qcloudsms.SmsSingleSender();
    const params = [];// 数组具体的元素个数和模板中变量个数必须一致，例如事例中templateId:5678对应一个变量，参数数组中元素个数也必须是一个
    params.push(code);
    params.push('10');
    ssender.sendWithParam(86, tel, params, templateId, smsSign, '', '', function(err, res, resData) {
      if (err) {
        console.log('err: ', err);
      } else {
        console.log('request data: ', res.req);
        console.log('response data: ', resData);
      }
    }); // 签名参数未提供或者为空时，会使用默认签名发送短信
    const nowTime = new Date().getTime();
    const wxuser = {
      tel: tel,
      code: code,
      nowTime: nowTime
    };
    await this.session('wxuser', wxuser);
    console.log(wxuser);
    return this.success(code);
  }
};
