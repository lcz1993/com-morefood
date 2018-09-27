module.exports = class extends think.Controller {
  async __before() {
    // 根据token值获取用户id
    think.token = this.ctx.header['x-tssc-token'] || '';
    const tokenSerivce = think.service('token', 'api');
    think.userId = await tokenSerivce.getUserId();

    const publicController = this.config('publicController');
    const publicAction = this.config('publicAction');
    // 如果为非公开，则验证用户是否登录
    const controllerAction = this.ctx.controller + '/' + this.ctx.action;

    if (!publicController.includes(this.ctx.controller) && !publicAction.includes(controllerAction)) {
      if (think.userId <= 0) {
        return this.fail(401, '请先登录');
      }
    }
  }

  /**
     * 获取时间戳
     * @returns {Number}
     */
  getTime() {
    return parseInt(Date.now() / 1000);
  }

  /**
     * 获取当前登录用户的id
     * @returns {*}
     */
  getLoginUserId() {
    return think.userId;
  }
  // 跨域设置
  setCorsHeader() {
    this.header('Access-Control-Allow-Origin', this.header('origin') || '*');
    this.header('Access-Control-Allow-Headers', 'x-requested-with');
    this.header('Access-Control-Request-Method', 'GET,POST,PUT,DELETE');
    this.header('Access-Control-Allow-Credentials', 'true');
  }

  /**
     * 获取域名
     */
  getHost() {
    const url = this.ctx;
    const host = url.host;
    const arr = host.split(':')[0];
    if (arr.length > 1) {
      return url.protocol + '://' + host;
    }
    return url.protocol + '://' + host.split(':')[0];
  }
};
