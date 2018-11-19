
const chat = jcmp.events.Call('get_chat')[0];

const color = new RGBA(212,0,255,255);


jcmp.events.AddRemoteCallable('guipm/GUIReady', (player) => 
{
    const player_entry = {id: player.networkId, name: player.c.general.name};

    if (player.tag && player.tag.name)
    {
        player_entry.tag = player.tag;
    }

    jcmp.events.CallRemote('guipm/AddPlayer', null, JSON.stringify(player_entry));
    
    let data = [];
    jcmp.players.forEach(function(p) 
    {
        if (p.c != undefined && p.c.active == true && p.networkId != player.networkId)
        {
            const entry = {id: p.networkId, name: p.c.general.name};

            if (p.tag && p.tag.name)
            {
                entry.tag = p.tag;
            }

            data.push(entry);
        }
        
    });
    jcmp.events.CallRemote('guipm/InitPlayers', player, JSON.stringify(data));
})

jcmp.events.Add('PlayerDestroyed', (player) => {
    jcmp.events.CallRemote('guipm/RemovePlayer', null, player.networkId);
})

jcmp.events.AddRemoteCallable('guipm/SendMessage', (player, message, id) => 
{
    message = message.trim();
    message = message.substring(0, (message.length > 1000) ? 1000 : message.length);
    let target = jcmp.players.find(p => p.networkId == id);
    if (typeof target == 'undefined' || target == null || message.length == 0 || !target)
    {
        return;
    }

    SendMessage(player, target, message);

})

jcmp.events.Add('chat_command', (player, msg, channel) => 
{
    if (msg.startsWith('/w '))
    {
        const first_index = msg.indexOf(`"`);
        const last_index = msg.indexOf(`"`, first_index + 1);
        const name = msg.substring(first_index + 1, last_index);

        const target = jcmp.players.find((p) => p.c && p.c.active && p.c.general.name === name);

        SendMessage(player, target, msg.substring(last_index + 2, msg.length), channel);
    }
    else if (msg.startsWith('/r '))
    {
        if (player.last_messaged)
        {
            msg = msg.replace('/r ', '');
            SendMessage(player, player.last_messaged, msg, channel);
        }
    }
})

jcmp.events.Add('guipm/SendMessage', (player, target, message) => 
{
    SendMessage(player, target, message);
})

function SendMessage(player, target, message, channel)
{
    if (!channel) {channel = 'Global';}

    if (target != null && typeof target != 'undefined' && target.name && target.c)
    {
        jcmp.events.CallRemote('guipm/AddMessage', 
            target, player.networkId, JSON.stringify({type: "from", msg: message}), player.c.general.name);
    }
    else
    {
        chat.send(player, `The player you are trying to whisper to is offline.`, new RGBA(150,150,150,255), 
            {timeout: 15});
    }

    jcmp.events.CallRemote('guipm/AddMessage', 
        player, target.networkId, JSON.stringify({type: "to", msg: message}), target.c.general.name);

    chat.send(player, `You whisper to ${target.c.general.name}: ${message}`, color, {use_name: true, channel: channel});
    chat.send(target, `${player.c.general.name} whispers to you: ${message}`, color, {use_name: true, channel: channel});

    player.last_messaged = target;
    target.last_messaged = player;

    jcmp.events.Call('log', 'private_messages', `${player.c.general.name} PMed ${target.c.general.name}: ${message}`);
}