jcmp.events.Add('chat_command', (player, msg) => 
{
    if (msg.startsWith('/chatban ') && c.util.is_staff(player))
    {
        const name = msg.replace('/chatban ', '');

        if (name.length < 3) {return;}

        
        let sql = `UPDATE general SET chat_banned='1' WHERE name='${name}'`;

        c.pool.query(sql).then((result) => 
        {
            console.log(`${name} was chat banned.`);
            jcmp.events.Call('log', 'chat_bans', `${name} was chat banned by ${player.c.general.name}.`);

            const banned = jcmp.players.find((p) => p.c && p.c.general && p.c.general.name === name);

            if (banned && banned.name)
            {
                banned.c.general.chat_banned = 1;
            }

            c.chat.send(player, `<b>Successfully chat banned ${name}.</b>`, new RGBA(0,255,0,255));
            //con.end();
        }).catch((err) => {console.log('error from chat.js 26'); console.log(err)});
    }
})