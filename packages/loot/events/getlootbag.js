
/**
 * Gets a loot table for a loot bag.
 * 
 * @param {string} name - The name of the item. Must be some type of lootbag.
 * @returns {object} - An array of stacks.
 */
function GetLootBagLoot(name)
{
    if (!loot.config.lootbags[name]) 
    {
        console.log(`Cannot GetLootBagLoot, item is not a lootbag!`);
        return;
    }

    const stacks = [];

    const lootbag_data = loot.config.lootbags[name];
    
    if (name == 'Bavarium Lootbag')
    {
        const data = jcmp.inv.FindItem('Bavarium');

        if (data)
        {
            data.amount = Math.round(Math.random() * (lootbag_data.max - lootbag_data.min)) + lootbag_data.min;
            const item = new jcmp.inv.item(data);
            const stack = new jcmp.inv.stack([item]);
            stacks.push(stack);
        }

    }
    else
    {
        for (let rarity in lootbag_data)
        {
            const amount = lootbag_data[rarity].min + 
                Math.round((lootbag_data[rarity].max - lootbag_data[rarity].min) * Math.random());

            for (let i = 0; i < amount; i++)
            {
                let item_data = JSON.parse(JSON.stringify(loot.items[rarity][Math.floor(loot.items[rarity].length * Math.random())]));

                while (item_data.in_loot === false)
                {
                    item_data = JSON.parse(JSON.stringify(loot.items[rarity][Math.floor(loot.items[rarity].length * Math.random())]));
                }

                item_data.amount = loot.utils.Clamp(
                    Math.round(item_data.stacklimit * 0.30 * Math.random()), // Maximum 30% of stacklimit
                    loot.config.drop_amounts.lootbag_min,
                    (item_data.max_loot != undefined) ? item_data.max_loot : loot.config.drop_amounts.lootbag_max);

                item_data.amount = (item_data.amount > item_data.stacklimit) ? Math.ceil(item_data.stacklimit * Math.random()) : item_data.amount;

                // If it's a durable item, give it max durability
                if (item_data.durable)
                {
                    item_data.durability = (item_data.max_durability != undefined) ? 
                        item_data.max_durability : 100;
                    item_data.amount = 1;
                }

                const item = new jcmp.inv.item(item_data);
                const stack = new jcmp.inv.stack([item]);

                stacks.push(stack);
            }
        }
    }


    return stacks;

}

module.exports = GetLootBagLoot;