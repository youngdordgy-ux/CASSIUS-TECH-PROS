
/**
 * CASSIUS TECH PROS
 * WhatsApp Automation Bot
 * Developer: CASSIUS
 */

require('./settings');

const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const FileType = require('file-type');
const path = require('path');
const axios = require('axios');

const {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus
} = require('./main');

const { handleAntibotDetection } = require('./commands/antibot');
const PhoneNumber = require('awesome-phonenumber');

const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid
} = require('./lib/exif');

const {
    smsg,
    isUrl,
    generateMessageTag,
    getBuffer,
    getSizeMedia,
    fetch,
    await: wait,
    sleep,
    reSize
} = require('./lib/myfunc');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require('@whiskeysockets/baileys');

const NodeCache = require('node-cache');
const pino = require('pino');
const readline = require('readline');
const { parsePhoneNumber } = require('libphonenumber-js');
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics');
const { rmSync, existsSync } = require('fs');
const { join } = require('path');

const store = require('./lib/lightweight_store');

store.readFromFile();

const settings = require('./settings');

setInterval(() => {
    store.writeToFile();
}, settings.storeWriteInterval || 10000);

// CASSIUS TECH PROS identity
global.botname = 'CASSIUS TECH PROS';
global.themeemoji = '•';
global.packname = settings.packname;
global.author = settings.author;

// Memory optimization
setInterval(() => {
    if (global.gc) {
        global.gc();
        console.log('🧹 Garbage collection completed');
    }
}, 60000);

// Memory monitoring
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024;

    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...');
        process.exit(1);
    }
}, 30000);

let phoneNumber = settings.ownerNumber || '';

let owner = 'CASSIUS';

try {
    if (existsSync('./data/owner.json')) {
        const ownerData = JSON.parse(fs.readFileSync('./data/owner.json'));
        owner = ownerData;
    }
} catch (error) {
    console.log('Owner information will use settings configuration.');
}

const pairingCode = !!phoneNumber || process.argv.includes('--pairing-code');
const useMobile = process.argv.includes('--mobile');

const rl = process.stdin.isTTY
    ? readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    : null;

const question = (text) => {
    if (rl) {
        return new Promise(resolve => rl.question(text, resolve));
    }

    return Promise.resolve(settings.ownerNumber || phoneNumber);
};

