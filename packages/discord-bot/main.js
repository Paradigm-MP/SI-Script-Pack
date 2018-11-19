let ready = false;
const STEAM_API_KEY = 'YOUR STEAM API KEY HERE';
const server_id = 'YOUR DISCORD SERVER ID HERE';
const chat_server_id = 'YOUR DISCORD CHANNEL ID WHERE YOU WANT THE CHAT TO GO';
const channel_ids = 
{
    chat: 'YOUR DISCORD CHANNEL ID WHERE CHAT SHOULD BE LOGGED',
    chat_commands: 'YOUR DISCORD CHANNEL ID WHERE CHAT COMMANDS SHOULD BE LOGGED',
    kills: 'YOUR DISCORD CHANNEL ID WHERE KILLS SHOULD BE LOGGED',
    loot: 'YOUR DISCORD CHANNEL ID WHERE LOOT SHOULD BE LOGGED',
    connections: 'YOUR DISCORD CHANNEL ID WHERE CONNECTIONS SHOULD BE LOGGED',
    bans: 'YOUR DISCORD CHANNEL ID WHERE BANS SHOULD BE LOGGED',
    private_messages: 'YOUR DISCORD CHANNEL ID WHERE PRIVATE MESSAGES SHOULD BE LOGGED',
    inventory: 'YOUR DISCORD CHANNEL ID WHERE INVENTORY SHOULD BE LOGGED',
    vehicles: 'YOUR DISCORD CHANNEL ID WHERE VEHICLES SHOULD BE LOGGED',
    reports: 'YOUR DISCORD CHANNEL ID WHERE REPORTS SHOULD BE LOGGED',
    character: 'YOUR DISCORD CHANNEL ID WHERE CHARACTER SHOULD BE LOGGED',
    watchlist: 'YOUR DISCORD CHANNEL ID WHERE WATCHLIST SHOULD BE LOGGED',
    friends: 'YOUR DISCORD CHANNEL ID WHERE FRIENDS SHOULD BE LOGGED',
    staff: 'YOUR DISCORD CHANNEL ID WHERE STAFF SHOULD BE LOGGED',
    testing: 'YOUR DISCORD CHANNEL ID WHERE TESTING SHOULD BE LOGGED'
}
const roles = 
{
    Mod: 'THE DISCORD ID OF THE MOD ROLE',
    Admin: 'THE DISCORD ID OF THE ADMIN ROLE'
}

const steam = require('steam-web');
const s = new steam({ apiKey: STEAM_API_KEY, format: 'json'});
const avatars = [];
const chat = jcmp.events.Call('get_chat')[0];

jcmp.events.Add('PlayerReady', (player) => 
{
    GetSteamAvatarURL(player);
})


function GetSteamAvatarURL(player)
{
    s.getPlayerSummaries({
    steamids: [player.client.steamId],
    callback: function(err, data) 
    {
        if (data)
        {
            data.response.players.forEach(function(steam_prof) 
            {
                let avatar_url = FormatUrl(steam_prof.avatarmedium);
                avatars.push({id: player.networkId, url: avatar_url});
            });
        }
    }
    });


}

// Format url to use whitelisted steam image domain
function FormatUrl(url)
{
    let base = "http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/";
    url = url.substring(url.indexOf('/avatars/') + 9, url.length);
    url = base + url;
    return url;
}




let guild;
let guild_main;

const Discord = require('discord.js');
const client = new Discord.Client();


jcmp.events.Add('log', (channel, message) => 
{
    if (!channel_ids[channel])
    {
        console.log(`Could not log message to Discord to channel ${channel} with message ${message}.`);
        return;
    }

    LogMessage(channel, message);
})

function LogMessage(channel, msg)
{
    
    if (!ready || !guild)
    {
        setTimeout(() => 
        {
            LogMessage(channel, msg);
        }, 500);
        return;
    }

    let ch = guild.channels.find('id', channel_ids[channel]);

    if (!ch)
    {
        guild_main.channels.find('id', channel_ids[channel]);
    }
    
    if (!ch)
    {
        setTimeout(() => 
        {
            LogMessage(channel, msg);
        }, 500);
        return;
    }

    ch.send(`${GetLogDate()} ${msg}`);
}


jcmp.server.AddInputHandler((text) => 
{
    if (text == 'quit')
    {
        client.user.setStatus("dnd");
    }
})

client.on('ready', () => {
    console.log('Discord bot ready.');
    guild = client.guilds.get(server_id);
    guild_main = client.guilds.get(chat_server_id);

    ready = true;
});

setInterval(() => 
{
    if (!ready) {return;}
    
    client.user.setPresence({
        game: {name: `Survival Island (${jcmp.players.length})`}
    })
    client.user.setStatus("online");
    
}, 5000);

