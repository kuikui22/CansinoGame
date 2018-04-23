/**
 * 路單球的顯示
 * 之後要加入莊對與閒對的圖示(包括起不啟用的判斷)
 * 1.大路路單球,一格一個路單,橫直格中心點每格差28px,第一格起始點為(18, 10)
 *   共 6 * 23 格
 * 2.三路路單球,一格一個路單
 *   三路A,第一格起始點為(12, 3),橫直格中心差19.8px, 共 6 * 27 格
 *   三路B,第一格起始點為(547, 3),橫直格中心差20px, 共 6 * 9 格
 *   三路C,第一格起始點為(12, 123),橫直格中心差20px, 共 3 * 27 格
 * 3.大路九列,一格一個路單,橫直格中心點每格差19.8px,第一格起始點為(10, 5)
 *   共9 * 27格
 * 4.蟑螂路,一格兩個路單,
 *   大眼仔,第一格起始點為(10, 5),橫直格中心差9.9px, 共 6 * 60 格(大格 3*30)
 *   小路,第一格起始點為(10, 64.4),橫直格中心差9.9px, 共 6 * 60 格
 *   蟑螂路,第一格起始點為(10, 123.8),橫直格中心差9.9px, 共 6 * 60 格
 * 5.莊閒問路
 *   大路A(左),第一格起始點為(11, 6),橫直格中心差19px, 共 8 * 10 格
 *   大路B,第一格起始點為(207.5, 7),橫直格中心差14.4px, 共 6 * 32 格
 *   大眼仔,第一格起始點為(206, 94),橫直格中心差7.25px, 共 6 * 32 格
 *   小路,第一格起始點為(206, 137),橫直格中心差7.25px, 共 6 * 32 格
 *   蟑螂路,第一格起始點為(438, 94),橫直格中心差7.25px, 共 6 * 32 格
 */

//大路路單球
function WayBillBall() {
    this.MainNode = new Laya.Sprite();
    this.BallImg =new Laya.Image();
    this.BallNumber =new Laya.Label();
    this.BallPair_P = new Laya.Image();
    this.BallPair_B = new Laya.Image();
    this.TieLine = new Laya.Image();

    this.MainNode.addChild(this.BallImg);
    this.MainNode.addChild(this.BallNumber);
    this.MainNode.addChild(this.TieLine);
    this.MainNode.addChild(this.BallPair_P);
    this.MainNode.addChild(this.BallPair_B);
}

//初始化大路
WayBillBall.prototype.initBig = function() {
    this.MainNode.visible = false;
    this.BallImg.width = 25;
    this.BallImg.height = 25;
    this.BallImg.skin = "";
    this.BallPair_P.skin = "";
    this.BallPair_B.skin = "";
    this.BallNumber.font = "DFFN_Y7"
    this.BallNumber.fontSize = 18;
    this.BallNumber.text = "";
    this.BallNumber.pos(7, 4);
    this.BallPair_P.pos(0, 15);
    this.BallPair_B.pos(15, 15);
};


//設置大路路單球
WayBillBall.prototype.setBellBig = function(color, number, pair) {
    if(color == undefined || number == undefined) {
        this.MainNode.visible = false;
    }else {
        this.MainNode.visible = true;
    }

    //球的顏色
    switch(color) {
        case 1:
            //閒
            this.BallNumber.color = "#ffffff";
            this.BallImg.skin = "way_bill/PLAYER_01.png";           
            break;
        case 2:
            //莊
            this.BallNumber.color = "#ffffff";
            this.BallImg.skin = "way_bill/BANK_01.png";
            break;
        case 3:
            //和
            this.BallNumber.color = "#000000";
            this.BallImg.skin = "way_bill/TIE_01.png";
            break;
        default:
            //無此類型
            this.MainNode.visible = false;
            break;            
    }
    
    //對子
    if(pair != undefined) {
        switch(pair) {
            case 1:
                //閒
                this.BallPair_P.skin = "way_bill/PLAYER-pair_01.png";  
                break;
            case 2:
                //莊
                this.BallPair_B.skin = "way_bill/BANKER-pair_01.png";
                break;
            case 3:
                //和
                this.BallPair_P.skin = "way_bill/PLAYER-pair_01.png";
                this.BallPair_B.skin = "way_bill/BANKER-pair_01.png";
                break;
            default:
                this.BallPair_P.visible = false;
                this.BallPair_B.visible = false;
                break;
        }
    }
    this.BallNumber.text = number.toString();

};

