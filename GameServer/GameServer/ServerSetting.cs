using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GameServer
{
    public partial class ServerSetting : Form
    {
        public RootObject game_settingObj = new RootObject(); //檔案設定物件   
        public static ServerSetting Self2;

        public ServerSetting()
        {
            SettingValue game_serverSetting = new SettingValue();              //讀入Setting檔案
            game_settingObj = game_serverSetting.ReadGS_userSettings_obj();

            InitializeComponent();
            this.comboBoxpuker.SelectedIndex = 0;

            //將設定項賦值
            refleshServerShowSetting();


            Self2 = this;
        }

        private void comboBoxpuker_DrawItem(object sender, DrawItemEventArgs e)
        {
            e.DrawBackground();
            e.DrawFocusRectangle();
            if (e.Index > -1 && imageList1.Images.Count >= e.Index)
            {
                e.Graphics.DrawImage(imageList1.Images[e.Index], new PointF(e.Bounds.X, e.Bounds.Y));
            }
        }

        private void pictureBoxKeyM_Paint(object sender, PaintEventArgs e)
        {
            Font font = new Font("Arial", 14);
            e.Graphics.DrawString("M", font, Brushes.Black, new Point(30, 30));
        }

        private void pictureBoxKeyJ_Paint(object sender, PaintEventArgs e)
        {
            Font font = new Font("Arial", 14);
            e.Graphics.DrawString("J", font, Brushes.Black, new Point(35, 30));
        }

        private void pictureBoxKeyQ_Paint(object sender, PaintEventArgs e)
        {
            Font font = new Font("Arial", 14);
            e.Graphics.DrawString("Q", font, Brushes.Black, new Point(30, 30));
        }

        private void pictureBoxKeyW_Paint(object sender, PaintEventArgs e)
        {
            Font font = new Font("Arial", 14);
            e.Graphics.DrawString("W", font, Brushes.Black, new Point(30, 30));
        }

        private void SaveBtn_Click(object sender, EventArgs e)
        {
            var D1 = 0;
            var D2 = 0;
            var D3 = 0;
            var D4 = 0;
            var D5 = 0;

            //判斷面額是否有無
            if (denomination1_comboBox.SelectedItem.ToString() == "無" || denomination2_comboBox.SelectedItem.ToString() == "無" || denomination3_comboBox.SelectedItem.ToString() == "無" ||
                denomination4_comboBox.SelectedItem.ToString() == "無" || denomination5_comboBox.SelectedItem.ToString() == "無")
            {
                Form2 alert = new Form2();
                alert.ShowDialog();

                if (denomination1_comboBox.SelectedItem.ToString() == "無")
                {
                    D1 = -1;
                }
                else
                {
                    D1 = Int32.Parse((denomination1_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination1_comboBox.SelectedItem.ToString());
                }

                if (denomination2_comboBox.SelectedItem.ToString() == "無")
                {
                    D2 = -1;
                }
                else
                {
                    D2 = Int32.Parse((denomination2_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination2_comboBox.SelectedItem.ToString());
                }

                if (denomination3_comboBox.SelectedItem.ToString() == "無")
                {
                    D3 = -1;
                }
                else
                {
                    D3 = Int32.Parse((denomination3_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination3_comboBox.SelectedItem.ToString());
                }

                if (denomination4_comboBox.SelectedItem.ToString() == "無")
                {
                    D4 = -1;
                }
                else
                {
                    D4 = Int32.Parse((denomination4_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination4_comboBox.SelectedItem.ToString());
                }

                if (denomination5_comboBox.SelectedItem.ToString() == "無")
                {
                    D5 = -1;
                }
                else
                {
                    D5 = Int32.Parse((denomination5_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination5_comboBox.SelectedItem.ToString());
                }
            }
            else
            {
                D1 = Int32.Parse((denomination1_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination1_comboBox.SelectedItem.ToString());
                D2 = Int32.Parse((denomination2_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination2_comboBox.SelectedItem.ToString());
                D3 = Int32.Parse((denomination3_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination3_comboBox.SelectedItem.ToString());
                D4 = Int32.Parse((denomination4_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination4_comboBox.SelectedItem.ToString());
                D5 = Int32.Parse((denomination5_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination5_comboBox.SelectedItem.ToString());
            }

            //先判斷押注設定2是否有不合法的數字
            if (CheckBetSetting2number() == false)
            {
                MessageBox.Show("押注限額設定不正確");
            }
            else
            {
                string checkMsg = CheckBetSetting2MaxMin();
                if (!String.IsNullOrEmpty(checkMsg))
                {
                    MessageBox.Show(checkMsg);
                }
                else
                {
                    //全部儲存到json檔,並重新賦值,且告訴form1要重新讀檔
                    #region 製作json檔案 var result
                    var result = new
                    {
                        GameTime = new
                        {
                            BettingTime = Int32.Parse(this.betTime_comboBox.SelectedItem.ToString()),
                            SettlementTime = Int32.Parse(this.settlementTime_comboBox.SelectedItem.ToString())
                        },
                        BettingSetting = new
                        {
                            //Denomination1 = Int32.Parse((denomination1_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination1_comboBox.SelectedItem.ToString()),
                            //Denomination2 = Int32.Parse((denomination2_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination2_comboBox.SelectedItem.ToString()),
                            //Denomination3 = Int32.Parse((denomination3_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination3_comboBox.SelectedItem.ToString()),
                            //Denomination4 = Int32.Parse((denomination4_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination4_comboBox.SelectedItem.ToString()),
                            //Denomination5 = Int32.Parse((denomination5_comboBox.SelectedItem.ToString() == "單注最高限額") ? "0" : denomination5_comboBox.SelectedItem.ToString()),
                            Denomination1 = D1,
                            Denomination2 = D2,
                            Denomination3 = D3,
                            Denomination4 = D4,
                            Denomination5 = D5,
                            TieBet = Convert.ToBoolean(this.tieBet_checkBox.Checked),
                            RemainingPointBet = Convert.ToBoolean(this.remainingPointBet_checkBox.Checked),
                            AutoRetention = Convert.ToBoolean(this.autoRetention_checkBox.Checked)
                        },
                        BettingSetting2 = new
                        {
                            SingleNoteMin = Int32.Parse(this.singleNoteMin_textBox.Text.ToString()),
                            SingleNoteMax = Int32.Parse(this.singleNoteMax_textBox.Text.ToString()),
                            TieNoteMin = Int32.Parse(this.tieNoteMin_textBox.Text.ToString()),
                            TieNoteMax = Int32.Parse(this.tieNoteMax_textBox.Text.ToString()),
                            PlayerPairMin = Int32.Parse(this.playerPairMin_textBox.Text.ToString()),
                            PlayerPairMax = Int32.Parse(this.playerPairMax_textBox.Text.ToString()),
                            BankerPairMin = Int32.Parse(this.bankerPairMin_textBox.Text.ToString()),
                            BankerPairMax = Int32.Parse(this.bankerPairMax_textBox.Text.ToString()),
                            SingleMachineMax = Int32.Parse(this.singleMachineMax_textBox.Text.ToString()),
                            AllPlayerBankerMax = Int32.Parse(this.allPlayerBankerMax_textBox.Text.ToString()),
                            AllTieNoteMax = Int32.Parse(this.allTieNoteMax_textBox.Text.ToString()),
                            AllPlayerPairMax = Int32.Parse(this.allPlayerPairMax_textBox.Text.ToString()),
                            AllBankerPairMax = Int32.Parse(this.allBankerPairMax_textBox.Text.ToString()),
                            AllMax = Int32.Parse(this.allMax_textBox.Text.ToString()),
                            BetOverInvalid = Convert.ToBoolean(this.betOverInvalid_checkBox.Checked)
                        },
                        VoiceSetting = new
                        {
                            UseBGM = Convert.ToBoolean(this.useBGM_checkBox.Checked),
                            BGM = Int32.Parse(this.bgm_trackBar.Value.ToString()),
                            UseVoice = Convert.ToBoolean(this.useVoice_checkBox.Checked),
                            Voice = Int32.Parse(this.voice_trackBar.Value.ToString()),
                            UseChips = Convert.ToBoolean(this.useChips_checkBox.Checked),
                            Chips = Int32.Parse(this.chips_trackBar.Value.ToString()),
                            UseReciprocal = Convert.ToBoolean(this.useReciprocal_checkBox.Checked),
                            Reciprocal = Int32.Parse(this.reciprocal_trackBar.Value.ToString())
                        },
                        SingleMachine = new
                        {
                            RetentionBtn = Convert.ToBoolean(this.retentionBtn_checkBox.Checked),
                            RetiredBtn = Convert.ToBoolean(this.retiredBtn_checkBox.Checked),
                            DayCardAndStopCard = Convert.ToBoolean(this.dayCardAndStopCard_checkBox.Checked),
                            BigWayShowPair = Convert.ToBoolean(this.bigWayShowPair_checkBox.Checked),
                            UseChipsIndex = Convert.ToBoolean(this.useChipsIndex_checkBox.Checked),
                            UseChipsDrop = Convert.ToBoolean(this.useChipsDrop_checkBox.Checked),
                            BigWay = Convert.ToBoolean(this.bigWay_checkBox.Checked),
                            ThreeWay = Convert.ToBoolean(this.threeWay_checkBox.Checked),
                            BigWayNine = Convert.ToBoolean(this.bigWayNine_checkBox.Checked),
                            CockroachWay = Convert.ToBoolean(this.cockroachWay_checkBox.Checked),
                            BigCockroachWay = Convert.ToBoolean(this.bigCockroachWay_checkBox.Checked),
                            BeforeRecord = Int32.Parse(this.beforeRecord_comboBox.SelectedIndex.ToString()),
                            RecordLoadNum = Int32.Parse(this.recordLoadNum_comboBox.SelectedItem.ToString()),
                            LoginKeepsNum = Int32.Parse(this.loginKeepsNum_comboBox.SelectedItem.ToString()),
                            BeforeRecordMenu = Convert.ToBoolean(this.beforeRecordMenu_checkBox.Checked),
                            GameRuleMenu = Convert.ToBoolean(this.gameRuleMenu_checkBox.Checked),
                            LoginBtn = Convert.ToBoolean(this.loginBtn_checkBox.Checked),
                            LogoutBtn = Convert.ToBoolean(this.logoutBtn_checkBox.Checked)
                        },
                        FeaturesSetting = new
                        {
                            PBOnlyOne = Convert.ToBoolean(this.pbOnlyOne_checkBox.Checked),
                            RemainingPointCanOther = Convert.ToBoolean(this.remainingPointCanOther_checkBox.Checked),
                            DecimalPoint = Int32.Parse(this.decimalPoint_comboBox.SelectedIndex.ToString()),
                            BetInfo = Int32.Parse(this.betInfo_comboBox.SelectedIndex.ToString()),
                            TableNumber = this.tableNumber_textBox.Text.ToString(),
                            BGColor = Int32.Parse(this.bgColor_comboBox.SelectedIndex.ToString())
                        },
                        PukerBack = new
                        {
                            UseFixedBackBtn = Convert.ToBoolean(this.useFixedBackBtn_radioButton.Checked),
                            UseFixedBack = this.comboBoxpuker.SelectedItem.ToString(),
                            ChangeBackRoundBtn = Convert.ToBoolean(this.changeBackRoundBtn_radioButton.Checked),
                            ChangeBackRound = Int32.Parse(this.changeBackRound_comboBox.SelectedItem.ToString()),
                            PickBacks1 = Convert.ToBoolean(this.pickBacks1_checkBox.Checked),
                            PickBacks2 = Convert.ToBoolean(this.pickBacks2_checkBox.Checked),
                            PickBacks3 = Convert.ToBoolean(this.pickBacks3_checkBox.Checked)
                        },
                        New17Keys = new
                        {
                            KeyM = Int32.Parse(this.comboBoxKeyM.SelectedIndex.ToString()),
                            KeyJ = Int32.Parse(this.comboBoxKeyJ.SelectedIndex.ToString()),
                            KeyQ = Int32.Parse(this.comboBoxKeyQ.SelectedIndex.ToString()),
                            KeyW = Int32.Parse(this.comboBoxKeyW.SelectedIndex.ToString())
                        },
                        MsgSetting = new
                        {
                            MsgFixed = Convert.ToBoolean(this.msgFixed_radioButton.Checked),
                            MsgFixedValue = Int32.Parse(this.msgFixedValue_comboBox.SelectedIndex.ToString()),
                            MsgChange = Convert.ToBoolean(this.msgChange_radioButton.Checked),
                            MsgChangeValue = Int32.Parse(this.msgChangeValue_comboBox.SelectedIndex.ToString()),
                            Msg1 = this.msg1_textBox.Text.ToString(),
                            Msg2 = this.msg2_textBox.Text.ToString(),
                            Msg3 = this.msg3_textBox.Text.ToString()
                        },
                        CardTotNum = new
                        {
                            OpenRound = Int32.Parse(this.openRound_comboBox.SelectedItem.ToString())
                        },
                        CutCardFeatures = new
                        {
                            AutoCutCard = Convert.ToBoolean(this.autoCutCard_checkBox.Checked),
                            Round = Int32.Parse(this.round_comboBox.SelectedItem.ToString()),
                            Num = Int32.Parse(this.num_comboBox.SelectedItem.ToString())
                        }
                    };
                    #endregion

                    string json = JsonConvert.SerializeObject(result);

                    using (System.IO.StreamWriter file = new System.IO.StreamWriter(System.AppDomain.CurrentDomain.BaseDirectory + "GS_userSettings.json"))
                    {
                        file.Write(json);
                    }

                    #region 土法煉鋼代碼


                    ////GameTime
                    //game_serverSetting.BettingTime = Int32.Parse(this.betTime_comboBox.SelectedItem.ToString());
                    //game_serverSetting.SettlementTime = Int32.Parse(this.settlementTime_comboBox.SelectedItem.ToString());

                    ////BettingSetting
                    //game_serverSetting.Denomination1 = Int32.Parse(this.denomination1_comboBox.SelectedItem.ToString());
                    //game_serverSetting.Denomination2 = Int32.Parse(this.denomination2_comboBox.SelectedItem.ToString());
                    //game_serverSetting.Denomination3 = Int32.Parse(this.denomination3_comboBox.SelectedItem.ToString());
                    //game_serverSetting.Denomination4 = Int32.Parse(this.denomination4_comboBox.SelectedItem.ToString());
                    //game_serverSetting.Denomination5 = Int32.Parse(this.denomination5_comboBox.SelectedItem.ToString());
                    //game_serverSetting.TieBet = Convert.ToBoolean(this.tieBet_checkBox.Checked);
                    //game_serverSetting.RemainingPointBet = Convert.ToBoolean(this.remainingPointBet_checkBox.Checked);
                    //game_serverSetting.AutoRetention = Convert.ToBoolean(this.autoRetention_checkBox.Checked);

                    ////BettingSetting2
                    //game_serverSetting.SingleNoteMin = Int32.Parse(this.singleNoteMin_textBox.Text.ToString());
                    //game_serverSetting.SingleNoteMax = Int32.Parse(this.singleNoteMax_textBox.Text.ToString());
                    //game_serverSetting.TieNoteMin = Int32.Parse(this.singleNoteMin_textBox.Text.ToString());
                    //game_serverSetting.TieNoteMax = Int32.Parse(this.singleNoteMax_textBox.Text.ToString());
                    //game_serverSetting.PlayerPairMin = Int32.Parse(this.playerPairMin_textBox.Text.ToString());
                    //game_serverSetting.PlayerPairMax = Int32.Parse(this.playerPairMax_textBox.Text.ToString());
                    //game_serverSetting.BankerPairMin = Int32.Parse(this.bankerPairMin_textBox.Text.ToString());
                    //game_serverSetting.BankerPairMax = Int32.Parse(this.bankerPairMax_textBox.Text.ToString());
                    //game_serverSetting.SingleMachineMax = Int32.Parse(this.singleMachineMax_textBox.Text.ToString());
                    //game_serverSetting.AllPlayerBankerMax = Int32.Parse(this.allPlayerBankerMax_textBox.Text.ToString());
                    //game_serverSetting.AllTieNoteMax = Int32.Parse(this.allTieNoteMax_textBox.Text.ToString());
                    //game_serverSetting.AllPlayerPairMax = Int32.Parse(this.allPlayerPairMax_textBox.Text.ToString());
                    //game_serverSetting.AllBankerPairMax = Int32.Parse(this.allBankerPairMax_textBox.Text.ToString());
                    //game_serverSetting.AllMax = Int32.Parse(this.allMax_textBox.Text.ToString());
                    //game_serverSetting.BetOverInvalid = Convert.ToBoolean(this.betOverInvalid_checkBox.Checked);

                    ////VoiceSetting
                    //game_serverSetting.UseBGM = Convert.ToBoolean(this.useBGM_checkBox.Checked);
                    //game_serverSetting.BGM = Int32.Parse(this.bgm_trackBar.Value.ToString());
                    //game_serverSetting.UseVoice = Convert.ToBoolean(this.useVoice_checkBox.Checked);
                    //game_serverSetting.Voice = Int32.Parse(this.voice_trackBar.Value.ToString());
                    //game_serverSetting.UseChips = Convert.ToBoolean(this.useChips_checkBox.Checked);
                    //game_serverSetting.Chips = Int32.Parse(this.chips_trackBar.Value.ToString());
                    //game_serverSetting.UseReciprocal = Convert.ToBoolean(this.useReciprocal_checkBox.Checked);
                    //game_serverSetting.Reciprocal = Int32.Parse(this.reciprocal_trackBar.Value.ToString());

                    ////SingleMachine
                    //game_serverSetting.RetentionBtn = Convert.ToBoolean(this.retentionBtn_checkBox.Checked);
                    //game_serverSetting.RetiredBtn = Convert.ToBoolean(this.retiredBtn_checkBox.Checked);
                    //game_serverSetting.DayCardAndStopCard = Convert.ToBoolean(this.dayCardAndStopCard_checkBox.Checked);
                    //game_serverSetting.BigWayShowPair = Convert.ToBoolean(this.bigWayShowPair_checkBox.Checked);
                    //game_serverSetting.UseChipsIndex = Convert.ToBoolean(this.useChipsIndex_checkBox.Checked);
                    //game_serverSetting.UseChipsDrop = Convert.ToBoolean(this.useChipsDrop_checkBox.Checked);
                    //game_serverSetting.BigWay = Convert.ToBoolean(this.bigWay_checkBox.Checked);
                    //game_serverSetting.ThreeWay = Convert.ToBoolean(this.threeWay_checkBox.Checked);
                    //game_serverSetting.BigWayNine = Convert.ToBoolean(this.bigWayNine_checkBox.Checked);
                    //game_serverSetting.CockroachWay = Convert.ToBoolean(this.cockroachWay_checkBox.Checked);
                    //game_serverSetting.BigCockroachWay = Convert.ToBoolean(this.bigCockroachWay_checkBox.Checked);
                    //game_serverSetting.BeforeRecord = Int32.Parse(this.beforeRecord_comboBox.SelectedIndex.ToString());
                    //game_serverSetting.RecordLoadNum = Int32.Parse(this.recordLoadNum_comboBox.SelectedItem.ToString());
                    //game_serverSetting.LoginKeepsNum = Int32.Parse(this.loginKeepsNum_comboBox.SelectedItem.ToString());
                    //game_serverSetting.BeforeRecordMenu = Convert.ToBoolean(this.beforeRecordMenu_checkBox.Checked);
                    //game_serverSetting.GameRuleMenu = Convert.ToBoolean(this.gameRuleMenu_checkBox.Checked);
                    //game_serverSetting.LoginBtn = Convert.ToBoolean(this.loginBtn_checkBox.Checked);
                    //game_serverSetting.LogoutBtn = Convert.ToBoolean(this.logoutBtn_checkBox.Checked);

                    ////FeaturesSetting
                    //game_serverSetting.PBOnlyOne = Convert.ToBoolean(this.pbOnlyOne_checkBox.Checked);
                    //game_serverSetting.RemainingPointCanOther = Convert.ToBoolean(this.remainingPointCanOther_checkBox.Checked);
                    //game_serverSetting.DecimalPoint = Int32.Parse(this.decimalPoint_comboBox.SelectedIndex.ToString());
                    //game_serverSetting.BetInfo = Int32.Parse(this.betInfo_comboBox.SelectedIndex.ToString());
                    //game_serverSetting.TableNumber = this.tableNumber_textBox.Text.ToString();
                    //game_serverSetting.BGColor = Int32.Parse(this.bgColor_comboBox.SelectedIndex.ToString());

                    ////PukerBack
                    //game_serverSetting.UseFixedBackBtn = Convert.ToBoolean(this.useFixedBackBtn_radioButton.Checked);
                    //game_serverSetting.UseFixedBack = this.comboBoxpuker.SelectedItem.ToString();
                    //game_serverSetting.ChangeBackRoundBtn = Convert.ToBoolean(this.changeBackRoundBtn_radioButton.Checked);
                    //game_serverSetting.ChangeBackRound = Int32.Parse(this.changeBackRound_comboBox.SelectedItem.ToString());
                    //game_serverSetting.PickBacks1 = Convert.ToBoolean(this.pickBacks1_checkBox.Checked);
                    //game_serverSetting.PickBacks2 = Convert.ToBoolean(this.pickBacks2_checkBox.Checked);
                    //game_serverSetting.PickBacks3 = Convert.ToBoolean(this.pickBacks3_checkBox.Checked);

                    ////New17Keys
                    //game_serverSetting.KeyM = Int32.Parse(this.comboBoxKeyM.SelectedIndex.ToString());
                    //game_serverSetting.KeyJ = Int32.Parse(this.comboBoxKeyJ.SelectedIndex.ToString());
                    //game_serverSetting.KeyQ = Int32.Parse(this.comboBoxKeyQ.SelectedIndex.ToString());
                    //game_serverSetting.KeyW = Int32.Parse(this.comboBoxKeyW.SelectedIndex.ToString());

                    ////MsgSetting
                    //game_serverSetting.MsgFixed = Convert.ToBoolean(this.msgFixed_radioButton.Checked);
                    //game_serverSetting.MsgFixedValue = Int32.Parse(this.msgFixedValue_comboBox.SelectedIndex.ToString());
                    //game_serverSetting.MsgChange = Convert.ToBoolean(this.msgChange_radioButton.Checked);
                    //game_serverSetting.MsgChangeValue = Int32.Parse(this.msgChangeValue_comboBox.SelectedIndex.ToString());
                    //game_serverSetting.Msg1 = this.msg1_textBox.ToString();
                    //game_serverSetting.Msg2 = this.msg2_textBox.ToString();
                    //game_serverSetting.Msg3 = this.msg3_textBox.ToString();

                    ////CardTotNum
                    //game_serverSetting.OpenRound = Int32.Parse(this.openRound_comboBox.SelectedIndex.ToString());

                    ////CutCardFeatures
                    //game_serverSetting.AutoCutCard = Convert.ToBoolean(this.autoCutCard_checkBox.Checked);
                    //game_serverSetting.Round = Int32.Parse(this.round_comboBox.SelectedItem.ToString());
                    //game_serverSetting.Num = Int32.Parse(this.num_comboBox.SelectedItem.ToString());
                    #endregion

                    //賦值,並寄送設定檔資訊
                    SettingValue game_serverSetting = new SettingValue();              //讀入Setting檔案
                    game_settingObj = game_serverSetting.ReadGS_userSettings_obj();
                    Form1.Self.game_settingObj = game_settingObj;
                    var msg = (game_settingObj.MsgSetting.MsgFixed) ? game_serverSetting.show_Msg(game_settingObj) : game_settingObj.MsgSetting.Msg1;

                    //寄送設定資訊
                    SendSaveSetting(msg);

                    //更新server值
                    refleshServerShowSetting();
                }
            }
            

        }

        //判斷押注設定2中是否有不合理的數字(或非數字)
        private bool CheckBetSetting2number()
        {
            bool canSave = true;
            string[] strArray = { singleNoteMin_textBox.Text.ToString(), singleNoteMax_textBox.Text.ToString(), tieNoteMin_textBox.Text.ToString(), tieNoteMax_textBox.Text.ToString(),
                                  playerPairMin_textBox.Text.ToString(), playerPairMax_textBox.Text.ToString(), bankerPairMin_textBox.Text.ToString(), bankerPairMax_textBox.Text.ToString(),
                                  singleMachineMax_textBox.Text.ToString(), allPlayerBankerMax_textBox.Text.ToString(), allTieNoteMax_textBox.Text.ToString(), allPlayerPairMax_textBox.Text.ToString(),
                                  allBankerPairMax_textBox.Text.ToString(), allMax_textBox.Text.ToString()};

            foreach (var item in strArray)
            {
                try
                {
                    int i = Convert.ToInt32(item.Trim());
                }
                catch
                {
                    canSave = false;                    
                    break;
                }
            }

            return canSave;
        }

        //判斷押注設定2中的max與min值的關係是否合理
        private string CheckBetSetting2MaxMin()
        {
            string msg = "";

            //單注最低 > 單注最高
            if (Int32.Parse(singleNoteMin_textBox.Text.ToString().Trim()) > Int32.Parse(singleNoteMax_textBox.Text.ToString().Trim()) && Int32.Parse(singleNoteMax_textBox.Text.ToString().Trim()) != 0)
            {
                msg = "單注限額設定錯誤!";
            }

            //和注最低 > 和注最高
            if (Int32.Parse(tieNoteMin_textBox.Text.ToString().Trim()) > Int32.Parse(tieNoteMax_textBox.Text.ToString().Trim()) && Int32.Parse(tieNoteMax_textBox.Text.ToString().Trim()) != 0)
            {
                msg = "和注限額設定錯誤!";
            }

            //間對最低 > 間對最高
            if (Int32.Parse(playerPairMin_textBox.Text.ToString().Trim()) > Int32.Parse(playerPairMax_textBox.Text.ToString().Trim()) && Int32.Parse(playerPairMax_textBox.Text.ToString().Trim()) != 0)
            {
                msg = "閒對限額設定錯誤!";
            }

            //莊對最低 > 莊對最高
            if (Int32.Parse(bankerPairMin_textBox.Text.ToString().Trim()) > Int32.Parse(bankerPairMax_textBox.Text.ToString().Trim()) && Int32.Parse(bankerPairMax_textBox.Text.ToString().Trim()) != 0)
            {
                msg = "莊對限額設定錯誤!";
            }

            return msg;
        }


        //寄送設定項資訊
        private void SendSaveSetting(string msg)
        {
            //寄送設定資訊
            var resultSetting = new
            {
                action = "Setting",
                msg = msg,
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
                openRound = game_settingObj.CardTotNum.OpenRound,

                status = Form1.Self.status
            };

            Form1.Self.allSockets.ToList().ForEach(s => s.Send(JsonConvert.SerializeObject(resultSetting)));
        }


        private void Exit_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void ResetNowPage_Click(object sender, EventArgs e)
        {
            //看停留在哪個頁面就回復哪頁的設定
            RootObject game_OriginSettingObj = new RootObject();                 //檔案設定物件
            SettingValue game_setting = new SettingValue();                      //讀入檔案
            game_OriginSettingObj = game_setting.ReadGS_originSettings_obj();
            var tabName = this.tabControl1.SelectedTab.Name;

            switch (tabName)
            {
                case "GameTime":
                    game_settingObj.GameTime.BettingTime = game_OriginSettingObj.GameTime.BettingTime;
                    game_settingObj.GameTime.SettlementTime = game_OriginSettingObj.GameTime.SettlementTime;
                    break;
                case "BettingSetting":
                    game_settingObj.BettingSetting.Denomination1 = game_OriginSettingObj.BettingSetting.Denomination1;
                    game_settingObj.BettingSetting.Denomination2 = game_OriginSettingObj.BettingSetting.Denomination2;
                    game_settingObj.BettingSetting.Denomination3 = game_OriginSettingObj.BettingSetting.Denomination3;
                    game_settingObj.BettingSetting.Denomination4 = game_OriginSettingObj.BettingSetting.Denomination4;
                    game_settingObj.BettingSetting.Denomination5 = game_OriginSettingObj.BettingSetting.Denomination5;
                    game_settingObj.BettingSetting.TieBet = game_OriginSettingObj.BettingSetting.TieBet;
                    game_settingObj.BettingSetting.RemainingPointBet = game_OriginSettingObj.BettingSetting.RemainingPointBet;
                    game_settingObj.BettingSetting.AutoRetention = game_OriginSettingObj.BettingSetting.AutoRetention;
                    break;
                case "BettingSetting2":
                    game_settingObj.BettingSetting2.SingleNoteMin = game_OriginSettingObj.BettingSetting2.SingleNoteMin;
                    game_settingObj.BettingSetting2.SingleNoteMax = game_OriginSettingObj.BettingSetting2.SingleNoteMax;
                    game_settingObj.BettingSetting2.TieNoteMin = game_OriginSettingObj.BettingSetting2.TieNoteMin;
                    game_settingObj.BettingSetting2.TieNoteMax = game_OriginSettingObj.BettingSetting2.TieNoteMax;
                    game_settingObj.BettingSetting2.PlayerPairMin = game_OriginSettingObj.BettingSetting2.PlayerPairMin;
                    game_settingObj.BettingSetting2.PlayerPairMax = game_OriginSettingObj.BettingSetting2.PlayerPairMax;
                    game_settingObj.BettingSetting2.BankerPairMin = game_OriginSettingObj.BettingSetting2.BankerPairMin;
                    game_settingObj.BettingSetting2.BankerPairMax = game_OriginSettingObj.BettingSetting2.BankerPairMax;
                    game_settingObj.BettingSetting2.SingleMachineMax = game_OriginSettingObj.BettingSetting2.SingleMachineMax;
                    game_settingObj.BettingSetting2.AllPlayerBankerMax = game_OriginSettingObj.BettingSetting2.AllPlayerBankerMax;
                    game_settingObj.BettingSetting2.AllTieNoteMax = game_OriginSettingObj.BettingSetting2.AllTieNoteMax;
                    game_settingObj.BettingSetting2.AllPlayerPairMax = game_OriginSettingObj.BettingSetting2.AllPlayerPairMax;
                    game_settingObj.BettingSetting2.AllBankerPairMax = game_OriginSettingObj.BettingSetting2.AllBankerPairMax;
                    game_settingObj.BettingSetting2.AllMax = game_OriginSettingObj.BettingSetting2.AllMax;
                    game_settingObj.BettingSetting2.BetOverInvalid = game_OriginSettingObj.BettingSetting2.BetOverInvalid;
                    break;
                case "VoiceSetting":
                    game_settingObj.VoiceSetting.UseBGM = game_OriginSettingObj.VoiceSetting.UseBGM;
                    game_settingObj.VoiceSetting.BGM = game_OriginSettingObj.VoiceSetting.BGM;
                    game_settingObj.VoiceSetting.UseVoice = game_OriginSettingObj.VoiceSetting.UseVoice;
                    game_settingObj.VoiceSetting.Voice = game_OriginSettingObj.VoiceSetting.Voice;
                    game_settingObj.VoiceSetting.UseChips = game_OriginSettingObj.VoiceSetting.UseChips;
                    game_settingObj.VoiceSetting.Chips = game_OriginSettingObj.VoiceSetting.Chips;
                    game_settingObj.VoiceSetting.UseReciprocal = game_OriginSettingObj.VoiceSetting.UseReciprocal;
                    game_settingObj.VoiceSetting.Reciprocal = game_OriginSettingObj.VoiceSetting.Reciprocal;
                    break;
                case "SingleMachine":
                    game_settingObj.SingleMachine.RetentionBtn = game_OriginSettingObj.SingleMachine.RetentionBtn;
                    game_settingObj.SingleMachine.RetiredBtn = game_OriginSettingObj.SingleMachine.RetiredBtn;
                    game_settingObj.SingleMachine.DayCardAndStopCard = game_OriginSettingObj.SingleMachine.DayCardAndStopCard;
                    game_settingObj.SingleMachine.BigWayShowPair = game_OriginSettingObj.SingleMachine.BigWayShowPair;
                    game_settingObj.SingleMachine.UseChipsIndex = game_OriginSettingObj.SingleMachine.UseChipsIndex;
                    game_settingObj.SingleMachine.UseChipsDrop = game_OriginSettingObj.SingleMachine.UseChipsDrop;
                    game_settingObj.SingleMachine.BigWay = game_OriginSettingObj.SingleMachine.BigWay;
                    game_settingObj.SingleMachine.ThreeWay = game_OriginSettingObj.SingleMachine.ThreeWay;
                    game_settingObj.SingleMachine.BigWayNine = game_OriginSettingObj.SingleMachine.BigWayNine;
                    game_settingObj.SingleMachine.CockroachWay = game_OriginSettingObj.SingleMachine.CockroachWay;
                    game_settingObj.SingleMachine.BigCockroachWay = game_OriginSettingObj.SingleMachine.BigCockroachWay;
                    game_settingObj.SingleMachine.BeforeRecord = game_OriginSettingObj.SingleMachine.BeforeRecord;
                    game_settingObj.SingleMachine.RecordLoadNum = game_OriginSettingObj.SingleMachine.RecordLoadNum;
                    game_settingObj.SingleMachine.LoginKeepsNum = game_OriginSettingObj.SingleMachine.LoginKeepsNum;
                    game_settingObj.SingleMachine.BeforeRecordMenu = game_OriginSettingObj.SingleMachine.BeforeRecordMenu;
                    game_settingObj.SingleMachine.GameRuleMenu = game_OriginSettingObj.SingleMachine.GameRuleMenu;
                    game_settingObj.SingleMachine.LoginBtn = game_OriginSettingObj.SingleMachine.LoginBtn;
                    game_settingObj.SingleMachine.LogoutBtn = game_OriginSettingObj.SingleMachine.LogoutBtn;
                    break;
                case "FeaturesSetting":
                    game_settingObj.FeaturesSetting.PBOnlyOne = game_OriginSettingObj.FeaturesSetting.PBOnlyOne;
                    game_settingObj.FeaturesSetting.RemainingPointCanOther = game_OriginSettingObj.FeaturesSetting.RemainingPointCanOther;
                    game_settingObj.FeaturesSetting.DecimalPoint = game_OriginSettingObj.FeaturesSetting.DecimalPoint;
                    game_settingObj.FeaturesSetting.BetInfo = game_OriginSettingObj.FeaturesSetting.BetInfo;
                    game_settingObj.FeaturesSetting.TableNumber = game_OriginSettingObj.FeaturesSetting.TableNumber;
                    game_settingObj.FeaturesSetting.BGColor = game_OriginSettingObj.FeaturesSetting.BGColor;
                    break;
                case "PukerBack":
                    game_settingObj.PukerBack.UseFixedBackBtn = game_OriginSettingObj.PukerBack.UseFixedBackBtn;
                    game_settingObj.PukerBack.UseFixedBack = game_OriginSettingObj.PukerBack.UseFixedBack;
                    game_settingObj.PukerBack.ChangeBackRoundBtn = game_OriginSettingObj.PukerBack.ChangeBackRoundBtn;
                    game_settingObj.PukerBack.ChangeBackRound = game_OriginSettingObj.PukerBack.ChangeBackRound;
                    game_settingObj.PukerBack.PickBacks1 = game_OriginSettingObj.PukerBack.PickBacks1;
                    game_settingObj.PukerBack.PickBacks2 = game_OriginSettingObj.PukerBack.PickBacks2;
                    game_settingObj.PukerBack.PickBacks3 = game_OriginSettingObj.PukerBack.PickBacks3;
                    break;
                case "New17Keys":
                    game_settingObj.New17Keys.KeyM = game_OriginSettingObj.New17Keys.KeyM;
                    game_settingObj.New17Keys.KeyJ = game_OriginSettingObj.New17Keys.KeyJ;
                    game_settingObj.New17Keys.KeyQ = game_OriginSettingObj.New17Keys.KeyQ;
                    game_settingObj.New17Keys.KeyW = game_OriginSettingObj.New17Keys.KeyW;
                    break;
                case "MsgSetting":
                    game_settingObj.MsgSetting.MsgFixed = game_OriginSettingObj.MsgSetting.MsgFixed;
                    game_settingObj.MsgSetting.MsgFixedValue = game_OriginSettingObj.MsgSetting.MsgFixedValue;
                    game_settingObj.MsgSetting.MsgChange = game_OriginSettingObj.MsgSetting.MsgChange;
                    game_settingObj.MsgSetting.MsgChangeValue = game_OriginSettingObj.MsgSetting.MsgChangeValue;
                    game_settingObj.MsgSetting.Msg1 = game_OriginSettingObj.MsgSetting.Msg1;
                    game_settingObj.MsgSetting.Msg2 = game_OriginSettingObj.MsgSetting.Msg2;
                    game_settingObj.MsgSetting.Msg3 = game_OriginSettingObj.MsgSetting.Msg3;
                    break;
                case "CardTotNum":
                    game_settingObj.CardTotNum.OpenRound = game_OriginSettingObj.CardTotNum.OpenRound;
                    break;
                case "CutCardFeatures":
                    game_settingObj.CutCardFeatures.AutoCutCard = game_OriginSettingObj.CutCardFeatures.AutoCutCard;
                    game_settingObj.CutCardFeatures.Round = game_OriginSettingObj.CutCardFeatures.Round;
                    game_settingObj.CutCardFeatures.Num = game_OriginSettingObj.CutCardFeatures.Num;
                    break;
                default:
                    break;
            }

            //更新server值
            refleshServerShowSetting();
        }

        private void AllReset_Click(object sender, EventArgs e)
        {
            //回復全部設定
            SettingValue game_setting = new SettingValue();                      //讀入檔案
            game_settingObj = game_setting.ReadGS_originSettings_obj();

            //更新server值
            refleshServerShowSetting();
        }

        //更新server的設定檔值
        private void refleshServerShowSetting()
        {
            var D1 = game_settingObj.BettingSetting.Denomination1.ToString();
            var D2 = game_settingObj.BettingSetting.Denomination2.ToString();
            var D3 = game_settingObj.BettingSetting.Denomination3.ToString();
            var D4 = game_settingObj.BettingSetting.Denomination4.ToString();
            var D5 = game_settingObj.BettingSetting.Denomination5.ToString();

            if (game_settingObj.BettingSetting.Denomination1.ToString() == "0" || game_settingObj.BettingSetting.Denomination1.ToString() == "-1")
            {
                if (game_settingObj.BettingSetting.Denomination1.ToString() == "0")
                {
                    D1 = "單注最高限額";
                }
                else
                {
                    D1 = "無";
                }
            }
            if (game_settingObj.BettingSetting.Denomination2.ToString() == "0" || game_settingObj.BettingSetting.Denomination2.ToString() == "-1")
            {
                if (game_settingObj.BettingSetting.Denomination2.ToString() == "0")
                {
                    D2 = "單注最高限額";
                }
                else
                {
                    D2 = "無";
                }
            }
            if (game_settingObj.BettingSetting.Denomination3.ToString() == "0" || game_settingObj.BettingSetting.Denomination3.ToString() == "-1")
            {
                if (game_settingObj.BettingSetting.Denomination3.ToString() == "0")
                {
                    D3 = "單注最高限額";
                }
                else
                {
                    D3 = "無";
                }
            }
            if (game_settingObj.BettingSetting.Denomination4.ToString() == "0" || game_settingObj.BettingSetting.Denomination4.ToString() == "-1")
            {
                if (game_settingObj.BettingSetting.Denomination4.ToString() == "0")
                {
                    D4 = "單注最高限額";
                }
                else
                {
                    D4 = "無";
                }
            }
            if (game_settingObj.BettingSetting.Denomination5.ToString() == "0" || game_settingObj.BettingSetting.Denomination5.ToString() == "-1")
            {
                if (game_settingObj.BettingSetting.Denomination5.ToString() == "0")
                {
                    D5 = "單注最高限額";
                }
                else
                {
                    D5 = "無";
                }
            }

            //將設定項賦值
            #region  設定項賦值
            //GameTime
            this.betTime_comboBox.Text = game_settingObj.GameTime.BettingTime.ToString();
            this.settlementTime_comboBox.Text = game_settingObj.GameTime.SettlementTime.ToString();

            //BettingSetting
            //this.denomination1_comboBox.Text = (game_settingObj.BettingSetting.Denomination1.ToString() == "0") ? "單注最高限額" : game_settingObj.BettingSetting.Denomination1.ToString();
            //this.denomination2_comboBox.Text = (game_settingObj.BettingSetting.Denomination2.ToString() == "0") ? "單注最高限額" : game_settingObj.BettingSetting.Denomination2.ToString();
            //this.denomination3_comboBox.Text = (game_settingObj.BettingSetting.Denomination3.ToString() == "0") ? "單注最高限額" : game_settingObj.BettingSetting.Denomination3.ToString();
            //this.denomination4_comboBox.Text = (game_settingObj.BettingSetting.Denomination4.ToString() == "0") ? "單注最高限額" : game_settingObj.BettingSetting.Denomination4.ToString();
            //this.denomination5_comboBox.Text = (game_settingObj.BettingSetting.Denomination5.ToString() == "0") ? "單注最高限額" : game_settingObj.BettingSetting.Denomination5.ToString();
            this.denomination1_comboBox.Text = D1;
            this.denomination2_comboBox.Text = D2;
            this.denomination3_comboBox.Text = D3;
            this.denomination4_comboBox.Text = D4;
            this.denomination5_comboBox.Text = D5;
            this.tieBet_checkBox.Checked = game_settingObj.BettingSetting.TieBet;
            this.remainingPointBet_checkBox.Checked = game_settingObj.BettingSetting.RemainingPointBet;
            this.autoRetention_checkBox.Checked = game_settingObj.BettingSetting.AutoRetention;

            //BettingSetting2
            this.singleNoteMin_textBox.Text = game_settingObj.BettingSetting2.SingleNoteMin.ToString();
            this.singleNoteMax_textBox.Text = game_settingObj.BettingSetting2.SingleNoteMax.ToString();
            this.tieNoteMin_textBox.Text = game_settingObj.BettingSetting2.TieNoteMin.ToString();
            this.tieNoteMax_textBox.Text = game_settingObj.BettingSetting2.TieNoteMax.ToString();
            this.playerPairMin_textBox.Text = game_settingObj.BettingSetting2.PlayerPairMin.ToString();
            this.playerPairMax_textBox.Text = game_settingObj.BettingSetting2.PlayerPairMax.ToString();
            this.bankerPairMin_textBox.Text = game_settingObj.BettingSetting2.BankerPairMin.ToString();
            this.bankerPairMax_textBox.Text = game_settingObj.BettingSetting2.BankerPairMax.ToString();
            this.singleMachineMax_textBox.Text = game_settingObj.BettingSetting2.SingleMachineMax.ToString();
            this.allPlayerBankerMax_textBox.Text = game_settingObj.BettingSetting2.AllPlayerBankerMax.ToString();
            this.allTieNoteMax_textBox.Text = game_settingObj.BettingSetting2.AllTieNoteMax.ToString();
            this.allPlayerPairMax_textBox.Text = game_settingObj.BettingSetting2.AllPlayerPairMax.ToString();
            this.allBankerPairMax_textBox.Text = game_settingObj.BettingSetting2.AllBankerPairMax.ToString();
            this.allMax_textBox.Text = game_settingObj.BettingSetting2.AllMax.ToString();
            this.betOverInvalid_checkBox.Checked = game_settingObj.BettingSetting2.BetOverInvalid;

            //VoiceSetting
            this.useBGM_checkBox.Checked = game_settingObj.VoiceSetting.UseBGM;
            this.bgm_trackBar.Value = game_settingObj.VoiceSetting.BGM;
            this.useVoice_checkBox.Checked = game_settingObj.VoiceSetting.UseVoice;
            this.voice_trackBar.Value = game_settingObj.VoiceSetting.Voice;
            this.useChips_checkBox.Checked = game_settingObj.VoiceSetting.UseChips;
            this.chips_trackBar.Value = game_settingObj.VoiceSetting.Chips;
            this.useReciprocal_checkBox.Checked = game_settingObj.VoiceSetting.UseReciprocal;
            this.reciprocal_trackBar.Value = game_settingObj.VoiceSetting.Reciprocal;

            //SingleMachine
            this.retentionBtn_checkBox.Checked = game_settingObj.SingleMachine.RetentionBtn;
            this.retiredBtn_checkBox.Checked = game_settingObj.SingleMachine.RetiredBtn;
            this.dayCardAndStopCard_checkBox.Checked = game_settingObj.SingleMachine.DayCardAndStopCard;
            this.bigWayShowPair_checkBox.Checked = game_settingObj.SingleMachine.BigWayShowPair;
            this.useChipsIndex_checkBox.Checked = game_settingObj.SingleMachine.UseChipsIndex;
            this.useChipsDrop_checkBox.Checked = game_settingObj.SingleMachine.UseChipsDrop;
            this.bigWay_checkBox.Checked = game_settingObj.SingleMachine.BigWay;
            this.threeWay_checkBox.Checked = game_settingObj.SingleMachine.ThreeWay;
            this.bigWayNine_checkBox.Checked = game_settingObj.SingleMachine.BigWayNine;
            this.cockroachWay_checkBox.Checked = game_settingObj.SingleMachine.CockroachWay;
            this.bigCockroachWay_checkBox.Checked = game_settingObj.SingleMachine.BigCockroachWay;
            this.beforeRecord_comboBox.SelectedIndex = game_settingObj.SingleMachine.BeforeRecord;
            this.recordLoadNum_comboBox.Text = game_settingObj.SingleMachine.RecordLoadNum.ToString();
            this.loginKeepsNum_comboBox.Text = game_settingObj.SingleMachine.LoginKeepsNum.ToString();
            this.beforeRecordMenu_checkBox.Checked = game_settingObj.SingleMachine.BeforeRecordMenu;
            this.gameRuleMenu_checkBox.Checked = game_settingObj.SingleMachine.GameRuleMenu;
            this.loginBtn_checkBox.Checked = game_settingObj.SingleMachine.LoginBtn;
            this.logoutBtn_checkBox.Checked = game_settingObj.SingleMachine.LogoutBtn;

            //FeaturesSetting
            this.pbOnlyOne_checkBox.Checked = game_settingObj.FeaturesSetting.PBOnlyOne;
            this.remainingPointCanOther_checkBox.Checked = game_settingObj.FeaturesSetting.RemainingPointCanOther;
            this.decimalPoint_comboBox.SelectedIndex = game_settingObj.FeaturesSetting.DecimalPoint;
            this.betInfo_comboBox.SelectedIndex = game_settingObj.FeaturesSetting.BetInfo;
            this.tableNumber_textBox.Text = game_settingObj.FeaturesSetting.TableNumber;
            this.bgColor_comboBox.SelectedIndex = game_settingObj.FeaturesSetting.BGColor;

            //PukerBack
            this.useFixedBackBtn_radioButton.Checked = game_settingObj.PukerBack.UseFixedBackBtn;
            this.comboBoxpuker.Text = game_settingObj.PukerBack.UseFixedBack;
            this.changeBackRoundBtn_radioButton.Checked = game_settingObj.PukerBack.ChangeBackRoundBtn;
            this.changeBackRound_comboBox.Text = game_settingObj.PukerBack.ChangeBackRound.ToString();
            this.pickBacks1_checkBox.Checked = game_settingObj.PukerBack.PickBacks1;
            this.pickBacks2_checkBox.Checked = game_settingObj.PukerBack.PickBacks2;
            this.pickBacks3_checkBox.Checked = game_settingObj.PukerBack.PickBacks3;

            //New17Keys
            this.comboBoxKeyM.SelectedIndex = game_settingObj.New17Keys.KeyM;
            this.comboBoxKeyJ.SelectedIndex = game_settingObj.New17Keys.KeyJ;
            this.comboBoxKeyQ.SelectedIndex = game_settingObj.New17Keys.KeyQ;
            this.comboBoxKeyW.SelectedIndex = game_settingObj.New17Keys.KeyW;

            //MsgSetting
            this.msgFixed_radioButton.Checked = game_settingObj.MsgSetting.MsgFixed;
            this.msgFixedValue_comboBox.SelectedIndex = game_settingObj.MsgSetting.MsgFixedValue;
            this.msgChange_radioButton.Checked = game_settingObj.MsgSetting.MsgChange;
            this.msgChangeValue_comboBox.SelectedIndex = game_settingObj.MsgSetting.MsgChangeValue;
            this.msg1_textBox.Text = game_settingObj.MsgSetting.Msg1;
            this.msg2_textBox.Text = game_settingObj.MsgSetting.Msg2;
            this.msg3_textBox.Text = game_settingObj.MsgSetting.Msg3;

            //CardTotNum
            this.openRound_comboBox.Text = game_settingObj.CardTotNum.OpenRound.ToString();

            //CutCardFeatures
            this.autoCutCard_checkBox.Checked = game_settingObj.CutCardFeatures.AutoCutCard;
            this.round_comboBox.Text = game_settingObj.CutCardFeatures.Round.ToString();
            this.num_comboBox.Text = game_settingObj.CutCardFeatures.Num.ToString();

            #endregion
        }

        private void checkInputHasNum(KeyPressEventArgs e)
        {
            //加入限制輸入條件 http://www.cnblogs.com/meimao5211/p/3334177.html
            //判斷半形 https://zhidao.baidu.com/question/282454878.html

            //判斷是否為數字或Backspace
            if (!Char.IsNumber(e.KeyChar) && e.KeyChar != (char)8)
            {
                e.Handled = true;
            }
            else
            {
                if (e.KeyChar != (char)8)
                {
                    //判斷是否為半形數字
                    int num = (int)e.KeyChar;
                    if (!(num >= 48 && num <= 57))
                    {
                        e.Handled = true;
                    }

                }
            }
        }

        //押注設定2輸入項判定

        private void singleNoteMin_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void singleNoteMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void tieNoteMin_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void tieNoteMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void playerPairMin_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void playerPairMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void bankerPairMin_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void bankerPairMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void singleMachineMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void allPlayerBankerMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void allTieNoteMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void allPlayerPairMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void allBankerPairMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }

        private void allMax_textBox_KeyPress(object sender, KeyPressEventArgs e)
        {
            checkInputHasNum(e);
        }
    }

    

   
}
