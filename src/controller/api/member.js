module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 获取初始化页面
     * @returns {Promise<*>}
     */
  async indexAction() {
    const addressArr = await this.model('recharge_amount').select();
    const addressList = [];
    for (const address of addressArr) {
      const b = {
        id: address.id,
        recharge_amount: address.recharge_amount,
        donation_amount: address.donation_amount,
        commodity_details: address.commodity_details
      };
      addressList.push(b);
    }
    return this.success(addressList);
  }

  /**
     * 根据ID获取
     * @returns {Promise<*>}
     */
  async getAction() {
    const id = this.get('id');
    const data = await this.model('recharge_amount').find(id);
    return this.success(data);
  }
};
