function get_lg(){
    var query_lg =  _common.getQuery("language") || 'hindin';
    var _lgs= query_lg == "english" ? _lg_en : _lg_yd;
    return _lgs
};

export var _common = {
    _lg:{},
    initLang:function(node){ //在需要翻译的页面调用这个方法，传父元素，翻译里面的所有内容
        var query_lg =  _common.getQuery("language") || 'hindin'
        var _lg = _common._lg;
        if(query_lg == "english"){
            return false
        }
        var fragments = document.createDocumentFragment();
        var childs = ''
        while(childs=node.firstChild){
            fragments.appendChild(childs)
        }
        [].slice.call(fragments.childNodes).forEach(function(item){
            var nodeAttrs = item.attributes;
            if(item.nodeType == 1 && nodeAttrs && nodeAttrs['data-lg'] && nodeAttrs['data-lg'].value){ //只有dom元素类型且有data-lg属性的需要翻译
                var attr = nodeAttrs['data-lg'].value
                var attr_value = attr.split('_');
                item.innerHTML = _lg[attr_value[1]][attr_value[2]]
            };
            if (item.childNodes && item.childNodes.length) {
                _common.initLang(item);
            }
        });
        node.appendChild(fragments); //在真是元素里面插入文档片段，完成节点的替换翻译
    },
    getQuery(querystr){
        var search = _common.toTrim(location.search.substr(1))
        search = search.split('&')
        var hasIndex = search.findIndex((item,index) =>{
            return item.indexOf(querystr + '=') > -1
        })
        if(hasIndex > -1){
            return search[hasIndex].split('=')[1]
        }else{
            return ''
        }
    
    },
    toTrim(str) {/*空白 */
        return str.replace(/\s/g, '')
    },
}
_common['_lg'] = get_lg(); //初始化翻译的语言的配置需要展示哪种