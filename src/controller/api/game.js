module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 大转盘初始化
     * @returns {Promise<*>}
     */
  async wheelindexAction() {
    const id = this.get('id');
    const activity = await this.model('activity').find(id);
    const list = await this.model('activity_prize').where({activity_id: id}).order('sort asc').select();
    const arr = [];
    for (const i in list) {
      const item = list[i];
      const image = await global.get_pic(item.prize_pic);
      const prize = {
        id: item.id,
        name: item.prize_name,
        image: image,
        num: item.num,
        probability: item.prize_counts > 0 ? item.percentage : 0
      };
      arr.push(prize);
    }
    const userId = this.getLoginUserId();
    const integral = await this.model('wx_user').where({id: userId}).getField('integral', true);
    const xiaojuedingArr = {
      id: activity.id,
      game_rule: activity.activity_rules,
      awards: arr
    };
    // 获取当前状态：0不可以转，1可以转
    let status = await think.cache(`wx-u${userId}a${id}`);
    let times = await think.cache(`wx-u${userId}a${id}times`);
    if (think.isEmpty(status) && status != 0) {
      status = 1;
    }
    if (think.isEmpty(times)) {
      times = 0;
    }
    const data = {
      xiaojuedingArr: xiaojuedingArr,
      status: status,
      integral: integral,
      times: times
    };
    return this.success(data);
  }

  /**
     * 大转盘领取
     * @returns {Promise<*>}
     */
  async wheelconfirmAction() {
    const id = this.get('id');
    const gameId = this.get('gameId');
    const userId = this.getLoginUserId();
    await think.cache(`wx-u${userId}a${gameId}`, 0);
    const prize = await this.model('activity_prize').find(id);
    const user = await this.model('wx_user').find(userId);
    const type = parseInt(prize.type);
    let recordId = '';
    // 红包
    if (type == 1) {
      recordId = await this.model('record').add({
        is_add: 0,
        num: prize.num,
        is_integral: 1,
        user_id: userId,
        status: 1,
        create_time: new Date().getTime(),
        remark: '抽奖红包'
      });
      await this.model('wx_user').where({id: userId}).increment('money', parseFloat(prize.num));
    // 积分
    } else if (type == 2) {
      recordId = await this.model('record').add({
        is_add: 0,
        num: prize.num,
        is_integral: 0,
        user_id: userId,
        status: 0,
        create_time: new Date().getTime(),
        remark: '抽奖获取积分'
      });
      await this.model('wx_user').where({id: userId}).increment('integral', parseInt(prize.num));
    // 实物
    } else if (type == 3) {

    // 谢谢惠顾
    } else {

    }
    await this.model('activity_prize').where({id: id}).decrement('prize_counts', 1);
    const data = {
      prize_id: id,
      prize_name: prize.prize_name,
      account_id: recordId,
      user_name: user.nickname,
      user_id: user.id,
      user_mobile: user.tel,
      user_address: '未指定',
      create_time: new Date().getTime(),
      status: 1
    };
    const res = await this.model('information').add(data);
    data.is_goods = true;
    if (res) {
      return this.success(data);
    } else {
      return this.fail();
    }
  }

  /**
     * 游戏获取次数
     * @returns {Promise<*>}
     */
  async wheeladdAction() {
    const num = this.get('num');
    const id = this.get('id');
    const userId = this.getLoginUserId();
    const res = await this.model('wx_user').where({id: userId}).decrement('integral', parseInt(num));
    if (res) {
      const integral = await this.model('wx_user').where({id: userId}).getField('integral', true);
      const data = {
        integral: integral
      };
      await think.cache(`wx-u${userId}a${id}`, 1);
      return this.success(data);
    }
    return this.fail(res);
  }

  /**
     * 增加游戏次数
     */
  async wheeltimesAction() {
    const userId = this.getLoginUserId();
    const id = this.get('id');
    await think.cache(`wx-u${userId}a${id}times`, this.get('times'));
    await think.cache(`wx-u${userId}a${id}`, 0);
    return this.success();
  }

  /**
     * 刮刮乐页面初始化
     */
  async scratchindexAction() {
    const id = this.get('id');
    const list = await this.model('activity_prize').where({activity_id: id, prize_counts: ['>', '0']}).select();
    const pri = Math.round(Math.random() * 100);
    let p = 0;
    let prize = {};
    for (const i in list) {
      const item = list[i];
      if (pri > p && pri < p + item.percentage) {
        prize = item;
      }
      p += item.percentage;
    }
    const userId = this.getLoginUserId();
    const integral = await this.model('wx_user').where({id: userId}).getField('integral', true);
    // 获取当前状态：0不可以转，1可以转
    let status = await think.cache(`wx-u${userId}a${id}`);
    let times = await think.cache(`wx-u${userId}a${id}times`);
    if (think.isEmpty(status) && status != 0) {
      status = 1;
    }
    if (think.isEmpty(times)) {
      times = 1;
    }
    const rule = await this.model('activity').where({id: id}).getField('activity_rules', true);
    if (list.length == 0) {
      prize = {
        id: 0,
        activity_id: '2',
        type: 0,
        prize_name: '谢谢参与',
        prize_counts: '9999',
        prize_level: '-1',
        percentage: 100,
        create_time: 0,
        member_id: '1',
        prize_pic: '',
        sort: '0',
        num: null
      };
    }
    prize.game_rule = rule;
    const data = {
      prize: prize,
      status: status,
      integral: integral,
      times: times
    };
    return this.success(data);
  }

  /**
     * 老虎机页面初始化
     */
  async slotindexAction() {
    const id = this.get('id');
    const num1 = Math.round(Math.random() * 10);
    const num2 = Math.round(Math.random() * 10);
    const num3 = Math.round(Math.random() * 10);
    const num4 = Math.round(Math.random() * 10);
    // let num1 = 6, num2 = 6, num3 = 6, num4 = 6;
    const arr = [num1, num2, num3, num4];
    const arr1 = [num1, num2, num3, num4];
    let typeId = 0;
    if (num1 == 6 && num2 == 6 && num3 == 6 && num4 == 6) {
      typeId = 1;
    } else {
      for (const i in arr) {
        const item = arr[i];
        let is4 = true;
        let is3 = 0;
        for (const j in arr1) {
          const jtem = arr1[j];
          if (j <= i) {
            continue;
          }
          if (item != jtem) {
            is4 = false;
          }
          if (item == jtem) {
            is3++;
          }
        }
        if (is4) {
          typeId = 2;
          continue;
        }
        if (is3 == 3) {
          typeId = 3;
        }
      }
    }
    const list = await this.model('activity_prize').where({activity_id: id, prize_counts: ['>', 0], prize_level: typeId}).select();
    const rule = await this.model('activity').where({id: id}).getField('activity_rules', true);
    let prize = {};
    if (list.length == 0) {
      prize = {
        id: 0,
        activity_id: '2',
        type: 0,
        prize_name: '谢谢参与',
        prize_counts: '9999',
        prize_level: '-1',
        percentage: 100,
        create_time: 0,
        member_id: '1',
        prize_pic: '',
        sort: '0',
        num: null
      };
    } else {
      prize = list[0];
    }
    prize.game_rule = rule;
    const userId = this.getLoginUserId();
    const integral = await this.model('wx_user').where({id: userId}).getField('integral', true);
    // 获取当前状态：0不可以转，1可以转
    let status = await think.cache(`wx-u${userId}a${id}`);
    let times = await think.cache(`wx-u${userId}a${id}times`);
    if (think.isEmpty(status) && status != 0) {
      status = 1;
    }
    if (think.isEmpty(times)) {
      times = 1;
    }
    const data = {
      num1: num1,
      num2: num2,
      num3: num3,
      num4: num4,
      prize: prize,
      status: status,
      times: times,
      integral: integral
    };
    return this.success(data);
  }

  /**
     * 水果机页面初始化
     */
  async fruitindexAction() {
    const id = this.get('id');
    const list = await this.model('activity_prize').where({activity_id: id, prize_counts: ['>', '0']}).select();
    const pri = Math.round(Math.random() * 100);
    let p = 0;
    let prize = {};
    for (const i in list) {
      const item = list[i];
      if (pri > p && pri < p + item.percentage) {
        prize = item;
      }
      p += item.percentage;
    }
    const ret = Math.round(Math.random() * 8);
    const userId = this.getLoginUserId();
    const integral = await this.model('wx_user').where({id: userId}).getField('integral', true);
    // 获取当前状态：0不可以转，1可以转
    let status = await think.cache(`wx-u${userId}a${id}`);
    let times = await think.cache(`wx-u${userId}a${id}times`);
    if (think.isEmpty(status) && status != 0) {
      status = 1;
    }
    if (think.isEmpty(times)) {
      times = 1;
    }
    const rule = await this.model('activity').where({id: id}).getField('activity_rules', true);
    if (JSON.stringify(prize) == '{}') {
      prize = {
        id: 0,
        activity_id: '2',
        type: 0,
        prize_name: '谢谢参与',
        prize_counts: '9999',
        prize_level: '-1',
        percentage: 100,
        create_time: 0,
        member_id: '1',
        prize_pic: '',
        sort: '0',
        num: null
      };
    }
    prize.game_rule = rule;
    prize.ret = ret;
    const data = {
      prize: prize,
      status: status,
      integral: integral,
      times: times
    };
    return this.success(data);
  }

  /**
     * 九宫翻牌
     */
  async cardindexAction() {
    const id = this.get('id');
    const list = await this.model('activity_prize').where({activity_id: id, prize_counts: ['>', '0']}).select();
    const pri = Math.round(Math.random() * 100);
    let p = 0;
    let prize = {};
    for (const i in list) {
      const item = list[i];
      if (pri > p && pri < p + item.percentage) {
        prize = item;
      }
      p += item.percentage;
    }
    const userId = this.getLoginUserId();
    const integral = await this.model('wx_user').where({id: userId}).getField('integral', true);
    // 获取当前状态：0不可以转，1可以转
    let status = await think.cache(`wx-u${userId}a${id}`);
    let times = await think.cache(`wx-u${userId}a${id}times`);
    if (think.isEmpty(status) && status != 0) {
      status = 1;
    }
    if (think.isEmpty(times)) {
      times = 1;
    }
    const rule = await this.model('activity').where({id: id}).getField('activity_rules', true);
    if (JSON.stringify(prize) == '{}') {
      prize = {
        id: 0,
        activity_id: '2',
        type: 0,
        prize_name: '谢谢参与',
        prize_counts: '9999',
        prize_level: '-1',
        percentage: 100,
        create_time: 0,
        member_id: '1',
        prize_pic: '',
        sort: '0',
        num: null
      };
    }
    prize.game_rule = rule;
    const data = {
      prize: prize,
      status: status,
      integral: integral,
      times: times
    };
    return this.success(data);
  }
};
