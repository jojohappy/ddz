var Qcloud = require('./qcloudapi');
var DICT = {
  '新浪': {
    project: 'sina',
    url: 'http://www.sina.com.cn'
  },
  '苹果': {
    project: 'apple',
    url: 'http://www.apple.com',
  },
  'b站': {
    project: 'b-site',
    url: 'http://www.bilibili.com',
  },
  'b占': {
    project: 'b-site',
    url: 'http://www.bilibili.com',
  },
  '饿了么': {
    project: 'eleme',
    url: 'http://www.ele.me',
  },
  '饿了': {
    project: 'eleme',
    url: 'http://www.ele.me',
  },
  '淘宝': {
    project: 'taobao',
    url: 'http://taobao.com',
  },
  '知乎': {
    project: 'zhihu',
    url: 'http://www.zhihu.com',
  },
  '膜拜': {
    project: 'mobike',
    url: 'http://mobike.com',
  },
  '微博': {
    project: 'weibo',
    url: 'http://weibo.com',
  }
};

module.exports = {
  analysis: function(content, cb) {
    Qcloud.lexicalAnalysis(content, function(error, data) {
      var v = null;
      var site = null;
      var keys = Object.keys(DICT);
      if (0 !== data.code) {
        return cb(data.message);
      }

      data.tokens.forEach(function(w) {
        if (-1 !== '开'.indexOf(w.word) || -1 !== '创建'.indexOf(w.word)) {
          v = w;
        }
        if (-1 !== keys.indexOf(w.word)) {
          site = DICT[w.word];
        }
      });
      if (!v || ! site) {
        return cb('我听不懂你在说什么');
      }
      return cb(null, site);
    });
  }
};