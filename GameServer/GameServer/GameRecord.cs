using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameServer
{

    // [[100,1,1,2,3,4,5,6],[2,5,8,7]](第幾局,幾場,發出的牌...或總計)
    // [[場, 局, PC1, BC1, PC2, BC2, PC3, BC3, 閒總分, 莊總分, 開牌結果, 遊戲時間]]
    public class GameRecord
    {
        public int gameField { get; set; }
        public int gameRound { get; set; }
        public int PC1 { get; set; }
        public int BC1 { get; set; }
        public int PC2 { get; set; }
        public int BC2 { get; set; }
        public int PC3 { get; set; }
        public int BC3 { get; set; }
        public int playerSum { get; set; }
        public int bankerSum { get; set; }
        public int winner { get; set; }
        public int pair { get; set; }
        public DateTime time { get; set; }
    }

    public class PreRecords
    {
        public int ID { get; set; }
        public int gameField { get; set; }
        public int gameRound { get; set; }
        public int PC1 { get; set; }
        public int BC1 { get; set; }
        public int PC2 { get; set; }
        public int BC2 { get; set; }
        public int PC3 { get; set; }
        public int BC3 { get; set; }
        public int playerSum { get; set; }
        public int bankerSum { get; set; }
        public int winner { get; set; }
        public int pair { get; set; }
        public string time { get; set; }
    }

    //最後遊戲紀錄
    public class LastGameRecord
    {
        public int id { get; set; }
        public int field { get; set; }
        public int round { get; set; }
        public int player_win { get; set; }
        public int tie { get; set; }
        public int banker_win { get; set; }
        public int player_pair { get; set; }
        public int banker_pair { get; set; }
        public int card { get; set; }
    }

    //登入或使用成員
    public class MemberList
    {
        public Fleck.IWebSocketConnection user_socket { get; set; }
        public string account { get; set; }
        public string password { get; set; }
        public BettingPoint bettingPoint { get; set; }
        public BettingPoint pre_bettingPoint { get; set; }
        public List<BettingPoint> haveBet { get; set; }
        public int recordLoadNum { get; set; }     //記錄載入筆數
        public int loginKeepsNum { get; set; }     //登入後多保留場數
        public double user_point { get; set; }
        public int aliveTime { get; set; } //寄送存活訊息未回應次數
        //public int loginKeepsNum_add { get; set; } 
        //public int nowRecordsID { get; set; }
    }

    public class BettingPoint
    {
        public int field { get; set; }
        public int round { get; set; }
        public int winner { get; set; }
        public double player_btn { get; set; }
        public double playerPair_btn { get; set; }
        public double tie_btn { get; set; }
        public double bankerPair_btn { get; set; }
        public double banker_btn { get; set; }
        public double totPoint { get; set; }    //總押點
        public double totGetPoint { get; set; } //總得點
        public double allTotPoint { get; set; } //總點

        //標記餘分籌碼
        public bool player_R { get; set; }
        public bool banker_R { get; set; }
        public bool tie_R { get; set; }
        public bool playerP_R { get; set; }
        public bool bankerP_R { get; set; }

        //得分
        public double playerBet { get; set; }
        public double tieBet { get; set; }
        public double bankerBet { get; set; }
        public double playPairBet { get; set; }
        public double bankPairBet { get; set; }

    }

    public class BetInfoTotPoint
    {
        //全場押注
        public double playerAllBet { get; set; }
        public double tieAllBet { get; set; }
        public double bankerAllBet { get; set; }
        public double playPairAllBet { get; set; }
        public double bankPairAllBet { get; set; }
    }

    public class getBetPointResult
    {
        public double playerBet { get; set; }
        public double tieBet { get; set; }
        public double bankerBet { get; set; }
        public double playPairBet { get; set; }
        public double bankPairBet { get; set; }
    }



}
