using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Fleck;
using System.IO;
using System.Threading;
using Newtonsoft.Json;
using MySql.Data.MySqlClient;
using Newtonsoft.Json.Linq;

namespace GameServer
{
    public partial class Form1 : Form
    {
        //餘分可押其他注
        //若最低押分為100,使用者分數為110
        //ex:設押注押"和", 餘分可押其他注== true; (最後一把)
        //則押下時會先押100,剩下的餘分可押在"和"以外的押注區上 (需比對此押注區的最低押點)
        //若餘分可押其他注== false;
        //則押下時會先押100,剩下的餘分只能押在"和"上


        //設定的變數
        List<int> puker = new List<int>(); //這場用的牌組
        int Allpuker = 416;                //牌的張數(預設8副牌)
        bool NewGameRound = true;          //新的一場的第一局
        int CardGapTime = 4000;            //發牌的間隔時間
        int BetTimes = 0;                  //押注時間
        int Psum = 0;                      //閒家總分
        int Bsum = 0;                      //莊家總分
        public string status = "";         //遊戲狀態
        string status2 = "";               //結束遊戲
        bool gameStop = false;             //遊戲暫停
        bool gameEnd = false;              //遊戲結束
        int game_field = 1;                //遊戲場次
        int game_round = 1;                //遊戲局數
        string game_msg = "";              //遊戲訊息
        string game_cardBack = "back_01";  //牌背
        int RoundCard = 0;                 //此場所發的牌數
        public static Form1 Self;
        int BetTime = 0;
        private System.Timers.Timer timer; //存活確認計時器
        private System.Timers.Timer UseTime;//啟動使用時間
        System.Diagnostics.Stopwatch sw = new System.Diagnostics.Stopwatch();
        int totCut = 0;                    //總共切幾張牌
        int nowCutCard = 0;                //現在切的張數
        object serverUserView_Locker = new object();  //登入清單物件鎖
        bool nowGameShowPairBet = true;     //判斷歷程時需不需將對子押注隱藏
        bool nowGameChipIndex = true;       //判斷歷程時需不需將籌碼指標隱藏
        bool nowGameBigWayShowP = true;       //判斷歷程時需不需將大路顯示對子隱藏
        private delegate void InvokeHandler();


        string dbHost = "127.0.0.1"; //資料庫位址
        string dbUser = "root";
        string dbPass = "123456";
        //string dbPass = "00000000";
        string dbName = "bc_casion";






        public RootObject game_settingObj = new RootObject();                 //檔案設定物件
        public List<GameRecord> game_recordsList = new List<GameRecord>();    //遊戲紀錄總清單(前四場)
        public List<PreRecords> game_recordsListAll = new List<PreRecords>();    //遊戲紀錄總清單
        public GameRecord now_gameRecord = new GameRecord();                  //此場遊戲紀錄
        public List<MemberList> memberList = new List<MemberList>();          //使用的成員清單
        public List<string> all_wayBillList = new List<string>();             //遊戲路單清單
        SortableBindingList<ServerUserView> server_userView = new SortableBindingList<ServerUserView>(); //檢視現在登入的使用者
        SortableBindingList<ServerUserView> server_userView2 = new SortableBindingList<ServerUserView>(); 
        public BetInfoTotPoint betInfoTotPoint = new BetInfoTotPoint();  //全場押分資訊
        public LastGameRecord lastGameRecord = new LastGameRecord();     //最後一場紀錄



        //WebSocketServer server = new WebSocketServer("ws://172.16.8.178:8384");
        //WebSocketServer server = new WebSocketServer("ws://172.16.8.76:8384");
        WebSocketServer server = new WebSocketServer("ws://0.0.0.0:8384");
        public List<IWebSocketConnection> allSockets = new List<IWebSocketConnection>();


        public Form1()
        {
            Form1.CheckForIllegalCrossThreadCalls = false; //開發人員在測試時加這一行...以便在debug模式能正常執行             
            SettingValue game_setting = new SettingValue();  //讀入檔案
            game_settingObj = game_setting.ReadGS_userSettings_obj();
            InitializeComponent();

            var source = new BindingList<ServerUserView>(server_userView.ToList());
            dataGridView1.DataSource = source;
           
            dataGridView1.Columns["no"].HeaderText = "No";
            dataGridView1.Columns["no"].Width = 50;
            dataGridView1.Columns["userId"].HeaderText = "user ID";
            dataGridView1.Columns["userId"].Width = 130;

            reSetDataGridViewSelect();


            StartTimer();
            sw.Reset();
            sw.Start();
            StartUseTime();

            var msg = (game_settingObj.MsgSetting.MsgFixed) ? game_setting.show_Msg(game_settingObj) : game_settingObj.MsgSetting.Msg1;
            game_msg = msg;

            //讀出前四場紀錄
            if (game_recordsList == null || game_recordsList.Count == 0)
            {
                getPreRecord_toFour();
            }

            if (game_recordsListAll == null || game_recordsListAll.Count == 0)
            {
                game_recordsListAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum);
            }

            //取出開牌紀錄,並顯示於server介面
            getOpenCardRecord();
            game_field = lastGameRecord.field;
            game_round = lastGameRecord.round;
            textBox1.Text = lastGameRecord.field + "-" + lastGameRecord.round;
            textBox4.Text = "";
            textBox5.Text = lastGameRecord.card + " / 416";
            textBox7.Text = (lastGameRecord.round).ToString();
            textBox15.Text = lastGameRecord.player_win.ToString();
            textBox16.Text = lastGameRecord.player_pair.ToString();
            textBox17.Text = lastGameRecord.tie.ToString();
            textBox20.Text = lastGameRecord.banker_win.ToString();
            textBox21.Text = lastGameRecord.banker_pair.ToString();

            //取出此局路單記錄
            if (all_wayBillList.Count == 0)
            {
                takeThisFieldAllRecords();
            }