client.on('message', message => {
    if (message.author.bot || !message.member) {return;}
    if (!message.member) {return;}
    if (!message.channel) {return;}

    if (message.content == '!status')
    {
        message.channel.send(`${message.member} The server is currently online!`);
    }
    else if (message.content == '!online')
    {
        message.channel.send(`${message.member} Players online: ${jcmp.players.length}`);
    }
    else if (message.content.startsWith('!kick ') && 
        (message.member.roles.find((r) => r.id == roles.Mod) || message.member.roles.find((r) => r.id == roles.Admin)))
    {
        let msg = message.content.replace('!kick "', '');
        const player_name = msg.substring(0, msg.indexOf(`"`));
        msg = msg.replace(`${player_name}"`, ``);
        const reason = msg.trim();

        const syn = `\n\nProper syntax: "!kick "PLAYERNAME" REASON`;

        const channel = message.member.guild.channels.find('id', channel_ids.staff);

        if (message.content.indexOf(`"`) == -1)
        {
            channel.send(`${message.member} Could not kick player because their name was not enclosed in double quotes.${syn}`);
            return;
        }

        if (!reason)
        {
            channel.send(`${message.member} Could not kick player because a reason was not provided.${syn}`);
            return;
        }

        const player = jcmp.players.find((p) => p.c && p.c.general && p.c.general.name === player_name);

        if (player && player.name)
        {
            player.Kick('You were kicked from the server by staff.');
            
            channel.send(`${message.member} You kicked **${player_name}** from the server for reason: *${reason}*`);
        }
        else
        {
            channel.send(`${message.member} Could not find ${player_name} on the server.`);
        }
    }
    else if (message.content.startsWith('!ban ') && 
        (message.member.roles.find((r) => r.id == roles.Mod) || message.member.roles.find((r) => r.id == roles.Admin)))
    {
        let msg = message.content.replace('!ban "', '');
        const player_name = msg.substring(0, msg.indexOf(`"`));
        msg = msg.replace(`${player_name}"`, ``).trim();
        let time = msg.split(" ")[0];
        const reason = msg.replace(time, '').trim();

        const channel = message.member.guild.channels.find('id', channel_ids.staff);

        if (time !== 'Forever') {time = parseInt(time);}
        
        const unban_date = (time !== 'Forever') ? GetFutureDate(time) : time;

        const syn = `\n\nProper syntax: "!ban "PLAYERNAME" TIME (number in days or Forever) REASON`;

        if (message.content.indexOf(`"`) == -1)
        {
            channel.send(`${message.member} Could not ban player because their name was not enclosed in double quotes.${syn}`);
            return;
        }

        if (!time || time == 0 || time < 0)
        {
            channel.send(`${message.member} Could not ban player because a valid ban length was not given (number or Forever).${syn}`);
            return;
        }

        if (!reason)
        {
            channel.send(`${message.member} Could not ban player because a reason was not provided.${syn}`);
            return;
        }

        const player = jcmp.players.find((p) => p.c && p.c.general && p.c.general.name === player_name);

        if (player && player.name)
        {
            jcmp.events.Call('character/BanPlayer', player.c.general.steam_id, unban_date);

            player.Kick('You have been banned from the server by staff.');
            
            channel.send(`${message.member} You banned **${player_name}** from the server for **${time}** days for reason: *${reason}*`);
        }
        else
        {
            channel.send(`${message.member} Could not find **${player_name}** on the server.`);
        }
    }
    else if (message.content == '!onlinea' && 
        (message.member.roles.find((r) => r.id == roles.Mod) || message.member.roles.find((r) => r.id == roles.Admin)))
    {
        const channel = message.member.guild.channels.find('id', channel_ids.testing);

        let msg = `${message.member}, there are currently ${jcmp.players.length} players online.\n\n`;

        channel.send(msg);

        for (let i = 0; i < jcmp.players.length; i++)
        {
            const player = jcmp.players[i];

            channel.send({embed: GetPlayerDataEmbed(player)});

            /*if (player.name && player.c && player.c.ready && player.c.general)
            {
                const playtime = Math.round(player.c.general.time_online / 60 * 100) / 100;
                msg = msg + "```" + `\nNAME: ${player.c.general.name}` 
                    + `\nIP: ${player.client.ipAddress}\nSTEAMID: ${player.c.general.steam_id}\nPING: ${player.client.ping} MS`
                    + `\nLEVEL: ${player.c.exp.level}` + `\nTOTAL PLAYTIME: ${playtime} HRS` + "```";
            }
            else
            {
                msg = msg + "```" + `\nNAME: ${player.name}` 
                + `\nIP: ${player.client.ipAddress}\nSTEAMID: ${player.client.steamId}\nPING: ${player.client.ping} MS`
                + `\nNOT LOGGED IN` + "```";
            }*/
        }

        //channel.send(msg);

    }
    else if (message.content.startsWith('!unban ') && 
        (message.member.roles.find((r) => r.id == roles.Mod) || message.member.roles.find((r) => r.id == roles.Admin)))
    {
        const channel = message.member.guild.channels.find('id', channel_ids.staff);
        const names = jcmp.events.Call('GetNames')[0];

        const player_name = message.content.replace('!unban', '').trim();

        if (!player_name || player_name.length < 3)
        {
            channel.send(`${message.member} Unable to unban player because a valid name was not given.`);
            return;
        }
        else if (!names || names.length == 0)
        {
            channel.send(`${message.member} Unable to unban player because names were not found.`);
            return;
        }

        let id = names.find((n) => n.name === player_name);

        if (!id || !id.steam_id)
        {
            channel.send(`${message.member} Unable to unban player because a valid steam id was not found.`);
            return;
        }

        id = id.steam_id;

        jcmp.events.Call('character/UnbanPlayer', id);
        channel.send(`${message.member} Unbanned player ${player_name} [${id}].`);

    }
    else if (message.content == '!kickall' && 
        (message.member.roles.find((r) => r.id == roles.Mod) || message.member.roles.find((r) => r.id == roles.Admin)))
    {
        jcmp.players.forEach((p) => {
            p.Kick('restarting...');
        });

        const channel = message.member.guild.channels.find('id', channel_ids.staff);
        channel.send(`${message.member} Kicked all players successfully.`);
    }
    else if (message.channel.id == channel_ids.chat)
    {
        chat.broadcast(
            message.content, 
            new RGB(255,255,255), 
            {
                name: message.author.username,
                namecolor: '#FFFFFF',
                tagname: 'Discord',
                tagcolor: '#7289DA',
                channel: 'Global'
            });
    }
});

