module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 获取配送时间list
     * @returns {Promise<*>}
     */
  async listAction() {
    const restaurantId = this.get('restaurantId');
    const date = new Date().getDay();
    let nowDay = '星期一';
    let nextDay = '星期二';
    switch (date) {
      case 0:
        nowDay = '星期日';
        nextDay = '星期一';
        break;
      case 1:
        nowDay = '星期一';
        nextDay = '星期二';
        break;
      case 2:
        nowDay = '星期二';
        nextDay = '星期三';
        break;
      case 3:
        nowDay = '星期三';
        nextDay = '星期四';
        break;
      case 4:
        nowDay = '星期四';
        nextDay = '星期五';
        break;
      case 5:
        nowDay = '星期五';
        nextDay = '星期六';
        break;
      case 6:
        nowDay = '星期六';
        nextDay = '星期日';
        break;
    }
    const deliveryList = await this.model('delivery_time').where({restaurant_id: restaurantId}).select();
    const children = [];
    for (const item in deliveryList) {
      const delivery = deliveryList[item];
      children.push({
        text: delivery.delivery_time,
        id: delivery.id
      });
    }
    return this.success([
      {text: '今天(' + nowDay + ')',
        children: children},
      {text: '明天(' + nextDay + ')',
        children: children}
    ]);
  }
};
