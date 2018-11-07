// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------
/**
 * this file will be loaded before server started
 * you can define global functions used in controllers, models, templates
 */

/**
 * use global.xxx to define global functions
 *
 * global.fn1 = function(){
 *
 * }
 *
 *global.xxx = async () => {
 *   let data = await Promise.resolve(111)
 *}
 */

/**
 * ip转数字
 * @param ip
 * @returns {number}
 * @private
 */
global._ip2int = function(ip) {
  var num = 0;
  ip = ip.split('.');
  num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
  num = num >>> 0;
  return num;
};
/**
 * 数字转ip
 * @param num
 * @returns {string|*}
 * @private
 */
global._int2iP = function(num) {
  var str;
  var tt = new Array();
  tt[0] = (num >>> 24) >>> 0;
  tt[1] = ((num << 8) >>> 24) >>> 0;
  tt[2] = (num << 16) >>> 24;
  tt[3] = (num << 24) >>> 24;
  str = String(tt[0]) + '.' + String(tt[1]) + '.' + String(tt[2]) + '.' + String(tt[3]);
  return str;
};

/**
 * 密码加密
 * @param password 加密的密码
 * @param md5encoded true-密码不加密，默认加密
 * @returns {*}
 */
global.encryptPassword = function(password, md5encoded) {
  md5encoded = md5encoded || false;
  password = md5encoded ? password : think.md5(password);
  return think.md5(think.md5('sxtssccm') + password + think.md5('ChengzhiLi'));
};

/**
 * 数组去重
 * @param arr
 * @returns {Array}
 */
global.unique = function(arr) {
  // var result = [], hash = {};
  // for (var i = 0, elem; (elem = arr[i]) != null; i++) {
  //     if (!hash[elem]) {
  //         result.push(elem);
  //         hash[elem] = true;
  //     }
  // }
  // return result;
  return Array.from(new Set(arr));
};
/**
 * in_array
 * @param stringToSearch
 * @param arrayToSearch
 * @returns {boolean}
 */
global.in_array = function(stringToSearch, arrayToSearch) {
  for (let s = 0; s < arrayToSearch.length; s++) {
    const thisEntry = arrayToSearch[s].toString();
    if (thisEntry == stringToSearch) {
      return true;
    }
  }
  return false;
};
/**
 * global times
 * 时间格式化
 * @param d
 * @returns {string}
 */
global.times = function(d, sec) {
  var time;
  var date = new Date(d);
  var y = date.getFullYear();
  var M = date.getMonth() + 1;
  M = M < 10 ? '0' + M : M;
  var d = date.getDate();
  d = d < 10 ? '0' + d : d;
  var h = date.getHours();
  h = h < 10 ? '0' + h : h;
  var m = date.getMinutes();
  m = m < 10 ? '0' + m : m;
  var s = date.getSeconds();
  s = s < 10 ? '0' + s : s;
  if (sec) {
    time = y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s;
  } else {
    time = y + '-' + M + '-' + d + ' ' + h + ':' + m;
  }

  return time;
};

/**
 * 排序函数
 */
function sort_node(v, w) {
  return v['sort'] - w['sort'];
}
function sort_node1(v, w) {
  return w['sort'] - v['sort'];
}
/**
 * global get_children
 * 获取子集分类 （这里是获取所有子集）
 */
global.get_children = function(nodes, parent, sn = 0) {
  // console.log(11);
  var children = [];
  var last = [];
  /* 未访问的节点 */
  /*
     * 获取根分类列表。
     * 创建一个虚拟父级分类亦可
     **/
  var node = null;
  for (var i in nodes) {
    node = nodes[i];
    if (node['pid'] == parent) {
      node['deep'] = 0;
      children.push(node);
    } else {
      last.push(node);
    }
  }
  if (sn == 0) {
    children.sort(sort_node);
  } else {
    children.sort(sort_node1);
  }

  /* 同级排序 */
  var jumper = 0;
  var stack = children.slice(0);
  /* easy clone */

  while (stack.length > 0 &&
  /* just in case */ jumper++ < 1000) {
    var shift_node = stack.shift();
    var list = [];
    /* 当前子节点列表 */
    var last_static = last.slice(0);
    last = [];
    for (var i in last_static) {
      node = last_static[i];
      if (node['pid'] == shift_node['id']) {
        node['deep'] = shift_node['deep'] + 1;
        list.push(node);
      } else {
        last.push(node);
      }
    }
    if (sn == 0) {
      list.sort(sort_node);
    } else {
      list.sort(sort_node1);
    }

    for (var i in list) {
      node = list[i];
      stack.push(node);
      children.push(node);
    }
  }
  /*
     * 有序树非递归前序遍历
     *
     * */
  var stack = [];
  /* 前序操作栈 - 分类编号 */
  var top = null;
  /* 操作栈顶 */
  var tree = children.slice(0);
  /* 未在前序操作栈内弹出的节点 */
  var has_child = false;
  /* 是否有子节点，如无子节点则弹出栈顶 */
  var children = [];
  /* 清空结果集 */
  var jumper = 0;
  last = [];
  /* 未遍历的节点 */
  var current = null;
  /* 当前节点 */
  stack.push(parent);
  /* 建立根节点 */

  while (stack.length > 0) {
    if (jumper++ > 1000) {
      break;
    }
    top = stack[stack.length - 1];
    has_child = false;
    last = [];

    for (var i in tree) {
      current = tree[i];
      if (current['pid'] == top) {
        top = current['id'];
        stack.push(top);
        children.push(current);
        has_child = true;
      } else {
        last.push(current);
      }
    }
    tree = last.slice(0);
    if (!has_child) {
      stack.pop();
      top = stack[stack.length - 1];
    }
  }
  return children;
};
/**
 * obj_values(obj);
 * 获取对象中的所有的值，并返回数组
 * @param obj
 * @returns {Array}
 */
/* global obj_values */
global.obj_values = function(obj) {
  const objkey = Object.keys(obj);
  const objarr = [];
  objkey.forEach(key => {
    objarr.push(obj[key]);
  });
  return objarr;
};
/**
 * 判断对象是否相等
 * @param a
 * @param b
 * @returns {boolean}
 */
/* global isObjectValueEqual */
global.isObjectValueEqual = function(a, b) {
  // Of course, we can do it use for in
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];

    // If values of same property are not equal,
    // objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
};
/**
 * trim()
 * @param str [删除左右两端的空格]
 * @returns {*|void|string|XML}
 */
/* global trim */
global.trim = function(str) {
  return str.replace(/(^\s*)|(\s*$)/g, '');
};
/**
 * 分析枚举类型配置值 格式 a:名称1,b:名称2
 * @param str
 * @returns {*}
 */
