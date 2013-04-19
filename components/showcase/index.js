KISSY.add("components/showcase/index", function(S, Brick, Pagelet) {
    function ShowCase() {
        ShowCase.superclass.constructor.apply(this, arguments);
    }
    ShowCase.ATTRS = {
        path : {
            value : ''
        },
        mod : {
            value : ''
        },
        eltag : {
            value : ''
        },
        place : {
            value : ''
        }
    };
    S.extend(ShowCase, Brick, {
        initialize: function() {
            var self = this;
            self.pagelet = null;
            var mod = self.get('mod');
            if(!mod){
                self._renderUI(self.get('path'));
            }else{
                self._sliderUI();
            }   
        },
        _renderUI : function(path,target){
            var self = this;
            if(path){
                S.ajax({
                    url : path,
                    dataType : 'html',
                    method : 'get',
                    success : function(data){
                        var el = self.get('place');
                        el = (el && typeof el === 'string') ? S.one(el) : self.get('el');
                        if(el){
                            el.html('');
                            el.html(data);
                            self.pagelet = new Pagelet({
                                 tmpl: '#'+S.one(el).attr('id')
                            });
                            if(self.get('transition')){
                                self.pagelet.ready(function(){
                                    self._transition(target,self.get('el'),el);
                                });
                            }
                        }
                    }
                });
            }   
        },
        _sliderUI : function(){
            var self = this;
            var eltag = self.get('eltag');
            var el = self.get('el');
            if(el && eltag){
                var all = el.all(eltag);
                S.each(all, function(n){
                    n = S.one(n);
                    if(n && n.attr('path')){
                        var path = n.attr('path');
                        n.on('click',function(){
                            self._renderUI(path,n);
                        });
                    }
                });
            }
        },
        // 切换2个div，t--点击的元素 l--展示组件列表的div c--是组件展示div
        _transition : function(t,l,c){
            var self = this;
            //动画类型，一般标识动画的展现效果。
            var transmode = self.get('transtype') || 'easeOut';
            var clonet = S.DOM.create('<div></div>');
            l.parent().append(clonet);
            clonet = S.one(clonet);
            clonet.addClass('font-Arch');
            clonet.html(t.html());
            clonet.css({
                position:'absolute',
                top:'0px',
                left:'0px',
                'z-index': 3,
                width: '150px'
            });
            
            var anim = S.Anim(l,
                {
                    'opacity': '0'
                },1,
                transmode,function(){
                    l.hide();
            });
            anim.run();
        }
    });

    return ShowCase;
}, {
    requires: ["brix/core/brick","brix/core/pagelet"]
});