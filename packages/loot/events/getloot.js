
/**
 * Gets an array of stacks for loot of a certain tier.
 * 
 * @param {number} tier - The tier of loot. Must be a number 1-4
 * @param {number} cell - The cell the lootbox is in.
 * @returns {Array} - The array of stacks of items.
 */
function GetLoot(tier, pos)
{
    if (tier < 1 || tier > 4) {console.log(`Incorrect tier ${tier}. Cannot get loot.`); return;}

    const stacks = []; // Loot table

    const amt_stacks = Math.max(
        (Math.random() > 0.25) ? Math.ceil(loot.config.percentages[tier].max_amount * Math.random())
        : Math.ceil(loot.config.percentages[tier].max_amount * Math.random() * 0.5),
        loot.config.percentages[tier].min_amount); // Amount of stacks we will have

    for (let i = 0; i < amt_stacks; i++)
    {
        let item_data = GetItemData(tier);

        while (item_data.in_loot === false || (item_data.region && !in_hotzone(item_data, pos)))
        {
            item_data = GetItemData(tier);
        }

        item_data.amount = loot.utils.Clamp(
            Math.round(item_data.stacklimit * 0.25 * Math.random()), // Maximum 25% of stacklimit
            loot.config.drop_amounts.min,
            (item_data.max_loot != undefined) ? 
            Math.ceil(item_data.max_loot * Math.random()) : 
            Math.ceil(loot.config.drop_amounts.max * Math.random()));
        
        // If it's durable, make amount 1 and set durability to 50-100%
        if (item_data.durable)
        {
            const dura_diff = loot.config.max_durability - loot.config.min_durability;

            item_data.durability = (item_data.max_durability != undefined) ? 
                (item_data.max_durability * loot.config.min_durability) 
                + (item_data.max_durability * dura_diff * Math.random()) : 
                (100 * loot.config.min_durability) + (100 * dura_diff * Math.random());

            item_data.durability = Math.ceil(item_data.durability);

            item_data.amount = 1;
        }

        const item = new jcmp.inv.item(item_data);
        const stack = new jcmp.inv.stack([item]);

        stacks.push(stack);
    }

    return stacks;

}

/**
 * Returns if the item can spawn in this area, aka it's a hotzone only item
 * @param {*} item_data 
 * @param {*} pos 
 */
function in_hotzone(item_data, pos)
{
    const check_pos = new Vector3f(pos.x, 0, pos.z);
    for (let i = 0; i < item_data.region.length; i++)
    {
        const hotzone_data = loot.config.hotzones[item_data.region[i]];
        if (check_pos.sub(hotzone_data.pos).length < hotzone_data.radius)
        {
            return true;
        }
    }
    return false;
}

function GetItemData(tier)
{
    const random = Math.random();

    // Generate item
    if (random // If it's a common item
        <= loot.config.percentages[tier].Common)
    {
        return JSON.parse(JSON.stringify(loot.items.Common[Math.floor(loot.items.Common.length * Math.random())]));
    }
    else if (random < // If it's an uncommon item
        loot.config.percentages[tier].Common 
        + loot.config.percentages[tier].Uncommon)
    {
        return JSON.parse(JSON.stringify(loot.items.Uncommon[Math.floor(loot.items.Uncommon.length * Math.random())]));
    }
    else if (random < // If it's a rare item
        loot.config.percentages[tier].Common 
        + loot.config.percentages[tier].Uncommon 
        + loot.config.percentages[tier].Rare)
    {
        return JSON.parse(JSON.stringify(loot.items.Rare[Math.floor(loot.items.Rare.length * Math.random())]));
    }
    else if (random < // If it's an epic item
        loot.config.percentages[tier].Common 
        + loot.config.percentages[tier].Uncommon 
        + loot.config.percentages[tier].Rare 
        + loot.config.percentages[tier].Epic)
    {
        return JSON.parse(JSON.stringify(loot.items.Epic[Math.floor(loot.items.Epic.length * Math.random())]));
    }
    else if (random < // If it's a legendary item
        loot.config.percentages[tier].Common 
        + loot.config.percentages[tier].Uncommon 
        + loot.config.percentages[tier].Rare 
        + loot.config.percentages[tier].Epic 
        + loot.config.percentages[tier].Legendary)
    {
        return JSON.parse(JSON.stringify(loot.items.Legendary[Math.floor(loot.items.Legendary.length * Math.random())]));
    }

    console.log(`Unable to find item for loot, trying again. tier: ${tier} random: ${random}`);
    return GetItemData(tier);

}

module.exports = GetLoot;


