const fs = require('fs');

const cooldown = 60; // Seconds

const types = {
    'cheating': 1,
    'exploit_glitch_bug': 2,
    'harassing': 3,
    'other': 4,
    'something_not_working': 5,
    'stuck': 6}

jcmp.events.AddRemoteCallable('report/submit', (player, option, details) => 
{
    if (!option || !details || !player.c || !types[option] || player.cannot_report)
    {
        return;
    }

    if (details.length > 20000)
    {
        jcmp.events.Call('watchlist/AddStrike', player.c.general.steam_id, 'Report was too long', player);
    }

    details = details.substring(0, 20000);

    const pos = `${player.position.x}, ${player.position.y}, ${player.position.z}`;

    const msg = `The following was reported by ${player.c.general.name} [${player.c.general.steam_id}] on ${GetCurrentDateAndTime()}
        \n\nPlayer Pos: ${pos}\n\nCategory: ${option}\n\nReport: ${details}`;

    jcmp.events.Call('log', 'reports', msg);

    let file_name;

    fs.readdir(`${__dirname}/reports/${option}`, (err, files) => 
    {
        file_name = `${GetCurrentDate()}-${player.c.general.name}-${files.length}`;

        fs.appendFile(`${__dirname}/reports/${option}/${file_name}.log`, msg, function (err) 
        {
            if (err)
            {
                throw err;
            }
            else
            {
                //jcmp.events.CallRemote('report/success', player);
                jcmp.notify(player, {
                    title: 'Report received!',
                    subtitle: 'Thank you for submitting a report; it has been received.',
                    preset: 'success',
                    time: 7500
                })
            }
        });
    });

    player.cannot_report = true;

    setTimeout(function() 
    {
        if (player && player.name && player.c)
        {
            player.cannot_report = false;
        }
    }, 1000 * cooldown);
})

jcmp.events.AddRemoteCallable('report/submit_auto', (player, msg) => 
{
    if (!player.reported_msgs) {player.reported_msgs = '';}

    if (player.reported_msgs.indexOf(msg) > -1) {return;} // Already sent this error, don't send again

    jcmp.events.Call('log', 'reports', msg);
    
    player.reported_msgs += msg;
})


/**
 * Creates a nice formatted YYYY-MM-DD string for the current date.
 * 
 * @returns {string}
 */
function GetCurrentDateAndTime()
{
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `[${year}-${month}-${day}|${hour}:${minute}:${second}]`;
}

/**
 * Creates a nice formatted YYYY-MM-DD string for the current date.
 * 
 * @returns {string}
 */
function GetCurrentDate()
{
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}
