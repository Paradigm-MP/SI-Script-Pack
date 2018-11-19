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
 * Creates a nice formatted YYYY-MM-DD string for the current date + days.
 * 
 * @param {string} days - Number of days in the future from today's date.
 * @returns {string}
 */

function GetFutureDate(days)
{
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = parseInt(date.getDate()) + days;

    // If we are going into a new month, fix the date
    while (day > GetDaysInMonth(month, year))
    {
        days = day - GetDaysInMonth(month, year);
        day = days;
        if (month + 1 > 12) {year++;}
        month = (month + 1 > 12) ? 1 : month + 1;
    }

    return `${year}-${month}-${day}`;
}

function GetDaysInMonth(month, year)
{
    if (month == 1) {return 31;}
    if (month == 2) {return year % 4 == 0 ? 29 : 28;}
    if (month == 3) {return 31;}
    if (month == 4) {return 30;}
    if (month == 5) {return 31;}
    if (month == 6) {return 30;}
    if (month == 7) {return 31;}
    if (month == 8) {return 31;}
    if (month == 9) {return 30;}
    if (month == 10) {return 31;}
    if (month == 11) {return 30;}
    if (month == 12) {return 31;}
    return 30;
}


/**
 * Returns true/false whether a player actually exists and has not disconnected for some reason.
 * 
 * @param {Player} p - The player to check.
 * @returns {boolean} - True/false
 */

function exists(p)
{
    return (p != undefined && p.name != undefined);
}

/**
 * Returns true if the player is an admin, false otherwise.
 * 
 * @param {Player} p - The player to check.
 * @returns {boolean} - True/false
 */

function is_admin(p)
{
    return (p.tag != undefined && p.tag.name != undefined);
}

module.exports = 
{
    GetCurrentDate,
    GetFutureDate,
    exists,
    is_admin
}