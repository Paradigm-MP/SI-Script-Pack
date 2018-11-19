const chat = jcmp.events.Call('get_chat')[0];

jcmp.notify = function (player, args)
{
    jcmp.events.CallRemote('notifications/notify', player, JSON.stringify(args));
}

jcmp.events.Add('chat_command', (player, msg) => 
{
    if (!msg.startsWith('/notify')) {return;}

    if (!player.tag || player.tag.name !== "Admin")
    {
        return false;
    }

    const data = ParseText(msg);

    if (!data.title)
    {
        chat.send(player, `Cannot notify without a title.`, new RGBA(255,0,0,255));
        return;
    }

    jcmp.notify(null, {
        title: data.title,
        subtitle: data.subtitle,
        time: data.time,
        preset: "warn"
    })

    chat.send(player, `Notified all players successfully.`, new RGBA(0,255,0,255));

    return true;

})

jcmp.server.AddInputHandler((text) => 
{
    if (text.startsWith('notify'))
    {
        const data = ParseText(text);

        if (!data.title)
        {
            console.log('Cannot notify without a title.');
            return true;
        }

        jcmp.notify(null, {
            title: data.title,
            subtitle: data.subtitle,
            time: data.time,
            preset: "warn"
        })

        console.log(`Notified everyone on the server with title: ${data.title} and subtitle: ${data.subtitle}`);

        return true;
    }
});

function ParseText(text)
{
    const data = {};
    data.title = (text.indexOf('title: ') > -1) ? 
        text.substring(
        text.indexOf('title: ') + 7, 
        (text.indexOf('subtitle: ') > -1) ? text.indexOf('subtitle: ') : text.length) : undefined;

    data.subtitle = (text.indexOf('subtitle: ') > -1) ?
        text.substring(text.indexOf('subtitle: ') + 10, (text.indexOf('time: ') > -1 ? 
        text.indexOf('time: ') - 1 : text.length)) :
        undefined;

    data.time = (text.indexOf('time: ') > -1) ?
        text.substring(text.indexOf('time: ') + 6, text.length) :
        5000;
    data.time = parseInt(data.time);
    
    return data;
}