function GetPlayerDataEmbed(player)
{
    if (player.name && player.c && player.c.ready && player.c.general)
    {
        const playtime = Math.round(player.c.general.time_online / 60 * 100) / 100;
        return {
            color: parseInt(player.c.general.color.replace(`#`, ''), 16),
            author: {
                name: player.c.general.name,
                icon_url: GetIconURL(player)
            },
            fields: [
                {
                    name: "IP Address",
                    value: `${player.client.ipAddress}`,
                    inline: true
                },
                {
                    name: "Steam ID",
                    value: `${player.c.general.steam_id}`,
                    inline: true
                },
                {
                    name: "Ping",
                    value: `${player.client.ping}`,
                    inline: true
                },
                {
                    name: "Level",
                    value: `${player.c.exp.level}`,
                    inline: true
                },
                {
                    name: "Total Playtime",
                    value: `${playtime} hours`,
                    inline: true
                }
            ],
            timestamp: new Date()
        }
    }
    else
    {
        return {
            color: parseInt('FFFFFF', 16),
            author: {
                name: player.name,
                icon_url: GetIconURL(player)
            },
            fields: [
                {
                    name: "IP Address",
                    value: `${player.client.ipAddress}`
                },
                {
                    name: "Steam ID",
                    value: `${player.client.steamId}`
                },
                {
                    name: "Ping",
                    value: `${player.client.ping}`
                },
                {
                    name: "Not Logged In",
                    value: ":("
                }
            ],
            timestamp: new Date()
        }
    }
}

function GetIconURL(player)
{
    const data = avatars.find((a) => a.id === player.networkId);

    if (data) {return data.url}
    else return '';
}

/**
 * Creates a nice formatted YYYY-MM-DD string for the current date + days.
 * 
 * @param {string} days - Number of days in the future from today's date.
 * @returns {string}
 */

function GetFutureDate(days)
{
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = parseInt(date.getDate()) + days;

    // If we are going into a new month, fix the date
    while (day > GetDaysInMonth(month, year))
    {
        days = day - GetDaysInMonth(month, year);
        day = days;
        if (month + 1 > 12) {year++;}
        month = (month + 1 > 12) ? 1 : month + 1;
    }

    return `${year}-${month}-${day}`;
}

function GetDaysInMonth(month, year)
{
    if (month == 1) {return 31;}
    if (month == 2) {return year % 4 == 0 ? 29 : 28;}
    if (month == 3) {return 31;}
    if (month == 4) {return 30;}
    if (month == 5) {return 31;}
    if (month == 6) {return 30;}
    if (month == 7) {return 31;}
    if (month == 8) {return 31;}
    if (month == 9) {return 30;}
    if (month == 10) {return 31;}
    if (month == 11) {return 30;}
    if (month == 12) {return 31;}
    return 30;
}

/**
 * Gets a nicely formatted time string.
 * 
 * @return {string}
 */

function GetTime()
{
    const date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return `${hour}:${min}:${sec}`;
}

/**
 * Gets a nicely formatted date string for log filenames.
 * 
 * @return {string}
 */

function GetDate()
{
    const date = new Date();

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return `${year}-${month}-${day}`;
}

function GetLogDate()
{
    return `[${GetDate()} ${GetTime()}]:`;
}

client.login('CLIENT SECRET TOKEN');