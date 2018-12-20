const QcloudSms = require('qcloudsms_js');
const rp = require('request-promise');

module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 获取短信验证码
     * @returns {Promise<*>}
     */
  async getCodeAction() {
    const tel = this.post('tel');
    // if (!global.is_phone(tel)) {
    //   return this.fail();
    // }
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
    var smsType = 0; // Enum{0: 普通短信, 1: 营销短信}
    // ssender.send(86, tel, templateId, params, SmsSign, "", "" function(err, res, resData) {
    ssender.send(smsType, 86, tel, '【及时雨】您的验证码是' + code + ',请于10分钟内填写。如非本人操作,请忽略此短信。', '', '', function(err, res, resData) {
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
    return this.success(wxuser);
  }

  /**
     * 登录微信
     * @returns {Promise<*>}
     */
  async loginAction() {
    const code = this.post('code');
    const fullUserInfo = this.post('userInfo');
    const userInfo = fullUserInfo.userInfo;
    let clientIp = this.service('express', 'api').check_document_position(this.ctx.req); // 暂时不记录 ip
    const arr = clientIp.split(':');
    clientIp = arr[arr.length - 1];

    // 获取openid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      qs: {
        grant_type: 'authorization_code',
        js_code: code,
        secret: think.config('weixin.secret'),
        appid: think.config('weixin.appid')
      }
    };

    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    if (!sessionData.openid) {
      console.log(sessionData.openid);
      return this.fail(1, '登录失败');
    }

    // 验证用户信息完整性
    const crypto = require('crypto');
    const sha1 = crypto.createHash('sha1').update(fullUserInfo.rawData + sessionData.session_key).digest('hex');
    if (fullUserInfo.signature !== sha1) {
      return this.fail(2, '登录失败');
    }

    // 解释用户数据
    const WeixinSerivce = this.service('weixin', 'api');
    const weixinUserInfo = await WeixinSerivce.decryptUserInfoData(sessionData.session_key, fullUserInfo.encryptedData, fullUserInfo.iv);
    if (think.isEmpty(weixinUserInfo)) {
      return this.fail(3, '登录失败');
    }

    // 根据openid查找用户是否已经注册
    let userId = await this.model('wx_user').where({ openid: sessionData.openid }).getField('id', true);
    if (think.isEmpty(userId)) {
      // 注册
      userId = await this.model('wx_user').add({
        subscribe: '1',
        subscribe_time: new Date().getTime(),
        city: userInfo.city,
        country: userInfo.country,
        province: userInfo.province,
        language: userInfo.language,
        openid: sessionData.openid,
        headimgurl: userInfo.avatarUrl || '',
        sex: userInfo.gender || 1, // 性别 0：未知、1：男、2：女
        nickname: userInfo.nickName
        // tel: tel
      });
    }

    sessionData.user_id = userId;

    // 查询用户信息
    const newUserInfo = await this.model('wx_user').field(['id', 'nickname', 'sex', 'headimgurl', 'tel']).where({ id: userId }).find();

    // 更新登录信息
    userId = await this.model('wx_user').where({ id: userId }).update({
      last_login_time: parseInt(new Date().getTime() / 1000),
      last_login_ip: clientIp
      // tel: tel
    });

    const TokenSerivce = this.service('token', 'api');
    const sessionKey = await TokenSerivce.create(sessionData);

    if (think.isEmpty(newUserInfo) || think.isEmpty(sessionKey)) {
      return this.fail(4, '登录失败');
    }

    return this.success({ token: sessionKey, userInfo: newUserInfo });
  }
  /**
     * 获取用户tel
     * @returns {Promise<*>}
     */
  async telAction() {
    const code = this.post('code');
    const encryptedData = this.post('encryptedData');
    const iv = this.post('iv');
    // 获取openid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      qs: {
        grant_type: 'authorization_code',
        js_code: code,
        secret: think.config('weixin.secret'),
        appid: think.config('weixin.appid')
      }
    };
    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    if (!sessionData.session_key) {
      return this.fail(1, '出错');
    }
    const WXBizDataDrypt = this.service('WXBizDataDrypt', think.config('weixin.appid'), sessionData.session_key);
    const data = WXBizDataDrypt.decryptData(encryptedData, iv);
    const userInfo = {
      id: this.getLoginUserId(),
      tel: data.phoneNumber
    };
    const res = await this.model('wx_user').where({id: userInfo.id}).update(userInfo);
    let newUserInfo = {};
    if (res) {
      newUserInfo = await this.model('wx_user').field(['id', 'nickname', 'sex', 'headimgurl', 'tel']).where({ id: userInfo.id }).find();
    }
    return this.success(newUserInfo);
  }

  /**
     * 获取积分，储值，VIP
     */
  async getAction() {
    const userId = this.getLoginUserId();
    const user = await this.model('wx_user').field('is_vip,integral,money').find(userId);
    return this.success(user);
  }

  async lognAction() {
    const natureList = await this.model('nature').select();
    const natureArr = [];
    for (const i in natureList) {
      const nature = natureList[i];
      nature.imgUrl = await global.get_pic(nature.icon);
      const n = {
        id: nature.id,
        name: nature.name,
        imgUrl: nature.imgUrl
      };
      natureArr.push(n);
    }
    // 获取登陆的logo
    const logo = this.config('setupapp.ADD_LOGO');
    const imgList = logo.split(',');
    const imgArr = [];
    for (const img of imgList) {
      const a = await global.get_pic(img);
      imgArr.push(a);
    }
    const disImgPath = await global.get_pic(logo);
    const data = {
      imgArr: imgArr,
      disImgPath: disImgPath,
      natureArr: natureArr
    };
    return this.success(data);
  }
};
