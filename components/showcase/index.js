KISSY.add("components/showcase/index", function(S, Brick, Pagelet) {
    function ShowCase() {
        ShowCase.superclass.constructor.apply(this, arguments);
    }
    ShowCase.ATTRS = {
        // 需要获取的页面路径
        path : {
            value : ''
        },
        basepath : {
            value : ''
        },
        //渲染完页面需要什么样的替换方式
        // 默认为 ‘easeNone’ , 动画平滑函数, 
        // 可取值 “easeNone”,”easeIn”,”easeOut”,”easeBoth”,”easeInStrong”, 
        // “easeOutStrong”,”easeBothStrong”,”elasticIn”,”elasticOut”, 
        // “elasticBoth”,”backIn”,”backOut”,”backBoth”, “bounceIn”,”bounceOut”,
        // ”bounceBoth”. 
        mod : {
            value : ''
        },
        //需要绑定动作的元素tag
        //用来出发click事件
        eltag : {
            value : ''
        },
        //ajax获取页面代码后渲染的位置
        place : {
            value : ''
        },
        //动画还原触发元素
        goback : {
            value : ''
        }
    };
    S.extend(ShowCase, Brick, {
        initialize: function() {
            var self = this;
            self.pagelet = null;
            var mod = self.get('mod');
            window.GALLERY = [];
            if(!mod){
                self._renderUI(self.get('path'));
            }else if(mod==='S'){
                self._sliderUI();
            }else if(mod==='M'){
                self._menu();
            }   
        },
        _renderUI : function(path,cb){
            var self = this;
            self._destroy();
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
                            var script = '';
                            if(data.indexOf('<script type="text/javascript">') > -1){
                                script = data.split('<script type="text/javascript">')[1];
                                script = script.split('</script>')[0];
                            }
                            el.html(data);
                            var pid = S.one(el).attr('id');
                            self.pagelet = new Pagelet({
                                 tmpl: '#'+pid
                            });
                            if(typeof hljs !== 'undefined' && hljs){
                                var pres = S.all('pre');
                                hljs.initHighlighting();
                                S.each(pres,function(n){
                                    var code = S.one(n).one('code');
                                    var la = code.attr('language');
                                    if(la){
                                        code.addClass(la);
                                        var lacode = hljs.highlight(la,code.html());
                                        code.html(lacode.value);
                                    }
                                });
                                //hljs.initHighlighting();
                            }
                            if(script){
                                var F = new Function(script);
                                F.call();
                            }
                            if(cb){
                                cb();
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
                        n.on('click',function(e){
                            e.halt();
                            self._renderIframe(path,function(){
                                if(self.get('transition')){
                                    self._transition(n,self.get('el'));
                                }
                            });
                        });
                    }
                });
            }
            var gb = self.get('goback');
            if(gb){
                gb = S.one(gb);
                gb.detach('click');
                gb.on('click',function(e){
                    e.halt();
                    self._destroy();
                    self._transitionback(gb,S.one(self.get('el')),S.one(self.get('place')));
                });
            }
        },
        _renderIframe : function(path,cb){
            var self = this;
            if(path){
                var place = S.one(self.get('place'));
                var ifr = document.getElementById("demoiframe");
                ifr.src = path;
                ifr.height = 0;
                if(!self.timer){
                    self._adjustHeight(ifr);
                    
                    S.one(ifr).on('load', function(e) {
                        self._adjustHeight(e.currentTarget);
                    });

                    self.timer = setInterval(function() {
                        self._adjustHeight(ifr);
                    }, 200);

                    window.onbeforeunload = function() {
                        clearInterval(timer);
                        self.timer = null;
                    }
                }
            } 
            if(cb){
                cb();
            }  
        },
        _adjustHeight : function(iframe) {
            var DOM = KISSY.DOM,
                win = iframe.contentWindow,
                doc = win.document,
                height;
            try {
                height = DOM.outerHeight(doc, true);
                if (iframe.height !== height) {
                    iframe.height = height;
                    iframe.width ='100%';
                }
            }
            catch (e) {
                if (window.console && console.log) {
                    console.log(e.message);
                }
            }
        },
        //销毁页面控件。
        _destroy : function(){
            if(window.GALLERY && window.GALLERY.length){
                for (var i = GALLERY.length - 1; i >= 0; i--) {
                    var c = GALLERY[i];
                    c.destroy();
                };
            }
        },
        // 切换2个div，t--点击的元素 l--展示组件列表的div c--是组件展示div
        _transition : function(t,l){
            var self = this;
            var gb = self.get('goback');
            if(gb) S.one(gb).show();
            //动画类型，一般标识动画的展现效果。
            var transmode = self.get('transtype') || 'easeOut';
            var clonet = S.DOM.create('<div id="clonecomp"></div>');
            l.parent().append(clonet);
            clonet = S.one(clonet);
            clonet.addClass('font-Arch');
            clonet.html(t.html()+'<a href="'+t.next('a').attr('href')+'" class="api">API</a>');
            clonet.css({
                position:'absolute',
                top:'-37px',
                left:'45px',
                'z-index': 0,
                width: '200px'
            });
            var anim = S.Anim(l,{
                    'opacity': '0'
                },0.6,transmode,function(){
                    l.hide();
                    anim2.run();
                }
            );
            var place = S.one(self.get('place'));
            place.show();
            var anim2 = S.Anim(place,{
                'opacity': '1'
            },0.6,'easeIn',function(){
                place.show();
            });
            anim.run();
        },
        _transitionback : function(n,l,c){
            var temp = S.one('#clonecomp');
            if(temp) temp.remove();
            n.hide();
            var anim0 = S.Anim(c,{
                'opacity' :  '0'
            },0.6,'easeOut',function(){
                c.hide();
                // c.css('left','0px');
                c.css('opacity','0');
            });
            var anim = S.Anim(l,{
                'opacity': '1'
            },0.8,'easeIn',function(){
                l.show();
            });
            anim0.run();
            anim.run();
        },
        _menu : function(){
            var self = this;
            var eltag = self.get('eltag');
            var el = self.get('el');
            var defaul = '';
            var ha = window.location.hash; 
            if(ha){
                var h = window.location.hash;
                h = h.split('#!')[1];
                if(h.indexOf('&')>-1){
                    h = h.split('&')[0];
                }
                var base = self.get('basepath');
                if(base && h){
                    defaul = base+h+'.html';
                }
            }
            self._renderUI(defaul);
            if(el && eltag){
                var all = el.all(eltag);
                S.each(all, function(n){
                    n = S.one(n);
                    if(n.attr('href')===ha){
                        n.parent().addClass('current');
                    }
                    n.on('click',function(e){
                        var tar = e.target;
                        var cur = el.one('.current');
                        if(cur){
                            cur.removeClass('current');
                        }
                        if(tar){
                            S.one(tar).parent().addClass('current');
                        }
                    });
                });
            }
            S.one(window).on('hashchange', function() {
                var h = window.location.hash;
                h = h.split('#!')[1];
                if(h.indexOf('&')>-1){
                    h = h.split('&')[0];
                }
                var base = self.get('basepath');
                self._renderUI(base+h+'.html');
            });
        }
    });

    return ShowCase;
}, {
    requires: ["brix/core/brick","brix/core/pagelet"]
});