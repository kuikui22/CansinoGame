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
    public partial class ThrowPoint : Form
    {
        string dbHost = "127.0.0.1"; //資料庫位址
        string dbUser = "root";
        string dbPass = "123456";
        //string dbPass = "00000000";
        string dbName = "bc_casion";


        string user_account;       //使用者帳號
        double user_point;         //使用者分數

        public ThrowPoint()
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

        private void AllThrowBtn_Click(object sender, EventArgs e)
        {
            checkPoint(user_point);
            this.Close();
        }

        private void CloseBtn_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void ThrowPointBtn_Click(object sender, EventArgs e)
        {
            int num;
            int.TryParse(textBox1.Text.Trim(), out num);
            checkPoint((double)num);
            this.Close();
        }

        /// <summary>
        /// 取出使用者分數
        /// </summary>
        /// <param name="userAccount">使用者帳號</param>
        /// <returns>使用者分數</returns>
        private double userPoint(string userAccount)
        {
            foreach (var item in Form1.Self.memberList)
            {
                if (item.account == user_account)
                {
                    return item.user_point;
                }
            }


            //double point = 0;
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

            return 0;
        }

        /// <summary>
        /// 將使用者分數 Update
        /// </summary>
        /// <param name="point">輸入的分數</param>
        private void userPoint_updatePoint(double point)
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

        private void checkPoint(double num)
        {
            if (num > 0)
            {
                var point = user_point - num;

                //棄分若超過現有分數(導致分數負分)視同全棄
                if (point < 0)
                {
                    point = 0;
                    num = user_point;
                }
                //如果原本就是 0點,則再棄點還是0點,不將紀錄送至client
                if (point != user_point)
                {
                    userPoint_updatePoint(point);

                    foreach (var item in Form1.Self.memberList)
                    {
                        if (item.account == user_account)
                        {
                            var betPoint = (item.user_point - num < 0) ? 0 : (item.user_point - num);
                            item.user_point = betPoint;

                            //寄送棄分資訊給client
                            var result = new
                            {
                                action = "ThrowPoint",
                                user_point = Math.Floor(betPoint * 10) / 10,
                                throw_point = num,
                                totPoint = item.bettingPoint.totPoint
                            };
                            item.user_socket.Send(JsonConvert.SerializeObject(result));
                        }
                    }
                }
            }
            else
            {
                MessageBox.Show("金額不正確");
            }
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
