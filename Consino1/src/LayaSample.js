Laya.init(1024, 768, Laya.WebGL);
Laya.stage.alignV = "middle";
Laya.stage.alignH = "center";
Laya.stage.scaleMode = "showall";
// Laya.stage.scaleMode = "exactfit";  //全屏不等比縮放

Laya.stage.frameRate = "slow";
//Laya.Stat.show();
Laya.class(Cansi, "CansinoUI", CansinoUI);

var Loader = Laya.Loader;
var Handler = Laya.Handler;
var Tween = Laya.Tween;
var Sprite = Laya.Sprite;
var Event = Laya.Event;
var SoundManager = Laya.SoundManager;
SoundManager.autoStopMusic = false;
var NBC;
var glowFilter2 = new Laya.GlowFilter("ffffff", 10, 0, 0); //籌碼濾鏡
var chipBtn = "chip01";
var Psum = 0;
var Bsum = 0;
var showPair = true; //顯示對子
var cutCard_dotTimer;
var msgTextShine;
var FontLoaderError = 0; //字體載入失敗次數
var SocketCloseError = 0; //server斷線重連次數

/**
 * 得分時切換顯示分數的旗標(需撥分數), ex: 1:point_0, 2: pointB_0
 */
var change_scoreFlag = 1; 

//設定檔參數
var set_GameValue = {
    //押注設定
    Denomination1: 0,
    Denomination2: 0,
    Denomination3: 0,
    Denomination4: 0,
    Denomination5: 0,
    TieBet: true,
    RemainingPointBet: true,
    AutoRetention: true,

    //押注設定2
    allPlayerBankerMax: 0,
    allTieNoteMax: 0,
    allPlayerPairMax: 0,
    allBankerPairMax: 0,

    //音效設定
    UseBGM: true,
    BGMVoice: 0.4,
    UseReciprocal: true,
    reciprocalVoice: 0.4,
    UseChips: true,
    chipsVoice: 0.4,
    UseVoice: true,
    Voice: 0.4,

    //單機設定
    RetentionBtn: true,
    RetiredBtn: true,
    DayCardAndStopCard: true,
    BigWayShowPair: true,
    UseChipsIndex: true,
    UseChipsDrop: true,
    LoginBtn: true,
    LogoutBtn: true,
    BeforeRecord: 0,
    RecordLoadNum: 0,
    LoginKeepsNum: 0,

    //功能設定
    BetInfo: 2,

    //訊息設定
    //17顆按鈕
    keyM: 3,
    keyJ: 2,
    keyQ: 0,
    keyW: 1
};

/**
 * 全場押分資訊
 */
var betInfoTotPoint = {
    playerAllBet: 0,
    tieAllBet: 0,
    bankerAllBet: 0,
    playPairAllBet: 0,
    bankPairAllBet: 0
};

var game_field = 1;
var game_round = 1;
var useChipIndexNow = true;
var singleNoteMin = 0;
var singleNoteMax = 0;
var tieNoteMin = 0;
var tieNoteMax = 0;
var playerPairMin = 0;
var playerPairMax = 0;
var bankerPairMin = 0;
var bankerPairMax = 0;
var singleMachineMax = 0;
var allMax = 0;
var betOverInvalid = true;

//單機設定參數
var set_BigWayShowPair = true;
var chipFlagP = false;
var chipFlagPpair = false;
var chipFlagT = false;
var chipFlagBpair = false;
var chipFlagB = false;

//設置右上路單圖及各選單(前5個為開牌紀錄有可見與不可見)
var luDan = [true, true, true, true, true, true, true];
//設置目前第一張路單
var nowluDanPic = "";

//集中管理路單球
var WayBillManager = [];
var BigWay_list = [];   //大路路單

var WayBillManager_three = [];
var WayBillManager_threeB = [];
var WayBillManager_threeC = [];
var ThreeWay_listB = [];   //三路路單B
var ThreeWay_listC = [];   //三路路單C

var WayBillManager_Nine = [];
var BigWayNine_list = [];   //大路九列路單

var WayBillManager_Eye = [];
var BigWayEye_list = [];   //大眼仔路單

var WayBillManager_Small = [];
var BigWaySmall_list = [];   //小路路單

var WayBillManager_Cockroach = [];
var BigWayCockroach_list = [];   //蟑螂路路單
/**莊閒問路(大路A) */
var WayBillManager_AskBigA = []; //莊閒問路(大路A)
var AskBigB_list = [];
var AskBigB_listToThree = [];
var WayBillManager_AskBigB = []; //莊閒問路(大路B)
var WayBillManager_AskEye = []; //莊閒問路(大眼仔)
var WayBillManager_AskSmall = []; //莊閒問路(小路)
var WayBillManager_AskCockroach = []; //莊閒問路(蟑螂路)
var WayBillAsk_btn = [[], []];       //按下莊閒問路按鈕呈現的路單
var WayBillAsk_PbtnList = [[], [], [], [], []];
var WayBillManager_PAskbtn = [[], [], [], [], []];
var WayBillAsk_BbtnList = [[], [], [], [], []];
var WayBillManager_BAskBbtn = [[], [], [], [], []];

var all_preGameList =[];
var all_gameWayBillList = [];

//押注點數
var Bet_playerList = [[], []];
var Bet_bankerList = [[], []];
var Bet_playerPairList = [[], []];
var Bet_bankerPairList = [[], []];
var Bet_tieList = [[], []];
var nowChipPoint_Img = "1"; //現在點選使用的籌碼(圖)
var nowChipPoint_point = 0; //現在點選使用的籌碼(點數)
var user_betPoint = {
    point: 0,
    chips: [0, 0, 0, 0, 0, 0],
    haveBet: [],
    nowBetTot: 0
};

//得分籌碼
var Get_playerList = [[], []];
var Get_bankerList = [[], []];
var Get_playerPairList = [[], []];
var Get_bankerPairList = [[], []];
var Get_tieList = [[], []];

//登出入介面用參數
var setting_login = {
    loginNum: "",
    loginOutBtn: 0,
    nowLogin: ""
};

//前場紀錄頁數
var preRecord_nowPage;

//鍵盤續退押使用的遊戲狀態
var key_GameStatus = "";

//資源載入
var Assets = [
    { url: "res/atlas/puker/puker_back.atlas", type: Loader.ATLAS },
    { url: "res/atlas/puker/puker_front.atlas", type: Loader.ATLAS },
    { url: "res/atlas/image.atlas", type: Loader.ATLAS },
    { url: "res/atlas/digitnumber.atlas", type: Loader.ATLAS },
    { url: "res/atlas/chip.atlas", type: Loader.ATLAS },
    { url: "res/atlas/btn_ani2.atlas", type: Loader.ATLAS },
    { url: "res/atlas/puker/puker_small.atlas", type: Loader.ATLAS },
    { url: "res/atlas/way_bill.atlas", type: Loader.ATLAS },
    { url: "res/atlas/chip_ptr.atlas", type: Loader.ATLAS },
    { url: "res/atlas/chipLight.atlas", type: Loader.ATLAS },
    { url: "res/atlas/login.atlas", type: Loader.ATLAS },
    { url: "res/atlas/comp.atlas", type: Loader.ATLAS },
];

/**
 *  載入字體
 * 
 **/
Load_wt011();
function Load_wt011() {
    fontSpy('wt011', {
        success: function () {
            FontLoaderError = 0;
            Load_casinofont();
        },
        failure: function () {
            FontLoaderError++;
            if (FontLoaderError < 5) {
                Load_wt011();
            }
            else {
                FontLoaderError = 0;
                Load_casinofont();
            }
        }
    });
}
function Load_casinofont() {
    fontSpy('wt064', {
        success: function () {
            FontLoaderError = 0;
            Load_wt014();  //若之後有字體則載入之後的字體,否則onLoaded();
        },
        failure: function () {
            FontLoaderError++;
            if (FontLoaderError < 5) {
                Load_casinofont();
            }
            else {
                FontLoaderError = 0;
                Load_wt014();
            }
        }
    });
}
function Load_wt014() {
    fontSpy('wt014', {
        success: function () {
            FontLoaderError = 0;
            Load_DFT_C8U();  //若之後有字體則載入之後的字體,否則onLoaded();
        },
        failure: function () {
            FontLoaderError++;
            if (FontLoaderError < 5) {
                Load_wt014();
            }
            else {
                FontLoaderError = 0;
                Load_DFT_C8U();
            }
        }
    });
}
function Load_DFT_C8U() {
    fontSpy('DFT_C8U', {
        success: function () {
            FontLoaderError = 0;
            Load_DFFN_Y7();  //若之後有字體則載入之後的字體,否則onLoaded();
        },
        failure: function () {
            FontLoaderError++;
            if (FontLoaderError < 5) {
                Load_DFT_C8U();
            }
            else {
                FontLoaderError = 0;
                Load_DFFN_Y7();
            }
        }
    });
}
function Load_DFFN_Y7() {
    fontSpy('DFFN_Y7', {
        success: function () {
            FontLoaderError = 0;
            Load_Asset();
        },
        failure: function () {
            FontLoaderError++;
            if (FontLoaderError < 5) {
                Load_DFFN_Y7();
            }
            else {
                FontLoaderError = 0;
                Load_Asset();
            }
        }
    });
}


function Load_Asset() {
    Laya.loader.load(Assets, Handler.create(this, onLoaded));
}

function onLoaded() {
    ConView = new Cansi();
    Laya.stage.addChild(ConView);
}