/* global parse_config_attr */
global.parse_config_attr = function(str, sep = ':') {
  let strs;
  if (str.search(/\r\n/ig) > -1) {
    strs = str.split('\r\n');
  } else if (str.search(/,/ig) > -1) {
    strs = str.split(',');
  } else if (str.search(/\n/ig) > -1) {
    strs = str.split('\n');
  } else {
    strs = [str];
  }
  if (think.isArray(strs)) {
    const obj = {};
    strs.forEach(n => {
      n = n.split(sep);
      obj[n[0]] = n[1];
    });
    return obj;
  }
};
global.parse_type_attr = function(str) {
  let strs;
  if (str.search(/\r\n/ig) > -1) {
    strs = str.split('\r\n');
  } else if (str.search(/,/ig) > -1) {
    strs = str.split(',');
  } else if (str.search(/\n/ig) > -1) {
    strs = str.split('\n');
  } else {
    strs = [str];
  }
  if (think.isArray(strs)) {
    const arr = [];
    for (let v of strs) {
      const obj = {};
      v = v.split(':');
      if (!think.isEmpty(v[0]) && !think.isEmpty(v[1])) {
        obj.id = v[0];
        obj.name = v[1];
        if (obj.id.split('.').length == 1) {
          obj.pid = 0;
        } else {
          obj.pid = obj.id.split('.').splice(0, obj.id.split('.').length - 1).join('.');
        }
        arr.push(obj);
      }
    }
    // console.log(arr);
    const tree = arr_to_tree(arr, 0);
    // think.log(tree);
    return tree;
  }
};
/**
 * ltrim()
 * @param str [删除左边的空格]
 * @returns {*|void|string|XML}
 */
/* global ltrim */
global.ltrim = function(str) {
  return str.replace(/(^\s*)/g, '');
};
/**
 *
 * rtrim()
 * @param str [删除右边的空格]
 * @returns {*|void|string|XML}
 */
/* global rtrim */
global.rtrim = function(str) {
  return str.replace(/(\s*$)/g, '');
};
/**
 * 把返回的数据集转换成Tree
 * @param array data 要转换的数据集
 * @param string pid parent标记字段
 * @return array
 */
/* global arr_to_tree */
global.arr_to_tree = function(data, pid) {
  var result = [], temp;
  var length = data.length;
  for (var i = 0; i < length; i++) {
    if (data[i].pid == pid) {
      result.push(data[i]);
      temp = arr_to_tree(data, data[i].id);
      if (temp.length > 0) {
        data[i].children = temp;
        data[i].chnum = data[i].children.length;
      }
    }
  }
  return result;
};
// 计算分类信息当前状态
global.sanjiao = (arr) => {
  var result = [];
  for (var i = 0, len = arr.length; i < len; i++) {
    result.push(result[i - 1] !== undefined ? result[i - 1] + '.' + arr[i] : arr[i]);
  }
  return result;
};
/* global arr_to_tree */
global.sub_cate = function(data, pid) {
  var result = [], temp;
  var length = data.length;
  for (var i = 0; i < length; i++) {
    if (data[i].pid == pid) {
      // console.log(data[i]);
      result.push(data[i].id);
      temp = sub_cate(data, data[i].id);
      if (temp.length > 0) {
        result.push(temp.join(','));
      }
    }
  }
  return result;
};
// 获取属性类型信息
/* global get_attribute_type */
global.get_attribute_type = function(type) {
  // TODO 可以加入系统配置
  const _type = {
    'num': ['数字', 'int(10) unsigned NOT NULL'],
    'string': ['字符串', 'varchar(255) NOT NULL'],
    'textarea': ['文本框', 'text NOT NULL'],
    'date': ['日期', 'bigint(13) NOT NULL'],
    'datetime': ['时间', 'bigint(13) NOT NULL'],
    'bool': ['布尔', 'tinyint(2) NOT NULL'],
    'select': ['枚举', 'char(50) NOT NULL'],
    'radio': ['单选', 'char(10) NOT NULL'],
    'checkbox': ['多选', 'varchar(100) NOT NULL'],
    'editor': ['编辑器', 'text NOT NULL'],
    'picture': ['上传图片', 'int(10) unsigned NOT NULL'],
    'file': ['上传附件', 'int(10) unsigned NOT NULL'],
    'suk': ['商品规格', 'text NOT NULL'],
    'pics': ['多图上传', 'varchar(255) NOT NULL'],
    'price': ['价格', 'varchar(255) NOT NULL'],
    'freight': ['运费', 'varchar(255) NOT NULL'],
    'keyword': ['关键词', 'varchar(255) NOT NULL'],
    'relation': ['关联', 'varchar(100) NOT NULL'],
    'atlas': ['图集', 'text NOT NULL']
  };
  return type ? _type[type][0] : _type;
};
/**
 * 时间戳格式化 dateformat()
 * @param extra 'Y-m-d H:i:s'
 * @param date  时间戳
 * @return  '2015-12-17 15:39:44'
 */
/* global dateformat */
global.dateformat = function(extra, date) {
  const D = new Date(date);
  const time = {
    'Y': D.getFullYear(),
    'm': D.getMonth() + 1,
    'd': D.getDate(),
    'H': D.getHours(),
    'i': D.getMinutes(),
    's': D.getSeconds()
  };
  const key = extra.split(/\W/);
  let _date;
  for (const k of key) {
    time[k] = time[k] < 10 ? '0' + time[k] : time[k];
    _date = extra.replace(k, time[k]);
    extra = _date;
  }
  return _date;
};
/* global array_search */
global.array_search = function(arr, str) {
  // 如果可以的话，调用原生方法
  if (arr && arr.indexOf) {
    return arr.indexOf(str);
  }

  var len = arr.length;
  for (var i = 0; i < len; i++) {
    // 定位该元素位置
    if (arr[i] == str) {
      return i;
    }
  }

  // 数组中不存在该元素
  return false;
};
/* global array_diff */
global.array_diff = function(arr1, arr2) {
  // var arr1 = ["i", "b", "c", "d", "e", "f","x",""]; //数组A
  // var arr2 = ["a", "b", "c", "d", "e", "f", "g"];//数组B
  var temp = []; // 临时数组1
  var temparray = [];// 临时数组2
  for (var i = 0; i < arr2.length; i++) {
    temp[arr2[i]] = true;// 巧妙地方：把数组B的值当成临时数组1的键并赋值为真
  }
  for (var i = 0; i < arr1.length; i++) {
    if (!temp[arr1[i]]) {
      temparray.push(arr1[i]);// 巧妙地方：同时把数组A的值当成临时数组1的键并判断是否为真，如果不为真说明没重复，就合并到一个新数组里，这样就可以得到一个全新并无重复的数组
    }
  }
  ;
  // if(think.isEmpty(temparray)){
  //    return
  // }
  return temparray;
};

