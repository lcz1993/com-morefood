module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 签到页面初始化
     * @returns {Promise<*>}
     */
  async signindexAction() {
    // 获取今天0点的时间戳
    const start = new Date();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const todayStartTime = Date.parse(start) / 1;
    const userId = this.getLoginUserId();
    const count = await this.model('sign').where({user_id: userId, create_time: ['>', todayStartTime]}).count();
    const user = await this.model('wx_user').find(userId);
    const signDays = user.sign_days;
    let time = user.first_sign_time;
    time = new Date(time);
    time.setHours(0);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    let startDay = parseInt(signDays / 7) + 1;
    let endDay = parseInt(signDays / 7) + 7;
    let currentDay = signDays % 7;
    let again = parseInt(signDays / 7) + 1;
    if ((start - time) / 86400000 == signDays) {
      startDay = parseInt(signDays / 7) + 1;
      endDay = parseInt(signDays / 7) + 7;
      currentDay = signDays % 7;
      again = parseInt(signDays / 7) + 1;
    } else {
      startDay = 1;
      endDay = 7;
      currentDay = 0;
      again = 1;
    }
    const data = {
      count: count,
      signDays: signDays,
      startDay: startDay,
      endDay: endDay,
      currentDay: currentDay,
      again: again
    };
    return this.success(data);
  }
  /**
     * 签到信息保存
     * @returns {Promise<*>}
     */
  async signsaveAction() {
    const userId = this.getLoginUserId();
    const createTime = new Date().getTime();
    const user = await this.model('wx_user').find(userId);
    let again = user.sign_days;
    again = parseInt(again / 7) + 1;
    if (again >= 5) {
      again = 5;
    }
    const startTime = user.first_sign_time;
    let count = await this.model('sign').where({create_time: ['BETWEEN', startTime, createTime]}).count();
    if (count == user.sign_days && user.sign_days != 0) {
      await this.model('wx_user').where({id: user.id}).increment({'sign_days': 1, 'integral': again});
      count++;
    } else {
      count = 1;
      await this.model('wx_user').where({id: user.id}).increment('integral', again);
      await this.model('wx_user').where({id: user.id}).update({sign_days: 1, first_sign_time: createTime});
    }
    await this.model('sign').add({
      user_id: userId,
      create_time: createTime,
      again: again
    });
    const signDays = user.sign_days + 1;
    const startDay = parseInt(signDays / 7) + 1;
    const endDay = parseInt(signDays / 7) + 7;
    const currentDay = parseInt(signDays % 7);
    // 积分流水表
    const map = {
      is_integral: 0,
      num: again,
      is_add: 0,
      user_id: userId,
      status: 0,
      remark: '每日签到',
      create_time: new Date().getTime()
    };
    await this.model('record').add(map);
    const data = {
      count: count,
      signDays: signDays,
      startDay: startDay,
      endDay: endDay,
      currentDay: currentDay,
      again: again
    };
    return this.success(data);
  }

  /**
     * 积分分页页面
     * @returns {Promise<*>}
     */
  async recordlistAction() {
    const userId = this.getLoginUserId();
    const type = this.get('type');
    const currentPage = this.get('currentPage');
    const list = await this.model('record').where({is_integral: type, status: type, user_id: userId}).order('create_time DESC').page(currentPage, 5).countSelect();
    return this.success(list);
  }

  /**
     * 获取用户
     * @returns {Promise<*>}
     */
  async getintegralAction() {
    const userId = this.getLoginUserId();
    const integral = await this.model('wx_user').where({id: userId}).getField('integral', true);
    return this.success(integral);
  }

  /**
     * 商品列表
     * @returns {Promise<*>}
     */
  async goodslistAction() {
    let sortRule = this.get('sort_rule');
    const currentPage = this.get('currentPage') || 1;
    const userId = this.getLoginUserId();
    const integral = await this.model('wx_user').where({id: userId}).getField('integral', true);
    const groom = this.get('groom');
    const map = {};
    let sort = '';
    sortRule = parseInt(sortRule);
    switch (sortRule) {
      case 1:
        sort = 'sort ASC';
        break;
      case 2:
        sort = 'price ASC';
        break;
      case 3:
        sort = 'price DESC';

        break;
      case 4:
        map.price = ['<=', integral];
        break;
      default:
        sort = 'sort ASC';
        break;
    }
    if (groom) {
      sort = 'groom DESC';
    }
    const list = await this.model('goods').where(map).order(sort).page(currentPage, 5).countSelect();
    for (const i in list.data) {
      const goods = list.data[i];
      goods.icon = await global.get_pic(goods.icon);
      console.log(goods.icon);
    }
    return this.success(list);
  }

  async getgoodsAction() {
    const id = this.get('id');
    const data = await this.model('goods').find(id);
    const imgList = [];
    const imageArr = data.image.split(',');
    for (const i in imageArr) {
      const item = imageArr[i];
      imgList.push(await global.get_pic(item));
    }
    data.imgList = imgList;
    return this.success(data);
  }
};
