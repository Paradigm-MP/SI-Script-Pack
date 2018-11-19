jcmp.events.Add('watchlist/AddStrike', (steam_id, reason, player) => 
{
    if (!steam_id || !reason || !player)
    {
        console.log("[WATCHLIST] Cannot add strike, missing data!");
        return;
    }

    const date = watchlist.util.GetCurrentDate();

    let sql = `SELECT strikes FROM watchlist WHERE steam_id = '${steam_id}'`;
    watchlist.pool.query(sql).then((result) =>
    {
        let sql;

        if (result != undefined && result.length > 0)
        {
            const strikes = result[0].strikes + 1;
            sql = `UPDATE watchlist SET strikes = '${strikes}' WHERE steam_id = '${steam_id}'`;
            
            for (let s in watchlist.config.bans.auto)
            {
                if (strikes == s && watchlist.config.autoban)
                {
                    const unban_date = (watchlist.config.bans.auto[s] == "Forever") ? 
                        "Forever" : watchlist.util.GetFutureDate(watchlist.config.bans.auto[s]);

                    jcmp.events.Call('character/BanPlayer', steam_id, unban_date);
                    player.Kick("You have been banned.");

                    jcmp.events.Call('log', 'watchlist', `Player with steam_id ${steam_id} was banned for reason ${reason} for 
                    ${strikes} strikes.`);
                    jcmp.events.Call('log', 'bans', `Player with steam_id ${steam_id} was banned for reason ${reason} for 
                        ${strikes} strikes.`);
                }
            }
        }
        else
        {
            sql = `INSERT INTO watchlist (steam_id, strikes) VALUES ('${steam_id}', '1')`;
        }

        jcmp.events.Call('log', 'watchlist', `Added strike to player with steam_id ${steam_id} for reason ${reason}.`);
        
        return watchlist.pool.query(sql);
    }).then((result) => 
    {
        let sql = `INSERT INTO watchlist_reasons (steam_id, date, reason) VALUES ('${steam_id}', '${date}', '${reason}')`;

        return watchlist.pool.query(sql);
    }).then((result) => 
    {
        console.log('Strike added for a player.');
        //con.end();
    })
})