global.get_list_field = function(data, grid, controller, module) {
  module = module || 'admin';
  // console.log(module);
  const data2 = {};
  let value;

  // 获取当前字段数据
  // console.log(grid);
  for (const field of grid.field) {
    let temp;
    const array = field.split('|');// TODO
    // console.log(array);
    temp = data[array[0]];
    // console.log(temp);
    // 函数支持
    if (!think.isEmpty(array[1])) {
      temp = call_user_func(array[1], temp);
    }
    data2[array[0]] = temp;
  }
  // console.log(data2);
  if (!think.isEmpty(grid.format)) {
    // value  =   preg_replace_callback('/\[([a-z_]+)\]/', function($match) use($data2){return $data2[$match[1]];}, $grid['format']);
  } else {
    value = data2[Object.keys(data2)];
  }

  // 链接支持
  if (grid.field[0] == 'title' && data.type == '目录') {
    // 目录类型自动设置子文档列表链接
    grid.href = '[LIST]';
  } else if (grid.field[0] == 'title') {
    grid.href = '[EDIT]';
  }

  if (!think.isEmpty(grid.href)) {
    const links = grid.href.split(',');

    const val = [];
    for (const link of links) {
      const array = link.split('|');
      const href = array[0];

      // console.log(href);
      const matches = href.match(/^\[([a-z_]+)\]$/);
      if (matches) {
        val.push(data2[matches[1]]);
        // console.log(val);
      } else {
        const show = !think.isEmpty(array[1]) ? array[1] : value;
        // console.log(show)
        // 替换系统特殊字符串
        const hrefs = {
          '[DELETE]': 'setstatus/?status=-1&ids=[id]',
          '[EDIT]': 'edit/?id=[id]&model=[model_id]&cate_id=[category_id]',
          '[LIST]': 'index/?pid=[id]&model=[model_id]&cate_id=[category_id]'
        };
        const match = hrefs[href].match(/\[(\S+?)\]/g);
        // console.log(match);
        const u = [];
        for (const k of match) {
          const key = k.replace(/(^\[)|(\]$)/g, '');
          u.push(data[key]);
        }
        // console.log(u);
        const query = str_replace(match, u, hrefs[href]);
        const href1 = `/${controller}/${query}`;
        // console.log(query);
        if (href == '[DELETE]') {
          val.push('<a href="' + href1 + '" class="text-info ajax-get confirm">' + show + '</a> ');
        } else {
          val.push('<a href="' + href1 + '" class="text-info">' + show + '</a> ');
        }
      }
    }
    value = val.join(' ');
  }
  // console.log(value)
  return value;
};

/**
 * 获取行为类型
 * @param intger type 类型
 * @param bool all 是否返回全部类型
 * @author arterli <arterli@qq.com>
 */
/* global get_action_type */
global.get_action_type = function(type, all) {
  all = all || false;
  const list = {
    1: '系统',
    2: '用户'
  };
  if (all) {
    return list;
  }
  return list[type];
};

/**
 * 返回一个自定义用户函数给出的第一个参数
 *  call_user_func（回调 函数名， [参数]）
 * @param cb  函数名
 * @param params 数组格式传入参数
 */
/* global call_user_func */
global.call_user_func = function(cb, params) {
  const func = eval(cb);
  if (!think.isArray(params)) {
    params = [params];
  }
  return func.apply(cb, params);
};

/**
 *根据uid获取用户昵称
 * @param uid 用户id
 * @returns Promise {*}
 */
/* global get_nickname */
global.get_nickname = async(uid) => {
  // console.log(uid);
  // let data = await think.model('member', think.config("model")).cache(1000).get_nickname(uid);
  const data = await think.model('cmswing/member').get_nickname(uid);
  return data;
};
/**
 *根据id获取微信用户昵称
 * @param id 用户id
 * @returns Promise {*}
 */
/* global get_wxname */
global.get_wxname = async(id) => {
  // console.log(uid);
  // let data = await think.model('member', think.config("model")).cache(1000).get_nickname(uid);
  const data = await think.model('cmswing/wx_user').get_wxname(id);
  return data;
};
// 时间格式
/* global time_format */
global.time_format = (time) => {
  return dateformat('Y-m-d H:i:s', time);
};
/* global str_replace()
 * str_replace(条件[]，替换内容[],被替换的内容)
 * @param search
 * @param replace
 * @param subject
 * @param count
 * @returns {*}
 */
/* global str_replace */
global.str_replace = function(search, replace, subject, count) {
  var i = 0, j = 0, temp = '', repl = '', sl = 0, fl = 0,
    f = [].concat(search),
    r = [].concat(replace),
    s = subject,
    ra = r instanceof Array, sa = s instanceof Array;
  s = [].concat(s);
  if (count) {
    this.window[count] = 0;
  }

  for (i = 0, sl = s.length; i < sl; i++) {
    if (s[i] === '') {
      continue;
    }
    for (j = 0, fl = f.length; j < fl; j++) {
      temp = s[i] + '';
      repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
      s[i] = (temp).split(f[j]).join(repl);
      if (count && s[i] !== temp) {
        this.window[count] += (temp.length - s[i].length) / f[j].length;
      }
    }
  }
  return sa ? s : s[0];
};
/**
 * 获取文档地址
 * @param name 文档表示
 * @param id   文档id
 * @returns {*}
 */
global.get_url = (name, id) => {
  if (!think.isEmpty(name)) {
    return `/p/${name}.html`;
  } else {
    return `/p/${id}.html`;
  }
};
global.get_pdq = (id) => {
  return parse_config_attr(think.config('ext.attachment.pdn'), '@')[id];
};
/**
 * 获取文档封面图片
 * @param int cover_id
 * @param string field
 * @return 完整的数据  或者  指定的field字段值
 * @author arterli <arterli@qq.com>
 */
