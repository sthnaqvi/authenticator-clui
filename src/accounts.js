const protobuf = require("protobufjs");
const fs = require("fs-extra");

const base32 = require('./edbase32');
const path = require("path");

const BACKUP_DIR = 'local_data';
const BACKUP_ACCOUNT_FILE = 'accounts.txt';

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
 * To check accounts data are exist
 * @returns {Boolean} 
 */
function check() {
    const backup_file_path = path.join(BACKUP_DIR, BACKUP_ACCOUNT_FILE);
    try {
        let accounts_data = fs.readFileSync(backup_file_path, 'utf-8');
        accounts_data = JSON.parse(accounts_data);
        return (accounts_data ? Object.keys(accounts_data).length : false);
    } catch (error) {
        return false;
    }
}

/**
 * Get accounts data
 * 
 * @returns {Array} 
 */
function get() {
    const backup_file_path = path.join(BACKUP_DIR, BACKUP_ACCOUNT_FILE);
    try {
        let accounts_data = fs.readFileSync(backup_file_path, 'utf-8');
        accounts_data = JSON.parse(accounts_data);
        return accounts_data;
    } catch (error) {
        //TODO: Hanlde error
        throw error;
    }
}

/**
 * Seed accounts from URI
 * 
 * @param {String} uri 
 */
function seed(uri) {
    const backup_file_path = path.join(BACKUP_DIR, BACKUP_ACCOUNT_FILE);
    const accounts = parseAccountsFromUri(uri);
    try {
        fs.ensureDirSync(BACKUP_DIR)
        fs.writeFileSync(backup_file_path, JSON.stringify(accounts));
        console.log(`${accounts.length} account(s) imported successfully`);
    } catch (error) {
        //TODO: Hanlde error
        throw error;
    }
}

/**
 * Delete accounts backup file from local
 * 
 */
function flush() {
    const backup_file_path = path.join(BACKUP_DIR, BACKUP_ACCOUNT_FILE);

    try {
        fs.unlinkSync(backup_file_path);
        console.log(`all account(s) deleted successfully`);
    } catch (error) {
        //TODO: Hanlde error
        throw error;
    }
}

module.exports = {
    check,
    get,
    seed,
    flush
}