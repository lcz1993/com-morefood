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
      is_show: 0,
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
     * @param price
     * @returns {Promise<void>}
     */
  async getgoods(price) {
    const food_name = '';
    const food = await this.model('discount').where({ type_id: 3 }).select();
    for (const a in food) {
      if (a.min_price >= price) {
        food_name = a.gift_goods;
      }
    }
  }

  /**
     * 获取当前用户优惠信息
     * @returns {Promise<*>}
     */
  async getcoupon(userId, price) {
    const couponList = [];
    const map = {};
    map.type_id = 5;
    map.usage_restriction = 1;
    const couponArr = await this.model('order').find({ user_id: userId });
    if (think.isEmpty(couponArr) || couponArr.status == 6) {
      const coupon = await this.model('discount').find(map);
      const food = await this.model('count').getgoods(price);
      if (coupon.min_price >= price) {
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
          is_show: coupon.is_show,
          usage_restriction: coupon.usage_restriction,
          distribution_platform: coupon.distribution_platform,
          food_name: food
        };
        couponList.push(b);
      }
    } else {
      const user_id = userId;
      const coupon = await this.model('coupon').where({ user_id: user_id }).select();
      for (const item in coupon) {
        const id = item.discount_id;
        const discount = await this.model('discount').find(id);
        const food = await this.model('count').getgoods(price);
        if (discount.min_price >= price) {
          const b = {
            id: discount.id,
            name: discount.name,
            desc: discount.desc,
            start_time: discount.start_time,
            end_time: discount.end_time,
            status: discount.status,
            type_id: discount.type_id,
            percent: discount.percent,
            cut_price: discount.cut_price,
            min_price: discount.min_price,
            restaurant_id: discount.restaurant_id,
            medu_id: discount.medu_id,
            max_count: discount.max_count,
            pull_count: discount.pull_count,
            use_count: discount.use_count,
            is_show: discount.is_show,
            usage_restriction: discount.usage_restriction,
            distribution_platform: discount.distribution_platform,
            food_name: food
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
  async getList(userId, price) {
    const couponList = [];
    const couponlist = await this.model('coupon').find(userId);
    const discountlist = await this.model('discount').where({ id: couponlist.min_price }).select();
    for (const item in discountlist) {
      const food = await this.model('count').getgoods(price);
      if (item.min_price >= price) {
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
          is_show: item.is_show,
          usage_restriction: item.usage_restriction,
          distribution_platform: item.distribution_platform,
          food_name: food
        };
        couponList.push(personal);
      }
    }
    const discount = await this.model('discount').select();
    const food = await this.model('count').getgoods(price);
    for (const i in discount) {
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
        is_show: i.is_show,
        usage_restriction: i.usage_restriction,
        distribution_platform: i.distribution_platform,
        food_name: food
      };
      couponList.push(platform);
    }
    return couponList;
  }
};
