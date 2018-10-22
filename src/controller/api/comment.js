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
    let status = '';
    if (imgList) {
      status = 1;
    }
    const content = this.post('content');
    const buffer = Buffer.from(content);
    const insertId = await this.model('comment').add({
      type_id: typeId,
      value_id: valueId,
      content: buffer.toString('base64'),
      add_time: this.getTime(),
      status: status,
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
  async indexAction() {
    const id = this.get('id');
    const typeId = this.get('type_id');
    const map = {};
    map.value_id = id;
    if (parseInt(typeId) === 3) {
      map.status = 1;
    } else if (typeId) {
      map.type_id = typeId;
    }
    const commentList = await this.model('comment').where(map).order('id DESC').page(1, 10).countSelect();
    for (let comment of commentList.data) {
      const comm = {};
      if (parseInt(comment.status === 1)) {
        const imgList = await this.model('comment_picture').where({comment_id: comment.id}).select();
        const picList = [];
        for (const img of imgList) {
          const a = await this.model('ext_attachment_pic').field(['path']).find(img.pic_url);
          picList.push(a);
        }
        comm.picList = picList;
      }
      const user = await this.model('wx_user').find(comment.user_id);
      comm.nickname = user.nickname;
      comm.headimgurl = user.headimgurl;
      comm.content = comment.content;
      comm.add_time = global.dateformat('Y-m-d H:i:s', comment.add_time);
      comment = comm;
    }
    return this.success(commentList);
  }
};
