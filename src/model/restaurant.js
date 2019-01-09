module.exports = class extends think.Model {
  /**
     * 根据店铺ID返回当前店铺指定数量的热销商品
     * @param id
     * @returns {Promise<*>}
     */
  async get_hot_goods(id, delivery) {
    const restaurant = await this.find(id);
    const arr = await this.model('medu').where({restaurant_id: id, num: {'>': 0, '=': null, _logic: 'OR'}, id: ['IN', delivery.goods_id]}).order('sell_count DESC').limit(restaurant.hot_num).select();
    const list = [];
    for (const i in arr) {
      const medu = arr[i];
      if (medu.dish_picture) {
        medu.dish_picture = await this.model('ext_attachment_pic').where({id: medu.dish_picture}).getField('path', true);
      }
      if (medu.image) {
        medu.image = await this.model('ext_attachment_pic').where({id: medu.image}).getField('path', true);
      }
      let num = '';
      if (medu.is_stop == 0) {
        if (medu.num == null) {
          num = '该商品不限量';
        } else {
          if (medu.num > 0) {
            num = '剩余' + medu.num;
          } else {
            medu.is_stop == 0;
          }
        }
      } else {
        num = '该商品已下架';
      }
      medu.num = num;
      list.push({
        id: medu.id,
        name: medu.dish_name,
        price: '',
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
      });
    }
    return list;
  }
};
