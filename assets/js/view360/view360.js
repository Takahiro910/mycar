/*!*
 * jQuery 360view
 * Version 0.0.1
 *
 * 360°viewプラグイン
 */
 
jQuery(window).on("load",function(){
    (function($) {
        // プラグイン定義
        $.fn.view360 = function($_params) {
            // 1.デフォルト値を準備
            var $_defs = {
                frames     : 24,                     //読込画像枚数
                regexp     : './images/image##.jpg', //読込画像パス
                breakpoint : 2,                      //ブロックに対しての回転数
            };

            // 2.デフォルト値に実引数をマージ
            var $_config = $.extend({}, $_defs, $_params);

            // 3.実行処理
            this.each(function(){
                // 変数定義
                var $_self       = $(this),
                    $_src        = $_self.attr('src'),
                    $_image      = [],
                    $_frames     = $_config.frames,
                    $_width      = $_self.width(),
                    $_breakpoint = $_width / $_config.breakpoint / $_frames,
                    $_match      = $_config.regexp.match(/#+/gm)[0],
                    $_zeroFill   = $_match.match(/#/gm).length,
                    $_zeroText   = $_match.replace(/#/g,'0').slice(1),
                    $_replace    = $_match.replace(/#/g,'\\d'),
                    $_regexp     =  new RegExp($_config.regexp.replace($_match,'(' + $_replace + ')')),
                    $_startX     = 0,
                    $_startY     = 0,
                    $_startImage = parseInt($_self.attr('src').match($_regexp)[1]),
                    $_mousedown  = false,
                    $_content    = $('<div class="view360content"></div>'),
                    $_dragArea   = $('<div class="dragArea"></div>');

                // 要素追加
                $_content.append($_dragArea);
                $_self.after($_content);
                $_content.append($_self);

                for(var $i=0;$i < $_frames;$i++){
                    $_image[$i] = new Image();
                    $_image[$i].src = $_config.regexp.replace($_match,($_zeroText + ($i + 1)).slice(-$_zeroFill));
                    if($_frames == ($i + 1)){
                        showView360(
                            $_self,
                            $_frames,
                            $_width,
                            $_breakpoint,
                            $_regexp,
                            $_startX,
                            $_startY,
                            $_startImage,
                            $_mousedown,
                            $_content,
                            $_dragArea,
                            $_zeroFill,
                            $_zeroText,
                            $_match
                        );
                    }
                }
            });

            // 関数定義
            function showView360($_self,$_frames,$_width,$_breakpoint,$_regexp,$_startX,$_startY,$_startImage,$_mousedown,$_content,$_dragArea,$_zeroFill,$_zeroText,$_match){
                $_content.addClass('view360-reel');
                $_dragArea.mousedown(function($_event){
                    $_content.addClass('mousedown');
                    $_mousedown  = true;
                    $_width      = $_content.width();
                    $_breakpoint = $_width / $_config.breakpoint / $_frames;
                    $_startX     = $_event.offsetX;
                    $_startY     = $_event.offsetY;
                    $_startImage = parseInt($_self.attr('src').match($_regexp)[1]);
                }).mousemove(function($_event){
                    if($_mousedown){
                        //console.log('MOVE X:' + $_event.offsetX + '  Y:' + $_event.offsetY);
                        var $_changeImage,
                            $_nowImage = parseInt($_self.attr('src').match($_regexp)[1]),
                            $_absImage    = Math.floor(Math.abs($_startX - $_event.offsetX) / $_breakpoint),
                            $_changeImage;
                        if($_startX > $_event.offsetX){
                            $_changeImage = ($_startImage - $_absImage) % $_frames;
                            if($_changeImage < 1){
                                $_changeImage = $_frames + $_changeImage;
                            }
                        }else{
                            $_changeImage = ($_startImage + $_absImage) % $_frames;
                            if($_changeImage < 1){
                                $_changeImage = $_frames + $_changeImage;
                            }
                        }
                        if($_changeImage != $_nowImage){
                            $_self.queue(function(){
                                var $src = $_config.regexp.replace($_match,($_zeroText + $_changeImage).slice(-$_zeroFill));
                                $(this).attr('data-index',$_changeImage).attr('src',$src);
                                $(this).dequeue();
                            })
                        }
                    }
                }).mouseup(function($_event){
                    $_mousedown  = false;
                    $_content.removeClass('mousedown');
                }).bind('touchstart',function($_event){
                    $_content.addClass('mousedown');
                    $_mousedown  = true;
                    $_width      = $_content.width();
                    $_breakpoint = $_width / $_config.breakpoint / $_frames;
                    $_startX     = $_event.changedTouches[0].pageX;
                    $_startY     = $_event.changedTouches[0].pageY;
                    $_startImage = parseInt($_self.attr('src').match($_regexp)[1]);
                }).bind('touchmove',function($_event){
                    if($_mousedown){
                        //console.log('MOVE X:' + $_event.changedTouches[0].pageX + '  Y:' + $_event.changedTouches[0].pageY);
                        if(Math.abs($_startX - $_event.changedTouches[0].pageX) > $_breakpoint){
                            var $_absImage    = Math.floor(Math.abs($_startX - $_event.changedTouches[0].pageX) / $_breakpoint);
                            var $_changeImage;
                            if($_startX > $_event.changedTouches[0].pageX){
                                $_changeImage = ($_startImage - $_absImage) % $_frames;
                                if($_changeImage < 1){
                                    $_changeImage = $_frames + $_changeImage;
                                }
                            }else{
                                $_changeImage = ($_startImage + $_absImage) % $_frames;
                                if($_changeImage < 1){
                                    $_changeImage = $_frames + $_changeImage;
                                }
                            }
                            if($_changeImage != $_startImage){
                                $_self.attr('data-index',$_changeImage);
                                var $src = $_config.regexp.replace($_match,($_zeroText + $_changeImage).slice(-$_zeroFill));
                                $_self.attr('src',$src);
                            }
                        }
                    }
                }).bind('touchend',function($_event){
                    $_mousedown  = false;
                    $_content.removeClass('mousedown');
                });
            }

            return this;
        };

        // 関数定義
        function isEmpty($_val) {
            if (!$_val) {
                if (!(($_val === 0) || ($_val === false))) {
                    return true;
                }
            }
            return false;
        }

        if($('img[data-view360]').length){
            $('[data-view360]').each(function(){
                var $_option = {};
                if(!isEmpty($(this).attr('data-frames'))){
                    $_option.frames = parseInt($(this).attr('data-frames'));
                }
                if(!isEmpty($(this).attr('data-regexp'))){
                    $_option.regexp = $(this).attr('data-regexp');
                }
                if(!isEmpty($(this).attr('data-breakpoint'))){
                    $_option.breakpoint = parseInt($(this).attr('data-breakpoint'));
                }
                $(this).view360($_option);
            });
        }
    })(jQuery);
});
