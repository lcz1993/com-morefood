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
     * 获取当前用户优惠信息
     * @returns {Promise<*>}
     */
  async getcoupon(userId, price, restaurantId) {
    const couponList = [];
    const map = {};
    map.type_id = 6;
    map.usage_restriction = 1;
    map.restaurant_id = restaurantId;
    const couponArr = await this.model('order').find({ user_id: userId });
    if (think.isEmpty(couponArr) || couponArr.status == 6) {
      const coupon = await this.model('discount').find(map);
      const money = await this.model('discount').getmoney(price, restaurantId);
      const food = await this.model('discount').getgoods(price, restaurantId);
      if (coupon.min_price <= price) {
        const b = {
          id: coupon.id,
          name: coupon.name,
          desc: coupon.desc,
          start_time: coupon.start_time,
          end_time: coupon.end_time,
          status: coupon.status,
          type_id: coupon.type_id,
          percent: coupon.percent,
          cut_price: coupon.cut_price,
          min_price: coupon.min_price,
          restaurant_id: coupon.restaurant_id,
          medu_id: coupon.medu_id,
          max_count: coupon.max_count,
          pull_count: coupon.pull_count,
          use_count: coupon.use_count,
          usage_restriction: coupon.usage_restriction,
          distribution_platform: coupon.distribution_platform,
          food_name: food,
          cashback: money
        };
        couponList.push(b);
      }
    } else {
      const map = {};
      map.type_id = [1, 5];
      map.restaurant_id = restaurantId;
      const discount = await this.model('discount').where(map).select();
      for (const item of discount) {
        const money = await this.model('discount').getmoney(price, restaurantId);
        const food = await this.model('discount').getgoods(price, restaurantId);
        if (item.min_price <= price) {
          const b = {
            id: item.id,
            name: item.name,
            desc: item.desc,
            start_time: item.start_time,
            end_time: item.end_time,
            status: item.status,
            type_id: item.type_id,
            percent: item.percent,
            cut_price: item.cut_price,
            min_price: item.min_price,
            restaurant_id: item.restaurant_id,
            medu_id: item.medu_id,
            max_count: item.max_count,
            pull_count: item.pull_count,
            use_count: item.use_count,
            usage_restriction: item.usage_restriction,
            distribution_platform: item.distribution_platform,
            food_name: food,
            cashback: money
          };
          couponList.push(b);
        }
      }
    }

    return couponList;
  }

  /**
     * 获取当前用户所以可用的优惠信息
     */
  async getList(userId, price, restaurantId) {
    const couponList = [];
    const couponlist = await this.model('coupon').where({ user_id: userId }).select();
    for (const i of couponlist) {
      const id = i.discount_id;
      const discountlist = await this.model('discount').where({ id: id }).select();
      for (const item of discountlist) {
        const food = await this.model('discount').getgoods(price, restaurantId);
        const money = await this.model('discount').getmoney(price, restaurantId);
        if (item.min_price <= price) {
          const personal = {
            id: item.id,
            name: item.name,
            desc: item.desc,
            start_time: item.start_time,
            end_time: item.end_time,
            status: item.status,
            type_id: item.type_id,
            percent: item.percent,
            cut_price: item.cut_price,
            min_price: item.min_price,
            restaurant_id: item.restaurant_id,
            medu_id: item.medu_id,
            max_count: item.max_count,
            pull_count: item.pull_count,
            use_count: item.use_count,
            usage_restriction: item.usage_restriction,
            distribution_platform: item.distribution_platform,
            food_name: food,
            cashback: money
          };
          couponList.push(personal);
        }
      }
    }
    const discount = await this.model('discount').where({ restaurant_id: restaurantId }).select();
    const food = await this.model('discount').getgoods(price, restaurantId);
    const money = await this.model('discount').getmoney(price, restaurantId);
    for (const i of discount) {
      const platform = {
        id: i.id,
        name: i.name,
        desc: i.desc,
        start_time: i.start_time,
        end_time: i.end_time,
        status: i.status,
        type_id: i.type_id,
        percent: i.percent,
        cut_price: i.cut_price,
        min_price: i.min_price,
        restaurant_id: i.restaurant_id,
        medu_id: i.medu_id,
        max_count: i.max_count,
        pull_count: i.pull_count,
        use_count: i.use_count,
        usage_restriction: i.usage_restriction,
        distribution_platform: i.distribution_platform,
        food_name: food,
        cashback: money
      };
      couponList.push(platform);
    }
    return couponList;
  }

  /**
     * 获取特价商品详情
     * @param restaurantId
     * @returns {Promise<void>}
     */
  async getgoodsList(restaurantId) {
    const goods = await this.where({ type_id: 2, restaurant_id: restaurantId }).select();
    const goodsList = [];
    for (const g of goods) {
      const m = await this.model('medu').find(g.medu_id);
      const discount = (m.original_price / m.old_price) * 10;
      const dis = discount.toFixed(0);
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
        num = '该商品已下架';
      }
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
        discount: dis
      });
    }
    return goodsList;
  }
};
