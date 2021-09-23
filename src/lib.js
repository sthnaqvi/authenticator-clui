'use strict';

const otplib = require("otplib");
const cron = require('node-schedule');
const Table = require('cli-table');

const log = require('./log');
const accounts = require('./accounts');


/**
 * 
 * @param {String} secret 
 * @param {Number} intervel 
 * @param {function} cb 
 */
function generate2FACode(secret, intervel, cb) {
    if (intervel && typeof intervel == "function") {
        cb = intervel;
        intervel = 30;
    };

    const token = otplib.authenticator.generate(secret);
    cb(token)
    cron.scheduleJob(`*/${intervel} * * * * *`, function () {
        const token = otplib.authenticator.generate(secret);
        cb(token)
    });
};

/**
 * 
 * @param {Number} intervel Default 30 secs
 * 
 * @returns {Number}
 */
const getTimeout = (intervel = 30) => {
    const curr_date = new Date();
    const curr_seconds = curr_date.getSeconds();
    return (intervel - curr_seconds % intervel)
};

/**
 * Update TOTP account.totp with updated value
 * @param {Array} accounts 
 */
function updateTotp(accounts) {
    for (let account of accounts) {
        generate2FACode(account.totpSecret, function (topt) {
            account.name_with_issuer = account.issuer ? `${account.issuer}(${account.name})` : account.name;
            account.totp = topt;
        })
    }
}

/**
 * Run authenticator on CMD
 * @param {String} password 
 */
function run(password) {
    console.log("Starting authenticator ...");
    let tr_timeout = 1000; //Table refresh timeout for expiry timer
    let _accounts = accounts.get(password);
    if (_accounts && Object.keys(_accounts).length) {
        console.log(`${Object.keys(_accounts).length} account(s) found`);
        updateTotp(_accounts);
        setInterval(function () {
            // instantiate
            const table = new Table({
                head: ['Name', 'Auth Code', "Expire In"]
                // , colWidths: [20, 30]
            });
            // table is an Array, so you can `push`, `unshift`, `splice` and friends
            for (let account of _accounts) {
                table.push([account.name_with_issuer, account.totp, getTimeout()])
            }
            log(table)
        }, tr_timeout);
    } else {
        throw "No accout found";
    }
}

module.exports = {
    run,
    accounts
}