/* global get_cover */
global.get_cover = async(cover_id, field) => {
  if (think.isEmpty(cover_id)) {
    return false;
  }
  const picture = await think.model('ext_attachment_pic').where({ 'status': 1 }).find(cover_id);
  return think.isEmpty(field) ? picture : picture[field];
};
/**
 *
 * @param id
 * @param m
 * /0/w/<LongEdge>/h/<ShortEdge> 	限定缩略图的长边最多为<LongEdge>，短边最多为<ShortEdge>，进行等比缩放，不裁剪。如果只指定 w 参数则表示限定长边（短边自适应），只指定 h 参数则表示限定短边（长边自适应）。
 * /1/w/<Width>/h/<Height> 	限定缩略图的宽最少为<Width>，高最少为<Height>，进行等比缩放，居中裁剪。转后的缩略图通常恰好是 <Width>x<Height> 的大小（有一个边缩放的时候会因为超出矩形框而被裁剪掉多余部分）。如果只指定 w 参数或只指定 h 参数，代表限定为长宽相等的正方图。
 * /2/w/<Width>/h/<Height> 	限定缩略图的宽最多为<Width>，高最多为<Height>，进行等比缩放，不裁剪。如果只指定 w 参数则表示限定宽（长自适应），只指定 h 参数则表示限定长（宽自适应）。它和模式0类似，区别只是限定宽和高，不是限定长边和短边。从应用场景来说，模式0适合移动设备上做缩略图，模式2适合PC上做缩略图。
 * /3/w/<Width>/h/<Height> 	限定缩略图的宽最少为<Width>，高最少为<Height>，进行等比缩放，不裁剪。如果只指定 w 参数或只指定 h 参数，代表长宽限定为同样的值。你可以理解为模式1是模式3的结果再做居中裁剪得到的。
 * /4/w/<LongEdge>/h/<ShortEdge> 	限定缩略图的长边最少为<LongEdge>，短边最少为<ShortEdge>，进行等比缩放，不裁剪。如果只指定 w 参数或只指定 h 参数，表示长边短边限定为同样的值。这个模式很适合在手持设备做图片的全屏查看（把这里的长边短边分别设为手机屏幕的分辨率即可），生成的图片尺寸刚好充满整个屏幕（某一个边可能会超出屏幕）。
 * /5/w/<LongEdge>/h/<ShortEdge> 	限定缩略图的长边最少为<LongEdge>，短边最少为<ShortEdge>，进行等比缩放，居中裁剪。如果只指定 w 参数或只指定 h 参数，表示长边短边限定为同样的值。同上模式4，但超出限定的矩形部分会被裁剪。
 * @param w 宽
 * @param h 高
 */
global.get_pic = async(id, m = null, w = null, h = null) => {
  if (think.isEmpty(id)) {
    return '/static/noimg.jpg';
  }
  const map = {};
  map.status = 1;
  if (think.isNumberString(id)) {
    map.id = id;
  } else {
    map.path = id;
  }
  const picture = await think.model('ext_attachment_pic').where(map).cache(1000 * 1000).find();
  if (think.isEmpty(picture)) {
    return '/static/noimg.jpg';
  }
  let q = '';
  if (picture.type > 0) {
    if (m != null) {
      m = '/' + m;
    } else {
      m = '';
    }
    if (w != null) {
      w = '/w/' + w;
    } else {
      w = '';
    }
    if (h != null) {
      h = '/h/' + h;
    } else {
      h = '';
    }
    if (m != '' || w != '' || h != '') {
      q = `?imageView2${m}${w}${h}`;
    }

    return `${get_pdq(picture.type)}/${picture.path}${q}`;
  } else {
    return picture.path;
  }
};
/**
 * 获取多图封面
 * @param array arr_id
 * @param string field
 * @return 完整的数据或者 指定的field字段值
 * @author arterli <arterli@qq.com>
 */
/* global get_pics_one */
global.get_pics_one = async(arr_id, field) => {
  if (think.isEmpty(arr_id)) {
    return false;
  }
  var arr = arr_id.split(',');
  return get_cover(arr[0], field);
};
// {present_price:100,discount_price:80}
global.formatprice = function(price) {
  const pr = JSON.parse(price);
  var present_price;
  // console.log(pr);
  if (think.isNumber(pr.present_price)) {
    pr.present_price = pr.present_price.toString();
  }
  var price = pr.present_price.split('-');
  if (price.length > 1) {
    present_price = formatCurrency(price[0]) + '-' + formatCurrency(price[1]);
  } else {
    present_price = formatCurrency(price[0]);
  }
  if (pr.discount_price == 0) {
    return `<span class="text-xs"><span class="text-danger">现价:￥${present_price}</span></span>`;
  } else {
    return `<span class="text-xs"><span class="text-danger">现价:￥${present_price}</span> <br>原价:￥${formatCurrency(pr.discount_price)}</span>`;
  }
};
// 获取价格格式化
global.get_price_format = function(price, type) {
  const pr = JSON.parse(price);

  if (type == 1) {
    if (think.isNumber(pr.present_price)) {
      pr.present_price = pr.present_price.toString();
    }
    const prices = pr.present_price.split('-');
    let present_price;
    if (prices.length > 1) {
      present_price = formatCurrency(prices[0]) + '-' + formatCurrency(prices[1]);
    } else {
      present_price = formatCurrency(prices[0]);
    }
    price = present_price;
  } else {
    if (pr.discount_price == 0) {
      price = '';
    } else {
      price = formatCurrency(pr.discount_price);
    }
  }
  return price;
};
// 获取价格不格式化
global.get_price = function(price, type) {
  if (price) {
    price = JSON.parse(price);
    if (type == 1) {
      return price.present_price;
    } else {
      if (price.discount_price == 0) {
        return '';
      } else {
        return price.discount_price;
      }
    }
  }
};

/**
 * 将数值四舍五入(保留2位小数)后格式化成金额形式
 *
 * @param num 数值(Number或者String)
 * @return 金额格式的字符串,如'1,234,567.45'
 * @type String
 */
/* global formatCurrency */
global.formatCurrency = function(num) {
  num = num.toString().replace(/\$|\,/g, '');
  if (isNaN(num)) { num = '0' }
  const sign = (num == (num = Math.abs(num)));
  num = Math.floor(num * 100 + 0.50000000001);
  let cents = num % 100;
  num = Math.floor(num / 100).toString();
  if (cents < 10) { cents = '0' + cents }
  for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num = num.substring(0, num.length - (4 * i + 3)) + ',' +
            num.substring(num.length - (4 * i + 3));
  }
  return (((sign) ? '' : '-') + num + '.' + cents);
};

/**
 * 将数值四舍五入(保留1位小数)后格式化成金额形式
 *
 * @param num 数值(Number或者String)
 * @return 金额格式的字符串,如'1,234,567.4'
 * @type String
 */
/* global formatCurrencyTenThou */
global.formatCurrencyTenThou = function(num) {
  num = num.toString().replace(/\$|\,/g, '');
  if (isNaN(num)) { num = '0' }
  const sign = (num == (num = Math.abs(num)));
  num = Math.floor(num * 10 + 0.50000000001);
  const cents = num % 10;
  num = Math.floor(num / 10).toString();
  for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num = num.substring(0, num.length - (4 * i + 3)) + ',' +
            num.substring(num.length - (4 * i + 3));
  }
  return (((sign) ? '' : '-') + num + '.' + cents);
};
/**
 * 获取商品suk suk, arr:类型数组
 */

