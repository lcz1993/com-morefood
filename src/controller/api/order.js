module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  async listAction() {
    const userId = this.getLoginUserId();
    const orderList = await this.model('order').getOrderList(userId);
    console.log(orderList);
    return this.success(orderList);
  }
  async cancelAction() {
    const userId = this.getLoginUserId();
    const id = this.get('id');
    await this.model('order').update({
      id: id,
      status: 6
    });
    const orderList = await this.model('order').getOrderList(userId);
    return this.success(orderList);
  }
  async deleteAction() {
    const userId = this.getLoginUserId();
    const id = this.get('id');
    await this.model('order').where({id: id}).delete();
    const orderList = await this.model('order').getOrderList(userId);
    return this.success(orderList);
  }
  async deliveryAction() {
    const userId = this.getLoginUserId();
    const id = this.get('id');
    await this.model('order').update({
      id: id,
      status: 4
    });
    const orderList = await this.model('order').getOrderList(userId);
    return this.success(orderList);
  }
};
