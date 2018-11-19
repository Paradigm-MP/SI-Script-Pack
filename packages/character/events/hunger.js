
const starving_players = [];
const dehydrated_players = [];

/**
 * Decreases hunger and thirst by the amounts set in the config. Calls UpdateHunger at the end.
 */

function DecreaseHunger (player)
{
    if (!player.c || player.c.hunger === undefined || player.c.thirst === undefined || !c.util.exists(player))
    {
        //console.log(`Error Cannot DecreaseHunger for a player that does not have proper things!`);
        return;
    }

    let hunger_mod = 1; // Modifier depending on what the player is doing
    let thirst_mod = 1; // Modifier depending on what the player is doing

    if (player.vehicle)
    {
        hunger_mod *= 0.5;
        thirst_mod *= 0.5;
    }

    if (player.position.y > 2300)
    {
        hunger_mod *= 1.5;
        thirst_mod *= 1.25;
    }
    else if (player.position.y < 1050)
    {
        thirst_mod *= 1.1;
    }

    player.c.hunger -= c.config.hunger.hunger_decrease * hunger_mod;
    player.c.hunger = Math.max(0, player.c.hunger);

    player.c.thirst -= c.config.hunger.thirst_decrease * thirst_mod;
    player.c.thirst = Math.max(0, player.c.thirst);

    UpdateHunger(player);
}


// Interval for decreasing health if hunger or thirst is at 0
setInterval(() => 
{
    for (let i = 0; i < jcmp.players.length; i++)
    {
        const player = jcmp.players[i];

        if (player.c === undefined || player.health == 0)
        {
            continue;
        }

        if (player.c.hunger !== undefined && player.c.hunger === 0)
        {
            player.health -= c.config.hunger.hunger_health_decrease;
        }

        if (player.c.thirst !== undefined && player.c.thirst === 0)
        {
            player.health -= c.config.hunger.thirst_health_decrease;
        }
    }

}, 2000);


jcmp.events.Add('inventory/events/use_item', (player, stack, index) => 
{
    const item = stack.get_first().duplicate();
    item.amount = 1;

    if (c.config.hunger.items[item.name])
    {
        RestoreHunger(c.config.hunger.items[item.name], player);

        if (item.durability) // Like CamelBak or something
        {
            player.c.inventory.modify_durability(stack, index, -c.config.hunger.items[item.name].durability);
        }
        else
        {
            player.c.inventory.remove_item(item, index);
        }
    }
})

/**
 * Restores hunger/thirst based on the item used.
 * 
 * @param {object} restore - Object with thirst and hunger properties.
 * @param {object} player - The player that used the item.
 */

function RestoreHunger (restore, player)
{
    if (restore.hunger > 0)
    {
        jcmp.events.Call('sound/Play', player, 'eat.ogg', 0.75);
    }

    if (restore.thirst > 0)
    {
        jcmp.events.Call('sound/Play', player, 'drink.ogg', 0.75);
    }

    player.c.hunger += restore.hunger;
    player.c.hunger = Math.max(0, Math.min(100, player.c.hunger));

    player.c.thirst += restore.thirst;
    player.c.thirst = Math.max(0, Math.min(100, player.c.thirst));

    UpdateHunger(player);
}


/**
 * Updates hunger and thirst for a player to SQL and also syncs to client.
 * 
 * @param {object} player - The player we want to update.
 */

function UpdateHunger (player)
{
    if (!player.c || player.c.hunger === undefined || player.c.thirst === undefined || player.c.general == undefined)
    {
        console.log(`Error Cannot UpdateHunger for a player that does not have proper things!`);
        return;
    }

    jcmp.events.CallRemote('character/hunger/update', player, player.c.hunger, player.c.thirst);

    const steam_id = player.c.general.steam_id;

    
    let sql = `UPDATE hungerthirst SET hunger = '${player.c.hunger}', 
                thirst = '${player.c.thirst}'  WHERE steam_id = '${steam_id}'`;
    c.pool.query(sql).then((result) => 
    {
        //con.end();
    }).catch((err) => {console.log('error from hunger.js 135'); console.log(err)});
}

module.exports = 
{
    UpdateHunger,
    DecreaseHunger
}