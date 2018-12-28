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
    const goods = await this.model({ type_id: 2, restaurant_id: restaurantId }).where().select();
    const goodsList = [];
    for (const g of goods) {
      const medu = await this.model('medu').where({ id: g.medu_id }).select();
      for (const m of medu) {
        const discount = (m.original_price / m.old_price) * 10;
        const dis = discount.toFixed(1);
        console.log(discount);
        const b = {
          id: g.id,
          start_time: g.start_time,
          end_time: g.end_time,
          status: g.status,
          type_id: g.type_id,
          percent: g.percent,
          cut_price: g.cut_price,
          min_price: g.min_price,
          restaurant_id: g.restaurant_id,
          medu_id: g.medu_id,
          max_count: g.max_count,
          pull_count: g.pull_count,
          use_count: g.use_count,
          usage_restriction: g.usage_restriction,
          distribution_platform: g.distribution_platform,
          discount_id: m.discount_id,
          dish_name: m.dish_name,
          old_price: m.old_price,
          original_price: m.original_price,
          dish_class: m.dish_class,
          dish_picture: m.dish_picture,
          sell_count: m.sell_count,
          rating: m.rating,
          image: m.image,
          num: m.num,
          discount: dis
        };
        goodsList.push(b);
      }
    }
    return goodsList;
  }
};
