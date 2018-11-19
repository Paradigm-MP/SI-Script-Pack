// Default JC3MP events


// Once the player is ready, set their dimension and position
jcmp.events.Add('PlayerReady', (player) => 
{
    if (player.client.ping >= 500)
    {
        player.Kick(`Your ping of ${player.client.ping} was too high to be playable.`);
        jcmp.events.Call('log', 'connections', `Player ${player.name} [${player.client.steamId}] was kicked for ping of ${player.client.ping}.`);
        return;
    }

    // Set the player's dimension to the loading dimension so they are not seen by others
    player.dimension = 77;
    // Set the player's position to the city for now
    player.position = new Vector3f(3927, 1031, 1410);
    player.health = 800;

    jcmp.events.CallRemote('character/freeze_initial', player);
})

jcmp.events.Add('PlayerDestroyed', (player) => 
{
    if (!player.c || !player.c.active)
    {
        jcmp.events.Call('log', 'connections', `Player with steam id ${player.client.steamId} disconnected without being logged in.`);
        return;
    }

    c.chat.broadcast(`${player.c.general.name} left.`, new RGB(156,156,156), 
        {timeout: 120, channel: 'Global', style: 'italic', use_name: true});

    if (player.a_tping || player.loading || !player.loaded_in)
    {
        jcmp.events.Call('log', 'connections', `Player ${player.c.general.name} disconnected while AdvancedTeleporting.`);
        return;
    }

    jcmp.events.Call('log', 'connections', `Player ${player.c.general.name} [${player.c.general.steam_id}] disconnected.`);

    clearInterval(player.c.interval_60);
    player.c.interval_60 = null;
    /*
    You need to store what you want from the player right away,
    otherwise all the variables will become undefined once the
    player is destroyed. SQL takes a moment to connect, and in
    that moment, the player will be destroyed and you will no
    longer be able to get any properties of the player.
    */
    
    const steam_id = player.c.general.steam_id;
    let pos = player.position;
    const dead = player.c.dead;
    const health = (player.health <= 0) ? 800 : player.health;

    console.log(`${c.util.GetCurrentDateAndTime()} ${player.c.general.name} left`);

    if (dead)
    {
        pos = player.respawnPosition;
    }

    if (pos.sub(new Vector3f(3927, 1031, 1410)).length < 1)
    {
        return; // Still loading, don't do anything
    }

    let sql = `UPDATE positions SET x = '${pos.x}', 
            y = '${pos.y}', z = '${pos.z}' WHERE steam_id = '${steam_id}'`;
    c.pool.query(sql).then((result) =>
    {

        let sql = `UPDATE general SET health = '${health}' WHERE steam_id = '${steam_id}'`;
        return c.pool.query(sql);
    }).then((result) => 
    {
        //con.end();
    }).catch((err) => {console.log(err)});

    player.tag = undefined;

})

jcmp.events.Add('PlayerDeath', (player, killer, reason) => 
{
    c.exp.UpdateExpOnKill(killer, player);

    player.c.dead = true;

    const steam_id = player.c.general.steam_id;
    const pos = player.c.general.respawn_pos;
    
    let steam_id_killer;
    let kills;

    player.c.general.deaths = player.c.general.deaths + 1;

    
    // Respawn player after delay
    setTimeout(() => 
    {
        if (c.util.exists(player))
        {
            player.Respawn();
        }
    }, 7000);

    if (c.util.exists(killer) && killer.networkId != player.networkId)
    {
        killer.c.general.kills = killer.c.general.kills + 1;
        steam_id_killer = killer.c.general.steam_id;
        kills = killer.c.general.kills;
    }

    if (c.util.exists(killer))
    {
        const modelHash = killer.selectedWeapon ? killer.selectedWeapon.modelHash : 'none';
        const magazineAmmo = (killer.selectedWeapon) ? killer.selectedWeapon.magazineAmmo : 'none';
        const reserveAmmo = (killer.selectedWeapon) ? killer.selectedWeapon.reserveAmmo : 'none';

        jcmp.events.Call('log', 'kills', `Player ${player.c.general.name} [${player.c.general.steam_id}] was killed by 
            ${killer.c.general.name} [${killer.c.general.steam_id}] for reason ${reason}. 
            (${c.util.GetWeaponName(modelHash)}) 
            (Magazine: ${magazineAmmo}) (Reserve: ${reserveAmmo})`);
            
        c.chat.send(player, 
            `You were killed by ${killer.c.general.name}. (${c.util.GetWeaponName(modelHash)})`,
            new RGBA(255,0,0,255), {channel: 'Log'});

        c.chat.send(killer, 
            `You killed ${player.c.general.name}. (${c.util.GetWeaponName(modelHash)})`,
            new RGBA(255,41,166,255), {channel: 'Log'});
    }
    else
    {
        jcmp.events.Call('log', 'kills', `Player ${player.c.general.name} [${player.c.general.steam_id}] died for reason ${reason}.`);
        
        c.chat.send(player, 
            `You died.`,
            new RGBA(255,0,0,255), {channel: 'Log'});
    }

    const deaths = player.c.general.deaths;
    
    let sql = `UPDATE positions SET x = '${pos.x}', 
            y = '${pos.y}', z = '${pos.z}' WHERE steam_id = '${steam_id}'`;
    c.pool.query(sql).then((result) =>
    {

        let sql = `UPDATE general SET deaths = '${deaths}' WHERE steam_id = '${steam_id}'`;
        return c.pool.query(sql);
    }).then((result) =>
    {
        if (c.util.exists(killer) && killer.networkId != player.networkId)
        {  
            let sql = `UPDATE general SET kills = '${kills}' WHERE steam_id = '${steam_id_killer}'`;
            return c.pool.query(sql);
        }
        else
        {
            return;
        }

    }).then((result) =>
    {
        //con.end();
    }).catch((err) => {console.log(err)});
})

jcmp.events.Add('PlayerRespawn', (player) => 
{
    player.suiciding = false;

    if (player.c == undefined)
    {
        return;
    }

    player.c.dead = false;
    
    player.c.hunger = c.config.hunger.hunger_death;
    player.c.thirst = c.config.hunger.thirst_death;
    c.hunger.UpdateHunger(player);

})

jcmp.events.Add('ClientConnected', (client) => 
{
    jcmp.events.Call('log', 'connections', `Client ${client.name} ${client.ipAddress} ${client.networkId} ${client.ping} ${client.steamId} connected.`);
})

jcmp.events.Add('ClientDisconnected', (client) => 
{
    jcmp.events.Call('log', 'connections', `Client ${client.name} ${client.ipAddress} ${client.networkId} ${client.ping} ${client.steamId} disconnected.`);
})