async function startXeonBotInc() {
    try {
        const { version } = await fetchLatestBaileysVersion();

        const { state, saveCreds } =
            await useMultiFileAuthState('./session');

        const msgRetryCounterCache = new NodeCache();

        const XeonBotInc = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,

            browser: ['CASSIUS TECH PROS', 'Chrome', '1.0.0'],

            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    pino({ level: 'fatal' }).child({ level: 'fatal' })
                )
            },

            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,

            getMessage: async (key) => {
                const jid = jidNormalizedUser(key.remoteJid);
                const msg = await store.loadMessage(jid, key.id);

                return msg?.message || '';
            },

            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000
        });

        XeonBotInc.ev.on('creds.update', saveCreds);

        store.bind(XeonBotInc.ev);

        // Message handling
        XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0];

                if (!mek.message) return;

                mek.message =
                    Object.keys(mek.message)[0] === 'ephemeralMessage'
                        ? mek.message.ephemeralMessage.message
                        : mek.message;

                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    await handleStatus(XeonBotInc, chatUpdate);
                    return;
                }

                if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                    const isGroup = mek.key?.remoteJid?.endsWith('@g.us');

                    if (!isGroup) return;
                }

                // Antibot detection
                if (mek.key?.remoteJid?.endsWith('@g.us') && !mek.key.fromMe) {
                    try {
                        await handleAntibotDetection(XeonBotInc, mek);
                    } catch (abErr) {
                        console.error('[antibot] upsert hook:', abErr?.message || abErr);
                    }
                }

                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) {
                    return;
                }

                if (XeonBotInc?.msgRetryCounterCache) {
                    XeonBotInc.msgRetryCounterCache.clear();
                }

                try {
                    await handleMessages(XeonBotInc, chatUpdate, true);
                } catch (err) {
                    console.error('Error in handleMessages:', err);

                    if (mek.key && mek.key.remoteJid) {
                        await XeonBotInc.sendMessage(mek.key.remoteJid, {
                            text: '❌ An error occurred while processing your message.'
                        }).catch(console.error);
                    }
                }

            } catch (err) {
                console.error('Error in messages.upsert:', err);
            }
        });

        // Decode JID
        XeonBotInc.decodeJid = (jid) => {
            if (!jid) return jid;

            if (/:\d+@/gi.test(jid)) {
                const decode = jidDecode(jid) || {};

                return decode.user && decode.server
                    ? decode.user + '@' + decode.server
                    : jid;
            }

            return jid;
        };

        // Contacts
        XeonBotInc.ev.on('contacts.update', update => {
            for (const contact of update) {
                const id = XeonBotInc.decodeJid(contact.id);

                if (store && store.contacts) {
                    store.contacts[id] = {
                        id,
                        name: contact.notify
                    };
                }
            }
        });

        // Get contact name
        XeonBotInc.getName = (jid, withoutContact = false) => {
            const id = XeonBotInc.decodeJid(jid);

            withoutContact = XeonBotInc.withoutContact || withoutContact;

            let v;

            if (id.endsWith('@g.us')) {
                return new Promise(async resolve => {
                    v = store.contacts[id] || {};

                    if (!(v.name || v.subject)) {
                        v = XeonBotInc.groupMetadata(id) || {};
                    }

                    resolve(
                        v.name ||
                        v.subject ||
                        PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')
                    );
                });
            }

            v = id === '0@s.whatsapp.net'
                ? { id, name: 'WhatsApp' }
                : id === XeonBotInc.decodeJid(XeonBotInc.user.id)
                    ? XeonBotInc.user
                    : (store.contacts[id] || {});

            return (
                (withoutContact ? '' : v.name) ||
                v.subject ||
                v.verifiedName ||
                PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
            );
        };

        XeonBotInc.public = true;

        XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store);

        // Pairing code
        if (pairingCode && !XeonBotInc.authState.creds.registered) {
            if (useMobile) {
                throw new Error('Cannot use pairing code with mobile api');
            }

            let number = global.phoneNumber || await question(
                chalk.bgBlack(
                    chalk.greenBright(
                        'Enter your WhatsApp number with country code, without + or spaces: '
                    )
                )
            );

            number = String(number).replace(/[^0-9]/g, '');

            const pn = require('awesome-phonenumber');

            if (!pn('+' + number).isValid()) {
                console.log(chalk.red('Invalid phone number. Check your country code and number.'));
                process.exit(1);
            }

            setTimeout(async () => {
                try {
                    let code = await XeonBotInc.requestPairingCode(number);

                    code = code?.match(/.{1,4}/g)?.join('-') || code;

                    console.log(
                        chalk.black(chalk.bgGreen('Your Pairing Code: ')),
                        chalk.black(chalk.white(code))
                    );

                    console.log(chalk.yellow(
                        '\nOpen WhatsApp > Settings > Linked Devices > Link a Device.'
                    ));

                } catch (error) {
                    console.error('Error requesting pairing code:', error);
                }
            }, 3000);
        }

        // Connection handling
        XeonBotInc.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s;

            if (qr) {
                console.log(chalk.yellow('📱 QR Code generated. Scan with WhatsApp.'));
            }

            if (connection === 'connecting') {
                console.log(chalk.yellow('🔄 Connecting to WhatsApp...'));
            }

            if (connection === 'open') {
                console.log(chalk.magenta('\n'));

                console.log(
                    chalk.yellow('🌿 Connected to => ') +
                    JSON.stringify(XeonBotInc.user, null, 2)
                );

                try {
                    const botNumber =
                        XeonBotInc.user.id.split(':')[0] + '@s.whatsapp.net';

                    await XeonBotInc.sendMessage(botNumber, {
                        text:
                            '🤖 CASSIUS TECH PROS Connected Successfully!\n\n' +
                            `⏰ Time: ${new Date().toLocaleString()}\n` +
                            '✅ Status: Online and Ready!\n\n' +
                            'Powered by CASSIUS TECH PROS'
                    });

                } catch (error) {
                    console.error('Connection message error:', error.message);
                }

                await delay(1999);

                console.log(chalk.yellow(
                    `\n\n[ ${global.botname} ]\n\n`
                ));

                console.log(chalk.cyan('< ================================================== >'));
                console.log(chalk.magenta('• BOT: CASSIUS TECH PROS'));
                console.log(chalk.magenta('• DEVELOPER: CASSIUS'));
                console.log(chalk.magenta(`• OWNER: ${owner}`));
                console.log(chalk.magenta('• POWERED BY: CASSIUS TECH PROS'));
                console.log(chalk.green('• 🤖 Bot Connected Successfully! ✅'));
                console.log(chalk.blue(`Bot Version: ${settings.version}`));
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const errMsg = String(
                    lastDisconnect?.error?.message || lastDisconnect?.error || ''
                );

                const isLoggedOut =
                    statusCode === DisconnectReason.loggedOut || statusCode === 401;

                const isConflict =
                    statusCode === DisconnectReason.connectionReplaced ||
                    statusCode === 440 ||
                    /conflict|replaced/i.test(errMsg);

                const shouldReconnect = !isLoggedOut && !isConflict;

                console.log(
                    chalk.red(`Connection closed. Reconnecting: ${shouldReconnect}`)
                );

                if (isConflict) {
                    console.log(chalk.yellow('⚠️ Session conflict. Stop other bot instances.'));
                    return;
                }

                if (isLoggedOut) {
                    try {
                        rmSync('./session', {
                            recursive: true,
                            force: true
                        });

                        console.log(chalk.yellow('Session deleted. Please authenticate again.'));
                    } catch (error) {
                        console.error('Error deleting session:', error);
                    }

                    return;
                }

                if (shouldReconnect) {
                    await delay(5000);
                    startXeonBotInc();
                }
            }
        });

        // Anticall handler
        const antiCallNotified = new Set();

        XeonBotInc.ev.on('call', async calls => {
            try {
                const { readState: readAnticallState } =
                    require('./commands/anticall');

                const state = readAnticallState();

                if (!state.enabled) return;

                for (const call of calls) {
                    const callerJid = call.from || call.peerJid || call.chatId;

                    if (!callerJid) continue;

                    try {
                        try {
                            if (typeof XeonBotInc.rejectCall === 'function' && call.id) {
                                await XeonBotInc.rejectCall(call.id, callerJid);
                            } else if (typeof XeonBotInc.sendCallOfferAck === 'function' && call.id) {
                                await XeonBotInc.sendCallOfferAck(
                                    call.id,
                                    callerJid,
                                    'reject'
                                );
                            }
                        } catch {}

                        if (!antiCallNotified.has(callerJid)) {
                            antiCallNotified.add(callerJid);

                            setTimeout(() => {
                                antiCallNotified.delete(callerJid);
                            }, 60000);

                            await XeonBotInc.sendMessage(callerJid, {
                                text: '📵 Anticall is enabled. Your call was rejected.'
                            });
                        }

                    } catch {}

                    setTimeout(async () => {
                        try {
                            await XeonBotInc.updateBlockStatus(callerJid, 'block');
                        } catch {}
                    }, 800);
                }

            } catch (e) {}
        });

        XeonBotInc.ev.on('group-participants.update', async update => {
            await handleGroupParticipantUpdate(XeonBotInc, update);
        });

        XeonBotInc.ev.on('messages.upsert', async m => {
            if (m.messages[0]?.key?.remoteJid === 'status@broadcast') {
                await handleStatus(XeonBotInc, m);
            }
        });

        XeonBotInc.ev.on('status.update', async status => {
            await handleStatus(XeonBotInc, status);
        });

        XeonBotInc.ev.on('messages.reaction', async status => {
            await handleStatus(XeonBotInc, status);
        });

        return XeonBotInc;

    } catch (error) {
        console.error('Error starting CASSIUS TECH PROS:', error);
        await delay(5000);
        return startXeonBotInc();
    }
}

// Start bot
startXeonBotInc().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});

// File watcher
const file = require.resolve(__filename);

fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Updated ${__filename}`));
    delete require.cache[file];
    require(file);
});
