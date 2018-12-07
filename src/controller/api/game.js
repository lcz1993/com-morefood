module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 大转盘初始化
     * @returns {Promise<*>}
     */
  async wheelindexAction() {
    const activity = await this.model('activity').find(1);
    const list = await this.model('activity_prize').where({activity_id: 1}).select();
    const arr = [];
    for (const i in list) {
      const item = list[i];
      const image = await global.get_pic(item.prize_pic);
      const prize = {
        id: item.id,
        name: item.prize_name,
        image: image,
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
    // 从缓冲中取值，查看是今日免费次数是否已经使用
    let status = await think.cache(`wx-u${userId}a${activity.id}`);
    if (think.isEmpty(status)) {
      status = 1;
    }
    const data = {
      xiaojuedingArr: xiaojuedingArr,
      status: status,
      integral: integral
    };
    return this.success(data);
  }

  /**
     * 大转盘领取
     * @returns {Promise<*>}
     */
  async wheelconfirmAction() {
    const data = {};
    return this.success(data);
  }

  /**
     * 游戏获取次数
     * @returns {Promise<*>}
     */
  async wheeladdAction() {
    const data = {};
    return this.success(data);
  }
};