/* global getsuk */
global.getsuk = function(suk, arr) {
  // console.log(suk);
  var suk_;
  suk.forEach(function(v, k) {
    if (v.name == arr[0]) {
      if (v.ch) {
        v.ch.forEach(function(v_, k_) {
          if (v_.name == arr[1]) {
            if (v_.ch) {
              v_.ch.forEach(function(v__, k__) {
                if (v__.name == arr[2]) {
                  suk_ = think.extend(v__, v_, v);
                }
              });
            } else {
              suk_ = think.extend(v_, v);
            }
          }
        });
      } else {
        suk_ = v;
      }
    }
  });
  return suk_;
};

/**
 * 构建微信菜单数据结构
 * @param data
 * @returns {{menu: {button: Array}}}
 */
global.createSelfMenu = function(data) {
  const menu = {
    'menu': {
      'button': []
    }
  };
  const button = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].pid == '0') {
      const item = {
        'id': data[i].id,
        'm_id': data[i].m_id,
        'pid': data[i].pid,
        'type': data[i].type,
        'name': data[i].name,
        'sort': data[i].sort,
        'sub_button': []
      };
      menu.menu.button.push(item);
      button.push(item);
    }
  }
  for (var x = 0; x < button.length; x++) {
    for (var y = 0; y < data.length; y++) {
      if (data[y].pid == button[x].m_id) {
        const sitem = {
          'type': data[y].type,
          'm_id': data[y].m_id,
          'sort': data[y].sort,
          'name': data[y].name,
          'url': data[y].url,
          'media_id': data[y].media_id
        };
        button[x].sub_button.push(sitem);
      }
    }
  }
  return menu;
};

/**
 * 微信创建自定义菜单接口
 * 数据构建
 */

global.buildselfmenu = function(data) {
  const menu = {
    'button': []
  };
  const button = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].pid == '0') {
      const item = {
        'id': data[i].id,
        'm_id': data[i].m_id,
        'pid': data[i].pid,
        'type': data[i].type,
        'name': data[i].name,
        'sort': data[i].sort,
        'sub_button': []
      };
      menu.menu.button.push(item);
      button.push(item);
    }
  }
  for (var x = 0; x < button.length; x++) {
    for (var y = 0; y < data.length; y++) {
      if (data[y].pid == button[x].m_id) {
        const sitem = {
          'type': data[y].type,
          'sort': data[y].sort,
          'name': data[y].name,
          'url': data[y].url,
          'media_id': data[y].media_id
        };
        button[x].sub_button.push(sitem);
      }
    }
  }
  return menu;
};

/**
 * 验证是否为智能手机
 * @ param {string} data :this.userAgent;
 * @ return {bool}
 */
/** global checkMobile */
global.checkMobile = function(agent) {
  let flag = false;
  agent = agent.toLowerCase();
  const keywords = ['android', 'iphone', 'ipod', 'ipad', 'windows phone', 'mqqbrowser'];

  // 排除 Windows 桌面系统
  if (!(agent.indexOf('windows nt') > -1) || (agent.indexOf('windows nt') > -1 && agent.indexOf('compatible; msie 9.0;') > -1)) {
    // 排除苹果桌面系统
    if (!(agent.indexOf('windows nt') > -1) && !agent.indexOf('macintosh') > -1 && !(agent.indexOf('ipad') > -1)) {
      for (const item of keywords) {
        if (agent.indexOf(item) > -1) {
          flag = true;
          break;
        }
      }
    }
  }
  return flag;
};
/**
 * 验证时否是微信
 *
 */
global.is_weixin = (agent) => {
  let flag = false;
  agent = agent.toLowerCase();
  // let key = ["mqqbrowser","micromessenger"];
  const key = ['micromessenger'];
  // 排除 Windows 桌面系统
  if (!(agent.indexOf('windows nt') > -1) || (agent.indexOf('windows nt') > -1 && agent.indexOf('compatible; msie 9.0;') > -1)) {
    // 排除苹果桌面系统
    if (!(agent.indexOf('windows nt') > -1) && !agent.indexOf('macintosh') > -1) {
      for (const item of key) {
        if (agent.indexOf(item) > -1) {
          flag = true;
          break;
        }
      }
    }
  }
  return flag;
};
/**
 *
 * @param time
 * @returns {string}'January 31, 2018 15:03:26'
 */
global.date_from = (time) => {
  // January 31, 2018 15:03:26
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const d = new Date(time);
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hour = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
  const min = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
  const sec = d.getSeconds() < 10 ? `0${d.getSeconds()}` : d.getSeconds();
  const res = `${month} ${day}, ${year} ${hour}:${min}:${sec}`;
  return res;
};

global.image_view = (str, w, m) => {
  // console.log(info);
  const imgReg = /<img.*?(?:>|\/>)/gi;
  const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  const arr = str.match(imgReg);
  if (!think.isEmpty(arr)) {
    const narr = [];
    for (const img of arr) {
      const _img = img.match(srcReg);
      // console.log(_img);
      const nimg = _img[1] + '?imageView2/' + m + '/w/' + w;
      // console.log(nimg)
      const inputimg = _img['input'].replace(_img[1], nimg);
      narr.push(inputimg);
    }
    return str_replace(arr, narr, str);
  } else {
    return str;
  }
};
global.img_text_view = (str, w, h) => {
  // console.log(info);
  const imgReg = /<img.*?(?:>|\/>)/gi;
  const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  if (think.isEmpty(str)) {
    return [];
  }
  const arr = str.match(imgReg);
  if (!think.isEmpty(arr)) {
    const narr = [];
    for (const img of arr) {
      const _img = img.match(srcReg);
      // console.log(_img[1]);
      let nimg = _img[1];
      if (!think.isEmpty(w) && !think.isEmpty(h)) {
        nimg = _img[1] + '?imageView2/1/w/' + w + '/h/' + h;
      }
      // console.log(nimg)
      narr.push(nimg);
    }
    // console.log(narr);
    return narr;
  } else {
    return [];
  }
};
/**
 * 获取文件信息
 * @param file_id 文件id
 * @param field 字段名,如果为空则返回整个记录集
 * @returns {*}
 */
global.get_file = async(file_id, field, key = false) => {
  if (think.isEmpty(file_id)) {
    return false;
  }
  const file = await think.model('ext_attachment_file').find(file_id);
  if (file.type > 0 && key && key !== 1) {
    file.savename = `${get_pdq(file.type)}/${file.savename}?download/${file.savename}`;
  } else if (file.type > 0 && key === 1) {
    file.savename = `${get_pdq(file.type)}/${file.savename}`;
  } else {
    file.savename = `${file.savepath}/${file.savename}`;
  }
  return think.isEmpty(field) ? file : file[field];
};
/**
 *
 * 根据栏目ID获取栏目信息
 * @param cid
 * @returns {*}
 */
