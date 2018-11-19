jcmp.events.Add('loot/open_box', (player, contents, id, opened, tier) => 
{
    if (!opened && c.config.exp.lootbox[tier])
    {
        c.exp.GiveExp(player, c.config.exp.lootbox[tier]);

        player.c.general.boxes_looted += 1;

        // Little fun notifications :)
        if (player.c.general.boxes_looted == 1000)
        {
            jcmp.notify(player, {
                title: 'Congrats!',
                subtitle: `You've looted 1,000 lootboxes!`,
                preset: 'tip',
                time: 5000
            })
        }
        else if (player.c.general.boxes_looted == 10000)
        {
            jcmp.notify(player, {
                title: 'Congrats!',
                subtitle: `You've looted 10,000 lootboxes! Wow!`,
                preset: 'tip',
                time: 10000
            })
        }
        else if (player.c.general.boxes_looted == 100000)
        {
            jcmp.notify(player, {
                title: 'Congrats!',
                subtitle: `You've looted 100,000 lootboxes! Contact LF for your reward :)`,
                preset: 'tip',
                time: 15000
            })
        }
        
        const steam_id = player.c.general.steam_id;

        // Update boxes looted statistic
        let sql = `UPDATE general SET boxes_looted = '${player.c.general.boxes_looted}' WHERE steam_id = '${steam_id}'`;
        c.pool.query(sql).then((result) => 
        {
            //con.end();
        }).catch((err) => {console.log(err)});
    }
})