module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 存储用户选择，购物车
     * @returns {Promise<*>}
     */
  async cartAction() {
    const cartArr = this.post('carArray');
    const userId = this.post('userId');
    await this.model('selection').where({user_id: userId}).delete();
    for (const cart of cartArr) {
      const res = await this.model('selection').add({
        user_id: userId,
        dish_id: cart.id,
        cnt_dish: cart.num,
        add_time: new Date().getTime()
      });
    }
    return this.success();
  }

  /**
     * 支付页面初始化
     * @returns {Promise<*>}
     */
  async indexAction() {
    const userId = this.get('userId');
    const restaurantId = this.get('restaurantId');
    const cartArr = await this.model('selection').where({user_id: userId}).select();
    const orderList = [];
    for (const food of cartArr) {
      const num = food.cnt_dish;
      let f = await this.model('medu').find(food.dish_id);
      if (f.restaurant_id != restaurantId) {
        global.removeByValue(cartArr, food);
        break;
      }
      if (f.dish_picture) {
        const b = await this.model('ext_attachment_pic').find(f.dish_picture);
        f.dish_picture = b.path;
      }
      if (f.image) {
        const b = await this.model('ext_attachment_pic').find(f.image);
        f.image = b.path;
      }
      f = {
        id: f.id,
        name: f.dish_name,
        num: num,
        image: f.dish_picture,
        unit_price: f.original_price,
        total_price: f.original_price * num
      };
      orderList.push(f);
    }
    const restaurant = await this.model('restaurant').find(restaurantId);
    const addressArr = await this.model('address').where({user_id: userId, is_default: '1'}).select();
    let address = {};
    if (addressArr.length != 0) {
      address = addressArr[0];
    }
    if (JSON.stringify(address) != '{}') {
      let location = '';
      let a = await this.model('area').find(address.province);
      location += a.name;
      a = await this.model('area').find(address.city);
      location += a.name;
      a = await this.model('area').find(address.county);
      location += a.name;
      location += address.addr;
      address = {
        id: address.id,
        name: address.accept_name,
        gender: address.gender,
        tel: address.mobile,
        sign: address.sign,
        msg: location,
        is_default: address.is_default
      };
    }
    return this.success({
      cartArr: orderList,
      address: address,
      restaurant: restaurant
    });
  }
};
