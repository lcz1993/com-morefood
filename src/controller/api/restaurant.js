module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  async indexAction() {
    let restaurant_id = this.get('restaurant_id');
    if (!restaurant_id) {
      restaurant_id = 1;
    }
    const a = await this.model('restaurant').find(restaurant_id);
    if (a.bg_image) {
      const b = await this.model('ext_attachment_pic').find(a.bg_image);
      a.bgImage = b.path;
    }
    if (a.image) {
      const c = await this.model('ext_attachment_pic').find(a.image);
      a.image = c.path;
    }
    const restaurant = {
      id: a.id,
      name: a.name,
      bgImage: a.bgImage,
      image: a.image,
      assess: a.score,
      sell: a.sales,
      sendTime: a.send_time,
      desc: a.desc,
      sendMoney: a.send_money,
      min_price: a.min_price
    };
    const dishClassArr = await this.model('dish_class').order('sort ASC').where({restaurant_id: restaurant_id}).select();
    const goods = [];
    for (const dishClass of dishClassArr) {
      const dishClassId = dishClass.id;
      const meduArr = await this.model('medu').where({dish_class: dishClassId}).select();
      const foods = [];
      for (const medu of meduArr) {
        if (medu.dish_picture) {
          const b = await this.model('ext_attachment_pic').find(medu.dish_picture);
          medu.dish_picture = b.path;
        }
        if (medu.image) {
          const c = await this.model('ext_attachment_pic').find(medu.image);
          medu.image = c.path;
        }
        const f = {
          id: medu.id,
          name: medu.dish_name,
          price: medu.original_price,
          oldPrice: medu.old_price,
          description: medu.description,
          sellCount: medu.sell_count,
          Count: 0,
          rating: medu.rating,
          info: medu.dish_desc,
          icon: medu.dish_picture,
          image: medu.image
        };
        foods.push(f);
      }
      const a = {
        id: dishClassId,
        name: dishClass.name,
        type: -1,
        desc: dishClass.desc,
        foods: foods
      };
      goods.push(a);
    }
    const data = {
      restaurant: restaurant,
      goods: goods
    };
    return this.success(data);
  }
};
