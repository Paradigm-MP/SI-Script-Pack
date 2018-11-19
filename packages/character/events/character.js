
// A 60 second interval for everyone who is logged in
jcmp.events.Add('character/interval_60', (player) => 
{
    if (!c.util.exists(player) || player.c == undefined)
    {
        return;
    }

    c.hunger.DecreaseHunger(player);

    UpdatePosition(player);
    UpdateHealth(player);

    // Decrease keypad attempts
    player.keypad_attempts = (player.keypad_attempts > 0) ? player.keypad_attempts - 1 : player.keypad_attempts;

})

function UpdatePosition(player)
{
    if (!player.c || !player.c.general) {return;}
    const steam_id = player.c.general.steam_id;

    player.c.general.time_online = player.c.general.time_online + 1;

    let sql = `UPDATE general SET time_online = '${player.c.general.time_online}' WHERE steam_id = '${steam_id}'`;
    c.pool.query(sql).then((result) => 
    {
        if (c.util.exists(player) && !player.c.dead)
        {
            let sql = `UPDATE positions SET x = '${player.position.x}', 
                y = '${player.position.y}', z = '${player.position.z}'  WHERE steam_id = '${steam_id}'`;
            return c.pool.query(sql);
        }
        else
        {
            return;
        }
    }).then((result) => 
    {
        //con.end();
    }).catch((err) => {console.log('error from character.js 39'); console.log(err)});
}


function UpdateHealth(player)
{
    if (!player.c || !player.c.general) {return;}
    const steam_id = player.c.general.steam_id;
    const health = (player.health <= 0) ? 800 : player.health;

    let sql = `UPDATE general SET health = '${health}' WHERE steam_id = '${steam_id}'`;
    c.pool.query(sql).then((result) => 
    {
        //con.end();
    }).catch((err) => {console.log('error from character.js 52'); console.log(err)});
}