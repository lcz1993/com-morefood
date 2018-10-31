module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 小程序店铺详情页面
     * @returns {Promise<*>}
     */
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
    if (a.shop_image) {
      const imgArr = a.shop_image.split(',');
      const shopImgArr = [];
      for (const img of imgArr) {
        const c = await this.model('ext_attachment_pic').field(['path']).find(img);
        shopImgArr.push(c);
      }
      a.shopImage = shopImgArr;
    }
    const restaurant = {
      id: a.id,
      name: a.name,
      bgImage: a.bgImage,
      image: a.image,
      shopImage: a.shopImage,
      assess: a.score,
      sell: a.sales,
      sendTime: a.send_time,
      desc: a.desc,
      sendMoney: a.send_money,
      workTime: a.work_time,
      range: a.range,
      addr: a.addr,
      contect_tel: a.contect_tel,
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
          image: medu.image,
          desc: medu.dish_desc
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
    // 获取餐厅的
    const discountList = await this.model('discount').where({restaurant_id: restaurant_id, status: 0}).select();
    const discountArr = [];
    let dis = {};
    const count = discountList.length;
    for (const discount of discountList) {
      let type = parseInt(discount.type);
      let color = '';
      switch (type) {
        case 0:
          type = '折扣';
          color = 'rgb(60, 199, 145)';
          break;
        case 1:
          type = '满减';
          color = 'rgb(240, 115, 115)';
          break;
        case 2:
          type = '首单';
          color = 'rgb(112, 188, 70)';
          break;
        case 3:
          type = '特价';
          color = 'rgb(241, 136, 79)';
          break;
      }
      const e = {
        name: discount.name,
        type: type,
        color: color,
        desc: discount.desc
      };
      discountArr.push(e);
      if (parseInt(discount.is_show) == 0) {
        dis = {
          name: discount.name,
          type: type,
          color: color,
          desc: discount.desc
        };
      }
    }
    const data = {
      discountNum: count,
      discount: dis,
      restaurant: restaurant,
      goods: goods,
      discountArr: discountArr
    };
    return this.success(data);
  }
};
