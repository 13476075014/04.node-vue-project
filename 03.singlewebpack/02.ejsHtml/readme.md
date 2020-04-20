## 如何实现双语言
* 在配置文件 public/lang下面的en.js配置英文，yd.js配置印地语；
* 页面中使用 <h1 data-lg='lg_index_title'>Home1</h1> 来匹配配置文件 _lg.index.title

### npm start 本地启动，http://localhost:8800/1?language=english 访问英语

### http://localhost:8800/1 默认是印地语