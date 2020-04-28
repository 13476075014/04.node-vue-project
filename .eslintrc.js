module.exports = {
  "env": {
      "browser": true,
      "commonjs": true,
      "es6": true,
      "node": true // 启动node环境
  },
  "extends": "eslint:recommended",
  "globals": {
      "Atomics": "readonly",
      "SharedArrayBuffer": "readonly"
  },
  plugins: [
      // 'ejs'
  ],
  "parserOptions": {
      "ecmaVersion": 2018,
      sourceType: 'module'
  },
  "rules": {
      "no-console": 0,
      'eqeqeq': 0,
      "no-unused-vars":1, //警告声明了变量但是没有使用过
      "no-extra-semi":0, //可以用分号
      "no-inner-declarations":0,//可以在内部声明函数
  }
};