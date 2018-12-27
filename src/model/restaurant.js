module.exports = class extends think.Model {
  async get_hot_goods(id) {
    const restaurant = await this.find(id);
    const arr = await this.model('medu').where({restaurant_id: id, num: {'>': 0, '=': null, _logic: 'OR'}}).order('sell_count DESC').limit(restaurant.hot_num).select();
    return arr;
  }
};
