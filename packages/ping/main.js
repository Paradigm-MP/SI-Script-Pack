const chat = jcmp.events.Call('get_chat')[0];

let timers = [];
const MAX_PING_TIMEOUT = 10;


setInterval(function() 
{
    jcmp.players.forEach(function(player) 
    {
        if (player.client.ping > 500)
        {
            jcmp.events.CallRemote('ping/show', player);

            player.pingscore = (player.pingscore) ? player.pingscore + 1 : 1;

            if (player.pingscore >= MAX_PING_TIMEOUT)
            {
                jcmp.events.Call('log', 'connections', `Player ${player.client.steamId} was kicked for a ping of ${player.client.ping}.`);
                player.Kick('Your ping was too high.');
            }
        }
        else
        {
            if (player.pingscore && player.pingscore > 0)
            {
                jcmp.events.CallRemote('ping/hide', player);
            }

            player.pingscore = 0;
        }
    });
}, 10000);

jcmp.events.Add('chat_command', (player, msg) => 
{
    if (msg == '/ping')
    {
        const ping = player.client.ping;
        const color = (ping > 200) ? (ping > 350) ? '[#FF0000]' : '[#FFA200]' : '[#00FF11]';
        chat.send(player, `<b>[#FFFFFF]Your ping is ${color}${ping} [#FFFFFF]ms.`, 
            new RGBA(255,255,255,255), {timeout: 15});
    }
})
