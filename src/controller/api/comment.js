module.exports = class extends think.cmswing.app {
  constructor(ctx) {
    super(ctx);
  }
  /**
     * 发表评论
     * @returns {Promise.<*|PreventPromise|void|Promise>}
     */
  async postAction() {
    let typeId = this.post('typeId');
    if (!typeId) {
      typeId = 0;
    }
    const orderGoodsId = this.post('orderGoodsId');
    // const valueId = this.post('valueId');
    const order = await this.model('order').find(orderGoodsId);
    const valueId = order.restaurant_id;
    const imgList = this.post('imgList');
    const content = this.post('content');
    const buffer = Buffer.from(content);
    const insertId = await this.model('comment').add({
      type_id: typeId,
      value_id: valueId,
      content: buffer.toString('base64'),
      add_time: this.getTime(),
      user_id: this.getLoginUserId()
    });
    imgList.pop();
    for (let i = 0; i < imgList.length; i++) {
      const img = imgList[i].src;
      await this.model('comment_picture').add({
        comment_id: insertId,
        pic_url: img,
        sort_order: i
      });
    }
    await this.model('order').where({id: orderGoodsId}).update({
      status: 5
    });
    if (insertId) {
      return this.success('评论添加成功');
    } else {
      return this.fail('评论保存失败');
    }
  }
};
