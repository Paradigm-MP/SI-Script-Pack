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
    return (p.tag != undefined && p.tag.name != undefined && p.tag.name === 'Admin');
}

/**
 * Returns true if the player is an admin, false otherwise.
 * 
 * @param {Player} p - The player to check.
 * @returns {boolean} - True/false
 */

function is_staff(p)
{
    return (p.tag != undefined && p.tag.name != undefined && (p.tag.name === 'Admin' || p.tag.name == 'Mod'));
}

/**
 * Returns false if there is weird unicode in the string.
 * 
 * @param {string} input - The raw input from the player.
 * 
 */
function ProcessNameInput(input)
{
    for (let i = 0; i < input.length; i++)
    {
        if (input.charCodeAt(i) > 125 || input.charCodeAt(i) < 32 || input.indexOf('`') > -1 || input.indexOf(`'`) > -1
            || input.indexOf(`"`) > -1 || input.toLowerCase() == 'everyone' || input.toLowerCase() == 'devbot' || input.toLowerCase() == 'survivalist')
        {
            return false;
        }
    }

    for (let i = 0; i < c.names.length; i++)
    {
        const name = c.names[i].name;
        if (!input || (name && input && name.toLowerCase() == input.toLowerCase()))
        {
            return false;
        }
    }

    return true;
}

/**
 * Makes sure that a date corresponds to XXXX-XX-XX format.
 */

function FormatBanDate(date)
{
    if (date.length < 12)
    {
        let split = date.split("-");


        if (split[1].length < 2)
        {
            split[1] = '0' + split[1];
        }

        if (split[2].length < 2)
        {
            split[2] = '0' + split[2];
        }

        return `${split[0]}-${split[1]}-${split[2]}`;
    }

    return date;
}

/**
 * Finds and returns the name of a weapon by hash.
 * 
 * @param {string} hash - The hash of the weapon.
 * @returns {string} - The name of the weapon.
 */

function GetWeaponName(hash)
{
    let name = 'Unknown';
    c.weapons.forEach((weapon) => 
    {
        if (weapon.hash == hash)
        {
            name = weapon.name; // Cannot do return weapon.name here because node lelelelele
            // actually it's because of foreach, and you returning out of it just exits the loop but doesn't return the function
        }
    });

    return name;
}

function GetCurrentDateAndTime()
{
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `[${year}-${month}-${day} ${hour}:${minute}:${second}]:`;
}

module.exports = 
{
    GetCurrentDate,
    exists,
    ProcessNameInput,
    is_admin,
    is_staff,
    FormatBanDate,
    GetWeaponName,
    GetCurrentDateAndTime
}