//初始化三路
WayBillBall.prototype.initThree = function() {
    this.MainNode.visible = false;
    this.BallImg.width = 19;
    this.BallImg.height = 19;
    this.BallImg.skin = "";
    this.BallPair_P.skin = "";
    this.BallPair_P.width = 7;
    this.BallPair_P.height = 7;
    this.BallPair_B.skin = "";
    this.BallPair_B.width = 7;
    this.BallPair_B.height = 7;
    this.BallNumber.font = "DFFN_Y7"
    this.BallNumber.fontSize = 15;
    this.BallNumber.text = "";
    this.BallNumber.color = "#ffffff";
    this.BallNumber.pos(5, 2);
    this.BallPair_P.pos(0, 10);
    this.BallPair_B.pos(12, 11);
};

//設置三路路單球
WayBillBall.prototype.setBellThreeA = function(color, number, pair) {
    if(color == undefined || number == undefined) {
        this.MainNode.visible = false;
    }else {
        this.MainNode.visible = true;
    }
    switch(color) {
        case 1:
            this.BallNumber.color = "#ffffff";
            this.BallImg.skin = "way_bill/PLAYER_01.png";           
            break;
        case 2:
            this.BallNumber.color = "#ffffff";
            this.BallImg.skin = "way_bill/BANK_01.png";
            break;
        case 3:
            this.BallNumber.color = "#000000";
            this.BallImg.skin = "way_bill/TIE_01.png";
            break;
        default:
            //無此類型
            this.MainNode.visible = false;
            break;            
    }

    if(pair != undefined && pair != 0) {
        switch(pair) {
            case 1:
                //閒
                this.BallPair_P.skin = "way_bill/PLAYER-pair_01.png";  
                break;
            case 2:
                //莊
                this.BallPair_B.skin = "way_bill/BANKER-pair_01.png";
                break;
            case 3:
                //和
                this.BallPair_P.skin = "way_bill/PLAYER-pair_01.png";
                this.BallPair_B.skin = "way_bill/BANKER-pair_01.png";
                break;
            default:
                this.BallPair_P.visible = false;
                this.BallPair_B.visible = false;
                break;           
        }
    }

    if(number == "N") {
        this.BallNumber.text = "";
    }else {
        this.BallNumber.text = number.toString();
    }
};

//三路路單B
WayBillBall.prototype.setBellThreeB = function(color, pair) {
    if(color == undefined) {
        this.MainNode.visible = false;
    }else {
        this.MainNode.visible = true;
    }

    switch(color) {
        case 1:
            this.BallNumber.color = "#ffffff";
            this.BallImg.skin = "way_bill/PLAYER_01.png";           
            break;
        case 2:
            this.BallNumber.color = "#ffffff";
            this.BallImg.skin = "way_bill/BANK_01.png";
            break;
        case 3:
            this.BallNumber.color = "#000000";
            this.BallImg.skin = "way_bill/TIE_01.png";
            break;
        default:
            //無此類型
            this.MainNode.visible = false;
            console.log("無此類型");
            break;            
    }

    if(pair != undefined && pair != 0) {
        switch(pair) {
            case 1:
                //閒
                this.BallPair_P.skin = "way_bill/PLAYER-pair_01.png";  
                break;
            case 2:
                //莊
                this.BallPair_B.skin = "way_bill/BANKER-pair_01.png";
                break;
            case 3:
                //和
                this.BallPair_P.skin = "way_bill/PLAYER-pair_01.png";
                this.BallPair_B.skin = "way_bill/BANKER-pair_01.png";
                break;
            default:
                this.BallPair_P.visible = false;
                this.BallPair_B.visible = false;
                break;           
        }
    }

};



//初始化大路九列
WayBillBall.prototype.initBigNine = function() {
    this.MainNode.visible = false;
    this.BallImg.width = 17;
    this.BallImg.height = 17;
    this.BallImg.skin = "";
    this.BallPair_P.skin = "";
    this.BallPair_P.width = 6;
    this.BallPair_P.height = 6;
    this.BallPair_B.skin = "";
    this.BallPair_B.width = 6;
    this.BallPair_B.height = 6;
    this.BallNumber.font = "DFFN_Y7"
    this.BallNumber.fontSize = 15;
    this.BallNumber.text = "";
    this.BallNumber.color = "#ffffff";
    this.BallNumber.pos(4, 2);
    this.BallPair_P.pos(0, 11);
    this.BallPair_B.pos(11, 11);
};

//初始化蟑螂路
WayBillBall.prototype.initCockroach = function() {
    this.MainNode.visible = false;
    //this.BallImg.width = 10;
    //this.BallImg.height = 10;
    this.BallImg.skin = "";
    this.BallNumber.font = "DFFN_Y7"
    this.BallNumber.fontSize = 15;
    this.BallNumber.text = "";
    this.BallNumber.color = "#ffffff";
    this.BallNumber.pos(5, 2);
};

