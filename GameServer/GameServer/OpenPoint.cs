using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GameServer
{
    public partial class OpenPoint : Form
    {
        string dbHost = "127.0.0.1"; //資料庫位址
        string dbUser = "root";
        string dbPass = "123456";
        //string dbPass = "00000000";
        string dbName = "bc_casion";


        string user_account;       //使用者帳號
        double user_point;         //使用者分數

        public OpenPoint()
        {
            InitializeComponent();
        }

        public void setAccount(string str)
        {
            user_account = str;
            user_point = userPoint(str);
            textBox2.Text = user_account;
            textBox3.Text = user_point.ToString();
        }

        private void CloseBtn_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void OpenPointBtn_Click(object sender, EventArgs e)
        {
            //開分分數需為正整數(若輸入0050 -> 50 視為正整數)
            int num;
            int.TryParse(textBox1.Text.Trim(), out num);
            if (num > 0)
            {
                var point = user_point + (double)num;
                userPoint_openPoint(point);    //更新資料庫

                foreach (var item in Form1.Self.memberList)
                {
                    if (item.account == user_account)
                    {
                        //更新押注使用的分數
                        item.user_point += num;

                        //寄送開分資訊給client
                        var result = new
                        {
                            action = "OpenPoint",
                            user_point = Math.Floor(item.user_point * 10) / 10,
                            add_point = num,
                            totPoint = item.bettingPoint.totPoint
                        };
                        item.user_socket.Send(JsonConvert.SerializeObject(result));
                    }
                }
                this.Close();
            }
            else
            {
                MessageBox.Show("金額不正確");
            }
        }

        /// <summary>
        /// 取出使用者分數
        /// </summary>
        /// <param name="userAccount">使用者帳號</param>
        /// <returns>使用者分數</returns>
        private double userPoint(string userAccount)
        {
            double point = 0;

            foreach (var item in Form1.Self.memberList)
            {
                if (item.account == user_account)
                {
                    point = item.user_point;
                }
            }
            //string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            //string sql = "SELECT point FROM member WHERE account='" + userAccount + "'";
            //MySqlConnection conn = new MySqlConnection(connStr);
            //MySqlCommand command = conn.CreateCommand();
            //conn.Open();

            //MySqlCommand cmd = new MySqlCommand(sql, conn);
            //MySqlDataReader data = cmd.ExecuteReader();
            //if (data.HasRows)
            //{
            //    while (data.Read())
            //    {
            //        point = double.Parse(data[0].ToString());
            //    }

            //    conn.Close();
            //}
            //else
            //{
            //    conn.Close();
            //}

            return point;
        }

        /// <summary>
        /// 將使用者分數 Update
        /// </summary>
        /// <param name="point">輸入的分數</param>
        private void userPoint_openPoint(double point)
        {
            string connStr = "server=" + dbHost + ";uid=" + dbUser + ";pwd=" + dbPass + ";database=" + dbName;
            string sql = "UPDATE member SET point = '" + point + "' WHERE account='" + user_account + "'";

            MySqlConnection conn = new MySqlConnection(connStr);
            MySqlCommand command = conn.CreateCommand();
            conn.Open();
            MySqlCommand cmd = new MySqlCommand(sql, conn);
            MySqlDataReader data = cmd.ExecuteReader();
            conn.Close();
        }

        private void textBox1_KeyPress(object sender, KeyPressEventArgs e)
        {
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
    }
}