global.get_cate = async(cid) => {
  const column = await think.model('cmswing/category').get_all_category();
  for (const v of column) {
    if (v.id == cid) {
      // console.log(v)
      return v;
    }
  }
};
/**
 * 获取分类信息url
 * @param id
 * @param val
 * @param arr
 */
global.sort_url = (id, val, arr, http) => {
  // console.log(http.get(val))
  let url;
  url = `${val}_${id}`;
  for (const v of arr) {
    if (v.option.identifier != val) {
      url += `|${v.option.identifier}_${http[v.option.identifier] || 0}`;
    }
  }
  // console.log(url);
  return url;
};
/*
 *比较数组是否完全相同
 */
global.a2a = function(a1, a2) {
  if (!(think.isArray(a1) && think.isArray(a2))) {
    return false;
  }
  if (a1.length != a2.length) {
    return false;
  }

  a1.sort();
  a2.sort();
  for (var i = 0; i < a1.length; i++) {
    if (typeof a1[i] !== typeof a2[i]) {
      return false;
    }
    if (think.isObject(a1[i]) && think.isObject(a2[i])) {
      var retVal = o2o(a1[i], a2[i]);
      if (!retVal) {
        return false;
      }
    } else if (think.isArray(a1[i]) && think.isArray(a2[i])) { // recursion
      if (!a2a(a1[i], a2[i])) {
        return false;
      }
    } else if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
};
// 生成6位的随机数
global.MathRand = function() {
  var Num = '';
  for (var i = 0; i < 6; i++) {
    Num += Math.floor(Math.random() * 10);
  }
  return Num;
};

// 更新缓存
global.update_cache = async(type) => {
  switch (type) {
    case 'category':
      // 更新栏目缓存
      await think.cache('sys_category_list', null);
      await think.cache('all_category', null);
      await think.cache('all_priv', null);// 栏目权限缓存
      break;
    case 'channel':// 更新频道缓存信息
      await think.cache('get_channel_cache', null);
      break;
    case 'model':
      await think.cache('get_document_model', null);// 清除模型缓存
      await think.cache('get_model', null);// 清除模型缓存
      break;
    case 'ext':
      await think.cache('extcache', null);
      break;
    case 'hooks':
      await think.cache('hookscache', null);
      break;
  }
};
/**
 *缓存权限列表 all_priv
 * @param catid 要验证的栏目id
 * @param roleid 用户组
 * @param action 权限类型
 * @param is_admin 谁否前台 0前台，1后台
 * @param type true
 * @returns {bool} 返回flase 或true false:没权限，true:有权限。
 */
global.priv = async(catid, roleid, action, is_admin = 0, type = true) => {
  const priv = await think.model('cmswing/category_priv').priv(catid, roleid, action, is_admin, type);
  // console.log(priv);
  if (!priv) {
    return false;
  } else {
    return true;
  }
};

global.GetDateStr = function(AddDayCount) {
  var dd = new Date();
  dd.setDate(dd.getDate() + AddDayCount);// 获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = (dd.getMonth() + 1) < 10 ? '0' + (dd.getMonth() + 1) : (dd.getMonth() + 1);// 获取当前月份的日期，不足10补0
  var d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate();// 获取当前几号，不足10补0
  return y + '-' + m + '-' + d;
};
// 转意符换成普通字符
global.escape2Html = function(str) {
  var arrEntities = {'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"'};
  return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) { return arrEntities[t] });
};
global.html_decode = function(str) {
  var s = '';
  if (str.length == 0) return '';
  s = str.replace(/&gt;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&nbsp;/g, ' ');
  s = s.replace(/&#39;/g, "\'");
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/<br>/g, '\n');
  return s;
};

