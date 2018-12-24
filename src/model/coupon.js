module.exports = class extends think.Model {
  /**
     * 获取当前用户是否首单
     * @returns {Promise<*>}
     */
  async getcoupon(userId) {
    const addressList = [];
    const addressArr = await this.model('order').where({ user_id: userId }).select();
    if (think.isEmpty(addressArr) || addressArr.status == 6) {
      const coupon = await this.model('discount').find({ type_id: 7 });
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
        is_show: coupon.is_show
      };
      addressList.push(b);
    } else {
      const user_id = userId;
      const coupon = await this.model('coupon').where({ user_id: user_id }).select();
      for (const item in coupon) {
        const id = item.discount_id;
        const discount = await this.model('discount').find(id);
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
          is_show: discount.is_show
        };
        addressList.push(b);
      }
    }

    return addressList;
  }
};
