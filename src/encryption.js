const crypto = require('crypto');

const ALGORITHM = {
    /**
     * AES256 is an authenticated encryption mode that
     * not only provides confidentiality but also 
     * provides integrity in a secured way
     * */
    BLOCK_CIPHER: 'aes256',

    /**
     * NIST recommends 128 bits or 16 bytes IV for AES256
     * to promote interoperability, efficiency, and
     * simplicity of design
     */
    IV_BYTE_LEN: 16,

    /**
     * Note: 256 (in algorithm name) is key size. 
     * Block size for AES is always 128
     */
    KEY_BYTE_LEN: 32,

    /**
     * To prevent rainbow table attacks
     * */
    SALT_BYTE_LEN: 16
};

const _getIV = () => crypto.randomBytes(ALGORITHM.IV_BYTE_LEN);

/**
 * To prevent rainbow table attacks
 * */
const _getSalt = () => crypto.randomBytes(ALGORITHM.SALT_BYTE_LEN);

/**
 * 
 * @param {String} password - The password to be used for generating key
 * @param {Buffer} salt 
 * @returns 
 */
const _getKeyFromPassword = (password, salt) => {
    return crypto.scryptSync(password, salt, ALGORITHM.KEY_BYTE_LEN);
}


/**
 * 
 * @param {*} text - The clear text to be encrypted, default encoding UTF-8
 * @param {*} password - The password to be used for encryption
 * @param {import('crypto').Encoding} inputEncoding 
 * @param {import('crypto').Encoding} outputEncoding 
 * @returns {*} Encrypted text, default encoding BASE64
 */
const encrypt = (text, password, inputEncoding = 'utf-8', outputEncoding = 'base64') => {
    const iv = _getIV();
    const salt = _getSalt();
    const key = _getKeyFromPassword(password, salt)
    const cipher = crypto.createCipheriv(ALGORITHM.BLOCK_CIPHER, key, iv);
    let encryptedMessage = cipher.update(text, inputEncoding);
    encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
    encryptedMessage = Buffer.concat([iv, encryptedMessage, salt])
    return outputEncoding ? encryptedMessage.toString(outputEncoding) : encryptedMessage;
}

/**
 * 
 * @param {*} ciphertext - Cipher text, default encoding BASE64
 * @param {*} password - The password to be used for decryption
 * @param {import('crypto').Encoding}} inputEncoding 
 * @param {import('crypto').Encoding}} outputEncoding 
 * @returns {*} - Decrypted text, default encoding UTF-8
 */
const decrypt = (ciphertext, password, inputEncoding = 'base64', outputEncoding = 'utf-8') => {
    ciphertext = (!inputEncoding || Buffer.isBuffer(ciphertext)) ? ciphertext : Buffer.from(ciphertext, inputEncoding)
    const salt = ciphertext.slice(-ALGORITHM.SALT_BYTE_LEN);
    const key = _getKeyFromPassword(password, salt)
    const iv = ciphertext.slice(0, ALGORITHM.IV_BYTE_LEN);
    const encryptedMessage = ciphertext.slice(ALGORITHM.IV_BYTE_LEN, -ALGORITHM.SALT_BYTE_LEN);
    const decipher = crypto.createDecipheriv(ALGORITHM.BLOCK_CIPHER, key, iv);
    let messagetext = decipher.update(encryptedMessage);
    messagetext = Buffer.concat([messagetext, decipher.final()]);
    return outputEncoding ? messagetext.toString(outputEncoding) : messagetext;
}

module.exports = {
    encrypt,
    decrypt
}