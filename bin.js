#!/usr/bin/env node

'use strict';

const { program } = require('commander');

const authenticator = require('./src/lib');

program
    .name("authenticator")
    .usage("A simple command-line authenticator (import accounts from Google Authenticator, Microsoft Authenticator and Facebook Authenticator)")
    .option('-i, --import <import otpauth-migration url>', 'Import account(s), Authenticator exported accounts URI like "otpauth-migration://offline?data=xyz" make sure URI in "double quotes" (Use QR reader to get this from export QR code)')
    .option('-d, --delete', 'Delete imported accounts !!!Can\'t restore')
    .parse(process.argv);

const options = program.opts();

if (options && Object.keys(options).length) {
    if (options.import) {
        if (authenticator.accounts.check()) {
            console.error("Accounts already exist, delete existing accounts before import");
            return program.help({ error: true });
        }
        authenticator.accounts.seed(options.import)
    }
    if (options.delete) {
        authenticator.accounts.flush()
    }
    process.exit(1);
} else {
    console.log("authenticator run")
    authenticator.run();
};