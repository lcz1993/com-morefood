module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  // 获取省市三级联动
  async getareaAction() {
    const pid = this.get('pid');
    const area = await this.model('area').where({parent_id: pid}).select();
    return this.json(area);
  }
  async indexAction() {
    const userId = this.get('userId');
    const addressArr = await this.model('address').where({user_id: userId}).select();
    const addressList = [];
    for (const address of addressArr) {
      let location = '';
      let a = await this.model('area').find(address.province);
      location += a.name;
      a = await this.model('area').find(address.city);
      location += a.name;
      a = await this.model('area').find(address.county);
      location += a.name;
      location += address.addr;
      const b = {
        id: address.id,
        name: address.accept_name,
        gender: address.gender,
        tel: address.mobile,
        sign: address.sign,
        msg: location,
        is_default: address.is_default
      };
      addressList.push(b);
    }
    return this.success(addressList);
  }
};
