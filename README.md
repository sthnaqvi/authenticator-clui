# authenticator-clui

[![NPM](https://nodei.co/npm/authenticator-clui.png)](https://nodei.co/npm/authenticator-clui/)

[![Node version](https://img.shields.io/node/v/authenticator-clui.svg?style=flat)](http://nodejs.org/download/)
[![npm version](https://badge.fury.io/js/authenticator-clui.svg)](https://badge.fury.io/js/authenticator-clui)
[![Build Status](https://app.travis-ci.com/sthnaqvi/authenticator-clui.svg?branch=master)](https://app.travis-ci.com/sthnaqvi/authenticator-clui)
[![Coverage](https://img.shields.io/codecov/c/github/sthnaqvi/authenticator-clui.svg?style=flat-square)](https://codecov.io/github/sthnaqvi/authenticator-clui)
[![Dependency Status](https://img.shields.io/david/sthnaqvi/authenticator-clui.svg?style=flat-square)](https://david-dm.org/sthnaqvi/authenticator-clui)
[![Inline docs](http://inch-ci.org/github/sthnaqvi/authenticator-clui.svg?branch=master)](http://inch-ci.org/github/sthnaqvi/authenticator-clui)
[![Known npm Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/authenticator-clui.svg?label=npm%20vulnerabilities&style=flat-square)](https://snyk.io/test/npm/authenticator-clui)
[![Known Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/sthnaqvi/authenticator-clui.svg?label=repo%20vulnerabilities&style=flat-square&targetFile=package.json)](https://snyk.io/test/github/sthnaqvi/authenticator-clui?targetFile=package.json)


A simple command-line authenticator (import accounts from Google Authenticator, Microsoft Authenticator and Facebook Authenticator)

![alt text](https://github.com/sthnaqvi/explorer/raw/master/readme_assets/cli_authenticator.png "CLI Authenticator")


## Table of contents

- [Installation](#installation)
- [Run Authenticator](#run-authenticator)
- [Import Accounts](#import-accounts)
- [Export Accounts](#steps-to-export-accounts-from-google-authenticator)
- [Permission denied when installing npm modules in OSX](#permission-denied-when-installing-npm-modules-in-osx)


## Installation

### Install with npm globally:

```
npm install -g authenticator-clui
```

---
## Run Authenticator
### Run authenticator with imported account(s)

```
authenticator --run
```
[back to top](#table-of-contents)

---
## Import Accounts

### Use [export accounts steps](#steps-to-export-accounts-from-google-authenticator) and copy URI from your phone then run `--import <with copy URI>`

```
authenticator --import "otpauth-migration://offline?data=CicKFFFFNi94eGM5bGxUUWlQcWxJSjU0EgR0ZXN0GgNvdHAgASgBMAIQARgBIAA%3D"
```
* Don't forgot to use `"double quotes"` in account URI

[back to top](#table-of-contents)

---
## Steps to export accounts from Google Authenticator

### Get accounts URI
Open Google Authenticator click on `...` then click Export accounts then click Continue select the account(s) which you want to export then click Export then you got the QRcode.
Use [online QRcode decoder to decode](https://zxing.org) the QRcode and get the URI.

![alt text](https://github.com/sthnaqvi/explorer/raw/master/readme_assets/export_authenticator_backup.gif "export URI from Google Authenticator")

[back to top](#table-of-contents)
___

## Permission denied when installing npm modules in OSX
Saw this from [Fixing npm permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions) and it helped, maybe you could give it a shot as well. 

### Option 1: Change the permission to npm's default directory

1. Find the path to npm's directory:

     `npm config get prefix`

 For many systems, this will be `/usr/local`.

 **WARNING**: If the displayed path is just `/usr`, switch to *Option 2* or you will mess up your permissions.

2. Change the owner of npm's directories to the name of the current user (your username):

     `sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}`

 This changes the permissions of the sub-folders used by npm and some other tools (`lib/node_modules`, `bin`, and `share`).

### Option 2: Change npm's default directory to another directory

There are times when you do not want to change ownership of the default directory that npm uses (i.e. `/usr`) as this could cause some problems, for example if you are sharing the system with other users.

Instead, you can configure npm to use a different directory altogether. In our case, this will be a hidden directory in our home folder.

1. Make a directory for global installations:

     `mkdir ~/.npm-global`

2. Configure npm to use the new directory path:

     `npm config set prefix '~/.npm-global'`

3. Open or create a `~/.profile` file and add this line:

     `export PATH=~/.npm-global/bin:$PATH`

4. Back on the command line, update your system variables:

     `source ~/.profile`

**Test**: Download a package globally without using `sudo`.

    `npm install node-g.raphael --save`

Instead of steps 2-4, you can use the corresponding ENV variable (e.g. if you don't want to modify `~/.profile`):

    NPM_CONFIG_PREFIX=~/.npm-global

### Option 3: Use a package manager that takes care of this for you.

If you're doing a fresh install of Node on Mac OS, you can avoid this problem altogether by using the `Homebrew` package manager. `Homebrew` sets things up out of the box with the correct permissions.

`brew install node`

[back to top](#table-of-contents)

---