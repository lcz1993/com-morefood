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
    // 先添加单品特价商品
    const meduIds = await this.model('discount').where({
      restaurant_id: restaurant_id,
      is_show: 0,
      status: 0,
      type_id: 2,
      start_time: ['<', new Date().getTime()],
      end_time: ['>', new Date().getTime()]
    }).select();
    if (meduIds.length > 0) {
      for (const i in meduIds) {
        const med = meduIds[i];
        if (med.max_count <= med.use_count) {
          global.removeByValue(meduIds, med);
        }
      }
      console.log(meduIds);
      const fs = [];
      for (const i in meduIds) {
        const med = meduIds[i];
        const medu = await this.model('medu').find(med.medu_id);
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
          is_stop: medu.is_stop,
          num: '第一份特价'
        };
        fs.push(f);
      }
      const ag = {
        id: 0,
        name: '今日特价',
        type: -1,
        desc: '今日特价商品',
        foods: fs
      };
      goods.push(ag);
    }
    // 再添加正常分类
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
        let num = '';
        if (medu.is_stop == 0) {
          if (medu.num == null) {
            num = '该商品不限量';
          } else {
            if (medu.num > 0) {
              num = '剩余' + medu.num;
            } else {
              medu.is_stop == 1;
            }
          }
        } else {
          num = '该商品已下架';
        }
        const f = {
          id: medu.id,
          name: medu.dish_name,
          price: medu.original_price ? medu.original_price : '',
          oldPrice: medu.old_price,
          description: medu.description,
          sellCount: medu.sell_count,
          Count: 0,
          rating: medu.rating,
          info: medu.dish_desc,
          icon: medu.dish_picture,
          image: medu.image,
          desc: medu.dish_desc,
          is_stop: medu.is_stop,
          is_hot: medu.is_hot,
          num: num
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
    // 获取餐厅的优惠券
    const discountSign = this.config('setupapp.DISCOUNT_TYPE_SIGN');
    const discountColor = this.config('setupapp.DISCOUNT_TYPE_COLOR');
    const time = new Date().getTime();
    const discountList = await this.model('discount').where({
      restaurant_id: restaurant.id,
      start_time: ['<', time],
      end_time: ['>', time],
      is_show: 0
    }).select();
    const discountArr = [];
    let dis = {};
    const count = discountList.length;
    for (const j in discountList) {
      const discount = discountList[j];
      const type = discount.type_id;
      const e = {
        name: discount.name,
        type: type,
        color: discountColor[discount.type_id],
        desc: discountSign[discount.type_id]
      };
      discountArr.push(e);

      if (parseInt(discount.is_show) == 0) {
        dis = {
          name: discount.name,
          type: type,
          color: discountColor[discount.type_id],
          desc: discountSign[discount.type_id]
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
    const natureId = this.post('natureId');
    const groom = this.post('groom');
    const search = this.post('search');
    const map = {};
    if (natureId) {
      map.nature_id = natureId;
    }
    if (search) {
      map.name = ['LIKE', '%' + search + '%'];
      await this.model('search_history').add({
        keyword: search,
        add_time: (new Date().getTime()) / 1000,
        user_id: this.getLoginUserId()
      });
    }
    map.is_close = 0;
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
        map.fee_standard = ['<=', 20];
        break;
        // 20<x<40
      case 2:
        map.fee_standard = ['between', 20, 40];
        break;
        // 40x<60
      case 3:
        map.fee_standard = ['between', 40, 60];
        break;
        // 60x<80
      case 4:
        map.fee_standard = ['between', 60, 80];
        break;
        // 80x<100
      case 5:
        map.fee_standard = ['between', 80, 100];
        break;
        // x>100
      case 6:
        map.fee_standard = ['>', 100];
        break;
      default:
        break;
    }
    if (groom) {
      sort = 'sort ASC';
    }
    const list = await this.model('restaurant').where(map).order(sort).page(currentPage || 1, 10).countSelect();
    const restaurantArr = list.data;
    const restaurantList = [];

    const discountSign = this.config('setupapp.DISCOUNT_TYPE_SIGN');
    const discountColor = this.config('setupapp.DISCOUNT_TYPE_COLOR');
    const time = new Date().getTime();
    for (const i in restaurantArr) {
      const restaurant = restaurantArr[i];
      // 组合出返回页面的商店list
      const discountList = await this.model('discount').where({
        restaurant_id: restaurant.id,
        start_time: ['<', time],
        end_time: ['>', time],
        is_show: 0
      }).select();
      const disArr = [];
      for (const j in discountList) {
        const discount = discountList[j];
        const sign = {
          color: discountColor[discount.type_id],
          text: discountSign[discount.type_id]
        };
        const dis = {
          id: discount.id,
          sign: sign,
          name: discount.name
        };
        disArr.push(dis);
      }
      const img = await global.get_pic(restaurant.image);
      const restau = {
        id: restaurant.id,
        name: restaurant.name,
        img: img,
        sign: {},
        score: restaurant.score,
        sale: restaurant.sale,
        min_price: restaurant.min_price,
        send_money: restaurant.send_money,
        discountNum: discountList.length,
        nature: restaurant.nature_id,
        discountList: disArr
      };
      restaurantList.push(restau);
    }
    list.data = restaurantList;
    return this.success(list);
  }
};