function Cansi() {
    //socket連線
    this.socket = new Laya.Socket();
    // this.socket.connectByUrl("ws://172.16.8.178:8384");
    // this.socket.connectByUrl("ws://172.16.8.76:8384");
    this.socket.connectByUrl("ws://localhost:8384");
    this.socket.on(Laya.Event.OPEN, this, openHandler);
    this.socket.on(Laya.Event.MESSAGE, this, receiveHandler);
    this.socket.on(Laya.Event.CLOSE, this, closeHandler);
    this.socket.on(Laya.Event.ERROR, this, errorHandler);
    Cansi.super(this);
    NBC = this;

    //訊息閃爍(換行)
    msgTextToShow();

    // 滑鼠鼠標位置
    this.on(Laya.Event.MOUSE_MOVE, this, function() {
        if(chipFlagP == true) {
            this.player_btnDropchip.alpha = 0.7;
            this.player_btnDropchip.pos(Laya.stage.mouseX, Laya.stage.mouseY);
        }
        if(chipFlagPpair == true) {
            this.playerPair_btnDropchip.alpha = 0.7;
            this.playerPair_btnDropchip.pos(Laya.stage.mouseX, Laya.stage.mouseY);
        }
        if(chipFlagT == true) {
            this.tie_btnDropchip.alpha = 0.7;
            this.tie_btnDropchip.pos(Laya.stage.mouseX, Laya.stage.mouseY);
        }
        if(chipFlagBpair == true) {
            this.bankerPair_btnDropchip.alpha = 0.7;
            this.bankerPair_btnDropchip.pos(Laya.stage.mouseX, Laya.stage.mouseY);
        }
        if(chipFlagB == true) {
            this.banker_btnDropchip.alpha = 0.7;
            this.banker_btnDropchip.pos(Laya.stage.mouseX, Laya.stage.mouseY);
        }
    });

    Laya.stage.on(Laya.Event.MOUSE_UP, Laya.stage, function(e) {
        //如果拖曳旗標為true,且使用者有登入
        if(setting_login.nowLogin != "") {
            if(chipFlagP == true) {
                var hasMouseUP = hasMouseUp_InBetBlock(NBC.player_btnDropchip.x, NBC.player_btnDropchip.y);
                if(hasMouseUP == false) {
                    //退押
                    chipFlagP = false;
                    DropChipRetireBet("player_btn");
                    DropChipPos_toOrigin();
                }else {
                    //拖曳押注
                    e.stopPropagation();
                    chipFlagP = false;

                    //看是不是在押注區否則退押
                    //先判斷有沒有籌碼
                    if(Bet_playerList[1].length > 0) {
                        //拖曳
                        DropChipPlayerBtn("player_btn");

                    }else {
                        //點擊
                        DropChipPos_toOrigin();
                        betImgClick({target: {name: "player_btn"}});
                    }
                }
            } //End if(chipFlagP == false).
            if(chipFlagPpair == true) {
                var hasMouseUP = hasMouseUp_InBetBlock(NBC.playerPair_btnDropchip.x, NBC.playerPair_btnDropchip.y);
                if(hasMouseUP == false) {
                    //退押
                    chipFlagPpair = false;
                    DropChipRetireBet("playerPair_btn");
                    DropChipPos_toOrigin();
                }else {
                    //拖曳押注
                    e.stopPropagation();
                    chipFlagPpair = false;

                    //看是不是在押注區否則退押
                    //先判斷有沒有籌碼
                    if(Bet_playerPairList[1].length > 0) {
                        //拖曳
                        DropChipPlayerBtn("playerPair_btn");
                        chipFlagPpair = false;
                    }else {
                        //點擊
                        DropChipPos_toOrigin();
                        betImgClick({target: {name: "playerPair_btn"}});
                    }
                }
            } //End if(chipFlagPpair == true)
            if(chipFlagT == true) {
                var hasMouseUP = hasMouseUp_InBetBlock(NBC.tie_btnDropchip.x, NBC.tie_btnDropchip.y);
                if(hasMouseUP == false) {
                    //退押
                    chipFlagT = false;
                    DropChipRetireBet("tie_btn");
                    DropChipPos_toOrigin();
                }else {
                    //拖曳押注
                    e.stopPropagation();
                    chipFlagT = false;

                    //看是不是在押注區否則退押
                    //先判斷有沒有籌碼
                    if(Bet_tieList[1].length > 0) {
                        //拖曳
                        DropChipPlayerBtn("tie_btn");
                    }else {
                        //點擊
                        DropChipPos_toOrigin();
                        betImgClick({target: {name: "tie_btn"}});
                    }
                }
            }//End if(chipFlagT == true)
            if(chipFlagBpair == true) {
                var hasMouseUP = hasMouseUp_InBetBlock(NBC.bankerPair_btnDropchip.x, NBC.bankerPair_btnDropchip.y);
                if(hasMouseUP == false) {
                    //退押
                    chipFlagBpair = false;
                    DropChipRetireBet("bankerPair_btn");
                    DropChipPos_toOrigin();
                }else {
                    //拖曳押注
                    e.stopPropagation();
                    chipFlagBpair = false;

                    //看是不是在押注區否則退押
                    //先判斷有沒有籌碼
                    if(Bet_bankerPairList[1].length > 0) {
                        //拖曳
                        DropChipPlayerBtn("bankerPair_btn");
                    }else {
                        //點擊
                        DropChipPos_toOrigin();
                        betImgClick({target: {name: "bankerPair_btn"}});
                    }
                }
            }//End if(chipFlagBpair == true)
            if(chipFlagB == true) {
                var hasMouseUP = hasMouseUp_InBetBlock(NBC.banker_btnDropchip.x, NBC.banker_btnDropchip.y);
                if(hasMouseUP == false) {
                    //退押
                    chipFlagB = false;
                    DropChipRetireBet("banker_btn");
                    DropChipPos_toOrigin();
                }else {
                    //拖曳押注
                    e.stopPropagation();
                    chipFlagB = false;

                    //看是不是在押注區否則退押
                    //先判斷有沒有籌碼
                    if(Bet_bankerList[1].length > 0) {
                        //拖曳
                        DropChipPlayerBtn("banker_btn");
                    }else {
                        //點擊
                        DropChipPos_toOrigin();
                        betImgClick({target: {name: "banker_btn"}});
                    }
                }
            }
            DropChipPos_toOrigin();
        }else {
            //未登入不能押分
            var hasMouseUP = hasMouseUp_InBetBlock(Laya.stage.mouseX, Laya.stage.mouseY);
            if(hasMouseUP == true) {
                if(NBC.allMsg_showing.getChildByName("cannotBet_msg").alpha == 0) {
                    Laya.Tween.clearAll(NBC.allMsg_showing.getChildByName("cannotBet_msg"));
                    // NBC.allMsg_showing.getChildByName("cannotBet_msg").alpha = 0;
                    Laya.Tween.to(NBC.allMsg_showing.getChildByName("cannotBet_msg"), { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
                    Laya.Tween.to(NBC.allMsg_showing.getChildByName("cannotBet_msg"), { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);
                }
            }
        }
    });

    //設置右上顯示的第一張圖
    checkShowLuDan(this);

    //物件一開始就要作用時可先綁定
    rightTopMenuBtnOn(this);
    rigthLudanView(this);
    chipMouseRegist(this);
    loginViewBtn();
    reBetClickBtnOverOut();

    this.Retirement.on("click", this, RetireClick);
    this.continuBet.on(Laya.Event.MOUSE_UP, this, ContinueClick);
    this.beforeRecord.getChildByName("exit").on(Laya.Event.MOUSE_UP, this, beforeRecord_exitClick);
    this.PreRecord_preBtn.on(Laya.Event.MOUSE_UP, this, preRecord_preBtnClick);
    this.PreRecord_nextBtn.on(Laya.Event.MOUSE_UP, this, preRecord_nextBtnClick);
    this.gameRule.getChildByName("exit").on(Laya.Event.MOUSE_UP, this, gameRule_exitClick);
    this.leftMenu.getChildByName("loginBtn").on(Laya.Event.MOUSE_UP, this, leftLoginClick);
    this.right05.getChildByName("PAskBtn").on(Laya.Event.MOUSE_UP, this, PAskBtnClick);
    this.right05.getChildByName("BAskBtn").on(Laya.Event.MOUSE_UP, this, BAskBtnClick);
    this.right07.getChildByName("login").on(Laya.Event.MOUSE_UP, this, leftLoginClick);
    this.right07.getChildByName("logout").on(Laya.Event.MOUSE_UP, this, login_OutBtn);
    this.right07.getChildByName("preRecord").on(Laya.Event.MOUSE_UP, this, beforeRecord_btnClick);
    this.right07.getChildByName("gameRule").on(Laya.Event.MOUSE_UP, this, gameRule_btnClick);

    if (set_GameValue.UseBGM == true) {
        SoundManager.playMusic("res/sound/Music1.mp3", 0);
        SoundManager.setSoundVolume(set_GameValue.BGMVoice, "res/sound/Music1.mp3");
    }

    function openHandler(event) {
        //正确建立连接；
        console.log("success");
        NBC.connectErrorTextShow.color = "#30ec16";
        NBC.connectErrorTextShow.text = "連線成功...";
        setTimeout(function() {
            NBC.connectErrorTextShow.visible = false;
        }, 1000);
        SocketCloseError = 0;

        if(setting_login.nowLogin != "") {
            ErrorHandleByUserLogining();
        }
    }
    function receiveHandler(msg) {
        ///接收到数据触发函数
        console.log("receive:" + msg);
        //判斷指令
        CheckJsonAction(msg, this);
        //Process:"BetTime", Status:"Pause"
    }
    function closeHandler(e) {
        //伺服器已關閉
        console.log("伺服器已關閉");
        showErrorHandlerMsg();
        user_betPoint.haveBet = [];
        //自動登出
    }
    function errorHandler(e) {
        //连接出错
        console.log("connectError");
        //重連三次後若server無回應則跳出是否重連訊息框
        SocketCloseError++;
        if(SocketCloseError > 3) {
            //彈出訊息框
            NBC.connectErrorTextShow.visible = false;
            showErrorHandlerMsg();
        }else {
            var show_connectError = NBC.connectErrorTextShow;
            show_connectError.color = "#ec1b17";
            show_connectError.visible = true;
            show_connectError.text = "重新連線...";
            // NBC.socket.connectByUrl("ws://172.16.8.76:8384");
            // NBC.socket.connectByUrl("ws://172.16.8.178:8384");
            this.socket.connectByUrl("ws://localhost:8384");
        }
    }
}

/**
 * 控制按鍵
 * M:int = 77;
 * J:int = 74;
 * W:int = 87;
 * Q:int = 81;
 * 按鍵參考: https://dotblogs.com.tw/corner/2009/07/19/9583
 */
function keyevent() {
    switch (event.keyCode) {
        case 77:
            keyAction(set_GameValue.keyM);
            break;
        case 74:
            keyAction(set_GameValue.keyJ);
            break;
        case 87:
            keyAction(set_GameValue.keyW);
            break;
        case 81:
            keyAction(set_GameValue.keyQ);
            break;
        default:
            //關閉
            if(NBC.gameRule.visible == true) {
                NBC.gameRule.visible = false;
            }
            if(NBC.beforeRecord.visible == true) {
                NBC.beforeRecord.visible = false;
            }
            break;
    }
}
function keyAction(keys) {
    // 0:續押, 1:全退, 2:前場記錄, 3:遊戲規則
    switch (keys) {
        case 0:
            if(NBC.gameRule.visible == true) {
                //關掉
                NBC.gameRule.visible = false;
            }
            if(NBC.beforeRecord.visible == true) {
                //關掉
                NBC.beforeRecord.visible = false;
            }
            if(key_GameStatus == "startGame" || key_GameStatus == "bet") {
                ContinueClick();
            }
            break;
        case 1:
            if(NBC.gameRule.visible == true) {
                //關掉
                NBC.gameRule.visible = false;
            }
            if(NBC.beforeRecord.visible == true) {
                //關掉
                NBC.beforeRecord.visible = false;
            }
            if(key_GameStatus == "startGame" || key_GameStatus == "bet") {
                RetireClick();
            }
            break;
        case 2:
            if (NBC.beforeRecord.visible) {
                // NBC.beforeRecord.visible = false;
                preRecord_preBtnClick(); //上一頁
            } else {
                if(NBC.gameRule.visible == true) {
                    //關掉
                    NBC.gameRule.visible = false;
                }else {
                    NBC.beforeRecord.visible = true;
                    show_beforeRecord();
                }
            }
            break;
        case 3:
            if (NBC.gameRule.visible) {
                NBC.gameRule.visible = false;
            } else {
                if(NBC.beforeRecord.visible == true) {
                    //關掉
                    NBC.beforeRecord.visible = false;
                }else {
                    NBC.gameRule.visible = true;
                }
            }
            break;
    }
}
document.onkeydown = keyevent;

//退押按鈕
function RetireClick(reciving) {
    //清空桌面上下注的籌碼
    var result = {
        action: "RetireBet"
    };
    NBC.socket.send(JSON.stringify(result));

    //如果有籌碼
    //播放語音
    if (set_GameValue.UseChips && reciving != false && (Bet_playerList[1].length > 0 ||
        Bet_playerPairList[1].length > 0 || Bet_tieList[1].length > 0 ||
        Bet_tieList[1].length > 0 || Bet_bankerList[1].length > 0)) {
        SoundManager.playSound("res/sound/chip.mp3", 1);
        SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/chip.mp3");
    }
}

//續押按鈕
function ContinueClick() {
    var result = {
        action: "continuBet"
    };
    NBC.socket.send(JSON.stringify(result));
}


/**
 * 
 * 設至右上方區塊按鈕的滑鼠事件
 * 
 **/

//註冊右上方menu滑鼠事件
function rightTopMenuBtnOn(ConView) {
    ConView.openCard.on(Event.MOUSE_OVER, this, switchImgOver);
    ConView.openCard.on(Event.MOUSE_OUT, this, switchImgOut);
    ConView.openCard.on(Event.MOUSE_DOWN, this, switchImgDown);
    ConView.openCard.on(Event.MOUSE_UP, this, switchImgUp);
    ConView.openCard.on("click", this, switchImgClick);

    ConView.openrecord.on(Event.MOUSE_OVER, this, switchImgOver);
    ConView.openrecord.on(Event.MOUSE_OUT, this, switchImgOut);
    ConView.openrecord.on(Event.MOUSE_DOWN, this, switchImgDown);
    ConView.openrecord.on(Event.MOUSE_UP, this, switchImgUp);
    ConView.openrecord.on("click", this, switchImgClick);

    ConView.openmenu.on(Event.MOUSE_OVER, this, switchImgOver);
    ConView.openmenu.on(Event.MOUSE_OUT, this, switchImgOut);
    ConView.openmenu.on(Event.MOUSE_DOWN, this, switchImgDown);
    ConView.openmenu.on(Event.MOUSE_UP, this, switchImgUp);
    ConView.openmenu.on("click", this, switchImgClick);
}

//啟動右上方menu滑鼠事件
//滑鼠停留
function switchImgOver(ConView) {
    //判斷目前的圖是不是foucs的圖,若不是則換圖
    if (ConView.currentTarget.skin != "image/Menu_Button_04.png") {
        ConView.currentTarget.skin = "image/Menu_Button_02.png";
        ConView.target._childs[1].color = "#ffffff";
        ConView.target._childs[0].visible = false;
        Laya.Tween.to(ConView.currentTarget, { scaleX: 1.15, scaleY: 1.1 }, 350, Laya.Ease.bounceOut, null);
    }
}
//滑鼠離開
function switchImgOut(ConView) {
    if (ConView.currentTarget.skin != "image/Menu_Button_04.png") {
        ConView.currentTarget.skin = "image/Menu_Button_01.jpg";
        ConView.target._childs[1].color = "#cccccc";
        ConView.target._childs[0].visible = false;
        Laya.Tween.to(ConView.currentTarget, { scaleX: 1, scaleY: 1 }, 350, Laya.Ease.bounceOut, null);
    } else {
        ConView.currentTarget.skin = "image/Menu_Button_04.png";
    }
}
//滑鼠押下
function switchImgDown(ConView) {
    ConView.currentTarget.skin = "image/Menu_Button_03.png";
    ConView.target._childs[1].color = "#f7e300";
    ConView.target._childs[0].visible = false;
}
//滑鼠抬起
function switchImgUp(ConView) {
    ConView.currentTarget.skin = "image/Menu_Button_04.png";
    ConView.target._childs[1].color = "#ffffff";
}
//滑鼠點擊
function switchImgClick(ConView) {
    //切換按鈕的圖
    ConView.currentTarget.skin = "image/Menu_Button_04.png";
    ConView.target._childs[0].visible = true;

    //點擊後換路單的圖,其他按鈕暗掉
    switch (ConView.currentTarget.name) {
        case "menu_btn01":
            showLuDanPicToBtn(ConView);
            //showLuDanPic(ConView);
            if (nowluDanPic == "right06") {
                rightBtnToLight(ConView.target._parent.openrecord);
                rightBtnToOrder(ConView.target._parent.openCard);
                rightBtnToOrder(ConView.target._parent.openmenu);
            } else {
                rightBtnToOrder(ConView.target._parent.openrecord);
                rightBtnToOrder(ConView.target._parent.openmenu);
            }
            break;
        case "menu_btn02":
            //關掉目前顯示的圖,顯示下一張,並更新目前顯示的值
            NBC.right06.visible = true;
            ConView.target._parent[nowluDanPic].visible = false;
            ConView.target._parent.right06.visible = true;
            nowluDanPic = "right06";

            rightBtnToOrder(ConView.target._parent.openCard);
            rightBtnToOrder(ConView.target._parent.openmenu);
            //翻牌動畫
            Right06CardAnimate();
            break;
        case "menu_btn03":
            //關掉目前顯示的圖,顯示下一張,並更新目前顯示的值
            ConView.target._parent[nowluDanPic].visible = false;
            ConView.target._parent.right07.visible = true;
            nowluDanPic = "right07";

            rightBtnToOrder(ConView.target._parent.openrecord);
            rightBtnToOrder(ConView.target._parent.openCard);
            break;
        default:
            break;
    }
}
//讓其於按鈕的圖片暗下(變回尚未點擊時的狀態)
function rightBtnToOrder(obj) {
    obj['skin'] = "image/Menu_Button_01.jpg";
    obj._childs[1].color = "#cccccc";
    obj._childs[0].visible = false;
    Laya.Tween.to(obj, { scaleX: 1, scaleY: 1 }, 0, Laya.Ease.elasticInOut, null);
}

//讓其中一個按鈕變亮(啟用按鈕)
function rightBtnToLight(obj) {
    obj['skin'] = "image/Menu_Button_04.png";
    obj._childs[0].visible = true;
    obj._childs[1].color = "#ffffff";
}


/**
 * 
 * 設至右上方區塊路單的滑鼠事件
 * 
 **/
function rigthLudanView(ConView) {
    ConView.right01.getChildByName("bgImg").on("click", this, ludanImgSwitch.bind(ConView));
    ConView.right02.getChildByName("bgImg").on("click", this, ludanImgSwitch.bind(ConView));
    ConView.right03.getChildByName("bgImg").on("click", this, ludanImgSwitch.bind(ConView));
    ConView.right04.getChildByName("bgImg").on("click", this, ludanImgSwitch.bind(ConView));
    ConView.right05.getChildByName("bgImg").on("click", this, ludanImgSwitch.bind(ConView));
    ConView.right06.getChildByName("bgImg").on("click", this, ludanImgSwitch.bind(ConView));
    ConView.right07.getChildByName("bgImg").on("click", this, ludanImgSwitch.bind(ConView));
}

/**
 * 點擊右上目前顯示的路單圖,顯示下一張,並更新目前顯示的值
 * @param {*object} nowClickPic 目前點擊的路單圖物件
 */
function ludanImgSwitch(nowClickPic) {
    //找到下一張路單圖,並更新目前顯示的值
    showLuDanPic(nowClickPic);
    //換路單的按鈕
    switch (nowluDanPic) {
        case "right01":
        case "right02":
        case "right03":
        case "right04":
        case "right05":
            rightBtnToLight(NBC.openCard);
            rightBtnToOrder(NBC.openrecord);
            rightBtnToOrder(NBC.openmenu);
            break;
        case "right06":
            rightBtnToLight(NBC.openrecord);
            rightBtnToOrder(NBC.openCard);
            rightBtnToOrder(NBC.openmenu);
            //翻牌動畫
            Right06CardAnimate();
            break;
        case "right07":
            rightBtnToLight(NBC.openmenu);
            rightBtnToOrder(NBC.openrecord);
            rightBtnToOrder(NBC.openCard);
            break;
        default:
            break;
    }

}

/**
 * 路單圖的顯示
 * 1.開牌紀錄有可能都不啟用,都不啟用時開牌紀錄按鈕不能作用
 * 2.開牌紀錄載入下一張路單圖前,須先判斷下一張路單起不啟用
 * 3.選單中的登入登出按鈕有可能都不啟用
 */

/**
 * 先確認載入的第一張路單(判斷路單起不啟用)
 * @param {*object} SuperCansi 繼承 UI 的 Casino物件
 */
function checkShowLuDan(SuperCansi) {
    var haveLuDan = true;   //預設有路單圖

    for (var i = 0; i < 5; i++) {
        if (luDan[i]) {
            nowluDanPic = "right0" + (i + 1);
            haveLuDan = true;
            break;
        } else {
            haveLuDan = false;
        }
    }

    //沒有路單圖(皆不啟用)
    if (!haveLuDan) {
        //開牌紀錄按鈕不啟用,並啟用紀錄/統計按鈕 
        SuperCansi.openCard.mouseEnabled = false;

        rightBtnToOrder(SuperCansi.openCard);
        rightBtnToLight(SuperCansi.openrecord);

        //設定第一張圖為紀錄/統計       
        nowluDanPic = "right06";
        SuperCansi.right01.visible = false;
        SuperCansi.right06.visible = true;
    }
    //判斷現在將載入的路單是否啟用
    if(luDan[0] == false) {
        //如果不啟用,重設第一張圖(預設為第一張)
        for(var i = 0; i < 5; i++) {
            if(luDan[i] == true) {
                // 設為第一張
                var c = i + 1;
                nowluDanPic = "right0" + c;
                SuperCansi.right01.visible = false;
                SuperCansi[nowluDanPic].visible = true;
                break;
            }
        }
    }
} //End checkShowLuDan() function.

/**
 * 使用者按下按鈕或圖片時判斷下一張路單圖
 */
function nextShowLuDan() {
    //取出下一張要顯示的路單圖
    var nowPicNum = parseInt(nowluDanPic.substr(-1, 1)) - 1;
    //先判斷下一張路單的數字是否超出所引
    var nextNum = (nowPicNum + 1 > luDan.length - 1) ? 0 : nowPicNum + 1;

    if (luDan[nextNum]) {
        //傳回下一張路單圖
        return "right0" + (nextNum + 1);
    } else {
        //往下繼續找,若Array已經到底了則重頭開始找
        var next = (nextNum + 1 > luDan.length - 1) ? 0 : nextNum + 1;

        while (!luDan[next]) {
            next++;
            next = (next + 1 > luDan.length - 1) ? 0 : next; //歸0   
        }
        return "right0" + (next + 1);
    }
} //End nextShowLuDan() function.

/**
 * 關掉右上目前顯示的路單圖,顯示下一張,並更新目前顯示的值
 * @param {*object} ConView 按鈕的物件或現點擊路單圖的物件
 */
function showLuDanPic(ConView) {
    //確認下一張要顯示的路單圖
    var nextPic = nextShowLuDan();

    //關掉目前顯示的圖,顯示下一張,並更新目前顯示的值
    NBC[nowluDanPic].visible = false;

    if (nextPic == "right05") {
        NBC.right05.getChildByName("bgImgN").visible = true;
        NBC.right05.getChildByName("bgImgB").visible = false;
        NBC.right05.getChildByName("bgImgP").visible = false;
    }

    NBC[nextPic].visible = true;
    nowluDanPic = nextPic;
}

//只點擊開牌紀錄按鈕時,點到紀錄/統計按鈕的換圖
function showLuDanPicToBtn(BtnConView) {
    //看傳進來的按鈕是否為btn01
    if (BtnConView.currentTarget.name == "menu_btn01") {
        //看現在的未換的圖是不是01~05若不是則先找開牌紀錄要先顯示哪一張
        switch (nowluDanPic) {
            case "right01":
            case "right02":
            case "right03":
            case "right04":
            case "right05":
                showLuDanPic(BtnConView);
                break;
            default:
                //關掉目前顯示的圖,顯示下一張,並更新目前顯示的值
                NBC[nowluDanPic].visible = false;
                SetLuDanBtnCanUse(BtnConView);
                NBC[nowluDanPic].visible = true;
                break;
        }
    }
}

//設置按鈕的可不可點擊
function SetLuDanBtnCanUse(BtnConView) {
    var haveLuDan = true;   //預設有路單圖

    for (var i = 0; i < 5; i++) {
        if (luDan[i]) {
            nowluDanPic = "right0" + (i + 1);
            haveLuDan = true;
            break;
        } else {
            haveLuDan = false;
        }
    }

    //沒有路單圖(皆不啟用)
    if (!haveLuDan) {
        //開牌紀錄按鈕不啟用,並啟用紀錄/統計按鈕 
        NBC.openCard.mouseEnabled = false;

        rightBtnToOrder(BtnConView.target._parent.openCard);
        rightBtnToLight(BtnConView.target._parent.openrecord);

        //設定第一張圖為紀錄/統計       
        nowluDanPic = "right06";
        NBC.right01.visible = false;
        NBC.right06.visible = true;
    } else {
        //將被關掉的按鈕開啟
        NBC.openCard.mouseEnabled = true;
    }
}

//紀錄/統紀圖的翻牌動畫
function Right06CardAnimate() {
    Laya.Tween.clearAll(NBC.R06ShowRecords);
    for(var i = 1; i <= 4; i++) {
        for(var j = 1; j <= 3; j++) {
            NBC.R06ShowRecords.getChildByName("RPC" + j + i + "B").scaleX = 1;
            NBC.R06ShowRecords.getChildByName("RPC" + j + i).scaleX = 0;
            NBC.R06ShowRecords.getChildByName("RBC" + j + i + "B").scaleX = 1;
            NBC.R06ShowRecords.getChildByName("RBC" + j + i).scaleX = 0;
        }
    }

    var cardTap = 0;
    var cardTap2 = 400;
    for(var i = 1; i <= 4; i++) {
        for(var j = 1; j <= 3; j++) {
            Laya.Tween.to(NBC.R06ShowRecords.getChildByName("RPC" + j + i + "B"), { scaleX: 0 }, 400, Laya.Ease.easeOutQuart, null, cardTap);
            Laya.Tween.to(NBC.R06ShowRecords.getChildByName("RPC" + j + i), { scaleX: 1 }, 400, Laya.Ease.easeOutQuart, null, cardTap);
            cardTap += 30;
            cardTap2 += 30;
        }
        for(var j = 1; j <= 3; j++) {
            Laya.Tween.to(NBC.R06ShowRecords.getChildByName("RBC" + j + i + "B"), { scaleX: 0 }, 400, Laya.Ease.easeOutQuart, null, cardTap);
            Laya.Tween.to(NBC.R06ShowRecords.getChildByName("RBC" + j + i), { scaleX: 1 }, 400, Laya.Ease.easeOutQuart, null, cardTap2);
            cardTap += 30;
            cardTap2 += 30;
        }
    }
}

//籌碼發光
var ShineTimer = setInterval(chipShine, 2500);
var LiterTimer = 0;
function chipShine(chipName) {
    chipName = (chipName == "" || chipName == undefined) ? chipBtn : chipName;
    var literTimer = LiterTimer;
    var nowShine_chip = NBC.chips.getChildByName(chipName).getChildByName("chip");
    if(nowShine_chip.getChildByName("chipL").alpha > 0) {
        Laya.Tween.clearAll(nowShine_chip.getChildByName("chipL"));
        nowShine_chip.getChildByName("chipL").alpha = 0;
    }

    if(nowShine_chip.getChildByName("chipL").filters === undefined) {
        nowShine_chip.getChildByName("chipL").filters = [glowFilter2];
    }
    
    if (literTimer == 0) {
        nowShine_chip.getChildByName("chip_light").visible = true;
        nowShine_chip.getChildByName("chip_light").play(0, false);
    } else {
        Laya.Tween.to(nowShine_chip.getChildByName("chipL"), { alpha: 1 }, 1000, Laya.Ease.linear);
        Laya.Tween.to(nowShine_chip.getChildByName("chipL"), { alpha: 0 }, 800, Laya.Ease.linear, null, 1000);
    }
    LiterTimer += 1;
    if (LiterTimer > 3) {
        LiterTimer = 0;
    }
}


//註冊籌碼的滑鼠事件
function chipMouseRegist(ConView) {
    var TotChips = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
    for (var i = 0, max = TotChips.length; i < max; i++) {
        ConView["chips"].getChildByName(TotChips[i]).on(Event.MOUSE_OVER, this, chipsImgOver);
        ConView["chips"].getChildByName(TotChips[i]).on(Event.MOUSE_OUT, this, chipsImgOut);
        ConView["chips"].getChildByName(TotChips[i]).on("click", this, chipsImgClick);
    }
}
function chipsImgOver(nowChip) {
    Laya.Tween.to(nowChip.target.getChildByName("chip"), { scaleX: 1.4, scaleY: 1.4 }, 245, Laya.Ease.bounceOut, null);
}
function chipsImgOut(nowChip) {
    Laya.Tween.to(nowChip.target.getChildByName("chip"), { scaleX: 1, scaleY: 1 }, 245, Laya.Ease.bounceOut, null);
}
function chipsImgClick(nowChip) {
    //遍歷所有的籌碼,將其復原
    var TotChips = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
    for (ch in TotChips) {
        NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip_ptr").visible = false;
        NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip").getChildByName("chip_light").visible = false;
        Laya.Tween.clearAll(NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip").getChildByName("chipL"));
        NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip").getChildByName("chipL").alpha = 0;
    }

    //將點選的籌碼做上特效
    nowChip.currentTarget.getChildByName("chip").getChildByName("chip_light").visible = true;
    nowChip.currentTarget.getChildByName("chip").getChildByName("chip_light").play(0, false);

    if(useChipIndexNow == true) {
        nowChip.currentTarget.getChildByName("chip_ptr").visible = true;
    }

    chipBtn = nowChip.target.name;
    LiterTimer = 1;

    //記錄現在點選的籌碼
    var the_Img = (nowChip.target.name + "").split("");
    nowChipPoint_Img = the_Img[(the_Img.length - 1)];
    nowChipPoint_point = nowChip.target.getChildByName("chip").getChildByName("chipText").text;
}

//註冊押注的滑鼠事件
function betMouseRegist() {
    var bet_btn = ["player_btn", "playerPair_btn", "tie_btn", "bankerPair_btn", "banker_btn"];
    for (var key in bet_btn) {
        NBC.allBetBtn.getChildByName(bet_btn[key]).on(Event.MOUSE_OVER, this, betImgOver);
    }
}

var bet_ShineTimer;  //押住鈕的發光事件
var betPair_ShineTimmer;
var betPair_ShineTimmer2;
function betShine(btn) {
    Laya.Tween.clearAll(NBC.allBetBtn.getChildByName(btn).getChildByName("light"));
    Laya.Tween.to(NBC.allBetBtn.getChildByName(btn).getChildByName("light"), { alpha: 0.6 }, 1000, Laya.Ease.linearOut);
    Laya.Tween.to(NBC.allBetBtn.getChildByName(btn).getChildByName("light"), { alpha: 0 }, 1000, Laya.Ease.linearOut, null, 1000);
}
function betImgOver(nowBet) {
    clearInterval(bet_ShineTimer);

    //清除緩動
    var bet_btn = ["player_btn", "playerPair_btn", "tie_btn", "bankerPair_btn", "banker_btn"];
    for(var key in bet_btn) {
        Laya.Tween.clearAll(NBC.allBetBtn.getChildByName(bet_btn[key]).getChildByName("light"));
        NBC.allBetBtn.getChildByName(bet_btn[key]).getChildByName("light").alpha = 0;
    }
    
    NBC.allBetBtn.getChildByName(nowBet.target.name).getChildByName("light").alpha = 0.6;
    Laya.Tween.to(NBC.allBetBtn.getChildByName(nowBet.target.name).getChildByName("light"), { alpha: 0 }, 500, Laya.Ease.linearOut, null, 500);
    bet_ShineTimer = setInterval(betShine, 2500, nowBet.target.name);
}
function betImgClick(nowBet) {
    //如果籌碼都隱藏了,則不能押分
    var totChips = needShowTotChips();
    if(set_GameValue.RemainingPointBet == true) {
        totChips.push("chip06");
    }
    if(totChips.length > 0) {
        //放上當前押注的籌碼
        var sortChip = returnMinToMaxSort();
        var c_img = nowChipPoint_Img + "";
        var c_point = (nowChipPoint_point == undefined) ? "餘分" : nowChipPoint_point + "";

        switch (nowBet.target.name) {
            case "player_btn":
                //傳送給server
                var result = {
                    action: "betting",
                    betBtn: "player_btn",
                    betPoint: c_point
                };
                NBC.socket.send(JSON.stringify(result));

                break;
            case "playerPair_btn":
                //傳送給server
                var result = {
                    action: "betting",
                    betBtn: "playerPair_btn",
                    betPoint: c_point
                };
                NBC.socket.send(JSON.stringify(result));

                break;
            case "tie_btn":
                //傳送給server
                var result = {
                    action: "betting",
                    betBtn: "tie_btn",
                    betPoint: c_point
                };
                NBC.socket.send(JSON.stringify(result));

                break;
            case "bankerPair_btn":
                //傳送給server
                var result = {
                    action: "betting",
                    betBtn: "bankerPair_btn",
                    betPoint: c_point
                };
                NBC.socket.send(JSON.stringify(result));

                break;
            case "banker_btn":
                //傳送給server
                var result = {
                    action: "betting",
                    betBtn: "banker_btn",
                    betPoint: c_point
                };
                NBC.socket.send(JSON.stringify(result));

                break;
        }
    }
    

}
//取消押注的滑鼠事件
function betMouseOffAll() {
    var bet_btn = ["player_btn", "playerPair_btn", "tie_btn", "bankerPair_btn", "banker_btn"];
    for (var key in bet_btn) {
        NBC.allBetBtn.getChildByName(bet_btn[key]).offAll();
    }
}

//取得目前押注的清單
function getBet_drawList(betBtnName) {
    switch (betBtnName) {
        case "player_btn":
            return Bet_playerList;
        case "playerPair_btn":
            return Bet_playerPairList;
        case "tie_btn":
            return Bet_tieList;
        case "bankerPair_btn":
            return Bet_bankerPairList;
        case "banker_btn":
            return Bet_bankerList;
    }
}


/**
 * 判斷Server傳送的json指令
 * @param {*Object} msg               Json物件
 * @param {*Object} ConView           NBC
 * @param {*bool/undefined} isJson    Json物件是否已轉換
 */
function CheckJsonAction(msg, ConView, isJson) {
    var action = (isJson == undefined || isJson != true)? JSON.parse(msg) : msg;
    var doThis = action.action;
    key_GameStatus = action.status;

    switch (doThis) {
        case "Setting":
            //讀取設定檔
            Game_setting(ConView, action);
            break;
        case "allGame":
            ClearDangurousPoint();
            clearAllBetChip();
            receiveChip_ToLoseConnect();
            receiveCard_ToLoseConnect();
            receiveCutCard_ToLoseConnect();
            resetAllWinnerLight();

            //讀取此場的資訊(歷程同步)
            checkShowLuDan(NBC); //顯示的路單圖
            all_gameWayBillList = action.way_Records;
            game_field = action.game_field;
            game_round = action.game_round;
            NBC.leftMenu.getChildByName("field").text = game_field + "-" + game_round;
            Psum = action.Psum;
            Bsum = action.Bsum;
            NBC.Msg.text = action.welcomeMsg;
            all_preGameList = action.preRecordsAll;
            NBC.R06_fieldRound.text = action.openRound;
            NBC.R06_player.text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.player_win;
            NBC.R06_tie.text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.tie;
            NBC.R06_banker.text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.banker_win;
            NBC.R06_playPair.text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.player_pair;
            NBC.R06_bankPair.text = (action.lastGameRecord == null) ? 0: action.lastGameRecord.banker_pair;
            NBC.R03_P.text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.player_win;
            NBC.R03_T.text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.tie;
            NBC.R03_B.text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.banker_win;
            NBC.R03_PP.text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.player_pair;
            NBC.R03_BP.text = (action.lastGameRecord == null) ? 0: action.lastGameRecord.banker_pair;
            NBC.leftMenu.getChildByName("player").getChildByName("times").text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.player_win;
            NBC.leftMenu.getChildByName("tie").getChildByName("times").text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.tie;
            NBC.leftMenu.getChildByName("banker").getChildByName("times").text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.banker_win;
            NBC.leftMenu.getChildByName("playerPair").getChildByName("times").text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.player_pair;
            NBC.leftMenu.getChildByName("bankerPair").getChildByName("times").text = (action.lastGameRecord == null) ? 0 : action.lastGameRecord.banker_pair;
            showPair = action.nowGameBigWayShowP;
            useChipIndexNow = action.nowGameChipIndex;

            allBetTotPoint_ToUpdata(action.betInfoTotPoint);

            var status = action.status;
            if(status == "PC1" || status == "openPC1" || status == "BC1" || status == "openBC1" ||
               status == "PC2" || status == "openPC2" || status == "BC2" || status == "openBC2" ||
               status == "PC3" || status == "openPC3" || status == "BC3" || status == "openBC3" ||
               status == "settlement") {
                getCardInfo_toFunction(action.CardInfo, action.cardBack);
                
                if(action.CardInfo[0] != 0 && action.CardInfo[0] != -1) {
                    NBC.Ppoint.getChildByName("TotPoint").text = (status == "settlement") ? action.nowRecord.playerSum : action.Psum;
                    NBC.Ppoint.getChildByName("TotPoint").scaleX = 1;
                    NBC.Ppoint.getChildByName("TotPoint").scaleY = 1;
                }
                if(action.CardInfo[1] != 0 && action.CardInfo[1] != -1) {
                    NBC.Bpoint.getChildByName("TotPoint").text =  (status == "settlement") ? action.nowRecord.bankerSum : action.Bsum;
                    NBC.Bpoint.getChildByName("TotPoint").scaleX = 1;
                    NBC.Bpoint.getChildByName("TotPoint").scaleY = 1;
                }
            }
            
            //補上路單
            drawAllRightWay();

            //前四場紀錄
            getPreRecords_Four(action.preRecordsFour);
            NBC.allMsg_showing.getChildByName("PBonlyOne_msg").alpha = 0;

            if(action.way_RecordsNum == 0) {
                //清除路單
                clearAllWayBillRecords();
            }

            if(action.lastGameRecord == null) {
                //更替新局
                NBC.R06_fieldRound.text = (game_round - 1);
                ChangeRight06AllText(action);
            }

            //時間歸0
            NBC.scroeBar.getChildByName("time_ten").skin = "";
            NBC.scroeBar.getChildByName("time_single").skin = "digitnumber/LD_0.jpg";

            if(action.nowGameShowPairBet == true) {
                NBC.allBetBtn.getChildByName("playerPair_btn").visible = true;
                NBC.allBetBtn.getChildByName("bankerPair_btn").visible = true;
                NBC.leftMenu.getChildByName("playerPair").visible = true;
                NBC.leftMenu.getChildByName("bankerPair").visible = true;
                NBC.preRecordBPair_show.visible = false;
                NBC.preRecordPPair_show.visible = false;
                NBC.right06.getChildByName("hiddenPair").visible = false;
                NBC.right03.getChildByName("hiddenPair").visible = false;
            }else {
                NBC.allBetBtn.getChildByName("playerPair_btn").visible = false;
                NBC.allBetBtn.getChildByName("bankerPair_btn").visible = false;
                NBC.leftMenu.getChildByName("playerPair").visible = false;
                NBC.leftMenu.getChildByName("bankerPair").visible = false;
                NBC.preRecordBPair_show.visible = true;
                NBC.preRecordPPair_show.visible = true;
                NBC.right06.getChildByName("hiddenPair").visible = true;
                NBC.right03.getChildByName("hiddenPair").visible = true;
            }
            
            //readNowField, startGame, bet, stopBet, cutCard, settlement, receiveCard
            //PC1, openPC1, BC1, openBC1, PC2, openPC2, BC2, openBC2, PC3, openPC3, BC3, openBC3,
            switch(action.status) {
                case "readNowField":
                    msg = {
                        action: "changeField",
                        game_field: action.game_field,
                        game_round: action.game_round,
                        welcomeMsg: action.welcomeMsg,
                        way_RecordsNum: action.way_RecordsNum,
                        lastGameRecord: action.lastGameRecord,
                        useChipIndex: action.nowGameChipIndex
                    };
                    CheckJsonAction(msg, ConView, true);
                     break;
                case "startGame":
                    msg = {
                        action: "StartGame",
                        startBetMsg: "請押分"
                    }
                    CheckJsonAction(msg, ConView, true);
                    break;
                case "bet":
                    if(setting_login.nowLogin != "") {
                        NBC.Retirement.visible = set_GameValue.RetiredBtn;
                        NBC.continuBet.visible = set_GameValue.RetentionBtn;
                    }

                    if(useChipIndexNow == false) {
                        var TotChips = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
                        for (var ch in TotChips) {
                            NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip_ptr").visible = false;
                        }
                    }else {
                        //只啟用現在所選取的籌碼的指標
                        var TotChips = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
                        for (var ch in TotChips) {
                            NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip_ptr").visible = false;
                            NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip").getChildByName("chip_light").visible = false;
                            NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip").getChildByName("chipL").alpha = 0;
                        }
                        NBC.chips.getChildByName("chip0" + nowChipPoint_Img).getChildByName("chip_ptr").visible = false;
                        NBC.chips.getChildByName("chip0" + nowChipPoint_Img).getChildByName("chip").getChildByName("chip_light").visible = false;
                        NBC.chips.getChildByName("chip0" + nowChipPoint_Img).getChildByName("chip_ptr").visible = true;
                    }

                    DroopChipsMouseAll();
                    betMouseOffAll();
                    betMouseRegist();
                    showChips(ConView);
                    reciprocalTime(ConView, action.reciprocal_num);
                    break;
                case "StopBet":
                    msg = {
                        action: "StopBet"
                    };
                    CheckJsonAction(msg, ConView, true);
                    break;
                case "cutCard":
                    if(action.nowCutCard == undefined) {
                        action.nowCutCard = 0;
                    }
                    msg = {
                        action: "cutCard",
                        cutCardNum: action.nowCutCard,
                        totCutNum: action.totCutNum
                    };
                    CheckJsonAction(msg, ConView, true);
                    break;
                case "cutCardEnd":
                    clearInterval(cutCard_dotTimer);
                    NBC.CutCard.visible = false;
                    break;
                case "PC1":
                case "openPC1":
                case "BC1":
                case "openBC1":
                case "PC2":
                case "BC2":
                case "PC3":
                case "BC3":
                case "openBC3":
                case "openPC2":
                case "openBC2":
                case "openPC3":

                    //顯示天停牌
                    receiveChip_ToLoseConnect();
                    resetAllWinnerLight();
                    receiveCutCard_ToLoseConnect();
                    if(status == "openPC2" || status == "openBC2" || status == "openPC3") {
                        showLicensing_CardStand(action.CardInfo);
                    }else {
                        NBC.PNatural.getChildByName("NaturalStand").skin = "";
                        NBC.PNatural.pos(8, -404);
                        NBC.BNatural.getChildByName("NaturalStand").skin = "";
                        NBC.BNatural.pos(708, -404);
                    }
                    break;
                case "settlement":
                    msg = {
                        action: "Settlement",
                        game_field: action.game_field,
                        game_round: action.game_round,
                        PC1: action.nowRecord.PC1,
                        BC1: action.nowRecord.BC1,
                        PC2: action.nowRecord.PC2,
                        BC2: action.nowRecord.BC2,
                        PC3: action.nowRecord.PC3,
                        BC3: action.nowRecord.BC3,
                        playerSum: action.nowRecord.playerSum,
                        bankerSum: action.nowRecord.bankerSum,
                        pair: action.nowRecord.pair,
                        winner: action.nowRecord.winner,
                        time: action.nowRecord.time,
                        way_Records: action.way_Records,
                        lastGameRecord: action.lastGameRecord,
                        preRecordsFour: action.preRecordsFour,
                        show_pair: action.nowGameBigWayShowP
                    };
                    receiveShow_NSstand(msg);
                    CheckJsonAction(msg, ConView, true);
                    break;
                case "receiveCard":
                    receiveChip_ToLoseConnect();
                    receiveCutCard_ToLoseConnect();
                    receiveAll_pukerCard(ConView);
                    resetAllWinnerLight();
                    break;
                case "":
                case "endGame":
                    clearAllBetChip();
                    showGameIsStop();
                    resetAllWinnerLight();
                    receiveChip_ToLoseConnect();
                    receiveCard_ToLoseConnect();
                    receiveCutCard_ToLoseConnect();
                    showGetPointTot(0);
                    clearChipGet_DrawList();
                    break;
                default:
                    break;
            }

            break;
        case "changeField":
            //更新場次,訊息紀錄
            NBC.allMsg_showing.getChildByName("PBonlyOne_msg").alpha = 0;
            game_field = action.game_field;
            game_round = action.game_round;
            NBC.leftMenu.getChildByName("field").text = game_field + "-" + game_round;
            if(NBC.Msg.text != action.welcomeMsg) {
                clearInterval(msgTextShine);
                msgTextShine = null;
                Laya.Tween.clearAll(NBC.Msg);
                NBC.Msg.text = action.welcomeMsg;
                NBC.Msg.y = 0;
                msgTextToShow();
            }

            //籌碼指標
            if(action.useChipIndex == undefined) {
                useChipIndexNow = set_GameValue.UseChipsIndex;
            }
            
            if(useChipIndexNow == false) {
                var TotChips = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
                for (var ch in TotChips) {
                    NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip_ptr").visible = false;
                }
            }else {
                //只啟用現在所選取的籌碼的指標
                var TotChips = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
                for (var ch in TotChips) {
                    NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip_ptr").visible = false;
                    NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip").getChildByName("chip_light").visible = false;
                    NBC.chips.getChildByName(TotChips[ch]).getChildByName("chip").getChildByName("chipL").alpha = 0;
                }
                NBC.chips.getChildByName("chip0" + nowChipPoint_Img).getChildByName("chip_ptr").visible = false;
                NBC.chips.getChildByName("chip0" + nowChipPoint_Img).getChildByName("chip").getChildByName("chip_light").visible = false;
                NBC.chips.getChildByName("chip0" + nowChipPoint_Img).getChildByName("chip_ptr").visible = true;
            }

            if(action.way_RecordsNum == 0) {
                //清除路單
                clearAllWayBillRecords();
            }

            if(action.lastGameRecord !== null) {
                //更替新局
                NBC.R06_fieldRound.text = (game_round - 1);
                ChangeRight06AllText(action);
            }

            resetAllWinnerLight();
            betMouseOffAll();
            
            break;
        case "StartGame":
            NBC.allMsg_showing.getChildByName("PBonlyOne_msg").alpha = 0;
            if(setting_login.nowLogin != "") {
                NBC.Retirement.visible = set_GameValue.RetiredBtn;
                if(ShouldShowContinuBet() == true) {
                    NBC.continuBet.visible = set_GameValue.RetentionBtn;
                }
            }else {
                NBC.Retirement.visible = false;
                NBC.continuBet.visible = false;
            }

            //將移動過的籌碼歸位
            DropChipPos_toOrigin();

            if (set_GameValue.TieBet == true) {
                NBC.allBetBtn.getChildByName("playerPair_btn").visible = true;
                NBC.allBetBtn.getChildByName("bankerPair_btn").visible = true;
                NBC.leftMenu.getChildByName("playerPair").visible = true;
                NBC.leftMenu.getChildByName("bankerPair").visible = true;
                NBC.preRecordBPair_show.visible = false;
                NBC.preRecordPPair_show.visible = false;
                NBC.right06.getChildByName("hiddenPair").visible = false;
                NBC.right03.getChildByName("hiddenPair").visible = false;
            } else {
                NBC.allBetBtn.getChildByName("playerPair_btn").visible = false;
                NBC.allBetBtn.getChildByName("bankerPair_btn").visible = false;
                NBC.leftMenu.getChildByName("playerPair").visible = false;
                NBC.leftMenu.getChildByName("bankerPair").visible = false;
                NBC.preRecordBPair_show.visible = true;
                NBC.preRecordPPair_show.visible = true;
                NBC.right06.getChildByName("hiddenPair").visible = true;
                NBC.right03.getChildByName("hiddenPair").visible = true;
            }

            if(set_GameValue.AutoRetention == true) {
                //自動續押
                ContinueClick();
            }
      
            DroopChipsMouseAll();
            betMouseRegist();
            showChips(ConView);
            showStartBet_msg(ConView, "請押分");
            break;
        case "BetReciprocal":
            reciprocalTime(ConView, action.reciprocal_num);
            break;
        case "betResult":
            //接到押點成功後將畫籌碼的list重畫(如果押的點數是對的就不重畫list)
            clearChipDrawList(action.betBtn);
            resetBetChipList(action.betBtn, action.betPoint);
            
            var name = action.betBtn + "Betchip";
            var dropName = action.betBtn + "Dropchip";
            var drawList = getBet_drawList(action.betBtn);
            var ActionBetPoint = (action.betPoint != 0) ? action.betPoint : "";
            NBC.allBetBtn.getChildByName(action.betBtn).getChildByName("sum").text = ActionBetPoint;
            NBC[dropName].getChildByName("sum").text = ActionBetPoint;      
            showBetPoint(action.totPoint);
            user_betPoint.nowBetTot = action.totPoint;

            //更新使用者點數(取最後6位數)
            showUserTotPoint(action.showUser_point);
            
            for (var i = 0, max = drawList[0].length; i < max; i++) {
                NBC[name].graphics.drawTexture(Laya.loader.getRes("chip/chip" + drawList[0][i] + ".png"), 0, i * (-3) - 3);
                NBC[name].getChildByName("chipText").text = (drawList[0][i] == 6) ? "" : drawList[1][i];
                NBC[name].getChildByName("chipText").y = i * (-3) + 22.5;

                NBC[dropName].graphics.drawTexture(Laya.loader.getRes("chip/chip" + drawList[0][i] + ".png"), 0, i * (-3) - 3);
                NBC[dropName].getChildByName("chipText").text = (drawList[0][i] == 6) ? "" : drawList[1][i];
                NBC[dropName].getChildByName("chipText").y = i * (-3) + 22.5;
            }

            NBC.allBetBtn.getChildByName(action.betBtn).getChildByName("circle").scaleX = 1;
            NBC.allBetBtn.getChildByName(action.betBtn).getChildByName("circle").scaleY = 1;
            NBC.allBetBtn.getChildByName(action.betBtn).getChildByName("circle").alpha = 0.3;
            Laya.Tween.to(NBC.allBetBtn.getChildByName(action.betBtn).getChildByName("circle"), { scaleX: 0, scaleY: 0, alpha: 0 }, 500, Laya.Ease.linear);

            //播放音效
            if (set_GameValue.UseChips) {
                SoundManager.playSound("res/sound/chip.mp3", 1);
                SoundManager.setSoundVolume(set_GameValue.chipsVoice, "res/sound/chip.mp3");
            }

            //押分大餘總點時總點做閃爍
            if(action.totPoint > action.user_point) {
                if(!DangurousPointTimer && !DangurousPointTimer2) {
                   DangurousPoint(); 
                }
            }else {
                ClearDangurousPoint();
            }

            break;
        case "RetireBet":
            showBetPoint(action.totPoint);
            user_betPoint.nowBetTot = action.totPoint;
            showUserTotPoint(action.showUser_point);
            var clearList = ["player_btn", "playerPair_btn", "tie_btn", "bankerPair_btn", "banker_btn"];
            for (var key in clearList) {
                NBC.allBetBtn.getChildByName(clearList[key]).getChildByName("sum").text = "";
                NBC[clearList[key] + "Betchip"].graphics.clear();
                NBC[clearList[key] + "Betchip"].getChildByName("chipText").text = "";
                NBC[clearList[key] + "Dropchip"].graphics.clear();
                NBC[clearList[key] + "Dropchip"].getChildByName("chipText").text = "";
                NBC[clearList[key] + "Dropchip"].getChildByName("sum").text = "";
            }

            Bet_playerList = [[], []];
            Bet_playerPairList = [[], []];
            Bet_tieList = [[], []];
            Bet_tieList = [[], []];
            Bet_bankerList = [[], []];

            if(action.totPoint < action.user_point) {
                ClearDangurousPoint();
            }

            break;
        case "RetireBetOne":
            //退押其中一個押注區的籌碼
            showBetPoint(action.totPoint);
            user_betPoint.nowBetTot = action.totPoint;
            showUserTotPoint(action.showUser_point);

            var clearList = getBet_drawList(action.betBtn);
            NBC.allBetBtn.getChildByName(action.betBtn).getChildByName("sum").text = "";
            NBC[action.betBtn + "Betchip"].graphics.clear();
            NBC[action.betBtn + "Betchip"].getChildByName("chipText").text = "";
            NBC[action.betBtn + "Dropchip"].graphics.clear();
            NBC[action.betBtn + "Dropchip"].getChildByName("chipText").text = "";
            NBC[action.betBtn + "Dropchip"].getChildByName("sum").text = "";

            switch (action.betBtn) {
                case "player_btn":
                    Bet_playerList = [[], []];
                    break;
                case "playerPair_btn":
                    Bet_playerPairList = [[], []];;
                    break;
                case "tie_btn":
                    Bet_tieList = [[], []];;
                    break;
                case "bankerPair_btn":
                    Bet_bankerPairList = [[], []];;
                    break;
                case "banker_btn":
                    Bet_bankerList = [[], []];;
                    break;
            }

            if(action.totPoint < action.user_point) {
                ClearDangurousPoint();
            }

            break;
        case "continuBet":
            //先清掉桌面上的籌碼
            if(Bet_playerList.length > 0 || Bet_playerPairList.length > 0 || Bet_tieList.length > 0 || Bet_bankerPairList.length > 0 || Bet_bankerList.length > 0) {
                showBetPoint(0);
                var clearList = ["player_btn", "playerPair_btn", "tie_btn", "bankerPair_btn", "banker_btn"];
                for (var key in clearList) {
                    NBC.allBetBtn.getChildByName(clearList[key]).getChildByName("sum").text = "";
                    NBC[clearList[key] + "Betchip"].graphics.clear();
                    NBC[clearList[key] + "Betchip"].getChildByName("chipText").text = "";
                    NBC[clearList[key] + "Dropchip"].graphics.clear();
                    NBC[clearList[key] + "Dropchip"].getChildByName("chipText").text = "";
                    NBC[clearList[key] + "Dropchip"].getChildByName("sum").text = "";
                }

                Bet_playerList = [[], []];
                Bet_playerPairList = [[], []];
                Bet_tieList = [[], []];
                Bet_bankerPairList = [[], []];
                Bet_bankerList = [[], []];
            }

            if(action.preBet["player_btn"] > 0) {
                reBetClick_List("player_btn", action.preBet["player_btn"]);
            }
            if(action.preBet["playerPair_btn"] > 0) {
                reBetClick_List("playerPair_btn", action.preBet["playerPair_btn"]);
            }
            if(action.preBet["tie_btn"] > 0) {
                reBetClick_List("tie_btn", action.preBet["tie_btn"]);
            }
            if(action.preBet["bankerPair_btn"] > 0) {
                reBetClick_List("bankerPair_btn", action.preBet["bankerPair_btn"]);
            }
            if(action.preBet["banker_btn"] > 0) {
                reBetClick_List("banker_btn", action.preBet["banker_btn"]);
            }

            break;
        case "cannotBet":
            //未登入不能押分
            var CNotB_Msg = NBC.allMsg_showing.getChildByName("cannotBet_msg");
            Laya.Tween.clearAll(NBC.allMsg_showing.getChildByName("cannotBet_msg"));
            if(CNotB_Msg.alpha > 0) {
                CNotB_Msg.alpha = 1;
            }else {
                Laya.Tween.to(NBC.allMsg_showing.getChildByName("cannotBet_msg"), { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
            }
            Laya.Tween.to(NBC.allMsg_showing.getChildByName("cannotBet_msg"), { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);
            break;
        case "PBOnlyOne":
            //莊閒只能押一邊
            var PBOnly_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");      
            Laya.Tween.clearAll(PBOnly_Msg);    
            PBOnly_Msg.getChildByName("showText").text = "莊閒只能押一邊!";
            if(PBOnly_Msg.alpha > 0) {
                PBOnly_Msg.alpha = 1;
            }else {
                Laya.Tween.to(PBOnly_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
            } 
            Laya.Tween.to(PBOnly_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);         
            break;
        case "StopBet":
            //停止押分
            NBC.Retirement.visible = false;
            NBC.continuBet.visible = false;
            resetAllWinnerLight();
            DroopChipsMouseOffAll();
            betMouseOffAll();
            receiveChips(ConView); 
            break;
        case "cutCard":
            //播放語音
            if (set_GameValue.UseVoice && action.cutCardNum == 1) {
                SoundManager.playSound("res/sound/CutCardStart.mp3", 1);
                SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/CutCardStart.mp3");
            }

            NBC.CutCard.visible = true;
            NBC.CutCard.getChildByName("cutShow").text = action.cutCardNum + " / " + action.totCutNum;

            if(action.cutCardNum == 1) {
                //切第一張牌時運作動畫
                run_CutCardDot();
            }
            
            break;
        case "cutCardEnd":

            //播放語音
            if (set_GameValue.UseVoice) {
                SoundManager.playSound("res/sound/CutCardEnd.mp3", 1);
                SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/CutCardEnd.mp3");
            }

            clearInterval(cutCard_dotTimer);
            receiveCutCard_ToLoseConnect();
            break;
        case "Licensing":
            //將牌定位
            Licensing_pukerBack(action.cardName, 0, 236, action.cardBack);
            break;
        case "OpenCard":

            //開牌,顯示點數
            Licensing_puker(action.cardName, action.card, action.cardName);
            showPoint(ConView, action.cardName, action.point);
            break;
        case "NaturalCard":
            //天牌
            if(set_GameValue.DayCardAndStopCard == true) {
                switch (action.cardName) {
                case "PC":
                    ConView["PNatural"].getChildByName("NaturalStand").skin = "image/NATURAL_C.PNG";
                    Laya.Tween.to(ConView["PNatural"], { y: 290 }, 1000, Laya.Ease.bounceOut, null, 3000);
                    break;
                case "BC":
                    ConView["BNatural"].getChildByName("NaturalStand").skin = "image/NATURAL_C.PNG";
                    Laya.Tween.to(ConView["BNatural"], { y: 290 }, 1000, Laya.Ease.bounceOut, null, 3000);
                    break;
                }
            }           
            break;
        case "StandCard":
            //停牌
            if(set_GameValue.DayCardAndStopCard == true) {
                switch (action.cardName) {
                case "PC":
                    ConView["PNatural"].getChildByName("NaturalStand").skin = "image/STAND_C.png";
                    Laya.Tween.to(ConView["PNatural"], { y: 290 }, 1000, Laya.Ease.bounceOut, null, 3000);
                    break;
                case "BC":
                    ConView["BNatural"].getChildByName("NaturalStand").skin = "image/STAND_C.png";
                    Laya.Tween.to(ConView["BNatural"], { y: 290 }, 1000, Laya.Ease.bounceOut, null, 3000);
                    break;
                }
            }    
            break;
        case "Settlement_user":
            ClearDangurousPoint();
            //將有押注的場次紀錄下來
            user_betPoint.haveBet.push(action.haveBet);
            //如果加入的場次大餘保留的記錄數
            if(user_betPoint.haveBet.length > (set_GameValue.RecordLoadNum + set_GameValue.LoginKeepsNum)) {
                user_betPoint.haveBet.splice(1, 1);
            }

            //有得分才更新總點
            if(action.haveBet.totGetPoint > 0) {
                showUser_Getpoint(action.haveBet.allTotPoint);
                showGetPointTot(action.haveBet.totGetPoint);
            }

            //送出押注得分
            if(action.haveBet.playerBet > 0) {
                getGetChipList("player_btn", action.haveBet.playerBet);
                drawChip_getPointsToShow("player_btn");
                NBC.player_btngetSum.text = action.haveBet.playerBet;
            }
            if(action.haveBet.tieBet > 0) {
                getGetChipList("tie_btn", action.haveBet.tieBet);
                drawChip_getPointsToShow("tie_btn");
                NBC.tie_btngetSum.text = action.haveBet.tieBet;
            }
            if(action.haveBet.bankerBet > 0) {
                getGetChipList("banker_btn", action.haveBet.bankerBet);
                drawChip_getPointsToShow("banker_btn");
                NBC.banker_btngetSum.text = action.haveBet.bankerBet;
            }
            if(action.haveBet.playPairBet > 0) {
                getGetChipList("playerPair_btn", action.haveBet.playPairBet);
                drawChip_getPointsToShow("playerPair_btn");
                NBC.playerPair_btngetSum.text = action.haveBet.playPairBet;
            }
            if(action.haveBet.bankPairBet > 0) {
                getGetChipList("bankerPair_btn", action.haveBet.bankPairBet);
                drawChip_getPointsToShow("bankerPair_btn");
                NBC.bankerPair_btngetSum.text = action.haveBet.bankPairBet;
            }

            //將有押注的字變白,小,將有押注的籌碼變透明
            //如果開和,判斷莊閒是否有押,有押則不變色
            if(action.haveBet.winner == 3) {
                winnerTie_BetTextAndChipToDark();
            }else {
                allBetTextAndChipToDark();
            }

            break;
        case "Settlement":
            ClearDangurousPoint();
            //結算,畫路單圖以及紀錄 
            all_gameWayBillList = action.way_Records;

            //將此筆記錄加進遊戲清單
            if(setting_login.nowLogin != "") {
                if(set_GameValue.BeforeRecord != 0 && user_betPoint.haveBet.length >= 0) {
                    //只加入有押注場次
                    if(user_betPoint.haveBet.length > 0) {
                        var betRecord = user_betPoint.haveBet[user_betPoint.haveBet.length - 1];
                        if(betRecord.field == action.gameField && betRecord.round == action.gameRound) {
                            all_preGameList.unshift(action);
                        }    
                        if(all_preGameList.length > (set_GameValue.RecordLoadNum + set_GameValue.LoginKeepsNum)) {
                            all_preGameList.splice(all_preGameList.length - 1, 1);
                        }
                    }
                }else {
                    all_preGameList.unshift(action);
                    if(all_preGameList.length > (set_GameValue.RecordLoadNum + set_GameValue.LoginKeepsNum)) {
                        all_preGameList.splice(all_preGameList.length - 1, 1);
                    }
                }
            }else {
                all_preGameList.unshift(action);
                if(all_preGameList.length > set_GameValue.RecordLoadNum) {
                    all_preGameList.splice(all_preGameList.length - 1, 1);
                }
            }


            //畫路單
            if(action.show_pair == undefined) {
                showPair = set_GameValue.BigWayShowPair;
            }
            
            drawAllRightWay();
            settlementResult(action);
            getPreRecords_Four(action.preRecordsFour);
            ChangeRight06AllText(action);
            NBC.R06_fieldRound.text = action.gameRound;

            break;
        case "receiveCard":
            //依序收牌
            receiveAll_pukerCard(ConView);
            allBetTotPoint_ToUpdata(action.betInfoTotPoint);
            showGetPointTot(0);

            //清空得分的籌碼
            clearChipGet_DrawList();
            user_betPoint.nowBetTot = 0;
            NBC.Ppoint.getChildByName("TotPoint").text = "";
            NBC.Bpoint.getChildByName("TotPoint").text = "";
            
            //將輸家的牌變回原來的亮度
            makeCardLightToOrginAll(); 
            resetAllWinnerLight();
            allBetTextAndChipToOrgin();
            
            break;
        case "loginSuccess":
            //登入成功
            login_Success(action.account);
            showUserTotPoint(action.showUser_point);
            all_preGameList = action.preRecordsAll;
            set_GameValue.RecordLoadNum = action.RecordLoadNum;
            set_GameValue.LoginKeepsNum = action.LoginKeepsNum;

            if(action.status == "bet") {
                DroopChipsMouseOffAll();
                DroopChipsMouseAll();
                NBC.Retirement.visible = set_GameValue.RetiredBtn;
                if(ShouldShowContinuBet() === true || action.showRebetBtn === true) {
                    NBC.continuBet.visible = set_GameValue.RetentionBtn;
                }else {
                    NBC.continuBet.visible = false;
                }
            }else {
                NBC.Retirement.visible = false;
                NBC.continuBet.visible = false;
            }

            //若有押注則將押注畫面還原(若在押注中)
            if(action.status != "endGame" || action.status != "receiveCard" || action.status != ""){
               if(action.user_betInfo != undefined || action.user_betInfo != null) {
                    resetBet_ToLoseConnect(action.user_betInfo);
                    if(action.user_point < action.user_betInfo.totPoint) {
                        if(!DangurousPointTimer && !DangurousPointTimer2) {
                            DangurousPoint();
                        }
                    }else {
                        ClearDangurousPoint();
                    }

                    //如果是在結算畫面則將得分訊息還原
                    if(action.status == "settlement") {
                        msg = {
                            action: "Settlement_user",
                            haveBet: action.user_betInfo
                        };
                        CheckJsonAction(msg, NBC, true);
                    }
                }
            }

            break;
        case "loginFiled":
            //登入失敗
            login_Filed(action.fieldMsg);
            break;
        case "loginOut":
            //登出
            login_Out(action.account);
            //到時前場紀錄需在讀一次保留場次
            all_preGameList = [];
            all_preGameList = action.preRecordsAll;
            user_betPoint.haveBet = [];
            set_GameValue.RecordLoadNum = action.RecordLoadNum;
            set_GameValue.LoginKeepsNum = action.LoginKeepsNum;
            //續退押按鈕收起
            NBC.Retirement.visible = false;
            NBC.continuBet.visible = false;

            showUserTotPoint(0);
            break;
        case "AllBetTotPoint":
            //全場押分資訊
            allBetTotPoint_ToUpdata(action.allBetPoint);

            //更新押分資訊文字
            break;
        case "PointToBetMin":
            //請先押最低分
            //如果籌碼只剩餘分則不用跳訊息
            var totChips = needShowTotChips();
            if(set_GameValue.RemainingPointBet == true) {
                totChips.push("chip06");
            }
            if(totChips.length == 1 && totChips[totChips.length-1] == "chip06") {
                //不秀訊息    
            }else {
                var PTBetM_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");
                Laya.Tween.clearAll(PTBetM_Msg);
                PTBetM_Msg.getChildByName("showText").text = "請先押最低押分";
                if(PTBetM_Msg.alpha > 0) {
                    PTBetM_Msg.alpha = 1;
                }else {
                    Laya.Tween.to(PTBetM_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
                }  
                Laya.Tween.to(PTBetM_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);            
            }
            break;
        case "PointCanNotBet":
            //分數不足
            var PCB_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");
            Laya.Tween.clearAll(PCB_Msg);
            PCB_Msg.getChildByName("showText").text = "分數不足!";  
            if(PCB_Msg.alpha > 0) {               
                PCB_Msg.alpha = 1;
            }else {
                Laya.Tween.to(PCB_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
            }   
            Laya.Tween.to(PCB_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);                  
            break;
        case "PointBetOverMax":
            //超過單門押分限額
            var PbetOM_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");
            Laya.Tween.clearAll(PbetOM_Msg);
            PbetOM_Msg.getChildByName("showText").text = action.msgText;
            if(PbetOM_Msg.alpha > 0) {
                PbetOM_Msg.alpha = 1;
            }else {
                Laya.Tween.to(PbetOM_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
            }
            Laya.Tween.to(PbetOM_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);
            break;
        case "haveBetCanNotLogin":
            //尚有押分無法登入
            var HBNotLn_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");
            Laya.Tween.clearAll(HBNotLn_Msg);
            HBNotLn_Msg.getChildByName("showText").text = "尚有押分無法登入!";
            if(HBNotLn_Msg.alpha > 0) {
                HBNotLn_Msg.alpha = 1;
            }else {
                Laya.Tween.to(HBNotLn_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
            }
            Laya.Tween.to(HBNotLn_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);
            break;
        case "haveBetCanNotLoginOut":
            //尚有押分無法登出
            var HBNotLO_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");
            Laya.Tween.clearAll(HBNotLO_Msg);
            HBNotLO_Msg.getChildByName("showText").text = "尚有押分無法登出!";
            if(HBNotLO_Msg.alpha > 0) {
                HBNotLO_Msg.alpha = 1;
            }else {
                Laya.Tween.to(HBNotLO_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
            }
            Laya.Tween.to(HBNotLO_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);
            break;
        case "NotRemaining":
            //目前尚無餘分
            //如果籌碼只剩餘分則不用跳訊息
            var totChips = needShowTotChips();
            if(set_GameValue.RemainingPointBet == true) {
                totChips.push("chip06");
            }
            if(totChips.length == 1 && totChips[totChips.length-1] == "chip06") {
                //不秀訊息    
            }else {
                var NotR_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");
                Laya.Tween.clearAll(NotR_Msg);
                NotR_Msg.getChildByName("showText").text = "目前尚無餘分!";
                if(NotR_Msg.alpha > 0) {
                    NotR_Msg.alpha = 1;
                }else {
                    Laya.Tween.to(NotR_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
                }
                Laya.Tween.to(NotR_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);
            }
            break;
        case "endGame":
            //遊戲暫停
            clearAllBetChip();
            showGameIsStop();
            receiveChip_ToLoseConnect();
            receiveCard_ToLoseConnect();
            receiveCutCard_ToLoseConnect();
            break;
        case "OpenPoint":
            //開點
            showUserTotPoint(action.user_point);  
            //開點動畫
            showOpenThrowPoint(action.add_point, 1);

            if(action.totPoint < action.user_point) {
                ClearDangurousPoint();
            }else {
                if(!DangurousPointTimer && !DangurousPointTimer) {
                    DangurousPoint();
                } 
            }
            break;
        case "ThrowPoint":
            //棄(洗)點
            showUserTotPoint(action.user_point); 
            //洗點動畫
            showOpenThrowPoint(action.throw_point, 2);

            if(action.totPoint < action.user_point) {
                ClearDangurousPoint();
            }else {
                if(!DangurousPointTimer && !DangurousPointTimer) {
                    DangurousPoint();
                }
            }
            break;
        case "IsLive":
            //回傳存活訊息
            var Live = {
                action: "Live"
            };
            NBC.socket.send(JSON.stringify(Live));
            break;
        case "haveOtherDeviceLogin":
            //在其他裝置上登入
            Laya.Tween.clearAll(NBC.allMsg_showing.getChildByName("PBonlyOne_msg"));
            NBC.allMsg_showing.getChildByName("PBonlyOne_msg").getChildByName("showText").text = "您已在其他裝置登入!";
            Laya.Tween.to(NBC.allMsg_showing.getChildByName("PBonlyOne_msg"), { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
            break;
        default:
            clearAllBetChip();
            showGameIsStop();
            receiveChip_ToLoseConnect();
            receiveCard_ToLoseConnect();
            receiveCutCard_ToLoseConnect();
            break;
    }
}

//顯示籌碼
function showChips(ConView, action) {
    // var chipsTot = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
    var chipsTot = needShowTotChips();
    if(set_GameValue.RemainingPointBet == true) {
        chipsTot.push("chip06");
    }
    for (var i = chipsTot.length-1; i >= 0; i--) {
        if(chipsTot[i] != "chip06") {
            var CName = chipsTot[i].split("");
            NBC.chips.getChildByName(chipsTot[i]).getChildByName("chip").getChildByName("chipText").text = (set_GameValue["Denomination" + CName[CName.length-1]] == 0) ? "Max": set_GameValue["Denomination" + CName[CName.length-1]];
        }
        if (set_GameValue.RemainingPointBet == false) {
            NBC.chips.getChildByName("chip06").visible = false;
        }
        Laya.Tween.to(NBC.chips.getChildByName(chipsTot[i]), { x: 28 + (i * 60) }, 980, Laya.Ease.backInOut, null, (i*8));
    }

    if (nowChipPoint_point === 0) {
        nowChipPoint_point = (parseInt(set_GameValue.Denomination1) != NaN )? parseInt(set_GameValue.Denomination1) : "Max";//傳至server的點數若為max有可能會變為0
    }else {
        nowChipPoint_point = set_GameValue["Denomination" + nowChipPoint_Img];
    }

}

//顯示押分訊息框
function showStartBet_msg(ConView, msg) {
    //播放語音
    if (set_GameValue.UseVoice) {
        SoundManager.playSound("res/sound/StartBet.mp3", 1);
        SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/StartBet.mp3");
    }

    ConView["startBet_msg"].getChildByName("showText").text = msg;
    ConView["startBet_msg"].visible = true;
    ConView["startBet_msg"].alpha = 1;

    Laya.Tween.to(ConView["startBet_msg"], { alpha: 0 }, 2000, Laya.Ease.easeOutQuad, null, 4000);
}

//收回籌碼
function receiveChips(ConView) {
    //播放語音
    if (set_GameValue.UseVoice) {
        SoundManager.playSound("res/sound/StopBet.mp3", 1);
        SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/StopBet.mp3");
    }

    //清除押注按扭動畫
    clearInterval(bet_ShineTimer);

    var chipsTot = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
    for (var i = chipsTot.length-1; i >=0; i--) {
        Laya.Tween.to(NBC.chips.getChildByName(chipsTot[i]), { x: -250 - (i * 10) }, 800, Laya.Ease.backInOut, null);
    }

}

//顯示倒數計時時間
function reciprocalTime(ConView, time) {
    //切割字符
    time = time + "";
    timeArray = time.split("");

    switch (timeArray.length) {
        case 1:
            //1位數
            if (time < 4 && time > 0) {
                var bigNum_bar = NBC.bigNum.getChildByName("R_num");
                Laya.Tween.clearAll(bigNum_bar);
                bigNum_bar.skin = "digitnumber/R" + time + ".png";
                bigNum_bar.scaleX = 0;
                bigNum_bar.scaleY = 0;
                bigNum_bar.alpha = 0;

                Laya.Tween.to(bigNum_bar, { scaleX: 0.9, scaleY: 0.9, alpha: 1 }, 640, Laya.Ease.backOut, null);
                Laya.Tween.to(bigNum_bar, { scaleX: 1.1, scaleY: 1.1, alpha: 1 }, 600, Laya.Ease.quadOut, null, 500);
                Laya.Tween.to(bigNum_bar, {alpha: 0 }, 1000, Laya.Ease.linearIn, null,500);

                //倒數計時音效
                if (set_GameValue.UseReciprocal) {
                    SoundManager.playSound("res/sound/cnt_down.mp3", 1);
                    SoundManager.setSoundVolume(set_GameValue.reciprocalVoice, "res/sound/cnt_down.mp3");
                }
            }
            ConView["scroeBar"].getChildByName("time_ten").skin = "";
            ConView["scroeBar"].getChildByName("time_single").skin = "digitnumber/LD_" + time + ".jpg";

            break;
        case 2:
            ConView["scroeBar"].getChildByName("time_ten").skin = "digitnumber/LD_" + timeArray[0] + ".jpg";
            ConView["scroeBar"].getChildByName("time_single").skin = "digitnumber/LD_" + timeArray[1] + ".jpg";
            break;
        default:
            break;
    }

}

//發出牌背
function Licensing_pukerBack(Card, card_x, card_y, card_back) {
    var CBack = NBC[Card].getChildByName("CardBack");
    CBack.skin = "puker/puker_back/" + card_back + ".png";
    CBack.scaleX = 1;
    CBack.scaleY = 1;
    NBC[Card].getChildByName("CardImg").scaleX = 0;

    switch (Card) {
        case "PC1":
            card_x = 18;
            card_y = 236;
            break;
        case "PC2":
            card_x = 171;
            card_y = 236;
            break;
        case "PC3":
            card_x = 93;
            card_y = 289;
            if (set_GameValue.UseVoice == true) {
                SoundManager.playSound("res/sound/PlayerOuts.mp3", 1);
                SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/PlayerOuts.mp3");
            }
            break;
        case "BC1":
            card_x = 705;
            card_y = 236;
            break;
        case "BC2":
            card_x = 861;
            card_y = 236;
            break;
        case "BC3":
            card_x = 784;
            card_y = 289;
            if (set_GameValue.UseVoice == true) {
                SoundManager.playSound("res/sound/BankerOuts.mp3", 1);
                SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/BankerOuts.mp3");
            }
            break;
    }

    Laya.Tween.to(NBC[Card], { x: card_x, y: card_y }, 450, Laya.Ease.linear, null);
    //加上陰影
    if(NBC[Card].filters == undefined) {
        var glowFilter = new Laya.GlowFilter("#333333", 4, 4, 4);
        NBC[Card].filters = [glowFilter];
    }
    
}

//發牌(開牌)
function Licensing_puker(Card, cardNum, cardName) {
    Laya.Tween.to(NBC[Card].getChildByName("CardBack"), { scaleX: 1.1, scaleY: 1.1 }, 200, Laya.Ease.easeOutQuart, null);
    Laya.Tween.to(NBC[Card].getChildByName("CardBack"), { scaleX: 0 }, 220, Laya.Ease.easeOutQuart, null, 200);
    NBC[Card].getChildByName("CardImg").skin = "puker/puker_front/puker" + cardNum + ".png";
    Laya.Tween.to(NBC[Card].getChildByName("CardImg"), { scaleX: 1, scaleY: 1 }, 250, Laya.Ease.easeOutQuart, null, 420);
}

//顯示點數
function showPoint(ConView, cardName, point) {
    var PBpoint = "";
    var oldPoint = 0;
    var play_sound;
    var play_sound2 = "";
    if (cardName == "PC1" || cardName == "PC2" || cardName == "PC3") {
        PBpoint = ConView["Ppoint"];
        oldPoint = 0 + Psum;
        Psum = point;
        play_sound = "res/sound/OpenCardPoint/Player" + Psum + ".mp3";
    }
    if (cardName == "BC1" || cardName == "BC2" || cardName == "BC3") {
        PBpoint = ConView["Bpoint"];
        oldPoint = 0 + Bsum;
        Bsum = point;
        play_sound = "res/sound/OpenCardPoint/Banker" + Bsum + ".mp3";
    }

    Laya.Tween.to(PBpoint.getChildByName("TotPoint"), { scaleX: 1, scaleY: 1 }, 200, Laya.Ease.easeOutQuart, Laya.Handler.create(this, TotPoint_change, [PBpoint, point, oldPoint, play_sound]), 180);

}

function TotPoint_change(PBpoint, point, oldPoint, play_sound) {
    if (oldPoint != point) {
        PBpoint.getChildByName("TotPoint").text = point;
        Laya.Tween.to(PBpoint.getChildByName("TotPoint"), { scaleX: 1.3, scaleY: 1.3 }, 200, Laya.Ease.easeOutQuart, null);
    } else {
        PBpoint.getChildByName("TotPoint").text = point;
        Laya.Tween.to(PBpoint.getChildByName("TotPoint"), { scaleX: 1, scaleY: 1 }, 200, Laya.Ease.easeOutQuart, null);
    }

    //播放音效
    if (set_GameValue.UseVoice) {
        SoundManager.playSound(play_sound, 1);
        SoundManager.setSoundVolume(set_GameValue.Voice, play_sound);
    }

    Laya.Tween.to(PBpoint.getChildByName("TotPoint"), { scaleX: 1, scaleY: 1 }, 200, Laya.Ease.easeOutQuart, null, 200);
}


//結算
function settlementResult(Jaction) {
    clearInterval(bet_ShineTimer);
    clearInterval(betPair_ShineTimmer);
    clearInterval(betPair_ShineTimmer2);

    switch (Jaction.winner) {
        case 1:
            if (set_GameValue.UseVoice) {
                SoundManager.playSound("res/sound/PlayerWin.mp3", 1);
                SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/PlayerWin.mp3");
            }
            betShine("player_btn");
            bet_ShineTimer = setInterval(betShine, 2000, "player_btn"); //秀出贏家的亮光
            makeLoseCardToDark(Jaction.winner);
            break;
        case 2:
            if (set_GameValue.UseVoice) {
                SoundManager.playSound("res/sound/BankerWin.mp3", 1);
                SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/BankerWin.mp3");
            }
            
            betShine("banker_btn");
            bet_ShineTimer = setInterval(betShine, 2000, "banker_btn"); //秀出贏家的亮光
            makeLoseCardToDark(Jaction.winner);
            break;
        case 3:
            if (set_GameValue.UseVoice) {
                SoundManager.playSound("res/sound/TieWin.mp3", 1);
                SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/TieWin.mp3");
            }
            
            betShine("tie_btn");
            bet_ShineTimer = setInterval(betShine, 2000, "tie_btn"); //秀出贏家的亮光
            makeLoseCardToDark(Jaction.winner);
            break;
        default:
            break;
    }

    //秀出對子的亮光
    switch (Jaction.pair) {
        case 1:
            betShine("playerPair_btn");
            betPair_ShineTimmer = setInterval(betShine, 2000, "playerPair_btn"); 
            break;
        case 2:
            betShine("bankerPair_btn");
            betPair_ShineTimmer = setInterval(betShine, 2000, "bankerPair_btn"); 
            break;
        case 3:
            betShine("playerPair_btn");
            betPair_ShineTimmer = setInterval(betShine, 2000, "playerPair_btn");
            betShine("bankerPair_btn");
            betPair_ShineTimmer2 = setInterval(betShine, 2000, "bankerPair_btn"); 
            break;
    }
}

//將輸家的牌變暗
function makeLoseCardToDark(winner) {
    makeCardLightToOrginAll();    

    switch(winner) {
        case 1:
            NBC.BC1.getChildByName("CardImg").getChildByName("black").alpha = 0.4;
            NBC.BC2.getChildByName("CardImg").getChildByName("black").alpha = 0.4;
            NBC.BC3.getChildByName("CardImg").getChildByName("black").alpha = 0.4;
            break;
        case 2:
            NBC.PC1.getChildByName("CardImg").getChildByName("black").alpha = 0.4;
            NBC.PC2.getChildByName("CardImg").getChildByName("black").alpha = 0.4;
            NBC.PC3.getChildByName("CardImg").getChildByName("black").alpha = 0.4;
            break;
        case 3:
            break;
    }
}

//將牌變回原來的亮度
function makeCardLightToOrginAll() {
    NBC.BC1.getChildByName("CardImg").getChildByName("black").alpha = 0;
    NBC.BC2.getChildByName("CardImg").getChildByName("black").alpha = 0;
    NBC.BC3.getChildByName("CardImg").getChildByName("black").alpha = 0;
    NBC.PC1.getChildByName("CardImg").getChildByName("black").alpha = 0;
    NBC.PC2.getChildByName("CardImg").getChildByName("black").alpha = 0;
    NBC.PC3.getChildByName("CardImg").getChildByName("black").alpha = 0;
}


//收牌
function receiveAll_pukerCard(ConView) {
    //隱藏點數,重置天.停牌
    Laya.Tween.to(ConView["Ppoint"].getChildByName("TotPoint"), { scaleX: 0 }, 100, Laya.Ease.easeOutQuart, null, 130);
    Laya.Tween.to(ConView["Bpoint"].getChildByName("TotPoint"), { scaleX: 0 }, 120, Laya.Ease.easeOutQuart, null, 130);

    ConView["PNatural"].getChildByName("NaturalStand").skin = "";
    ConView["PNatural"].pos(8, -404);
    ConView["BNatural"].getChildByName("NaturalStand").skin = "";
    ConView["BNatural"].pos(708, -404);

    /**
     * 收牌順序為
     * 閒 1, 閒 2, 閒 3, 莊 1, 莊 2, 莊 3
     */
    var receiveSort = ["PC1", "PC2", "PC3", "BC1", "BC2", "BC3"];
    for (var i = 0, max = receiveSort.length; i < max; i++) {
        Laya.Tween.to(ConView[receiveSort[i]], { x: 400, y: -477 }, 250, Laya.Ease.linear, null, 150 * (i + 1));
    }

    Psum = 0;
    Bsum = 0;
    clearInterval(bet_ShineTimer);
    clearInterval(betPair_ShineTimmer);
    clearInterval(betPair_ShineTimmer2);
    RetireClick(false);
}

//畫路單///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 1.由server傳此場次的所有紀錄過來(如果client沒有場次的紀錄, 否則只傳此局)
 * 2.各路單解析所需紀錄(依照設定的場次來決定)
 * 3.先定位路單位置
 * 4.依序畫上路單(需先清空路單)
 */

//清除所有路單
function clearAllWayBillRecords() {
    all_gameWayBillList = [];
    NBC.right01.getChildByName("bgImg")._childs = [];
    WayBillManager = [];
    BigWay_list = [];
    NBC.right02.getChildByName("bgImg")._childs = [];
    WayBillManager_three = [];
    WayBillManager_threeB = [];
    WayBillManager_threeC = [];
    ThreeWay_listB = [];
    ThreeWay_listC = [];
    NBC.right03.getChildByName("bgImg")._childs = [];
    WayBillManager_Nine = [];
    BigWayNine_list = [];
    NBC.right04.getChildByName("bgImg")._childs = [];
    WayBillManager_Eye = [];
    WayBillManager_Small = [];
    WayBillManager_Cockroach = [];
    BigWayEye_list = [];
    BigWaySmall_list = [];
    BigWayCockroach_list = [];
    NBC.right05.getChildByName("bgImgN")._childs = [];
    NBC.right05.getChildByName("bgImgP")._childs = [];
    NBC.right05.getChildByName("bgImgB")._childs = [];
    WayBillManager_AskBigA = [];
    WayBillManager_AskBigB = [];
    WayBillManager_AskEye = [];
    WayBillManager_AskSmall = [];
    WayBillManager_AskCockroach = [];
    AskBigB_list = [];
    AskBigB_listToThree = [];
    WayBillAsk_PbtnList = [[], [], [], [], []];
    WayBillAsk_BbtnList = [[], [], [], [], []];
    WayBillManager_PAskbtn = [[], [], [], [], []];
    WayBillManager_BAskBbtn = [[], [], [], [], []];
    NBC.R04_P1.skin = "";
    NBC.R04_P2.skin = "";
    NBC.R04_P3.skin = "";
    NBC.R04_B1.skin = "";
    NBC.R04_B2.skin = "";
    NBC.R04_B3.skin = "";
}


//畫上所有路單
function drawAllRightWay() {
    //大路
    positionWayBill_big();
    drawBigWay();

    //三路
    drawWayBill_threeAll();

    //大路九列
    positionWayBill_bigWayNine();
    drawWayBill_bigWayNine();

    //蟑螂路
    positionWayBill_askBigB();
    drawWayBill_cockroachAll();

    //莊閒問路
    drawWayBill_askWayAll();
    drawAsk_Btn(1);
    drawAsk_Btn(2);
}


//拆解路單記錄陣列
function patingBigWay(wayBillStr) {
    //先拆解陣列
    var newStr = wayBillStr.split("");
    for (var key in newStr) {
        newStr[key] = parseInt(newStr[key]);
    }
    return newStr;
}

//大路路單
function positionWayBill_big() {
    //寫入路單紀錄(取出全場的路單記錄)
    var pre_winner = "";
    var way_list = 0;
    var wayBill = [];
    var totWay = [];

    for (var i = 0, max = all_gameWayBillList.length; i < max; i++) {
        var the_cord = patingBigWay(all_gameWayBillList[i]);
        if (i == 0) {
            //第一個直接寫入
            wayBill.push(the_cord[0]);
            pre_winner = the_cord[0];
        } else {
            //與前場贏家不同需換行
            if (pre_winner != the_cord[0]) {
                if (pre_winner == 3) {
                    //如果前一個路單是平手,則繼續往前比
                    for (var j = wayBill.length - 1; j < wayBill.length; j--) {
                        if (wayBill[j] != pre_winner) {
                            if (wayBill[j] == the_cord[0]) {
                                //接著畫
                                //如果y滿6則換行
                                if (wayBill.length >= 6) {
                                    totWay.push(wayBill);
                                    wayBill = [];
                                    wayBill.push(the_cord[0]);
                                    pre_winner = the_cord[0];
                                } else {
                                    wayBill.push(the_cord[0]);
                                    pre_winner = the_cord[0];
                                }
                            } else {
                                //換行(先將前一行記錄寫入)
                                totWay.push(wayBill);
                                wayBill = [];
                                wayBill.push(the_cord[0]);
                                pre_winner = the_cord[0];
                            }

                            break;
                        }
                    }//end for.

                } else {
                    if (the_cord[0] == 3) {
                        //自己為和,接著畫
                        //如果y滿6則換行
                        if (wayBill.length >= 6) {
                            totWay.push(wayBill);
                            wayBill = [];
                            wayBill.push(the_cord[0]);
                            pre_winner = the_cord[0];
                        } else {
                            wayBill.push(the_cord[0]);
                            pre_winner = the_cord[0];
                        }
                    } else {
                        //與前一個路單不一樣(先將前一行記錄寫入)
                        totWay.push(wayBill);
                        wayBill = [];
                        wayBill.push(the_cord[0]);
                        pre_winner = the_cord[0];
                    }
                }
            } else {
                //與前一個路單一樣
                //如果y滿6則換行
                if (wayBill.length >= 6) {
                    totWay.push(wayBill);
                    wayBill = [];
                    wayBill.push(the_cord[0]);
                    pre_winner = the_cord[0];
                } else {
                    wayBill.push(the_cord[0]);
                    pre_winner = the_cord[0];
                }

            }
        }//end main if.
    }//end main for.

    //將最後排序的路單加入
    totWay.push(wayBill);
    BigWay_list = totWay;
}

function drawBigWay() {
    //先清空路單圖
    if (NBC.right01.getChildByName("bgImg")._childs.length > 0) {
        NBC.right01.getChildByName("bgImg")._childs = [];
        WayBillManager = [];
    }

    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 28;
    var nowGetList = 0;
    var s_num = 0;

    //畫上路單(大路)   
    if (BigWay_list.length > 23) {

        for (var i = (BigWay_list.length - 23); i < BigWay_list.length; i++) {
            nowGetList += BigWay_list[i].length;
        }

        nowGetList = all_gameWayBillList.length - nowGetList;   //取出要從哪個計路開始取

        for (var i = (BigWay_list.length - 23); i < BigWay_list.length; i++) {
            for (var j = 0; j < BigWay_list[i].length; j++) {
                var the_cord = patingBigWay(all_gameWayBillList[nowGetList]);
                WayBillManager[j] = new WayBillBall();   //(要注意new 一次就好,重覆new有可能會造成記憶體洩漏問題)
                NBC.right01.getChildByName("bgImg").addChild(WayBillManager[j].MainNode);
                WayBillManager[j].initBig();
                if(showPair == true) {
                    WayBillManager[j].setBellBig(BigWay_list[i][j], the_cord[1], the_cord[2]);
                }else {
                    WayBillManager[j].setBellBig(BigWay_list[i][j], the_cord[1]);
                }
                
                var x = o * m;
                var y = o * j;

                WayBillManager[j].MainNode.pos(18 + x, 10 + y);
                n++;
                nowGetList++;
            }
            m++;
        }
    } else {
        for (var i = 0; i < BigWay_list.length; i++) {
            for (var j = 0; j < BigWay_list[i].length; j++) {
                var the_cord = patingBigWay(all_gameWayBillList[nowGetList]);
                WayBillManager[j] = new WayBillBall();   //(要注意new 一次就好,重覆new有可能會造成記憶體洩漏問題)
                NBC.right01.getChildByName("bgImg").addChild(WayBillManager[j].MainNode);
                WayBillManager[j].initBig();
                if(showPair == true) {
                    WayBillManager[j].setBellBig(BigWay_list[i][j], the_cord[1], the_cord[2]);
                }else {
                    WayBillManager[j].setBellBig(BigWay_list[i][j], the_cord[1]);
                }

                var x = o * i;
                var y = o * j;

                WayBillManager[j].MainNode.pos(18 + x, 10 + y);
                n++;
                nowGetList++;
            }

            m++;
        }
    }

}



//三路路單
function drawWayBill_threeAll() {
    //先清空路單圖
    if (NBC.right02.getChildByName("bgImg")._childs.length > 0) {
        NBC.right02.getChildByName("bgImg")._childs = [];
        WayBillManager_three = [];
        WayBillManager_threeB = [];
        WayBillManager_threeC = [];
    } 
    drawWayBill_threeA();
    positionWayBill_threeB();
    drawWayBill_threeB();
    positionWayBill_threeC();
    drawWayBill_threeC();
}

function drawWayBill_threeA() {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 19.8;
    var nowGetList = 0;

    if (BigWay_list.length > 27) {

        for (var i = (BigWay_list.length - 27); i < BigWay_list.length; i++) {
            nowGetList += BigWay_list[i].length;
        }

        nowGetList = all_gameWayBillList.length - nowGetList;   //取出要從哪個計路開始取

        for (var i = (BigWay_list.length - 27); i < BigWay_list.length; i++) {
            for (var j = 0; j < BigWay_list[i].length; j++) {
                var the_cord = patingBigWay(all_gameWayBillList[nowGetList]);
                WayBillManager_three[j] = new WayBillBall();   //(要注意new 一次就好,重覆new有可能會造成記憶體洩漏問題)
                NBC.right02.getChildByName("bgImg").addChild(WayBillManager_three[j].MainNode);
                WayBillManager_three[j].initThree();
                if(showPair == true) {
                    WayBillManager_three[j].setBellThreeA(BigWay_list[i][j], the_cord[1], the_cord[2]);
                }else {
                    WayBillManager_three[j].setBellThreeA(BigWay_list[i][j], the_cord[1]);
                }
                
                var x = o * m;
                var y = o * j;

                WayBillManager_three[j].MainNode.pos(12 + x, 3 + y);
                n++;
                nowGetList++;
            }
            m++;
        }
    } else {
        for (var i = 0; i < BigWay_list.length; i++) {
            for (var j = 0; j < BigWay_list[i].length; j++) {
                var the_cord = patingBigWay(all_gameWayBillList[nowGetList]);
                WayBillManager_three[j] = new WayBillBall();   //(要注意new 一次就好,重覆new有可能會造成記憶體洩漏問題)
                NBC.right02.getChildByName("bgImg").addChild(WayBillManager_three[j].MainNode);
                WayBillManager_three[j].initThree();
                if(showPair == true) {
                    WayBillManager_three[j].setBellThreeA(BigWay_list[i][j], the_cord[1], the_cord[2]);
                }else {
                    WayBillManager_three[j].setBellThreeA(BigWay_list[i][j], the_cord[1]);
                }

                var x = o * i;
                var y = o * j;

                WayBillManager_three[j].MainNode.pos(12 + x, 3 + y);
                n++;
                nowGetList++;
            }

            m++;
        }
    }


}

function positionWayBill_threeB() {
    //寫入路單紀錄(取出全場的路單記錄,不含數字)
    var wayBill = [];

    for (var i = 0, max = all_gameWayBillList.length; i < max; i++) {
        var the_cord = patingBigWay(all_gameWayBillList[i]);
        wayBill.push(the_cord[0]);
    }

    //將最後排序的路單加入
    ThreeWay_listB = wayBill;
}

function drawWayBill_threeB() {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 19.8;

    if (ThreeWay_listB.length > 54) {
        for (var i = ThreeWay_listB.length - 54; i < ThreeWay_listB.length; i++) {
            if (n == 6) {
                //換列
                m++;
                n = 0;
            }
            var the_cord = patingBigWay(all_gameWayBillList[i]);
            WayBillManager_threeB[i] = new WayBillBall();
            NBC.right02.getChildByName("bgImg").addChild(WayBillManager_threeB[i].MainNode);
            WayBillManager_threeB[i].initThree();
            WayBillManager_threeB[i].setBellThreeB(ThreeWay_listB[i], the_cord[2]);

            var x = o * n;
            var y = o * m;

            WayBillManager_threeB[i].MainNode.pos(547 + x, 3 + y);
            n++;
        }
    } else {
        for (var i = 0; i < ThreeWay_listB.length; i++) {
            if (n == 6) {
                //換列
                m++;
                n = 0;
            }
            var the_cord = patingBigWay(all_gameWayBillList[i]);
            WayBillManager_threeB[i] = new WayBillBall();
            NBC.right02.getChildByName("bgImg").addChild(WayBillManager_threeB[i].MainNode);
            WayBillManager_threeB[i].initThree();
            WayBillManager_threeB[i].setBellThreeB(ThreeWay_listB[i], the_cord[2]);

            var x = o * n;
            var y = o * m;

            WayBillManager_threeB[i].MainNode.pos(547 + x, 3 + y);
            n++;
        }
    }

}

function positionWayBill_threeC() {
    //寫入路單紀錄(取出全場的路單記錄,不含數字,和)
    var wayBill = [];

    for (var i = 0, max = all_gameWayBillList.length; i < max; i++) {
        var the_cord = patingBigWay(all_gameWayBillList[i]);
        if (the_cord[0] == 3) {
            //不加入和
            continue;
        } else {
            wayBill.push([the_cord[0], the_cord[2]]);
        }
    }

    //將最後排序的路單加入
    ThreeWay_listC = wayBill;
}

function drawWayBill_threeC() {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 19.8;

    if (ThreeWay_listC.length > 81) {
        for (var i = ThreeWay_listC.length - 81; i < ThreeWay_listC.length; i++) {
            if (n == 3) {
                //換行
                m++;
                n = 0;
            }
            WayBillManager_threeC[i] = new WayBillBall();
            NBC.right02.getChildByName("bgImg").addChild(WayBillManager_threeC[i].MainNode);
            WayBillManager_threeC[i].initThree();
            WayBillManager_threeC[i].setBellThreeB(ThreeWay_listC[i][0], ThreeWay_listC[i][1]);

            var x = o * m;
            var y = o * n;

            WayBillManager_threeC[i].MainNode.pos(12 + x, 123 + y);
            n++;
        }
    } else {
        for (var i = 0; i < ThreeWay_listC.length; i++) {
            if (n == 3) {
                //換行
                m++;
                n = 0;
            }
            WayBillManager_threeC[i] = new WayBillBall();
            NBC.right02.getChildByName("bgImg").addChild(WayBillManager_threeC[i].MainNode);
            WayBillManager_threeC[i].initThree();
            WayBillManager_threeC[i].setBellThreeB(ThreeWay_listC[i][0], ThreeWay_listC[i][1]);

            var x = o * m;
            var y = o * n;

            WayBillManager_threeC[i].MainNode.pos(12 + x, 123 + y);
            n++;
        }
    }

}


//大路九列路單
function positionWayBill_bigWayNine() {
    //寫入路單紀錄(取出全場的路單記錄)
    var pre_winner = "";
    var way_list = 0;
    var wayBill = [];
    var totWay = [];

    for (var i = 0, max = all_gameWayBillList.length; i < max; i++) {
        var the_cord = patingBigWay(all_gameWayBillList[i]);
        if (i == 0) {
            //第一個直接寫入
            wayBill.push(the_cord[0]);
            pre_winner = the_cord[0];
        } else {
            //與前場贏家不同需換行
            if (pre_winner != the_cord[0]) {
                if (pre_winner == 3) {
                    //如果前一個路單是平手,則繼續往前比
                    for (var j = wayBill.length - 1; j < wayBill.length; j--) {
                        if (wayBill[j] != pre_winner) {
                            if (wayBill[j] == the_cord[0]) {
                                //接著畫
                                //如果y滿9則換行
                                if (wayBill.length >= 9) {
                                    totWay.push(wayBill);
                                    wayBill = [];
                                    wayBill.push(the_cord[0]);
                                    pre_winner = the_cord[0];
                                } else {
                                    wayBill.push(the_cord[0]);
                                    pre_winner = the_cord[0];
                                }
                            } else {
                                //換行(先將前一行記錄寫入)
                                totWay.push(wayBill);
                                wayBill = [];
                                wayBill.push(the_cord[0]);
                                pre_winner = the_cord[0];
                            }

                            break;
                        }
                    }//end for.

                } else {
                    if (the_cord[0] == 3) {
                        //自己為和,接著畫
                        //如果y滿9則換行
                        if (wayBill.length >= 9) {
                            totWay.push(wayBill);
                            wayBill = [];
                            wayBill.push(the_cord[0]);
                            pre_winner = the_cord[0];
                        } else {
                            wayBill.push(the_cord[0]);
                            pre_winner = the_cord[0];
                        }
                    } else {
                        //與前一個路單不一樣(先將前一行記錄寫入)
                        totWay.push(wayBill);
                        wayBill = [];
                        wayBill.push(the_cord[0]);
                        pre_winner = the_cord[0];
                    }
                }
            } else {
                //與前一個路單一樣
                //如果y滿9則換行
                if (wayBill.length >= 9) {
                    totWay.push(wayBill);
                    wayBill = [];
                    wayBill.push(the_cord[0]);
                    pre_winner = the_cord[0];
                } else {
                    wayBill.push(the_cord[0]);
                    pre_winner = the_cord[0];
                }

            }
        }//end main if.
    }//end main for.


    //將最後排序的路單加入
    totWay.push(wayBill);
    BigWayNine_list = totWay;
}

function drawWayBill_bigWayNine() {
    //先清空路單圖
    if (NBC.right03.getChildByName("bgImg")._childs.length > 0) {
        NBC.right03.getChildByName("bgImg")._childs = [];
        WayBillManager_Nine = [];
    }

    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 19.8;
    var nowGetList = 0;

    if (BigWayNine_list.length > 27) {

        for (var i = (BigWayNine_list.length - 27); i < BigWayNine_list.length; i++) {
            nowGetList += BigWayNine_list[i].length;
        }

        nowGetList = all_gameWayBillList.length - nowGetList;   //取出要從哪個計路開始取

        for (var i = (BigWayNine_list.length - 27); i < BigWayNine_list.length; i++) {
            for (var j = 0; j < BigWayNine_list[i].length; j++) {
                var the_cord = patingBigWay(all_gameWayBillList[nowGetList]);
                WayBillManager_Nine[j] = new WayBillBall();   //(要注意new 一次就好,重覆new有可能會造成記憶體洩漏問題)
                NBC.right03.getChildByName("bgImg").addChild(WayBillManager_Nine[j].MainNode);
                WayBillManager_Nine[j].initBigNine();
                if(showPair == true) {
                    WayBillManager_Nine[j].setBellBig(BigWayNine_list[i][j], the_cord[1], the_cord[2]);
                }else {
                    WayBillManager_Nine[j].setBellBig(BigWayNine_list[i][j], the_cord[1]);
                }
                

                var x = o * m;
                var y = o * j;

                WayBillManager_Nine[j].MainNode.pos(10 + x, 5 + y);
                n++;
                nowGetList++;
            }
            m++;
        }
    } else {
        for (var i = 0; i < BigWayNine_list.length; i++) {
            for (var j = 0; j < BigWayNine_list[i].length; j++) {
                var the_cord = patingBigWay(all_gameWayBillList[nowGetList]);
                WayBillManager_Nine[j] = new WayBillBall();   //(要注意new 一次就好,重覆new有可能會造成記憶體洩漏問題)
                NBC.right03.getChildByName("bgImg").addChild(WayBillManager_Nine[j].MainNode);
                WayBillManager_Nine[j].initBigNine();
                if(showPair == true) {
                    WayBillManager_Nine[j].setBellBig(BigWayNine_list[i][j], the_cord[1], the_cord[2]);
                }else {
                    WayBillManager_Nine[j].setBellBig(BigWayNine_list[i][j], the_cord[1]);
                }

                var x = o * i;
                var y = o * j;

                WayBillManager_Nine[j].MainNode.pos(10 + x, 5 + y);
                n++;
                nowGetList++;
            }

            m++;
        }
    }

}


//蟑螂路
function drawWayBill_cockroachAll() {
    //先清空路單圖
    if (NBC.right04.getChildByName("bgImg")._childs.length > 0) {
        NBC.right04.getChildByName("bgImg")._childs = [];
        WayBillManager_Eye = [];
        WayBillManager_Small = [];
        WayBillManager_Cockroach = [];
    }

    if ((BigWay_list.length >= 2 && (BigWay_list[1][1] != undefined || BigWay_list[2] != undefined)) ||
        (BigWay_list.length >= 3 && (BigWay_list[1][1] != undefined || BigWay_list[2] != undefined))) {
        positionWayBill_bigEye();
        drawWayBill_bigEye();
    }

    if ((BigWay_list.length >= 3 && (BigWay_list[2][1] != undefined || BigWay_list[3] != undefined)) ||
        (BigWay_list.length >= 4 && (BigWay_list[2][1] != undefined || BigWay_list[3] != undefined))) {
        positionWayBill_small();
        drawWayBill_small();
    }

    if ((BigWay_list.length >= 4 && (BigWay_list[3][1] != undefined || BigWay_list[4] != undefined)) ||
        (BigWay_list.length >= 5 && (BigWay_list[3][1] != undefined || BigWay_list[4] != undefined))) {
        positionWayBill_cockroach();
        drawWayBill_cockroach();
    }

}

/**
 * 大眼仔路單
 * 參照大路路單第二行第二粒起,向左比對有球畫紅色,沒有畫藍色;若此位置沒有球則以第三行第一粒做參考點.
 * 若參照點為該行第一粒則看前兩行有沒有齊腳,齊腳畫紅色,沒有齊腳畫藍色
 * 若直落兩粒以後沒有球則畫紅色
 */

function positionWayBill_bigEye(isAsk) {
    var pre_bill = 0;
    var wayBill = [];
    var totWay = [];
    var patingList = AskBigB_listToThree;

    if (isAsk != undefined) {
        if (isAsk == 1) {
            patingList = WayBillAsk_PbtnList[1].slice();
        }
        if (isAsk == 2) {
            patingList = WayBillAsk_BbtnList[1].slice();
        }
    }

    for (var i = 1; i < patingList.length; i++) {
        for (var j = 0; j < patingList[i].length; j++) {
            if (i == 1) {
                if (j == 0) {
                    j = 1;
                }
                //取第二行第二粒(2,2)->陣列(1,1)
                if (patingList[1][1] != undefined) {
                    //看有沒有球
                    if (patingList[i - 1][j] != undefined) {
                        //畫紅色
                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //直落兩粒以後沒有球,畫紅色
                        if (j > 1) {
                            if (pre_bill != 2 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            //畫藍色
                            wayBill.push(2);
                            pre_bill = 2;
                        } else {
                            if (pre_bill != 1 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            //畫藍色
                            wayBill.push(1);
                            pre_bill = 1;
                        }
                    }
                } else {
                    break;
                }
            } else {
                //取第三行第一粒(3,1)->陣列(2,0)
                if (j == 0) {
                    //比齊腳
                    if (patingList[i - 1].length == patingList[i - 2].length) {
                        //畫紅色,如果與前一行不同色則換行
                        if (pre_bill != 2 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //畫藍色,如果與前一行不同色則換行
                        if (pre_bill != 1 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(1);
                        pre_bill = 1;
                    }
                } else {
                    //看有沒有球
                    if (patingList[i - 1][j] != undefined) {
                        //畫紅色,如果與前一行不同色則換行
                        if (pre_bill != 2 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //直落兩粒以後沒有球,畫紅色
                        if (j > 1) {
                            if (pre_bill != 2 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            wayBill.push(2);
                            pre_bill = 2;
                        } else {
                            //畫藍色,如果與前一行不同色則換行
                            if (pre_bill != 1 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            wayBill.push(1);
                            pre_bill = 1;
                        }

                    }
                }
            }// end main if.

        }// end for
    }// end main for


    totWay.push(wayBill);
    if (isAsk != undefined) {
        if (isAsk == 1) {
            WayBillAsk_PbtnList[2] = totWay;
        }
        if (isAsk == 2) {
            WayBillAsk_BbtnList[2] = totWay;
        }
    } else {
        BigWayEye_list = totWay;
    }
}

function drawWayBill_bigEye() {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 9.9;
    var start_num = 0;

    if (BigWayEye_list.length > 60) {
        start_num = BigWayEye_list.length - 60;
    }
    for (var i = start_num; i < BigWayEye_list.length; i++) {
        for (var j = 0; j < BigWayEye_list[i].length; j++) {

            var the_bill = new WayBillBall();
            NBC.right04.getChildByName("bgImg").addChild(the_bill.MainNode);
            the_bill.initCockroach();
            the_bill.setBellEye(BigWayEye_list[i][j]);

            var x = o * m;
            var y = o * j;

            the_bill.MainNode.pos(10 + x, 5 + y);
            WayBillManager_Eye.push(the_bill);
            n++;
        }
        m++;
    }

}

/**
 * 小路路單
 * 參照大路路單第三行第二粒起,向左跨一行比對有球畫紅色,沒有畫藍色;若此位置沒有球則以第四行第一粒做參考點.
 * 若參照點為該行第一粒則看前三行的一.三行有沒有齊腳,齊腳畫紅色,沒有齊腳畫藍色
 * 若直落兩粒以後沒有球則畫紅色
 */

function positionWayBill_small(isAsk) {
    var pre_bill = 0;
    var wayBill = [];
    var totWay = [];
    var patingList = AskBigB_listToThree;

    if (isAsk != undefined) {
        if (isAsk == 1) {
            patingList = WayBillAsk_PbtnList[1].slice();
        }
        if (isAsk == 2) {
            patingList = WayBillAsk_BbtnList[1].slice();
        }
    }

    for (var i = 2; i < patingList.length; i++) {
        for (var j = 0; j < patingList[i].length; j++) {
            if (i == 2) {
                if (j == 0) {
                    j = 1;
                }
                //取第三行第二粒(3,2)->陣列(2,1)
                if (patingList[i][j] != undefined) {
                    //看有沒有球
                    if (patingList[i - 2][j] != undefined) {
                        //畫紅色
                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //直落兩粒以後沒有球,畫紅色
                        if (j > 1) {
                            if (pre_bill != 2 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            //畫藍色
                            wayBill.push(2);
                            pre_bill = 2;
                        } else {
                            if (pre_bill != 1 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            //畫藍色
                            wayBill.push(1);
                            pre_bill = 1;
                        }
                    }
                } else {
                    break;
                }
            } else {
                //取第四行第一粒(4,1)->陣列(3,0)
                if (j == 0) {
                    //比齊腳
                    if (patingList[i - 1].length == patingList[i - 3].length) {
                        //畫紅色,如果與前跨一行不同色則換行
                        if (pre_bill != 2 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //畫藍色,如果與前跨一行不同色則換行
                        if (pre_bill != 1 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(1);
                        pre_bill = 1;
                    }
                } else {
                    //看有沒有球
                    if (patingList[i - 2][j] != undefined) {
                        //畫紅色,如果與前跨一行不同色則換行
                        if (pre_bill != 2 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //直落兩粒以後沒有球,畫紅色
                        if (j > 1) {
                            if (pre_bill != 2 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            wayBill.push(2);
                            pre_bill = 2;
                        } else {
                            //畫藍色,如果與前跨一行不同色則換行
                            if (pre_bill != 1 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            wayBill.push(1);
                            pre_bill = 1;
                        }

                    }
                }
            }// end main if.

        }// end for
    }// end main for

    totWay.push(wayBill);
    if (isAsk != undefined) {
        if (isAsk == 1) {
            WayBillAsk_PbtnList[3] = totWay;
        }
        if (isAsk == 2) {
            WayBillAsk_BbtnList[3] = totWay;
        }
    } else {
        BigWaySmall_list = totWay;
    }
}

function drawWayBill_small() {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 9.9;
    var start_num = 0;

    if (BigWaySmall_list.length > 60) {
        start_num = BigWaySmall_list.length - 60;
    }
    for (var i = start_num; i < BigWaySmall_list.length; i++) {
        for (var j = 0; j < BigWaySmall_list[i].length; j++) {

            var the_bill = new WayBillBall();
            NBC.right04.getChildByName("bgImg").addChild(the_bill.MainNode);
            the_bill.initCockroach();
            the_bill.setBellSmall(BigWaySmall_list[i][j]);

            var x = o * m;
            var y = o * j;

            the_bill.MainNode.pos(10 + x, 64.4 + y);
            WayBillManager_Small.push(the_bill);
            n++;
        }
        m++;
    }

}

/**
 * 蟑螂路路單
 * 參照大路路單第四行第二粒起,向左跨兩行比對有球畫紅色,沒有畫藍色;若此位置沒有球則以第五行第一粒做參考點.
 * 若參照點為該行第一粒則看前四行的一.四行有沒有齊腳,齊腳畫紅色,沒有齊腳畫藍色
 * 若直落兩粒以後沒有球則畫紅色
 */
function positionWayBill_cockroach(isAsk) {
    var pre_bill = 0;
    var wayBill = [];
    var totWay = [];
    var patingList = AskBigB_listToThree;

    if (isAsk != undefined) {
        if (isAsk == 1) {
            patingList = WayBillAsk_PbtnList[1].slice();
        }
        if (isAsk == 2) {
            patingList = WayBillAsk_BbtnList[1].slice();
        }
    }

    for (var i = 3; i < patingList.length; i++) {
        for (var j = 0; j < patingList[i].length; j++) {
            if (i == 3) {
                if (j == 0) {
                    j = 1;
                }
                //取第四行第二粒(4,2)->陣列(3,1)
                if (patingList[3][1] != undefined) {
                    //看有沒有球
                    if (patingList[i - 3][j] != undefined) {
                        //畫紅色
                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //直落兩粒以後沒有球,畫紅色
                        if (j > 1) {
                            if (pre_bill != 2 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            //畫藍色
                            wayBill.push(2);
                            pre_bill = 2;
                        } else {
                            if (pre_bill != 1 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            //畫藍色
                            wayBill.push(1);
                            pre_bill = 1;
                        }
                    }
                } else {
                    break;
                }
            } else {
                //取第四行第一粒(5,1)->陣列(4,0)
                if (j == 0) {
                    //比齊腳
                    if (patingList[i - 1].length == patingList[i - 4].length) {
                        //畫紅色,如果與前跨兩行不同色則換行
                        if (pre_bill != 2 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //畫藍色,如果與前跨兩行不同色則換行
                        if (pre_bill != 1 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(1);
                        pre_bill = 1;
                    }
                } else {
                    //看有沒有球
                    if (patingList[i - 3][j] != undefined) {
                        //畫紅色,如果與前跨兩行不同色則換行
                        if (pre_bill != 2 && pre_bill != 0) {
                            totWay.push(wayBill);
                            wayBill = [];
                        }

                        if (wayBill.length >= 6) {
                            //超過行數換行
                            totWay.push(wayBill);
                            wayBill = [];
                        }
                        wayBill.push(2);
                        pre_bill = 2;
                    } else {
                        //直落兩粒以後沒有球,畫紅色
                        if (j > 1) {
                            if (pre_bill != 2 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            wayBill.push(2);
                            pre_bill = 2;
                        } else {
                            //畫藍色,如果與前跨兩行不同色則換行
                            if (pre_bill != 1 && pre_bill != 0) {
                                totWay.push(wayBill);
                                wayBill = [];
                            }

                            if (wayBill.length >= 6) {
                                //超過行數換行
                                totWay.push(wayBill);
                                wayBill = [];
                            }
                            wayBill.push(1);
                            pre_bill = 1;
                        }

                    }
                }
            }// end main if.

        }// end for
    }// end main for

    totWay.push(wayBill);
    if (isAsk != undefined) {
        if (isAsk == 1) {
            WayBillAsk_PbtnList[4] = totWay;
        }
        if (isAsk == 2) {
            WayBillAsk_BbtnList[4] = totWay;
        }
    } else {
        BigWayCockroach_list = totWay;
    }
}

function drawWayBill_cockroach() {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 9.9;
    var start_num = 0;

    if (BigWayCockroach_list.length > 60) {
        start_num = BigWayCockroach_list.length - 60;
    }
    for (var i = start_num; i < BigWayCockroach_list.length; i++) {
        for (var j = 0; j < BigWayCockroach_list[i].length; j++) {

            var the_bill = new WayBillBall();
            NBC.right04.getChildByName("bgImg").addChild(the_bill.MainNode);
            the_bill.initCockroach();
            the_bill.setBellCockroach(BigWayCockroach_list[i][j]);

            var x = o * m;
            var y = o * j;

            the_bill.MainNode.pos(10 + x, 123.8 + y);
            WayBillManager_Cockroach.push(the_bill);
            n++;
        }
        m++;
    }
}


//莊閒問路
function drawWayBill_askWayAll() {
    //先清空路單圖
    if (NBC.right05.getChildByName("bgImgN")._childs.length > 0) {
        NBC.right05.getChildByName("bgImgN")._childs = [];
        WayBillManager_AskBigA = [];
        WayBillManager_AskBigB = [];
        WayBillManager_AskEye = [];
        WayBillManager_AskSmall = [];
        WayBillManager_AskCockroach = [];
    }
    if(NBC.right05.getChildByName("bgImgP")._childs.length > 0) {
        NBC.right05.getChildByName("bgImgP")._childs = [];
        WayBillManager_PAskbtn = [[], [], [], [], []];
    }
    if(NBC.right05.getChildByName("bgImgB")._childs.length > 0) {
        NBC.right05.getChildByName("bgImgB")._childs = [];
        WayBillManager_BAskBbtn = [[], [], [], [], []];
    }
    drawWayBill_askBigA();
    drawWayBill_askBigB();
    drawWayBill_askEye();
    drawWayBill_askSmall();
    drawWayBill_askCockroach();
}

function drawWayBill_askBigA(isAsk) {
    //參考三路路單B
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 19;
    var nowGetList = 0;
    var start_num = 0;
    var patingList = ThreeWay_listB;
    var patingImg = "bgImgN";
    var billManager = WayBillManager_AskBigA;

    //莊閒問路
    if (isAsk != undefined) {
        if (isAsk == 1) {
            patingList = WayBillAsk_PbtnList[0];
            patingImg = "bgImgP";
            billManager = WayBillManager_PAskbtn[0];
        }
        if (isAsk == 2) {
            patingList = WayBillAsk_BbtnList[0];
            patingImg = "bgImgB";
            billManager = WayBillManager_BAskBbtn[0];
        }
    }

    //若紀錄路單超出現有行數
    if (patingList.length > 80) {
        nowGetList = patingList.length - 80;
        start_num = patingList.length - 80;
    }

    for (var i = start_num; i < patingList.length; i++) {
        if (n == 8) {
            //換列
            m++;
            n = 0;
        }

        if (all_gameWayBillList[nowGetList] == undefined && isAsk != undefined) {
            var the_cord = [[isAsk], ["N"], [0]];
        } else {
            var the_cord = patingBigWay(all_gameWayBillList[nowGetList]);
        }

        billManager[i] = new WayBillBall();
        NBC.right05.getChildByName(patingImg).addChild(billManager[i].MainNode);
        billManager[i].initAskBigA();
        if(showPair == true) {
            billManager[i].setBellThreeA(patingList[i], the_cord[1], the_cord[2]);
        }else {
            billManager[i].setBellThreeA(patingList[i], the_cord[1]);
        }
        
        var x = o * m;
        var y = o * n;

        billManager[i].MainNode.pos(12 + x, 7 + y);
        n++;
        nowGetList++;
    }

}

/**
 * 莊閒問路 大路路單B
 * 第一行出現和則換行
 */

function positionWayBill_askBigB() {
    var pre_winner = "";
    var wayBill = [];
    var totWay = [];
    var tie_num = 0;

    //[[obj, obj, obj, obj, obj, obj], []]

    for (var i = 0, max = all_gameWayBillList.length; i < max; i++) {
        var the_cord = patingBigWay(all_gameWayBillList[i]);
        if (i == 0) {
            if (the_cord[0] == 3) {
                // //第一個為和要換行
                // var the_obj =
                //     {
                //         win: the_cord[0],
                //         pair: the_cord[2],
                //         tie_num: 1
                //     };
                // wayBill.push(the_obj);
                // totWay.push(wayBill);
                // wayBill = [];
                //第一個為和要跳過
                continue;
            } else {
                //第一個不是和則直接寫入
                var the_obj =
                    {
                        win: the_cord[0],
                        pair: the_cord[2],
                        tie_num: tie_num
                    };

                wayBill.push(the_obj);
                pre_winner = the_cord[0];
            }
        } else {
            //與前場贏家不同需換行
            if (pre_winner != the_cord[0] && the_cord[0] != 3) {
                var the_obj =
                    {
                        win: the_cord[0],
                        pair: the_cord[2],
                        tie_num: tie_num
                    };

                if (wayBill.length != 0) {
                    totWay.push(wayBill);
                    wayBill = [];
                }
                wayBill.push(the_obj);
                pre_winner = the_cord[0];
            } else {
                if (the_cord[0] == 3) {
                    //若下一場為和則取上一場的tie_num累加,不更動贏家
                    if (wayBill.length == 0) {
                        var a = totWay.length - 1;
                        totWay[a][totWay[a].length - 1].tie_num += 1;
                    } else {
                        wayBill[wayBill.length - 1].tie_num += 1;
                    }
                } else {
                    //接續寫入,若滿6個則換行
                    var the_obj =
                        {
                            win: the_cord[0],
                            pair: the_cord[2],
                            tie_num: tie_num
                        };

                    if (wayBill.length >= 6) {
                        totWay.push(wayBill);
                        wayBill = [];
                    }

                    wayBill.push(the_obj);
                    pre_winner = the_cord[0];

                }// end else.
            }// end else.

        }// end main else. 

    }// end for.


    //將最後排序的路單加入
    if (wayBill.length != 0) {
        totWay.push(wayBill);
    }
    AskBigB_list = totWay.slice();

    //給三路路單畫的清單若首行為和則將和拿掉
    AskBigB_listToThree = AskBigB_list.slice();
    if (AskBigB_listToThree.length != 0 && AskBigB_listToThree[0][0].win == 3) {
        AskBigB_listToThree.splice(0, 1);
        AskBigB_listToThree.splice(0, 1);
    }

}

function drawWayBill_askBigB(isAsk) {
    var o = 14.4;
    var m = 0;
    var n = 0;
    var start_num = 0;
    var patingList = AskBigB_list;
    var patingImg = "bgImgN";
    var billManager = WayBillManager_AskBigB;

    //莊閒問路
    if (isAsk != undefined) {
        if (isAsk == 1) {
            patingList = WayBillAsk_PbtnList[1];
            patingImg = "bgImgP";
            billManager = WayBillManager_PAskbtn[1];
        }
        if (isAsk == 2) {
            patingList = WayBillAsk_BbtnList[1];
            patingImg = "bgImgB";
            billManager = WayBillManager_BAskBbtn[1];
        }
    }

    if (patingList.length > 32) {
        start_num = patingList.length - 32;
    }

    for (var i = start_num; i < patingList.length; i++) {
        for (var j = 0; j < patingList[i].length; j++) {
            
            var the_bill = new WayBillBall();
            NBC.right05.getChildByName(patingImg).addChild(the_bill.MainNode);
            the_bill.initAskBigB();
            if(showPair == true) {
                the_bill.setBellAskBigB(patingList[i][j].win, patingList[i][j].tie_num, patingList[i][j].pair);
            }else {
                the_bill.setBellAskBigB(patingList[i][j].win, patingList[i][j].tie_num);
            }
            

            var x = o * m;
            var y = o * j;

            the_bill.MainNode.pos(207.5 + x, 7 + y);
            billManager.push(the_bill);
            n++;
        }
        m++;
    }



}

function drawWayBill_askEye(isAsk) {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 7.25;
    var start_num = 0;
    var patingList = BigWayEye_list;
    var patingImg = "bgImgN";
    var billManager = WayBillManager_AskEye;

    //莊閒問路
    if (isAsk != undefined) {
        if (isAsk == 1) {
            patingList = WayBillAsk_PbtnList[2];
            patingImg = "bgImgP";
            billManager = WayBillManager_PAskbtn[2];
        }
        if (isAsk == 2) {
            patingList = WayBillAsk_BbtnList[2];
            patingImg = "bgImgB";
            billManager = WayBillManager_BAskBbtn[2];
        }
    }

    if (patingList.length > 32) {
        start_num = patingList.length - 32;
    }
    for (var i = start_num; i < patingList.length; i++) {
        for (var j = 0; j < patingList[i].length; j++) {

            var the_bill = new WayBillBall();
            NBC.right05.getChildByName(patingImg).addChild(the_bill.MainNode);
            the_bill.initAskThree();
            the_bill.setBellEye(patingList[i][j]);

            var x = o * m;
            var y = o * j;

            the_bill.MainNode.pos(206 + x, 94 + y);
            billManager.push(the_bill);
            n++;
        }
        m++;
    }
}

function drawWayBill_askSmall(isAsk) {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 7.25;
    var start_num = 0;
    var patingList = BigWaySmall_list;
    var patingImg = "bgImgN";
    var billManager = WayBillManager_AskSmall;
    //莊閒問路
    if (isAsk != undefined) {
        if (isAsk == 1) {
            patingList = WayBillAsk_PbtnList[3];
            patingImg = "bgImgP";
            billManager = WayBillManager_PAskbtn[3];
        }
        if (isAsk == 2) {
            patingList = WayBillAsk_BbtnList[3];
            patingImg = "bgImgB";
            billManager = WayBillManager_BAskBbtn[3];
        }
    }

    if (patingList.length > 32) {
        start_num = patingList.length - 32;
    }
    for (var i = start_num; i < patingList.length; i++) {
        for (var j = 0; j < patingList[i].length; j++) {

            var the_bill = new WayBillBall();
            NBC.right05.getChildByName(patingImg).addChild(the_bill.MainNode);
            the_bill.initAskThree();
            the_bill.setBellSmall(patingList[i][j]);

            var x = o * m;
            var y = o * j;

            the_bill.MainNode.pos(206 + x, 137 + y);
            billManager.push(the_bill);
            n++;
        }
        m++;
    }
}

function drawWayBill_askCockroach(isAsk) {
    //路單格數計算
    var m = 0;
    var n = 0;
    var o = 7.25;
    var start_num = 0;
    var patingList = BigWayCockroach_list;
    var patingImg = "bgImgN";
    var billManager = WayBillManager_AskCockroach;

    //莊閒問路
    if (isAsk != undefined) {
        if (isAsk == 1) {
            patingList = WayBillAsk_PbtnList[4];
            patingImg = "bgImgP";
            billManager = WayBillManager_PAskbtn[4];
        }
        if (isAsk == 2) {
            patingList = WayBillAsk_BbtnList[4];
            patingImg = "bgImgB";
            billManager = WayBillManager_BAskBbtn[4];
        }
    }

    if (BigWayCockroach_list.length > 32) {
        start_num = BigWayCockroach_list.length - 32;
    }
    for (var i = start_num; i < patingList.length; i++) {
        for (var j = 0; j < patingList[i].length; j++) {

            var the_bill = new WayBillBall();
            NBC.right05.getChildByName(patingImg).addChild(the_bill.MainNode);
            the_bill.initAskThree();
            the_bill.setBellCockroach(patingList[i][j]);

            var x = o * m;
            var y = o * j;

            the_bill.MainNode.pos(438 + x, 94 + y);
            billManager.push(the_bill);
            n++;
        }
        m++;
    }

}

//莊閒問路按鈕
var askBtn_clickTimer;
var askBtn_clickTimer2;
var askBtn_times = 0;

function askBtn_wayBillsprite(AskBtn, whoAsk) {
    askBtn_times = 0;
    askBtn_clickTimer = setInterval(function () {
        NBC.right05.getChildByName("bgImgN").visible = true;
        if(whoAsk == 1) {
            NBC.right05.getChildByName("bgImgP").visible = false;
        }else if(whoAsk == 2) {
            NBC.right05.getChildByName("bgImgB").visible = false;
        }
    }, 500);
    askBtn_clickTimer2 = setInterval(function () {
        NBC.right05.getChildByName("bgImgN").visible = false;
        if(whoAsk == 1) {
            NBC.right05.getChildByName("bgImgP").visible = true;
        }else if(whoAsk == 2) {
            NBC.right05.getChildByName("bgImgB").visible = true;
        }

        askBtn_times += 1;
        //閃爍五次後歸0
        if(askBtn_times >= 5) {
            askBtn_times = 0;
            clearInterval(askBtn_clickTimer);
            clearInterval(askBtn_clickTimer2);
            NBC.right05.getChildByName("bgImgN").visible = true;
            NBC.right05.getChildByName("bgImgB").visible = false;
            NBC.right05.getChildByName("bgImgP").visible = false;
       }
    }, 1000);

}

//閒問路
function PAskBtnClick() {
    NBC.right05.getChildByName("bgImgN").visible = false;
    NBC.right05.getChildByName("bgImgB").visible = false;
    NBC.right05.getChildByName("bgImgP").visible = true;

    //按下按鈕後計時五秒,變回原本路單
    askBtn_times = 0;
    clearInterval(askBtn_clickTimer);
    clearInterval(askBtn_clickTimer2);
    askBtn_wayBillsprite(WayBillManager_PAskbtn, 1);
}
//莊問路
function BAskBtnClick() {
    NBC.right05.getChildByName("bgImgN").visible = false;
    NBC.right05.getChildByName("bgImgB").visible = true;
    NBC.right05.getChildByName("bgImgP").visible = false;

    //按下按鈕後計時五秒,變回原本路單
    askBtn_times = 0;
    clearInterval(askBtn_clickTimer);
    clearInterval(askBtn_clickTimer2);
    askBtn_wayBillsprite(WayBillManager_BAskBbtn, 2);
}


/**
 * 預先畫出莊閒問路的兩種結果
 */
function drawAsk_Btn(Ask_num) {
    //將下一場預測為閒的路單加入,並計算路單
    //大路A     ThreeWay_listB
    //大路B     AskBigB_list
    //大眼仔    BigWayEye_list
    //小路      BigWaySmall_list
    //蟑螂路    BigWayCockroach_list

    if (Ask_num != undefined) {
        var useList;
        var askUse;
        if (Ask_num == 1) {
            //先清空路單圖
            if (NBC.right05.getChildByName("bgImgP")._childs.length > 0) {
                NBC.right05.getChildByName("bgImgP")._childs = [];
                WayBillAsk_PbtnList = [[], [], [], [], []];
                WayBillManager_PAskbtn = [[], [], [], [], []];
            }
            useList = WayBillAsk_PbtnList;
            askUse = "R04_P";
        }
        if (Ask_num == 2) {
            //先清空路單圖
            if (NBC.right05.getChildByName("bgImgB")._childs.length > 0) {
                NBC.right05.getChildByName("bgImgB")._childs = [];
                WayBillAsk_BbtnList = [[], [], [], [], []];
                WayBillManager_BAskBbtn = [[], [], [], [], []];
            }
            useList = WayBillAsk_BbtnList;
            askUse = "R04_B";
        }

        var s = deepCopy(ThreeWay_listB);
        // var s = ThreeWay_listB.slice();
        useList[0] = s;
        useList[0].push(Ask_num);

        var s2 = deepCopy(AskBigB_list);
        // var s2 = AskBigB_list.slice();
        useList[1] = s2;
        AskBtn_bigB(useList[1], Ask_num);
        if ((BigWay_list.length >= 2 && (BigWay_list[1][1] != undefined || BigWay_list[2] != undefined)) ||
            (BigWay_list.length >= 3 && (BigWay_list[1][1] != undefined || BigWay_list[2] != undefined))) {
            useList[2] = [];
            positionWayBill_bigEye(Ask_num);
            drawWayBill_askEye(Ask_num);

            //更新r04路單的標記圖
            var c = useList[2].length-1;
            if(useList[2][c][useList[2][c].length-1] == 1) {
                NBC[askUse + "1"].skin = "image/bigeye_Blue(B).png";
            }else {
                NBC[askUse + "1"].skin = "image/bigeye_Red(B).png";
            }
        }

        if ((BigWay_list.length >= 3 && (BigWay_list[2][1] != undefined || BigWay_list[3] != undefined)) ||
            (BigWay_list.length >= 4 && (BigWay_list[2][1] != undefined || BigWay_list[3] != undefined))) {
            useList[3] = [];
            positionWayBill_small(Ask_num);
            drawWayBill_askSmall(Ask_num);

            //更新r04路單的標記圖
            var c = useList[3].length-1;
            if(useList[3][c][useList[3][c].length-1] == 1) {
                NBC[askUse + "2"].skin = "image/small_Blue(B).png";
            }else {
                NBC[askUse + "2"].skin = "image/small_Red(B).png";
            }
        }

        if ((BigWay_list.length >= 4 && (BigWay_list[3][1] != undefined || BigWay_list[4] != undefined)) ||
            (BigWay_list.length >= 5 && (BigWay_list[3][1] != undefined || BigWay_list[4] != undefined))) {
            useList[4] = [];
            positionWayBill_cockroach(Ask_num);
            drawWayBill_askCockroach(Ask_num);

            //更新r04路單的標記圖
            var c = useList[4].length-1;
            if(useList[4][c][useList[4][c].length-1] == 1) {
                NBC[askUse + "3"].skin = "image/cockroach_Blue(B).png";
            }else {
                NBC[askUse + "3"].skin = "image/cockroach_Red(B).png";
            }
        }

        drawWayBill_askBigA(Ask_num);
        drawWayBill_askBigB(Ask_num);

        s = null;
        s2 = null;
    }

}


/**
 * 將問路路單加入莊閒問路(大路B)的清單中
 * @param {array} useList  
 * @param {number} num 
 */
function AskBtn_bigB(useList, num) {
    var last = useList.length - 1
    if (useList[last] != undefined && useList[last][useList[last].length - 1].win == num) {
        //同(看有沒有超出行數)
        if (useList[last].length >= 6) {
            //換行
            useList.push([{ win: num, pair: 0, tie_num: 0 }]);
        } else {
            useList[last].push({ win: num, pair: 0, tie_num: 0 });
        }
    } else {
        //不同(換行)
        useList.push([{ win: num, pair: 0, tie_num: 0 }]);
    }
}


function AskBtn_eye(useList, num) {
    //同(判斷是否超出行數)  
    var last = useList.length - 1
    if (useList[last] != undefined && useList[last][useList[last].length - 1] == num) {
        if (useList[useList.length - 1].length >= 6) {
            //換行
            useList.push(num);
        } else {
            useList[useList.length - 1].push(num);
        }
    } else {
        //不同換行
        useList.push(num);
    }
}


/**
 * 陣列深度複製
 * @param {*array} obj 
 */
function deepCopy(obj){
    //https://juejin.im/entry/59ca5a2151882579e9555b41
    var newObj = obj.constructor === Array ? []:{};
    newObj.constructor = obj.constructor;
    if(typeof obj !== "object"){ 
        return ;
    } else if(window.JSON){
        newObj = JSON.parse(JSON.stringify(obj));//若需要考慮特殊的數據類型，如正则，函数等，需把這個else if去掉即可
    } else {
        for(var prop in obj){
            if(obj[prop].constructor === RegExp ||obj[prop].constructor === Date){
                newObj[prop] = obj[prop];
            } else if(typeof obj[prop] === 'object'){
                newObj[prop] = deepCopy(obj[prop]);//遞歸
            } else {
                newObj[prop] = obj[prop];
            }
        }
    } 
    return newObj;
}

//登出入//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 按鈕綁定
 */
function loginViewBtn() {
    NBC.login_view.getChildByName("bgImage").on(Laya.Event.MOUSE_UP, this, function(e){
        e.stopPropagation();
    });
    NBC.login_view.getChildByName("ch_psd").on(Laya.Event.MOUSE_UP, this, function(e){
        e.stopPropagation();
    });
    NBC.login_view.getChildByName("exit").on(Laya.Event.MOUSE_UP, this, loginExitClick);
    NBC.login_view.getChildByName("backspace").on(Laya.Event.MOUSE_UP, this, loginBackspaceClick);
    NBC.login_view.getChildByName("yes").on(Laya.Event.MOUSE_UP, this, loginYesClick);
    NBC.login_view.getChildByName("loginout").on(Laya.Event.MOUSE_UP, this, loginOutClick);

    for (var i = 0; i < 10; i++) {
        NBC.login_view.getChildByName("b" + i).on(Laya.Event.MOUSE_UP, this, loginViewBtnClick);
    }
}

//顯示登入介面
function leftLoginClick(e) {
    e.stopPropagation();
    if(user_betPoint.nowBetTot == 0) {
        NBC.login_view.visible = true;
        setting_login.loginOutBtn = 0;
    }else {
        //尚有押分不能登入
        var NotCL_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");
        Laya.Tween.clearAll(NotCL_Msg);
        NotCL_Msg.getChildByName("showText").text = "尚有押分無法登入!";
        if(NotCL_Msg.alpha > 0) {
            NotCL_Msg.alpha = 1;      
        }else {
            Laya.Tween.to(NotCL_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
        }        
        Laya.Tween.to(NotCL_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);
    }
}
function loginExitClick() {
    NBC.login_view.visible = false;
    setting_login.loginNum = "";
    NBC.login_view.getChildByName("putNum").text = setting_login.loginNum;
}

function loginViewBtnClick(click_btn) {
    click_btn.stopPropagation();
    if (setting_login.loginNum.length < 17) {
        setting_login.loginNum += click_btn.currentTarget._text._text;
        NBC.login_view.getChildByName("putNum").text = setting_login.loginNum;
    }
}

function loginBackspaceClick(click_btn) {
    click_btn.stopPropagation();
    if (setting_login.loginNum.length > 0) {
        var text = setting_login.loginNum;
        text = text.substring(0, text.length - 1);
        setting_login.loginNum = text;
        NBC.login_view.getChildByName("putNum").text = setting_login.loginNum;
    }
}

function loginYesClick(click_btn) {
    click_btn.stopPropagation();
    //登入
    var result = {
        action: "login",
        account: setting_login.loginNum
    };
    NBC.socket.send(JSON.stringify(result));
    loginExitClick();
}

function loginOutClick(click_btn) {
    //登出
    var result = {
        action: "loginOut"
    };
    NBC.socket.send(JSON.stringify(result));
    loginExitClick();
}

/**
 * 使用者登入失敗
 * @param {string} msg  失敗訊息
 */
function login_Filed(msg) {
    NBC.allMsg_showing.getChildByName("filedLogin").text = msg;
    Laya.Tween.to(NBC.allMsg_showing.getChildByName("filedLogin"), { alpha: 1 }, 600, Laya.Ease.backInOut, null);
    Laya.Tween.to(NBC.allMsg_showing.getChildByName("filedLogin"), { alpha: 0 }, 600, Laya.Ease.backInOut, null, 4000);
}

/**
 * 使用者登入成功
 * @param {string} loginAccount  使用者帳號
 */
function login_Success(loginAccount) {
    setting_login.nowLogin = loginAccount;
    NBC.allMsg_showing.getChildByName("success_login").getChildByName("text").text = loginAccount + " 已登入";
    NBC.leftMenu.getChildByName("account").text = loginAccount;
    Laya.Tween.to(NBC.allMsg_showing.getChildByName("success_login"), { alpha: 1 }, 600, Laya.Ease.backInOut, null);
    Laya.Tween.to(NBC.allMsg_showing.getChildByName("success_login"), { alpha: 0 }, 600, Laya.Ease.backInOut, null, 4000);
}

/**
 * 使用者登出
 * @param {string} loginAccount  使用者帳號
 */
function login_Out(loginAccount) {
    setting_login.nowLogin = "";
    NBC.allMsg_showing.getChildByName("outLogin").getChildByName("text").text = loginAccount + " 已登出";
    NBC.leftMenu.getChildByName("account").text = "";
    Laya.Tween.to(NBC.allMsg_showing.getChildByName("outLogin"), { alpha: 1 }, 600, Laya.Ease.backInOut, null);
    Laya.Tween.to(NBC.allMsg_showing.getChildByName("outLogin"), { alpha: 0 }, 600, Laya.Ease.backInOut, null, 4000);
}


function login_OutBtn() {
    if(user_betPoint.nowBetTot == 0) {
        setting_login.loginOutBtn += 1;
        if (setting_login.loginOutBtn == 1 && setting_login.nowLogin != "") {
            //顯示再按一次即可登出
            Laya.Tween.to(NBC.allMsg_showing.getChildByName("outLoginBtn"), { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
            Laya.Tween.to(NBC.allMsg_showing.getChildByName("outLoginBtn"), { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 6000);
        }
        if (setting_login.loginOutBtn >= 2) {
            //登出
            loginOutClick();
        }
    }else {
        //尚有押分無法登出
        var HBNotLO_Msg = NBC.allMsg_showing.getChildByName("PBonlyOne_msg");
        Laya.Tween.clearAll(HBNotLO_Msg);
        HBNotLO_Msg.getChildByName("showText").text = "尚有押分無法登出!";
        if(HBNotLO_Msg.alpha > 0) {
            HBNotLO_Msg.alpha = 1;
        }else {            
            Laya.Tween.to(HBNotLO_Msg, { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
        }
        Laya.Tween.to(HBNotLO_Msg, { alpha: 0 }, 800, Laya.Ease.cubicInOut, null, 2000);
    }
}

//遊戲規則/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function gameRule_exitClick() {
    NBC.gameRule.visible = false;
}
function gameRule_btnClick() {
    keyAction(3);
}

//前場紀錄///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function beforeRecord_exitClick() {
    NBC.beforeRecord.visible = false;
}

function beforeRecord_btnClick() {
    keyAction(2);
}

//上一頁
function preRecord_preBtnClick() {
    if(preRecord_nowPage == all_preGameList.length - 1) {
        preRecord_nowPage = 0;
        nowShow_preRecord(preRecord_nowPage);
    }else {
        preRecord_nowPage += 1;
        nowShow_preRecord(preRecord_nowPage);
    }
}

//下一頁
function preRecord_nextBtnClick() {
    if(preRecord_nowPage == 0) {
        //最後一頁
        nowShow_preRecord(preRecord_nowPage);
    }else {
        preRecord_nowPage -= 1;
        nowShow_preRecord(preRecord_nowPage);
    }
}

/**
 * 顯示前場紀錄
 */
var preRecord_ShineTimmer;
var preRecord_ShineTimmer2;
var preRecord_ShineTimmer3;
var preRecord_ShineTimmer_big;

function preRecordBetShine(btn) {
    if(btn != undefined) {
        Laya.Tween.clearAll(NBC[btn]);
        Laya.Tween.to(NBC[btn], { alpha: 0 }, 1200, Laya.Ease.linearOut);
        Laya.Tween.to(NBC[btn], { alpha: 0.6 }, 1200, Laya.Ease.linearOut, null, 1200);
    }
}

function show_beforeRecord() {
    //先顯示最後一筆資料
    preRecord_nowPage = 0;
    nowShow_preRecord(preRecord_nowPage);
}

function nowShow_preRecord(num) {
    //如果記錄為同一場就不做清除
    var showRecord = all_preGameList[num];
    if(NBC.beforeRecord.getChildByName("fieldRound").text != showRecord.gameField + "-" + showRecord.gameRound){
        clearInterval(preRecord_ShineTimmer);
        clearInterval(preRecord_ShineTimmer2);
        clearInterval(preRecord_ShineTimmer3);
        clearInterval(preRecord_ShineTimmer_big);

        NBC.PreRoundPC1.getChildByName("black").alpha = 0;
        NBC.PreRoundPC2.getChildByName("black").alpha = 0;
        NBC.PreRoundPC3.getChildByName("black").alpha = 0;
        NBC.PreRoundBC1.getChildByName("black").alpha = 0;
        NBC.PreRoundBC2.getChildByName("black").alpha = 0;
        NBC.PreRoundBC3.getChildByName("black").alpha = 0;

        var clearShine = ["preRecord_PShine", "preRecord_BShine", "preRecord_TShine", "preRecord_PpairShine", "preRecord_BpairShine", "preRecord_PBigLight", "preRecord_BBigLight"];
        for(var key in clearShine) {
            Laya.Tween.clearAll(NBC[clearShine[key]]);  //清除緩動
            NBC[clearShine[key]].alpha = 0;
        }

        //填入資料
        // var showRecord = all_gameList[num];
        //加上陰影
        var glowFilter = new Laya.GlowFilter("#000000", 2, 2, 2);
        
        NBC.beforeRecord.getChildByName("time").text = showRecord.time;
        NBC.beforeRecord.getChildByName("fieldRound").text = showRecord.gameField + "-" + showRecord.gameRound;
        NBC.beforeRecord.getChildByName("PPoint").text = showRecord.playerSum;
        NBC.beforeRecord.getChildByName("PPoint").filters = [glowFilter];
        NBC.beforeRecord.getChildByName("BPoint").text = showRecord.bankerSum;
        NBC.beforeRecord.getChildByName("BPoint").filters = [glowFilter];
        NBC.PreRoundPC1.skin = "puker/puker_front/puker" + showRecord.PC1 + ".png";
        NBC.PreRoundPC2.skin = "puker/puker_front/puker" + showRecord.PC2 + ".png";

        if(showRecord.PC3 != 0) {
            NBC.PreRoundPC3.skin = "puker/puker_front/puker" + showRecord.PC3 + ".png";
        }else {
            NBC.PreRoundPC3.skin = "";
        }
    
        NBC.PreRoundBC1.skin = "puker/puker_front/puker" + showRecord.BC1 + ".png";
        NBC.PreRoundBC2.skin = "puker/puker_front/puker" + showRecord.BC2 + ".png";

        if(showRecord.BC3 != 0) {
            NBC.PreRoundBC3.skin = "puker/puker_front/puker" + showRecord.BC3 + ".png";
        }else {
            NBC.PreRoundBC3.skin = "";
        }
    
        //秀出贏家的亮光
        var shine = "";
        var shineBig = "";
        switch(showRecord.winner) {
            case 1:
                shine = "preRecord_PShine";
                shineBig = "preRecord_PBigLight";
                NBC.PreRoundBC1.getChildByName("black").alpha = 0.4;
                NBC.PreRoundBC2.getChildByName("black").alpha = 0.4;
                if(showRecord.BC3 != 0) {
                    NBC.PreRoundBC3.getChildByName("black").alpha = 0.4;
                }
                break;
            case 2:
                shine = "preRecord_BShine";
                shineBig = "preRecord_BBigLight";
                NBC.PreRoundPC1.getChildByName("black").alpha = 0.4;
                NBC.PreRoundPC2.getChildByName("black").alpha = 0.4;  
                if(showRecord.PC3 != 0) {
                    NBC.PreRoundPC3.getChildByName("black").alpha = 0.4;
                }
                break;
            case 3:
                shine = "preRecord_TShine";
                NBC.PreRoundPC1.getChildByName("black").alpha = 0.4;
                NBC.PreRoundPC2.getChildByName("black").alpha = 0.4;
                NBC.PreRoundPC3.getChildByName("black").alpha = 0.4;
                NBC.PreRoundBC1.getChildByName("black").alpha = 0.4;
                NBC.PreRoundBC2.getChildByName("black").alpha = 0.4;
                NBC.PreRoundBC3.getChildByName("black").alpha = 0.4;
                break;
        }

        preRecord_ShineTimmer = setInterval(preRecordBetShine, 2400, shine);
        NBC[shine].alpha = 0.6;
        Laya.Tween.to(NBC[shine], { alpha: 0 }, 1200, Laya.Ease.linearOut);
        Laya.Tween.to(NBC[shine], { alpha: 0.6 }, 1200, Laya.Ease.linearOut, null, 1200);

        if(shineBig != "") {
            preRecord_ShineTimmer_big = setInterval(preRecordBetShine, 2400, shineBig);
            NBC[shineBig].alpha = 0.6;
            Laya.Tween.to(NBC[shineBig], { alpha: 0 }, 1200, Laya.Ease.linearOut);
            Laya.Tween.to(NBC[shineBig], { alpha: 0.6 }, 1200, Laya.Ease.linearOut, null, 1200);
        }
    
        //莊閒對
        switch(showRecord.pair) {
            case 1:
                //preRecord_PpairShine
                preRecord_ShineTimmer2 = setInterval(preRecordBetShine, 2500, "preRecord_PpairShine");
                NBC["preRecord_PpairShine"] = 0.6;
                Laya.Tween.to(NBC["preRecord_PpairShine"], { alpha: 0 }, 1200, Laya.Ease.linearOut);
                Laya.Tween.to(NBC["preRecord_PpairShine"], { alpha: 0.6 }, 1200, Laya.Ease.linearOut, null, 1200);
                break;
            case 2:
                //preRecord_BpairShine
                preRecord_ShineTimmer2 = setInterval(preRecordBetShine, 2500, "preRecord_BpairShine");
                NBC["preRecord_BpairShine"].alpha = 0.6;
                Laya.Tween.to(NBC["preRecord_BpairShine"], { alpha: 0 }, 1200, Laya.Ease.linearOut);
                Laya.Tween.to(NBC["preRecord_BpairShine"], { alpha: 0.6 }, 1200, Laya.Ease.linearOut, null, 1200);
                break;
            case 3:
                preRecord_ShineTimmer2 = setInterval(preRecordBetShine, 2500, "preRecord_PpairShine");
                NBC["preRecord_PpairShine"] = 0.6;
                Laya.Tween.to(NBC["preRecord_PpairShine"], { alpha: 0 }, 1200, Laya.Ease.linearOut);
                Laya.Tween.to(NBC["preRecord_PpairShine"], { alpha: 0.6 }, 1200, Laya.Ease.linearOut, null, 1200);

                preRecord_ShineTimmer3 = setInterval(preRecordBetShine, 2500, "preRecord_BpairShine");
                NBC["preRecord_BpairShine"].alpha = 0.6;
                Laya.Tween.to(NBC["preRecord_BpairShine"], { alpha: 0 }, 1200, Laya.Ease.linearOut);
                Laya.Tween.to(NBC["preRecord_BpairShine"], { alpha: 0.6 }, 1200, Laya.Ease.linearOut, null, 1200);
                break;
            default:
                break;
        }

        //顯示天停牌
        NBC.preRecord_PSN.visible = false;
        NBC.preRecord_BSN.visible = false;
        var B_twoSum = changeCard_toPoint(showRecord.BC1) + changeCard_toPoint(showRecord.BC2);
        B_twoSum = (B_twoSum >= 10) ? B_twoSum % 10 : B_twoSum;
        var P_twoSum = changeCard_toPoint(showRecord.PC1) + changeCard_toPoint(showRecord.PC2);
        P_twoSum = (P_twoSum >= 10) ? P_twoSum % 10 : P_twoSum;
        var PC3_point = (showRecord.PC3 == 0) ? NaN : changeCard_toPoint(showRecord.PC3);

        if(set_GameValue.DayCardAndStopCard == true) {
            if(P_twoSum >= 6 && P_twoSum <= 9) {
                if(showRecord.playerSum == 8 || showRecord.playerSum == 9) {
                    //天牌
                    NBC.preRecord_PSN.visible = true;
                    NBC.preRecord_PSN.getChildByName("show").skin = "image/NATURAL_C.PNG";
                }else if(showRecord.playerSum == 6 || showRecord.playerSum == 7) {
                    //停牌
                    NBC.preRecord_PSN.visible = true;
                    NBC.preRecord_PSN.getChildByName("show").skin = "image/STAND_C.png";
                }
            }
            if(B_twoSum == 8 || B_twoSum == 9) {
                //天牌
                NBC.preRecord_BSN.visible = true;
                NBC.preRecord_BSN.getChildByName("show").skin = "image/NATURAL_C.PNG";
            }else if(B_twoSum == 3 && PC3_point == 8) {
                //停牌
                NBC.preRecord_BSN.visible = true;
                NBC.preRecord_BSN.getChildByName("show").skin = "image/STAND_C.png";
            }else if(B_twoSum == 4 && (PC3_point == 8 || PC3_point == 9 || PC3_point == 0 || PC3_point == 1)) {
                //停牌
                NBC.preRecord_BSN.visible = true;
                NBC.preRecord_BSN.getChildByName("show").skin = "image/STAND_C.png";
            }else if(B_twoSum == 5 && !(PC3_point >= 4 && PC3_point <= 7) && !isNaN(PC3_point)) {
                //停牌
                NBC.preRecord_BSN.visible = true;
                NBC.preRecord_BSN.getChildByName("show").skin = "image/STAND_C.png";
            }else if(B_twoSum == 6 && !(PC3_point == 6 || PC3_point == 7) && !isNaN(PC3_point)) {
                //停牌                
                NBC.preRecord_BSN.visible = true;
                NBC.preRecord_BSN.getChildByName("show").skin = "image/STAND_C.png";
            }else if(B_twoSum == 6 && (P_twoSum == 6 || P_twoSum == 7) && isNaN(PC3_point)) {
                NBC.preRecord_BSN.visible = true;
                NBC.preRecord_BSN.getChildByName("show").skin = "image/STAND_C.png";
            }else if(B_twoSum == 7) {
                //停牌
                NBC.preRecord_BSN.visible = true;
                NBC.preRecord_BSN.getChildByName("show").skin = "image/STAND_C.png";
            }
        }// end main if.
  
        //顯示補牌規則
        NBC.beforeRecord.getChildByName("PC3Rule").skin = "";
        NBC.beforeRecord.getChildByName("BC3Rule").skin = "";

        if(P_twoSum >= 0 && P_twoSum <= 5) {
            if(showRecord.PC3 != 0) {
                NBC.beforeRecord.getChildByName("PC3Rule").skin = "image/Rule1.png";
            }
        }else if(P_twoSum == 6 || P_twoSum == 7) {
            NBC.beforeRecord.getChildByName("PC3Rule").skin = "image/Rule2.png";
        }else if(P_twoSum == 8 || P_twoSum == 9) {
            NBC.beforeRecord.getChildByName("PC3Rule").skin = "image/Rule3.png";
        }

        if(B_twoSum == 8 || B_twoSum == 9) {
            NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule16.png";
        }else if(B_twoSum == 7) {
            NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule15.png";
        }else if(B_twoSum >= 0 && B_twoSum <= 2) {
            NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule4.png";
        }else if(B_twoSum >= 3 && B_twoSum <= 5) {
            if(isNaN(PC3_point) && (P_twoSum == 6 || P_twoSum == 7)) {
                NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule5.png";
            }else {
                if(B_twoSum == 3) {
                    if((PC3_point >= 0 && PC3_point <= 7) || PC3_point == 9) {
                        NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule6.png";
                    }else if(PC3_point == 8) {
                        NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule7.png";
                    }
                }
                if(B_twoSum == 4) {
                    if(PC3_point >= 2 && PC3_point <= 7) {
                        NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule8.png";
                    }else if(PC3_point == 8 || PC3_point == 9 || PC3_point == 0 || PC3_point == 1) {
                        NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule9.png";
                    }
                }
                if(B_twoSum == 5) {
                    if(PC3_point >= 4 && PC3_point <= 7) {
                        NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule10.png";
                    }else if((PC3_point >= 0 && PC3_point <= 3) || PC3_point == 8 || PC3_point == 9) {
                        NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule11.png";
                    }
                }
            }        
        }else if(B_twoSum == 6) {
            if(PC3_point == 6 || PC3_point == 7) {
                NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule12.png";
            }else if(isNaN(PC3_point) && (P_twoSum == 6 || P_twoSum == 7)) {
                NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule14.png";
            }else if((PC3_point >= 0 && PC3_point <= 5) || PC3_point == 8 || PC3_point == 9){
                NBC.beforeRecord.getChildByName("BC3Rule").skin = "image/Rule13.png";
            }
        }
   
        //將有押注的紀錄顯示
        var showBet_userRecord = preRecord_transUserShow(showRecord);
        for(var i = 1; i <= 5; i++) {
                var num = "preRecord_point" + i;
                NBC[num].getChildByName("betName").text = "";
                NBC[num].getChildByName("bet").text = "";
                NBC[num].getChildByName("rate").text = "";
                NBC[num].getChildByName("getPoint").text = "";
                NBC[num].visible = false;
        }
        if(showBet_userRecord.length > 0) {    
            var j = 1;
            for(var i = 0, max = showBet_userRecord.length; i < max; i++) {
                var num = "preRecord_point" + j;
                NBC[num].getChildByName("betName").text = showBet_userRecord[i].betName;
                NBC[num].getChildByName("bet").text = showBet_userRecord[i].bet;
                NBC[num].getChildByName("rate").text = showBet_userRecord[i].rate;
                NBC[num].getChildByName("getPoint").text = showBet_userRecord[i].getPoint;

                if(showBet_userRecord[i].rate != "") {
                    NBC[num].skin = "image/preRecordc_01.png";
                }else {
                    NBC[num].skin = "image/preRecordc_02.png";
                }

                NBC[num].visible = true;
                j++;
            }
        }
    }//end main if.

}

//使用者的押注資訊
function preRecord_transUserShow(showRecord) {

    //{betName, bet, rate, getPoint}
    var showBet_userRecord = [];

    for(var key in user_betPoint.haveBet) {
        var record = user_betPoint.haveBet[key];
        if(showRecord.gameField == record.field && showRecord.gameRound == record.round) {
            //填入總押點,總得點,總點
            NBC.beforeRecord.getChildByName("betSumTot").text = record.totPoint;
            NBC.beforeRecord.getChildByName("getPointTot").text = record.totGetPoint;
            NBC.beforeRecord.getChildByName("allPointSum").text = record.allTotPoint;

            //有押注: player_btn, playerPair_btn, tie_btn, bankerPair_btn, banker_btn
            if(record.player_btn > 0) {
                var point = "";
                var rate = "";
                if(showRecord.winner == 1) {
                    point = record.playerBet;
                    rate = 2;
                }
                if(showRecord.winner == 3) {
                    point = record.player_btn;
                }
                var result = {
                    betName: "閒",
                    bet: record.player_btn,
                    rate: rate,
                    getPoint: point
                };
                showBet_userRecord.push(result);
            }
            if(record.banker_btn > 0) {
                var point = "";
                var rate = "";
                if(showRecord.winner == 2) {
                    point = record.bankerBet;
                    rate = 1.95;
                }
                if(showRecord.winner == 3) {
                    point = record.banker_btn;
                }
                var result = {
                    betName: "莊",
                    bet: record.banker_btn,
                    rate: rate,
                    getPoint: point
                };
                showBet_userRecord.push(result);
            }
            if(record.tie_btn > 0) {
                var point = "";
                var rate = "";
                if(showRecord.winner == 3) {
                    point = record.tieBet;
                    rate = 9;
                }
                var result = {
                    betName: "和",
                    bet: record.tie_btn,
                    rate: rate,
                    getPoint: point
                };
                showBet_userRecord.push(result);
            }
            if(record.playerPair_btn > 0) {
                var point = "";
                var rate = "";
                if(showRecord.pair == 1 || showRecord.pair == 3) {
                    point = record.playPairBet;
                    rate = 11;
                }
                if(showRecord.winner == 3) {
                    point = record.playerPair_btn;
                }
                var result = {
                    betName: "閒對",
                    bet: record.playerPair_btn,
                    rate: rate,
                    getPoint: point
                };
                showBet_userRecord.push(result);
            }
            if(record.bankerPair_btn > 0) {
                var point = "";
                var rate = "";
                if(showRecord.pair == 2 || showRecord.pair == 3) {
                    point = record.bankPairBet;
                    rate = 11;
                }
                if(showRecord.winner == 3) {
                    point = record.bankerPair_btn;
                }
                var result = {
                    betName: "莊對",
                    bet: record.bankerPair_btn,
                    rate: rate,
                    getPoint: point
                };
                showBet_userRecord.push(result);
            }
            break;
        }//end main if.
        else {
            //填入總押點,總得點,總點
            NBC.beforeRecord.getChildByName("betSumTot").text = 0;
            NBC.beforeRecord.getChildByName("getPointTot").text = 0;
            NBC.beforeRecord.getChildByName("allPointSum").text = 0;
        }
    }// end for.

    return showBet_userRecord;
}

//右上四場記錄
function getPreRecords_Four(fourRecords) {
    for(var i = 0, max = fourRecords.length; i < max; i++) {
        var j = i + 1;
        NBC.R06ShowRecords.getChildByName("RPC1" + j).getChildByName("RPC1" + j + "G").alpha = 0;
        NBC.R06ShowRecords.getChildByName("RPC2" + j).getChildByName("RPC2" + j + "G").alpha = 0;
        NBC.R06ShowRecords.getChildByName("RPC3" + j).getChildByName("RPC3" + j + "G").alpha = 0;
        NBC.R06ShowRecords.getChildByName("RBC1" + j).getChildByName("RBC1" + j + "G").alpha = 0;
        NBC.R06ShowRecords.getChildByName("RBC2" + j).getChildByName("RBC2" + j + "G").alpha = 0;
        NBC.R06ShowRecords.getChildByName("RBC3" + j).getChildByName("RBC3" + j + "G").alpha = 0;
        NBC.R06ShowRecords.getChildByName("RPC3" + j).alpha = 1;
        NBC.R06ShowRecords.getChildByName("RBC3" + j).alpha = 1;

        NBC.R06ShowRecords.getChildByName("Rfield" + j).text = fourRecords[i].gameField + "-" + fourRecords[i].gameRound;
        NBC.R06ShowRecords.getChildByName("RPC1" + j).skin = "puker/puker_small/puker" + fourRecords[i].PC1 + ".png";
        NBC.R06ShowRecords.getChildByName("RPC2" + j).skin = "puker/puker_small/puker" + fourRecords[i].PC2 + ".png";
        NBC.R06ShowRecords.getChildByName("RBC1" + j).skin = "puker/puker_small/puker" + fourRecords[i].BC1 + ".png";
        NBC.R06ShowRecords.getChildByName("RBC2" + j).skin = "puker/puker_small/puker" + fourRecords[i].BC2 + ".png";

        if(fourRecords[i].PC3 == 0) {
            NBC.R06ShowRecords.getChildByName("RPC3" + j).skin = "puker/puker_small/Backgroundwhite.png";
            NBC.R06ShowRecords.getChildByName("RPC3" + j).alpha = 0.4;
        }else {
            NBC.R06ShowRecords.getChildByName("RPC3" + j).skin = "puker/puker_small/puker" + fourRecords[i].PC3 + ".png";
        }

        if(fourRecords[i].BC3 == 0) {
            NBC.R06ShowRecords.getChildByName("RBC3" + j).skin = "puker/puker_small/Backgroundwhite.png";
            NBC.R06ShowRecords.getChildByName("RBC3" + j).alpha = 0.4;
        }else {
            NBC.R06ShowRecords.getChildByName("RBC3" + j).skin = "puker/puker_small/puker" + fourRecords[i].BC3 + ".png";
        }

        switch(fourRecords[i].winner) {
            case 1:
                NBC.R06ShowRecords.getChildByName("Rresult" + j).text = "閒";
                NBC.R06ShowRecords.getChildByName("Rresult" + j).color = "#328dba";
                NBC.R06ShowRecords.getChildByName("RBC1" + j).getChildByName("RBC1" + j + "G").alpha = 0.4;
                NBC.R06ShowRecords.getChildByName("RBC2" + j).getChildByName("RBC2" + j + "G").alpha = 0.4;
                if(fourRecords[i].BC3 == 0) {
                    NBC.R06ShowRecords.getChildByName("RBC3" + j).getChildByName("RBC3" + j + "G").alpha = 0;
                }else {
                    NBC.R06ShowRecords.getChildByName("RBC3" + j).getChildByName("RBC3" + j + "G").alpha = 0.4;
                }
                break;
            case 2:
                NBC.R06ShowRecords.getChildByName("Rresult" + j).text = "莊";
                NBC.R06ShowRecords.getChildByName("Rresult" + j).color = "#ff0400";
                NBC.R06ShowRecords.getChildByName("RPC1" + j).getChildByName("RPC1" + j + "G").alpha = 0.4;
                NBC.R06ShowRecords.getChildByName("RPC2" + j).getChildByName("RPC2" + j + "G").alpha = 0.4;
                if(fourRecords[i].PC3 == 0) {
                    NBC.R06ShowRecords.getChildByName("RPC3" + j).getChildByName("RPC3" + j + "G").alpha = 0;
                }else {
                    NBC.R06ShowRecords.getChildByName("RPC3" + j).getChildByName("RPC3" + j + "G").alpha = 0.4;
                }
                break;
            case 3:
                NBC.R06ShowRecords.getChildByName("Rresult" + j).text = "和";
                NBC.R06ShowRecords.getChildByName("Rresult" + j).color = "#f7e300";
                break;  
        }
    }
    //翻牌動畫
    Right06CardAnimate();
}

//更新右上場次及贏家次數
function ChangeRight06AllText(action) {

    // NBC.R06_player.text = action.lastGameRecord.player_win;
    // NBC.R06_tie.text = action.lastGameRecord.tie;
    // NBC.R06_banker.text = action.lastGameRecord.banker_win;
    // NBC.R06_playPair.text = action.lastGameRecord.player_pair;
    // NBC.R06_bankPair.text = action.lastGameRecord.banker_pair;
    // NBC.R03_P.text = action.lastGameRecord.player_win;
    // NBC.R03_T.text = action.lastGameRecord.tie;
    // NBC.R03_B.text = action.lastGameRecord.banker_win;
    // NBC.R03_PP.text = action.lastGameRecord.player_pair;
    // NBC.R03_BP.text = action.lastGameRecord.banker_pair;
    // NBC.leftMenu.getChildByName("player").getChildByName("times").text = action.lastGameRecord.player_win;
    // NBC.leftMenu.getChildByName("tie").getChildByName("times").text = action.lastGameRecord.tie;
    // NBC.leftMenu.getChildByName("banker").getChildByName("times").text = action.lastGameRecord.banker_win;
    // NBC.leftMenu.getChildByName("playerPair").getChildByName("times").text = action.lastGameRecord.player_pair;
    // NBC.leftMenu.getChildByName("bankerPair").getChildByName("times").text = action.lastGameRecord.banker_pair;
    NBC.R06_player.changeText(action.lastGameRecord.player_win);
    NBC.R06_tie.changeText(action.lastGameRecord.tie);
    NBC.R06_banker.changeText(action.lastGameRecord.banker_win);
    NBC.R06_playPair.changeText(action.lastGameRecord.player_pair);
    NBC.R06_bankPair.changeText(action.lastGameRecord.banker_pair);
    NBC.R03_P.changeText(action.lastGameRecord.player_win);
    NBC.R03_T.changeText(action.lastGameRecord.tie);
    NBC.R03_B.changeText(action.lastGameRecord.banker_win);
    NBC.R03_PP.changeText(action.lastGameRecord.player_pair);
    NBC.R03_BP.changeText(action.lastGameRecord.banker_pair);
    NBC.leftMenu.getChildByName("player").getChildByName("times").changeText(action.lastGameRecord.player_win);
    NBC.leftMenu.getChildByName("tie").getChildByName("times").changeText(action.lastGameRecord.tie);
    NBC.leftMenu.getChildByName("banker").getChildByName("times").changeText(action.lastGameRecord.banker_win);
    NBC.leftMenu.getChildByName("playerPair").getChildByName("times").changeText(action.lastGameRecord.player_pair);
    NBC.leftMenu.getChildByName("bankerPair").getChildByName("times").changeText(action.lastGameRecord.banker_pair);
}

//續押功能//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function reBetClickBtnOverOut() {
    NBC.continuBet.on(Laya.Event.MOUSE_OVER, this, function() {
        Laya.Tween.to(NBC.continuBet, { scaleX: 1.2, scaleY: 1.2 }, 350, Laya.Ease.bounceOut, null);
    });
    NBC.continuBet.on(Laya.Event.MOUSE_OUT, this, function() {
        Laya.Tween.to(NBC.continuBet, { scaleX: 1, scaleY: 1 }, 350, Laya.Ease.bounceOut, null);
    });
    NBC.Retirement.on(Laya.Event.MOUSE_OVER, this, function() {
        Laya.Tween.to(NBC.Retirement, { scaleX: 1.2, scaleY: 1.2 }, 350, Laya.Ease.bounceOut, null);
    });
    NBC.Retirement.on(Laya.Event.MOUSE_OUT, this, function() {
        Laya.Tween.to(NBC.Retirement, { scaleX: 1, scaleY: 1 }, 350, Laya.Ease.bounceOut, null);
    });
}
  
function continuClick_Bet(nowBet, /*nowChip_cImg,*/ nowChip_cPoint) {
    //放上當前續押的籌碼
    switch (nowBet) {
        case "player_btn":
            //傳送給server
            var result = {
                action: "betting",
                betBtn: "player_btn",
                betPoint: nowChip_cPoint
            };
            NBC.socket.send(JSON.stringify(result));
            break;
         case "playerPair_btn":
            //傳送給server
            var result = {
                action: "betting",
                betBtn: "playerPair_btn",
                betPoint: nowChip_cPoint
            };
            NBC.socket.send(JSON.stringify(result));
            break;
        case "tie_btn":
            //傳送給server
            var result = {
                action: "betting",
                betBtn: "tie_btn",
                betPoint: nowChip_cPoint
            };
            NBC.socket.send(JSON.stringify(result));
            break;
        case "bankerPair_btn":
            //傳送給server
            var result = {
                action: "betting",
                betBtn: "bankerPair_btn",
                betPoint: nowChip_cPoint
            };
            NBC.socket.send(JSON.stringify(result));
            break;
        case "banker_btn":
            //傳送給server
            var result = {
                action: "betting",
                betBtn: "banker_btn",
                betPoint: nowChip_cPoint
            };
            NBC.socket.send(JSON.stringify(result));
            break;
    }
}


//寫入續押的籌碼
function reBetClick_List(reBetName, preBetPoint) {
    //遍歷所有的籌碼點數(先將籌碼由小到大排好)
    var TotChips = [
        { Name: "chip01", point: parseInt(NBC.chips.getChildByName("chip01").getChildByName("chip").getChildByName("chipText").text) },
        { Name: "chip02", point: parseInt(NBC.chips.getChildByName("chip02").getChildByName("chip").getChildByName("chipText").text) },
        { Name: "chip03", point: parseInt(NBC.chips.getChildByName("chip03").getChildByName("chip").getChildByName("chipText").text) },
        { Name: "chip04", point: parseInt(NBC.chips.getChildByName("chip04").getChildByName("chip").getChildByName("chipText").text) },
        { Name: "chip05", point: parseInt(NBC.chips.getChildByName("chip05").getChildByName("chip").getChildByName("chipText").text) }
    ];
    TotChips = TotChips.sort(function (a, b) {
        return a.point > b.point ? 1 : -1;
    });
    var list = getBet_drawList(reBetName);   
    var preBet = preBetPoint;

    while(preBet > 0) {  
        //從最大的開始批配
        if(preBet >= TotChips[4].point && !(TotChips[4].point <= 0)) {
            var the_Img = TotChips[4].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[4].point);
            preBet -= TotChips[4].point;
        } else if(preBet < TotChips[4].point && preBet >= TotChips[3].point && (!(TotChips[4].point <= 0) && !(TotChips[3].point <= 0))) {
            var the_Img = TotChips[3].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[3].point);
            preBet -= TotChips[3].point;
        } else if(preBet < TotChips[3].point && preBet >= TotChips[2].point && (!(TotChips[3].point <= 0) && !(TotChips[2].point <= 0))) {
            var the_Img = TotChips[2].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[2].point);
            preBet -= TotChips[2].point;
        } else if(preBet < TotChips[2].point && preBet >= TotChips[1].point && (!(TotChips[2].point <= 0) && !(TotChips[1].point <= 0))) {
            var the_Img = TotChips[1].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[1].point);
            preBet -= TotChips[1].point;
        } else if(preBet < TotChips[1].point && preBet >= TotChips[0].point && (!(TotChips[1].point <= 0) && !(TotChips[0].point <= 0))) {
            var the_Img = TotChips[0].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[0].point);
            preBet -= TotChips[0].point;
        } else {
            list[0].push(6);
            list[1].push(preBet);
            if(TotChips[0].point <= 0) {
                preBet -= preBet;
            }else {
                preBet -= TotChips[0].point;
            }
        }
    }
    continuClick_Bet(reBetName, preBetPoint);
}

function returnMinToMaxSort() {
    var TotChips = [
        { Name: "chip01", point: (NBC.chips.getChildByName("chip01").getChildByName("chip").getChildByName("chipText").text == "Max") ? singleNoteMax:parseInt(NBC.chips.getChildByName("chip01").getChildByName("chip").getChildByName("chipText").text) },
        { Name: "chip02", point: (NBC.chips.getChildByName("chip02").getChildByName("chip").getChildByName("chipText").text == "Max") ? singleNoteMax:parseInt(NBC.chips.getChildByName("chip02").getChildByName("chip").getChildByName("chipText").text) },
        { Name: "chip03", point: (NBC.chips.getChildByName("chip03").getChildByName("chip").getChildByName("chipText").text == "Max") ? singleNoteMax:parseInt(NBC.chips.getChildByName("chip03").getChildByName("chip").getChildByName("chipText").text) },
        { Name: "chip04", point: (NBC.chips.getChildByName("chip04").getChildByName("chip").getChildByName("chipText").text == "Max") ? singleNoteMax:parseInt(NBC.chips.getChildByName("chip04").getChildByName("chip").getChildByName("chipText").text) },
        { Name: "chip05", point: (NBC.chips.getChildByName("chip05").getChildByName("chip").getChildByName("chipText").text == "Max") ? singleNoteMax:parseInt(NBC.chips.getChildByName("chip05").getChildByName("chip").getChildByName("chipText").text) }
    ];
    TotChips = TotChips.sort(function (a, b) {
        return a.point > b.point ? 1 : -1;
    });

    return TotChips;
}


function resetBetChipList(betName, point) {
    //遍歷所有的籌碼點數(先將籌碼由小到大排好)
    var TotChips = returnMinToMaxSort();
    var list = getBet_drawList(betName); 
    var preBet = point;

    while(preBet > 0) {  
        //從最大的開始批配
        if(preBet >= TotChips[4].point && !(TotChips[4].point <= 0)) {
            var the_Img = TotChips[4].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[4].point);
            preBet -= TotChips[4].point;
        } else if(preBet < TotChips[4].point && preBet >= TotChips[3].point && (!(TotChips[4].point <= 0) && !(TotChips[3].point <= 0))) {
            var the_Img = TotChips[3].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[3].point);
            preBet -= TotChips[3].point;
        } else if(preBet < TotChips[3].point && preBet >= TotChips[2].point && (!(TotChips[3].point <= 0) && !(TotChips[2].point <= 0))) {
            var the_Img = TotChips[2].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[2].point);
            preBet -= TotChips[2].point;
        } else if(preBet < TotChips[2].point && preBet >= TotChips[1].point && (!(TotChips[2].point <= 0) && !(TotChips[1].point <= 0))) {
            var the_Img = TotChips[1].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[1].point);
            preBet -= TotChips[1].point;
        } else if(preBet < TotChips[1].point && preBet >= TotChips[0].point && (!(TotChips[1].point <= 0) && !(TotChips[0].point <= 0))) {
            var the_Img = TotChips[0].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[0].point);
            preBet -= TotChips[0].point;
        } else {
            list[0].push(6);
            list[1].push(preBet);
            if(TotChips[0].point <= 0) {
                preBet -= preBet;
            }else {
                preBet -= TotChips[0].point;
            }
        }
        
    }
}

//清空繪製籌碼的List
function clearChipDrawList(betBtn) {
    switch(betBtn) {
        case "player_btn":
            Bet_playerList = [[], []];
            NBC.player_btnBetchip.graphics.clear();
            NBC.player_btnDropchip.graphics.clear();
            break;
        case "playerPair_btn":
            Bet_playerPairList = [[], []];
            NBC.playerPair_btnBetchip.graphics.clear();
            NBC.playerPair_btnDropchip.graphics.clear();
            break;
        case "tie_btn":
            Bet_tieList = [[], []];
            NBC.tie_btnBetchip.graphics.clear();
            NBC.tie_btnDropchip.graphics.clear();
            break;
        case "bankerPair_btn":
            Bet_bankerPairList = [[], []];
            NBC.bankerPair_btnBetchip.graphics.clear();
            NBC.bankerPair_btnDropchip.graphics.clear();
            break;
        case "banker_btn":
            Bet_bankerList = [[], []];
            NBC.banker_btnBetchip.graphics.clear();
            NBC.banker_btnDropchip.graphics.clear();
            break;
    }
}


//籌碼得分///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//籌碼得分動畫
function drawChip_getPointsToShow(getBtn) {
    var drawList = getGet_drawList(getBtn);

    for(var i = 0, max = drawList[0].length; i < max; i++) {
        NBC[getBtn + "getChip"].graphics.drawTexture(Laya.loader.getRes("chip/chip" + drawList[0][i] + ".png"), 0, i * (-3) - 3);        
        NBC[getBtn + "getChip"].getChildByName("chipText").text = (drawList[0][i] == 6) ? "" : drawList[1][i];
        NBC[getBtn + "getChip"].getChildByName("chipText").y = i * (-3) + 22.5;
    }

    var y = -40;
    switch(getBtn) {
        case "player_btn":
            y = 528;
            break;
        case "playerPair_btn":
            y = 535;
            break;
        case "tie_btn":
            y = 535;
            break;
        case "bankerPair_btn":
            y = 535;
            break;
        case "banker_btn":
            y = 529;
            break;
    }
    Laya.Tween.clearAll(NBC[getBtn + "getChip"]);
    Laya.Tween.to(NBC[getBtn + "getChip"], { y: y }, 680, Laya.Ease.bounceInOut, null);
    //播放語音
    if (set_GameValue.UseChips) {
        SoundManager.playSound("res/sound/chip.mp3", 1);
        SoundManager.setSoundVolume(set_GameValue.Voice, "res/sound/chip.mp3");
    }
}

//繪製得分的籌碼
function getGetChipList(betName, point) {
    //遍歷所有的籌碼點數(先將籌碼由小到大排好)
    var TotChips = returnMinToMaxSort();
    var list = getGet_drawList(betName);
    var preBet = point;

    while(preBet > 0) {  
        //從最大的開始批配
        if(preBet >= TotChips[4].point && !(TotChips[4].point <= 0)) {
            var the_Img = TotChips[4].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[4].point);
            preBet -= TotChips[4].point;
        } else if(preBet < TotChips[4].point && preBet >= TotChips[3].point && (!(TotChips[4].point <= 0) && !(TotChips[3].point <= 0))) {
            var the_Img = TotChips[3].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[3].point);
            preBet -= TotChips[3].point;
        } else if(preBet < TotChips[3].point && preBet >= TotChips[2].point && (!(TotChips[3].point <= 0) && !(TotChips[2].point <= 0))) {
            var the_Img = TotChips[2].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[2].point);
            preBet -= TotChips[2].point;
        } else if(preBet < TotChips[2].point && preBet >= TotChips[1].point && (!(TotChips[2].point <= 0) && !(TotChips[1].point <= 0))) {
            var the_Img = TotChips[1].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[1].point);
            preBet -= TotChips[1].point;
        } else if(preBet < TotChips[1].point && preBet >= TotChips[0].point && (!(TotChips[1].point <= 0) && !(TotChips[0].point <= 0))) {
            var the_Img = TotChips[0].Name.split("");
            list[0].push(the_Img[(the_Img.length - 1)]);
            list[1].push(TotChips[0].point);
            preBet -= TotChips[0].point;
        } else {
            list[0].push(6);
            list[1].push(preBet);
            if(TotChips[0].point <= 0) {
                preBet -= preBet;
            }else {
                preBet -= TotChips[0].point;
            }
        }
    }

}

//取得目前得分的籌碼清單
function getGet_drawList(getBtnName) {
    switch (getBtnName) {
        case "player_btn":
            return Get_playerList;
        case "playerPair_btn":
            return Get_playerPairList;
        case "tie_btn":
            return Get_tieList;
        case "bankerPair_btn":
            return Get_bankerPairList;
        case "banker_btn":
            return Get_bankerList;
    }
}

//清空所有得分籌碼並歸位
function clearChipGet_DrawList() {
    Get_playerList = [[], []];
    Get_playerPairList = [[], []];
    Get_tieList = [[], []];
    Get_bankerPairList = [[], []];
    Get_bankerList = [[], []];
    NBC.player_btngetChip.getChildByName("chipText").text = "";
    NBC.playerPair_btngetChip.getChildByName("chipText").text = "";
    NBC.tie_btngetChip.getChildByName("chipText").text = "";
    NBC.bankerPair_btngetChip.getChildByName("chipText").text = "";
    NBC.banker_btngetChip.getChildByName("chipText").text = "";

    NBC.player_btngetChip.y = -40;
    NBC.playerPair_btngetChip.y = -40;
    NBC.tie_btngetChip.graphics.y = -40;
    NBC.bankerPair_btngetChip.y = -40;
    NBC.banker_btngetChip.y = -40;

    NBC.player_btngetChip.graphics.clear();
    NBC.playerPair_btngetChip.graphics.clear();
    NBC.tie_btngetChip.graphics.clear();
    NBC.bankerPair_btngetChip.graphics.clear();
    NBC.banker_btngetChip.graphics.clear();
    NBC.player_btngetSum.text = "";
    NBC.tie_btngetSum.text = "";
    NBC.banker_btngetSum.text = "";
    NBC.playerPair_btngetSum.text = "";
    NBC.bankerPair_btngetSum.text = "";
}


//將原先押注的籌碼及分數做變暗處理
function allBetTextAndChipToDark() {
    //將有押注的字變白,小
    NBC.allBetBtn.getChildByName("player_btn").getChildByName("sum").color = "#cccccc";
    NBC.allBetBtn.getChildByName("player_btn").getChildByName("sum").fontSize = 27;
    NBC.allBetBtn.getChildByName("playerPair_btn").getChildByName("sum").color = "#cccccc";
    NBC.allBetBtn.getChildByName("playerPair_btn").getChildByName("sum").fontSize = 27;
    NBC.allBetBtn.getChildByName("tie_btn").getChildByName("sum").color = "#cccccc";
    NBC.allBetBtn.getChildByName("tie_btn").getChildByName("sum").fontSize = 27;
    NBC.allBetBtn.getChildByName("bankerPair_btn").getChildByName("sum").color = "#cccccc";
    NBC.allBetBtn.getChildByName("bankerPair_btn").getChildByName("sum").fontSize = 27;
    NBC.allBetBtn.getChildByName("banker_btn").getChildByName("sum").color = "#cccccc";
    NBC.allBetBtn.getChildByName("banker_btn").getChildByName("sum").fontSize = 27;
    //將有押注的籌碼變透明
    NBC.player_btnBetchip.alpha = 0.9;
    NBC.playerPair_btnBetchip.alpha = 0.9;
    NBC.tie_btnBetchip.alpha = 0.9;
    NBC.bankerPair_btnBetchip.alpha = 0.9;
    NBC.banker_btnBetchip.alpha = 0.9;
}

/**
 * 當開和有押閒莊時
 */
function winnerTie_BetTextAndChipToDark() {
    //莊閒外將有押注的字變白,小
    NBC.allBetBtn.getChildByName("playerPair_btn").getChildByName("sum").color = "#cccccc";
    NBC.allBetBtn.getChildByName("playerPair_btn").getChildByName("sum").fontSize = 27;
    NBC.allBetBtn.getChildByName("tie_btn").getChildByName("sum").color = "#cccccc";
    NBC.allBetBtn.getChildByName("tie_btn").getChildByName("sum").fontSize = 27;
    NBC.allBetBtn.getChildByName("bankerPair_btn").getChildByName("sum").color = "#cccccc";
    NBC.allBetBtn.getChildByName("bankerPair_btn").getChildByName("sum").fontSize = 27;

    //將有押注的籌碼變透明
    NBC.playerPair_btnBetchip.alpha = 0.9;
    NBC.tie_btnBetchip.alpha = 0.9;
    NBC.bankerPair_btnBetchip.alpha = 0.9;
}

//將變暗的籌碼及押注分數復原
function allBetTextAndChipToOrgin() {
    NBC.allBetBtn.getChildByName("player_btn").getChildByName("sum").color = "#f7e300";
    NBC.allBetBtn.getChildByName("player_btn").getChildByName("sum").fontSize = 30;
    NBC.allBetBtn.getChildByName("playerPair_btn").getChildByName("sum").color = "#f7e300";
    NBC.allBetBtn.getChildByName("playerPair_btn").getChildByName("sum").fontSize = 30;
    NBC.allBetBtn.getChildByName("tie_btn").getChildByName("sum").color = "#f7e300";
    NBC.allBetBtn.getChildByName("tie_btn").getChildByName("sum").fontSize = 30;
    NBC.allBetBtn.getChildByName("bankerPair_btn").getChildByName("sum").color = "#f7e300";
    NBC.allBetBtn.getChildByName("bankerPair_btn").getChildByName("sum").fontSize = 30;
    NBC.allBetBtn.getChildByName("banker_btn").getChildByName("sum").color = "#f7e300";
    NBC.allBetBtn.getChildByName("banker_btn").getChildByName("sum").fontSize = 30;
    NBC.player_btnBetchip.alpha = 1;
    NBC.playerPair_btnBetchip.alpha = 1;
    NBC.tie_btnBetchip.alpha = 1;
    NBC.bankerPair_btnBetchip.alpha = 1;
    NBC.banker_btnBetchip.alpha = 1;
}


//籌碼拖曳/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 將移動過的籌碼歸位
 */
function DropChipPos_toOrigin() {
    NBC.player_btnBetchip.pos(163, 528);
    NBC.player_btnDropchip.pos(163, 528);
    NBC.player_btnDropchip.alpha = 0;
    NBC.playerPair_btnBetchip.pos(369, 535);
    NBC.playerPair_btnDropchip.pos(369, 535);
    NBC.playerPair_btnDropchip.alpha = 0;
    NBC.tie_btnBetchip.pos(512, 535);
    NBC.tie_btnDropchip.pos(512, 535);
    NBC.tie_btnDropchip.alpha = 0;
    NBC.bankerPair_btnBetchip.pos(653, 535);
    NBC.bankerPair_btnDropchip.pos(653, 535);
    NBC.bankerPair_btnDropchip.alpha = 0;
    NBC.banker_btnBetchip.pos(860, 529);
    NBC.banker_btnDropchip.pos(860, 529);
    NBC.banker_btnDropchip.alpha = 0;
}

/**
 * 註冊籌碼拖曳滑鼠事件
 */
function DroopChipsMouseAll() {
    NBC.allBetBtn.getChildByName("player_btn").on(Laya.Event.MOUSE_DOWN, this, function() {      
        if(set_GameValue.UseChipsDrop == true) {
            // chipFlagP = true;
            chipFlagP = (setting_login.nowLogin != "") ? true : chipFlagP;
        }else {
            //點擊
            DropChipPos_toOrigin();
            betImgClick({target: {name: "player_btn"}});
        }
    });
    NBC.allBetBtn.getChildByName("playerPair_btn").on(Laya.Event.MOUSE_DOWN, this, function() {
        if(set_GameValue.UseChipsDrop == true) {
            // chipFlagPpair = true;
            chipFlagPpair = (setting_login.nowLogin != "") ? true : chipFlagPpair;
        }else {
            //點擊
            DropChipPos_toOrigin();
            betImgClick({target: {name: "playerPair_btn"}});
        }
    });
    NBC.allBetBtn.getChildByName("tie_btn").on(Laya.Event.MOUSE_DOWN, this, function() {
        if(set_GameValue.UseChipsDrop == true) {
            // chipFlagT = true;
            chipFlagT = (setting_login.nowLogin != "") ? true : chipFlagT;
        }else {
            //點擊
            DropChipPos_toOrigin();
            betImgClick({target: {name: "tie_btn"}});
        }
    });
    NBC.allBetBtn.getChildByName("bankerPair_btn").on(Laya.Event.MOUSE_DOWN, this, function() {
        if(set_GameValue.UseChipsDrop == true) {
            // chipFlagBpair = true;
            chipFlagBpair = (setting_login.nowLogin != "") ? true : chipFlagBpair;
        }else {
            //點擊
            DropChipPos_toOrigin();
            betImgClick({target: {name: "bankerPair_btn"}});
        }
    });
    NBC.allBetBtn.getChildByName("banker_btn").on(Laya.Event.MOUSE_DOWN, this, function() {
        if(set_GameValue.UseChipsDrop == true) {
            // chipFlagB = true;
            chipFlagB = (setting_login.nowLogin != "") ? true : chipFlagB;
        }else {
            //點擊
            DropChipPos_toOrigin();
            betImgClick({target: {name: "banker_btn"}});
        } 
    });

}

//取消籌碼拖曳滑鼠事件
function DroopChipsMouseOffAll() {
    var bet_btn = ["player_btn", "playerPair_btn", "tie_btn", "bankerPair_btn", "banker_btn"];
    for (var key in bet_btn) {
        NBC[[bet_btn[key] + "Dropchip"]].offAll();
    }
}

//拖曳籌碼退押
function DropChipRetireBet(BetName) {
    var origin_x = 0;
    var origin_y = 0;
    //籌碼歸位
    switch(BetName) {
        case "player_btn":
            origin_x = 163;
            origin_y = 528;
            break;
        case "playerPair_btn":
            origin_x = 369;
            origin_y = 535;
            break;
        case "tie_btn":
            origin_x = 512;
            origin_y = 535;
            break;
        case "bankerPair_btn":
            origin_x = 653;
            origin_y = 535;
            break;
        case "banker_btn":
            origin_x = 860;
            origin_y = 529;
            break;
    }  
    //退押
    NBC[BetName + "Dropchip"].alpha = 0;
    NBC[BetName + "Dropchip"].pos(origin_x, origin_y);

     var retireBetOne = {
        action: "retireBetOne",
        betBtn: BetName
    };
    NBC.socket.send(JSON.stringify(retireBetOne));

    NBC[BetName + "Dropchip"].pos(origin_x, origin_y);
    NBC[BetName + "Betchip"].pos(origin_x, origin_y);
}


function DropChipPlayerBtn(btnName) {
    //確認籌碼是否在押注區
    var origin_x = 0;
    var origin_y = 0;
    //籌碼歸位
    switch(btnName) {
        case "player_btn":
            origin_x = 163;
            origin_y = 528;
            break;
        case "playerPair_btn":
            origin_x = 369;
            origin_y = 535;
            break;
        case "tie_btn":
            origin_x = 512;
            origin_y = 535;
            break;
        case "bankerPair_btn":
            origin_x = 653;
            origin_y = 535;
            break;
        case "banker_btn":
            origin_x = 860;
            origin_y = 529;
            break;
    }      

    var point = NBC.allBetBtn.getChildByName(btnName).getChildByName("sum").text; 
    if((Laya.stage.mouseX >= 38 && Laya.stage.mouseX <= 284) && (Laya.stage.mouseY >= 453 && Laya.stage.mouseY <= 597)) {
        //閒家押注區
        NBC[btnName + "Dropchip"].alpha = 0;
        NBC[btnName + "Dropchip"].pos(163, 528);
        NBC[btnName + "Betchip"].pos(163, 528);

        //先判斷是不是在原本的押注區,是則不進行拖曳押注
        if(btnName != "player_btn") {
            var retireBetOne = {
                action: "retireBetOne",
                betBtn: btnName
            };
            NBC.socket.send(JSON.stringify(retireBetOne));

            var BetOne = {
                action: "betting",
                betBtn: "player_btn",
                betPoint: point
            };
            NBC.socket.send(JSON.stringify(BetOne));
        }else {
            //點擊
            betImgClick({target: {name: "player_btn"}});
        }
        
        NBC[btnName + "Dropchip"].pos(origin_x, origin_y);
        NBC[btnName + "Betchip"].pos(origin_x, origin_y);

    }else if((Laya.stage.mouseX >= 306 && Laya.stage.mouseX <= 428) && (Laya.stage.mouseY >= 477 && Laya.stage.mouseY <= 596)) {
        //閒對子押注區
        NBC[btnName + "Dropchip"].alpha = 0;
        NBC[btnName + "Dropchip"].pos(369, 535);
        NBC[btnName + "Betchip"].pos(369, 535);

        //先判斷是不是在原本的押注區,是則不進行拖曳押注
        if(btnName != "playerPair_btn") {
            var retireBetOne = {
                action: "retireBetOne",
                betBtn: btnName
            };
            NBC.socket.send(JSON.stringify(retireBetOne));

            var BetOne = {
                action: "betting",
                betBtn: "playerPair_btn",
                betPoint: point
            };
            NBC.socket.send(JSON.stringify(BetOne));
        }else {
            //點擊
            betImgClick({target: {name: "playerPair_btn"}});
        }

        NBC[btnName + "Dropchip"].pos(origin_x, origin_y);
        NBC[btnName + "Betchip"].pos(origin_x, origin_y);

    }else if((Laya.stage.mouseX >= 450 && Laya.stage.mouseX <= 572) && (Laya.stage.mouseY >= 477 && Laya.stage.mouseY <= 599)) {
        //和押注區
        NBC[btnName + "Dropchip"].alpha = 0;
        NBC[btnName + "Dropchip"].pos(512, 535);
        NBC[btnName + "Betchip"].pos(512, 535);

        //先判斷是不是在原本的押注區,是則不進行拖曳押注
        if(btnName != "tie_btn") {
            var retireBetOne = {
                action: "retireBetOne",
                betBtn: btnName
            };
            NBC.socket.send(JSON.stringify(retireBetOne));

            var BetOne = {
                action: "betting",
                betBtn: "tie_btn",
                betPoint: point
            };
            NBC.socket.send(JSON.stringify(BetOne));
        }else {
            //點擊
            betImgClick({target: {name: "tie_btn"}});
        } 

        NBC[btnName + "Dropchip"].pos(origin_x, origin_y);
        NBC[btnName + "Betchip"].pos(origin_x, origin_y);

    }else if((Laya.stage.mouseX >= 591 && Laya.stage.mouseX <= 715) && (Laya.stage.mouseY >= 477 && Laya.stage.mouseY <= 600)) {
        //莊對子押注區
        NBC[btnName + "Dropchip"].alpha = 0;
        NBC[btnName + "Dropchip"].pos(653, 535);
        NBC[btnName + "Betchip"].pos(653, 535);

        if(btnName != "bankerPair_btn") {
            var retireBetOne = {
                action: "retireBetOne",
                betBtn: btnName
            };
            NBC.socket.send(JSON.stringify(retireBetOne));

            var BetOne = {
                action: "betting",
                betBtn: "bankerPair_btn",
                betPoint: point
            };
            NBC.socket.send(JSON.stringify(BetOne));
        }else {
            //點擊
            betImgClick({target: {name: "bankerPair_btn"}});
        }

        NBC[btnName + "Dropchip"].pos(origin_x, origin_y);
        NBC[btnName + "Betchip"].pos(origin_x, origin_y);

    }else if((Laya.stage.mouseX >= 739 && Laya.stage.mouseX <= 985) && (Laya.stage.mouseY >= 453 && Laya.stage.mouseY <= 597)) {
        //莊家押注區
        NBC[btnName + "Dropchip"].alpha = 0;
        NBC[btnName + "Dropchip"].pos(860, 529);
        NBC[btnName + "Betchip"].pos(860, 529);

        if(btnName != "banker_btn") {
            var retireBetOne = {
                action: "retireBetOne",
                betBtn: btnName
            };
            NBC.socket.send(JSON.stringify(retireBetOne));

            var BetOne = {
                action: "betting",
                betBtn: "banker_btn",
                betPoint: point
            };
            NBC.socket.send(JSON.stringify(BetOne));
        }else {
            //點擊
            betImgClick({target: {name: "banker_btn"}});
        }

        NBC[btnName + "Dropchip"].pos(origin_x, origin_y);
        NBC[btnName + "Betchip"].pos(origin_x, origin_y);

    }else {
        //退押此籌碼
        NBC[btnName + "Dropchip"].alpha = 0;
        NBC[btnName + "Dropchip"].pos(origin_x, origin_y);

        var retireBetOne = {
            action: "retireBetOne",
            betBtn: btnName
        };
        NBC.socket.send(JSON.stringify(retireBetOne));

        NBC[btnName + "Dropchip"].pos(origin_x, origin_y);
        NBC[btnName + "Betchip"].pos(origin_x, origin_y);
    }
}

//判斷鼠標MOUSE_UP時是否在押注區
function hasMouseUp_InBetBlock(mouseX, mouseY) {

    if((mouseX >= 38 && mouseX <= 284) && (mouseY >= 453 && mouseY <= 597)) {
        return true;
    }else if((mouseX >= 306 && mouseX <= 428) && (mouseY >= 477 && mouseY <= 596)) {
        return true;
    }else if((mouseX >= 450 && mouseX <= 572) && (mouseY >= 477 && mouseY <= 599)) {
        return true;
    }else if((mouseX >= 591 && mouseX <= 715) && (mouseY >= 477 && mouseY <= 600)) {
        return true;
    }else if((mouseX >= 739 && mouseX <= 985) && (mouseY >= 453 && mouseY <= 597)) {
        return true;
    }else {
        return false;
    }
}

//下方分數列////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 顯示押注分數
 * @param {*double} num 押注分數
 */
function showBetPoint(num) {
    if (num == 0) {
        //退押
        for (var i = 0; i <= 5; i++) {
            if (i == 5) {
                NBC.scroeBar.getChildByName(("bet_" + i)).skin = "digitnumber/LD_0.jpg";
            } else {
                NBC.scroeBar.getChildByName(("bet_" + i)).skin = "";
            }
        }
    } else {
        num = num + "";
        var numArray = num.split("");
        var s = 5;

        for (var i = numArray.length - 1; i >= 0; i--) {
            if(numArray[i] == ".") {
                NBC.scroeBar.getChildByName(("bet_" + s)).skin = "digitnumber/LD_dot.jpg";
            }else if(numArray[i] == "") {
                NBC.scroeBar.getChildByName(("bet_" + s)).skin = "";
            }else {
                NBC.scroeBar.getChildByName(("bet_" + s)).skin = "digitnumber/LD_" + numArray[i] + ".jpg";
            }
            
            s -= 1;
            if(s < 0) {
                break;
            }
        }
    }
}

function showUserTotPoint(num) {
    var changeToPoint = (change_scoreFlag == 1) ? "point_" : "pointB_";
    if(num == 0) {
        //分數顯示0
        for (var i = 0; i <= 6; i++) {
            if (i == 6) {
                NBC.scoreBarUserPoint.getChildByName((changeToPoint + i)).skin = "digitnumber/LD_0.jpg";
            } else {
                NBC.scoreBarUserPoint.getChildByName((changeToPoint + i)).skin = "";
            }
        }
    }else {
        num = num + "";
        var numArray = num.split("");
        var s = 6;

        if(numArray.length < 7) {
            var max = 7 - numArray.length;
            for(var i = 0; i < max; i++) {
                numArray.unshift("");
            }
        }

        s = 6;
        for (var i = numArray.length - 1; i >= 0; i--) {
            if(numArray[i] == ".") {
                NBC.scoreBarUserPoint.getChildByName((changeToPoint + s)).skin = "digitnumber/LD_dot.jpg";
            }else if(numArray[i] == "") {
                NBC.scoreBarUserPoint.getChildByName((changeToPoint + s)).skin = "";
            }else {
                NBC.scoreBarUserPoint.getChildByName((changeToPoint + s)).skin = "digitnumber/LD_" + numArray[i] + ".jpg";
            }
            s -= 1;
            if(s < 0) {
                break;
            }
        }
    }
}


//得分時顯示分數
function showUser_Getpoint(num) {
    num = num + "";
    var numArray = num.split("");
    var s = 6;
    var changeToFront = (change_scoreFlag == 1) ? "pointB_" : "point_";
    var changeToBack = (change_scoreFlag == 1) ? "point_" : "pointB_";

    //補足位數
    if(numArray.length < 7) {
        var max = 7 - numArray.length;
        for(var i = 0; i < max; i++) {
            numArray.unshift("");
        }
    }

    s = 6;
    for (var i = numArray.length - 1; i >= 0; i--) {
        var tap = i * 400;

        if(numArray[i] == ".") {
            NBC.scoreBarUserPoint.getChildByName((changeToFront + s)).skin = "digitnumber/LD_dot.jpg";
        }else if(numArray[i] == "") {
            NBC.scoreBarUserPoint.getChildByName((changeToFront + s)).skin = "";
        }else {
            NBC.scoreBarUserPoint.getChildByName((changeToFront + s)).skin = "digitnumber/LD_" + numArray[i] + ".jpg";
        }

        //清除緩動,並將第一組定位至下方
        Laya.Tween.clearAll(NBC.scoreBarUserPoint.getChildByName((changeToFront + s)));
        NBC.scoreBarUserPoint.getChildByName((changeToFront + s)).y = 77;

        Laya.Tween.to(NBC.scoreBarUserPoint.getChildByName((changeToFront + s)), { y: 25 }, 400, Laya.Ease.linear, null, tap);
        Laya.Tween.to(NBC.scoreBarUserPoint.getChildByName((changeToBack + s)), { y: -44 }, 400, Laya.Ease.linear, null, tap);

        s -= 1;
        if(s < 0) {
            s = null;
            break;
        }
    }

    //更換旗標
    change_scoreFlag = (change_scoreFlag == 1) ? 2 : 1;
}

/**
 * 顯示得點
 * @param {*double} num 
 */
function showGetPointTot(num) {
    if(num == 0) {
        //分數顯示0
        for (var i = 0; i <= 5; i++) {
            if (i == 5) {
                NBC.scroeBar.getChildByName(("get_" + i)).skin = "digitnumber/LD_0.jpg";
            } else {
                NBC.scroeBar.getChildByName(("get_" + i)).skin = "";
            }
        }
    }else {
        num = num + "";
        var numArray = num.split("");
        var s = 5;

        if(numArray.length < 6) {
            var max = 6 - numArray.length;
            for(var i = 0; i < max; i++) {
                numArray.unshift("");
            }
        }

        s = 5;
        for (var i = numArray.length - 1; i >= 0; i--) {
            if(numArray[i] == ".") {
                NBC.scroeBar.getChildByName(("get_" + s)).skin = "digitnumber/LD_dot.jpg";
            }else if(numArray[i] == "") {
                NBC.scroeBar.getChildByName(("get_" + s)).skin = "";
            }else {
                NBC.scroeBar.getChildByName(("get_" + s)).skin = "digitnumber/LD_" + numArray[i] + ".jpg";
            }
            s -= 1;
            if(s < 0) {
                break;
            }
        }
    }
}


/**
 * 開洗分的分數欄顯示
 * @param {*string} numStr   //顯示的分數
 * @param {*int} actionNum   //1:開分, 2:洗分
 */
function showOpenThrowPoint(numStr, actionNum) {
    var showText = "";
    var color = "";
    switch(actionNum) {
        case 1:
            showText = "開   點";
            color = "#59ec21";
            break;
        case 2:
            showText = "洗   點";
            color = "#ff0400";
            break;
    }

    //分數列歸位
    NBC.OpThScroe.visible = false;
    NBC.OpThScroe.alpha = 0;
    NBC.OpThScroe.y = 615;

    //顯示分數
    showOpenThrowPoint_TotPoint(numStr, actionNum);

    //開始顯示動畫
    Laya.Tween.clearAll(NBC.OpThScroe);
    NBC.OpThScroe.visible = true;
    NBC.OpThScroe.getChildByName("scroeName").text = showText;
    NBC.OpThScroe.getChildByName("scroeName").color = color;
    Laya.Tween.to(NBC.OpThScroe, { alpha: 1 }, 900, Laya.Ease.cubicInOut, null);
    Laya.Tween.to(NBC.OpThScroe, { y: 690 }, 700, Laya.Ease.linear, null, 1500);
}

/**
 * 顯示開棄分分數列
 * 開點若超出顯示範圍則取最後幾位能顯示的位數即可,
 * 棄點的第一格皆為'-',其餘則與開點同
 * @param {*string} numStr 顯示分數
 */
function showOpenThrowPoint_TotPoint(numStr, actionNum) {
    var num = numStr + "";
    var numArray = num.split("");
    var s = 6;

    //開分
    if(actionNum == 1) {
        for (var i = 6; i >= 0; i--) {
            NBC.OpThScroe.getChildByName(("point_" + s)).skin = "";
            s -= 1;
        }
        s = 6;
        for (var i = numArray.length - 1; i >= 0; i--) {
            NBC.OpThScroe.getChildByName(("point_" + s)).skin = "digitnumber/LD_" + numArray[i] + ".jpg";
            s -= 1;
            if(s < 0) {
                break;
            }
        }
    }//End if(actionNum == 1).


    //棄分
    if(actionNum == 2) {
        var max = 0;
        if(numArray.length > 6) {
            NBC.OpThScroe.getChildByName("point_0").skin = "digitnumber/mils.jpg";
            max = 1;
        }else {
            numArray.unshift("-");
        }

        for (var i = 5; i >= 0; i--) {
            NBC.OpThScroe.getChildByName(("point_" + s)).skin = "";
            s -= 1;
        }
        s = 6;
        for (var i = numArray.length - 1; i >= 0; i--) {
            if(numArray[i] == "-") {
                NBC.OpThScroe.getChildByName(("point_" + s)).skin = "digitnumber/mils.jpg";
            }else if(numArray[i] == ".") {
                NBC.OpThScroe.getChildByName(("point_" + s)).skin = "digitnumber/LD_dot.jpg";
            }else {
                NBC.OpThScroe.getChildByName(("point_" + s)).skin = "digitnumber/LD_" + numArray[i] + ".jpg";
            }
            s -= 1;
            if(s < max) {
                break;
            }
        }
    }//End if(actionNum == 2).
}

//總點閃爍計時器
var DangurousPointTimer;
var DangurousPointTimer2;

/**
 * //押分大餘總點時總點做閃爍
 */
function DangurousPoint() {
    clearInterval(DangurousPointTimer);
    clearInterval(DangurousPointTimer2);

    DangurousPointTimer = setInterval(function(){
        NBC.scoreBarUserPoint.visible = false;
    }, 250);
    DangurousPointTimer2 = setInterval(function(){
        NBC.scoreBarUserPoint.visible = true;
    }, 500);
}

/**
 * //清除總點閃爍
 */
function ClearDangurousPoint() {
    clearInterval(DangurousPointTimer);
    clearInterval(DangurousPointTimer2);
    DangurousPointTimer = null;
    DangurousPointTimer2 = null;
    NBC.scoreBarUserPoint.visible = true;
}



//設定檔設定//////////////////////////////////////////////////////////////////////////////////////////////////////////

//依照設定檔設定
function Game_setting(ConView, Jaction) {
    //押注設定
    set_GameValue.Denomination1 = (Jaction.Denomination1 == 0) ? "Max": Jaction.Denomination1;
    set_GameValue.Denomination2 = (Jaction.Denomination2 == 0) ? "Max": Jaction.Denomination2;
    set_GameValue.Denomination3 = (Jaction.Denomination3 == 0) ? "Max": Jaction.Denomination3;
    set_GameValue.Denomination4 = (Jaction.Denomination4 == 0) ? "Max": Jaction.Denomination4;
    set_GameValue.Denomination5 = (Jaction.Denomination5 == 0) ? "Max": Jaction.Denomination5;
    set_GameValue.TieBet = Jaction.tieBet;
    set_GameValue.RemainingPointBet = Jaction.remainingPointBet;
    set_GameValue.AutoRetention = Jaction.autoRetention;
    if(nowChipPoint_point != "餘分" || nowChipPoint_Img != 6) {
        nowChipPoint_point = set_GameValue["Denomination" + nowChipPoint_Img];
    }

    //更換籌碼數字
    var chipsTot = ["chip01", "chip02", "chip03", "chip04", "chip05"];
    for (var i = 0, max = chipsTot.length; i < max; i++) {
        ConView["chips"].getChildByName(chipsTot[i]).getChildByName("chip").getChildByName("chipText").text = (set_GameValue["Denomination" + (i+1)] == 0) ? "Max": set_GameValue["Denomination" + (i+1)];    
    }

    //餘分籌碼起不起用
    if (set_GameValue.RemainingPointBet == true) {
        NBC.chips.getChildByName("chip06").visible = true;
    } else {
        NBC.chips.getChildByName("chip06").visible = false;
        NBC.chips.getChildByName("chip06").getChildByName("chip_ptr").visible = false;
        NBC.chips.getChildByName("chip06").getChildByName("chip").getChildByName("chip_light").visible = false;
        NBC.chips.getChildByName("chip06").getChildByName("chip").getChildByName("chipL").alpha = 0;
        if(nowChipPoint_Img == "6") {
            if(useChipIndexNow == true) {
                NBC.chips.getChildByName("chip01").getChildByName("chip_ptr").visible = true;
            }
            NBC.chips.getChildByName("chip01").getChildByName("chip").getChildByName("chip_light").visible = true;
            NBC.chips.getChildByName("chip01").getChildByName("chip").getChildByName("chip_light").play(0, false);
            chipBtn = "chip01";
            LiterTimer = 1;
            nowChipPoint_Img = "1";
            nowChipPoint_point = NBC.chips.getChildByName("chip01").getChildByName("chip").getChildByName("chipText").text;
        }
    }

    //定位籌碼指標
    pos_ChipIndexShow();

    //隱藏籌碼
    if(Jaction.status == "bet" || Jaction.status == "startGame") {
        needShowTotChips_now();
    }

    //押注設定2
    singleNoteMin = Jaction.singleNoteMin;
    singleNoteMax = Jaction.singleNoteMax;
    tieNoteMin = Jaction.tieNoteMin;
    tieNoteMax = Jaction.tieNoteMax;
    playerPairMin = Jaction.playerPairMin;
    playerPairMax = Jaction.playerPairMax;
    bankerPairMin = Jaction.bankerPairMin;
    bankerPairMax = Jaction.bankerPairMax;
    singleMachineMax = Jaction.singleMachineMax;
    allMax = Jaction.allMax;
    betOverInvalid = Jaction.betOverInvalid;

    set_GameValue.allPlayerBankerMax = Jaction.allPlayerBankerMax;
    set_GameValue.allTieNoteMax = Jaction.allTieNoteMax;
    set_GameValue.allPlayerPairMax = Jaction.allPlayerPairMax;
    set_GameValue.allBankerPairMax = Jaction.allBankerPairMax;

    //設定押注設定2
    NBC.leftMenu.getChildByName("player").getChildByName("singleMax").text = (singleNoteMax == 0)? "-": singleNoteMax;
    NBC.leftMenu.getChildByName("player").getChildByName("singleMin").text = (singleNoteMin == 0)? "-": singleNoteMin;
    NBC.leftMenu.getChildByName("tie").getChildByName("singleMax").text = (tieNoteMax == 0)? "-": tieNoteMax;
    NBC.leftMenu.getChildByName("tie").getChildByName("singleMin").text = (tieNoteMin == 0)? "-": tieNoteMin;
    NBC.leftMenu.getChildByName("banker").getChildByName("singleMax").text = (singleNoteMax == 0)? "-": singleNoteMax;
    NBC.leftMenu.getChildByName("banker").getChildByName("singleMin").text = (singleNoteMin == 0)? "-": singleNoteMin;
    NBC.leftMenu.getChildByName("playerPair").getChildByName("singleMax").text = (playerPairMax == 0)? "-": playerPairMax;
    NBC.leftMenu.getChildByName("playerPair").getChildByName("singleMin").text = (playerPairMin == 0)? "-": playerPairMin;
    NBC.leftMenu.getChildByName("bankerPair").getChildByName("singleMax").text = (bankerPairMax == 0)? "-": bankerPairMax;
    NBC.leftMenu.getChildByName("bankerPair").getChildByName("singleMin").text = (bankerPairMin == 0)? "-": bankerPairMin;
    
    //載入背景音效檔
    if (Jaction.bgm == true) {
        set_GameValue.BGMVoice = Jaction.bgmV / 10;
        SoundManager.setSoundVolume(set_GameValue.BGMVoice, "res/sound/Music1.mp3");
    } else {
        SoundManager.setSoundVolume(0, "res/sound/Music1.mp3");
    }

    set_GameValue.UseReciprocal = Jaction.UseReciprocal;
    set_GameValue.reciprocalVoice = Jaction.Reciprocal / 10;
    set_GameValue.UseChips = Jaction.UseChips;
    set_GameValue.chipsVoice = Jaction.Chips / 10;
    set_GameValue.UseVoice = Jaction.UseVoice;
    set_GameValue.Voice = Jaction.Voice / 10;

    //單機設定
    set_GameValue.RetentionBtn = Jaction.RetentionBtn;
    set_GameValue.RetiredBtn = Jaction.RetiredBtn;
    set_GameValue.DayCardAndStopCard = Jaction.DayCardAndStopCard;
    set_GameValue.BigWayShowPair = Jaction.BigWayShowPair;
    set_GameValue.UseChipsIndex = Jaction.UseChipsIndex;
    set_GameValue.UseChipsDrop = Jaction.UseChipsDrop;
    luDan[0] = Jaction.BigWay;
    luDan[1] = Jaction.ThreeWay;
    luDan[2] = Jaction.BigWayNine;
    luDan[3] = Jaction.CockroachWay;
    luDan[4] = Jaction.BigCockroachWay;
    set_GameValue.LoginBtn = Jaction.LoginBtn;
    set_GameValue.LogoutBtn = Jaction.LogoutBtn;
    set_GameValue.BeforeRecord = Jaction.BeforeRecord;

    if(Jaction.status == "bet" && setting_login.nowLogin != "") {
        NBC.Retirement.visible = set_GameValue.RetiredBtn;
    }else {
        NBC.Retirement.visible = false;
    }

    if(luDan[0] == true || luDan[1] == true || luDan[2] == true || luDan[3] == true || luDan[4] == true) {
        NBC.openCard.mouseEnabled = true;
    }

    if(set_GameValue.RecordLoadNum == 0) {
        set_GameValue.RecordLoadNum = Jaction.RecordLoadNum;
    }else {
        //由少變多
        if(set_GameValue.RecordLoadNum < Jaction.RecordLoadNum) {
            set_GameValue.RecordLoadNum = Jaction.RecordLoadNum;
        }
    }

    if(set_GameValue.LoginKeepsNum == 0) {
        set_GameValue.LoginKeepsNum = Jaction.LoginKeepsNum;
    }else {
        //由少變多
        if(set_GameValue.LoginKeepsNum < Jaction.LoginKeepsNum) {
            set_GameValue.LoginKeepsNum = Jaction.LoginKeepsNum;
        }
    }
    
    
    NBC.right07.getChildByName("login").visible = set_GameValue.LoginBtn;
    NBC.right07.getChildByName("logout").visible = set_GameValue.LogoutBtn;
    if(NBC.right07.getChildByName("login").visible == false && NBC.right07.getChildByName("logout").visible == true) {
        //前方登入按鈕若不顯示則向前遞補
        NBC.right07.getChildByName("logout").x = 253;
    }else {
        NBC.right07.getChildByName("logout").x = 372;
    }
    

    //鍵盤按鍵
    set_GameValue.keyM = Jaction.KeyM;
    set_GameValue.keyJ = Jaction.KeyJ;
    set_GameValue.keyQ = Jaction.KeyQ;
    set_GameValue.keyW = Jaction.KeyW;

    //功能設定
    if(Jaction.TableNumber == "") {
        NBC.BC2Text.fontSize = 65;
        NBC.BC2Text.font = "wt064";
        NBC.BC2Text.alpha = 0.4;
    }else {
        NBC.BC2Text.fontSize = 60;
        NBC.BC2Text.font = "DFT_C8U";
        NBC.BC2Text.alpha = 1;
    }
    NBC.BC2Text.text = (Jaction.TableNumber == "")? "BACCARAT": Jaction.TableNumber;
    NBC.PreBCText.text = (Jaction.TableNumber == "")? "": Jaction.TableNumber;
    set_GameValue.BetInfo = Jaction.BetInfo;
    change_BGColorBySetting(Jaction.BGColor);
    change_betInfoText(set_GameValue.BetInfo);

    //設定開出場次
    game_round = Jaction.openRound;
}

//功能設定//////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 顯示可出現的籌碼
 */
function needShowTotChips() {
    var chipArray = [];
    if(set_GameValue.Denomination1 != -1) {
        chipArray.push("chip01");
    }
    if(set_GameValue.Denomination2 != -1) {
        chipArray.push("chip02");
    }
    if(set_GameValue.Denomination3 != -1) {
        chipArray.push("chip03");
    }
    if(set_GameValue.Denomination4 != -1) {
        chipArray.push("chip04");
    }
    if(set_GameValue.Denomination5 != -1) {
        chipArray.push("chip05");
    }
    return chipArray;
}

/**
 * 立即更改可出現的籌碼
 * status -> 目前狀態
 */
function needShowTotChips_now(status) {
    //籌碼位置及指標
    //先將所有籌碼及指標收起來
    var chipsTot2 = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
    for (var i = 0, max = chipsTot2.length; i < max; i++) {
        var position = i * 10;
        NBC.chips.getChildByName(chipsTot2[i]).x = -228 + position;
        NBC.chips.getChildByName(chipsTot2[i]).getChildByName("chip_ptr").visible = false;
        NBC.chips.getChildByName(chipsTot2[i]).getChildByName("chip").getChildByName("chip_light").visible = false;
        NBC.chips.getChildByName(chipsTot2[i]).getChildByName("chip").getChildByName("chipL").alpha = 0;
    }

    //確認餘分未被隱藏
    var chipsTot = needShowTotChips();
    if(set_GameValue.RemainingPointBet == true) {
        chipsTot.push("chip06");
    }

    //排上籌碼
    if(chipsTot.length > 0) {
        for (var i = chipsTot.length-1; i >= 0; i--) {     
            NBC.chips.getChildByName(chipsTot[i]).x = 28 + (i * 60); 
        }

        if(nowUseChipIndex_hasHidden(chipsTot) == true) {
            //將指標放在第一個
            if(useChipIndexNow == true) {
                NBC.chips.getChildByName(chipsTot[0]).getChildByName("chip_ptr").visible = true;
            }
            NBC.chips.getChildByName(chipsTot[0]).getChildByName("chip").getChildByName("chip_light").visible = true;
            NBC.chips.getChildByName(chipsTot[0]).getChildByName("chip").getChildByName("chip_light").play(0, false);
            chipBtn = chipsTot[0];
            LiterTimer = 1;
            var useImg = chipsTot[0].split("");
            nowChipPoint_Img = useImg[useImg.length-1];
            nowChipPoint_point = NBC.chips.getChildByName(chipsTot[0]).getChildByName("chip").getChildByName("chipText").text;
        }else {
            //將指標移回來
            var textChip = "chip0" + nowChipPoint_Img;
            if(useChipIndexNow == true) {
                NBC.chips.getChildByName(textChip).getChildByName("chip_ptr").visible = true;
            }
            NBC.chips.getChildByName(textChip).getChildByName("chip").getChildByName("chip_light").visible = true;
            NBC.chips.getChildByName(textChip).getChildByName("chip").getChildByName("chip_light").play(0, false);
            chipBtn = textChip;
            LiterTimer = 1;
        }
        
    }
}

/**
 * 定位籌碼指標
 */
function pos_ChipIndexShow() {
    //確認餘分未被隱藏
    var chipsTot = needShowTotChips();
    if(set_GameValue.RemainingPointBet == true) {
        chipsTot.push("chip06");
    }

    if(chipsTot.length > 0) {
        //看目前使用的籌碼指標是否被隱藏
        var hiddenChip = nowUseChipIndex_hasHidden(chipsTot);
        var textChip = "chip0" + nowChipPoint_Img;

        if(hiddenChip == true) {
            //將被隱藏的指標及動畫收起
            NBC.chips.getChildByName(textChip).getChildByName("chip_ptr").visible = false;
            NBC.chips.getChildByName(textChip).getChildByName("chip").getChildByName("chip_light").visible = false;
            NBC.chips.getChildByName(textChip).getChildByName("chip").getChildByName("chipL").alpha = 0;

            //將指標放在第一個
            if(useChipIndexNow == true) {
                NBC.chips.getChildByName(chipsTot[0]).getChildByName("chip_ptr").visible = true;
            }
            NBC.chips.getChildByName(chipsTot[0]).getChildByName("chip").getChildByName("chip_light").visible = true;
            NBC.chips.getChildByName(chipsTot[0]).getChildByName("chip").getChildByName("chip_light").play(0, false);
            chipBtn = chipsTot[0];
            LiterTimer = 1;
            nowChipPoint_Img = chipsTot[0].charAt(chipsTot[0].length - 1);
            nowChipPoint_point = NBC.chips.getChildByName(chipsTot[0]).getChildByName("chip").getChildByName("chipText").text;
        }
    }
}

/**
 * 看目前使用的籌碼指標是否被隱藏
 * @param {*array} chipsTot 目前使用的籌碼清單
 */
function nowUseChipIndex_hasHidden(chipsTot) {
    var hiddenChip = true;
    var textChip = "chip0" + nowChipPoint_Img;
    for(var i = 0, max = chipsTot.length; i < max; i++) {
        if(textChip == chipsTot[i]) {
            hiddenChip = false;
            break;
        }
    }
    return hiddenChip;
}


function change_BGColorBySetting(changeNum) {
    //綠, 藍, 紅, 咖啡色, 灰, 紫, 淺綠, 淺藍
    NBC.backgroundImg.skin = "image/BC_table" + changeNum + ".jpg";
    NBC.allBetBtn.getChildByName("player_btn").skin = "image/idle_border" + changeNum + ".png";
    NBC.allBetBtn.getChildByName("playerPair_btn").skin = "image/sum" + changeNum + ".png";
    NBC.allBetBtn.getChildByName("tie_btn").skin = "image/sum" + changeNum + ".png";
    NBC.allBetBtn.getChildByName("bankerPair_btn").skin = "image/sum" + changeNum + ".png";
    NBC.allBetBtn.getChildByName("banker_btn").skin = "image/village_border" + changeNum + ".png";
    NBC.beforeRecord.getChildByName("RecordMenu").skin = "image/Record_" + changeNum + ".jpg";
    NBC.preRecordBPair_show.skin = "image/recordPair" + changeNum + ".jpg";
    NBC.preRecordPPair_show.skin = "image/recordPair" + changeNum + ".jpg";
}

function change_betInfoText(num) {
    //全場限額, 全場押注分數, 全場限額(不倒扣), 無
    NBC.leftMenu.getChildByName("hiddenPair").visible = false;

    switch(num) {
        case 0:
            var maxP = set_GameValue.allPlayerBankerMax - betInfoTotPoint.playerAllBet;
            var masT = set_GameValue.allTieNoteMax - betInfoTotPoint.tieAllBet;
            var maxB = set_GameValue.allPlayerBankerMax - betInfoTotPoint.bankerAllBet;
            var maxPpair = set_GameValue.allPlayerPairMax - betInfoTotPoint.playPairAllBet;
            var maxBpair = set_GameValue.allBankerPairMax - betInfoTotPoint.bankPairAllBet;

            if(set_GameValue.allPlayerBankerMax == 0) {
                maxP = "-";
                maxB = "-";
            }else {
                maxP = (maxP > 0) ? maxP : "-";
                maxB = (maxB > 0) ? maxB : "-";
            }
            if(set_GameValue.allTieNoteMax == 0) {
                masT = "-";
            }else {
                masT = (masT > 0) ? masT : "-";
            }
            if(set_GameValue.allPlayerPairMax == 0) {
                maxPpair = "-";
            }else {
                maxPpair = (maxPpair > 0) ? maxPpair : "-";
            }
            if(set_GameValue.allBankerPairMax == 0) {
                maxBpair = "-";
            }else {
                maxBpair = (maxBpair > 0) ? maxBpair : "-";
            }

            NBC.leftMenu.getChildByName("all_BetInfo").text = "全場限額";
            NBC.leftMenu.getChildByName("player").getChildByName("allPoint").text = maxP;
            NBC.leftMenu.getChildByName("tie").getChildByName("allPoint").text = masT;
            NBC.leftMenu.getChildByName("banker").getChildByName("allPoint").text = maxB;
            NBC.leftMenu.getChildByName("playerPair").getChildByName("allPoint").text = maxPpair;
            NBC.leftMenu.getChildByName("bankerPair").getChildByName("allPoint").text = maxBpair;
            break;
        case 1:
            NBC.leftMenu.getChildByName("all_BetInfo").text = "全場押分";
            NBC.leftMenu.getChildByName("player").getChildByName("allPoint").text = betInfoTotPoint.playerAllBet;
            NBC.leftMenu.getChildByName("tie").getChildByName("allPoint").text = betInfoTotPoint.tieAllBet;
            NBC.leftMenu.getChildByName("banker").getChildByName("allPoint").text = betInfoTotPoint.bankerAllBet;
            NBC.leftMenu.getChildByName("playerPair").getChildByName("allPoint").text = betInfoTotPoint.playPairAllBet;
            NBC.leftMenu.getChildByName("bankerPair").getChildByName("allPoint").text = betInfoTotPoint.bankPairAllBet;
            break;
        case 2:
            NBC.leftMenu.getChildByName("all_BetInfo").text = "全場限額";
            NBC.leftMenu.getChildByName("player").getChildByName("allPoint").text = (set_GameValue.allPlayerBankerMax == 0) ? "-" : set_GameValue.allPlayerBankerMax;
            NBC.leftMenu.getChildByName("tie").getChildByName("allPoint").text = (set_GameValue.allTieNoteMax == 0) ? "-" : set_GameValue.allTieNoteMax;
            NBC.leftMenu.getChildByName("banker").getChildByName("allPoint").text = (set_GameValue.allPlayerBankerMax == 0)? "-" : set_GameValue.allPlayerBankerMax;
            NBC.leftMenu.getChildByName("playerPair").getChildByName("allPoint").text = (set_GameValue.allPlayerPairMax == 0)? "-" : set_GameValue.allPlayerPairMax;
            NBC.leftMenu.getChildByName("bankerPair").getChildByName("allPoint").text = (set_GameValue.allBankerPairMax == 0)? "-" : set_GameValue.allBankerPairMax;
            break;
        case 3:
            NBC.leftMenu.getChildByName("all_BetInfo").text = "全場限額";
            NBC.leftMenu.getChildByName("hiddenPair").visible = true;
            break;
    }
    
}

/**
 * 更新全場限額
 * @param {*object} action 全場限額資訊
 */
function allBetTotPoint_ToUpdata(action) {
    betInfoTotPoint.playerAllBet = action.playerAllBet;
    betInfoTotPoint.tieAllBet = action.tieAllBet;
    betInfoTotPoint.bankerAllBet = action.bankerAllBet;
    betInfoTotPoint.playPairAllBet = action.playPairAllBet;
    betInfoTotPoint.bankPairAllBet = action.bankPairAllBet;

    if(set_GameValue.BetInfo == 1) {
        //全場押分
        NBC.leftMenu.getChildByName("player").getChildByName("allPoint").text = betInfoTotPoint.playerAllBet;
        NBC.leftMenu.getChildByName("tie").getChildByName("allPoint").text = betInfoTotPoint.tieAllBet;
        NBC.leftMenu.getChildByName("banker").getChildByName("allPoint").text = betInfoTotPoint.bankerAllBet;
        NBC.leftMenu.getChildByName("playerPair").getChildByName("allPoint").text = betInfoTotPoint.playPairAllBet;
        NBC.leftMenu.getChildByName("bankerPair").getChildByName("allPoint").text = betInfoTotPoint.bankPairAllBet;
    }
    if(set_GameValue.BetInfo == 0) {
        //全場限額
        var maxP = set_GameValue.allPlayerBankerMax - betInfoTotPoint.playerAllBet;
        var masT = set_GameValue.allTieNoteMax - betInfoTotPoint.tieAllBet;
        var maxB = set_GameValue.allPlayerBankerMax - betInfoTotPoint.bankerAllBet;
        var maxPpair = set_GameValue.allPlayerPairMax - betInfoTotPoint.playPairAllBet;
        var maxBpair = set_GameValue.allBankerPairMax - betInfoTotPoint.bankPairAllBet;

        if(set_GameValue.allPlayerBankerMax == 0) {
            maxP = "-";
            maxB = "-";
        }else {
            maxP = (maxP > 0) ? maxP : "-";
            maxB = (maxB > 0) ? maxB : "-";
        }
        if(set_GameValue.allTieNoteMax == 0) {
            masT = "-";
        }else {
            masT = (masT > 0) ? masT : "-";
        }
        if(set_GameValue.allPlayerPairMax == 0) {
            maxPpair = "-";
        }else {
            maxPpair = (maxPpair > 0) ? maxPpair : "-";
        }
        if(set_GameValue.allBankerPairMax == 0) {
            maxBpair = "-";
        }else {
            maxBpair = (maxBpair > 0) ? maxBpair : "-";
        }

        NBC.leftMenu.getChildByName("player").getChildByName("allPoint").text = maxP;
        NBC.leftMenu.getChildByName("tie").getChildByName("allPoint").text = masT;
        NBC.leftMenu.getChildByName("banker").getChildByName("allPoint").text = maxB;
        NBC.leftMenu.getChildByName("playerPair").getChildByName("allPoint").text = maxPpair;
        NBC.leftMenu.getChildByName("bankerPair").getChildByName("allPoint").text = maxBpair;
    }
}

//切牌//////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 切牌文字上的點點動畫
 */
function run_CutCardDot() {
    var dots = 0;
    clearInterval(cutCard_dotTimer);
    cutCard_dotTimer = setInterval(function () {
        var str = "切牌中";
        for(var i = 0, max = dots; i < max; i+=1) {
            str += ".";
        }
        dots += 1;
        dots = (dots >= 4) ? 0 : dots;
        NBC.cutCardTitle.text = str;
    }, 400);
}


//右上訊息//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function msgTextToShow() {
    //y為0時,換行以y-20為單位
    //最後減出的總和轉整數不能超過NBC.Msg._textHeight,超過則y歸0
    //先判斷文字量是否超過,需要換行
    //每2秒換一次訊息
    clearInterval(msgTextShine);
    msgTextShine = setInterval(function() {
        Laya.Tween.clearAll(NBC.Msg);
        var msgLength = NBC.Msg._lines.length;
        if(msgLength > 1) {
            lineY = ((NBC.Msg.y - 18) <= (NBC.Msg._lines.length * -18)) ? 0 : (NBC.Msg.y - 18);
        }else {
            //僅做閃爍
            lineY = 0;
        }
        //消失
        Laya.Tween.to(NBC.Msg, { alpha: 0.6}, 1000, Laya.Ease.quartInOut);
        //換行
        Laya.Tween.to(NBC.Msg, { alpha: 1, update: new Laya.Handler(this, changeMsgText, [lineY])}, 1000, Laya.Ease.quartInOut, null, 700);
    }, 4000);

}

//換行
function changeMsgText(lineY) {
    NBC.Msg.y = lineY;
}


//換算牌的點數////////////////////////////////////////////////////////////////////////////////////////////////////////

function changeCard_toPoint(point) {
    //1.14.27.40 = 1點
    //2.15.28.41 = 2點
    //3.16.29.42 = 3點
    //4.17.30.43 = 4點
    //5.18.31.44 = 5點
    //6.19.32.45 = 6點
    //7.20.33.46 = 7點
    //8.21.34.47 = 8點
    //9.22.35.48 = 9點
    //10.11.12.13 = 0點
    //23.24.25.26 = 0點
    //36.37.38.39 = 0點
    //49.50.51.52 = 0點

    if (point == 1 || point == 14 || point == 27 || point == 40)
    {
        return 1;
    }
    if (point == 2 || point == 15 || point == 28 || point == 41)
    {
        return 2;
    }
    if (point == 3 || point == 16 || point == 29 || point == 42)
    {
        return 3;
    }
    if (point == 4 || point == 17 || point == 30 || point == 43)
    {
        return 4;
    }
    if (point == 5 || point == 18 || point == 31 || point == 44)
    {
        return 5;
    }
    if (point == 6 || point == 19 || point == 32 || point == 45)
    {
        return 6;
    }
    if (point == 7 || point == 20 || point == 33 || point == 46)
    {
        return 7;
    }
    if (point == 8 || point == 21 || point == 34 || point == 47)
    {
        return 8;
    }
    if (point == 9 || point == 22 || point == 35 || point == 48)
    {
        return 9;
    }
    if (point == 10 || point == 11 || point == 12 || point == 13 || point == 23 || point == 24 || point == 25 || point == 26 ||
        point == 36 || point == 37 || point == 38 || point == 39 || point == 49 || point == 50 || point == 51 || point == 52)
    {
        return 0;
    }

    return 0;
}

//歷程記錄////////////////////////////////////////////////////////////////////////////////////////////////////
function getCardInfo_toFunction(cardInfo, cardBack) {
    for(var i = 0, max = cardInfo.length; i < max; i++) {
        if(cardInfo[i] != 0) {
            switch(i) {
                case 0: 
                    getNowCardInfo_toTable(cardInfo[i], "PC1", cardBack);
                    break;
                case 1: 
                    getNowCardInfo_toTable(cardInfo[i], "BC1", cardBack);
                    break;
                case 2: 
                    getNowCardInfo_toTable(cardInfo[i], "PC2", cardBack);
                    break;
                case 3: 
                    getNowCardInfo_toTable(cardInfo[i], "BC2", cardBack);
                    break;
                case 4: 
                    getNowCardInfo_toTable(cardInfo[i], "PC3", cardBack);
                    break;
                case 5: 
                    getNowCardInfo_toTable(cardInfo[i], "BC3", cardBack);
                    break;
                default:
                    break;
            }
        }
    }
}
    
function getNowCardInfo_toTable(cardNum, cardName, card_back) {
    //0未發, -1發牌背, >0為發出的牌
    var card_x = 0;
    var card_y = 0;

    switch(cardName) {
        case "PC1":
            card_x = 18;
            card_y = 236;
            break;
        case "PC2":
            card_x = 171;
            card_y = 236;
            break;
        case "PC3":
            card_x = 93;
            card_y = 289;
            break;
        case "BC1":
            card_x = 705;
            card_y = 236;
            break;
        case "BC2":
            card_x = 861;
            card_y = 236;
            break;
        case "BC3":
            card_x = 784;
            card_y = 289;
            break;
    }

    if(cardNum > 0) {
        //發牌
        NBC[cardName].getChildByName("CardBack").scaleX = 0;
        NBC[cardName].getChildByName("CardImg").skin = "puker/puker_front/puker" + cardNum + ".png";
        NBC[cardName].getChildByName("CardImg").scaleX = 1;
        NBC[cardName].getChildByName("CardImg").scaleY = 1;
        NBC[cardName].x = card_x;
        NBC[cardName].y = card_y;
        if(NBC[cardName].filters == undefined ) {
            var glowFilter = new Laya.GlowFilter("#333333", 4, 4, 4);
            NBC[cardName].filters = [glowFilter];
        }
    }else if(cardNum == -1){
        //發牌背
        NBC[cardName].getChildByName("CardBack").skin = "puker/puker_back/" + card_back + ".png";
        NBC[cardName].getChildByName("CardBack").scaleX = 1;
        NBC[cardName].getChildByName("CardBack").scaleY = 1;
        NBC[cardName].getChildByName("CardImg").scaleX = 0;
        NBC[cardName].x = card_x;
        NBC[cardName].y = card_y;
        NBC[cardName].getChildByName("CardImg").scaleX = 0;    
        if(NBC[cardName].filters == undefined ) {
            var glowFilter = new Laya.GlowFilter("#333333", 4, 4, 4);
            NBC[cardName].filters = [glowFilter];
        }
    }

}

//重連機制/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//與伺服器連結出錯,重連機制
function showErrorHandlerMsg() {
    NBC.ErrorHandleMsg.visible = true;
    //綁定重連按鈕事件
    NBC.goConnect.on("click", this, function() {
        NBC.connectErrorTextShow.color = "#ec1b17";
        NBC.connectErrorTextShow.visible = true;
        NBC.connectErrorTextShow.text = "重新連線...";
        // NBC.socket.connectByUrl("ws://172.16.8.76:8384");
        // NBC.socket.connectByUrl("ws://172.16.8.178:8384");
        this.socket.connectByUrl("ws://localhost:8384");
        NBC.ErrorHandleMsg.visible = false;
        SocketCloseError = 0;
    });
}

//如果使用者未登出而再次連上
function ErrorHandleByUserLogining() {
    //再次登入
    var result = {
        action: "login",
        account: setting_login.nowLogin,
        errorExit: true
    };
    NBC.socket.send(JSON.stringify(result));
}


//歷程遊戲訊息畫面//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 遊戲暫停中
 */
function showGameIsStop() {
    Laya.Tween.clearAll(NBC.allMsg_showing.getChildByName("PBonlyOne_msg"));
    NBC.allMsg_showing.getChildByName("PBonlyOne_msg").getChildByName("showText").text = "遊戲暫停";
    Laya.Tween.to(NBC.allMsg_showing.getChildByName("PBonlyOne_msg"), { alpha: 1 }, 800, Laya.Ease.cubicInOut, null);
}

/**
 * 接續目前畫面收掉籌碼
 */
function receiveChip_ToLoseConnect() {
    if(NBC.chips.getChildByName("chip01").x != -228) {
        //清除押注按扭動畫
        clearInterval(bet_ShineTimer);
        DroopChipsMouseOffAll();
        betMouseOffAll();

        var chipsTot = ["chip01", "chip02", "chip03", "chip04", "chip05", "chip06"];
        for (var i = 0, max = chipsTot.length; i < max; i++) {
            var position = i * 10;
            NBC.chips.getChildByName(chipsTot[i]).x = -228 + position;
        }

        //隱藏續退押按鈕
        NBC.Retirement.visible = false;
        NBC.continuBet.visible = false;
    }
}

/**
 * 清空所有籌碼及押注分數
 */
function clearAllBetChip() {
    showBetPoint(0);
    var clearList = ["player_btn", "playerPair_btn", "tie_btn", "bankerPair_btn", "banker_btn"];
    for (var key in clearList) {
        NBC.allBetBtn.getChildByName(clearList[key]).getChildByName("sum").text = "";
        NBC[clearList[key] + "Betchip"].graphics.clear();
        NBC[clearList[key] + "Betchip"].getChildByName("chipText").text = "";
        NBC[clearList[key] + "Dropchip"].graphics.clear();
        NBC[clearList[key] + "Dropchip"].getChildByName("chipText").text = "";
        NBC[clearList[key] + "Dropchip"].getChildByName("sum").text = "";
    }

    Bet_playerList = [[], []];
    Bet_playerPairList = [[], []];
    Bet_tieList = [[], []];
    Bet_bankerPairList = [[], []];
    Bet_bankerList = [[], []];
}


/**
 * 接續目前畫面收掉牌並歸位
 */
function receiveCard_ToLoseConnect() {
    if(NBC.Ppoint.getChildByName("TotPoint").scaleX != 0) {
        //隱藏點數,重置天.停牌
        NBC.Ppoint.getChildByName("TotPoint").scaleX = 0;
        NBC.Bpoint.getChildByName("TotPoint").scaleX = 0;
        NBC.PNatural.getChildByName("NaturalStand").skin = "";
        NBC.PNatural.pos(8, -404);
        NBC.BNatural.getChildByName("NaturalStand").skin = "";
        NBC.BNatural.pos(708, -404);

        //收牌
        var receiveSort = ["PC1", "PC2", "PC3", "BC1", "BC2", "BC3"];
        for (var i = 0, max = receiveSort.length; i < max; i++) {
            NBC[receiveSort[i]].x = 400;
            NBC[receiveSort[i]].y = -477;
        }

        //清空得分的籌碼
        clearChipGet_DrawList();
        user_betPoint.nowBetTot = 0;
        NBC.Ppoint.getChildByName("TotPoint").text = "";
        NBC.Bpoint.getChildByName("TotPoint").text = "";

        //將輸家的牌變回原來的亮度
        makeCardLightToOrginAll(); 

        //退押
        Psum = 0;
        Bsum = 0;
        clearInterval(bet_ShineTimer);
        RetireClick();
    }
}

/**
 * 收掉切牌畫面
 */
function receiveCutCard_ToLoseConnect() {
    if(NBC.CutCard.visible == true) {
        clearInterval(cutCard_dotTimer);
        NBC.CutCard.visible = false;
    }
}


/**
 * 注銷所有的亮光
 */
function resetAllWinnerLight() {
    clearInterval(resetAllWinnerLight);
    clearInterval(betPair_ShineTimmer);
    clearInterval(betPair_ShineTimmer2);
    
    var reset = ["player_btn", "banker_btn", "tie_btn", "bankerPair_btn", "playerPair_btn"];
    for(var i = 0, max = reset.length; i < max; i++) {
        Laya.Tween.clearAll(NBC.allBetBtn.getChildByName(reset[i]).getChildByName("light"));
        NBC.allBetBtn.getChildByName(reset[i]).getChildByName("light").alpha = 0;
    }  
}


/**
 * show天停牌
 * @param {*Json} Jaction 此場遊戲訊息
 */
function receiveShow_NSstand(Jaction) {
    var B_twoSum = changeCard_toPoint(Jaction.BC1) + changeCard_toPoint(Jaction.BC2);
    B_twoSum = (B_twoSum >= 10) ? B_twoSum % 10 : B_twoSum;
    var P_twoSum = changeCard_toPoint(Jaction.PC1) + changeCard_toPoint(Jaction.PC2);
    P_twoSum = (P_twoSum >= 10) ? P_twoSum % 10 : P_twoSum;
    var PC3_point = changeCard_toPoint(Jaction.PC3);

    if(set_GameValue.DayCardAndStopCard == true) {
        if(P_twoSum >= 6 && P_twoSum <= 9) {
            if(Jaction.playerSum == 8 || Jaction.playerSum == 9) {
                //天牌
                NBC.PNatural.getChildByName("NaturalStand").skin = "image/NATURAL_C.PNG";
                NBC.PNatural.y = 290;
            }else if(P_twoSum == 6 || P_twoSum == 7) {
                //停牌
                NBC.PNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
                NBC.PNatural.y = 290;
            }
        }
        if(B_twoSum == 8 || B_twoSum == 9) {
            //天牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/NATURAL_C.PNG";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 3 && PC3_point == 8) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 4 && (PC3_point == 8 || PC3_point == 9 || PC3_point == 0 || PC3_point == 1)) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 5 && !(PC3_point >= 4 && PC3_point <= 7)) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 6 && !(PC3_point == 6 || PC3_point == 7)) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 7) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }
    }
        
}

/**
 * 發牌時顯示天停牌
 * @param {*array} CardInfo 所有牌的歷程資訊
 */
function showLicensing_CardStand(CardInfo) {
    //"CardInfo":[14,21,51,2,1,15]
    if(set_GameValue.DayCardAndStopCard == true) {
        var B_twoSum = changeCard_toPoint(CardInfo[1]) + changeCard_toPoint(CardInfo[3])
        var P_twoSum = changeCard_toPoint(CardInfo[0]) + changeCard_toPoint(CardInfo[2])
        var PC3_point = (CardInfo[4] > 0)? changeCard_toPoint(CardInfo[4]) : null;

        if(P_twoSum >= 6 && P_twoSum <= 9) {
            if(P_twoSum == 8 || P_twoSum == 9) {
                //天牌
                NBC.PNatural.getChildByName("NaturalStand").skin = "image/NATURAL_C.PNG";
                NBC.PNatural.y = 290;
            }else if(P_twoSum == 6 || P_twoSum == 7) {
                //停牌
                NBC.PNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
                NBC.PNatural.y = 290;
            }
        }
        if(B_twoSum == 8 || B_twoSum == 9) {
            //天牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/NATURAL_C.PNG";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 3 && PC3_point == 8) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 4 && (PC3_point == 8 || PC3_point == 9 || PC3_point == 0 || PC3_point == 1)) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 5 && !(PC3_point >= 4 && PC3_point <= 7)) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 6 && !(PC3_point == 6 || PC3_point == 7)) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }else if(B_twoSum == 7) {
            //停牌
            NBC.BNatural.getChildByName("NaturalStand").skin = "image/STAND_C.png";
            NBC.BNatural.y = 290;
        }
    }//end main If.
}


/**
 * 還原押注畫面
 * @param {*object} Jaction Json物件
 */
function resetBet_ToLoseConnect(Jaction) {
    var showBet = ["player_btn", "playerPair_btn", "tie_btn", "bankerPair_btn", "banker_btn"];
    
    for(var i = 0, max = showBet.length; i < max; i++) {
        var btn = showBet[i];
        var point = takeResetBetPoint_ToLoseConnect(showBet[i], Jaction);
        
        clearChipDrawList(btn);
        resetBetChipList(btn, point);
    
        var name = btn + "Betchip";
        var dropName = btn + "Dropchip";
        var drawList = getBet_drawList(btn);
        var ActionBetPoint = (point != 0) ? point : "";
        NBC.allBetBtn.getChildByName(btn).getChildByName("sum").text = ActionBetPoint;
        NBC[dropName].getChildByName("sum").text = ActionBetPoint;      
        showBetPoint(Jaction.totPoint);
        user_betPoint.nowBetTot = Jaction.totPoint;

        if(drawList[0].length == 0) {
            continue;
        }

        for (var j = 0, maxJ = drawList[0].length; j < maxJ; j++) {           
            NBC[name].graphics.drawTexture(Laya.loader.getRes("chip/chip" + drawList[0][j] + ".png"), 0, j * (-3) - 3);
            NBC[name].getChildByName("chipText").text = (drawList[0][j] == 6) ? "" : drawList[1][j];
            NBC[name].getChildByName("chipText").y = j * (-3) + 22.5;

            NBC[dropName].graphics.drawTexture(Laya.loader.getRes("chip/chip" + drawList[0][j] + ".png"), 0, j * (-3) - 3);
            NBC[dropName].getChildByName("chipText").text = (drawList[0][j] == 6) ? "" : drawList[1][j];
            NBC[dropName].getChildByName("chipText").y = j * (-3) + 22.5;
        }
    }

}

/**
 * 取得Jaction的分數
 * @param {*string} betName 押注區域
 * @param {*object} Jaction Json物件
 */
function takeResetBetPoint_ToLoseConnect(betName, Jaction) {
    switch(betName) {
        case "player_btn":
            return Jaction.player_btn;
        case "playerPair_btn":
            return Jaction.playerPair_btn;
        case "tie_btn":
            return Jaction.tie_btn;
        case "bankerPair_btn":
            return Jaction.bankerPair_btn;
        case "banker_btn":
            return Jaction.banker_btn;
    }

}


//判斷上一場有沒有押注,以便顯示續押按鈕
function ShouldShowContinuBet() {
    //取出上一場
    var preFR = (NBC.R06ShowRecords.getChildByName("Rfield4").text).split("-");
    var preF = preFR[0];
    var preR = preFR[1];
    var tot = user_betPoint.haveBet.length;
    var have_Bet = false;

    if(user_betPoint.haveBet.length > 0) {
        if(preR == user_betPoint.haveBet[tot-1].round && preF == user_betPoint.haveBet[tot-1].field) {
            have_Bet = true;
        }
    }

    return have_Bet;
}



