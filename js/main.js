/**
 * Created by user_kevin on 17/6/11.
 */
var game =new Phaser.Game(240,400,Phaser.CANVAS,'game');
game.States = {};
game.States.boot = function () {
    this.preload = function () {
        game.load.image('loading', 'res/preloader.gif');
    };
    this.create = function () {
        game.state.start('preload');
    };
};
game.States.preload = function () {
    this.preload = function () {
        var preload_sprite = game.add.image(10,game.height-60,'loading');
        game.load.setPreloadSprite(preload_sprite);
        game.load.image('background','res/bg.png');
        game.load.image('btnRestart','res/btn-restart.png');
        game.load.image('btnStart','res/btn-start.png');
        game.load.image('btnTryagain','res/btn-tryagain.png');
        game.load.image('logo','res/logo.png');
    };
    this.create = function () {
        game.state.start('main');
    };
};
game.States.main = function () {
    this.create = function () {
        game.add.tileSprite(0, 0, game.width, game.height, 'background');
        var logo = game.add.image(0, 0, 'logo');
        logo.reset((game.width - logo.width) / 2, (game.height - logo.height) / 2 - 50);
        var startBtn = game.add.button(0, 0, 'btnStart', this.startGame, this);
        startBtn.reset((game.width - startBtn.width) / 2, (game.height - startBtn.height) / 2 + 100);
    };
    this.startGame = function () {
        game.state.start('start');
    };
};
game.States.start = function () {
    this.create = function () {
		game.add.tileSprite(0,0,game.width,game.height,'background');
		this.score = 0;
		this.best = 0;
		var title_style = {
		    font:'bold 12px Arial',
            fill:'#4db3b3',
            boundsAlignH:'center'
        };
        var score_style = {
		    font:'bold 20px Arial',
            fill:'#ffffff',
            boundsAlignH:'center'
        };
        /**
         * 分数
         * */
        var score_sprite = game.add.sprite(10,10);
        var score_graphics = game.add.graphics(0,0);
        score_graphics.lineStyle(5,0xa1c5c5);
        score_graphics.beginFill(0x308C8C);
        score_graphics.drawRoundedRect(0,0,70,50,10);
        score_graphics.endFill();
        score_sprite.addChild(score_graphics);
        var score_title = game.add.text(0,5,'SCORE',title_style);
        score_title.setTextBounds(0,0,70,50);
        score_sprite.addChild(score_title);
        this.scoreText = game.add.text(0,20,this.score,score_style);
        this.scoreText.setTextBounds(0,0,70,50);
        score_sprite.addChild(this.scoreText);
        /**
         * 最高分数
         * */
        var bestSprite = game.add.sprite(90,10);
        var bestGraphics = game.add.graphics(0,0);
        bestGraphics.lineStyle(5,0xA1C5C5);
        bestGraphics.beginFill(0x308C8C);
        bestGraphics.drawRoundedRect(0,0,70,50,10);
        bestGraphics.endFill();
        bestSprite.addChild(bestGraphics);
        var bestTitle = game.add.text(0,5,'BEST',title_style);
        bestTitle.setTextBounds(0,0,70,50);
        bestSprite.addChild(bestTitle);
        this.bestText = game.add.text(0,20,this.best,score_style);
        this.bestText.setTextBounds(0,0,70,50);
        bestSprite.addChild(this.bestText);
        /**
         * 游戏区域 画布
         * */
        var mainAriaSprite = game.add.sprite(10,80);
        var mainAriaSpriteGraphics = game.add.graphics(0,0);
        mainAriaSpriteGraphics.beginFill(0xADA79A,0.5);
        mainAriaSpriteGraphics.drawRoundedRect(0,0,220,220,10);
        mainAriaSpriteGraphics.endFill();
        mainAriaSprite.addChild(mainAriaSpriteGraphics);
        /**
         * check swipe
         * */
        this.DirectionWithMove = game.input.keyboard.createCursorKeys();
        /**
         * 不同数字不同的颜色
         * */
        this.colors = {
            2: 0x49B4B4,
            4: 0x4DB574,
            8: 0x78B450,
            16: 0xC4C362,
            32: 0xCEA346,
            64: 0xDD8758,
            128: 0xBF71B3,
            256: 0x9F71BF,
            512: 0x7183BF,
            1024: 0x71BFAF,
            2048: 0xFF7C80
        };
        /**
         * 初始化
         * */
        this.rerunGame();
    };
    this.update = function () {
        if (this.canMove){
            if (this.DirectionWithMove.left.isDown){
                console.log('left');
                this.swipeLeft();
            }else if (this.DirectionWithMove.right.isDown){
                console.log('right');
                this.swipeRight();
            }else if (this.DirectionWithMove.up.isDown){
                console.log('up');
                this.swipeUp();
            }else if (this.DirectionWithMove.down.isDown){
                console.log('bottom');
                this.swipeDown();
            }
        }
    };
    this.rerunGame = function () {
        /**
         * 重来
         * */
        this.score = 0;
        this.scoreText.text = this.score;
        if (this.array){
            for (var i = 0; i<4;i++){
                for (var j = 0; j<4;j++){
                    if (this.array[i][j].sprite){
                        this.array[i][j].sprite.kill();
                    }
                }
            }
        }

        /**
         * 一个 4*4 的数组
         * */
        this.array = [];
        for (var i = 0; i<4;i++){
            this.array[i] = [];
            for (var j=0;j<4;j++){
                this.array[i][j] = {}
                this.array[i][j].value = 0;
                this.array[i][j].x = i;
                this.array[i][j].y = j;
            }
        }
        /**
         * 是否响应swipe
         * */
        this.canSwipe = true;
        /** 开始游戏 - 创建方块 */
        this.generateSquare();
    };
    /**
     * 随机创建一个方块
     * */
    this.generateSquare = function () {
        console.log('创建一个方块');
        var x = Math.floor(Math.random()*4);
        var y = Math.floor(Math.random()*4);
        while (this.array[x][y].value != 0){
            x = Math.floor(Math.random()*4);
            y = Math.floor(Math.random()*4);
        }
        var value = 2;
        if(Math.random()>0.5){
            value = 4;
        }
        this.placeSquare(x, y, value);
    };
    /**
     * 根据 x,y 值放置一个 值为 value 的方块
     * */
   this.placeSquare = function (x,y,value) {
       var squareStyle = { font: "bold 20px Arial", fill: "#FFFFFF", boundsAlignH: "center", boundsAlignV: "middle" };
       var square = game.add.sprite();
       square.reset(this.transX(x), this.transY(y));
       var squareBackground = game.add.graphics(-45/2, -45/2);
       squareBackground.beginFill(this.colors[value]);
       squareBackground.drawRoundedRect(0, 0, 45, 45, 5);
       squareBackground.endFill();
       square.addChild(squareBackground);
       var squareText = game.add.text(-45/2, -45/2, value, squareStyle);
       squareText.setTextBounds(0, 0, 45, 45);
       square.addChild(squareText);
       this.canMove = false;
       console.log("x = "+x);
       console.log("y = "+y);
       console.log("value = "+value);
       this.array[x][y].value = value;
       this.array[x][y].sprite = square;
       square.anchor.setTo(0.5, 0.5);
       square.scale.setTo(0.0, 0.0);
       var tween = game.add.tween(square.scale).to({x:1.0, y:1.0}, 100, Phaser.Easing.Sinusoidal.InOut, true);
       tween.onComplete.add(function() {
           this.canMove = true;
       }, this);
   };

    // 坐标转换
    this.transX = function(x) {
        return 10+8*(x+1)+x*45+45/2;
    };
    this.transY = function(y) {
        return 80+8*(y+1)+y*45+45/2;
    };

    /**
     *  swipe 检测
     * */
    this.swipeUp = function () {
        this.canMove = false;
        this.canSwipe = false;
        for(var i=0; i<this.array.length; i++) {
            for(var j=1; j<this.array.length; j++) {
                if(this.array[i][j].value != 0) {
                    var index = j-1;
                    while(index > 0 && this.array[i][index].value == 0) {
                        index--;
                    }
                    // 10+8*(x+1)+x*45+45/2;
                    this.squareMoveAndMerge(i, j, this.array[i][index], {x: this.transX(i), y: this.transY(index)},
                        index + 1 != j, this.array[i][index+1], {x: this.transX(i), y: this.transY(index+1)});
                }else{
                    this.canMove = true;
                    console.log('this action run *** *** *** up *** *** ***');
                }
            }
        }
        this.arrayNewNode();
    };
    this.swipeDown = function () {
        this.canMove = false;
        this.canSwipe = false;
        for(var i=0; i<this.array.length; i++) {
            for(var j=this.array.length-2; j>=0; j--) {
                if(this.array[i][j].value != 0) {
                    var index = j+1;
                    while(index < this.array.length-1 && this.array[i][index].value == 0) {
                        index++;
                    }
                    this.squareMoveAndMerge(i, j, this.array[i][index], {x: this.transX(i), y: this.transY(index)},
                        index - 1 != j, this.array[i][index-1], {x: this.transX(i), y: this.transY(index-1)});
                }else{
                    this.canMove = true;
                    console.log('this action run *** *** *** down *** *** ***');
                }
            }
        }
        this.arrayNewNode();
    };
    this.swipeLeft = function () {
        this.canMove = false;
        this.canSwipe = false;
        for(var i=1; i<this.array.length; i++) {
            for(var j=0; j<this.array.length; j++) {
                if(this.array[i][j].value != 0) {
                    var index = i-1;
                    while(index > 0 && this.array[index][j].value == 0) {
                        index--;
                    }
                    this.squareMoveAndMerge(i, j, this.array[index][j], {x: this.transX(index), y: this.transY(j)},
                        index + 1 != i, this.array[index+1][j], {x: this.transX(index+1), y: this.transY(j)});
                }else{
                    this.canMove = true;
                    console.log('this action run *** *** *** left *** *** ***');
                }
            }
        }
        this.arrayNewNode();
    };
    this.swipeRight = function () {
        this.canMove = false;
        this.canSwipe = false;
        for(var i=this.array.length-2; i>=0; i--) {
            for(var j=0; j<this.array.length; j++) {
                if(this.array[i][j].value != 0) {
                    var index = i+1;
                    while(index < this.array.length-1 && this.array[index][j].value == 0) {
                        index++;
                    }
                    this.squareMoveAndMerge(i, j, this.array[index][j], {x: this.transX(index), y: this.transY(j)},
                        index - 1 != i, this.array[index-1][j], {x: this.transX(index-1), y: this.transY(j)});
                }else{
                    this.canMove = true;
                    console.log('this action run *** *** *** right *** *** ***');
                }
            }
        }
        this.arrayNewNode();
    };
    this.arrayNewNode = function () {
        for(var i=0; i<this.array.length; i++) {
            for(var j=0; j<this.array.length; j++) {
                this.array[i][j].newNode = undefined;
            }
        }
    };
    this.squareMoveAndMerge = function (i, j, arrNode, posJson, condition, nextArrNode, nextPosJson) {
        var that = this;
        var duration = 100;
        if (arrNode.value == this.array[i][j].value) {
            arrNode.value = arrNode.value * 2;
            this.array[i][j].value = 0;
            this.score = this.score + arrNode.value;
            this.scoreText.text = this.score;
            if (this.score > this.best) {
                this.best = this.score;
                this.bestText.text = this.best;
            }

            // 渐渐透明后被kill掉
            var t1 = game.add.tween(arrNode.sprite).to({alpha: 0}, duration, Phaser.Easing.Linear.None, true);
            t1.onComplete.add(function () {
                this.sprite.kill();
                that.placeSquare(this.x, this.y, this.value);
                if (!that.canSwipe) {
                    that.canSwipe = true;
                    that.generateSquare();
                }
            }, arrNode);
            var t2 = game.add.tween(this.array[i][j].sprite).to({alpha: 0}, duration, Phaser.Easing.Linear.None, true);
            t2.onComplete.add(function () {
                this.kill();
                if (!that.canSwipe) {
                    that.canSwipe = true;
                    that.generateSquare();
                }
            }, this.array[i][j].sprite);
            game.add.tween(this.array[i][j].sprite).to(posJson, duration, Phaser.Easing.Linear.None, true);
            arrNode.sprite = this.array[i][j].sprite;
            this.array[i][j].sprite = undefined;
        } else if (arrNode.value == 0) {
            arrNode.value = this.array[i][j].value;
            this.array[i][j].value = 0;
            var t = game.add.tween(this.array[i][j].sprite).to(posJson, duration, Phaser.Easing.Linear.None, true);
            t.onComplete.add(function () {
                if (!that.canSwipe) {
                    that.canSwipe = true;
                    that.generateSquare();
                }
            });
            arrNode.sprite = this.array[i][j].sprite;
            this.array[i][j].sprite = undefined;
        } else if (condition) {
            nextArrNode.value = this.array[i][j].value;
            this.array[i][j].value = 0;
            var t = game.add.tween(this.array[i][j].sprite).to(nextPosJson, duration, Phaser.Easing.Linear.None, true);
            t.onComplete.add(function () {
                if (!that.canSwipe) {
                    that.canSwipe = true;
                    that.generateSquare();
                }
            });
            nextArrNode.sprite = this.array[i][j].sprite;
            this.array[i][j].sprite = undefined;
        }
    };
};
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('main',game.States.main);
game.state.add('start',game.States.start)
game.state.start('boot');