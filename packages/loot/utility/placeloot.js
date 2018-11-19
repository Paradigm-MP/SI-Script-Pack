jcmp.events.AddRemoteCallable('loot/place', (player, type) => 
{
    if (!player.c || !player.c.ready || !player.lootmode) {return;}

    if (type < 1 || type > 3 || !loot.config.edit_mode) {return;}

    // Check for cheaters only for tier 3
    if (type == 3)
    {
        const player_pos = player.position;
        for (let i = 0; i < loot.spawns.length; i++)
        {
            if (loot.spawns[i].position.sub(player_pos).length < 10 && loot.spawns[i].type == 3)
            {
                jcmp.events.Call('log', 'loot', `Player ${player.c.general.name} tried to place a lootbox of type 3 too close to another one.`);
                return;
            }
        }

        if (!player.placed_t3s) {player.placed_t3s = 1;}

        if (player.placed_t3s > 5)
        {
            jcmp.events.Call('log', 'loot', `Player ${player.c.general.name} tried to place more than 5 T3s in a span of 30 seconds.`);
            return;
        }

        if (player.tier3_timeout) {clearTimeout(player.tier3_timeout);}

        player.tier3_timeout = setTimeout(() => 
        {
            player.placed_t3s = 0;
        }, 30000);
    }

    loot.spawn_data.push({
        pos: {x: player.position.x, y: player.position.y, z: player.position.z},
        rot: {x: player.rotation.x, y: player.rotation.y, z: player.rotation.z},
        type: type
    })

    loot.jsonutils.SaveLootSpawns();

    const lootbox = new loot.lootbox(player.position, player.rotation, type);
    loot.spawns.push(lootbox);
    loot.cells[lootbox.cell.x][lootbox.cell.y].push(lootbox);

    jcmp.players.forEach((player) => 
    {
        if (player.c && player.c.ready)
        {
            loot.cell.UpdateLootInCells(player, true);
        }
    });

    jcmp.events.Call('log', 'loot',
        `${player.c.general.name} placed T${type} at ${player.position.x} ${player.position.y} ${player.position.z}.`);

    loot.chat.send(player, `Placed lootbox successfully. Automatically saved.`, new RGB(0, 255, 0), {timeout: 10});
})

jcmp.events.Add('chat_command', (player, msg) => 
{
    if (msg == '/rbox' && loot.config.edit_mode && player.lootmode) // Remove a lootbox
    {
        let num_removed = 0;
        const p_pos = player.position;
        for (let i = 0; i < loot.spawn_data.length; i++)
        {
            const pos = new Vector3f(loot.spawn_data[i].pos.x, loot.spawn_data[i].pos.y, loot.spawn_data[i].pos.z);
            if (pos.sub(p_pos).length < 5)
            {
                loot.spawn_data.splice(i, 1);
                num_removed++;

                const cell = loot.cell.GetCell(pos);

                const box = loot.cells[cell.x][cell.y].find((lootbox) => lootbox.position.sub(pos).length < 2);

                box.remove();
                loot.cells[cell.x][cell.y] = loot.cells[cell.x][cell.y].filter((lootbox) => lootbox.id != box.id);
                loot.spawns = loot.spawns.filter((lootbox) => lootbox.id != box.id);
                break;
            }
        }

        jcmp.events.Call('log', 'loot',
            `${player.c.general.name} removed ${num_removed} boxes.`);
    

        loot.jsonutils.SaveLootSpawns();

        //loot.generator.Generate();

        jcmp.players.forEach((player) => 
        {
            if (player.c && player.c.ready)
            {
                loot.cell.UpdateLootInCells(player, true);
            }
        });

        loot.chat.send(player, `Removed ${num_removed} lootboxes. Automatically saved.`, new RGB(0, 255, 0), {timeout: 10});
    }
    else if (msg == '/boxcount' && loot.config.edit_mode) // Count lootboxes
    {
        loot.chat.broadcast(`There are ${loot.spawn_data.length} lootboxes.`, new RGB(0, 255, 0), {timeout: 10});
    }
    else if (msg == '/lootmode' && loot.config.edit_mode)
    {
        player.lootmode = !player.lootmode;

        loot.chat.send(player, `Loot placing mode: ${player.lootmode}`, new RGB(255, 255, 0), {timeout: 10});
    }
})