module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }

  /**
     * 小程序店铺详情页面
     * @returns {Promise<*>}
     */
  async indexAction() {
    let restaurant_id = this.get('id');
    if (!restaurant_id) {
      restaurant_id = 1;
    }
    const a = await this.model('restaurant').find(restaurant_id);
    const is_close = a.is_close;

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
      min_price: a.min_price,
      is_close: a.is_close
    };
    // 店铺已经打烊≈
    if (is_close == 1) {
      return this.success({
        is_close: 1,
        restaurant: restaurant
      });
    }
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
          desc: medu.dish_desc,
          is_stop: medu.is_stop
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
      is_close: 0,
      discountNum: count,
      discount: dis,
      restaurant: restaurant,
      goods: goods,
      discountArr: discountArr
    };
    return this.success(data);
  }

  async listAction() {
    const sort_rule = this.post('sort_rule');
    const discountSelect = this.post('discountSelect');
    const priceSelect = this.post('priceSelect');
    const currentPage = this.post('currentPage');
    const groom = this.post('groom');
    const map = {};
    let sort = '';
    switch (parseInt(sort_rule)) {
      // 综合排序
      case 1:
        sort = 'sort ASC';
        break;
        // 好评优先
      case 2:
        sort = 'score DESC';
        break;
        // 销量优先
      case 3:
        sort = 'sales DESC';
        break;
        // 起送价升序
      case 4:
        sort = 'min_price ASC';
        break;
        // 配送最快
      case 5:
        sort = 'sort ASC';
        break;
        // 配送费最低
      case 6:
        sort = 'send_money ASC';
        break;
        // 人均从低到高
      case 7:
        sort = 'fee_standard ASC';
        break;
        // 人均从高到低
      case 8:
        sort = 'fee_standard DESC';
        break;
      default:
        sort = 'sort ASC';
    }
    // 优惠活动
    const discount = discountSelect.split('_')[1];
    switch (parseInt(discount)) {
      // 新用户优惠
      case 1:
        map.discount_id = ['like', '%1%'];
        break;
        // 特价商品
      case 2:
        map.discount_id = ['like', '%2%'];
        break;
        // 下单立减
      case 3:
        map.discount_id = ['like', '%3%'];
        break;
        // 赠品优惠
      case 4:
        map.discount_id = ['like', '%4%'];
        break;
        // 下单返红包
      case 5:
        map.discount_id = ['like', '%5%'];
        break;
        // 进店领红包
      case 6:
        map.discount_id = ['like', '%6%'];
        break;
      default:
        break;
    }
    const price = priceSelect.split('_')[1];
    switch (parseInt(price)) {
      // x<20
      case 1:
        map.fee_standard = ['<=', '20'];
        break;
        // 20<x<40
      case 2:
        map.fee_standard = ['>', '20 and fee_standard <= 40'];
        break;
        // 40x<60
      case 3:
        map.fee_standard = ['>', '40 and fee_standard <= 60'];
        break;
        // 60x<80
      case 4:
        map.fee_standard = ['>', '60 and fee_standard <= 80'];
        break;
        // 80x<100
      case 5:
        map.fee_standard = ['>', '80 and fee_standard <= 100'];
        break;
        // x>100
      case 6:
        map.fee_standard = ['>', '100'];
        break;
      default:
        break;
    }
    if (groom) {
      sort = 'sort ASC';
    }
    const list = await this.model('restaurant').where(map).order('sort ASC').page(currentPage || 1, 10).countSelect();
    const restaurantArr = list.data;
    const restaurantList = [];
    for (const i in restaurantArr) {
      const restaurant = restaurantArr[i];
      // 组合出返回页面的商店list



    }
    return this.success();
  }
};
