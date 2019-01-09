module.exports = class extends think.Model {
  /**
     *
     * @param meduId
     * @param restaurantId
     * @param num
     * @returns {Promise<number>}
     */
  async useCount(meduId, restaurantId, num) {
    const discountArr = await this.where({
      medu_id: meduId,
      restaurant_id: restaurantId,
      status: 0,
      start_time: ['<', new Date().getTime()],
      end_time: ['>', new Date().getTime()]
    }).select();
    let discount = {};
    if (discountArr.length > 0) {
      discount = discountArr[0];
      const res = await this.update({
        id: discount.id,
        use_count: discount.use_count + num
      });
      return res;
    } else {
      return 0;
    }
  }

  /**
     * 获取满赠的商品
   * @param price 获取的订单原价格
   * @param restaurantId 获取当前用户进入的店铺id
     * @returns {Promise<void>}
     */
  async getgoods(price, restaurantId) {
    const food_name = [];
    const food = await this.model('discount').where({ type_id: 3, restaurant_id: restaurantId }).select();
    for (const a of food) {
      if (a.min_price <= price) {
        food_name.push(a.gift_goods);
      }
    }
    return food_name;
  }

  /**
     * 获取返现的额度
     * @param price 获取的订单原价格
     * @param restaurantId 获取当前用户进入的店铺id
     * @returns {Promise<Array>}
     */
  async getmoney(price, restaurantId) {
    const moneycount = [];
    const money = await this.model('discount').where({ type_id: 4, restaurant_id: restaurantId }).select();
    for (const a of money) {
      if (a.min_price <= price) {
        moneycount.push(a.cashback);
      }
    }
    return moneycount;
  }

  /**
     * 获取当前可用优惠信息
     * @returns {Promise<*>}
     */
  async getcoupon(userId, price, restaurantId) {
    const map = {};
    map.type_id = 6;
    map.restaurant_id = restaurantId;
    const order = await this.model('order').where({ user_id: userId, status: ['<', 6]}).select();
    const discountList = [];
    if (order.length == 0) {
      // shoudan
      let shoudan = await this.where({
        type_id: 6,
        start_time: ['<', new Date().getTime()],
        end_time: ['>', new Date().getTime()],
        restaurant_id: restaurantId,
        distribution_platform: 2,
        min_price: ['<', price]
      }).select();
      if (shoudan.length == 0) {
        shoudan = await this.where({
          type_id: 6,
          start_time: ['<', new Date().getTime()],
          end_time: ['>', new Date().getTime()],
          distribution_platform: 1,
          min_price: ['<', price]
        }).select();
      }
      if (!think.isEmpty(shoudan)) {
        discountList.push(shoudan[0]);
      }
    } else {
      // 满减或满折
      const man = await this.where({
        type_id: ['like', ['1', '5']],
        start_time: ['<', new Date().getTime()],
        end_time: ['>', new Date().getTime()],
        restaurant_id: restaurantId,
        distribution_platform: 2,
        min_price: ['<', price]
      }).select();
      if (!think.isEmpty(man)) {
        discountList.push(man[0]);
      }
    }
    // 满赠
    const manzeng = await this.where({
      type_id: 3,
      start_time: ['<', new Date().getTime()],
      end_time: ['>', new Date().getTime()],
      restaurant_id: restaurantId,
      distribution_platform: 2,
      min_price: ['<', price]
    }).select();
    if (!think.isEmpty(manzeng)) {
      discountList.push(manzeng[0]);
    }
    // 返现
    const fanxian = await this.where({
      type_id: 4,
      start_time: ['<', new Date().getTime()],
      end_time: ['>', new Date().getTime()],
      restaurant_id: restaurantId,
      distribution_platform: 2,
      min_price: ['<', price]
    }).select();
    if (!think.isEmpty(fanxian)) {
      discountList.push(fanxian[0]);
    }
    return discountList;
  }

  /**
     * 获取特价商品详情
     * @param restaurantId
     * @returns {Promise<void>}
     */
  async getgoodsList(restaurantId, userId, delivery) {
    const discount = await this.where({ type_id: 2, restaurant_id: restaurantId, start_time: ['<', new Date().getTime()], end_time: ['>', new Date().getTime()], medu_id: ['IN', delivery.goods_id] }).select();
    const goodsList = [];
    for (const g of discount) {
      const m = await this.model('medu').find(g.medu_id);
      const d = (m.original_price / m.old_price) * 10;
      const dis = d.toFixed(0);
      if (m.dish_picture) {
        m.dish_picture = await this.model('ext_attachment_pic').where({id: m.dish_picture}).getField('path', true);
      }
      if (m.image) {
        m.image = await this.model('ext_attachment_pic').where({id: m.image}).getField('path', true);
      }
      let num = '';
      if (m.is_stop == 0) {
        if (m.num == null) {
          num = '该商品不限量';
        } else {
          if (m.num > 0) {
            num = '剩余' + m.num;
          } else {
            m.is_stop == 0;
          }
        }
      } else {
        num = '该商品已售罄';
      }
      const buy_max = g.homebuy - ((await think.cache(`wx-u${userId}m${m.id}`)) || 0);
      goodsList.push({
        id: m.id,
        name: m.dish_name,
        price: m.original_price ? m.original_price : '',
        oldPrice: m.old_price,
        description: m.description,
        sellCount: m.sell_count,
        Count: 0,
        rating: m.rating,
        info: m.dish_desc,
        icon: m.dish_picture,
        image: m.image,
        desc: m.dish_desc,
        is_stop: m.is_stop,
        is_hot: m.is_hot,
        num: num,
        discount: dis,
        buy_max: buy_max,
        agio: (m.original_price / m.old_price).toFixed(2) * 10
      });
    }
    return goodsList;
  }
};