            FleckLog.Level = LogLevel.Debug;
            server.Start(socket =>
                {
                    socket.OnOpen = () =>
                    {
                        Console.WriteLine("Open!");
                        allSockets.Add(socket);
                        memberList.Add(new MemberList() {
                            user_socket = socket,
                            bettingPoint = new BettingPoint(),
                            pre_bettingPoint = new BettingPoint(),
                            haveBet = new List<BettingPoint>(),
                            recordLoadNum = game_settingObj.SingleMachine.RecordLoadNum
                        });

                        //寄送設定資訊,目前遊戲狀態
                        #region var resultSetting
                        var resultSetting = new
                        {
                            action = "Setting",
                            status = status,
                            cardBack = game_settingObj.PukerBack.UseFixedBack, //之後需判斷是否啟用按鈕

                            //押注設定
                            Denomination1 = game_settingObj.BettingSetting.Denomination1,
                            Denomination2 = game_settingObj.BettingSetting.Denomination2,
                            Denomination3 = game_settingObj.BettingSetting.Denomination3,
                            Denomination4 = game_settingObj.BettingSetting.Denomination4,
                            Denomination5 = game_settingObj.BettingSetting.Denomination5,
                            tieBet = game_settingObj.BettingSetting.TieBet,
                            remainingPointBet = game_settingObj.BettingSetting.RemainingPointBet,
                            autoRetention = game_settingObj.BettingSetting.AutoRetention,

                            //押注設定2
                            singleNoteMin = game_settingObj.BettingSetting2.SingleNoteMin,
                            singleNoteMax = game_settingObj.BettingSetting2.SingleNoteMax,
                            tieNoteMin = game_settingObj.BettingSetting2.TieNoteMin,
                            tieNoteMax = game_settingObj.BettingSetting2.TieNoteMax,
                            playerPairMin = game_settingObj.BettingSetting2.PlayerPairMin,
                            playerPairMax = game_settingObj.BettingSetting2.PlayerPairMax,
                            bankerPairMin = game_settingObj.BettingSetting2.BankerPairMin,
                            bankerPairMax = game_settingObj.BettingSetting2.BankerPairMax,
                            singleMachineMax = game_settingObj.BettingSetting2.SingleMachineMax,
                            allPlayerBankerMax = game_settingObj.BettingSetting2.AllPlayerBankerMax,
                            allTieNoteMax = game_settingObj.BettingSetting2.AllTieNoteMax,
                            allPlayerPairMax = game_settingObj.BettingSetting2.AllPlayerPairMax,
                            allBankerPairMax = game_settingObj.BettingSetting2.AllBankerPairMax,
                            allMax = game_settingObj.BettingSetting2.AllMax,
                            betOverInvalid = game_settingObj.BettingSetting2.BetOverInvalid,

                            //音效設定
                            bgm = game_settingObj.VoiceSetting.UseBGM,
                            bgmV = game_settingObj.VoiceSetting.BGM,
                            UseVoice = game_settingObj.VoiceSetting.UseVoice,
                            Voice = game_settingObj.VoiceSetting.Voice,
                            UseChips = game_settingObj.VoiceSetting.UseChips,
                            Chips = game_settingObj.VoiceSetting.Chips,
                            UseReciprocal = game_settingObj.VoiceSetting.UseReciprocal,
                            Reciprocal = game_settingObj.VoiceSetting.Reciprocal,

                            //單機設定
                            RetentionBtn = game_settingObj.SingleMachine.RetentionBtn,
                            RetiredBtn = game_settingObj.SingleMachine.RetiredBtn,
                            DayCardAndStopCard = game_settingObj.SingleMachine.DayCardAndStopCard,
                            BigWayShowPair = game_settingObj.SingleMachine.BigWayShowPair,
                            UseChipsIndex = game_settingObj.SingleMachine.UseChipsIndex,
                            UseChipsDrop = game_settingObj.SingleMachine.UseChipsDrop,
                            BigWay = game_settingObj.SingleMachine.BigWay,
                            ThreeWay = game_settingObj.SingleMachine.ThreeWay,
                            BigWayNine = game_settingObj.SingleMachine.BigWayNine,
                            CockroachWay = game_settingObj.SingleMachine.CockroachWay,
                            BigCockroachWay = game_settingObj.SingleMachine.BigCockroachWay,
                            LoginBtn = game_settingObj.SingleMachine.LoginBtn,
                            LogoutBtn = game_settingObj.SingleMachine.LogoutBtn,
                            BeforeRecord = game_settingObj.SingleMachine.BeforeRecord,
                            RecordLoadNum = game_settingObj.SingleMachine.RecordLoadNum,
                            LoginKeepsNum = game_settingObj.SingleMachine.LoginKeepsNum,

                            //鍵盤按鍵設定
                            KeyM = game_settingObj.New17Keys.KeyM,
                            KeyJ = game_settingObj.New17Keys.KeyJ,
                            KeyQ = game_settingObj.New17Keys.KeyQ,
                            KeyW = game_settingObj.New17Keys.KeyW,

                            //功能設定
                            BGColor = game_settingObj.FeaturesSetting.BGColor,
                            TableNumber = game_settingObj.FeaturesSetting.TableNumber,
                            BetInfo = game_settingObj.FeaturesSetting.BetInfo,

                            //切牌功能
                            AutoCutCard = game_settingObj.CutCardFeatures.AutoCutCard,
                            Round = game_settingObj.CutCardFeatures.Round,
                            Num = game_settingObj.CutCardFeatures.Num,

                            //每局開出場次
                            openRound = game_settingObj.CardTotNum.OpenRound
                        };
                        #endregion

                        socket.Send(JsonConvert.SerializeObject(resultSetting));

                        int[] cardInfo = { now_gameRecord.PC1, now_gameRecord.BC1, now_gameRecord.PC2, now_gameRecord.BC2, now_gameRecord.PC3, now_gameRecord.BC3 };

                        var nowCardBack = game_cardBack;
                        if (game_settingObj.PukerBack.UseFixedBackBtn)
                        {
                            nowCardBack = game_settingObj.PukerBack.UseFixedBack;
                        }


                        //寄送此場資訊(歷程同步)
                        switch (status)
                        {
                            case "readNowField":
                                var changeField = new
                                {
                                    action = "allGame",
                                    game_field = game_field,
                                    game_round = game_round,
                                    openRound = textBox7.Text.ToString(),
                                    status = status,
                                    welcomeMsg = game_msg,
                                    CardInfo = cardInfo,
                                    Psum = Psum,
                                    Bsum = Bsum,
                                    way_Records = all_wayBillList,
                                    cardBack = nowCardBack,
                                    preRecordsFour = game_recordsList,
                                    preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum),
                                    betInfoTotPoint = betInfoTotPoint,
                                    way_RecordsNum = all_wayBillList.Count,
                                    lastGameRecord = lastGameRecord,
                                    nowGameShowPairBet = nowGameShowPairBet,
                                    nowGameChipIndex = nowGameChipIndex,
                                    nowGameBigWayShowP = nowGameBigWayShowP
                                };
                                socket.Send(JsonConvert.SerializeObject(changeField));
                                break;
                            case "startGame":
                                var gameRecord1 = new
                                {
                                    action = "allGame",
                                    game_field = game_field,
                                    game_round = game_round,
                                    openRound = textBox7.Text.ToString(),
                                    status = status,
                                    welcomeMsg = game_msg,
                                    CardInfo = cardInfo,
                                    Psum = Psum,
                                    Bsum = Bsum,
                                    way_Records = all_wayBillList,
                                    cardBack = nowCardBack,
                                    startBetMsg = "請押分",
                                    reciprocal_num = BetTimes,
                                    preRecordsFour = game_recordsList,
                                    preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum),
                                    betInfoTotPoint = betInfoTotPoint,
                                    way_RecordsNum = all_wayBillList.Count,
                                    lastGameRecord = lastGameRecord,
                                    nowGameShowPairBet = nowGameShowPairBet,
                                    nowGameChipIndex = nowGameChipIndex,
                                    nowGameBigWayShowP = nowGameBigWayShowP
                                };
                                socket.Send(JsonConvert.SerializeObject(gameRecord1));
                                break;
                            case "bet":
                                var gameRecord2 = new
                                {
                                    action = "allGame",
                                    game_field = game_field,
                                    game_round = game_round,
                                    openRound = textBox7.Text.ToString(),
                                    status = status,
                                    welcomeMsg = game_msg,
                                    CardInfo = cardInfo,
                                    Psum = Psum,
                                    Bsum = Bsum,
                                    way_Records = all_wayBillList,
                                    cardBack = nowCardBack,
                                    reciprocal_num = BetTimes,
                                    preRecordsFour = game_recordsList,
                                    preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum),
                                    betInfoTotPoint = betInfoTotPoint,
                                    way_RecordsNum = all_wayBillList.Count,
                                    lastGameRecord = lastGameRecord,
                                    nowGameShowPairBet = nowGameShowPairBet,
                                    nowGameChipIndex = nowGameChipIndex,
                                    nowGameBigWayShowP = nowGameBigWayShowP
                                };
                                socket.Send(JsonConvert.SerializeObject(gameRecord2));
                                break;
                            case "stopBet":
                                var gameRecord3 = new
                                {
                                    action = "allGame",
                                    game_field = game_field,
                                    game_round = game_round,
                                    openRound = textBox7.Text.ToString(),
                                    status = status,
                                    welcomeMsg = game_msg,
                                    CardInfo = cardInfo,
                                    Psum = Psum,
                                    Bsum = Bsum,
                                    way_Records = all_wayBillList,
                                    cardBack = nowCardBack,
                                    preRecordsFour = game_recordsList,
                                    preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum),
                                    betInfoTotPoint = betInfoTotPoint,
                                    way_RecordsNum = all_wayBillList.Count,
                                    lastGameRecord = lastGameRecord,
                                    nowGameShowPairBet = nowGameShowPairBet,
                                    nowGameChipIndex = nowGameChipIndex,
                                    nowGameBigWayShowP = nowGameBigWayShowP
                                };
                                socket.Send(JsonConvert.SerializeObject(gameRecord3));
                                break;
                            case "settlement":
                                var gameRecord5 = new
                                {
                                    action = "allGame",
                                    game_field = game_field,
                                    game_round = game_round,
                                    openRound = textBox7.Text.ToString(),
                                    status = status,
                                    welcomeMsg = game_msg,
                                    CardInfo = cardInfo,
                                    nowRecord = now_gameRecord,
                                    playerSum = Psum,
                                    bankerSum = Bsum,
                                    time = DateTime.Now.ToString("yyyy/MM/dd HH:ss:mm"),
                                    way_Records = all_wayBillList,
                                    preRecordsFour = game_recordsList,
                                    preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum),
                                    betInfoTotPoint = betInfoTotPoint,
                                    way_RecordsNum = all_wayBillList.Count,
                                    lastGameRecord = lastGameRecord,
                                    nowGameShowPairBet = nowGameShowPairBet,
                                    nowGameChipIndex = nowGameChipIndex,
                                    nowGameBigWayShowP = nowGameBigWayShowP
                                };
                                socket.Send(JsonConvert.SerializeObject(gameRecord5));
                                break;
                            case "cutCard":
                                var gameRecord4 = new
                                {
                                    action = "allGame",
                                    game_field = game_field,
                                    game_round = game_round,
                                    openRound = textBox7.Text.ToString(),
                                    status = status,
                                    welcomeMsg = game_msg,
                                    CardInfo = cardInfo,
                                    Psum = Psum,
                                    Bsum = Bsum,
                                    way_Records = all_wayBillList,
                                    cardBack = nowCardBack,
                                    preRecordsFour = game_recordsList,
                                    preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum),
                                    betInfoTotPoint = betInfoTotPoint,
                                    way_RecordsNum = all_wayBillList.Count,
                                    lastGameRecord = lastGameRecord,
                                    cutCardNum = nowCutCard,
                                    totCutNum = totCut,
                                    nowGameShowPairBet = nowGameShowPairBet,
                                    nowGameChipIndex = nowGameChipIndex,
                                    nowGameBigWayShowP = nowGameBigWayShowP
                                };
                                socket.Send(JsonConvert.SerializeObject(gameRecord4));
                                break;
                            default:
                                var gameRecord = new
                                {
                                    action = "allGame",
                                    game_field = game_field,
                                    game_round = game_round,
                                    openRound = textBox7.Text.ToString(),
                                    status = status,
                                    welcomeMsg = game_msg,
                                    CardInfo = cardInfo,
                                    Psum = Psum,
                                    Bsum = Bsum,
                                    way_Records = all_wayBillList,
                                    cardBack = nowCardBack,
                                    preRecordsFour = game_recordsList,
                                    preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum),
                                    betInfoTotPoint = betInfoTotPoint,
                                    way_RecordsNum = all_wayBillList.Count,
                                    lastGameRecord = lastGameRecord ,
                                    nowGameShowPairBet = nowGameShowPairBet,
                                    nowGameChipIndex = nowGameChipIndex,
                                    nowGameBigWayShowP = nowGameBigWayShowP
                                };
                                //Console.WriteLine(lastGameRecord);
                                socket.Send(JsonConvert.SerializeObject(gameRecord));
                                break;
                        }
                    };
                    socket.OnClose = () => {
                        Console.WriteLine("Close!");
                        //client 斷線則自動登出
                        reSetDataGridViewSelect();
                        dataGridView1.AutoGenerateColumns = false;
                        foreach (var item in memberList)
                        {
                            if (socket == item.user_socket)
                            {
                                if (!String.IsNullOrEmpty(item.account))
                                {
                                    var the_loginOut = server_userView.Where(m => m.userId == item.account).ToList();  //https://stackoverflow.com/questions/9195727/removing-elements-from-binding-list
                                    if (the_loginOut.FirstOrDefault() != null)
                                    {
                                        if (server_userView.Count > 0)
                                        {
                                            lock (serverUserView_Locker)
                                            {
                                                foreach (var user in the_loginOut.ToList())
                                                {
                                                    //source.Remove(user);
                                                    server_userView.Remove(user);
                                                }
                                            }
                                        }
                                    }
                                    foreach (var itemSocket in allSockets.ToList())
                                    {
                                        if (itemSocket == item.user_socket)
                                        {
                                            allSockets.Remove(itemSocket);
                                        }
                                    }
                                    item.user_socket = null;
                                }
                            }
                        }
                        //更新dataGridView
                        try
                        {
                            lock (serverUserView_Locker)
                            {
                                Refresh_UserLogin();
                            }
                        }
                        catch (Exception e)
                        {
                            MessageBox.Show(e.ToString());
                        }

                    };
                    socket.OnMessage = message =>
                    {
                        Console.WriteLine(message.ToList());
                        JObject jobject = JObject.Parse(message);
                        var action = (string)jobject["action"];

                        switch (action)
                        {
                            case "Live":
                                //紀錄存活訊息
                                foreach (var item in memberList)
                                {
                                    if (socket == item.user_socket)
                                    {
                                        //活著
                                        item.aliveTime = 0;
                                    }
                                }
                                break;
                            case "login":

                                //確認使用者沒有重複按下登入鈕
                                var hasLogin = false;
                                foreach (var item in memberList)
                                {
                                    if (socket == item.user_socket && !(String.IsNullOrEmpty(item.account)))
                                    {
                                        hasLogin = true;
                                        break;
                                    }
                                }

                                //比對資料庫有無此帳戶
                                var No = Check_loginUser((string)jobject["account"]);

                                if (No == 0)
                                {
                                    //查無此編號
                                    var loginfiled = new
                                    {
                                        action = "loginFiled",
                                        fieldMsg = "查無此編號"
                                    };
                                    socket.Send(JsonConvert.SerializeObject(loginfiled));
                                    break;
                                }

                                //有登入,再以別的帳號登入,且不得有押分才能轉換帳號登入
                                if (hasLogin && No != 0)
                                {
                                    foreach (var item in memberList.ToList())
                                    {
                                        if (socket == item.user_socket)
                                        {
                                            //確認沒有押分
                                            if (item.bettingPoint.totPoint > 0)
                                            {
                                                //有押分
                                                //登入失敗
                                                var loginfiled = new
                                                {
                                                    action = "loginFiled",
                                                    fieldMsg = "登入失敗"
                                                };
                                                socket.Send(JsonConvert.SerializeObject(loginfiled));
                                                break;
                                            }
                                            else
                                            {
                                                //登入,並將原本登入的這個帳號登出
                                                var theLogout = server_userView.Where(m => m.userId == item.account).ToList();
                                                try
                                                {
                                                    if (theLogout.FirstOrDefault() != null)
                                                    {
                                                        lock (serverUserView_Locker)
                                                        {
                                                            foreach (var logItem in theLogout.ToList())
                                                            {
                                                                server_userView.Remove(logItem);
                                                                dataGridView1.DataSource = null;
                                                                source = new BindingList<ServerUserView>(server_userView.ToList());
                                                                dataGridView1.DataSource = source;
                                                                CurrencyManager cm = (CurrencyManager)this.dataGridView1.BindingContext[server_userView.ToList()];
                                                                if (cm != null)
                                                                {
                                                                    cm.Refresh();
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                catch (Exception e)
                                                {
                                                    MessageBox.Show(e.ToString());
                                                }

                                                item.account = "";
                                                item.pre_bettingPoint = new BettingPoint();
                                                item.user_point = 0;
                                                item.haveBet = new List<BettingPoint>();
                                                hasLogin = false;
                                            }
                                        }
                                    }
                                    
                                }

                                
                                if (!(hasLogin) && No != 0)
                                {
                                    //判斷是否重複登入(同一使用者)
                                    if (PickLoginRepeatUser(socket, (string)jobject["account"]) == false)
                                    {
                                        break;
                                    }

                                    foreach (var item in memberList.ToList())
                                    {
                                        if (socket == item.user_socket)
                                        {
                                            reSetDataGridViewSelect();

                                            item.account = (string)jobject["account"];
                                            item.loginKeepsNum = game_settingObj.SingleMachine.LoginKeepsNum;
                                            item.recordLoadNum = game_settingObj.SingleMachine.RecordLoadNum;
                                            item.aliveTime = 0;

                                            //若登入清單有此資料則不新增
                                            var theLogin = server_userView.Where(m => m.userId == item.account).ToList();
                                            if (theLogin.FirstOrDefault() == null)
                                            {
                                                lock (serverUserView_Locker)
                                                {
                                                    ServerUserView views = new ServerUserView(No, (string)jobject["account"]);
                                                    server_userView.Add(views);
                                                }
                                            }

                                            if (item.user_point == 0)
                                            {
                                                var point = getUserPoint(item.account);
                                                item.user_point = point;
                                            }
                                            var bettingInfo = (item.bettingPoint.totPoint > 0) ? item.bettingPoint : null;

                                            //看有沒有此場的押注記錄
                                            if (bettingInfo == null)
                                            {
                                                //看前場的紀錄是否有次場的押注
                                                if (item.haveBet != null && item.haveBet.Count > 0)
                                                {
                                                    var count = item.haveBet.Count - 1;
                                                    var allcount = game_recordsList.Count - 1;

                                                    if (item.haveBet[count].field == game_field && item.haveBet[count].round == game_round)
                                                    {
                                                        //有紀錄
                                                        bettingInfo = item.haveBet[count];
                                                    }
                                                }
                                            }

                                            bool hasRebet = false;
                                            if (item.haveBet != null && item.haveBet.Count > 0)
                                            {
                                                var count = item.haveBet.Count - 1;
                                                var allcount = game_recordsList.Count - 1;
                                                if (item.haveBet[count].field == game_recordsList[allcount].gameField && item.haveBet[count].round == game_recordsList[allcount].gameRound)
                                                {
                                                    hasRebet = true;
                                                }
                                            }


                                            var loginsuccess = new
                                            {
                                                action = "loginSuccess",
                                                account = jobject["account"],
                                                RecordLoadNum = game_settingObj.SingleMachine.RecordLoadNum,
                                                LoginKeepsNum = game_settingObj.SingleMachine.LoginKeepsNum,
                                                preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum),
                                                showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                user_point = item.user_point,
                                                user_betInfo = bettingInfo,
                                                status = status,
                                                showRebetBtn = hasRebet
                                            };
                                            socket.Send(JsonConvert.SerializeObject(loginsuccess));

                                        }
                                    }
                                    //更新dataGridView

                                    try
                                    {
                                        lock (serverUserView_Locker)
                                        {
                                            Refresh_UserLogin();
                                        }
                                    }
                                    catch (Exception e)
                                    {
                                        MessageBox.Show(e.ToString());
                                    }
                                }
                                else
                                {
                                    //登入失敗
                                    var loginfiled = new
                                    {
                                        action = "loginFiled",
                                        fieldMsg = "登入失敗"
                                    };
                                    socket.Send(JsonConvert.SerializeObject(loginfiled));
                                }
                                break;
                            case "loginOut":
                                //確認使用者是否登入(有登入登出才有效)
                                foreach (var item in memberList)
                                {
                                    if (socket == item.user_socket)
                                    {
                                        if (!String.IsNullOrEmpty(item.account))
                                        {
                                            reSetDataGridViewSelect();

                                            if (item.bettingPoint.totPoint > 0)
                                            {
                                                //尚有押分無法登出
                                                var logoutError = new
                                                {
                                                    action = "haveBetCanNotLoginOut"
                                                };

                                                socket.Send(JsonConvert.SerializeObject(logoutError));
                                            }
                                            else
                                            {
                                                var loginOut = new
                                                {
                                                    action = "loginOut",
                                                    account = item.account,
                                                    RecordLoadNum = game_settingObj.SingleMachine.RecordLoadNum,
                                                    LoginKeepsNum = game_settingObj.SingleMachine.LoginKeepsNum,
                                                    preRecordsAll = getBeforeRecord(game_settingObj.SingleMachine.RecordLoadNum)
                                                };
                                                socket.Send(JsonConvert.SerializeObject(loginOut));

                                                var the_loginOut = server_userView.Where(m => m.userId == item.account).ToList();  //https://stackoverflow.com/questions/9195727/removing-elements-from-binding-list
                                                if (the_loginOut.FirstOrDefault() != null)
                                                {
                                                    lock (serverUserView_Locker)
                                                    {
                                                        foreach (var user in the_loginOut.ToList())
                                                        {
                                                            server_userView.Remove(user);
                                                        }
                                                    }
                                                }

                                                item.account = "";
                                            }
                                        }
                                    }
                                }

                                //更新dataGridView
                                try
                                {
                                    lock (serverUserView_Locker)
                                    {
                                        Refresh_UserLogin();
                                    }
                                }
                                catch (Exception e)
                                {
                                    MessageBox.Show(e.ToString());
                                }
                                break;
                            case "continuBet":
                                //判斷使用者有沒有登入
                                foreach (var item in memberList)
                                {
                                    if (socket == item.user_socket)
                                    {
                                        if (!String.IsNullOrEmpty(item.account))
                                        {
                                            //續押(從有押注場次取出此場的上一場)
                                            if (item.haveBet != null && item.haveBet.Count > 0)
                                            {
                                                var count = item.haveBet.Count - 1;
                                                var allcount = game_recordsList.Count - 1;

                                                if (item.haveBet[count].field == game_recordsList[allcount].gameField && item.haveBet[count].round == game_recordsList[allcount].gameRound)
                                                {

                                                    //前一場有押注,可續押
                                                    var preBetResult = new BettingPoint()
                                                    {
                                                        field = item.haveBet[count].field,
                                                        round = item.haveBet[count].round,
                                                        allTotPoint = item.haveBet[count].allTotPoint,
                                                        totPoint = item.haveBet[count].totPoint,
                                                        totGetPoint = item.haveBet[count].totGetPoint,
                                                        player_btn = item.haveBet[count].player_btn,
                                                        banker_btn = item.haveBet[count].banker_btn,
                                                        tie_btn = item.haveBet[count].tie_btn,
                                                        bankerPair_btn = item.haveBet[count].bankerPair_btn,
                                                        playerPair_btn = item.haveBet[count].playerPair_btn,
                                                        playerBet = item.haveBet[count].playerBet,
                                                        bankerBet = item.haveBet[count].bankerBet,
                                                        tieBet = item.haveBet[count].tieBet,
                                                        playPairBet = item.haveBet[count].playPairBet,
                                                        bankPairBet = item.haveBet[count].bankPairBet
                                                    };

                                                    //先扣掉餘分
                                                    //扣掉餘分的條件為:使用者有點擊餘分籌碼所押上的餘分退押,若點擊其他籌碼持續押至餘分出現則不退押餘分
                                                    int[] sortChip = sortChip_All();
                                                    //int[] sortChip = new int[] { game_settingObj.BettingSetting.Denomination1, game_settingObj.BettingSetting.Denomination2, game_settingObj.BettingSetting.Denomination3,
                                                    //                                 game_settingObj.BettingSetting.Denomination4, game_settingObj.BettingSetting.Denomination5 };

                                                    int minSort = 0;

                                                    if (sortChip == null || sortChip.Count() == 0)
                                                    {
                                                        minSort = 0;
                                                    }
                                                    else
                                                    {
                                                        Array.Sort(sortChip);
                                                        minSort = sortChip[0];
                                                    }

                                                    
                                                    //var d_point = item.haveBet[count].totPoint % sortChip[0];

                                                    //先看哪一個押注有餘分
                                                    //preBetResult.totPoint = item.haveBet[count].totPoint - d_point;
                                                    if (item.haveBet[count].player_R == true)
                                                    {
                                                        preBetResult.player_btn = (item.haveBet[count].player_btn % minSort > 0) ? item.haveBet[count].player_btn - (item.haveBet[count].player_btn % minSort) : item.haveBet[count].player_btn;
                                                        preBetResult.totPoint -= (item.haveBet[count].player_btn % minSort > 0) ? (item.haveBet[count].player_btn % minSort) : 0;
                                                    }
                                                    if (item.haveBet[count].banker_R == true)
                                                    {
                                                        preBetResult.banker_btn = (item.haveBet[count].banker_btn % minSort > 0) ? item.haveBet[count].banker_btn - (item.haveBet[count].banker_btn % minSort) : item.haveBet[count].banker_btn;
                                                        preBetResult.totPoint -= (item.haveBet[count].banker_btn % minSort > 0) ? (item.haveBet[count].banker_btn % minSort) : 0;
                                                    }
                                                    if (item.haveBet[count].tie_R == true)
                                                    {
                                                        preBetResult.tie_btn = (item.haveBet[count].tie_btn % minSort > 0) ? item.haveBet[count].tie_btn - (item.haveBet[count].tie_btn % minSort) : item.haveBet[count].tie_btn;
                                                        preBetResult.totPoint -= (item.haveBet[count].tie_btn % minSort > 0) ? (item.haveBet[count].tie_btn % minSort) : 0;
                                                    }
                                                    if (item.haveBet[count].playerP_R == true)
                                                    {
                                                        preBetResult.playerPair_btn = (item.haveBet[count].playerPair_btn % minSort > 0) ? item.haveBet[count].playerPair_btn - (item.haveBet[count].playerPair_btn % minSort) : item.haveBet[count].playerPair_btn;
                                                        preBetResult.totPoint -= (item.haveBet[count].playerPair_btn % minSort > 0) ? (item.haveBet[count].playerPair_btn % minSort) : 0;
                                                    }
                                                    if (item.haveBet[count].bankerP_R == true)
                                                    {
                                                        preBetResult.bankerPair_btn = (item.haveBet[count].bankerPair_btn % minSort > 0) ? item.haveBet[count].bankerPair_btn - (item.haveBet[count].bankerPair_btn % minSort) : item.haveBet[count].bankerPair_btn;
                                                        preBetResult.totPoint -= (item.haveBet[count].bankerPair_btn % minSort > 0) ? (item.haveBet[count].bankerPair_btn % minSort) : 0;
                                                    }
                                                    
                                                    var nowHavePoint = item.user_point + preBetResult.totPoint;

                                                    //看現在的分數足不足以續押(不足則不續押)
                                                    if (nowHavePoint >= item.haveBet[count].totPoint)
                                                    {

                                                        //先比對續押的點數是否大於全場單注(超過則將續押點數更新)
                                                        //判斷是否啟用"押注超過限額無效"
                                                        //讓下一回押注自動補成適當押注額
                                                        if (game_settingObj.BettingSetting2.BetOverInvalid != true)
                                                        {
                                                            if ((preBetResult.player_btn + betInfoTotPoint.playerAllBet) > game_settingObj.BettingSetting2.AllPlayerBankerMax && game_settingObj.BettingSetting2.AllPlayerBankerMax != 0)
                                                            {
                                                                item.haveBet[count].player_btn = game_settingObj.BettingSetting2.AllPlayerBankerMax;
                                                            }
                                                            if ((preBetResult.banker_btn + betInfoTotPoint.bankerAllBet) > game_settingObj.BettingSetting2.AllPlayerBankerMax && game_settingObj.BettingSetting2.AllPlayerBankerMax != 0)
                                                            {
                                                                item.haveBet[count].banker_btn = game_settingObj.BettingSetting2.AllPlayerBankerMax;
                                                            }
                                                            if ((preBetResult.tie_btn + betInfoTotPoint.tieAllBet) > game_settingObj.BettingSetting2.AllTieNoteMax && game_settingObj.BettingSetting2.AllTieNoteMax != 0)
                                                            {
                                                                item.haveBet[count].tie_btn = game_settingObj.BettingSetting2.AllTieNoteMax;
                                                            }
                                                            if ((preBetResult.playerPair_btn + betInfoTotPoint.playPairAllBet) > game_settingObj.BettingSetting2.AllPlayerPairMax && game_settingObj.BettingSetting2.AllPlayerPairMax != 0)
                                                            {
                                                                item.haveBet[count].playerPair_btn = game_settingObj.BettingSetting2.AllPlayerPairMax;
                                                            }
                                                            if ((preBetResult.bankerPair_btn + betInfoTotPoint.bankPairAllBet) > game_settingObj.BettingSetting2.AllBankerPairMax && game_settingObj.BettingSetting2.AllBankerPairMax != 0)
                                                            {
                                                                item.haveBet[count].bankerPair_btn = game_settingObj.BettingSetting2.AllBankerPairMax;
                                                            }
                                                        }
                                                        


                                                        //將分數比對最低押分(若不足最低押分則不押)
                                                        preBetResult.player_btn = (preBetResult.player_btn < game_settingObj.BettingSetting2.SingleNoteMin && game_settingObj.BettingSetting2.SingleNoteMin != 0) ? 0 : preBetResult.player_btn;
                                                        preBetResult.banker_btn = (preBetResult.banker_btn < game_settingObj.BettingSetting2.SingleNoteMin && game_settingObj.BettingSetting2.SingleNoteMin != 0) ? 0 : preBetResult.banker_btn;
                                                        preBetResult.tie_btn = (preBetResult.tie_btn < game_settingObj.BettingSetting2.TieNoteMin && game_settingObj.BettingSetting2.TieNoteMin != 0) ? 0 : preBetResult.tie_btn;
                                                        preBetResult.playerPair_btn = (preBetResult.playerPair_btn < game_settingObj.BettingSetting2.PlayerPairMin && game_settingObj.BettingSetting2.PlayerPairMin != 0) ? 0 : preBetResult.playerPair_btn;
                                                        preBetResult.bankerPair_btn = (preBetResult.bankerPair_btn < game_settingObj.BettingSetting2.BankerPairMin && game_settingObj.BettingSetting2.BankerPairMin != 0) ? 0 : preBetResult.bankerPair_btn;

                                                        //判斷是否啟用"押注超過限額無效"(啟用則不押)
                                                        if (game_settingObj.BettingSetting2.BetOverInvalid == true)
                                                        {
                                                            if ((preBetResult.player_btn > game_settingObj.BettingSetting2.SingleNoteMax && game_settingObj.BettingSetting2.SingleNoteMax != 0) ||
                                                                (preBetResult.player_btn > game_settingObj.BettingSetting2.AllPlayerBankerMax && game_settingObj.BettingSetting2.AllPlayerBankerMax != 0))
                                                            {
                                                                preBetResult.player_btn = 0;
                                                            }
                                                            if ((preBetResult.banker_btn > game_settingObj.BettingSetting2.SingleNoteMax && game_settingObj.BettingSetting2.SingleNoteMax != 0) || 
                                                                (preBetResult.banker_btn > game_settingObj.BettingSetting2.AllPlayerBankerMax && game_settingObj.BettingSetting2.AllPlayerBankerMax != 0))
                                                            {
                                                                preBetResult.banker_btn = 0;
                                                            }
                                                            if ((preBetResult.tie_btn > game_settingObj.BettingSetting2.TieNoteMax && game_settingObj.BettingSetting2.TieNoteMax != 0) || 
                                                                (preBetResult.tie_btn > game_settingObj.BettingSetting2.AllTieNoteMax && game_settingObj.BettingSetting2.AllTieNoteMax != 0))
                                                            {
                                                                preBetResult.tie_btn = 0;
                                                            }
                                                            if ((preBetResult.playerPair_btn > game_settingObj.BettingSetting2.PlayerPairMax && game_settingObj.BettingSetting2.PlayerPairMax != 0) || 
                                                                (preBetResult.playerPair_btn > game_settingObj.BettingSetting2.AllPlayerPairMax && game_settingObj.BettingSetting2.AllPlayerPairMax != 0))
                                                            {
                                                                preBetResult.playerPair_btn = 0;
                                                            }
                                                            if ((preBetResult.bankerPair_btn > game_settingObj.BettingSetting2.BankerPairMax && game_settingObj.BettingSetting2.BankerPairMax != 0) || 
                                                                (preBetResult.bankerPair_btn > game_settingObj.BettingSetting2.AllBankerPairMax && game_settingObj.BettingSetting2.AllBankerPairMax != 0))
                                                            {
                                                                preBetResult.bankerPair_btn = 0;
                                                            }
                                                        }

                                                        var continuBet = new
                                                        {
                                                            action = "continuBet",
                                                            preBet = preBetResult,
                                                            status = status
                                                        };

                                                        

                                                        //並將目前有押注的點數退押
                                                        if (item.bettingPoint.totPoint > 0)
                                                        {
                                                            item.user_point += item.bettingPoint.totPoint;
                                                            betInfoTotPoint.playerAllBet -= item.bettingPoint.player_btn;
                                                            betInfoTotPoint.playPairAllBet -= item.bettingPoint.playerPair_btn;
                                                            betInfoTotPoint.tieAllBet -= item.bettingPoint.tie_btn;
                                                            betInfoTotPoint.bankPairAllBet -= item.bettingPoint.bankerPair_btn;
                                                            betInfoTotPoint.bankerAllBet -= item.bettingPoint.banker_btn;
                                                            item.bettingPoint.player_btn = 0;
                                                            item.bettingPoint.playerPair_btn = 0;
                                                            item.bettingPoint.tie_btn = 0;
                                                            item.bettingPoint.banker_btn = 0;
                                                            item.bettingPoint.bankerPair_btn = 0;
                                                            item.bettingPoint.totPoint = 0;
                                                        }

                                                        //更新server全場押注分數顯示
                                                        textBox6.Text = allBet_totSum().ToString();
                                                        textBox8.Text = betInfoTotPoint.playerAllBet.ToString();
                                                        textBox9.Text = betInfoTotPoint.playPairAllBet.ToString();
                                                        textBox11.Text = betInfoTotPoint.tieAllBet.ToString();
                                                        textBox12.Text = betInfoTotPoint.bankPairAllBet.ToString();
                                                        textBox13.Text = betInfoTotPoint.bankerAllBet.ToString();

                                                        //押注分數不夠則不押
                                                        if (item.user_point >= preBetResult.totPoint)
                                                        {
                                                            //看是否啟用莊閒只能押一邊,如果啟用且莊閒皆有押分則不續押
                                                            if (!(game_settingObj.FeaturesSetting.PBOnlyOne == true && (preBetResult.player_btn > 0 && preBetResult.banker_btn > 0)))
                                                            {
                                                                //是否超過單機限額
                                                                if (!(preBetResult.totPoint > game_settingObj.BettingSetting2.SingleMachineMax && game_settingObj.BettingSetting2.SingleMachineMax != 0))
                                                                {
                                                                    //是否超過全場限額則
                                                                    if (!((preBetResult.totPoint + GetAllBetPoint()) > game_settingObj.BettingSetting2.AllMax && game_settingObj.BettingSetting2.AllMax != 0))
                                                                    {
                                                                        socket.Send(JsonConvert.SerializeObject(continuBet));
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        var betInfoSend = new
                                                        {
                                                            action = "AllBetTotPoint",
                                                            allBetPoint = betInfoTotPoint,
                                                            status = status
                                                        };
                                                        allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend)));
                                                    }
                                                }
                                            }
                                        }
                                        else
                                        {
                                            //使用者未登入
                                        }
                                    }
                                }

                                break;
                            case "RetireBet":
                                //判斷使用者有沒有登入
                                foreach (var item in memberList)
                                {
                                    if (socket == item.user_socket)
                                    {
                                        if (!String.IsNullOrEmpty(item.account))
                                        {
                                            //退押
                                            betInfoTotPoint.playerAllBet -= item.bettingPoint.player_btn;
                                            betInfoTotPoint.playPairAllBet -= item.bettingPoint.playerPair_btn;
                                            betInfoTotPoint.tieAllBet -= item.bettingPoint.tie_btn;
                                            betInfoTotPoint.bankPairAllBet -= item.bettingPoint.bankerPair_btn;
                                            betInfoTotPoint.bankerAllBet -= item.bettingPoint.banker_btn;
                                            item.bettingPoint.player_btn = 0;
                                            item.bettingPoint.playerPair_btn = 0;
                                            item.bettingPoint.tie_btn = 0;
                                            item.bettingPoint.banker_btn = 0;
                                            item.bettingPoint.bankerPair_btn = 0;
                                            item.user_point += item.bettingPoint.totPoint;
                                            item.bettingPoint.totPoint = 0;
                                            item.bettingPoint.player_R = false;
                                            item.bettingPoint.banker_R = false;
                                            item.bettingPoint.tie_R = false;
                                            item.bettingPoint.playerP_R = false;
                                            item.bettingPoint.bankerP_R = false;


                                            //更新server全場押注分數顯示
                                            textBox6.Text = allBet_totSum().ToString();
                                            textBox8.Text = betInfoTotPoint.playerAllBet.ToString();
                                            textBox9.Text = betInfoTotPoint.playPairAllBet.ToString();
                                            textBox11.Text = betInfoTotPoint.tieAllBet.ToString();
                                            textBox12.Text = betInfoTotPoint.bankPairAllBet.ToString();
                                            textBox13.Text = betInfoTotPoint.bankerAllBet.ToString();

                                            var resultPoint = new
                                            {
                                                action = "RetireBet",
                                                totPoint = item.bettingPoint.totPoint,
                                                showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                user_point = item.user_point,
                                                status = status
                                            };
                                            socket.Send(JsonConvert.SerializeObject(resultPoint));

                                            var betInfoSend = new
                                            {
                                                action = "AllBetTotPoint",
                                                allBetPoint = betInfoTotPoint,
                                                status = status
                                            };
                                            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend)));
                                        }
                                        else
                                        {
                                            //未登入
                                        }
                                    }
                                }

                                break;
                            case "betting":
                                //判斷使用者有沒有登入
                                //(餘分押注為使用者分數中有低於最低籌碼的分數 ex: 分數:1550, 最低籌碼: 100, 餘分則為: 50)
                                foreach (var item in memberList)
                                {
                                    if (socket == item.user_socket)
                                    {
                                        if (!String.IsNullOrEmpty(item.account))
                                        {
                                            item.bettingPoint.field = now_gameRecord.gameField;
                                            item.bettingPoint.round = now_gameRecord.gameRound;

                                            //計算點數(之後要判斷是否超過全場押分)
                                            if (item.user_point > 0)
                                            {
                                                if (!String.IsNullOrEmpty((string)jobject["betPoint"]))
                                                {
                                                    switch ((string)jobject["betBtn"])
                                                    {
                                                        case "player_btn":

                                                            //是否第一筆押注為餘分
                                                            if ((string)jobject["betPoint"] == "餘分")
                                                            {
                                                                int[] sortChip = sortChip_All();

                                                                if (sortChip == null || sortChip.Count() == 0)
                                                                {
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % 0) * 100) / 100;
                                                                }
                                                                else
                                                                {
                                                                    Array.Sort(sortChip);
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;
                                                                }

                                                                //判斷是不是最後一把
                                                                if (!(item.bettingPoint.player_btn > 0) && !(item.user_point - (double)jobject["betPoint"] <= 0))
                                                                {
                                                                    //請先押最低分
                                                                    var BetToMin = new
                                                                    {
                                                                        action = "PointToBetMin",
                                                                        status = status
                                                                    };
                                                                    socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                    break;
                                                                }
                                                                else
                                                                {
                                                                    //int[] sortChip = new int[] { game_settingObj.BettingSetting.Denomination1, game_settingObj.BettingSetting.Denomination2, game_settingObj.BettingSetting.Denomination3,
                                                                    //                 game_settingObj.BettingSetting.Denomination4, game_settingObj.BettingSetting.Denomination5 };
                                                                    
                                                                    if ((double)jobject["betPoint"] == 0)
                                                                    {
                                                                        //目前尚無餘分
                                                                        var BetToMin = new
                                                                        {
                                                                            action = "NotRemaining",
                                                                            status = status
                                                                        };
                                                                        socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                        break;
                                                                    }
                                                                    else
                                                                    {
                                                                        //標記餘分籌碼
                                                                        item.bettingPoint.player_R = true;
                                                                    }
                                                                }
                                                            }
                                                            if ((string)jobject["betPoint"] == "Max" || (string)jobject["betPoint"] == "NaN")
                                                            {
                                                                if (game_settingObj.BettingSetting2.SingleNoteMax == 0 || (item.user_point - game_settingObj.BettingSetting2.SingleNoteMax <= 0))
                                                                {
                                                                    //如果最高限額為無限時,押下全部的分數
                                                                    //如果分數不足最高限額則押下全部的分數
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                                else
                                                                {
                                                                    jobject["betPoint"] = game_settingObj.BettingSetting2.SingleNoteMax;
                                                                }
                                                            }

                                                            //判斷是否啟用莊閒只能押一邊
                                                            if (game_settingObj.FeaturesSetting.PBOnlyOne == true)
                                                            {
                                                                //判斷莊家是否有押分
                                                                if (item.bettingPoint.banker_btn > 0)
                                                                {
                                                                    var notBet = new
                                                                    {
                                                                        action = "PBOnlyOne",
                                                                        status = status
                                                                    };
                                                                    socket.Send(JsonConvert.SerializeObject(notBet));
                                                                    break;
                                                                }
                                                            }

                                                            //餘分可押其他注
                                                            bool lastPoint = false;
                                                            if (item.user_point - (double)jobject["betPoint"] <= 0)
                                                            {
                                                                //確認此押注前還有押注(限此局)
                                                                if (item.bettingPoint.totPoint > 0)
                                                                {
                                                                    //最後一把
                                                                    //jobject["betPoint"] = ShowRemainingPoint(item.user_point, (double)jobject["betPoint"]);  //取餘分
                                                                    jobject["betPoint"] = item.user_point + 0; //全押

                                                                    //確認此把為餘分
                                                                    if (ShowRemainingPoint(item.user_point) == (double)jobject["betPoint"])
                                                                    {
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            //餘分可押其他注(可押)
                                                                            lastPoint = true;
                                                                        }
                                                                        else
                                                                        {
                                                                            //餘分不可押其他注
                                                                            //看前一把有沒有押在這裡
                                                                            if (item.bettingPoint.player_btn > 0)
                                                                            {
                                                                                //可押
                                                                            }
                                                                            else
                                                                            {
                                                                                //分數不足
                                                                                var BetToMin = new
                                                                                {
                                                                                    action = "PointCanNotBet",
                                                                                    status = status
                                                                                };
                                                                                socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                                break;
                                                                            }

                                                                        }
                                                                    }                                                 
                                                                }
                                                                else
                                                                {
                                                                    //最後一把可押 
                                                                    lastPoint = true;
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                            }

                                                            //判斷玩家此押注是否滿足最低押點或超過最大押點
                                                            if ((double)jobject["betPoint"] + item.bettingPoint.player_btn < game_settingObj.BettingSetting2.SingleNoteMin && game_settingObj.BettingSetting2.SingleNoteMin != 0)
                                                            {
                                                                //如果為最後一把則不用補滿
                                                                if (lastPoint != true)
                                                                {
                                                                    if (game_settingObj.BettingSetting2.SingleNoteMin > item.user_point)
                                                                    {
                                                                        //看餘分可押其他注有沒有開
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            jobject["betPoint"] = item.user_point + 0; //全押
                                                                        }
                                                                        else
                                                                        {
                                                                            //分數不足
                                                                            var BetToMin = new
                                                                            {
                                                                                action = "PointCanNotBet",
                                                                                status = status
                                                                            };
                                                                            socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                            break;
                                                                        }
                                                                    }
                                                                    else
                                                                    {
                                                                        //補滿
                                                                        jobject["betPoint"] = game_settingObj.BettingSetting2.SingleNoteMin;
                                                                    }
                                                                    
                                                                }
                                                            }

                                                            //全場限額為最先考慮,若全場限額<單機限額,則以全場限額為主;若兩者不衝突(全場限額>單機限額),則以單機限額為主
                                                            var shouldBet = (double)jobject["betPoint"];

                                                            //是否超過單注最高限額
                                                            if ((shouldBet + item.bettingPoint.player_btn) > game_settingObj.BettingSetting2.SingleNoteMax && game_settingObj.BettingSetting2.SingleNoteMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || item.bettingPoint.player_btn == game_settingObj.BettingSetting2.SingleNoteMax)
                                                                {
                                                                    //超過單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBet = (game_settingObj.BettingSetting2.SingleNoteMax - item.bettingPoint.player_btn);
                                                            }

                                                            //是否超過單機限額
                                                            if ((shouldBet + item.bettingPoint.totPoint) > game_settingObj.BettingSetting2.SingleMachineMax && game_settingObj.BettingSetting2.SingleMachineMax != 0)
                                                            {
                                                                //超過單機押分限額
                                                                SendOverToMaxMsg(socket, "超過本機押分限額!");
                                                                break;
                                                            }

                                                            //是否超過全場單注
                                                            if ((shouldBet + betInfoTotPoint.playerAllBet) > game_settingObj.BettingSetting2.AllPlayerBankerMax && game_settingObj.BettingSetting2.AllPlayerBankerMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || betInfoTotPoint.playerAllBet == game_settingObj.BettingSetting2.AllPlayerBankerMax)
                                                                {
                                                                    //超過全場單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過全場單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBet = (game_settingObj.BettingSetting2.AllPlayerBankerMax - item.bettingPoint.player_btn);
                                                            }

                                                            //是否超過全場限額                                                           
                                                            if ((shouldBet + GetAllBetPoint()) > game_settingObj.BettingSetting2.AllMax && game_settingObj.BettingSetting2.AllMax != 0)
                                                            {
                                                                //超過全場押分限額
                                                                SendOverToMaxMsg(socket, "超過全場押分限額!");
                                                                break;
                                                            }

                                                            item.bettingPoint.player_btn += (double)shouldBet;
                                                            item.bettingPoint.totPoint +=shouldBet;
                                                            item.user_point -= shouldBet;
                                                            item.pre_bettingPoint.player_btn = 0 + item.bettingPoint.player_btn;
                                                            item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;
                                                            betInfoTotPoint.playerAllBet += (double)shouldBet;

                                                            //更新server全場押注分數顯示
                                                            textBox6.Text = allBet_totSum().ToString();
                                                            textBox8.Text = betInfoTotPoint.playerAllBet.ToString();

                                                            var resultPoint = new
                                                            {
                                                                action = "betResult",
                                                                betBtn = "player_btn",
                                                                betPoint = Math.Floor(item.bettingPoint.player_btn * 100) / 100,
                                                                totPoint = Math.Floor(item.bettingPoint.totPoint * 10) / 10,
                                                                showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                                user_point = item.user_point,
                                                                status = status
                                                            };
                                                            socket.Send(JsonConvert.SerializeObject(resultPoint));

                                                            var betInfoSend = new
                                                            {
                                                                action = "AllBetTotPoint",
                                                                allBetPoint = betInfoTotPoint,
                                                                status = status
                                                            };
                                                            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend)));


                                                            break;
                                                        case "playerPair_btn":

                                                            //是否啟用對子押注
                                                            if (nowGameShowPairBet == false)
                                                            {
                                                                //不能押注
                                                                break;
                                                            }

                                                            //是否第一筆押注為餘分
                                                            if ((string)jobject["betPoint"] == "餘分")
                                                            {
                                                                int[] sortChip = sortChip_All();

                                                                if (sortChip == null || sortChip.Count() == 0)
                                                                {
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % 0) * 100) / 100;
                                                                }
                                                                else
                                                                {
                                                                    Array.Sort(sortChip);
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;
                                                                }

                                                                //判斷是不是最後一把
                                                                if (!(item.bettingPoint.playerPair_btn > 0) && !(item.user_point - (double)jobject["betPoint"] <= 0))
                                                                {
                                                                    //請先押最低分
                                                                    var BetToMin = new
                                                                    {
                                                                        action = "PointToBetMin",
                                                                        status = status
                                                                    };
                                                                    socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                    break;
                                                                }
                                                                else
                                                                {
                                                                    //int[] sortChip = new int[] { game_settingObj.BettingSetting.Denomination1, game_settingObj.BettingSetting.Denomination2, game_settingObj.BettingSetting.Denomination3,
                                                                    //                 game_settingObj.BettingSetting.Denomination4, game_settingObj.BettingSetting.Denomination5 };
                                                                    //Array.Sort(sortChip);
                                                                    //jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;

                                                                    if ((double)jobject["betPoint"] == 0)
                                                                    {
                                                                        //目前尚無餘分
                                                                        var BetToMin = new
                                                                        {
                                                                            action = "NotRemaining",
                                                                            status = status
                                                                        };
                                                                        socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                        break;
                                                                    }
                                                                    else
                                                                    {
                                                                        //標記餘分籌碼
                                                                        item.bettingPoint.playerP_R = true;
                                                                    }
                                                                }
                                                            }
                                                            if ((string)jobject["betPoint"] == "Max" || (string)jobject["betPoint"] == "NaN")
                                                            {
                                                                if (game_settingObj.BettingSetting2.PlayerPairMax == 0 || (item.user_point - game_settingObj.BettingSetting2.PlayerPairMax <= 0))
                                                                {
                                                                    //如果最高限額為無限時,押下全部的分數
                                                                    //如果分數不足最高限額則押下全部的分數
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                                else
                                                                {
                                                                    jobject["betPoint"] = game_settingObj.BettingSetting2.PlayerPairMax;
                                                                } 
                                                            }

                                                            //餘分可押其他注
                                                            bool lastPointPp = false;
                                                            if (item.user_point - (double)jobject["betPoint"] <= 0)
                                                            {
                                                                //確認此押注前還有押注(限此局)
                                                                if (item.bettingPoint.totPoint > 0)
                                                                {
                                                                    //最後一把
                                                                    //jobject["betPoint"] = ShowRemainingPoint(item.user_point, (double)jobject["betPoint"]);  //取餘分
                                                                    jobject["betPoint"] = item.user_point + 0; //全押

                                                                    //確認此把為餘分
                                                                    if (ShowRemainingPoint(item.user_point) == (double)jobject["betPoint"])
                                                                    {
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            //餘分可押其他注(可押)
                                                                            lastPointPp = true;
                                                                        }
                                                                        else
                                                                        {
                                                                            //餘分不可押其他注
                                                                            //看前一把有沒有押在這裡
                                                                            if (item.bettingPoint.playerPair_btn > 0)
                                                                            {
                                                                                //可押
                                                                            }
                                                                            else
                                                                            {
                                                                                //分數不足
                                                                                var BetToMin = new
                                                                                {
                                                                                    action = "PointCanNotBet",
                                                                                    status = status
                                                                                };
                                                                                socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                                break;
                                                                            }

                                                                        }
                                                                    } 
                                                                }
                                                                else
                                                                {
                                                                    //最後一把可押 
                                                                    lastPointPp = true;
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                            }

                                                            //判斷玩家此押注是否滿足最低押點或超過最大押點
                                                            if ((double)jobject["betPoint"] + item.bettingPoint.playerPair_btn < game_settingObj.BettingSetting2.PlayerPairMin && game_settingObj.BettingSetting2.PlayerPairMin != 0)
                                                            {
                                                                //如果為最後一把則不用補滿
                                                                if (lastPointPp != true)
                                                                { 
                                                                    if (game_settingObj.BettingSetting2.PlayerPairMin > item.user_point)
                                                                    {
                                                                        //看餘分可押其他注有沒有開
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            jobject["betPoint"] = item.user_point + 0; //全押
                                                                        }
                                                                        else
                                                                        {
                                                                            //分數不足
                                                                            var BetToMin = new
                                                                            {
                                                                                action = "PointCanNotBet",
                                                                                status = status
                                                                            };
                                                                            socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                            break;
                                                                        }                                                       
                                                                    }
                                                                    else
                                                                    {
                                                                        //補滿
                                                                        jobject["betPoint"] = game_settingObj.BettingSetting2.PlayerPairMin;
                                                                    }           
                                                                }
                                                            }

                                                            //全場限額為最先考慮,若全場限額<單機限額,則以全場限額為主;若兩者不衝突(全場限額>單機限額),則以單機限額為主
                                                            var shouldBetPp = (double)jobject["betPoint"];

                                                            //是否超過單注最高限額
                                                            if ((shouldBetPp + item.bettingPoint.playerPair_btn) > game_settingObj.BettingSetting2.PlayerPairMax && game_settingObj.BettingSetting2.PlayerPairMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || item.bettingPoint.playerPair_btn == game_settingObj.BettingSetting2.PlayerPairMax)
                                                                {
                                                                    //超過單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBetPp = (game_settingObj.BettingSetting2.PlayerPairMax - item.bettingPoint.playerPair_btn);
                                                            }

                                                            //是否超過單機限額
                                                            if ((shouldBetPp + item.bettingPoint.totPoint) > game_settingObj.BettingSetting2.SingleMachineMax && game_settingObj.BettingSetting2.SingleMachineMax != 0)
                                                            {
                                                                //超過單機押分限額
                                                                SendOverToMaxMsg(socket, "超過本機押分限額!");
                                                                break;
                                                            }

                                                            //是否超過全場單注
                                                            if ((shouldBetPp + betInfoTotPoint.playPairAllBet) > game_settingObj.BettingSetting2.AllPlayerPairMax && game_settingObj.BettingSetting2.AllPlayerPairMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || betInfoTotPoint.playPairAllBet == game_settingObj.BettingSetting2.AllPlayerPairMax)
                                                                {
                                                                    //超過全場單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過全場單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBetPp = (game_settingObj.BettingSetting2.AllPlayerPairMax - item.bettingPoint.playerPair_btn);
                                                            }

                                                            //是否超過全場限額                                                           
                                                            if ((shouldBetPp + GetAllBetPoint()) > game_settingObj.BettingSetting2.AllMax && game_settingObj.BettingSetting2.AllMax != 0)
                                                            {
                                                                //超過全場押分限額
                                                                SendOverToMaxMsg(socket, "超過全場押分限額!");
                                                                break;
                                                            }

                                                            item.bettingPoint.playerPair_btn += (double)shouldBetPp;
                                                            item.bettingPoint.totPoint += (double)shouldBetPp;
                                                            item.user_point -= (double)shouldBetPp;
                                                            item.pre_bettingPoint.playerPair_btn = 0 + item.bettingPoint.playerPair_btn;
                                                            item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;
                                                            betInfoTotPoint.playPairAllBet += (double)shouldBetPp;

                                                            //更新server全場押注分數顯示
                                                            textBox6.Text = allBet_totSum().ToString();
                                                            textBox9.Text = betInfoTotPoint.playPairAllBet.ToString();

                                                            var resultPoint2 = new
                                                            {
                                                                action = "betResult",
                                                                betBtn = "playerPair_btn",
                                                                betPoint = Math.Floor(item.bettingPoint.playerPair_btn * 100) / 100,
                                                                totPoint = Math.Floor(item.bettingPoint.totPoint * 10) / 10,
                                                                showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                                user_point = item.user_point,
                                                                status = status
                                                            };
                                                            socket.Send(JsonConvert.SerializeObject(resultPoint2));

                                                            var betInfoSend2 = new
                                                            {
                                                                action = "AllBetTotPoint",
                                                                allBetPoint = betInfoTotPoint,
                                                                status = status
                                                            };
                                                            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend2)));

                                                            break;
                                                        case "tie_btn":

                                                            //是否第一筆押注為餘分
                                                            if ((string)jobject["betPoint"] == "餘分")
                                                            {
                                                                int[] sortChip = sortChip_All();

                                                                if (sortChip == null || sortChip.Count() == 0)
                                                                {
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % 0) * 100) / 100;
                                                                }
                                                                else
                                                                {
                                                                    Array.Sort(sortChip);
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;
                                                                }

                                                                //判斷是不是最後一把
                                                                if (!(item.bettingPoint.tie_btn > 0) && !(item.user_point - (double)jobject["betPoint"] <= 0))
                                                                {
                                                                    //請先押最低分
                                                                    var BetToMin = new
                                                                    {
                                                                        action = "PointToBetMin",
                                                                        status = status
                                                                    };
                                                                    socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                    break;
                                                                }
                                                                else
                                                                {
                                                                    //int[] sortChip = new int[] { game_settingObj.BettingSetting.Denomination1, game_settingObj.BettingSetting.Denomination2, game_settingObj.BettingSetting.Denomination3,
                                                                    //                 game_settingObj.BettingSetting.Denomination4, game_settingObj.BettingSetting.Denomination5 };
                                                                    //Array.Sort(sortChip);
                                                                    //jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;

                                                                    if ((double)jobject["betPoint"] == 0)
                                                                    {
                                                                        //目前尚無餘分
                                                                        var BetToMin = new
                                                                        {
                                                                            action = "NotRemaining",
                                                                            status = status
                                                                        };
                                                                        socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                        break;
                                                                    }
                                                                    else
                                                                    {
                                                                        //標記餘分籌碼
                                                                        item.bettingPoint.tie_R = true;
                                                                    }
                                                                }
                                                            }
                                                            if ((string)jobject["betPoint"] == "Max" || (string)jobject["betPoint"] == "NaN")
                                                            {
                                                                if (game_settingObj.BettingSetting2.TieNoteMax == 0 || (item.user_point - game_settingObj.BettingSetting2.TieNoteMax <= 0))
                                                                {
                                                                    //如果最高限額為無限時,押下全部的分數
                                                                    //如果分數不足最高限額則押下全部的分數
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                                else
                                                                {
                                                                    jobject["betPoint"] = game_settingObj.BettingSetting2.TieNoteMax;
                                                                }
                                                            }

                                                            //餘分可押其他注
                                                            bool lastPointT = false;
                                                            if (item.user_point - (double)jobject["betPoint"] <= 0)
                                                            {
                                                                //確認此押注前還有押注(限此局)
                                                                if (item.bettingPoint.totPoint > 0)
                                                                {
                                                                    //最後一把
                                                                    //jobject["betPoint"] = ShowRemainingPoint(item.user_point, (double)jobject["betPoint"]);  //取餘分
                                                                    jobject["betPoint"] = item.user_point + 0; //全押

                                                                    //確認此把為餘分
                                                                    if (ShowRemainingPoint(item.user_point) == (double)jobject["betPoint"])
                                                                    {
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            //餘分可押其他注(可押)
                                                                            lastPointT = true;
                                                                        }
                                                                        else
                                                                        {
                                                                            //餘分不可押其他注
                                                                            //看前一把有沒有押在這裡
                                                                            if (item.bettingPoint.tie_btn > 0)
                                                                            {
                                                                                //可押
                                                                            }
                                                                            else
                                                                            {
                                                                                //分數不足
                                                                                var BetToMin = new
                                                                                {
                                                                                    action = "PointCanNotBet",
                                                                                    status = status
                                                                                };
                                                                                socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                                break;
                                                                            }

                                                                        }
                                                                    }
                                                                }
                                                                else
                                                                {
                                                                    //最後一把可押 
                                                                    lastPointT = true;
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                            }

                                                            //判斷玩家此押注是否滿足最低押點或超過最大押點
                                                            if ((double)jobject["betPoint"] + item.bettingPoint.tie_btn < game_settingObj.BettingSetting2.TieNoteMin && game_settingObj.BettingSetting2.TieNoteMin != 0)
                                                            {
                                                                //如果為最後一把則不用補滿
                                                                if (lastPointT != true)
                                                                {                                                                    
                                                                    if (game_settingObj.BettingSetting2.TieNoteMin > item.user_point)
                                                                    {
                                                                        //看餘分可押其他注有沒有開
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            jobject["betPoint"] = item.user_point + 0; //全押
                                                                        }
                                                                        else
                                                                        {
                                                                            //分數不足
                                                                            var BetToMin = new
                                                                            {
                                                                                action = "PointCanNotBet",
                                                                                status = status
                                                                            };
                                                                            socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                            break;
                                                                        }                                                                      
                                                                    }
                                                                    else
                                                                    {
                                                                        //補滿
                                                                        jobject["betPoint"] = game_settingObj.BettingSetting2.TieNoteMin;
                                                                    }
                                                                }
                                                            }

                                                            //全場限額
                                                            var shouldBetT = (double)jobject["betPoint"];

                                                            //是否超過單注最高限額
                                                            if ((shouldBetT + item.bettingPoint.tie_btn) > game_settingObj.BettingSetting2.TieNoteMax && game_settingObj.BettingSetting2.TieNoteMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || item.bettingPoint.tie_btn == game_settingObj.BettingSetting2.TieNoteMax)
                                                                {
                                                                    //超過單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBetT = (game_settingObj.BettingSetting2.TieNoteMax - item.bettingPoint.tie_btn);
                                                            }

                                                            //是否超過單機限額
                                                            if ((shouldBetT + item.bettingPoint.totPoint) > game_settingObj.BettingSetting2.SingleMachineMax && game_settingObj.BettingSetting2.SingleMachineMax != 0)
                                                            {
                                                                //超過單機押分限額
                                                                SendOverToMaxMsg(socket, "超過本機押分限額!");
                                                                break;
                                                            }

                                                            //是否超過全場單注
                                                            if ((shouldBetT + betInfoTotPoint.tieAllBet) > game_settingObj.BettingSetting2.AllTieNoteMax && game_settingObj.BettingSetting2.AllTieNoteMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || betInfoTotPoint.tieAllBet == game_settingObj.BettingSetting2.AllTieNoteMax)
                                                                {
                                                                    //超過全場單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過全場單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBetT = (game_settingObj.BettingSetting2.AllTieNoteMax - item.bettingPoint.tie_btn);
                                                            }

                                                            //是否超過全場限額                                                           
                                                            if ((shouldBetT + GetAllBetPoint()) > game_settingObj.BettingSetting2.AllMax && game_settingObj.BettingSetting2.AllMax != 0)
                                                            {
                                                                //超過全場押分限額
                                                                SendOverToMaxMsg(socket, "超過全場押分限額!");
                                                                break;
                                                            }

                                                            item.bettingPoint.tie_btn += (double)shouldBetT;
                                                            item.bettingPoint.totPoint += (double)shouldBetT;
                                                            item.user_point -= (double)shouldBetT;
                                                            item.pre_bettingPoint.tie_btn = 0 + item.bettingPoint.tie_btn;
                                                            item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;
                                                            betInfoTotPoint.tieAllBet += (double)shouldBetT;

                                                            //更新server全場押注分數顯示
                                                            textBox6.Text = allBet_totSum().ToString();
                                                            textBox11.Text = betInfoTotPoint.tieAllBet.ToString();

                                                            var resultPoint3 = new
                                                            {
                                                                action = "betResult",
                                                                betBtn = "tie_btn",
                                                                betPoint = Math.Floor(item.bettingPoint.tie_btn * 100) / 100,
                                                                totPoint = Math.Floor(item.bettingPoint.totPoint * 10) / 10,
                                                                showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                                user_point = item.user_point,
                                                                status = status
                                                            };
                                                            socket.Send(JsonConvert.SerializeObject(resultPoint3));

                                                            var betInfoSend3 = new
                                                            {
                                                                action = "AllBetTotPoint",
                                                                allBetPoint = betInfoTotPoint,
                                                                status = status
                                                            };
                                                            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend3)));

                                                            break;
                                                        case "bankerPair_btn":

                                                            //是否啟用對子押注
                                                            if (nowGameShowPairBet == false)
                                                            {
                                                                //不能押注
                                                                break;
                                                            }

                                                            //是否第一筆押注為餘分
                                                            if ((string)jobject["betPoint"] == "餘分")
                                                            {
                                                                int[] sortChip = sortChip_All();

                                                                if (sortChip == null || sortChip.Count() == 0)
                                                                {
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % 0) * 100) / 100;
                                                                }
                                                                else
                                                                {
                                                                    Array.Sort(sortChip);
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;
                                                                }

                                                                if (!(item.bettingPoint.bankerPair_btn > 0) && !(item.user_point - (double)jobject["betPoint"] <= 0))
                                                                {
                                                                    //請先押最低分
                                                                    var BetToMin = new
                                                                    {
                                                                        action = "PointToBetMin",
                                                                        status = status
                                                                    };
                                                                    socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                    break;
                                                                }
                                                                else
                                                                {
                                                                    //int[] sortChip = new int[] { game_settingObj.BettingSetting.Denomination1, game_settingObj.BettingSetting.Denomination2, game_settingObj.BettingSetting.Denomination3,
                                                                    //                 game_settingObj.BettingSetting.Denomination4, game_settingObj.BettingSetting.Denomination5 };
                                                                    //Array.Sort(sortChip);
                                                                    //jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;

                                                                    if ((double)jobject["betPoint"] == 0)
                                                                    {
                                                                        //目前尚無餘分
                                                                        var BetToMin = new
                                                                        {
                                                                            action = "NotRemaining",
                                                                            status = status
                                                                        };
                                                                        socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                        break;
                                                                    }
                                                                    else
                                                                    {
                                                                        //標記餘分籌碼
                                                                        item.bettingPoint.bankerP_R = true;
                                                                    }
                                                                }
                                                            }
                                                            if ((string)jobject["betPoint"] == "Max" || (string)jobject["betPoint"] == "NaN")
                                                            {
                                                                if (game_settingObj.BettingSetting2.BankerPairMax == 0 || (item.user_point - game_settingObj.BettingSetting2.BankerPairMax <= 0))
                                                                {
                                                                    //如果最高限額為無限時,押下全部的分數
                                                                    //如果分數不足最高限額則押下全部的分數
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                                else
                                                                {
                                                                    jobject["betPoint"] = game_settingObj.BettingSetting2.BankerPairMax;
                                                                }
                                                            }

                                                            //餘分可押其他注
                                                            bool lastPointBp = false;
                                                            if (item.user_point - (double)jobject["betPoint"] <= 0)
                                                            {
                                                                //確認此押注前還有押注(限此局)
                                                                if (item.bettingPoint.totPoint > 0)
                                                                {
                                                                    //最後一把
                                                                    //jobject["betPoint"] = ShowRemainingPoint(item.user_point, (double)jobject["betPoint"]);  //取餘分
                                                                    jobject["betPoint"] = item.user_point + 0; //全押

                                                                    //確認此把為餘分
                                                                    if (ShowRemainingPoint(item.user_point) == (double)jobject["betPoint"])
                                                                    {
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            //餘分可押其他注(可押)
                                                                            lastPointBp = true;
                                                                        }
                                                                        else
                                                                        {
                                                                            //餘分不可押其他注
                                                                            //看前一把有沒有押在這裡
                                                                            if (item.bettingPoint.bankerPair_btn > 0)
                                                                            {
                                                                                //可押
                                                                            }
                                                                            else
                                                                            {
                                                                                //分數不足
                                                                                var BetToMin = new
                                                                                {
                                                                                    action = "PointCanNotBet",
                                                                                    status = status
                                                                                };
                                                                                socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                                break;
                                                                            }

                                                                        }
                                                                    }
                                                                }
                                                                else
                                                                {
                                                                    //最後一把可押 
                                                                    lastPointBp = true;
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                            }

                                                            //判斷玩家此押注是否滿足最低押點或超過最大押點
                                                            if ((double)jobject["betPoint"] + item.bettingPoint.bankerPair_btn < game_settingObj.BettingSetting2.BankerPairMin && game_settingObj.BettingSetting2.BankerPairMin != 0)
                                                            {
                                                                //如果為最後一把則不用補滿
                                                                if (lastPointBp != true)
                                                                {                                                                   
                                                                    if (game_settingObj.BettingSetting2.BankerPairMin > item.user_point)
                                                                    {
                                                                        //看餘分可押其他注有沒有開
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            jobject["betPoint"] = item.user_point + 0; //全押
                                                                        }
                                                                        else
                                                                        {
                                                                            //分數不足
                                                                            var BetToMin = new
                                                                            {
                                                                                action = "PointCanNotBet",
                                                                                status = status
                                                                            };
                                                                            socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                            break;
                                                                        }
                                                                    }
                                                                    else
                                                                    {
                                                                        //補滿
                                                                        jobject["betPoint"] = game_settingObj.BettingSetting2.BankerPairMin;
                                                                    }
                                                                }
                                                            }

                                                            //全場限額為最先考慮,若全場限額<單機限額,則以全場限額為主;若兩者不衝突(全場限額>單機限額),則以單機限額為主
                                                            var shouldBetBp = (double)jobject["betPoint"];

                                                            //是否超過單注最高限額
                                                            if ((shouldBetBp + item.bettingPoint.bankerPair_btn) > game_settingObj.BettingSetting2.BankerPairMax && game_settingObj.BettingSetting2.BankerPairMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || item.bettingPoint.bankerPair_btn == game_settingObj.BettingSetting2.BankerPairMax)
                                                                {
                                                                    //超過單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBetBp = (game_settingObj.BettingSetting2.BankerPairMax - item.bettingPoint.bankerPair_btn);
                                                            }

                                                            //是否超過單機限額
                                                            if ((shouldBetBp + item.bettingPoint.totPoint) > game_settingObj.BettingSetting2.SingleMachineMax && game_settingObj.BettingSetting2.SingleMachineMax != 0)
                                                            {
                                                                //超過單機押分限額
                                                                SendOverToMaxMsg(socket, "超過本機押分限額!");
                                                                break;
                                                            }

                                                            //是否超過全場單注
                                                            if ((shouldBetBp + betInfoTotPoint.bankPairAllBet) > game_settingObj.BettingSetting2.AllBankerPairMax && game_settingObj.BettingSetting2.AllBankerPairMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || betInfoTotPoint.bankPairAllBet == game_settingObj.BettingSetting2.AllBankerPairMax)
                                                                {
                                                                    //超過全場單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過全場單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBetBp = (game_settingObj.BettingSetting2.AllBankerPairMax - item.bettingPoint.bankerPair_btn);
                                                            }

                                                            //是否超過全場限額                                                           
                                                            if ((shouldBetBp + GetAllBetPoint()) > game_settingObj.BettingSetting2.AllMax && game_settingObj.BettingSetting2.AllMax != 0)
                                                            {
                                                                //超過全場押分限額
                                                                SendOverToMaxMsg(socket, "超過全場押分限額!");
                                                                break;
                                                            }


                                                            item.bettingPoint.bankerPair_btn += (double)shouldBetBp;
                                                            item.bettingPoint.totPoint += (double)shouldBetBp;
                                                            item.user_point -= (double)shouldBetBp;
                                                            item.pre_bettingPoint.bankerPair_btn = 0 + item.bettingPoint.bankerPair_btn;
                                                            item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;
                                                            betInfoTotPoint.bankPairAllBet += (double)shouldBetBp;

                                                            //更新server全場押注分數顯示
                                                            textBox6.Text = allBet_totSum().ToString();
                                                            textBox12.Text = betInfoTotPoint.bankPairAllBet.ToString();

                                                            var resultPoint4 = new
                                                            {
                                                                action = "betResult",
                                                                betBtn = "bankerPair_btn",
                                                                betPoint = Math.Floor(item.bettingPoint.bankerPair_btn * 100) / 100,
                                                                totPoint = Math.Floor(item.bettingPoint.totPoint * 10) / 10,
                                                                showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                                user_point = item.user_point,
                                                                status = status
                                                            };
                                                            socket.Send(JsonConvert.SerializeObject(resultPoint4));

                                                            var betInfoSend4 = new
                                                            {
                                                                action = "AllBetTotPoint",
                                                                allBetPoint = betInfoTotPoint,
                                                                status = status
                                                            };
                                                            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend4)));

                                                            break;
                                                        case "banker_btn":

                                                            //是否第一筆押注為餘分
                                                            if ((string)jobject["betPoint"] == "餘分")
                                                            {
                                                                int[] sortChip = sortChip_All();

                                                                if (sortChip == null || sortChip.Count() == 0)
                                                                {
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % 0) * 100) / 100;
                                                                }
                                                                else
                                                                {
                                                                    Array.Sort(sortChip);
                                                                    jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;
                                                                }

                                                                //判斷是不是最後一把
                                                                if (!(item.bettingPoint.banker_btn > 0) && !(item.user_point - (double)jobject["betPoint"] <= 0))
                                                                {
                                                                    //請先押最低分
                                                                    var BetToMin = new
                                                                    {
                                                                        action = "PointToBetMin",
                                                                        status = status
                                                                    };
                                                                    socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                    break;
                                                                }
                                                                else
                                                                {
                                                                    //int[] sortChip = new int[] { game_settingObj.BettingSetting.Denomination1, game_settingObj.BettingSetting.Denomination2, game_settingObj.BettingSetting.Denomination3,
                                                                    //                 game_settingObj.BettingSetting.Denomination4, game_settingObj.BettingSetting.Denomination5 };
                                                                    //Array.Sort(sortChip);
                                                                    //jobject["betPoint"] = Math.Floor((item.user_point % sortChip[0]) * 100) / 100;

                                                                    if ((double)jobject["betPoint"] == 0)
                                                                    {
                                                                        //目前尚無餘分
                                                                        var BetToMin = new
                                                                        {
                                                                            action = "NotRemaining",
                                                                            status = status
                                                                        };
                                                                        socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                        break;
                                                                    }
                                                                    else
                                                                    {
                                                                        //標記餘分籌碼
                                                                        item.bettingPoint.banker_R = true;
                                                                    }
                                                                }
                                                            }
                                                            if ((string)jobject["betPoint"] == "Max" || (string)jobject["betPoint"] == "NaN")
                                                            {
                                                                if (game_settingObj.BettingSetting2.SingleNoteMax == 0 || (item.user_point - game_settingObj.BettingSetting2.SingleNoteMax <= 0))
                                                                {
                                                                    //如果最高限額為無限時,押下全部的分數
                                                                    //如果分數不足最高限額則押下全部的分數
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                                else
                                                                {
                                                                    jobject["betPoint"] = game_settingObj.BettingSetting2.SingleNoteMax;
                                                                }
                                                            }

                                                            //判斷是否啟用莊閒只能押一邊
                                                            if (game_settingObj.FeaturesSetting.PBOnlyOne == true)
                                                            {
                                                                //判斷閒家是否有押分
                                                                if (item.bettingPoint.player_btn > 0)
                                                                {
                                                                    var notBet = new
                                                                    {
                                                                        action = "PBOnlyOne",
                                                                        status = status
                                                                    };
                                                                    socket.Send(JsonConvert.SerializeObject(notBet));
                                                                    break;
                                                                }
                                                            }

                                                            //餘分可押其他注
                                                            bool lastPointB = false;
                                                            if (item.user_point - (double)jobject["betPoint"] <= 0)
                                                            {
                                                                //確認此押注前還有押注(限此局)
                                                                if (item.bettingPoint.totPoint > 0)
                                                                {
                                                                    //最後一把
                                                                    //jobject["betPoint"] = ShowRemainingPoint(item.user_point, (double)jobject["betPoint"]);  //取餘分
                                                                    jobject["betPoint"] = item.user_point + 0; //全押

                                                                    //確認此把為餘分
                                                                    if (ShowRemainingPoint(item.user_point) == (double)jobject["betPoint"])
                                                                    {
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            //餘分可押其他注(可押)
                                                                            lastPointB = true;
                                                                        }
                                                                        else
                                                                        {
                                                                            //餘分不可押其他注
                                                                            //看前一把有沒有押在這裡
                                                                            if (item.bettingPoint.banker_btn > 0)
                                                                            {
                                                                                //可押
                                                                            }
                                                                            else
                                                                            {
                                                                                //分數不足
                                                                                var BetToMin = new
                                                                                {
                                                                                    action = "PointCanNotBet",
                                                                                    status = status
                                                                                };
                                                                                socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                                break;
                                                                            }

                                                                        }
                                                                    }
                                                                }
                                                                else
                                                                {
                                                                    //最後一把可押 
                                                                    lastPointB = true;
                                                                    jobject["betPoint"] = item.user_point;
                                                                }
                                                            }

                                                            //判斷玩家此押注是否滿足最低押點或超過最大押點
                                                            if ((double)jobject["betPoint"] + item.bettingPoint.banker_btn < game_settingObj.BettingSetting2.SingleNoteMin && game_settingObj.BettingSetting2.SingleNoteMin != 0)
                                                            {
                                                                //如果為最後一把則不用補滿
                                                                if (lastPointB != true)
                                                                {                                                                
                                                                    if (game_settingObj.BettingSetting2.SingleNoteMin > item.user_point)
                                                                    {
                                                                        //看餘分可押其他注有沒有開
                                                                        if (game_settingObj.FeaturesSetting.RemainingPointCanOther == true)
                                                                        {
                                                                            jobject["betPoint"] = item.user_point + 0; //全押
                                                                        }
                                                                        else
                                                                        {
                                                                            //分數不足
                                                                            var BetToMin = new
                                                                            {
                                                                                action = "PointCanNotBet",
                                                                                status = status
                                                                            };
                                                                            socket.Send(JsonConvert.SerializeObject(BetToMin));
                                                                            break;
                                                                        }                                                                       
                                                                    }
                                                                    else
                                                                    {
                                                                        //補滿
                                                                        jobject["betPoint"] = game_settingObj.BettingSetting2.SingleNoteMin;
                                                                    }
                                                                }
                                                            }

                                                            //全場限額為最先考慮,若全場限額<單機限額,則以全場限額為主;若兩者不衝突(全場限額>單機限額),則以單機限額為主
                                                            var shouldBetB = (double)jobject["betPoint"];

                                                            //是否超過單注最高限額
                                                            if ((shouldBetB + item.bettingPoint.banker_btn) > game_settingObj.BettingSetting2.SingleNoteMax && game_settingObj.BettingSetting2.SingleNoteMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || item.bettingPoint.banker_btn == game_settingObj.BettingSetting2.SingleNoteMax)
                                                                {
                                                                    //超過單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBetB = (game_settingObj.BettingSetting2.SingleNoteMax - item.bettingPoint.banker_btn);
                                                            }

                                                            //是否超過單機限額
                                                            if ((shouldBetB + item.bettingPoint.totPoint) > game_settingObj.BettingSetting2.SingleMachineMax && game_settingObj.BettingSetting2.SingleMachineMax != 0)
                                                            {
                                                                //超過單機押分限額
                                                                SendOverToMaxMsg(socket, "超過本機押分限額!");
                                                                break;
                                                            }

                                                            //是否超過全場單注
                                                            if ((shouldBetB + betInfoTotPoint.bankerAllBet) > game_settingObj.BettingSetting2.AllPlayerBankerMax && game_settingObj.BettingSetting2.AllPlayerBankerMax != 0)
                                                            {
                                                                //押注超過限額無效是否啟用
                                                                if (game_settingObj.BettingSetting2.BetOverInvalid == true || betInfoTotPoint.bankerAllBet == game_settingObj.BettingSetting2.AllPlayerBankerMax)
                                                                {
                                                                    //超過全場單門押分限額
                                                                    SendOverToMaxMsg(socket, "超過全場單門押分限額!");
                                                                    break;
                                                                }
                                                                //自動補滿成單注
                                                                shouldBetB = (game_settingObj.BettingSetting2.AllPlayerBankerMax - item.bettingPoint.banker_btn);
                                                            }

                                                            //是否超過全場限額                                                           
                                                            if ((shouldBetB + GetAllBetPoint()) > game_settingObj.BettingSetting2.AllMax && game_settingObj.BettingSetting2.AllMax != 0)
                                                            {
                                                                //超過全場押分限額
                                                                SendOverToMaxMsg(socket, "超過全場押分限額!");
                                                                break;
                                                            }

                                                            item.bettingPoint.banker_btn += (double)shouldBetB;
                                                            item.bettingPoint.totPoint += (double)shouldBetB;
                                                            item.user_point -= (double)shouldBetB;
                                                            item.pre_bettingPoint.banker_btn = 0 + item.bettingPoint.banker_btn;
                                                            item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;
                                                            betInfoTotPoint.bankerAllBet += (double)shouldBetB;

                                                            //更新server全場押注分數顯示
                                                            textBox6.Text = allBet_totSum().ToString();
                                                            textBox12.Text = betInfoTotPoint.bankerAllBet.ToString();

                                                            var resultPoint5 = new
                                                            {
                                                                action = "betResult",
                                                                betBtn = "banker_btn",
                                                                betPoint = Math.Floor(item.bettingPoint.banker_btn * 100) / 100,
                                                                totPoint = Math.Floor(item.bettingPoint.totPoint * 10) / 10,
                                                                showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                                user_point = item.user_point,
                                                                status = status
                                                            };
                                                            socket.Send(JsonConvert.SerializeObject(resultPoint5));

                                                            var betInfoSend5 = new
                                                            {
                                                                action = "AllBetTotPoint",
                                                                allBetPoint = betInfoTotPoint,
                                                                status = status
                                                            };
                                                            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend5)));

                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }

                                            }
                                            else
                                            {
                                                //分數不足
                                                var notBetresult = new
                                                {
                                                    action = "PointCanNotBet"
                                                };
                                                socket.Send(JsonConvert.SerializeObject(notBetresult));
                                            }
                                        }
                                        else
                                        {
                                            //未登入不得押分
                                            var notBetresult = new
                                            {
                                                action = "cannotBet"
                                            };
                                            socket.Send(JsonConvert.SerializeObject(notBetresult));
                                        }
                                    }
                                }
                                break;
                            case "retireBetOne":
                                //只退押其中一個
                                foreach (var item in memberList)
                                {
                                    if (socket == item.user_socket)
                                    {
                                        if (!String.IsNullOrEmpty(item.account))
                                        {
                                            switch ((string)jobject["betBtn"])
                                            {
                                                case "player_btn":
                                                    item.bettingPoint.player_R = false;
                                                    betInfoTotPoint.playerAllBet -= item.bettingPoint.player_btn;
                                                    item.bettingPoint.totPoint -= item.bettingPoint.player_btn;
                                                    item.user_point += item.bettingPoint.player_btn;
                                                    item.bettingPoint.player_btn = 0;
                                                    item.pre_bettingPoint.player_btn = 0;
                                                    item.pre_bettingPoint.player_btn = 0 + item.bettingPoint.player_btn;
                                                    item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;

                                                    //更新server全場押注分數顯示
                                                    textBox6.Text = allBet_totSum().ToString();
                                                    textBox8.Text = betInfoTotPoint.playerAllBet.ToString();

                                                    var resultPoint = new
                                                    {
                                                        action = "RetireBetOne",
                                                        betBtn = "player_btn",
                                                        totPoint = item.bettingPoint.totPoint,
                                                        showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                        user_point = item.user_point,
                                                        status = status
                                                    };
                                                    socket.Send(JsonConvert.SerializeObject(resultPoint));

                                                    var betInfoSend = new
                                                    {
                                                        action = "AllBetTotPoint",
                                                        allBetPoint = betInfoTotPoint,
                                                        status = status
                                                    };
                                                    allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend)));

                                                    break;
                                                case "playerPair_btn":
                                                    item.bettingPoint.playerP_R = false;
                                                    betInfoTotPoint.playPairAllBet -= item.bettingPoint.playerPair_btn;
                                                    item.bettingPoint.totPoint -= item.bettingPoint.playerPair_btn;
                                                    item.user_point += item.bettingPoint.playerPair_btn;
                                                    item.bettingPoint.playerPair_btn = 0;
                                                    item.pre_bettingPoint.playerPair_btn = 0;
                                                    item.pre_bettingPoint.playerPair_btn = 0 + item.bettingPoint.playerPair_btn;
                                                    item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;

                                                    //更新server全場押注分數顯示
                                                    textBox6.Text = allBet_totSum().ToString();
                                                    textBox9.Text = betInfoTotPoint.playPairAllBet.ToString();

                                                    var resultPoint2 = new
                                                    {
                                                        action = "RetireBetOne",
                                                        betBtn = "playerPair_btn",
                                                        totPoint = item.bettingPoint.totPoint,
                                                        showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                        user_point = item.user_point,
                                                        status = status
                                                    };
                                                    socket.Send(JsonConvert.SerializeObject(resultPoint2));

                                                    var betInfoSend2 = new
                                                    {
                                                        action = "AllBetTotPoint",
                                                        allBetPoint = betInfoTotPoint,
                                                        status = status
                                                    };
                                                    allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend2)));

                                                    break;
                                                case "tie_btn":
                                                    item.bettingPoint.tie_R = false;
                                                    betInfoTotPoint.tieAllBet -= item.bettingPoint.tie_btn;
                                                    item.bettingPoint.totPoint -= item.bettingPoint.tie_btn;
                                                    item.user_point += item.bettingPoint.tie_btn;
                                                    item.bettingPoint.tie_btn = 0;
                                                    item.pre_bettingPoint.tie_btn = 0;
                                                    item.pre_bettingPoint.tie_btn = 0 + item.bettingPoint.tie_btn;
                                                    item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;

                                                    //更新server全場押注分數顯示
                                                    textBox6.Text = allBet_totSum().ToString();
                                                    textBox11.Text = betInfoTotPoint.tieAllBet.ToString();

                                                    var resultPoint3 = new
                                                    {
                                                        action = "RetireBetOne",
                                                        betBtn = "tie_btn",
                                                        totPoint = item.bettingPoint.totPoint,
                                                        showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                        user_point = item.user_point,
                                                        status = status
                                                    };
                                                    socket.Send(JsonConvert.SerializeObject(resultPoint3));

                                                    var betInfoSend3 = new
                                                    {
                                                        action = "AllBetTotPoint",
                                                        allBetPoint = betInfoTotPoint,
                                                        status = status
                                                    };
                                                    allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend3)));

                                                    break;
                                                case "bankerPair_btn":
                                                    item.bettingPoint.bankerP_R = false;
                                                    betInfoTotPoint.bankPairAllBet -= item.bettingPoint.bankerPair_btn;
                                                    item.bettingPoint.totPoint -= item.bettingPoint.bankerPair_btn;
                                                    item.user_point += item.bettingPoint.bankerPair_btn;
                                                    item.bettingPoint.bankerPair_btn = 0;
                                                    item.pre_bettingPoint.bankerPair_btn = 0;
                                                    item.pre_bettingPoint.bankerPair_btn = 0 + item.bettingPoint.bankerPair_btn;
                                                    item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;

                                                    //更新server全場押注分數顯示
                                                    textBox6.Text = allBet_totSum().ToString();
                                                    textBox12.Text = betInfoTotPoint.bankPairAllBet.ToString();

                                                    var resultPoint4 = new
                                                    {
                                                        action = "RetireBetOne",
                                                        betBtn = "bankerPair_btn",
                                                        totPoint = item.bettingPoint.totPoint,
                                                        showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                        user_point = item.user_point,
                                                        status = status
                                                    };
                                                    socket.Send(JsonConvert.SerializeObject(resultPoint4));

                                                    var betInfoSend4 = new
                                                    {
                                                        action = "AllBetTotPoint",
                                                        allBetPoint = betInfoTotPoint,
                                                        status = status
                                                    };
                                                    allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend4)));

                                                    break;
                                                case "banker_btn":
                                                    item.bettingPoint.banker_R = false;
                                                    betInfoTotPoint.bankerAllBet -= item.bettingPoint.banker_btn;
                                                    item.bettingPoint.totPoint -= item.bettingPoint.banker_btn;
                                                    item.user_point += item.bettingPoint.banker_btn;
                                                    item.bettingPoint.banker_btn = 0;
                                                    item.pre_bettingPoint.banker_btn = 0;
                                                    item.pre_bettingPoint.banker_btn = 0 + item.bettingPoint.banker_btn;
                                                    item.pre_bettingPoint.totPoint = 0 + item.bettingPoint.totPoint;

                                                    //更新server全場押注分數顯示
                                                    textBox6.Text = allBet_totSum().ToString();
                                                    textBox13.Text = betInfoTotPoint.bankerAllBet.ToString();

                                                    var resultPoint5 = new
                                                    {
                                                        action = "RetireBetOne",
                                                        betBtn = "banker_btn",
                                                        totPoint = item.bettingPoint.totPoint,
                                                        showUser_point = Math.Floor(item.user_point * 10) / 10,
                                                        user_point = item.user_point,
                                                        status = status
                                                    };
                                                    socket.Send(JsonConvert.SerializeObject(resultPoint5));

                                                    var betInfoSend5 = new
                                                    {
                                                        action = "AllBetTotPoint",
                                                        allBetPoint = betInfoTotPoint,
                                                        status = status
                                                    };
                                                    allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(betInfoSend5)));

                                                    break;
                                                default:
                                                    break;
                                            }
                                        }
                                    }
                                }
                                break;
                            
                            default:
                                break;
                        }


                    };
                }
            );

            Self = this;
            BetTime = game_settingObj.GameTime.BettingTime;
            stopBtn.Enabled = false;
        }



        /**
         * 1. 起初打開視窗時,可用的按鈕為startBtn, settingBtn 其餘皆不啟用
         * 2. startBtn 點擊時 stopBtn, endBtn 按鈕啟用, startBtn 不啟用
         * 3. stopBtn 點擊時 startBtn, endBtn 按鈕啟用, stopBtn 不啟用
         * 4. endBtn 點擊時 startBtn, startBtn 按鈕啟用, endBtn 不啟用
         */



        private void settingBtn_Click(object sender, EventArgs e)
        {
            ServerSetting SettingForm = new ServerSetting();   //產生Form2的物件，才可以使用它所提供的Method

            //設定Form2為Form1的上層，並開啟Form2視窗。由於在Form1的程式碼內使用this，所以this為Form1的物件本身
            SettingForm.ShowDialog(this);
        }

        /**
         * 1.websocket連線時傳送開始押注時間,計時押注
         * 
         */
        private void startBtn_Click(object sender, EventArgs e)
        {
            startBtn.Enabled = false;
            EndingBtn.Enabled = true;
            gameEnd = false;
            status2 = "";

            backgroundWorker1.RunWorkerAsync();

        }

        //private void stopBtn_Click(object sender, EventArgs e)
        //{
        //    gameStop = true;
        //    startBtn.Enabled = true;
        //    stopBtn.Enabled = false;
        //    EndingBtn.Enabled = false;
        //}

        private void EndingBtn_Click(object sender, EventArgs e)
        {
            gameEnd = true;
            //startBtn.Enabled = true;
            EndingBtn.Enabled = false;
            status2 = "endGame";
        }

        private void dgvTest_MouseClick(object sender, MouseEventArgs e)
        {
            DataGridView dgv = sender as DataGridView;

            //現在滑鼠位置的行列信息
            int col = dgv.HitTest(e.X, e.Y).ColumnIndex;
            int row = dgv.HitTest(e.X, e.Y).RowIndex;

            //右键彈出菜單
            if (e.Button == System.Windows.Forms.MouseButtons.Right)
            {

                if (row < 0)
                {
                    return;
                }
                else
                {
                    //取消选中当前所有选中的行和单元格
                    for (int i = 0; i < dgv.Rows.Count; i++)
                    {
                        dgv.Rows[i].Selected = false;
                        for (int j = 0; j < dgv.Columns.Count; j++)
                        {
                            dgv.Rows[i].Cells[j].Selected = false;
                        }
                    }
                    //选中当前鼠标所在的行
                    dgv.Rows[row].Selected = true;
                }


                //選中當前鼠標所在的行
                dgv.Rows[row].Selected = true;

                //建立快捷菜單
                ContextMenuStrip contextMenuStrip = new ContextMenuStrip();

                //開分
                ToolStripMenuItem tsmiRemoveCurrentRow = new ToolStripMenuItem("開點");
                tsmiRemoveCurrentRow.Click += (obj, arg) =>
                {
                    OpenPoint OpenPointForm = new OpenPoint();
                    string[] account = dgv.Rows[row].AccessibilityObject.Value.ToString().Split(';');
                    if (!String.IsNullOrEmpty(account[1]))
                    {
                        OpenPointForm.setAccount(account[1]);
                        OpenPointForm.ShowDialog(this);
                    }
                };
                contextMenuStrip.Items.Add(tsmiRemoveCurrentRow);

                //棄分
                ToolStripMenuItem tsmiRemoveAll = new ToolStripMenuItem("棄點");
                tsmiRemoveAll.Click += (obj, arg) =>
                {
                    //dgv.Rows.Clear();
                    ThrowPoint ThrowPointForm = new ThrowPoint();
                    string[] account = dgv.Rows[row].AccessibilityObject.Value.ToString().Split(';');
                    if (!String.IsNullOrEmpty(account[1]))
                    {
                        ThrowPointForm.setAccount(account[1]);
                        ThrowPointForm.ShowDialog(this);
                    }
                    
                };
                contextMenuStrip.Items.Add(tsmiRemoveAll);

                contextMenuStrip.Show(dgv, new Point(e.X, e.Y));
            }



        }

        private void backgroundWorker1_DoWork(object sender, DoWorkEventArgs e)
        {
            this.backgroundWorker1.WorkerReportsProgress = true;
            GameCycle();
        }

        private void GameCycle()
        {
            //遊戲開始
            //傳送押注時間
            //判斷此場次是否結束(新的一場換一副牌)
            //切牌
            /**
             * 1. 1.3發給閒家, 2.4發給莊家
             * 2. PC2.BC2須判斷是否補牌或天.停牌
             * 
             * 
             * 發下第一張,開始記分
             * 當發到第二張牌時加判斷(看是否要繼續發或掉天.停牌)
             * 
             * 0~5 補牌
             * 6~7 不補
             * 8~9 天牌
             * 
             */

            //從資料庫讀出接下來的場次
            string fieldStr = getNextField();
            var fieldR = fieldStr.Split(',');
            game_field = Int32.Parse(fieldR[0]);
            game_round = Int32.Parse(fieldR[1]) + 1;

            //讀出前四場紀錄
            if (game_recordsList == null || game_recordsList.Count == 0)
            {
                getPreRecord_toFour();
            }

            //更換場次
            //if (game_round > game_settingObj.CardTotNum.OpenRound)
            //{
            //    game_round = 1;
            //    game_field += 1;
            //}

            lastGameRecord.field = game_field;
            lastGameRecord.round = game_round;
            //textBox4.Text = lastGameRecord.card.ToString();
            textBox5.Text = lastGameRecord.card + " / 416";
            textBox7.Text = (lastGameRecord.round).ToString();
            textBox15.Text = lastGameRecord.player_win.ToString();
            textBox17.Text = lastGameRecord.tie.ToString();
            textBox20.Text = lastGameRecord.banker_win.ToString();
            textBox16.Text = lastGameRecord.player_pair.ToString();
            textBox21.Text = lastGameRecord.banker_pair.ToString();



            status = "readNowField";
            int betTime = 0;
            int settlementTime = 0;
            var pre_msgBtn = (game_settingObj.MsgSetting.MsgFixed) ? 1 : 2;  //1:固定訊息, 2:週期訊息
            var pre_msg = 0;
            var change_theMsg = 1;
            var pre_cardBtn = (game_settingObj.PukerBack.UseFixedBackBtn) ? 1 : 2;  //1:固定牌背, 2:週期牌背
            var pre_cardBack = 0;
            var change_theCardBack = 1;
            var cutCard_numTime = 0;         //切牌的場次
            var hasCut = false;
            var openRound = lastGameRecord.round;
            createPuker();
            //game_cardBack

            var Start = true;


            //主遊戲循環
            while (Start)
            {
                switch (status)
                {
                    case "readNowField":
                        var change = new SettingValue();

                        //將上場紀錄重置
                        now_gameRecord = new GameRecord();

                        //檢查牌的數量夠不夠這次使用
                        if (puker.Count < 10)
                        {
                            createPuker(); //換牌(現實情況應洗牌)
                            lastGameRecord.card = 0;
                            //textBox5.Text = "0 / 416";
                        }

                        //更換場次,清除路單
                        if (game_round > game_settingObj.CardTotNum.OpenRound /*|| game_round == 1*/)
                        {
                            game_round = 1;
                            game_field +=/* (game_round == 1) ? 0 :*/ 1;
                            createPuker(); //換牌
                            textBox4.Text = "";
                            lastGameRecord = new LastGameRecord();
                            //textBox5.Text = "0 / 416";
                            textBox15.Text = "0";
                            textBox16.Text = "0";
                            textBox17.Text = "0";
                            textBox20.Text = "0";
                            textBox21.Text = "0";

                            //清除路單清單
                            all_wayBillList.Clear();
                        }

                        now_gameRecord.gameRound = game_round;
                        now_gameRecord.gameField = game_field;
                        lastGameRecord.field = game_field;
                        lastGameRecord.round = game_round;
                        textBox1.Text = game_field + "-" + game_round;
                        textBox7.Text = (lastGameRecord.round - 1).ToString();

                        if (game_settingObj.CutCardFeatures.AutoCutCard == true)
                        {
                            cutCard_numTime += 1;
                            if (cutCard_numTime == game_settingObj.CutCardFeatures.Round)
                            {
                                hasCut = true;
                                cutCard_numTime = 0;
                            }
                        }

                        //訊息更換(先判斷是週期或固定)
                        if (game_settingObj.MsgSetting.MsgFixed)
                        {
                            change_theMsg = 0;
                            pre_msgBtn = 1;

                            //直接更換訊息
                            game_msg = change.show_Msg(game_settingObj);
                        }
                        else
                        {
                            var c = change.change_Msg(game_settingObj.MsgSetting.MsgChangeValue);
                            change_theMsg = ((change_theMsg + 1) > c) ? 1 : change_theMsg + 1;

                            //比對這一次的與上一次的設定一不一樣
                            if (pre_msgBtn == 2)
                            {
                                //看是否為換訊息的場次
                                if (change_theMsg == c)
                                {
                                    //與上一次的設定一樣,將訊息接續
                                    pre_msg = (pre_msg > 2) ? 0 : pre_msg;

                                    switch (pre_msg)
                                    {
                                        case 0:
                                            game_msg = game_settingObj.MsgSetting.Msg1;
                                            break;
                                        case 1:
                                            game_msg = game_settingObj.MsgSetting.Msg2;
                                            break;
                                        case 2:
                                            game_msg = game_settingObj.MsgSetting.Msg3;
                                            break;
                                        default:
                                            game_msg = game_settingObj.MsgSetting.Msg1;
                                            break;
                                    }

                                    pre_msg += 1;
                                }

                            }
                            else
                            {
                                //與上一次的設定不一樣,將訊息從第一則開始
                                change_theMsg += 1;
                                pre_msg = 0;
                                game_msg = game_settingObj.MsgSetting.Msg1;
                                pre_msgBtn = 2;
                            }
                        }

                        //每隔幾場更換選取的牌背花色
                        if (pre_cardBtn == 2)
                        {
                            var cB = game_settingObj.PukerBack.ChangeBackRound;
                            change_theCardBack = ((change_theCardBack + 1) > cB) ? 1 : change_theCardBack + 1;
                            Console.WriteLine(change_theCardBack + "," + cB);
                            if (change_theCardBack == cB)
                            {
                                pre_cardBack = (pre_cardBack > 2) ? 0 : pre_cardBack;
                                Console.WriteLine(pre_cardBack);
                                switch (pre_cardBack)
                                {
                                    case 0:
                                        game_cardBack = "back_01";
                                        break;
                                    case 1:
                                        game_cardBack = "back_02";
                                        break;
                                    case 2:
                                        game_cardBack = "back_03";
                                        break;
                                    default:
                                        break;
                                }
                                pre_cardBack += 1;
                            }
                        }


                        var changeField = new {
                            action = "changeField",
                            //開出局數,目前場次
                            game_field = game_field,
                            game_round = game_round,
                            welcomeMsg = game_msg,
                            way_RecordsNum = all_wayBillList.Count,
                            lastGameRecord = (game_round == 1) ? lastGameRecord : null,
                        };

                        allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(changeField)));
                        nowGameShowPairBet = game_settingObj.BettingSetting.TieBet;
                        nowGameChipIndex = game_settingObj.SingleMachine.UseChipsIndex;
                        nowGameBigWayShowP = game_settingObj.SingleMachine.BigWayShowPair;

                        status = "startGame";
                        Thread.Sleep(1000);
                        break;
                    case "startGame":

                        //顯示請押注及籌碼點數 
                        var gameStart = new
                        {
                            action = "StartGame",
                            startBetMsg = "請押分",
                            status = status
                        };

                        allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(gameStart)));
                        //重新讀入押注時間
                        betTime = game_settingObj.GameTime.BettingTime;
                        BetTimes = betTime;

                        textBox28.BackColor = Color.Black;
                        textBox10.BackColor = Color.DarkBlue;
                        status = "bet";
                        Thread.Sleep(2000);
                        break;
                    case "bet":
                        //status = "stopBet";
                        //倒數時間
                        //BetTime = (BetTime == 0) ? 0 : BetTime;

                        if (betTime >= 0)
                        {
                            reciprocalTextBox.Text = betTime.ToString();
                            reciprocalNum(betTime);
                            betTime = betTime - 1;
                            BetTimes = betTime;
                            Thread.Sleep(1000);
                        }
                        else
                        {
                            status = "stopBet";
                        }

                        break;
                    case "stopBet":

                        //停止押注,收回籌碼
                        var stopBet = new
                        {
                            action = "StopBet"
                        };
                        allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(stopBet)));

                        textBox10.BackColor = Color.Black;
                        textBox22.BackColor = Color.DarkBlue;

                        if (hasCut == true)
                        {
                            status = "cutCard";
                        }
                        else
                        {
                            status = "PC1";
                        }
                        
                        Thread.Sleep(2000);
                        break;
                    case "cutCard":
                        //切牌

                        textBox22.BackColor = Color.Black;
                        textBox19.BackColor = Color.DarkBlue;
                        totCut = game_settingObj.CutCardFeatures.Num;
                        for (int i = 0; i < totCut; i++)
                        {
                            puker.RemoveAt(0);
                            nowCutCard = i + 1;
                            lastGameRecord.card += 1;
                            //發送切牌訊息
                            var cutCardResult = new
                            {
                                action = "cutCard",
                                cutCardNum = nowCutCard,
                                totCutNum = totCut
                            };
                            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(cutCardResult)));
                            Thread.Sleep(1000);
                        }

                        hasCut = false;
                        status = "cutCardEnd";
                        break;
                    case "cutCardEnd":
                        //切牌結束
                        var cutCardEnd = new
                        {
                            action = "cutCardEnd"
                        };
                        allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(cutCardEnd)));

                        Thread.Sleep(2000);
                        status = "PC1";
                        break;
                    case "PC1":
                        textBox19.BackColor = Color.Black;
                        textBox22.BackColor = Color.Black;
                        textBox30.BackColor = Color.DarkBlue;

                        //閒家第一張發牌背
                        LincingCard_Back("PC1");
                        now_gameRecord.PC1 = -1;
                        status = "openPC1";
                        break;
                    case "openPC1":
                        //閒家第一張開牌                       
                        LincingCard_Front("PC1");
                        status = "BC1";
                        Thread.Sleep(CardGapTime);
                        break;
                    case "BC1":
                        //莊家第一張發牌背
                        LincingCard_Back("BC1");
                        now_gameRecord.BC1 = -1;
                        status = "openBC1";
                        break;
                    case "openBC1":
                        //莊家第一張開牌
                        LincingCard_Front("BC1");
                        status = "PC2";
                        Thread.Sleep(CardGapTime);
                        break;
                    case "PC2":
                        //閒家第二張發牌背
                        LincingCard_Back("PC2");
                        now_gameRecord.PC2 = -1;
                        status = "openPC2";
                        break;
                    case "openPC2":
                        //閒家第二張開牌
                        LincingCard_Front("PC2");

                        //判斷點數(天牌或停牌)
                        cardNaturalOrStand(Psum, "PC");

                        status = "BC2";
                        Thread.Sleep(CardGapTime);
                        break;
                    case "BC2":
                        //莊家第二張發牌背
                        LincingCard_Back("BC2");
                        now_gameRecord.BC2 = -1;
                        status = "openBC2";
                        break;
                    case "openBC2":
                        //莊家第二張開牌


                        LincingCard_Front("BC2");

                        //判斷點數(天牌或停牌)
                        //判斷閒家是否補牌,否則判斷莊家是否補牌,結算
                        cardNaturalOrStand(Bsum, "BC");

                        if (Psum == 8 || Psum == 9)
                        {
                            status = "settlement";
                        }
                        else
                        {
                            status = "PC3";
                        }

                        Thread.Sleep(CardGapTime);
                        break;
                    case "PC3":

                        //判斷是否補牌
                        if (!(Psum >= 6 && Psum <= 9))
                        {
                            if (Bsum == 8 || Bsum == 9)
                            {
                                status = "BC3";
                            }
                            else
                            {
                                //閒家第三張發牌背                        
                                LincingCard_Back("PC3");
                                now_gameRecord.PC3 = -1;
                                status = "openPC3";
                            }
                        }
                        else
                        {
                            //不補牌
                            status = "BC3";
                        }
                        break;
                    case "openPC3":
                        //閒家第三張開牌
                        LincingCard_Front("PC3");
                        status = "BC3";
                        Thread.Sleep(CardGapTime);
                        break;
                    case "BC3":

                        //判斷是否補牌                 
                        if (Bsum == 9 || Bsum == 8 || Bsum == 7)
                        {
                            //結算
                            status = "settlement";
                        }
                        else
                        {
                            var Psum_Tow = addPoint_result(PukerPoint(now_gameRecord.PC1) + PukerPoint(now_gameRecord.PC2));
                            if ((Bsum >= 3 && Bsum <= 5) && (Psum_Tow == 6 || Psum_Tow == 7))
                            {
                                //莊家第三張發牌背                        
                                LincingCard_Back("BC3");
                                now_gameRecord.BC3 = -1;
                                status = "openBC3";
                            }
                            if (Bsum >= 0 && Bsum <= 2)
                            {
                                //莊家第三張發牌背                        
                                LincingCard_Back("BC3");
                                now_gameRecord.BC3 = -1;
                                status = "openBC3";
                            }
                            else
                            {
                                var PC3point = PukerPoint(now_gameRecord.PC3);
                                if (PC3point != 0)
                                {
                                    switch (Bsum)
                                    {
                                        case 3:
                                            if (PC3point == 8)
                                            {
                                                //結算
                                                status = "settlement";
                                                break;
                                            }
                                            else
                                            {
                                                //莊家第三張發牌背                        
                                                LincingCard_Back("BC3");
                                                now_gameRecord.BC3 = -1;
                                                status = "openBC3";
                                            }
                                            break;
                                        case 4:
                                            if (PC3point == 8 || PC3point == 9 || PC3point == 0 || PC3point == 1)
                                            {
                                                //結算
                                                status = "settlement";
                                            }
                                            else
                                            {
                                                //莊家第三張發牌背                        
                                                LincingCard_Back("BC3");
                                                now_gameRecord.BC3 = -1;
                                                status = "openBC3";
                                            }
                                            break;
                                        case 5:
                                            if (PC3point == 0 || PC3point == 1 || PC3point == 2 || PC3point == 3 || PC3point == 8 || PC3point == 9)
                                            {
                                                //結算
                                                status = "settlement";
                                            }
                                            else
                                            {
                                                //莊家第三張發牌背                        
                                                LincingCard_Back("BC3");
                                                now_gameRecord.BC3 = -1;
                                                status = "openBC3";
                                            }
                                            break;
                                        case 6:
                                            if (PC3point == 6 || PC3point == 7)
                                            {
                                                //莊家第三張發牌背                        
                                                LincingCard_Back("BC3");
                                                now_gameRecord.BC3 = -1;
                                                status = "openBC3";
                                                break;
                                            }
                                            if (Psum_Tow == 6 || Psum_Tow == 7)
                                            {
                                                //結算
                                                status = "settlement";
                                                break;
                                            }
                                            else
                                            {
                                                //結算
                                                status = "settlement";
                                                break;
                                            }
                                        default:
                                            status = "openBC3";
                                            break;
                                    }
                                }
                                else
                                {
                                    if ((Bsum <= 5 && Bsum >= 3) && (Psum_Tow == 6 || Psum_Tow == 7))
                                    {
                                        //開牌
                                        status = "openBC3";
                                        break;
                                    }

                                    if (Bsum == 6 && (Psum_Tow == 6 || Psum_Tow == 7))
                                    {
                                        //結算
                                        status = "settlement";
                                        break;
                                    }

                                    status = "settlement";
                                    break;
                                    ////莊家第三張發牌背                        
                                    //LincingCard_Back("BC3");
                                    //now_gameRecord.BC3 = -1;
                                    //status = "openBC3";
                                }
                            }
                        }


                        break;
                    case "openBC3":
                        //莊家第三張開牌

                        LincingCard_Front("BC3");
                        Thread.Sleep(CardGapTime);
                        status = "settlement";
                        break;
                    case "settlement":

                        textBox30.BackColor = Color.Black;
                        textBox28.BackColor = Color.DarkBlue;

                        settlementTime = game_settingObj.GameTime.SettlementTime;
                        //結算


                        //送出此局結果(server)
                        now_gameRecord.playerSum = Psum;
                        now_gameRecord.bankerSum = Bsum;

                        int winner = gameWinner(Psum, Bsum);
                        now_gameRecord.winner = winner;
                        addNowWayBillPair();

                        //加入路單
                        addNowWayBill();


                        //將所有有登入的使用者的分數進行計算
                        foreach (var item in memberList.ToList())
                        {
                            if (!String.IsNullOrEmpty(item.account))
                            {
                                //送出分數
                                if (item.bettingPoint.totPoint != 0)
                                {
                                    //有押注算分
                                    double TheGameGetPoint = 0;
                                    getBetPointResult userGetPoint = new getBetPointResult();
                                    if (item.bettingPoint.totPoint > 0)
                                    {
                                        //贏家
                                        switch (now_gameRecord.winner)
                                        {
                                            case 1:
                                                var point = item.bettingPoint.player_btn * 2;
                                                //判斷點數顯示(0無, 1四捨五入, 2無條件捨去)
                                                switch (game_settingObj.FeaturesSetting.DecimalPoint)
                                                {
                                                    case 0:
                                                        //取到小數點第二位
                                                        point = Math.Floor(point * 100) / 100;
                                                        break;
                                                    case 1:
                                                        point = Math.Round(point, 0, MidpointRounding.AwayFromZero);
                                                        break;
                                                    case 2:
                                                        point = Math.Floor(point);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                userGetPoint.playerBet = point;
                                                item.bettingPoint.playerBet = point;
                                                TheGameGetPoint += point;
                                                break;
                                            case 2:
                                                var point2 = item.bettingPoint.banker_btn * 1.95;
                                                //判斷點數顯示(0無, 1四捨五入, 2無條件捨去)
                                                switch (game_settingObj.FeaturesSetting.DecimalPoint)
                                                {
                                                    case 0:
                                                        //取到小數點第二位
                                                        point2 = Math.Floor(point2 * 100) / 100;
                                                        break;
                                                    case 1:
                                                        point2 = Math.Round(point2, 0, MidpointRounding.AwayFromZero);
                                                        break;
                                                    case 2:
                                                        //point2 = Convert.ToDouble(Convert.ToInt16(point2));
                                                        point2 = Math.Floor(point2);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                userGetPoint.bankerBet = point2;
                                                item.bettingPoint.bankerBet = point2;
                                                TheGameGetPoint += point2;
                                                break;
                                            case 3:
                                                //開和(需將押閒.莊的點數退還)
                                                var point3 = item.bettingPoint.tie_btn * 9;
                                                //判斷點數顯示(0無, 1四捨五入, 2無條件捨去)
                                                switch (game_settingObj.FeaturesSetting.DecimalPoint)
                                                {
                                                    case 0:
                                                        //取到小數點第二位
                                                        point3 = Math.Floor(point3 * 100) / 100;
                                                        break;
                                                    case 1:
                                                        point3 = Math.Round(point3, 0, MidpointRounding.AwayFromZero);
                                                        break;
                                                    case 2:
                                                        point3 = Math.Floor(point3);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                userGetPoint.tieBet = point3;
                                                item.bettingPoint.tieBet = point3;
                                                TheGameGetPoint += point3;

                                                if (item.bettingPoint.player_btn > 0)
                                                {
                                                    //退閒點
                                                    TheGameGetPoint += item.bettingPoint.player_btn;
                                                }

                                                if (item.bettingPoint.banker_btn > 0)
                                                {
                                                    //退荘點
                                                    TheGameGetPoint += item.bettingPoint.banker_btn;
                                                }

                                                break;
                                            default:
                                                break;
                                        }
                                        //對子
                                        switch (now_gameRecord.pair)
                                        {
                                            case 1:
                                                var point = item.bettingPoint.playerPair_btn * 11;
                                                //判斷點數顯示(0無, 1四捨五入, 2無條件捨去)
                                                switch (game_settingObj.FeaturesSetting.DecimalPoint)
                                                {
                                                    case 0:
                                                        //取到小數點第二位
                                                        point = Math.Floor(point * 100) / 100;
                                                        break;
                                                    case 1:
                                                        point = Math.Round(point, 0, MidpointRounding.AwayFromZero);
                                                        break;
                                                    case 2:
                                                        point = Math.Floor(point);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                userGetPoint.playPairBet = point;
                                                item.bettingPoint.playPairBet = point;
                                                TheGameGetPoint += point;
                                                break;
                                            case 2:
                                                var point2 = item.bettingPoint.bankerPair_btn * 11;
                                                //判斷點數顯示(0無, 1四捨五入, 2無條件捨去)
                                                switch (game_settingObj.FeaturesSetting.DecimalPoint)
                                                {
                                                    case 0:
                                                        //取到小數點第二位
                                                        point2 = Math.Floor(point2 * 100) / 100;
                                                        break;
                                                    case 1:
                                                        point2 = Math.Round(point2, 0, MidpointRounding.AwayFromZero);
                                                        break;
                                                    case 2:
                                                        point2 = Math.Floor(point2);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                userGetPoint.bankPairBet = point2;
                                                item.bettingPoint.bankPairBet = point2;
                                                TheGameGetPoint += point2;
                                                break;
                                            case 3:
                                                var point3 = item.bettingPoint.playerPair_btn * 11;
                                                //判斷點數顯示(0無, 1四捨五入, 2無條件捨去)
                                                switch (game_settingObj.FeaturesSetting.DecimalPoint)
                                                {
                                                    case 3:
                                                        //取到小數點第二位
                                                        point3 = Math.Floor(point3 * 100) / 100;
                                                        break;
                                                    case 1:
                                                        point3 = Math.Round(point3, 0, MidpointRounding.AwayFromZero);
                                                        break;
                                                    case 2:
                                                        point3 = Math.Floor(point3);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                userGetPoint.playPairBet = point3;
                                                item.bettingPoint.playPairBet = point3;
                                                TheGameGetPoint += point3;

                                                var point4 = item.bettingPoint.playerPair_btn * 11;
                                                //判斷點數顯示(0無, 1四捨五入, 2無條件捨去)
                                                switch (game_settingObj.FeaturesSetting.DecimalPoint)
                                                {
                                                    case 0:
                                                        //取到小數點第二位
                                                        point4 = Math.Floor(point4 * 100) / 100;
                                                        break;
                                                    case 1:
                                                        point4 = Math.Round(point4, 0, MidpointRounding.AwayFromZero);
                                                        break;
                                                    case 2:
                                                        point4 = Math.Floor(point4);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                userGetPoint.bankPairBet = point4;
                                                item.bettingPoint.bankPairBet = point4;
                                                TheGameGetPoint += point4;
                                                break;
                                            default:
                                                break;
                                        }
                                    }

                                    //先記錄結算前的點數
                                    var refleshPoint = item.user_point + 0;

                                    item.bettingPoint.totGetPoint = Math.Floor(double.Parse(TheGameGetPoint.ToString()) * 10) / 10;
                                    item.bettingPoint.allTotPoint = Math.Floor((item.user_point + double.Parse(TheGameGetPoint.ToString())) * 100) / 100;
                                    item.user_point = item.bettingPoint.allTotPoint;
                                    item.bettingPoint.allTotPoint = Math.Floor(item.bettingPoint.allTotPoint * 10) / 10;
                                    item.bettingPoint.winner = now_gameRecord.winner;
                                    

                                    //將點數存入資料庫
                                    reflashUserPoint(item.account, item.user_point);

                                    //加入有押注的場次
                                    item.haveBet.Add(item.bettingPoint);

                                    if (item.user_socket != null)
                                    {
                                        var GameResult = new
                                        {
                                            action = "Settlement_user",
                                            haveBet = item.bettingPoint
                                        };
                                        item.user_socket.Send(JsonConvert.SerializeObject(GameResult));
                                    }

                                    //重置押注資訊
                                    item.bettingPoint = new BettingPoint();
                                }
                            }

                            if (item.user_socket == null)
                            {
                                //連線死亡
                                memberList.Remove(item);
                                continue;
                            }
                        }

                        switch (now_gameRecord.winner)
                        {
                            case 1:
                                lastGameRecord.player_win += 1;
                                textBox15.Text = lastGameRecord.player_win.ToString();
                                break;
                            case 2:
                                lastGameRecord.banker_win += 1;
                                textBox20.Text = lastGameRecord.banker_win.ToString();
                                break;
                            case 3:
                                lastGameRecord.tie += 1;
                                textBox17.Text = lastGameRecord.tie.ToString();
                                break;
                            default:
                                break;
                        }

                        switch (now_gameRecord.pair)
                        {
                            case 1:
                                lastGameRecord.player_pair += 1;
                                textBox16.Text = lastGameRecord.player_pair.ToString();
                                break;
                            case 2:
                                lastGameRecord.banker_pair += 1;
                                textBox21.Text = lastGameRecord.banker_pair.ToString();
                                break;
                            case 3:
                                lastGameRecord.player_pair += 1;
                                textBox16.Text = lastGameRecord.player_pair.ToString();
                                lastGameRecord.banker_pair += 1;
                                textBox21.Text = lastGameRecord.banker_pair.ToString();
                                break;
                            default:
                                break;
                        }

                        //寫入資料庫及清單
                        addGameList();

                        //送出此局結果(clinet)
                        var sett = new
                        {
                            action = "Settlement",
                            gameField = game_field,
                            gameRound = game_round,
                            PC1 = now_gameRecord.PC1,
                            BC1 = now_gameRecord.BC1,
                            PC2 = now_gameRecord.PC2,
                            BC2 = now_gameRecord.BC2,
                            PC3 = now_gameRecord.PC3,
                            BC3 = now_gameRecord.BC3,
                            playerSum = Psum,
                            bankerSum = Bsum,
                            pair = now_gameRecord.pair,
                            winner = now_gameRecord.winner,
                            time = DateTime.Now.ToString("yyyy/MM/dd HH:ss:mm"),
                            way_Records = all_wayBillList,
                            lastGameRecord = lastGameRecord,
                            preRecordsFour = game_recordsList
                        };
                        allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(sett)));
                        textBox7.Text = lastGameRecord.round.ToString();

                        //送出結算時間
                        for (int i = settlementTime; i >= 0; i--)
                        {
                            reciprocalTextBox.Text = i.ToString();
                            Thread.Sleep(1000);
                        }




                        status = "receiveCard";

                        break;
                    case "receiveCard":
                        //收牌

                        Psum = 0;
                        Bsum = 0;

                        if (gameEnd)
                        {
                            status = "endGame";
                        }

                        betInfoTotPoint = new BetInfoTotPoint();   //重置押分資訊

                        var result = new
                        {
                            action = "receiveCard",
                            betInfoTotPoint = betInfoTotPoint
                        };
                        allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(result)));
                        game_round += 1;

                        if (status2 == "endGame")
                        {
                            status = "endGame";
                        }
                        else
                        {
                            status = "readNowField";
                        }

                        RoundCard = 0;
                        textBox4.Text = "";

                        Thread.Sleep(CardGapTime);
                        break;
                    case "endGame":
                        //結束遊戲
                        textBox28.BackColor = Color.Black;
                        textBox25.BackColor = Color.DarkBlue;
                        startBtn.Enabled = true;
                        Start = false;

                        //遊戲暫停
                        var endStopGame = new
                        {
                            action = "endGame"
                        };
                        allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(endStopGame)));

                        break;
                    case "stopGame":
                        break;
                    default:
                        break;
                }

            }
        }



        //倒數計時
        private void reciprocalNum(int num)
        {
            var result = new
            {
                action = "BetReciprocal",
                reciprocal_num = num,
                status = status
            };
            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(result)));
        }


        /// <summary>
        /// 組成一副牌(依照設定牌數取)
        /// </summary>
        private void createPuker()
        {
            //先取出設定的牌數
            //黑桃1~13 紅心14~27 方塊27~40 梅花40~52
            puker = new List<int>();
            //puker = new List<int>() { 5, 10, 2, 3, 4, 5, 6 };

            Random cardRandom = new Random();

            for (int i = 0; i < Allpuker; i++)
            {
                var card = cardRandom.Next(1, 53);
                puker.Add(card);
            }
        }

        /// <summary>
        /// 點數換算
        /// </summary>
        private int PukerPoint(int point)
        {
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


        private void LincingCard_Back(string card)
        {
            //定位牌背
            var nowCB = game_cardBack;
            if (game_settingObj.PukerBack.UseFixedBackBtn)
            {
                nowCB = game_settingObj.PukerBack.UseFixedBack;
            }

            var result = new
            {
                action = "Licensing",
                cardName = card,
                cardBack = nowCB
            };
            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(result)));
        }

        /// <summary>
        /// 發牌
        /// </summary>
        /// <param name="card">發給誰的牌</param>
        private void LincingCard_Front(string card)
        {
            //點數加總
            int resultPoint = 0;

            if (card == "PC1" || card == "PC2" || card == "PC3")
            {
                Psum = addPoint_result(Psum + PukerPoint(puker[0]));
                resultPoint = Psum;
            }
            if (card == "BC1" || card == "BC2" || card == "BC3")
            {
                Bsum = addPoint_result(Bsum + PukerPoint(puker[0]));
                resultPoint = Bsum;
            }

            

            //開牌
            var openResult = new
            {
                action = "OpenCard",
                cardName = card,
                card = puker[0],
                point = resultPoint
            };
            Thread.Sleep(1200);
            lastGameRecord.card += 1;
            RoundCard += 1;
            textBox4.Text = (RoundCard > 0) ? RoundCard.ToString() : "";
            textBox5.Text = lastGameRecord.card.ToString() + " / 416";
            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(openResult)));

            //寫入紀錄
            switch (card)
            {
                case "PC1":
                    now_gameRecord.PC1 = puker[0];
                    break;
                case "PC2":
                    now_gameRecord.PC2 = puker[0];
                    break;
                case "PC3":
                    now_gameRecord.PC3 = puker[0];
                    break;
                case "BC1":
                    now_gameRecord.BC1 = puker[0];
                    break;
                case "BC2":
                    now_gameRecord.BC2 = puker[0];
                    break;
                case "BC3":
                    now_gameRecord.BC3 = puker[0];
                    break;
                default:
                    break;
            }

            puker.RemoveAt(0); //移除抽走的牌
            Console.WriteLine(now_gameRecord);
        }

        //轉換相加的點數
        private int addPoint_result(int sum)
        {
            if (sum >= 10)
            {
                sum = sum % 10;  //取個位數
            }

            return sum;
        }

        //天牌或停牌
        private void cardNaturalOrStand(int sum, string PB)
        {
            var Psum_Tow = addPoint_result(PukerPoint(now_gameRecord.PC1) + PukerPoint(now_gameRecord.PC2));
            if (sum == 6 || sum == 7)
            {
                if (PB == "PC")
                {
                    //停牌
                    var result = new
                    {
                        action = "StandCard",
                        cardName = PB,
                        cardBack = ""
                    };
                    allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(result)));
                }
                else
                {
                    //莊家的6點需另外判斷
                    if (PB == "BC")
                    {
                        if (sum == 7)
                        {
                            //停牌
                            var result = new
                            {
                                action = "StandCard",
                                cardName = PB,
                                cardBack = ""
                            };
                            allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(result)));
                        }
                        else
                        {
                            //var PC3point = PukerPoint(now_gameRecord.PC3);
                            if (Psum_Tow == 7 || Psum_Tow == 6)
                            {
                                //停牌
                                var result = new
                                {
                                    action = "StandCard",
                                    cardName = PB,
                                    cardBack = ""
                                };
                                allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(result)));
                            }
                        }
                    }
                }

            }

            
            //if (sum <= 5 && sum >= 3 && PB == "BC" && (Psum_Tow == 7 || Psum_Tow == 6))
            //{
            //    //停牌
            //    var result = new
            //    {
            //        action = "StandCard",
            //        cardName = PB,
            //        cardBack = ""
            //    };
            //    allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(result)));
            //}

            if (sum == 8 || sum == 9)
            {
                //天牌
                var result = new
                {
                    action = "NaturalCard",
                    cardName = PB,
                    cardBack = ""
                };
                allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(result)));
            }
        }

        //判斷贏家
        private int gameWinner(int player_sum, int banker_sum)
        {
            int result = 0;

            if (player_sum > banker_sum)
            {
                result = 1;  //0 閒贏
            }
            else
            {
                if (player_sum == banker_sum)
                {
                    result = 3; //3 和
                }
                else
                {
                    result = 2;   //1 莊贏
                }
            }
            return result;
        }

        //判斷路單的閒莊對
        private void addNowWayBillPair()
        {
            now_gameRecord.pair = 0;

            //閒對
            if (now_gameRecord.PC1 == now_gameRecord.PC2)
            {
                now_gameRecord.pair = 1;
            }
            //莊對
            if (now_gameRecord.BC1 == now_gameRecord.BC2)
            {
                now_gameRecord.pair = 2;
            }
            //莊閒對
            if (now_gameRecord.PC1 == now_gameRecord.PC2 && now_gameRecord.BC1 == now_gameRecord.BC2)
            {
                now_gameRecord.pair = 3;
            }

        }


        //加入此局記錄的路單至遊戲路單清單
        private void addNowWayBill()
        {
            var point = 0;

            switch (now_gameRecord.winner)
            {
                case 1:
                    point = now_gameRecord.playerSum;
                    break;
                case 2:
                    point = now_gameRecord.bankerSum;
                    break;
                case 3:
                    point = now_gameRecord.playerSum;
                    break;
                default:
                    break;
            }

            var record = ("" + now_gameRecord.winner) + point + now_gameRecord.pair;

            all_wayBillList.Add(record);
        }

        //排序籌碼
        private int[] sortChip_All()
        {
            List<int> checkChip = new List<int>();
            int[] sortChipTest = new int[] { game_settingObj.BettingSetting.Denomination1, game_settingObj.BettingSetting.Denomination2, game_settingObj.BettingSetting.Denomination3,
                                         game_settingObj.BettingSetting.Denomination4, game_settingObj.BettingSetting.Denomination5 };

            foreach (var item in sortChipTest)
            {
                if (item > 0)
                {
                    checkChip.Add(item);
                }
            }

            return checkChip.ToArray();

        }

        /// <summary>
        /// 取出餘分
        /// </summary>
        /// <param name="user_point">使用者目前的分數</param>
        /// <returns>餘分</returns>
        private double ShowRemainingPoint(double user_point)
        {
            //排列籌碼大小
            int[] sortChip = sortChip_All();

            if (sortChip == null || sortChip.Count() == 0)
            {
                return Math.Floor((user_point % 0) * 100) / 100;
            }
            else
            {
                Array.Sort(sortChip);
                return Math.Floor((user_point % sortChip[0]) * 100) / 100;
            }
        }

        //全場最高限額
        private double GetAllBetPoint()
        {
            double totPoint = 0;
            totPoint = betInfoTotPoint.playerAllBet + betInfoTotPoint.tieAllBet + betInfoTotPoint.bankerAllBet + betInfoTotPoint.playPairAllBet + betInfoTotPoint.bankPairAllBet;
            return totPoint;
        }

        //超過最大押分
        private void SendOverToMaxMsg(IWebSocketConnection socket, string str)
        {
            //超過單門最大押分
            var BetOverMax = new
            {
                action = "PointBetOverMax",
                msgText = str,
                status = status
            };
            socket.Send(JsonConvert.SerializeObject(BetOverMax));
        }


        //取出此局的所有資料(繪製路單清單,且server重起時)
        private void takeThisFieldAllRecords()
        {
            //取出此局的紀錄,並排列路單
            List<string> wayBillList = new List<string>();
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "SELECT player_sum, banker_sum, pair, winner FROM games WHERE game_field='" + game_field + "' ORDER BY id ASC";
            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();

            try
            {
                MySqlCommand cmd = new MySqlCommand(sql, conn);
                MySqlDataReader data = cmd.ExecuteReader();
                if (data.HasRows)
                {
                    while (data.Read())
                    {
                        var point = "";
                        var c = data[3].ToString();
                        switch (data[3].ToString())
                        {
                            case "1":
                                point = data[0].ToString();
                                break;
                            case "2":
                                point = data[1].ToString();
                                break;
                            case "3":
                                point = data[0].ToString();
                                break;
                            default:
                                break;
                        }
                        string record = "" + data[3] + point + data[2].ToString();
                        wayBillList.Add(record);
                    }
                }

                conn.Close();
                all_wayBillList = wayBillList.ToList();
            }
            catch (MySqlException e)
            {
                Console.WriteLine("Error" + e.Number + ":" + e.Message);
            }

        }



        //將此局紀錄加入清單,並寫入資料庫
        private void addGameList()
        {
            DateTime time = DateTime.Now;

            var now_game = new GameRecord() {
                gameField = now_gameRecord.gameField,
                gameRound = now_gameRecord.gameRound,
                PC1 = now_gameRecord.PC1,
                BC1 = now_gameRecord.BC1,
                PC2 = now_gameRecord.PC2,
                BC2 = now_gameRecord.BC2,
                PC3 = now_gameRecord.PC3,
                BC3 = now_gameRecord.BC3,
                playerSum = now_gameRecord.playerSum,
                bankerSum = now_gameRecord.bankerSum,
                pair = now_gameRecord.pair,
                winner = now_gameRecord.winner,
                time = time
            };

            game_recordsList.Add(now_game);
            if (game_recordsList.Count > 4)
            {
                game_recordsList.RemoveAt(0);
            }

            string sqlTime = time.ToString("yyyy-MM-dd HH:mm:ss");
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();
            command.CommandText = "Insert into games(game_field, game_round, player_card1, banker_card1, player_card2, banker_card2, player_card3, banker_card3, player_sum, banker_sum, pair, winner, time) " +
                " values('" + now_gameRecord.gameField + "', '" + now_gameRecord.gameRound + "', '" + now_gameRecord.PC1 + "', '" + now_gameRecord.BC1 + "', '" + now_gameRecord.PC2 + "', '" + now_gameRecord.BC2 + "', '" + now_gameRecord.PC3 +
                "', '" + now_gameRecord.BC3 + "', '" + now_gameRecord.playerSum + "', '" + now_gameRecord.bankerSum + "', '" + now_gameRecord.pair + "', '" + now_gameRecord.winner + "', '" + sqlTime + "')";
            command.ExecuteNonQuery();

            string sql = "UPDATE last_game SET field = '" + lastGameRecord.field + "', round = '" + lastGameRecord.round + "', player_win = '" + lastGameRecord.player_win +
                         "', tie = '" + lastGameRecord.tie + "', banker_win = '" + lastGameRecord.banker_win + "', player_pair = '" + lastGameRecord.player_pair +
                         "', banker_pair = '" + lastGameRecord.banker_pair + "', card = '" + lastGameRecord.card + "' WHERE id='" + 1 + "'";

            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();


            conn.Close();
        }


        private int Check_loginUser(string userAccount)
        {
            var result = 0;
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "SELECT id,account FROM member WHERE account='" + userAccount + "'";
            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();

            try
            {
                MySqlCommand cmd = new MySqlCommand(sql, conn);
                MySqlDataReader data = cmd.ExecuteReader();
                if (data.HasRows)
                {
                    while (data.Read())
                    {
                        result = Int32.Parse(data[0].ToString());
                        break;
                    }
                }
                else
                {
                    result = 0;
                }

                conn.Close();
            }
            catch (MySqlException e)
            {
                Console.WriteLine("Error" + e.Number + ":" + e.Message);
            }
            return result;
        }

        private double getUserPoint(string userAccount)
        {
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "SELECT point FROM member WHERE account='" + userAccount + "'";
            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();

            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();
            if (data.HasRows)
            {
                double s = 0;
                while (data.Read())
                {
                    s = double.Parse(data[0].ToString());
                }

                conn.Close();
                return s;
            }
            else
            {
                conn.Close();
                return 0;
            }


        }


        private string getNextField()
        {
            string result = "";
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "SELECT game_field, game_round FROM games ORDER BY id DESC";

            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();
            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();


            if (data.HasRows)
            {
                string s = "";
                while (data.Read())
                {
                    s += data[0] + "," + data[1];
                    break;
                }
                result = s;
            }
            else
            {
                result = "1,0";
            }

            conn.Close();
            return result;
        }

        private void getOpenCardRecord()
        {
            //取出開牌紀錄
            string result = "";
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "SELECT * FROM last_game WHERE id = 1";

            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();
            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();
            if (data.HasRows)
            {
                while (data.Read())
                {
                    lastGameRecord.field = (int)data[1];
                    lastGameRecord.round = (int)data[2];
                    lastGameRecord.player_win = (int)data[3];
                    lastGameRecord.tie = (int)data[4];
                    lastGameRecord.banker_win = (int)data[5];
                    lastGameRecord.player_pair = (int)data[6];
                    lastGameRecord.banker_pair = (int)data[7];
                    lastGameRecord.card = (int)data[8];
                }
            }
        }


        private List<PreRecords> getBeforeRecord(int RecordNum)
        {
            //依照所需的資料數取資料
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "SELECT * FROM games ORDER BY id DESC LIMIT " + RecordNum;

            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();
            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();

            var allRecord = new List<PreRecords>();

            if (data.HasRows)
            {
                while (data.Read())
                {
                    DateTime time = (DateTime)data[13];
                    string Ntime = time.ToString("yyyy/MM/dd HH:mm:ss");

                    allRecord.Add(new PreRecords() {
                        ID = Int32.Parse(data[0].ToString()),
                        gameField = Int32.Parse(data[1].ToString()),
                        gameRound = Int32.Parse(data[2].ToString()),
                        PC1 = Int32.Parse(data[3].ToString()),
                        BC1 = Int32.Parse(data[4].ToString()),
                        PC2 = Int32.Parse(data[5].ToString()),
                        BC2 = Int32.Parse(data[6].ToString()),
                        PC3 = Int32.Parse(data[7].ToString()),
                        BC3 = Int32.Parse(data[8].ToString()),
                        playerSum = Int32.Parse(data[9].ToString()),
                        bankerSum = Int32.Parse(data[10].ToString()),
                        pair = Int32.Parse(data[11].ToString()),
                        winner = Int32.Parse(data[12].ToString()),
                        time = Ntime
                    });
                }

            }
            conn.Close();
            return allRecord;

        }

        //取最後一筆資料的ID
        private int getLastGameRecord_ID()
        {
            int num = 0;
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "SELECT id FROM games ORDER BY id DESC LIMIT 1";

            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();
            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();

            if (data.HasRows)
            {
                while (data.Read())
                {
                    num = Int32.Parse(data[0].ToString());
                }
            }
            conn.Close();
            return num;
        }

        private void getPreRecord_toFour()
        {
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "SELECT * FROM games ORDER BY id DESC LIMIT 4";

            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();
            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();

            if (data.HasRows)
            {
                while (data.Read())
                {
                    DateTime time = (DateTime)data[13];
                    var now_game = new GameRecord()
                    {
                        gameField = Int32.Parse(data[1].ToString()),
                        gameRound = Int32.Parse(data[2].ToString()),
                        PC1 = Int32.Parse(data[3].ToString()),
                        BC1 = Int32.Parse(data[4].ToString()),
                        PC2 = Int32.Parse(data[5].ToString()),
                        BC2 = Int32.Parse(data[6].ToString()),
                        PC3 = Int32.Parse(data[7].ToString()),
                        BC3 = Int32.Parse(data[8].ToString()),
                        playerSum = Int32.Parse(data[9].ToString()),
                        bankerSum = Int32.Parse(data[10].ToString()),
                        pair = Int32.Parse(data[11].ToString()),
                        winner = Int32.Parse(data[12].ToString()),
                        time = time
                    };
                    game_recordsList.Insert(0, now_game);
                }
            }
            conn.Close();
        }

        //更新使用者結算後的點數
        private void reflashUserPoint(string account, double point)
        {
            //string dbHost = "127.0.0.1"; //資料庫位址
            //string dbUser = "root";
            //string dbPass = "123456";
            //string dbName = "bc_casion";
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "UPDATE member SET point = '" + point + "' WHERE account='" + account + "'";

            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();
            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();
            conn.Close();
        }

        //計算全場押分
        private double allBet_totSum()
        {
            double tot = (betInfoTotPoint.playerAllBet + betInfoTotPoint.playPairAllBet + betInfoTotPoint.tieAllBet + betInfoTotPoint.bankPairAllBet + betInfoTotPoint.bankerAllBet);
            return tot;
        }

        //更新dataGridView
        private void Refresh_UserLogin()
        {
            this.Invoke(new InvokeHandler(delegate() 
            {
                dataGridView1.DataSource = null;
                var source_data = new BindingList<ServerUserView>(server_userView.ToList());
                dataGridView1.DataSource = source_data;
                CurrencyManager cm = (CurrencyManager)this.dataGridView1.BindingContext[server_userView.ToList()];
                if (cm != null)
                {
                    cm.Refresh();
                }
                dataGridView1.Columns[1].Width = 130;
                dataGridView1.Columns[1].HeaderText = "user ID";
                dataGridView1.Columns[0].Width = 50;
                dataGridView1.Columns[0].HeaderText = "No";
                reSetDataGridViewSelect();
            }));

        }
        


        //dataGridView 索引沒有值解決方法 http://www.baiyuxiong.com/?p=56
        private void reSetDataGridViewSelect()
        {
            //清空dataSet的數據前，把dataGridView中的所有行都取消選中
            foreach (DataGridViewRow row in dataGridView1.Rows)
            {
                row.Selected = false;
            }
        }

        //更新啟動時間
        private void StartUseTime()
        {
            timer = new System.Timers.Timer();
            timer.Interval = 1000;
            timer.Elapsed += Timer_ElapsedUpdate;
            timer.Enabled = true;
        }

        private void Timer_ElapsedUpdate(object sender, System.Timers.ElapsedEventArgs e)
        {
            var result = sw.Elapsed.ToString().Split('.');
            TimeTextBox.Text = "已啟動時間 : " + result[0];
        }


        //定時器
        private void StartTimer()
        {
            timer = new System.Timers.Timer();
            timer.Interval = 3000;
            timer.Elapsed += Timer_Elapsed;
            timer.Enabled = true;
        }


        /**
         * 存活訊息
         * 若使用者超過3次無回應,將memberList中的 socket 轉為 null 並踢掉 allSocket 中的此連線.
         * 使用者連上後(未登出)在memberList中找出同帳號,並將 socket更新為新連線的socket.
         * 
         * 清除連線資料memberList時機
         * 登出
         * 登入(同帳號連線要將前一個踢掉)
         * 結算(將所有押分記錄寄算完後,從memberList中找出socket為null的使用者,並清出資料)
         * 
         */


        private void Timer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
        {
            //更新連線數
            this.textBox32.Text = "遊戲端數量: " + allSockets.Count;

            //定時寄送存活訊息
            if (memberList.Count > 0)
            {
                //檢查是否存活
                foreach (var item in memberList.ToList())
                {
                    if (item.aliveTime == 3)
                    {
                        if (item.user_socket == null)
                        {
                            continue;
                        }

                        //將此socket設為null
                        //allSockets, 如果是有登入的server_userView
                        if (!String.IsNullOrEmpty(item.account))
                        {
                            //有登入(清空server的顯示)
                            var the_loginOut = server_userView.Where(m => m.userId == item.account).ToList();
                            if (the_loginOut.FirstOrDefault() != null)
                            {
                                lock (serverUserView_Locker)
                                {
                                    foreach (var user in the_loginOut)
                                    {
                                        reSetDataGridViewSelect();
                                        server_userView.Remove(user);
                                    }
                                }
                            }

                            //更新dataGridView
                            try
                            {
                                lock (serverUserView_Locker)
                                {
                                    //dataGridView1.DataSource = null;
                                    //var Nsource = new BindingList<ServerUserView>(server_userView.ToList());
                                    //dataGridView1.DataSource = Nsource;
                                    //CurrencyManager cm = (CurrencyManager)this.dataGridView1.BindingContext[server_userView.ToList()];
                                    //if (cm != null)
                                    //{
                                    //    cm.Refresh();
                                    //}
                                    //reSetDataGridViewSelect();
                                    Refresh_UserLogin();
                                }
                            }
                            catch (Exception a)
                            {
                                MessageBox.Show(a.ToString());
                            }
                        }

                        foreach (var itemSocket in allSockets.ToList())
                        {
                            if (item.user_socket == itemSocket && item.aliveTime >= 3)
                            {
                                var result = new
                                {
                                    action = "Dead",
                                    aliveTime = item.aliveTime
                                };
                                itemSocket.Send(JsonConvert.SerializeObject(result));
                                allSockets.Remove(itemSocket);
                            }
                        }

                        item.user_socket = null;
                    }
                    item.aliveTime += 1;
                }


                var LiveMsg = new
                {
                    action = "IsLive",
                    status = status
                };
                allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(LiveMsg)));
            }
        }


        //剔除重複使用者連線及確認是否有押分
        private bool PickLoginRepeatUser(IWebSocketConnection socket, string account)
        {
            bool continuProgram = true; 

            //判斷使用者有沒有重複登入
            //重複登入則更改memberList中的socket,且在allSocket中踢除此連線
            foreach (var item in memberList.ToList())
            {
                if (item.account == account && item.user_socket != socket)
                {
                    //查看同一再線的帳號是否在押注中,若是則不能再次登入
                    if (item.bettingPoint.totPoint > 0 && item.user_socket != null)
                    {
                        //有押分不能登入
                        continuProgram = false;
                        var loginError = new
                        {
                            action = "haveBetCanNotLogin"
                        };
                        socket.Send(JsonConvert.SerializeObject(loginError));
                        break;
                    }
                    else
                    {
                        if (item.account == account && item.user_socket == null)
                        {
                            //更新socket值
                            item.user_socket = socket;
                            continuProgram = true;

                            foreach (var memItem in memberList.ToList())
                            {
                                if (memItem.user_socket == socket && (memItem.account == "" || memItem.account == null))
                                {
                                    //刪除沒有account 的 socket
                                    memberList.Remove(memItem);
                                }
                            }
                            break;
                        }
                        else
                        {
                            //踢掉
                            foreach (var allitem in allSockets.ToList())
                            {
                                if (allitem == item.user_socket)
                                {
                                    //告訴此socket已在其他裝置登入
                                    var loginError = new
                                    {
                                        action = "haveOtherDeviceLogin"
                                    };
                                    allitem.Send(JsonConvert.SerializeObject(loginError));

                                    allSockets.Remove(allitem);
                                    break;
                                }
                            }
                            //更新socket值
                            item.user_socket = socket;
                            continuProgram = true;
                            break;
                        }
                        
                    }

                }

            }

            return continuProgram;
        }





        //因斷線未正常登出而再登入的使用者(將前面相同帳號的連線踢掉)
        private void ThrowRepeatOldAccount(IWebSocketConnection socket, string account)
        {
            foreach (var item in memberList.ToList())
            {
                //找出socket不同,帳號相同的連線
                if ((item.user_socket != socket) && (item.account == account))
                {
                    //踢掉


                    foreach (var allsocketList in allSockets.ToList())
                    {
                        if (allsocketList == item.user_socket)
                        {
                            //踢掉
                        }
                    }

                }
                else
                {
                    continue;
                }
            }
        }

        private void dataGridView1_DataError(object sender, DataGridViewDataErrorEventArgs e)
        {
            MessageBox.Show(e.Context.ToString());
        }
    }
}
