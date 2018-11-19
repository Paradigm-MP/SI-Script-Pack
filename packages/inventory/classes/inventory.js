/**
 * Inventory class for management, modification, and sync.
 */
module.exports = class Inventory
{
    /**
     * Constructor for the Inventory class.
     * 
     * @param {object} data - The initial contents of the inventory. If no data is specified, then 
     * the inventory will be initialized with nothing in it. The data is an array of Stack(s).
     * @param {object} slots - An object with the amounts of slots for each inventory category.
     * @param {object} player - The player that this inventory belongs to.
     */
    constructor (data, slots, player)
    {
        // Create arrays for inventory categories
        this.contents = 
        {
            Cosmetics: [],
            Weaponry: [],
            Utility: [],
            Survival: []
        }

        // Store slot data - same format as contents, eg this.slots.Survival or this.slots['Survival']
        this.slots = slots;

        this.player = player;
        this.player.c.inventory = this;

        this.can_shift = true; // Latency resolver
        this.can_use = true; // Latency resolver
        this.can_drop = true; // Latency resolver

        if (!this.slots)
        {
            this.slots = 
            {
                Cosmetics: 5,
                Weaponry: 5,
                Utility: 5,
                Survival: 5
            }
        }

        // If we are initializing with at least one Stack
        if (data)
        {
            const equipped_items = [];

            for (let i = 0; i < data.length; i++)
            {
                if (!this.contents[data[i].prop('category')])
                {
                    console.log(`WUT? Trying to initialize an inventory with a stack that doesn't have a proper category?`);
                    console.log(`category: ${data[i].prop('category')}`);
                    continue;
                }
                this.contents[data[i].prop('category')].push(data[i]);

                // Fire an event to equip items
                for (let j = 0; j < data[i].contents.length; j++)
                {
                    if (data[i].contents[j].equipped == true)
                    {
                        // Don't start with radars equipped on join
                        if (data[i].contents[j].name == 'Radar' || data[i].contents[j].name == 'Upgraded Radar')
                        {
                            data[i].contents[j].equipped = false;
                        }
                        else
                        {
                            equipped_items.push({item: data[i].contents[j], i: i});
                            //jcmp.events.Call('inventory/events/equip_item', this.player, data[i].contents[j], i);
                        }
                    }
                }

            }

            for (let i = 0; i < equipped_items.length; i++)
            {
                jcmp.events.Call('inventory/events/equip_item', this.player, equipped_items[i].item, equipped_items[i].i);
            }
        }

        if (!inv.utils.exists(this.player))
        {
            console.log(`Player does not exist! Not initializing inventory!`);
            return;
        }

        jcmp.events.CallRemote('inventory/sync/init', this.player, 
            JSON.stringify(this.to_array()), JSON.stringify(this.slots));

        this.update_slots(inv.utils.GetSlots(this.player.c.exp.level, this.player.c.inventory));


    }
    
    /**
     * Adds an item to the inventory, if possible. If there is no room, it will overflow what didn't fit into the 
     * inventory. Syncs to client and SQL immediately.
     * 
     * @param {object} item - The item that we want to add.
     * @returns {object} - Returns the stack of items that we were unable to add because the inventory is full.
     */

    add_item (item)
    {
        // Trying to add a single item? Nah, we add stacks here.
        return this.add_stack(new inv.stack([item]));
    }


    /**
     * Adds an stack of items to the inventory, if possible. If there is no room, it will overflow what didn't fit into the 
     * inventory. Syncs to client and SQL immediately.
     * 
     * @param {object} stack - The item that we want to add.
     * @returns {object} - Returns the stack of items that we were unable to add because the inventory is full.
     */

    add_stack (stack)
    {
        if (!stack.prop('name') || !stack.prop('rarity') || !stack.prop('amount') || 
            !stack.prop('category') || !stack.prop('stacklimit'))
        {
            console.error(`What buffoon tried to add a stack without the proper data?! tsk tsk`);
            console.error(this.player.c.general.name);
            console.error(stack);
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to add_stack without proper data.
                steam_id: ${this.player.c.general.steam_id}`);
            return;
        }

        // stacks are added wrong for only equippable items. it doesnt get past the name check if statement

        // See if we can stack it with another item, or if it needs to be split up into multiple stacks
        for (let i = 0; i < this.contents[stack.prop('category')].length; i++)
        {
            const this_stack = this.contents[stack.prop('category')][i];

            // If this is the same type of item and we have room in the stack, then stack it!
            let stackable = this_stack.get_amount() < this_stack.prop('stacklimit');

            // If we have room to stack it on an existing stack and it is the same type of item
            if (String(this_stack.prop('name')) === String(stack.prop('name')) && stackable)
            {
                // If this is not a durable item OR 
                if (!stack.prop('durability') && !this_stack.prop('durability') && !this_stack.prop('can_equip'))
                {
                    // Amount to add
                    let stack_amount = Math.min(this_stack.prop('stacklimit') - this_stack.get_amount(), stack.get_amount());

                    // Update data
                    this_stack.get_first().amount = parseInt(this_stack.get_first().amount) + parseInt(stack_amount);
                    stack.get_first().amount = stack.get_first().amount - stack_amount;

                    jcmp.events.CallRemote('inventory/sync/update', this.player, 
                        JSON.stringify({contents: this_stack.to_array()}), i);

                    this.update();

                }
                else // If this is a durable item OR it is a stack of items that can be equipped
                {
                    // Amount to add
                    let stack_amount = Math.min(this_stack.prop('stacklimit') - this_stack.get_amount(), stack.get_amount());
                    
                    // Only add those items that fit within the stack limit
                    for (let j = 0; j < stack_amount; j++)
                    {
                        // Take the item from old stack and put it in new stack
                        this_stack.add(stack.get_first());

                        jcmp.events.CallRemote('inventory/sync/update', this.player, 
                            JSON.stringify({contents: this_stack.to_array()}), i);

                        // Remove item from old stack
                        stack.remove(stack.get_first());

                        this.update();

                    }

                }
            }
        }

        let max_slots = this.slots[stack.prop('category')];

        // Splits up items if they overflow stack limits
        while (stack.get_amount() > 0 && this.contents[stack.prop('category')].length < max_slots)
        {
            // Split logic for stacks
            while (stack.get_amount() > stack.prop('stacklimit') && this.contents[stack.prop('category')].length < max_slots)
            {

                const temp_stack = stack.duplicate(); // Copy stack
                temp_stack.contents = [];

                let loop_length = Math.min(stack.prop('stacklimit'), stack.get_amount());

                // Only take those durable items that fit within stack limit
                while (loop_length > 0)
                {
                    // Put it in our new item, and remove it from the old one
                    temp_stack.add(stack.get_first());
                    stack.remove(stack.get_first());
                    
                    loop_length--;
                }

                // Add the stack to the inventory
                const index = this.contents[stack.prop('category')].push(temp_stack) - 1;

                jcmp.events.CallRemote('inventory/sync/add', this.player, 
                    JSON.stringify({contents: temp_stack.to_array()}), index);

                this.update();

            }

            const index = this.contents[stack.prop('category')].push(stack.duplicate()) - 1;
            
            stack.contents = [];

        
            jcmp.events.CallRemote('inventory/sync/add', this.player, 
                JSON.stringify({contents: this.contents[stack.prop('category')][index].to_array()}), index);

            this.update();

        }

        // If we were not able to put all our items in our inventory
        if (stack.get_amount() > 0)
        {
            const amount_ = stack.get_amount();
            const name_ = stack.prop('name');

            jcmp.notify(this.player, {
                title: 'Inventory full!',
                subtitle: `Cannot add ${amount_} ${name_}.`,
                preset: 'warn'
            })

            //jcmp.events.Call('inventory/drop_stack', this.player, stack, true); // Create dropbox

            //inv.chat.send(this.player, `<b>Inventory full! Cannot add ${amount_} ${name_}.</b>`, new RGBA(255,255,0,255), {timeout: 10});
            
            return stack;
        }

    }


    /**
     * Removes an item from the inventory. If the item is durable, it will remove an item with matching 
     * durability. Syncs to client and SQL immediately.
     * 
     * @param {object} item - The item we want to remove. This can have an amount greater than one.
     */

    remove_item (item, id)
    {
        // Make it easier and put all the logic in stax.
        this.remove_stack(new inv.stack([item]), id);
    }

    /**
     * Removes a stack of items from the inventory. Syncs to client and SQL immediately.
     * 
     * @param {object} stack - The stack of items we want to remove.
     * @param {number} id - (Optional) The id of the inventory slot we want to remove this item from.
     */

    remove_stack (stack, id)
    {
        // Removing 0 items, so just return
        if (stack.get_amount() == 0)
        {
            return;
        }

        // If we want to remove items from a specific stack
        if (stack && id != undefined)
        {
            const stack_data = this.contents[stack.prop('category')][id];

            // If there is a mismatch of type of item, don't do anything
            if (stack_data.prop('name') != stack.prop('name') || stack_data.get_amount() < stack.get_amount() || 
                stack_data.prop('rarity') != stack.prop('rarity') || stack_data.prop('category') != stack.prop('category') 
                || !stack_data)
            {
                console.log(stack);
                console.log(stack_data);
                console.log('Tried to remove stack, but there was an error!');
                jcmp.events.Call('log', 'inventory', `[ERROR] Tried to remove_stack, but there was a data mismatch. 
                    steam_id: ${this.player.c.general.steam_id}`);
                return;
            }

            // If we are removing an entire stack
            if (stack.get_amount() === stack_data.get_amount())
            {
                for (let i = 0; i < stack.contents.length; i++)
                {
                    if (stack.contents[i].equipped == true)
                    {
                        stack.contents[i].equipped = false;
                        jcmp.events.Call('inventory/events/equip_item', this.player, stack.contents[i], id);
                    }
                }

                this.contents[stack.prop('category')].splice(id, 1);
                jcmp.events.CallRemote('inventory/sync/remove', this.player, stack.prop('category'), id);

                this.update();
                return;
            }

            // If this is a stack of durable items
            if (stack.prop('durability') != undefined)
            {
                let i = stack.contents.length - 1;
                while (i > -1)
                {
                    let j = stack_data.contents.length - 1;
                    const remove_item = stack.contents[i];

                    while (j > -1)
                    {
                        const check_item = stack_data.contents[j];

                        // If this is the item that we want to remove from the stack
                        if (remove_item.durability === check_item.durability)
                        {
                            // If the item was equipped and we are removing it, unequip it
                            if (remove_item.equipped == true)
                            {
                                const equip_item = remove_item.duplicate();
                                equip_item.equipped = false;
                                jcmp.events.Call('inventory/events/equip_item', this.player, equip_item, id);
                            }

                            stack_data.remove(stack.contents.splice(i, 1)[0]);

                            if (stack_data.get_amount() == 0)
                            {
                                this.contents[stack.prop('category')].splice(id, 1);
                                jcmp.events.CallRemote('inventory/sync/remove', this.player, stack.prop('category'), id);

                                this.update();
                            }
                        }

                        j--;
                    }

                    i--;
                }

                jcmp.events.CallRemote('inventory/sync/update', this.player, 
                    JSON.stringify({contents: stack_data.to_array()}), id);
            }
            else if (stack.prop('can_equip') != undefined) // If this is a stack of equippable, non durable items, like cosmetics
            {
                while (stack.get_amount() > 0)
                {
                    stack_data.remove(stack.contents.splice(0, 1)[0]);
                }

                // If we removed an entire stack
                if (stack_data.get_amount() == 0)
                {
                    this.contents[stack.prop('category')].splice(id, 1);
                    jcmp.events.CallRemote('inventory/sync/remove', this.player, stack.prop('category'), id);
                }
                else
                {
                    jcmp.events.CallRemote('inventory/sync/update', this.player, 
                        JSON.stringify({contents: stack_data.to_array()}), id);
                }
            }
            else // If this is just a stack of one item, like bavarium
            {
                stack_data.remove(stack.contents.splice(0, 1)[0]);

                // If we removed an entire stack
                if (stack_data.get_amount() == 0)
                {
                    this.contents[stack.prop('category')].splice(id, 1);
                    jcmp.events.CallRemote('inventory/sync/remove', this.player, stack.prop('category'), id);
                }
                else
                {
                    jcmp.events.CallRemote('inventory/sync/update', this.player, 
                        JSON.stringify({contents: stack_data.to_array()}), id);
                }

            }

            this.update();

        }
        else if (stack && id == undefined) // Otherwise, just remove the item(s) from anywhere/lowest stack of them
        {
            // As long as we have more items to remove
            while (stack.get_amount() > 0)
            {
                let lowest_stack;

                let in_stack = -1; // -1 for not found in the stack of durable items, otherwise index
                let from_stack = -1; // If we are subtracting a stack of items, then this will change into the stack index
                let cat_stack = -1;

                cat_search: for (let i = 0; i < this.contents[stack.prop('category')].length; i++)
                {
                    const this_stack = this.contents[stack.prop('category')][i];

                    // Find the stack that is the lowest so we subtract from it
                    if (this_stack.prop('name') == stack.prop('name') && 
                        (!lowest_stack || this_stack.get_amount() < lowest_stack.get_amount()) && stack.prop('durability') == undefined)
                    {
                        lowest_stack = this_stack;
                        cat_stack = i;
                    }
                    // If this item is durable, check specific durabilities
                    else if (stack.prop('durability') != undefined && this_stack.prop('name') == stack.prop('name'))
                    {
                        for (let j = 0; j < stack.get_amount(); j++)
                        {
                            for (let k = 0; k < this_stack.get_amount(); k++)
                            {
                                // If we got a match
                                if (stack.contents[j] && this_stack.contents[k] && stack.contents[j].durability == this_stack.contents[k].durability)
                                {
                                    lowest_stack = this_stack;
                                    from_stack = j;
                                    in_stack = k;
                                    cat_stack = i;
                                    break cat_search;
                                }
                            }
                        }
                    }
                }

                // If we found something
                if (lowest_stack && cat_stack > -1)
                {
                    if (!stack.prop('durability'))
                    {
                        const subtract_amount = Math.min(stack.get_amount(), lowest_stack.get_amount());

                        lowest_stack.get_first().amount -= subtract_amount;
                        stack.get_first().amount -= subtract_amount;

                        // If we subtracted an entire stack
                        if (lowest_stack.get_amount() == 0)
                        {
                            this.contents[lowest_stack.prop('category')].splice(cat_stack, 1);
                            jcmp.events.CallRemote('inventory/sync/remove', this.player, stack.prop('category'), cat_stack);
                        }
                        else
                        {  
                            jcmp.events.CallRemote('inventory/sync/update', this.player, 
                                JSON.stringify({contents: lowest_stack.to_array()}), cat_stack);
                        }

                        this.update();

                    }
                    else
                    {
                        const subtract_amount = Math.min(stack.get_amount(), lowest_stack.get_amount());

                        // If we have an item in a stack and we are removing it from a stack
                        if (in_stack > -1 && from_stack > -1)
                        {
                            // Remove items from stacks
                            lowest_stack.contents.splice(in_stack, 1);
                            stack.contents.splice(from_stack, 1);

                            // If we subtracted an entire stack
                            if (lowest_stack.get_amount() == 0)
                            {
                                this.contents[lowest_stack.prop('category')].splice(cat_stack, 1);
                                jcmp.events.CallRemote('inventory/sync/remove', this.player, stack.prop('category'), cat_stack);
                            }
                            else
                            {
                                jcmp.events.CallRemote('inventory/sync/update', this.player, 
                                    JSON.stringify({contents: lowest_stack.to_array()}), cat_stack);
                            }

                            this.update();

                        }
                    }

                }
                else // We didn't find anything when we should've
                {
                    console.log(`Tried to delete item(s) from inventory, but failed!`);
                    jcmp.events.Call('watchlist/AddStrike', this.player.c.general.steam_id, 
                        `Tried to remove stack, but failed. Likely because of inventory modification by client.`, this.player);
                    jcmp.events.Call('log', 'inventory', `[ERROR] Tried to remove_stack, but failed. 
                        steam_id: ${this.player.c.general.steam_id}`);
                    return;
                }
            }
        }

        this.update_slots(inv.utils.GetSlots(this.player.c.exp.level, this.player.c.inventory))
        
    }


    /**
     * Checks if the player has a specific item in their inventory.
     * 
     * @param {object} item - The item we want to search for.
     * @param {boolean} check_dura - Whether or not we want matching durability, or just name.
     * @returns {boolean} - Whether or not the inventory contains the item.
     */

    has_item (item, check_dura)
    {
        return this.has_stack(new inv.stack([item]), check_dura);
    }

    /**
     * Checks if the player has a specific stack of items in their inventory.
     * 
     * @param {object} item - The item we want to search for.
     * @param {boolean} check_dura - Whether or not we want matching durability. False = check, true = no check
     * @returns {boolean} - Whether or not the inventory contains the item.
     */

    has_stack (stack, check_dura)
    {
        const category = stack.prop('category');

        if (!category || !this.contents[category])
        {
            console.error(`No matching category found for has_stack for category ${category}!`);
            return -1;
        }

        // Searching for 0 items, so yes we always have it
        if (stack.get_amount() == 0)
        {
            return 1;
        }

        const new_stack = stack.duplicate();
        let index = -1;

        const new_stack_dura = new_stack.get_first().durability;

        for (let i1 = 0; i1 < this.contents[category].length; i1++)
        {
            const check_stack = this.contents[category][i1].duplicate();


            // If this is a "stackable" stack (like 2 grapplehooks)
            if (
                check_stack.get_first() && 
                (new_stack_dura != undefined || new_stack.prop('can_equip'))
                && (check_stack.get_first().durability != undefined || check_stack.prop('can_equip'))
                && String(new_stack.prop('name')) == String(check_stack.prop('name'))
            )
            {
                // If we are checking durable items
                if (new_stack_dura != undefined && check_stack.get_first().durability != undefined)
                {
                    const outer_length = check_stack.contents.length;
                    outer_loop: for (let i = 0; i < outer_length; i++)
                    {
                        const inner_length = new_stack.contents.length;
                        this_loop: for (let j = 0; j < inner_length; j++)
                        {
                            if ((check_stack.contents[i].durability == new_stack.contents[j].durability || check_dura)
                                && (!check_stack.prop('can_equip') || check_stack.contents[i].equipped == new_stack.contents[j].equipped))
                            {
                                // Remove checked item from stack so we don't check again
                                new_stack.contents.splice(j, 1);
                                index = i1;

                                if (new_stack.get_amount() == 0)
                                {
                                    break outer_loop;
                                }

                                break this_loop;
                            }
                        }
                    }
                }
                else // If we are not checking durable items
                {
                    const outer_length = check_stack.contents.length;
                    outer_loop: for (let i = 0; i < outer_length; i++)
                    {
                        const inner_length = new_stack.contents.length;
                        this_loop: for (let j = 0; j < inner_length; j++)
                        {
                            // Remove checked item from stack so we don't check again
                            new_stack.contents.splice(j, 1);
                            index = i1;

                            if (new_stack.get_amount() == 0)
                            {
                                break outer_loop;
                            }
                                
                            break this_loop;
                        }
                    }
                }
            }
            // If this is not a "stackable" stack (like 47 bavarium)
            else if (
                !(new_stack.prop('durablility') != undefined || new_stack.prop('can_equip'))
                && !(check_stack.prop('durablility') || check_stack.prop('can_equip'))
                && new_stack.prop('name') === check_stack.prop('name'))
            {
                index = i1;
                new_stack.get_first().amount -= Math.min(new_stack.get_first().amount, check_stack.get_amount());
            }


        }

        if (new_stack.get_amount() > 0)
        {
            return -1;
        }
        else
        {
            return index;
        }
        
    }


    /**
     * Modifies the durability of an item by amount. Must include an index, otherwise will not work. 
     * If the item's durability becomes <=0, the item is removed.
     * 
     * @param {object} s - The stack that contains the item on top.
     * @param {number} index - Index of the stack in the inventory.
     * @param {number} amount - Amount by which to modify the durability.
     * @returns {boolean} - Whether or not the item broke
     */

    modify_durability (s, index, amount)
    {
        if (!s || index == undefined || index < 0 || amount == undefined)
        {
            console.log(s);
            console.log(index);
            console.log(amount);
            console.log(`Tried to modify durability, but something was missing.`);
            return;
        }

        if (!this.contents[s.contents[0].category] || !this.contents[s.contents[0].category][index])
        {
            console.log(`Tried to modify durability, but item does not exist in inventory.`);
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to modify_durability, but item does not exist in inventory.
                steam_id: ${this.player.c.general.steam_id} index: ${index} amount: ${amount}`);
            return;
        }

        const category = s.contents[0].category;
        const stack = this.contents[category][index];
        const item = stack.contents[0];

        if (!item.durability)
        {
            console.log(`Tried to modify durability, but item does not have durability.`);
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to modify_durability, but item does not have durability.
                steam_id: ${this.player.c.general.steam_id} index: ${index} amount: ${amount}`);
            return;
        }

        item.durability = Math.max(0, item.durability + amount); // Updates to inventory because JS references

        let broke = false;

        if (item.durability <= 0)
        {
            jcmp.notify(this.player, {
                title: `${item.name} broke!`,
                subtitle: `Your ${item.name} ran out of durability and broke.`,
                time: 5000
            })

            inv.chat.send(this.player, 
                `<b>${item.name} ran out of durability and broke.</b>`, 
                new RGBA(255,0,255,255), {channel: 'Log'});
            this.remove_item(item, index);
            broke = true;

        }
        else
        {
            jcmp.events.CallRemote('inventory/sync/update', this.player, 
                JSON.stringify({contents: stack.to_array()}), index);
        }

        this.update();

        return broke;
    }

    /**
     * Updates the stack in an index in a category to the player. Used for updating custom properties of items in a stack.
     */
    update_index (category, index)
    {
        if (!this.contents[category][index]) {return;}

        jcmp.events.CallRemote('inventory/sync/update', this.player, 
            JSON.stringify({contents: this.contents[category][index].to_array()}), index);
    }

    /**
     * Takes an item out of index and puts it in new index. Does not swap items.
     * 
     * @param {object} category - The category that the item is in.
     * @param {number} old_index - The index that the item was in.
     * @param {number} new_index - The new index that we want to move the item to.
     * @param {object} client_stack_obj - The stack that the client has in their inventory in this space. MUST MATCH.
     */

    change_index (category, old_index, new_index, client_stack_obj)
    {
        if (this.player.client.ping > 500 || (this.player.iu.using && this.player.iu.item.category == category) || this.desynced) {return;}


        if (!this.contents[category] || !this.contents[category][old_index] || !this.contents[category][new_index] 
            || !client_stack_obj || client_stack_obj.length == 0 || client_stack_obj.contents[0].category != category
            || !inv.utils.exists(this.player))
        {
            console.log(`Error in changing index! Something is bad here!`);
            console.log(`${category} ${old_index} ${new_index}`);
            console.log(client_stack_obj);
            console.log(`${this.player.c.general.name} ${this.player.client.steamId}`);
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to change_index, but something did not match. 
                steam_id: ${this.player.client.steam_id} category: ${category} old_index: ${old_index} 
                new_index: ${new_index}`);
            return;
        }

        const stack = this.contents[category][old_index];
        let client_stack;

        let items = [];

        for (let i = 0; i < client_stack_obj.contents.length; i++)
        {
            items.push(new inv.item(client_stack_obj.contents[i]));
        }

        client_stack = new inv.stack(items);
        

        // This is bad
        if (!stack.equals(client_stack, true))
        {
            jcmp.events.CallRemote('inventory/sync/init', this.player, 
                JSON.stringify(this.to_array()), JSON.stringify(this.slots));
            /*this.desync();
            console.log(`Error in changing index! Stacks do not match! BAD BAD BAD.`);
            console.log(`${category} ${old_index} ${new_index}`);
            console.log(client_stack_obj);*/
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to change_index, but the stacks did not match. 
                steam_id: ${this.player.client.steam_id} category: ${category} old_index: ${old_index} 
                new_index: ${new_index}`);
            /*jcmp.events.Call('watchlist/AddStrike', this.player.c.general.steam_id, `Player tried to change_index in inventory, 
                but client stack did not match server stack.`, this.player);*/
            return;
        }

        this.contents[category].splice(old_index, 1);
        this.contents[category].splice(new_index, 0, stack);

        jcmp.events.CallRemote('inventory/sync/change_id', this.player, category, old_index, new_index);

        this.update();
    }

    /**
     * Unequips an item that is equipped.
     * 
     * @param {string} category - The category that the item is in.
     * @param {string} name - The index of the stack in the category.
     */

    set_not_equipped (category, name)
    {
        for (let i = 0; i < this.contents[category].length; i++)
        {
            if (this.contents[category][i].prop('name') == name && this.contents[category][i].get_first().equipped)
            {
                this.contents[category][i].get_first().equipped = false;

                jcmp.events.CallRemote('inventory/sync/update', this.player, 
                    JSON.stringify({contents: this.contents[category][i].to_array()}), i);

                this.update();

                return;
            }
        }

    }

    /**
     * Called when a player clicks an item in their inventory, either to use it or equip/unequip it.
     * 
     * @param {object} stack - The stack that the player is clicking on.
     * @param {number} index - The index of the stack in the category.
     */

    click_item (s, index)
    {
        if (!this.can_use || this.player.client.ping > 500 || this.player.health <= 0 || this.desynced) {return;}

        
        if (this.player.iu.using)
        {
            jcmp.notify(this.player, {
                title: 'Cannot use item!',
                subtitle: `You are already using ${this.player.iu.item.name}! Cannot use another item right now.`,
                preset: 'warn'
            })
            return;
        }

        this.can_use = false;

        setTimeout(() => 
        {
            this.can_use = true;
        }, 50);

        if (!this.contents[s.contents[0].category] || !this.contents[s.contents[0].category][index])
        {
            console.log(`Tried to click item, but item does not exist in inventory.`);
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to click_item, but item does not exist in inventory.
                steam_id: ${this.player.c.general.steam_id} index: ${index}`);
            return;
        }

        const category = s.contents[0].category;
        const stack = this.contents[category][index];
        let client_stack;

        let items = [];

        for (let i = 0; i < s.contents.length; i++)
        {
            items.push(new inv.item(s.contents[i]));
        }

        client_stack = new inv.stack(items);

        const compare_contents = [];

        for (let i = 0; i < stack.contents.length; i++)
        {
            compare_contents.push(stack.contents[i]);
        }


        const compare_stack = new inv.stack(compare_contents);

        if (!compare_stack.equals(client_stack, true) || this.has_stack(client_stack, true) === -1)
        {
            jcmp.events.CallRemote('inventory/sync/init', this.player, 
                JSON.stringify(this.to_array()), JSON.stringify(this.slots));
            /*this.desync();
            console.log(`Tried to click item, but client stack did not match! BAD BAD BAD`);
            console.log(client_stack);
            console.log(compare_stack);
            console.log(index);*/
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to click_item, but stacks did not match.
                steam_id: ${this.player.c.general.steam_id}`);
            /*jcmp.events.Call('watchlist/AddStrike', this.player.c.general.steam_id, `Player tried to click_item in inventory, 
                but client stack did not match server stack.`, this.player);*/
            return;
        }

        // If this is a usable item
        if (stack.prop('can_use'))
        {
            // Fire event to let other scripts handle items
            jcmp.events.Call('inventory/events/use_item', this.player, stack.duplicate(), index);
            jcmp.events.Call('log', 'inventory', 
                `Player ${this.player.c.general.name} used a ${stack.prop('name')}`);
        }
        else if (stack.prop('can_equip')) // Otherwise this is an item that can be equipped
        {
            const update_ids = [];

            const equipped_before = stack.get_first().equipped;

            // Search for other items of the same equip type
            for (let i = 0; i < this.contents[category].length; i++)
            {
                const search_stack = this.contents[category][i];

                for (let j = 0; j < search_stack.contents.length; j++)
                {
                    if (search_stack.contents[j].equipped == true 
                        && search_stack.contents[j].equip_type == stack.prop('equip_type'))
                    {
                        // If another item of the same type is equipped
                        search_stack.contents[j].equipped = false;
                        jcmp.events.Call('inventory/events/equip_item', this.player, search_stack.contents[j].duplicate(), i);
                        if (update_ids.indexOf(i) == -1 && i != index)
                        {
                            update_ids.push(i);
                        }

                    }
                }
            }

            jcmp.events.Call('log', 'inventory', 
                `Player ${this.player.c.general.name} equipped/unequipped a ${stack.prop('name')}`);

            stack.get_first().equipped = !equipped_before;

            jcmp.events.Call('inventory/events/equip_item', this.player, stack.get_first().duplicate(), index);

            update_ids.push(index);

            update_ids.forEach((id) => 
            {
                jcmp.events.CallRemote('inventory/sync/update', this.player,
                    JSON.stringify({contents: this.contents[category][id].to_array()}), id);
            });

            this.update_slots(inv.utils.GetSlots(this.player.c.exp.level, this.player.c.inventory));
            this.update();

        }

    }

    /**
     * Called when a player drops an item from their inventory.
     * 
     * @param {object} s - Stack of the item from the client.
     * @param {number} index - The index of the stack in the category.
     */

    drop_item (s, index, amount)
    {
        if (this.player.client.ping > 500 || this.desynced) {return;}
        if ((this.player.iu && this.player.iu.using) || this.player.health <= 0 || !this.can_drop) {return;}

        if (!this.contents[s.contents[0].category] || !this.contents[s.contents[0].category][index])
        {
            console.log(`Tried to drop item, but item does not exist in inventory.`);
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to drop_item, but item does not exist in inventory. 
                steam_id: ${this.player.c.general.steam_id} index: ${index} amount: ${amount}`);
            return;
        }

        const category = s.contents[0].category;
        const stack = this.contents[category][index];
        let client_stack;

        let items = [];

        for (let i = 0; i < s.contents.length; i++)
        {
            s.contents[i].amount = (stack.prop('durability') == undefined && stack.prop('can_equip') == undefined) ?
                amount : 1;
            items.push(new inv.item(s.contents[i]));
        }

        client_stack = new inv.stack(items);

        if (client_stack.prop('durability') == undefined && client_stack.prop('can_equip') == undefined)
        {
            client_stack.get_first().amount = amount;
        }

        if (!stack.equals_no_amount(client_stack, true) || this.has_stack(client_stack, true) === -1)
        {
            jcmp.events.CallRemote('inventory/sync/init', this.player, 
                JSON.stringify(this.to_array()), JSON.stringify(this.slots));
            /*this.desync();
            console.log(`Tried to drop item, but client stack did not match! BAD BAD BAD`);
            console.log(client_stack);
            console.log(stack);
            console.log(index);*/
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to drop_item, but stacks did not match. Strike added. 
                steam_id: ${this.player.c.general.steam_id} index: ${index} amount: ${amount}`);
            /*jcmp.events.Call('watchlist/AddStrike', this.player.c.general.steam_id, `Player tried to drop_item in inventory, 
                but client stack did not match server stack.`, this.player);*/
            return;
        }

        const drop_stack = client_stack.duplicate();

        const amount_ = client_stack.get_amount();
        const name_ = client_stack.prop('name');

        // If the player is trying to drop the item in the vehicle storage
        if (this.player.vehicle)
        {
            if (!this.player.vehicle.inventory) {return;}

            this.remove_stack(drop_stack.duplicate(), index);
            
            // Make sure nothing is equipped
            for (let i = 0; i < drop_stack.contents.length; i++)
            {
                if (drop_stack.contents[i].equipped)
                {
                    drop_stack.contents[i].equipped = false;
                    const equip_item = drop_stack.contents[i].duplicate();
                    jcmp.events.Call('inventory/events/equip_item', this.player, equip_item);
                }
            }

            const return_stack = this.player.vehicle.inventory.add_stack(drop_stack, this.player);

            // If the vehicle's inventory overflowed
            if (return_stack && return_stack.contents && return_stack.length > 0)
            {
                this.add_stack(return_stack); // Add back the overflowed items

                const drops = [];
                drops.push(return_stack.duplicate().to_array_chat());

                jcmp.notify(this.player, {
                    title: 'Vehicle inventory overflow!',
                    subtitle: `Could not add [${name_} x${return_stack.get_amount()}]`,
                    preset: 'warn',
                    time: 5000
                })
                
                inv.chat.send(this.player, 
                    `<b>Vehicle inventory overflow! Could not add [${name_} x${return_stack.get_amount()}]</b>`, 
                    new RGBA(255,0,0,255), 
                    {timeout: 10, stack: JSON.stringify(drops)});

            }
        }
        else if (this.player.current_box && this.player.current_box.is_storage) // Trying to drop in a storage
        {
            if (!this.player.current_box.storage.can_open(this.player) || this.player.unlocked_storage != this.player.current_box.storage.id)
            {
                return;
            }

            this.remove_stack(drop_stack.duplicate(), index);
            
            // Make sure nothing is equipped
            for (let i = 0; i < drop_stack.contents.length; i++)
            {
                if (drop_stack.contents[i].equipped)
                {
                    drop_stack.contents[i].equipped = false;
                    const equip_item = drop_stack.contents[i].duplicate();
                    jcmp.events.Call('inventory/events/equip_item', this.player, equip_item);
                }
            }

            const return_stack = this.player.current_box.storage.add_stack(drop_stack, this.player);

            // If the storage's inventory overflowed
            if (return_stack && return_stack.contents && return_stack.length > 0)
            {
                this.add_stack(return_stack); // Add back the overflowed items

                const drops = [];
                drops.push(return_stack.duplicate().to_array_chat());

                jcmp.notify(this.player, {
                    title: 'Storage is full!',
                    subtitle: `Could not add [${name_} x${return_stack.get_amount()}]`,
                    preset: 'warn',
                    time: 5000
                })
                
                inv.chat.send(this.player, 
                    `<b>Storage is full! Could not add [${name_} x${return_stack.get_amount()}]</b>`, 
                    new RGBA(255,0,0,255), 
                    {timeout: 10, stack: JSON.stringify(drops)});

            }
        }
        else //Otherwise they are dropping it on the ground
        {
            this.remove_stack(drop_stack.duplicate(), index);

            // Make sure nothing is equipped
            for (let i = 0; i < drop_stack.contents.length; i++)
            {
                if (drop_stack.contents[i].equipped)
                {
                    drop_stack.contents[i].equipped = false;
                    const equip_item = drop_stack.contents[i].duplicate();
                    jcmp.events.Call('inventory/events/equip_item', this.player, equip_item);
                }
            }

            this.update_slots(inv.utils.GetSlots(this.player.c.exp.level, this.player.c.inventory));

            jcmp.events.Call('inventory/drop_stack', this.player, drop_stack);
            
            const drops = [];
            drops.push(drop_stack.duplicate().to_array_chat());

            inv.chat.send(this.player, `<b>Dropped [${name_} x${amount_}]</b>`, new RGBA(255,255,255,255), 
                {channel: 'Log', stack: JSON.stringify(drops)});

            jcmp.events.Call('log', 'inventory', `Player ${this.player.c.general.name} dropped ${amount_} ${name_}  
                ${this.player.c.general.steam_id}.`);
        }

    }

    /**
     * Shifts the items in a stack.
     */

    shift_item (s, index)
    {
        if (!this.can_shift || this.player.client.ping > 500 || this.player.iu.using || this.desynced) {return;} // Lag prevention
        
        this.can_shift = false;

        setTimeout(() => 
        {
            this.can_shift = true;
        }, 50);

        if (!s.contents || !s.contents[0] || !this.contents[s.contents[0].category] 
            || !this.contents[s.contents[0].category][index])
        {
            console.log(`Tried to shift item, but item does not exist in inventory.`);
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to shift_item, but item does not exist in inventory. 
                steam_id: ${this.player.client.steam_id} index: ${index}`);
            return;
        }

        const category = s.contents[0].category;
        const stack = this.contents[category][index];
        let client_stack;

        let items = [];

        for (let i = 0; i < s.contents.length; i++)
        {
            items.push(new inv.item(s.contents[i]));
        }

        client_stack = new inv.stack(items);

        if (client_stack.contents.length == 1)
        {
            return; // Can only shift stacks with durability or with more than 1 item or custom properties
        }

        if (!stack.equals(client_stack, true))
        {
            jcmp.events.CallRemote('inventory/sync/init', this.player, 
                JSON.stringify(this.to_array()), JSON.stringify(this.slots));
            /*this.desync();
            console.log(`Tried to shift stack, but client stack did not match! BAD BAD BAD`);
            console.log(client_stack);
            console.log(stack);
            console.log(index);*/
            jcmp.events.Call('log', 'inventory', `[ERROR] Tried to shift_stack, but stacks did not match. 
                steam_id: ${this.player.c.general.steam_id} index: ${index}`);
            /*jcmp.events.Call('watchlist/AddStrike', this.player.c.general.steam_id, `Player tried to shift_stack in inventory, 
                but client stack did not match server stack.`, this.player);*/
            return;
        }

        stack.contents.push(stack.contents.splice(0, 1)[0]);

        jcmp.events.CallRemote('inventory/sync/update', this.player,
            JSON.stringify({contents: stack.to_array()}), index);

        this.update();

    }


    /**
     * Called when the player dies. Drops items from inventory based on level.
     * 
     * @param {boolean} killed - Whether or not this player was killed by another player.
     */

    death_drop (killed)
    {
        if (this.has_ddp()) {return;}
        if (this.player.suiciding == true || jcmp.in_neutralzone(this.player)) {return;}

        const ddrop_info = inv.config.death_drops[this.player.c.exp.level];

        if (!ddrop_info)
        {
            console.error('Woah! Someone died but we cant get the death drop info!');
            return;
        }

        let drop_msg = '<b>Death drop: ';
        let at_least_one = false;
        const drops = [];

        jcmp.events.Call('log', 'inventory', 
            `Player ${this.player.c.general.name} died and dropped: `);

        const inv_copy = [];
        const stacks_to_remove = [];

        // Duplicate inventory
        for (let cat in this.contents)
        {
            for (let i = 0; i < this.contents[cat].length; i++)
            {
                if (!this.contents[cat][i].prop('nodrop'))
                {
                    inv_copy.push(this.contents[cat][i].duplicate());
                }
            }
        }

        let num_stacks = (Math.random() * (ddrop_info.max_stacks - ddrop_info.min_stacks)) + ddrop_info.min_stacks;

        if (!num_stacks || num_stacks < 1) {return;}
        
        // While we still have stacks to remove and have items that we can remove
        while (num_stacks > 0 && inv_copy.length > 0)
        {
            const stack = inv_copy.splice(Math.floor(inv_copy.length * Math.random()), 1)[0];

            const amt = Math.round(stack.get_amount() * 
                (Math.random() * (ddrop_info.max_percent - ddrop_info.min_percent) + ddrop_info.min_percent));

            if (amt == 0)
            {
                num_stacks--;
                continue;
            }

            const remove_entire_stack = amt == stack.get_amount();

            if (stack.prop('durability') === undefined && stack.prop('cap_equip') != undefined && stack.contents.length > 0)
            {
                while (stack.contents.length > amt)
                {
                    stack.contents = stack.contents.splice(Math.floor(stack.contents.length * Math.random()), 1);
                }
            }
            else
            {
                stack.get_first().amount = amt;
            }

            // Unequip items
            for (let i = 0; i < stack.contents.length; i++)
            {
                if (stack.contents[i].equipped == true)
                {
                    stack.contents[i].equipped = false;
                    const equip_item = stack.contents[i].duplicate();
                    jcmp.events.Call('inventory/events/equip_item', this.player, equip_item);
                }
            }

            const name = stack.prop('name');

            drops.push(stack.to_array_chat());

            drop_msg += `[${stack.prop('name')} x${stack.get_amount()}]`;

            if (num_stacks > 1 && inv_copy.length > 0) {drop_msg += ' ';} else {drop_msg += `</b>`;}

            stacks_to_remove.push(stack);
            jcmp.events.Call('inventory/drop_stack', this.player, stack.duplicate());

            at_least_one = true;

            jcmp.events.Call('log', 'inventory', 
                ` - ${name} x${amt}`);

            num_stacks--;
        }

        for (let i = 0; i < stacks_to_remove.length; i++)
        {
            this.remove_stack(stacks_to_remove[i]);
        }

        if (killed && Math.random() < 0.1) // 10% chance to drop dogtag
        {
            const idata = inv.utils.FindItem('Dogtag');

            if (idata)
            {
                idata.amount = 1;
                idata.custom_data.dogtag = this.player.c.general.name;
                
                const g = new inv.item(idata);
                const s = new inv.stack([g]);

                jcmp.events.Call('inventory/drop_stack', this.player, s);
            }
        }

        this.update();
        this.update_slots(inv.utils.GetSlots(this.player.c.exp.level, this.player.c.inventory));

        if (at_least_one)
        {
            inv.chat.send(this.player, drop_msg, new RGBA(255,0,0,255), {channel: 'Log', stack: JSON.stringify(drops)});
        }
        
    }


    /**
     * Drops all items in the player's inventory. Usually only used for combat logging.
     */
    drop_all ()
    {
        if (this.has_ddp()) {return;}

        jcmp.events.Call('log', 'inventory', 
            `${this.player.c.general.name} disconnected while in combat. Dropping EVERYTHING.`);

        for (let cat in this.contents)
        {
            while (this.get_total_items_cat(true, cat) > 0)
            {
                for (let i = 0; i < this.contents[cat].length; i++)
                {
                    if (!this.contents[cat][i].prop('nodrop'))
                    {
                        const dropped_stack = this.contents[cat].splice(i, 1)[0];

                        for (let i = 0; i < dropped_stack.contents.length; i++)
                        {
                            if (dropped_stack.contents[i].equipped == true)
                            {
                                dropped_stack.contents[i].equipped = false;
                            }
                        }

                        jcmp.events.Call('inventory/drop_stack', this.player, dropped_stack);
                    }
                }
            }

        }

        this.update();
    }


    /**
     * Modifies the durability of an equipped item using its name by amount.
     * 
     * @param {string} name - The name of the item.
     * @param {number} amount - The amount to change the durability of the item.
     */

    modify_dura_equipped (name, amount)
    {
        if (!name || !amount || amount == 0)
        {
            console.log(`Cannot modify_dura_equipped, something is missing!`);
            return;
        }

        let item;
        let stack;
        let index;

        // Search all items for an equipped item with this name
        loop: for (let cat in this.contents)
        {
            for (let i = 0; i < this.contents[cat].length; i++)
            {
                for (let j = 0; j < this.contents[cat][i].contents.length; j++)
                {
                    // If this item is equipped
                    if (this.contents[cat][i].contents[j].equipped == true 
                        && this.contents[cat][i].contents[j].name == name)
                    {
                        item = this.contents[cat][i].contents[j];
                        stack = this.contents[cat][i];
                        index = i;
                        break loop;
                    }
                }
            }
        }

        if (item && stack)
        {
            item.durability = Math.max(0, item.durability + amount);
            
            if (item.durability <= 0)
            {
                jcmp.notify(this.player, {
                    title: `${item.name} broke!`,
                    subtitle: `Your ${item.name} ran out of durability and broke.`,
                    time: 5000
                })

                inv.chat.send(this.player, 
                    `<b>${item.name} ran out of durability and broke.</b>`, 
                    new RGBA(255,0,255,255), {channel: 'Log'});

                this.remove_item(item, index);
            }
            else
            {
                jcmp.events.CallRemote('inventory/sync/update', this.player, 
                    JSON.stringify({contents: stack.to_array()}), index);
            }

            this.update();

        }
        else // Happens when someone is using a grapplehook and then drops it and it tries to modify dura
        {
            console.log(`Failed to locate an equipped item with name ${name} and amount ${amount}.`);
            console.log(item);
            console.log(stack);
            console.log(index);
            jcmp.events.Call('log', 'inventory', `[ERROR] Failed to locate an equipped item with name ${name} and amount ${amount}. ${this.player.c.general.steam_id}`);
            return;
        }
    }


    /**
     * Called when the client's inventory does not match the server's. Disables inventory usage and 
     * shows the "DESYNC DETECTED" indicator.
     */

    desync ()
    {
        this.player.dimension = 500; // Temp desync dimension while they are kicked
        this.desynced = true;

        jcmp.events.CallRemote('inventory/sync/show_desync', this.player);

        setTimeout(() => 
        {
            if (this.player && this.player.name && this.player.c && this.player.c.inventory)
            {
                this.player.Kick('Desync detected');
            }
        }, 5000);
    }

    /**
     * Returns the total amount of items in the inventory.
     * 
     * @param {boolean} d - Set this to true if you only want items that can be dropped from the inventory (nodrop)
     * @returns {number}
     */

    get_total_items (d)
    {
        let total = 0;

        for (let cat in this.contents)
        {
            if (d === true)
            {
                for (let i = 0; i < this.contents[cat].length; i++)
                {
                    if (!this.contents[cat][i].prop('nodrop'))
                    {
                        total += 1;
                    }
                }
            }
            else
            {
                total += this.contents[cat].length;
            }
            
        }

        return total;
    }

    /**
     * Returns the total amount of items in the inventory.
     * 
     * @param {boolean} d - Set this to true if you only want items that can be dropped from the inventory (nodrop)
     * @param {string} cat - Category that you want to search
     * @returns {number}
     */

    get_total_items_cat (d, cat)
    {
        let total = 0;

        if (d === true)
        {
            for (let i = 0; i < this.contents[cat].length; i++)
            {
                if (!this.contents[cat][i].prop('nodrop'))
                {
                    total += 1;
                }
            }
        }
        else
        {
            total += this.contents[cat].length;
        }

        return total;
    }

    /**
     * Changes slot maximums. Updates on server and client.
     */

    update_slots (slots)
    {
        this.slots = slots;
        jcmp.events.CallRemote('inventory/sync/update_slots', this.player, JSON.stringify(this.slots));


        for (let cat in this.contents)
        {
            // While it is overflowed
            while (this.contents[cat].length > this.slots[cat])
            {
                const stack = this.contents[cat][this.contents[cat].length - 1];
                const name = stack.prop('name');
                const amount = stack.get_amount();

                // Remove last item
                this.remove_stack(stack, this.contents[cat].length - 1);

                jcmp.notify(this.player, {
                    title: 'Inventory overflow!',
                    subtitle: `Inventory overflowed and you dropped ${amount} ${name}.`,
                    preset: 'warn',
                    time: 5000
                })

                inv.chat.send(this.player, `<b>Inventory overflow! Dropping ${amount} ${name}.</b>`, new RGBA(255,0,0,255));

                jcmp.events.Call('log', 'inventory', `Inventory overflow! Dropping ${amount} ${name} for player 
                    ${this.player.c.general.steam_id}.`);

                jcmp.events.Call('inventory/drop_stack', this.player, stack, true); // Create dropbox
            }
        }

    }


    /**
     * Should be called whenever the inventory changes. Updates SQL with new inventory.
     */

    update ()
    {
        inv.db.UpdateDatabase(this.player);
    }

    /**
     * Converts a string (from SQL db) and returns an object with data and slots, depending on 
     * player level and what items are equipped.
     * 
     * @param {object} data - The string that we want to convert.
     * @param {number} level - The level of the player.
     * @returns {object} - An object with data and slots.
     */

    static convert_string(data, level)
    {
        if (!data || typeof(data) != 'string')
        {
            console.log('Failed to convert_string because it is not a string.');
            return;
        }

        if (data.length < 2)
        {
            return {slots: inv.config.default_slots[level]};
        }

        const split = data.split('|');
        const inventory = [];

        stack_loop: for (let i = 0; i < split.length - 1; i++) // Each stack
        {
            const split2 = split[i].split('~');
            let stack;

            for (let j = 0; j < split2.length - 1; j++) // Each item within the stack
            {
                let split3 = split2[j].split('.');
                let item_data = {};

                for (let k = 0; k < split3.length; k++) // Each property within the item
                {
                    if (k == 0) // Name
                    {
                        item_data.name = split3[k];

                        item_data = inv.utils.FindItem(item_data.name); // Get all item data

                        if (item_data == undefined) // Unable to find item, eg does not exist
                        {
                            console.log(`Unable to find item with name ${split3[k]} in convert_string`);
                            jcmp.events.Call('log', 'inventory', 
                                `[ERROR] Unable to find item with name ${split3[k]}.`);
                            continue stack_loop;
                        }
                    }
                    else if (k == 1) // Amount
                    {
                        item_data.amount = split3[k];
                    }
                    else if (split3[k].startsWith('E') && k > 1 && item_data.can_equip) // Equipped
                    {
                        item_data.equipped = true;
                    }
                    else if (split3[k].startsWith('D') && k > 1) // Durability
                    {
                        item_data.durability = parseInt(split3[k].replace('D', ''));
                    }
                    else if (split3[k].startsWith('N') && k > 1) // Custom property/data
                    {
                        const replaced = split3[k].replace('N', '');
                        const replaced_split = replaced.split('>');
                        item_data.custom_data[replaced_split[0]] = replaced_split[1];
                    }
                    
                }

                const item = new inv.item(item_data); // Create item

                if (!stack) // If this is the first item, create the stack
                {
                    stack = new inv.stack([item]);
                }
                else // Otherwise, add it to the front of the stack
                {
                    stack.add(item);
                }

                
            }

            // .amount for the first item goes to 2 or something and then new items are not added to the stack

            inventory.push(stack);
            

        }

        return {data: inventory, slots: inv.config.default_slots[level]};
    }

    /**
     * Converts an Inventory object into a string so it can go into the SQL db. Stacks are 
     * split by |, items are split by ~, and items' properties are split by .
     * 
     * @returns {string}
     */

    static convert_inv(inventory)
    {
        let str = '';
        for (let cat in inventory.contents)
        {
            for (let i = 0; i < inventory.contents[cat].length; i++)
            {
                for (let j = 0; j < inventory.contents[cat][i].contents.length; j++)
                {
                    const item = inventory.contents[cat][i].contents[j];
                    str += item.name + '.' + item.amount;

                    str = (item.equipped === true) ? str + '.E' : str;
                    str = (item.durability && item.durability > 0) ? str + '.D' + item.durability : str;
                    //str = (item.dogtag != undefined) ? str + '.N' + item.dogtag : str;

                    // If this item has at least 1 custom data
                    for (const property in item.custom_data) 
                    {
                        if (item.custom_data.hasOwnProperty(property)) 
                        {
                            str += '.N' + property + '>' + item.custom_data[property];
                        }
                    }

                    str += '~';
                }

                str += '|';
            }
        }

        return str;
    }

    /**
     * Prints all contents of the inventory.
     */

    print ()
    {
        for (let cat in this.contents)
        {
            for (let i = 0; i < this.contents[cat].length; i++)
            {
                for (let j = 0; j < this.contents[cat][i].contents.length; j++)
                {
                    console.log(`CATEGORY ${cat} STACK ${i} ITEM ${j}:`);
                    console.log(this.contents[cat][i].contents[j]);
                }
            }
        }
    }

    /**
     * Turns the inventory into an array so that it can be sent to the client. Only needed for initialization.
     * 
     * @returns {object} - An array of items for the client.
     */

    to_array ()
    {
        const inv_send = 
        {
            Cosmetics: [],
            Weaponry: [],
            Utility: [],
            Survival: []
        }

        for (let cat in this.contents)
        {
            for (let i = 0; i < this.contents[cat].length; i++)
            {
                const s = {contents: []};
                for (let j = 0; j < this.contents[cat][i].contents.length; j++)
                {
                    s.contents.push(this.contents[cat][i].contents[j].to_array());
                }
                inv_send[cat][i] = s;
            }
        }

        return inv_send;
    }

    /**
     * Checks if the player has a DDP item (Death Drop Preventer) so if true, they won't drop anything ever.
     */
    has_ddp ()
    {
        for (let i = 0; i < this.contents['Utility'].length; i++)
        {
            if (this.contents['Utility'][i].prop('name') == 'DDP')
            {
                return true;
            }   
        }
        return false;
    }
}