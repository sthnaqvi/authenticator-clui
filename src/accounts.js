const protobuf = require("protobufjs");
const fs = require("fs-extra");
const path = require("path");

const base32 = require('./edbase32');
const { encrypt, decrypt } = require('./encryption');

const BACKUP_DIR = '../local_data';
const BACKUP_ACCOUNT_FILE = 'accounts.txt';
const BACKUP_DIR_FILE_PATH = path.join(__dirname, BACKUP_DIR);
const BACKUP_ACCOUNT_FILE_PATH = path.join(BACKUP_DIR_FILE_PATH, BACKUP_ACCOUNT_FILE);

/**
 * Google Authenticator uses protobuff to encode the 2fa data.
 * 
 * @param {Uint8Array} payload 
 */
function decodeProtobuf(payload) {
    const root = protobuf.loadSync(path.join(__dirname, "google_auth.proto"));

    const MigrationPayload = root.lookupType("googleauth.MigrationPayload");

    const message = MigrationPayload.decode(payload);

    return MigrationPayload.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
    })
}

/**
 * Convert a base64 to base32. 
 * Most Time based One Time Password (TOTP) 
 * password managers use this as the "secret key" when generating a code.
 * 
 * An example is: https://totp.danhersam.com/.
 * 
 * @returns RFC3548 compliant base32 string
 */
function toBase32(base64String) {
    const raw = Buffer.from(base64String, "base64");
    return base32.encode(raw);
}

/**
 * The data in the URI from Google Authenticator
 *  is a protobuff payload which is Base64 encoded and then URI encoded.
 * This function decodes those, and then decodes the protobuf data contained inside.
 * 
 * @param {String} data the `data` query parameter from the totp migration string that google authenticator outputs.
 */
function decode(data) {
    const buffer = Buffer.from(decodeURIComponent(data), "base64");

    const payload = decodeProtobuf(buffer);

    const accounts = payload.otpParameters.map(account => {
        account.totpSecret = toBase32(account.secret);
        return account;
    })

    return accounts;
}

/**
 * Parse accounts data from URI
 * @param {String} uri Google Authenticator exported accounts uri (Use QR reader to get this)
 * 
 * @returns {Array} accounts data
 */
function parseAccountsFromUri(uri) {
    const queryParams = new URL(uri).search;
    const data = new URLSearchParams(queryParams).get("data");
    const accounts = decode(data);
    return accounts
}

/**
 * To validate accounts backup file exist
 * @returns {Boolean} 
 */
function isValidBackupFile() {
    try {
        let backup_file_data = fs.readFileSync(BACKUP_ACCOUNT_FILE_PATH, 'utf-8');
        return typeof JSON.parse(backup_file_data) == "object";
    } catch (error) {
        return false;
    }
}

/**
 * To validate accounts data are encrypted
 * @returns {Boolean} 
 */
function isEncrypted() {
    try {
        let backup_file_data = fs.readFileSync(BACKUP_ACCOUNT_FILE_PATH, 'utf-8');
        let { is_encrypted } = JSON.parse(backup_file_data);
        return is_encrypted;
    } catch (error) {
        //TODO: Hanlde error
        throw error;
    }
}

/**
 * To validate accounts data are exist and it's valid
 * @param {String} password 
 * @returns {Boolean} 
 */
function isValid(password) {
    try {
        let backup_file_data = fs.readFileSync(BACKUP_ACCOUNT_FILE_PATH, 'utf-8');
        let { is_encrypted, accounts } = JSON.parse(backup_file_data);
        accounts = is_encrypted ? decrypt(accounts, password) : accounts;
        accounts = JSON.parse(accounts);
        return (accounts && Array.isArray(accounts) ? accounts.length : false);
    } catch (error) {
        return false;
    }
}

/**
 * Get accounts data
 * 
 * @param {String} password 
 * @returns 
 */
function get(password) {
    try {
        let backup_file_data = fs.readFileSync(BACKUP_ACCOUNT_FILE_PATH, 'utf-8');
        let { is_encrypted, accounts } = JSON.parse(backup_file_data);
        accounts = is_encrypted ? decrypt(accounts, password) : accounts;
        accounts = JSON.parse(accounts);
        return accounts;
    } catch (error) {
        //TODO: Hanlde error
        throw error;
    }
}

/**
 * Seed accounts from URI
 * 
 * @param {String} uri 
 * @param {String} password 
 */
function seed(uri, password) {
    try {
        let accounts = parseAccountsFromUri(uri);
        const accountLength = accounts.length
        accounts = JSON.stringify(accounts);
        const backup_file_data = {
            is_encrypted: !!password,
            accounts: password ? encrypt(accounts, password) : accounts
        }
        fs.ensureDirSync(BACKUP_DIR_FILE_PATH)
        fs.writeFileSync(BACKUP_ACCOUNT_FILE_PATH, JSON.stringify(backup_file_data));
        console.log(`✅ ${accountLength} account(s) imported successfully`);
    } catch (error) {
        //TODO: Hanlde error
        throw error;
    }
}

/**
 * Delete accounts backup file from local
 * 
 */
function flushAll() {

    try {
        fs.unlinkSync(BACKUP_ACCOUNT_FILE_PATH);
        console.log(`all account(s) deleted successfully`);
    } catch (error) {
        //TODO: Hanlde error
        throw error;
    }
}

module.exports = {
    isValidBackupFile,
    isEncrypted,
    isValid,
    get,
    seed,
    flushAll
}