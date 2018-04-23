using GameServer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameServer
{
    public class GameTime
    {
        public int BettingTime { get; set; }
        public int SettlementTime { get; set; }
    }

    public class BettingSetting
    {
        public int Denomination1 { get; set; }
        public int Denomination2 { get; set; }
        public int Denomination3 { get; set; }
        public int Denomination4 { get; set; }
        public int Denomination5 { get; set; }
        public bool TieBet { get; set; }
        public bool RemainingPointBet { get; set; }
        public bool AutoRetention { get; set; }
    }

    public class BettingSetting2
    {
        public int SingleNoteMin { get; set; }
        public int SingleNoteMax { get; set; }
        public int TieNoteMin { get; set; }
        public int TieNoteMax { get; set; }
        public int PlayerPairMin { get; set; }
        public int PlayerPairMax { get; set; }
        public int BankerPairMin { get; set; }
        public int BankerPairMax { get; set; }
        public int SingleMachineMax { get; set; }
        public int AllPlayerBankerMax { get; set; }
        public int AllTieNoteMax { get; set; }
        public int AllPlayerPairMax { get; set; }
        public int AllBankerPairMax { get; set; }
        public int AllMax { get; set; }
        public bool BetOverInvalid { get; set; }
    }

    public class VoiceSetting
    {
        public bool UseBGM { get; set; }
        public int BGM { get; set; }
        public bool UseVoice { get; set; }
        public int Voice { get; set; }
        public bool UseChips { get; set; }
        public int Chips { get; set; }
        public bool UseReciprocal { get; set; }
        public int Reciprocal { get; set; }
    }

    public class SingleMachine
    {
        public bool RetentionBtn { get; set; }
        public bool RetiredBtn { get; set; }
        public bool DayCardAndStopCard { get; set; }
        public bool BigWayShowPair { get; set; }
        public bool UseChipsIndex { get; set; }
        public bool UseChipsDrop { get; set; }
        public bool BigWay { get; set; }
        public bool ThreeWay { get; set; }
        public bool BigWayNine { get; set; }
        public bool CockroachWay { get; set; }
        public bool BigCockroachWay { get; set; }
        public int BeforeRecord { get; set; }
        public int RecordLoadNum { get; set; }
        public int LoginKeepsNum { get; set; }
        public bool BeforeRecordMenu { get; set; }
        public bool GameRuleMenu { get; set; }
        public bool LoginBtn { get; set; }
        public bool LogoutBtn { get; set; }
    }

    public class FeaturesSetting
    {
        public bool PBOnlyOne { get; set; }
        public bool RemainingPointCanOther { get; set; }
        public int DecimalPoint { get; set; }
        public int BetInfo { get; set; }
        public string TableNumber { get; set; }
        public int BGColor { get; set; }
    }

    public class PukerBack
    {
        public bool UseFixedBackBtn { get; set; }
        public string UseFixedBack { get; set; }
        public bool ChangeBackRoundBtn { get; set; }
        public int ChangeBackRound { get; set; }
        public bool PickBacks1 { get; set; }
        public bool PickBacks2 { get; set; }
        public bool PickBacks3 { get; set; }
    }

    public class New17Keys
    {
        public int KeyM { get; set; }
        public int KeyJ { get; set; }
        public int KeyQ { get; set; }
        public int KeyW { get; set; }
    }

    public class MsgSetting
    {
        public bool MsgFixed { get; set; }
        public int MsgFixedValue { get; set; }
        public bool MsgChange { get; set; }
        public int MsgChangeValue { get; set; }
        public string Msg1 { get; set; }
        public string Msg2 { get; set; }
        public string Msg3 { get; set; }
    }

    public class CardTotNum
    {
        public int OpenRound { get; set; }
    }

    public class CutCardFeatures
    {
        public bool AutoCutCard { get; set; }
        public int Round { get; set; }
        public int Num { get; set; }
    }

    public class RootObject
    {
        public GameTime GameTime { get; set; }
        public BettingSetting BettingSetting { get; set; }
        public BettingSetting2 BettingSetting2 { get; set; }
        public VoiceSetting VoiceSetting { get; set; }
        public SingleMachine SingleMachine { get; set; }
        public FeaturesSetting FeaturesSetting { get; set; }
        public PukerBack PukerBack { get; set; }
        public New17Keys New17Keys { get; set; }
        public MsgSetting MsgSetting { get; set; }
        public CardTotNum CardTotNum { get; set; }
        public CutCardFeatures CutCardFeatures { get; set; }
    }

    public class ServerUserView
    {
        public int no { get; set; }
        public string userId { get; set; }
        

        //加入資料
        public ServerUserView(int no, string userId)
        {
            this.no = no;
            this.userId = userId;
        }
    }

    


}
