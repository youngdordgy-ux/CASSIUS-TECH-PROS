const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
const botName = settings.botName || 'CASSIUS TECH PROS';
const version = settings.version || '3.0.8';
const owner = settings.botOwner || 'CASSIUS';
const channelLink = global.channelLink || 'https://whatsapp.com/channel/0029VbDeT5tKwqSM5FGMaK3p';

const helpMessage = `

╔══════════════════════════╗
🤖 ${botName}
╠══════════════════════════╣
Version: ${version}
Owner: ${owner}
Channel: CASSIUS TECH PROS
╚══════════════════════════╝

Available Commands:

╔═══════════════════╗
🌐 General Commands:
║ ➤ .help or .menu
║ ➤ .ping
║ ➤ .alive
║ ➤ .tts <text>
║ ➤ .owner
║ ➤ .joke
║ ➤ .quote
║ ➤ .fact
║ ➤ .weather <city>
║ ➤ .news
║ ➤ .attp <text>
║ ➤ .lyrics <song_title>
║ ➤ .8ball <question>
║ ➤ .groupinfo
║ ➤ .staff or .admins
║ ➤ .vv
║ ➤ .vv2
║ ➤ .trt <text> <lang>
║ ➤ .ss <link>
║ ➤ .jid
║ ➤ .url
╚═══════════════════╝

╔═══════════════════╗
👮‍♂️ Admin Commands:
║ ➤ .ban @user
║ ➤ .promote @user
║ ➤ .demote @user
║ ➤ .mute <minutes>
║ ➤ .unmute
║ ➤ .delete or .del
║ ➤ .kick @user
║ ➤ .warnings @user
║ ➤ .warn @user
║ ➤ .antilink
║ ➤ .antibadword
║ ➤ .clear
║ ➤ .tag <message>
║ ➤ .tagall
║ ➤ .tagnotadmin
║ ➤ .hidetag <message>
║ ➤ .chatbot
║ ➤ .resetlink
║ ➤ .antitag <on/off>
║ ➤ .welcome <on/off>
║ ➤ .goodbye <on/off>
║ ➤ .antibot <on/off/set/get>
║ ➤ .setgdesc <description>
║ ➤ .setgname <new name>
║ ➤ .setgpp (reply to image)
║ ➤ .groupstatus [caption/text]
╚═══════════════════╝

╔═══════════════════╗
🔒 Owner Commands:
║ ➤ .mode <public/private>
║ ➤ .clearsession
║ ➤ .antidelete
║ ➤ .cleartmp
║ ➤ .update
║ ➤ .settings
║ ➤ .setpp <reply to image>
║ ➤ .autoreact <on/off>
║ ➤ .autostatus <on/off>
║ ➤ .autostatus react <on/off>
║ ➤ .savestatus [on/off]
║ ➤ .autotyping <on/off>
║ ➤ .autoread <on/off>
║ ➤ .anticall <on/off>
║ ➤ .pmblocker <on/off/status>
║ ➤ .pmblocker setmsg <text>
║ ➤ .setmention <reply to msg>
║ ➤ .mention <on/off>
╚═══════════════════╝

╔═══════════════════╗
🎨 Image/Sticker Commands:
║ ➤ .blur <image>
║ ➤ .simage <reply to sticker>
║ ➤ .sticker <reply to image>
║ ➤ .removebg
║ ➤ .remini
║ ➤ .crop
║ ➤ .tgsticker <link>
║ ➤ .meme
║ ➤ .take <packname>
║ ➤ .emojimix <emj1>+<emj2>
║ ➤ .igs <insta link>
║ ➤ .igsc <insta link>
╚═══════════════════╝

╔═══════════════════╗
🖼️ Pics Commands:
║ ➤ .pies <country>
║ ➤ .china
║ ➤ .indonesia
║ ➤ .japan
║ ➤ .korea
║ ➤ .hijab
╚═══════════════════╝

╔═══════════════════╗
🎮 Game Commands:
║ ➤ .tictactoe @user
║ ➤ .hangman
║ ➤ .guess <letter>
║ ➤ .trivia
║ ➤ .answer <answer>
║ ➤ .truth
║ ➤ .dare
╚═══════════════════╝

╔═══════════════════╗
🤖 AI Commands:
║ ➤ .ai <question>
║ ➤ .gpt <question>
║ ➤ .gemini <question>
║ ➤ .imagine <prompt>
║ ➤ .flux <prompt>
║ ➤ .sora <prompt>
╚═══════════════════╝

╔═══════════════════╗
🎯 Fun Commands:
║ ➤ .compliment @user
║ ➤ .insult @user
║ ➤ .flirt
║ ➤ .shayari
║ ➤ .goodnight
║ ➤ .roseday
║ ➤ .character @user
║ ➤ .wasted @user
║ ➤ .ship @user
║ ➤ .simp @user
║ ➤ .stupid @user [text]
╚═══════════════════╝

╔═══════════════════╗
🔤 Textmaker:
║ ➤ .metallic <text>
║ ➤ .ice <text>
║ ➤ .snow <text>
║ ➤ .impressive <text>
║ ➤ .matrix <text>
║ ➤ .light <text>
║ ➤ .neon <text>
║ ➤ .devil <text>
║ ➤ .purple <text>
║ ➤ .thunder <text>
║ ➤ .leaves <text>
║ ➤ .1917 <text>
║ ➤ .arena <text>
║ ➤ .hacker <text>
║ ➤ .sand <text>
║ ➤ .blackpink <text>
║ ➤ .glitch <text>
║ ➤ .fire <text>
╚═══════════════════╝

╔═══════════════════╗
📥 Downloader:
║ ➤ .play <song_name>
║ ➤ .song <song_name>
║ ➤ .spotify <query>
║ ➤ .instagram <link>
║ ➤ .facebook <link>
║ ➤ .twitter <link>
║ ➤ .tiktok <link>
║ ➤ .video <song_name>
║ ➤ .ytmp4 <link>
╚═══════════════════╝

╔═══════════════════╗
🧩 MISC:
║ ➤ .heart
║ ➤ .horny
║ ➤ .circle
║ ➤ .lgbt
║ ➤ .lolice
║ ➤ .its-so-stupid
║ ➤ .namecard
║ ➤ .oogway
║ ➤ .tweet
║ ➤ .ytcomment
║ ➤ .comrade
║ ➤ .gay
║ ➤ .glass
║ ➤ .jail
║ ➤ .passed
║ ➤ .triggered
╚═══════════════════╝

╔═══════════════════╗
🖼️ ANIME:
║ ➤ .nom
║ ➤ .poke
║ ➤ .cry
║ ➤ .kiss
║ ➤ .pat
║ ➤ .hug
║ ➤ .wink
║ ➤ .facepalm
╚═══════════════════╝

╔═══════════════════╗
💻 GitHub Commands:
║ ➤ .git
║ ➤ .github
║ ➤ .sc
║ ➤ .script
║ ➤ .repo
╚═══════════════════╝

📢 Join our official channel:
${https://whatsapp.com/channel/0029VbDeT5tKwqSM5FGMaK3p}

━━━━━━━━━━━━━━━━━━━━
⚡ POWERED BY CASSIUS TECH PROS
👑 OWNER: CASSIUS
━━━━━━━━━━━━━━━━━━━━
`;

try {
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');

    const contextInfo = {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363161513685998@newsletter',
            newsletterName: 'CASSIUS TECH PROS',
            serverMessageId: -1
        }
    };

    if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: helpMessage,
            contextInfo
        }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, {
            text: helpMessage,
            contextInfo
        }, { quoted: message });
    }
} catch (error) {
    console.error('Error in CASSIUS TECH PROS help command:', error);
    await sock.sendMessage(chatId, {
        text: helpMessage
    }, { quoted: message });
}

}

module.exports = helpCommand;
