using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Data;
using System.IO;
using System.Windows.Forms;

namespace GameServer
{
    class SettingValue
    {

        /// <summary>
        /// 讀入setting檔並賦值(讀取使用者設定過的設定項)
        /// </summary>
        /// <returns>轉換為object的json檔</returns>
        public RootObject ReadGS_userSettings_obj()
        {
            var strjson = File.ReadAllText(System.AppDomain.CurrentDomain.BaseDirectory + "GS_userSettings.json");
            RootObject rootObject = JsonConvert.DeserializeObject<RootObject>(strjson);
            return rootObject;
        }

        /// <summary>
        /// 寫入setting檔並賦值(讀取原設定)
        /// </summary>
        /// <returns>轉換為object的json檔</returns>
        public RootObject ReadGS_originSettings_obj()
        {
            var strjson = File.ReadAllText(System.AppDomain.CurrentDomain.BaseDirectory + "GS_originSettings.json");
            RootObject rootObject = JsonConvert.DeserializeObject<RootObject>(strjson);
            return rootObject;
        }

        /// <summary>
        /// 取出第幾則消息
        /// </summary>
        /// <param name="rootObject">設定項object</param>
        /// <returns>消息文字</returns>
        public string show_Msg(RootObject rootObject)
        {
            var msg = "";
            switch (rootObject.MsgSetting.MsgFixedValue)
            {
                case 0:
                    msg = rootObject.MsgSetting.Msg1;
                    return msg;
                case 1:
                    msg = rootObject.MsgSetting.Msg2;
                    return msg;
                case 2:
                    msg = rootObject.MsgSetting.Msg3;
                    return msg;
                default:
                    msg = rootObject.MsgSetting.Msg1;
                    return msg;
            }

        }

        /// <summary>
        /// 取出隔幾場換消息
        /// </summary>
        /// <param name="msgIndex">設定項MsgChangeValue的值</param>
        /// <returns>間隔場次</returns>
        public int change_Msg(int msgIndex)
        {
            switch (msgIndex)
            {
                case 0:
                    return 1;
                case 1:
                    return 2;
                case 2:
                    return 3;
                case 3:
                    return 5;
                default:
                    return 1;
            }
        }

 





    }


    class DataGridViewForWs : DataGridView
    {
        protected override void OnPaint(PaintEventArgs e)
        {
            try
            {
                base.OnPaint(e);
            }
            catch
            {
                Invalidate();
            }
        }
    }
}
