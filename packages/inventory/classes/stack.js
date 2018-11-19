/**
 * Stack class for stacks of items. The inventory is comprised of Stacks.
 */
module.exports = class Stack
{
    /**
     * Constructor for the Stack class.
     * 
     * @param {object} items - Array of items in the stack. Must be an array, even if it is only 1 item.
     */
    constructor (items)
    {
        if (typeof items != 'object' || items.length == 0 || !items[0])
        {
            console.error(`Tried to create a stack, but the constructor was wrong!`);
            console.error(items);
            return;
        }

        this.contents = [];

        for (let i = 0; i < items.length; i++)
        {
            this.contents[i] = items[i].duplicate();
        }

        
        this.properties = 
        {
            name: this.get_first().name,
            category: this.get_first().category,
            rarity: this.get_first().rarity,
            durability: this.get_first().durability,
            max_durability: this.get_first().max_durability,
            stacklimit: this.get_first().stacklimit,
            can_equip: this.get_first().can_equip,
            equip_type: this.get_first().equip_type,
            can_use: this.get_first().can_use,
            nodrop: this.get_first().nodrop,
            in_loot: this.get_first().in_loot,
            amount: this.get_amount(),
            custom_data: this.get_first().custom_data
        };
    }

    /**
     * Adds an item to the stack, if possible.
     * 
     * @param {object} item_ - The item to add to the stack.
     */

    add (item_)
    {
        const item = item_.duplicate();

        // If there is an item type mismatch
        if (item.name != this.prop('name') || item.category != this.prop('category') || 
            item.rarity != this.prop('rarity') || item.stacklimit != this.prop('stacklimit') ||
            (item.durability !== undefined && this.prop('durability') === undefined) 
                || (item.durability === undefined && this.prop('durability') !== undefined))
        {
            console.error(`Tried to add item to stack, but there was a type mismatch!`);
            console.error(item);
            console.error(this);
            return;
        }

        if (item.durability === undefined && !item.can_equip && this.get_first())
        {
            this.get_first().amount += parseInt(item.amount);
        }
        else
        {
            this.contents.push(item);
        }
    }

    /**
     * Removes item from the stack.
     * 
     * @param {object} item - The item that we want to remove.
     */

    remove (item)
    {
        if (!item) {return;}
        // If there is an item type mismatch
        if (item.name != this.prop('name') || item.category != this.prop('category') || 
            item.rarity != this.prop('rarity') || item.stacklimit != this.prop('stacklimit') ||
            (item.durability !== undefined && this.prop('durability') === undefined) 
                || (item.durability === undefined && this.prop('durability') !== undefined))
        {
            console.error(`Tried to remove item from stack, but there was a type mismatch!`);
            console.error(item);
            console.error(this);
            return;
        }

        // If it doesn't have durability, just subtract the amount
        if (item.durability === undefined && item.can_equip === undefined && this.contents.length > 0)
        {
            this.get_first().amount -= item.amount;
        }
        else if (item.durability === undefined && item.can_equip != undefined && this.contents.length > 0)
        {
            this.contents.splice(0, 1);
        }
        else if (item.durability !== undefined && this.contents.length > 0)
        {
            // Otherwise, find the item with matching durability
            for (let i = 0; i < this.contents.length; i++)
            {
                if (item.durability === this.contents[i].durability)
                {
                    this.contents.splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     * Gets the first item in the stack (the one that is visible)
     * 
     * @returns {object} - The first Item in the stack of items.
     */

    get_first ()
    {
        return this.contents[0];
    }

    /**
     * Gets a certain property, such as durability, from the first item in the stack.
     */
    
    prop (property)
    {
        return this.properties[property];
    }

    /**
     * Returns the total amount of all items in the stack. Works for non-durable and durable items.
     * 
     * @returns {number} Total amount of items in the stack.
     */

    get_amount ()
    {
        if (this.contents.length != 1)
        {
            return this.contents.length;
        }
        else
        {
            return this.get_first().amount;
        }
    }

    /**
     * Searches the stack for any items are are equipped within. Returns the index of the item within the 
     * stack if found, otherwise it returns -1.
     * 
     * @returns {number} - Index of the equipped item within the stack. -1 for none found.
     */

    get_equipped ()
    {
        for (let i = 0; i < this.contents.length; i++)
        {
            if (this.contents[i].equipped == true)
            {
                return i;
            }
        }

        return -1;
    }


    /**
     * Shifts the items in the stack so that the first item is last and the 2nd item is first, etc.
     * Only works for durable items
     */

    shift ()
    {
        this.contents.push(this.contents.splice(0, 1)[0]);
    }

    /**
     * Returns the stack and its contents as an array for transport to the client.
     * 
     * @returns {Array} - An array of all the stack's data.
     */

    to_array ()
    {
        const data = [];

        for (let i = 0; i < this.contents.length; i++)
        {
            data.push(this.contents[i].to_array());
        }

        return data;
    }

    /**
     * Returns the stack and its contents as an array for transport to the client.
     * 
     * @returns {Array} - An array of all the stack's data.
     */

    to_array_chat ()
    {
        return {contents: this.to_array()};
    }

    /**
     * Returns a duplicate of the original stack.
     * 
     * @returns {object} - A clone of the original stack.
     */

    duplicate ()
    {
        const items = [];
        
        for (let i = 0; i < this.contents.length; i++)
        {
            items[i] = this.contents[i].duplicate();
        }

        return new inv.stack(items);
    }

    /**
     * Returns true if one stack contains the same items as another.
     * 
     * @param {object} stack - The stack we want to compare to this one.
     * @param {boolean} no_check_dura - Set to true to not check durability
     * 
     * @returns {boolean} - Whether or not the stacks are exactly equal.
     */

    equals (stack, no_check_dura)
    {
        let equal = true;

        if (stack.get_amount() === this.get_amount())
        {
            for (let i = 0; i < this.contents.length; i++)
            {
                if (this.contents[i].name !== stack.contents[i].name
                    || this.contents[i].category !== stack.contents[i].category
                    || this.contents[i].rarity !== stack.contents[i].rarity
                    || (this.contents[i].durability !== stack.contents[i].durability && !no_check_dura)
                    || this.contents[i].amount !== stack.contents[i].amount
                    || this.contents[i].stacklimit !== stack.contents[i].stacklimit
                    || this.contents[i].equipped !== stack.contents[i].equipped)
                {
                    equal = false;
                }
            }
            
            return equal;
        }
        else
        {
            return false;
        }
        
    }

    /**
     * Returns true if one stack contains the same items as another.
     * 
     * @param {object} stack - The stack we want to compare to this one.
     * @param {boolean} lenient - Whether or not we want to be lenient when checking durability.
     * Aka if the durability hasn't synced yet for batteries, if we want to check if it's close enough.
     * 
     * @returns {boolean} - Whether or not the stacks are exactly equal.
     */

    equals_no_amount (stack, lenient)
    {
        let equal = true;

        for (let i = 0; i < Math.min(this.contents.length, stack.contents.length); i++)
        {
            if (this.contents[i].name !== stack.contents[i].name
                || this.contents[i].category !== stack.contents[i].category
                || this.contents[i].rarity !== stack.contents[i].rarity
                || this.contents[i].stacklimit !== stack.contents[i].stacklimit
                || this.contents[i].equipped !== stack.contents[i].equipped)
            {
                equal = false;
            }

            // If we are being lenient
            if (lenient && this.contents[i].durability !== undefined)
            {
                // Server durability should always be less than client's if it's being used
                equal = equal && stack.contents[i].durability - this.contents[i].durability < 20;
            }
            else
            {
                equal = equal && this.contents[i].durability === stack.contents[i].durability;
            }
        }
        
        return equal;
        
    }
}