//設置大眼仔路單球
WayBillBall.prototype.setBellEye = function(color) {
    if(color == undefined) {
        this.MainNode.visible = false;
    }else {
        this.MainNode.visible = true;
    }
    switch(color) {
        case 1:
            this.BallImg.skin = "way_bill/BigEye_Blue.png";           
            break;
        case 2:
            this.BallImg.skin = "way_bill/BigEye_Red.png";
            break;
        default:
            //無此類型
            this.MainNode.visible = false;
            break;            
    }
};

//設置小路路單球
WayBillBall.prototype.setBellSmall = function(color) {
    if(color == undefined) {
        this.MainNode.visible = false;
    }else {
        this.MainNode.visible = true;
    }
    switch(color) {
        case 1:
            this.BallImg.skin = "way_bill/SmallWay_Blue.png";           
            break;
        case 2:
            this.BallImg.skin = "way_bill/SmallWay_Red.png";
            break;
        default:
            //無此類型
            this.MainNode.visible = false;
            break;            
    }
};

//設置蟑螂路路單球
WayBillBall.prototype.setBellCockroach = function(color) {
    if(color == undefined) {
        this.MainNode.visible = false;
    }else {
        this.MainNode.visible = true;
    }
    switch(color) {
        case 1:
            this.BallImg.skin = "way_bill/Cockroach_Blue.png";           
            break;
        case 2:
            this.BallImg.skin = "way_bill/Cockroach_Red.png";
            break;
        default:
            //無此類型
            this.MainNode.visible = false;
            break;            
    }
};


//初始化莊閒問路 大路A(左)
WayBillBall.prototype.initAskBigA = function() {
    this.MainNode.visible = false;
    this.BallImg.width = 18;
    this.BallImg.height = 18;
    this.BallImg.skin = "";
    this.BallPair_P.skin = "";
    this.BallPair_P.width = 6;
    this.BallPair_P.height = 6;
    this.BallPair_B.skin = "";
    this.BallPair_B.width = 6;
    this.BallPair_B.height = 6;
    this.BallNumber.font = "DFFN_Y7"
    this.BallNumber.fontSize = 15;
    this.BallNumber.text = "";
    this.BallNumber.color = "#ffffff";
    this.BallNumber.pos(5, 2);
    this.BallPair_P.pos(0, 11);
    this.BallPair_B.pos(11, 11);
};

//初始化莊閒問路 大路B
WayBillBall.prototype.initAskBigB = function() {
    this.MainNode.visible = false;
    this.BallImg.width = 12;
    this.BallImg.height = 12;
    this.BallImg.skin = "";
    this.BallPair_P.skin = "";
    this.BallPair_B.skin = "";
    this.TieLine.skin = "";
    this.BallNumber.font = "DFFN_Y7"
    this.BallNumber.fontSize = 10;
    this.BallNumber.text = "";
    this.BallNumber.color = "#2f9c2f";
    this.BallNumber.pos(2, 0.5);
    this.TieLine.pos(2, 0.5);
    this.BallPair_P.pos(0, 5);
    this.BallPair_B.pos(7, 5);
};

//設置莊閒問路 大路B
WayBillBall.prototype.setBellAskBigB = function(color, tie_number, pair) {
    if(color == undefined) {
        this.MainNode.visible = false;
    }else {
        this.MainNode.visible = true;
    }
    switch(color) {
        case 1:
            this.BallImg.skin = "way_bill/AskBig_player.png";           
            break;
        case 2:
            this.BallImg.skin = "way_bill/AskBig_banker.png";
            break;
        case 3:
            this.BallImg.skin = "";
            break;
        default:
            //無此類型
            this.MainNode.visible = false;
            break;            
    }

    if(pair != undefined && pair != 0) {
        switch(pair) {
        case 1:
            this.BallPair_P.skin = "way_bill/AskBig_ppair.png";           
            break;
        case 2:
            this.BallPair_B.skin = "way_bill/AskBig_bpair.png";
            break;
        case 3:
            this.BallPair_P.skin = "way_bill/AskBig_ppair.png";
            this.BallPair_B.skin = "way_bill/AskBig_bpair.png";
            break;
        default:
            //無此類型
            this.BallPair_P.visible = false;
            this.BallPair_B.visible = false;
            break; 
        }
    }
    if(tie_number != undefined && tie_number != 0) {
        this.BallNumber.text = tie_number.toString();
        this.TieLine.skin = "way_bill/AskBig_tie.png";
    }
};


//初始化莊閒問路 大眼仔,小路,蟑螂路
WayBillBall.prototype.initAskThree = function() {
    this.MainNode.visible = false;
    this.BallImg.width = 5;
    this.BallImg.height = 5;
    this.BallImg.skin = "";
    this.BallNumber.font = "DFFN_Y7"
    this.BallNumber.fontSize = 15;
    this.BallNumber.text = "";
    this.BallNumber.color = "#ffffff";
    this.BallNumber.pos(5, 2);
};


