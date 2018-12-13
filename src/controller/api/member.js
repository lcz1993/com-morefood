module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
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

  async getmoneyAction() {
    const id = this.get('id');
    const money = await this.model('recharge_amount').where({id: id}).select();
    return this.json(money);
  }
};
