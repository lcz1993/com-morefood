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
};
