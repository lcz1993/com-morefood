const path = require('path');
const fs = require('fs');
module.exports = class extends think.Controller {
  constructor(ctx) {
    super(ctx);
    this.pdb = this.model('ext_attachment_pic');
  }

  // 上传图片
  async uploadpicAction() {
    const name = 'file';
    const att = {};

    const file = think.extend({}, this.file(name));
    const filepath = file.path;
    const extname = path.extname(file.name);
    const basename = path.basename(filepath) + extname;
    // console.log(basename);
    const ret = {'status': 1, 'info': '上传成功', 'data': ''};
    let data;
    // 加入七牛接口
    // 默认路径
    const uploadPath = this.saveFile(filepath, 'picture', basename, att);
    // 返回最新路径
    file.path = uploadPath.path + '/' + basename;
    data = {
      path: uploadPath.root + '/' + basename,
      create_time: new Date().getTime(),
      status: 1
    };
    // 添加水印
    if (att.mark == 1) {
      const mark = this.extService('mark', 'attachment');
      mark.mark(file.path);
    }

    // 添加文件并返回结果
    const res = await this.pdb.add(data);
    const r = {id: res, url: await get_pic(res), name: (file.name).trim()};
    let rr = {};
    if (!think.isEmpty(att) && !think.isEmpty(att.rule)) {
      const match = att.rule.match(/\${(\S+?)\}/g);
      // console.log(match);
      const replace = [];
      for (let val of match) {
        val = val.replace(/(^\${)|(\}$)/g, '');
        replace.push(r[val]);
      }
      // console.log(replace);
      rr = str_replace(match, replace, att.rule);
      // console.log(rr);
      if (att.rule.indexOf('{') === 0) {
        rr = JSON.parse(rr);
      }
    }
    const src = 'http://' + this.ctx.host + data.path;
    return this.success(src);
  }
  // 转移文件
  saveFile(filepath, defpath, basename, attr) {
    // 处理路径
    if (attr.path != null && !think.isEmpty(attr.path.trim())) {
      defpath = attr.path.trim();
    };
    // 生成目录
    const rootpath = `/upload/${defpath}/${dateformat('Y-m-d', new Date().getTime())}`;
    const uploadPath = `${think.resource}${rootpath}`;
    think.mkdir(uploadPath);
    // 转移文件
    if (think.isFile(filepath)) {
      fs.renameSync(filepath, uploadPath + '/' + basename);
    }
    return {
      path: uploadPath,
      root: rootpath,
      def: defpath
    };
  }
};
