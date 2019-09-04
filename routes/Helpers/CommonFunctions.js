const express = require('express');
const bodyparser = require('body-parser');
const request = require("request");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const router = express.Router();
app.use(bodyparser.json());
let date = require('date-and-time');


//SQL connection
const database = require("./database");

function GetCurrentWalletBalance(userId, callback) {
  console.log("userId" + userId);
    database.db.query('select * from  wallet where UserId =? order by TransactionDate desc', [userId], (err, rows, fields) => {
        console.log("err"+ err);
        if (!err && rows.length > 0) {
            console.log("BALANCE" + rows[0].AvailableBalance);
            return callback(rows[0].AvailableBalance);
        } else {
            return 0;
        }
    });

}

function AddUserWalletLogs(userId, amount, referenceId, description, isCredit, callback) {
    database.db.query('select * from  wallet where UserId =? order by TransactionDate desc', [userId], (err, rows, fields) => {


        if (!err && rows.length > 0) {
            let availableBalance = 0;

            if (isCredit) {
                availableBalance = rows[0].AvailableBalance + amount;
            } else {
                availableBalance = rows[0].AvailableBalance - amount;
            }

            database.db.query('insert into wallet(UserId, LastTransaction, AvailableBalance, ReferenceId, Description, IsCredit)\n' +
                'values (' + userId + ',' + amount + ',' + availableBalance + ',' + referenceId + ',\'' + description + '\', ' + isCredit + ')', (err, rows, fields) => {
                                return callback(true);
            });

        } else {
            database.db.query('insert into wallet(UserId, LastTransaction, AvailableBalance, ReferenceId, Description, IsCredit)\n' +
                'values (' + userId + ',' + amount + ',' + amount + ',' + referenceId + ',\'' + description + '\', ' + isCredit + ')', (err, rows, fields) => {

                return callback(true);
            });
        }
    });
}


module.exports = {
    GetCurrentWalletBalance: GetCurrentWalletBalance,
    AddUserWalletLogs: AddUserWalletLogs
};
