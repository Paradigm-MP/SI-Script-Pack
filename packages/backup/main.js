const mysqlDump = require('mysqldump');
const database = jcmp.events.Call('GetDatabase')[0];
const config = require('./config');
let error = false;

setInterval(function() 
{
    if (!config || !database || error)
    {
        console.log(`*****ERROR! CANNOT CREATE BACKUPS! FIX BEFORE CONTINUING!*****`);
    }
}, 1000);

setInterval(function() 
{
    mysqlDump({
        host: database.host,
        user: database.user,
        password: database.password,
        database: database.name,
        dest: __dirname + `/backups/backup-${GetCurrentDate()}-${GetTime()}.sql` // destination file 
    },function(err){
        if (err)
        {
            error = true;
            console.log(err);
            jcmp.events.Call('log', 'connections', err);
        }
        else
        {
            console.log('Backup created!');
            jcmp.events.Call('log', 'connections', 'Backup created!');
        }
    })
}, config.interval * 1000 * 60 * 60);
 

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


/**
 * Gets a nicely formatted time string.
 * 
 * @return {string}
 */

function GetTime()
{
    const date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return `${hour}-${min}-${sec}`;
}
