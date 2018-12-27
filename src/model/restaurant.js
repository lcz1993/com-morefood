module.exports = class extends think.Model {
  /**
     * 根据店铺ID返回当前店铺指定数量的热销商品
     * @param id
     * @returns {Promise<*>}
     */
  async get_hot_goods(id) {
    const restaurant = await this.find(id);
    const arr = await this.model('medu').where({restaurant_id: id, num: {'>': 0, '=': null, _logic: 'OR'}}).order('sell_count DESC').limit(restaurant.hot_num).select();
    return arr;
  }
};
