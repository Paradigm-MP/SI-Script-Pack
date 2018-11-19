/**
 * Item class for individual items, or stacks of items that do not have durabilities. (eg bavarium)
 */
module.exports = class Item
{
    /**
     * Constructor for the Item class.
     * 
     * @param {object} data - An array of all the item's data. Required components are name, category, rarity, 
     * amount, and stacklimit. Optional components are durability and equipped. If the item has durability, its 
     * amount must be 1.
     * 
     */
    constructor (data)
    {
        // If we are missing a key piece of information
        if (!data || !data.name || !data.category || !data.rarity || data.amount === undefined || !data.stacklimit)
        {
            console.trace(`Missing a key piece of information!`);
            console.error(data);
            return;
        }


        this.name = data.name;
        this.category = data.category;
        this.rarity = data.rarity;
        this.amount = data.amount;
        this.stacklimit = data.stacklimit;
        this.custom_data = data.custom_data || {}; // Will always be represented by strings

        this.get_custom_data(data.name);

        if (data.equipped != undefined)
        {
            this.equipped = data.equipped;
        }

        if (data.durability && data.amount > 1)
        {
            //console.error(`Tried to create item with durability and more than one amount!`);
            //console.error(data);
            //return;
            data.amount = 1;
        }

        if (data.durability != undefined && data.amount == 1)
        {
            this.durability = data.durability;
            this.max_durability = (data.max_durability) ? data.max_durability : inv.utils.FindItem(this.name).max_durability;
        }

        if (data.color)
        {
            this.color = data.color;
        }

        if (data.nodrop)
        {
            this.nodrop = data.nodrop;
        }

        if (data.in_loot)
        {
            this.in_loot = data.in_loot;
        }
        else
        {
            this.in_loot = true;
        }

        if (data.can_equip)
        {
            this.can_equip = data.can_equip;
            if (!data.equip_type)
            {
                console.log('WHAT BUFFOON TRIED TO MAKE AN EQUIPPABLE ITEM WITHOUT EQUIP TYPE?!');
                console.log(data);
                return;
            }
            this.equip_type = data.equip_type;
        }
        else if (data.can_use)
        {
            this.can_use = data.can_use;
        }
    }

    /**
     * Gets custom data on item creation if it's needed. This is used by items like Model Change to get a random model.
     */
    get_custom_data (name)
    {
        if (name == 'Model Change') // Get a random model for model change item
        {
            let model;

            if (this.custom_data.display_name) // Already have a model, so just get the name
            {
                model = inv.models.find((m) => m.name == this.custom_data.display_name);
            }
            else // Otherwise get a new model
            {
                model = inv.models[Math.floor(Math.random() * inv.models.length)];
            }

            if (!model)
            {
                console.error('Could not get a model for model change item.');
                return;
            }

            this.custom_data.display_name = model.name;
        }
        else if (name == 'Landclaim' && !this.custom_data.size) // Get a random size for landclaims
        {
            this.custom_data.size = inv.GetLandclaimSize();
        }
        
    }

    /**
     * Returns whether or not an item has custom data.
     */
    has_custom_data()
    {
        return Object.keys(this.custom_data).length === 0 && this.custom_data.constructor === Object
    }

    /**
     * Returns the Item as an array for transport to the client.
     * 
     * @returns {object} - An array of all the item's data.
     */

    to_array ()
    {
        const data = 
        {
            name: this.name,
            category: this.category,
            rarity: this.rarity,
            amount: this.amount,
            stacklimit: this.stacklimit,
            custom_data: this.custom_data
        }

        if (this.durability != undefined)
        {
            data.durability = this.durability;
            data.max_durability = this.max_durability;
        }

        if (this.equipped != undefined)
        {
            data.equipped = this.equipped;
        }

        if (this.color)
        {
            data.color = this.color;
        }

        if (this.nodrop)
        {
            data.nodrop = this.nodrop;
        }

        if (this.in_loot)
        {
            data.in_loot = this.in_loot;
        }

        if (this.can_equip)
        {
            data.can_equip = this.can_equip;
            data.equip_type = this.equip_type;
        }
        else if (this.can_use)
        {
            data.can_use = this.can_use;
        }



        /*if (this.dogtag != undefined)
        {
            data.dogtag = this.dogtag;
        }*/

        return data;
    }

    /**
     * Duplicates the item.
     * 
     * @returns {object} - A duplicate of the original item.
     */

    duplicate ()
    {
        return new inv.item(JSON.parse(JSON.stringify(this.to_array())));
    }

}