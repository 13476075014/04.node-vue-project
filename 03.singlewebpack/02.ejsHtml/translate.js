const program = require('commander');
const fs = require("fs")
const path = require("path")
function translate_split_keys(val) {
    return val.split('@')
}
program
	.version('1.0.0')
	.option('-t, --translate <type>.<b>', 'translate Something',translate_split_keys)
  .parse(process.argv);


  class google_translate{
    //to_language 实例化的时候传值需要翻译成什么语言
    //json_path 需要被翻译的js文件的地址，里面返回的一个json
    constructor(to_language,json_path){ 
        this.translate = require('google-translate-api') //谷歌翻译的包
        // this.en = require(path.resolve(__dirname,'../../../lang/en.js')) //获取
        this.en = require(json_path) //获取
        this.to_language = to_language
        this.translate_arr = []
        this.json_path = json_path
        this.i=0
        this.init2(this.en,to_language || 'zh-CN') //hi印地语 ; zh-CN中文
    }
    my_translate(language,text,i,callback){ 
        /**
        * @param {需要翻译成什么语言} language
        * @param {需要翻译的文本} text
        */
       setTimeout(()=>{
        this.translate(text, {to: language}).then(res => {
            callback(res.text)
        }).catch(err => {
            console.error(err,'错啦');
        });
       },200*i)
       
   }
   /**
    * @param {要被翻译的json对象} json_obj
    * @param {需要翻译成什么语言} language
    * 一句句的去请求翻译，上面的方法是一次全部请求
    */  
   init2(json_obj,language){
    let _this = this
    for(let item in json_obj){
        ++this.i;
        let i = this.i;
        // let need_item = item;
        // let nned_obj = json_obj
        if(typeof json_obj[item] == "object" && Object.keys(json_obj[item]).length){
            this.init2(json_obj[item],language)
        }else if(item == 'name'){
            json_obj[item] = this.to_language
        }else if(item != 'name'){
             //读完了所有的对象
             this.my_translate(language,json_obj[item],i,function(res){
                //  nned_obj[need_item] = res
                json_obj[item] = res
                 console.log((i/_this.i*100).toFixed(2) + "%")
                 if(item == 'end'){
                    let result = "module.exports =";
                    result += JSON.stringify(json_obj);
                    let result_file_path = _this.json_path.split('/')
                    result_file_path =((result_file_path.slice(0,result_file_path.length-1)).join('/')) + ('/auto_' + _this.to_language + '.js')
                    fs.writeFile(path.resolve(__dirname,result_file_path),result,'utf8',err =>{
                        if(err){
                            console.error("错啦文件生成",err)
                        }else{
                            console.log("成功")
                        }
                     })
                }
             })
        }
    }
}
};

if(program.translate){
    //执行下面命令的时候会触发这个指令，参数通过@分开；
    new google_translate(program.translate[0],path.resolve(program.translate[1]))
}