global.html_encode = function(str) {
  var s = '';
  if (str.length == 0) return '';
  s = str.replace(/&/g, '&gt;');
  s = s.replace(/</g, '&lt;');
  s = s.replace(/>/g, '&gt;');
  s = s.replace(/ /g, '&nbsp;');
  s = s.replace(/\'/g, '&#39;');
  s = s.replace(/\"/g, '&quot;');
  s = s.replace(/\n/g, '<br>');
  return s;
};
/**
 * 检查pos(推荐位的值)是否包含指定推荐位contain
 * @param number pos 推荐位的值
 * @param number contain 指定推荐位
 * @return boolean true 包含 ， false 不包含
 */
global.check_document_position = (pos = 0, contain = 0) => {
  if (think.isEmpty(pos) || think.isEmpty(contain)) {
    return false;
  }
  // 将两个参数进行按位与运算，不为0则表示$contain属于$pos
  const res = pos & contain;
  if (res !== 0) {
    return true;
  } else {
    return false;
  }
};
var province = [{ name: 'beijing', cities: ['xicheng', 'dongcheng', 'chongwen', 'xuanwu', 'chaoyang', 'haidian', 'fengtai', 'shijingshan', 'mentougou', 'fangshan', 'tongzhou', 'shunyi', 'daxing', 'changping', 'pinggu', 'huairou', 'miyun', 'yanqing'] },
  { name: 'tianjin', cities: ['qingyang', 'hedong', 'hexi', 'nankai', 'hebei', 'hongqiao', 'tanggu', 'hangu', 'dagang', 'dongli', 'xiqing', 'beichen', 'jinnan', 'wuqing', 'baodi', 'jinghai', 'ninghe', 'jixian', 'kaifaqu'] },
  { name: 'hebei', cities: ['shijiazhuang', 'qinhuangdao', 'langfang', 'baoding', 'handan', 'tangshan', 'xingtai', 'hengshui', 'zhangjiakou', 'chengde', 'cangzhou', 'hengshui'] },
  { name: 'shanxi', cities: ['taiyuan', 'datong', 'changzhi', 'jinzhong', 'yangquan', 'shuozhou', 'yuncheng', 'linfen'] },
  { name: 'namenggu', cities: ['huhehaote', 'chifeng', 'tongliao', 'xilinguole', 'xingan'] },
  { name: 'liaoning', cities: ['dalian', 'shenyang', 'anshan', 'fushun', 'yingkou', 'jinzhou', 'dandong', 'chaoyang', 'liaoyang', 'fuxin', 'tieling', 'panjin', 'benxi', 'huludao'] },
  { name: 'jilin', cities: ['changchun', 'jilin', 'siping', 'liaoyuan', 'tonghua', 'yanji', 'baicheng', 'liaoyuan', 'songyuan', 'linjiang', 'huichun'] },
  { name: 'heilongjiang', cities: ['haerbin', 'qiqihaer', 'daqing', 'mudanjiang', 'hegang', 'jiamusi', 'suihua'] },
  { name: 'shanghai', cities: ['pudong', 'yangpu', 'xuhui', 'jingan', 'luwan', 'huangpu', 'putuo', 'zhabei', 'hongkou', 'changning', 'baoshan', 'minxing', 'jiading', 'jinshan', 'songjiang', 'qingpu', 'chongming', 'fengxian', 'nanhui'] },
  { name: 'jiangsu', cities: ['nanjing', 'suzhou', 'wuxi', 'changzhou', 'yangzhou', 'xuzhou', 'nantong', 'zhenjiang', 'taizhou', 'huaian', 'lianyungang', 'suqian', 'yancheng', 'huaiyin', 'muyang', 'zhangjiagang'] },
  { name: 'zhejiang', cities: ['hangzhou', 'jinhua', 'ningbo', 'wenzhou', 'jiaxing', 'shaoxing', 'lishui', 'huzhou', 'taizhou', 'zhoushan', 'quzhou'] },
  { name: 'anhui', cities: ['hefei', 'maanshan', 'bangbu', 'huangshan', 'wuhu', 'huainan', 'tongling', 'fuyang', 'xuancheng', 'anqing'] },
  { name: 'fujian', cities: ['fuzhou', 'xiamen', 'quanzhou', 'zhangzhou', 'nanping', 'longyan', 'putian', 'sanming', 'ningde'] },
  { name: 'jiangxi', cities: ['nanchang', 'jingdezhen', 'shangrao', 'pingxiang', 'jiujiang', 'jian', 'yichun', 'yingtan', 'xinyu', 'ganzhou'] },
  { name: 'shandong', cities: ['qingdao', 'jinan', 'zibo', 'yantai', 'taian', 'linyi', 'rizhao', 'dezhou', 'weihai', 'dongying', 'heze', 'jining', 'weifang', 'zaozhuang', 'liaocheng'] },
  { name: 'henan', cities: ['zhengzhou', 'luoyang', 'kaifeng', 'pingdingshan', 'puyang', 'anyang', 'xuchang', 'nanyang', 'xinyang', 'zhoukou', 'xinxiang', 'jiaozuo', 'sanmenxia', 'shangqiu'] },
  { name: 'hubei', cities: ['wuhan', 'xiangfan', 'xiaogan', 'shiyan', 'jingzhou', 'huangshi', 'yichang', 'huanggang', 'enshi', 'ezhou', 'jianghan', 'suizao', 'jingsha', 'xianning'] },
  { name: 'hunan', cities: ['changsha', 'xiangtan', 'yueyang', 'zhuzhou', 'huaihua', 'yongzhou', 'yiyang', 'zhangjiajie', 'changde', 'hengyang', 'xiangxi', 'shaoyang', 'loudi', 'chenzhou'] },
  { name: 'guangdong', cities: ['guangzhou', 'shenzhen', 'dongwan', 'foshan', 'zhuhai', 'shantou', 'shaoguan', 'jiangmen', 'meizhou', 'jieyang', 'zhongshan', 'heyuan', 'huizhou', 'maoming', 'zhanjiang', 'yangjiang', 'chaozhou', 'yunfu', 'shanwei', 'chaoyang', 'zhaoqing', 'shunde', 'qingyuan'] },
  { name: 'guangxi', cities: ['nanning', 'guilin', 'liuzhou', 'wuzhou', 'laibin', 'guigang', 'yulin', 'hezhou'] },
  { name: 'hainan', cities: ['haikou', 'sanya'] },
  { name: 'zhongqing', cities: ['yuzhong', 'dadukou', 'jiangbei', 'shapingba', 'jiulongpo', 'nanan', 'beibei', 'wansheng', 'shuangqiao', 'yubei', 'banan', 'wanzhou', 'fuling', 'qianjiang', 'changshou'] },
  { name: 'sichuan', cities: ['chengdou', 'dazhou', 'nanchong', 'leshan', 'mianyang', 'deyang', 'najiang', 'suining', 'yibin', 'bazhong', 'zigong', 'kangding', 'panzhihua'] },
  { name: 'guizhou', cities: ['guiyang', 'zunyi', 'anshun', 'qianxinan', 'douyun'] },
  { name: 'yunnan', cities: ['kunming', 'lijiang', 'zhaotong', 'yuxi', 'lincang', 'wenshan', 'honghe', 'chuxiong', 'dali'] },
  { name: 'xicang', cities: ['lasa', 'linzhi', 'rikaze', 'changdou'] },
  { name: 'shanxi', cities: ['xian', 'xianyang', 'yanan', 'hanzhong', 'yulin', 'shangnan', 'lueyang', 'yijun', 'linyou', 'baihe'] },
  { name: 'gansu', cities: ['lanzhou', 'jinchang', 'tianshui', 'wuwei', 'zhangye', 'pingliang', 'jiuquan'] },
  { name: 'qinghai', cities: ['huangnan', 'hainan', 'xining', 'haidong', 'haixi', 'haibei', 'guoluo', 'yushu'] },
  { name: 'ningxia', cities: ['yinchuan', 'wuzhong'] },
  { name: 'xinjiang', cities: ['wulumuqi', 'hami', 'kashi', 'bayinguoleng', 'changji', 'yili', 'aletai', 'kelamayi', 'boertala'] },
  { name: 'xianggang', cities: ['zhongxiqu', 'wanziqu', 'dongqu', 'nanqu', 'jiulong-youjianwangqu', 'jiulong-shenshuibuqu', 'jiulong-jiulongchengqu', 'jiulong-huangdaxianqu', 'jiulong-guantangqu', 'xinjie-beiqu', 'xinjie-dapuqu', 'xinjie-shatianqu', 'xinjie-xigongqu', 'xinjie-quanwanqu', 'xinjie-tunmenqu', 'xinjie-yuanlangqu', 'xinjie-kuiqingqu', 'xinjie-lidaoqu'] },
  { name: 'aomen', cities: ['huadimatangqu', 'shenganduonitangqu', 'datangqu', 'wangdetangqu', 'fengshuntangqu', 'jiamotangqu', 'shengfangjigetangqu', 'ludangcheng'] }];
var province2 = [{ name: '北京', cities: ['西城', '东城', '崇文', '宣武', '朝阳', '海淀', '丰台', '石景山', '门头沟', '房山', '通州', '顺义', '大兴', '昌平', '平谷', '怀柔', '密云', '延庆'] },
  { name: '天津', cities: ['青羊', '河东', '河西', '南开', '河北', '红桥', '塘沽', '汉沽', '大港', '东丽', '西青', '北辰', '津南', '武清', '宝坻', '静海', '宁河', '蓟县', '开发区'] },
  { name: '河北', cities: ['石家庄', '秦皇岛', '廊坊', '保定', '邯郸', '唐山', '邢台', '衡水', '张家口', '承德', '沧州', '衡水'] },
  { name: '山西', cities: ['太原', '大同', '长治', '晋中', '阳泉', '朔州', '运城', '临汾'] },
  { name: '内蒙古', cities: ['呼和浩特', '赤峰', '通辽', '锡林郭勒', '兴安'] },
  { name: '辽宁', cities: ['大连', '沈阳', '鞍山', '抚顺', '营口', '锦州', '丹东', '朝阳', '辽阳', '阜新', '铁岭', '盘锦', '本溪', '葫芦岛'] },
  { name: '吉林', cities: ['长春', '吉林', '四平', '辽源', '通化', '延吉', '白城', '辽源', '松原', '临江', '珲春'] },
  { name: '黑龙江', cities: ['哈尔滨', '齐齐哈尔', '大庆', '牡丹江', '鹤岗', '佳木斯', '绥化'] },
  { name: '上海', cities: ['浦东', '杨浦', '徐汇', '静安', '卢湾', '黄浦', '普陀', '闸北', '虹口', '长宁', '宝山', '闵行', '嘉定', '金山', '松江', '青浦', '崇明', '奉贤', '南汇'] },
  { name: '江苏', cities: ['南京', '苏州', '无锡', '常州', '扬州', '徐州', '南通', '镇江', '泰州', '淮安', '连云港', '宿迁', '盐城', '淮阴', '沐阳', '张家港'] },
  { name: '浙江', cities: ['杭州', '金华', '宁波', '温州', '嘉兴', '绍兴', '丽水', '湖州', '台州', '舟山', '衢州'] },
  { name: '安徽', cities: ['合肥', '马鞍山', '蚌埠', '黄山', '芜湖', '淮南', '铜陵', '阜阳', '宣城', '安庆'] },
  { name: '福建', cities: ['福州', '厦门', '泉州', '漳州', '南平', '龙岩', '莆田', '三明', '宁德'] },
  { name: '江西', cities: ['南昌', '景德镇', '上饶', '萍乡', '九江', '吉安', '宜春', '鹰潭', '新余', '赣州'] },
  { name: '山东', cities: ['青岛', '济南', '淄博', '烟台', '泰安', '临沂', '日照', '德州', '威海', '东营', '荷泽', '济宁', '潍坊', '枣庄', '聊城'] },
  { name: '河南', cities: ['郑州', '洛阳', '开封', '平顶山', '濮阳', '安阳', '许昌', '南阳', '信阳', '周口', '新乡', '焦作', '三门峡', '商丘'] },
  { name: '湖北', cities: ['武汉', '襄樊', '孝感', '十堰', '荆州', '黄石', '宜昌', '黄冈', '恩施', '鄂州', '江汉', '随枣', '荆沙', '咸宁'] },
  { name: '湖南', cities: ['长沙', '湘潭', '岳阳', '株洲', '怀化', '永州', '益阳', '张家界', '常德', '衡阳', '湘西', '邵阳', '娄底', '郴州'] },
  { name: '广东', cities: ['广州', '深圳', '东莞', '佛山', '珠海', '汕头', '韶关', '江门', '梅州', '揭阳', '中山', '河源', '惠州', '茂名', '湛江', '阳江', '潮州', '云浮', '汕尾', '潮阳', '肇庆', '顺德', '清远'] },
  { name: '广西', cities: ['南宁', '桂林', '柳州', '梧州', '来宾', '贵港', '玉林', '贺州'] },
  { name: '海南', cities: ['海口', '三亚'] },
  { name: '重庆', cities: ['渝中', '大渡口', '江北', '沙坪坝', '九龙坡', '南岸', '北碚', '万盛', '双桥', '渝北', '巴南', '万州', '涪陵', '黔江', '长寿'] },
  { name: '四川', cities: ['成都', '达州', '南充', '乐山', '绵阳', '德阳', '内江', '遂宁', '宜宾', '巴中', '自贡', '康定', '攀枝花'] },
  { name: '贵州', cities: ['贵阳', '遵义', '安顺', '黔西南', '都匀'] },
  { name: '云南', cities: ['昆明', '丽江', '昭通', '玉溪', '临沧', '文山', '红河', '楚雄', '大理'] },
  { name: '西藏', cities: ['拉萨', '林芝', '日喀则', '昌都'] },
  { name: '陕西', cities: ['西安', '咸阳', '延安', '汉中', '榆林', '商南', '略阳', '宜君', '麟游', '白河'] },
  { name: '甘肃', cities: ['兰州', '金昌', '天水', '武威', '张掖', '平凉', '酒泉'] },
  { name: '青海', cities: ['黄南', '海南', '西宁', '海东', '海西', '海北', '果洛', '玉树'] },
  { name: '宁夏', cities: ['银川', '吴忠'] },
  { name: '新疆', cities: ['乌鲁木齐', '哈密', '喀什', '巴音郭楞', '昌吉', '伊犁', '阿勒泰', '克拉玛依', '博尔塔拉'] },
  { name: '香港', cities: ['中西区', '湾仔区', '东区', '南区', '九龙-油尖旺区', '九龙-深水埗区', '九龙-九龙城区', '九龙-黄大仙区', '九龙-观塘区', '新界-北区', '新界-大埔区', '新界-沙田区', '新界-西贡区', '新界-荃湾区', '新界-屯门区', '新界-元朗区', '新界-葵青区', '新界-离岛区'] },
  { name: '澳门', cities: ['花地玛堂区', '圣安多尼堂区', '大堂区', '望德堂区', '风顺堂区', '嘉模堂区', '圣方济各堂区', '路氹城'] }];
/**
 * 根据省市的拼音获取对应的中文
 * @param strs
 * @returns {*}
 */
global.get_location = (strs) => {
  const str = strs.toLowerCase();
  for (var i = 0; i < province.length; i++) {
    if (str == province[i].name) {
      return province2[i].name;
      // break;
    }
    for (var u = 0; u < province[i].cities.length; u++) {
      if (str == province[i].cities[u]) {
        return province2[i].cities[u];
        // break;
      }
    }
  }
  return '火星人';
};
/**
 * 判断手机号码是否合法
 * @param tel
 * @returns {boolean}
 */
global.is_phone = (tel) => {
  var reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
  if (!reg.test(tel)) {
    return false;
  }
  return true;
};
/**
 * 产生指定长度的随机数
 * @param len 指定长度
 * @returns {string}
 */
global.make_code = (len) => {
  var rnd = '';
  for (var i = 0; i < len; i++) { rnd += Math.floor(Math.random() * 10) }
  return rnd;
};
/**
 * 删除数组指定元素
 * @param arr
 * @param val
 */
global.removeByValue = (arr, val) => {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      arr.splice(i, 1);
      break;
    }
  }
};
global.get_nature_name = async(id) => {
  const name = await think.model('nature').get_name(id);
  return name;
};
