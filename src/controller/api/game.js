module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 大转盘初始化
     * @returns {Promise<*>}
     */
  async wheelindexAction() {
    const xiaojuedingArr = {
      id: 0,
      game_rule: '游戏规则，很不游戏规则，很不错哦',
      awards: [{
        id: 1,
        name: '描述经历过最尴尬的事',
        image: 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=2260893404,3331864984&fm=58',
        probability: 10
      }, {
        id: 2,
        name: '今天穿什么颜色的内裤',
        image: 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=2260893404,3331864984&fm=58',
        probability: 10
      }, {
        id: 3,
        name: '第一次啪啪啪几岁',
        image: 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=2260893404,3331864984&fm=58',
        probability: 10
      }, {
        id: 4,
        name: '做过最疯狂的事是什么',
        image: 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=2260893404,3331864984&fm=58',
        probability: 10
      }, {
        id: 5,
        name: '单身的感觉好吗',
        image: 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=2260893404,3331864984&fm=58',
        probability: 10
      }, {
        id: 6,
        name: '单身的感觉好吗',
        image: 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=2260893404,3331864984&fm=58',
        probability: 10
      }, {
        id: 7,
        name: '单身的感觉好吗',
        image: 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=2260893404,3331864984&fm=58',
        probability: 10
      }]
    };
    const data = {
      xiaojuedingArr: xiaojuedingArr
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
