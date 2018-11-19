
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
 * Finds and returns all item properties using a name.
 * 
 * @param {string} - Name of the item you want details for (rarity, category, etc).
 * @returns {object} - All of the data of the item.
 */

function FindItem(name)
{
    let item;
    for (let category in inv.items)
    {
        if (item != undefined) // If we found it, don't keep looking
        {
            continue;
        }

        item = inv.items[category].find((i) => i.name === name);

        if (name.indexOf('Dogtag') > -1)
        {
            item = inv.items[category].find((i) => i.name === 'Dogtag');
        }

        if (item != undefined)
        {
            item.category = category;

            if (item.hide_dura) 
            {
                item.custom_data = {};
                item.custom_data.hide_dura = true;
            }

            item = JSON.parse(JSON.stringify(item)); // Copy item ... ugh js pls
            
            if (!item.custom_data) {item.custom_data = {};}
        }

    }
    if (item)
    {
        if (item.durable)
        {
            if (!item.max_durability)
            {
                item.max_durability = 100;
            }
            
            item.durability = item.max_durability;
        }
        return item;
    }
    else
    {
        return null;
    }
}

/**
 * Generates a data so that you can initialize an inventory for a new player. Uses the values 
 * from config to generate it.
 * 
 * @returns {object}
 */

function GenerateDefaultInventory()
{
    const data = [];

    inv.config.default_inventory.forEach((i) => 
    {
        let item_data = FindItem(i.name);
        item_data.amount = i.amount;
        if (i.durability) {item_data.durability = i.durability;}

        data.push(new inv.stack([new inv.item(item_data)]));
    });

    return data;
}

/**
 * Gets slot maximums based on level and contents of inventory (eg. backpacks)
 * 
 * @returns {object}
 */

function GetSlots(level, inventory)
{
    const slots = JSON.parse(JSON.stringify(inv.config.default_slots[level]));

    for (let category in inventory.contents)
    {
        for (let i = 0; i < inventory.contents[category].length; i++)
        {
            const item = inventory.contents[category][i].get_first();

            // If they have an item that expands slots equipped
            if (inv.config.slot_expanders[item.name] && item.equipped === true)
            {
                for (let category in inv.config.slot_expanders[item.name])
                {
                    slots[category] += inv.config.slot_expanders[item.name][category];
                }
            }
        }
    }

    return slots;
}

module.exports = 
{
    exists,
    is_admin,
    is_staff,
    FindItem,
    GenerateDefaultInventory,
    GetSlots
}