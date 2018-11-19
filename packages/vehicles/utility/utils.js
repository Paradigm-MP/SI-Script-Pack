
/**
 * Rounds a number to 3 decimal places
 */

function round(num)
{
    return Math.round(num * 1000) / 1000; // rounds to 3 places
}


function Distance(a, b)
{
    return a.sub(b).length;
}


function GetCurrentDate()
{
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}

function GetNumOwnedVehicles(player)
{
    let num = 0;
    for (let id in player.c.vehicles)
    {
        if (player.c.vehicles[id] != undefined)
        {
            num++;
        }
    }
    return num;
}

module.exports = 
{
    round,
    Distance,
    GetCurrentDate,
    GetNumOwnedVehicles
}