/**
 * Inventory class for management, modification, and sync.
 */
module.exports = class VInventory
{
    /**
     * Constructor for the VInventory class.
     * 
     * @param {object} slots - An object with the amounts of slots for each inventory category.
     * @param {object} vehicle - The vehicle that this inventory belongs to.
     */
    constructor (slots, vehicle)
    {
        // Create arrays for inventory categories
        this.contents = [];

        // Store slot data - just a number
        this.slots = slots;

        this.vehicle = vehicle;
        this.vehicle.inventory = this;

        this.can_shift = true; // Latency resolver
        this.can_use = true; // Latency resolver
        this.can_drop = true; // Latency resolver

        if (!this.vehicle)
        {
            console.log(`Vehicle does not exist! Not initializing inventory!`);
            return;
        }

    }
    
    /**
     * Adds an item to the inventory, if possible. If there is no room, it will overflow what didn't fit into the 
     * inventory. Syncs to clients immediately.
     * 
     * @param {object} item - The item that we want to add.
     * @param {object} player - The player who added the item.
     */

    add_item (item, player)
    {
        // Trying to add a single item? Nah, we add stacks here.
        this.add_stack(new inv.stack([item]), player);
    }


    /**
     * Adds an stack of items to the inventory, if possible. If there is no room, it will overflow what didn't fit into the 
     * inventory. Syncs to clients immediately.
     * 
     * @param {object} stack - The item that we want to add.
     * @param {object} player - The player who added the item.
     */

    add_stack (stack, player)
    {
        if (!stack.prop('name') || !stack.prop('rarity') || !stack.prop('amount') || 
            !stack.prop('category') || !stack.prop('stacklimit'))
        {
            console.error(`What buffoon tried to add a stack without the proper data?! tsk tsk vehicle`);
            return;
        }

        // See if we can stack it with another item, or if it needs to be split up into multiple stacks
        for (let i = 0; i < this.contents.length; i++)
        {
            const this_stack = this.contents[i];

            // If this is the same type of item and we have room in the stack, then stack it!
            let stackable = this_stack.get_amount() < this_stack.prop('stacklimit');

            // If we have room to stack it on an existing stack and it is the same type of item
            if (this_stack.prop('name') === stack.prop('name') && stackable)
            {
                // TODO add logic to make it so it adds to the smallest stacks

                // If this is not a durable item OR 
                if (!stack.prop('durability') && !this_stack.prop('durability') && !this_stack.prop('can_equip'))
                {
                    // Amount to add
                    let stack_amount = Math.min(this_stack.prop('stacklimit') - this_stack.get_amount(), stack.get_amount());

                    // Update data
                    this_stack.get_first().amount = parseInt(this_stack.get_first().amount) + parseInt(stack_amount);
                    stack.get_first().amount = stack.get_first().amount - stack_amount;

                    jcmp.events.CallRemote('vinventory/sync/update', player, 
                        JSON.stringify({contents: this_stack.to_array()}), i);

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

                        jcmp.events.CallRemote('vinventory/sync/update', player, 
                            JSON.stringify({contents: this_stack.to_array()}), i);

                        // Remove item from old stack
                        stack.remove(stack.get_first());

                    }

                }
            }
        }

        let max_slots = this.slots;

        // Splits up items if they overflow stack limits
        while (stack.get_amount() > 0 && this.contents.length < max_slots)
        {
            // Split logic for stacks
            while (stack.get_amount() > stack.prop('stacklimit') && this.contents.length < max_slots)
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
                const index = this.contents.push(temp_stack) - 1;

                jcmp.events.CallRemote('vinventory/sync/add', player, 
                    JSON.stringify({contents: temp_stack.to_array()}), index);

            }

            const index = this.contents.push(stack.duplicate()) - 1;
            
            stack.contents = [];

        
            jcmp.events.CallRemote('vinventory/sync/add', player, 
                JSON.stringify({contents: this.contents[index].to_array()}), index);

        }

        // If we were not able to put all our items in our inventory
        if (stack.get_amount() > 0)
        {
            const amount_ = stack.get_amount();
            const name_ = stack.prop('name');

            // If we can't fit it all, add the remains back to the player's inventory
            player.c.inventory.add_stack(stack);

            jcmp.notify(player, {
                title: 'Vehicle inventory full!',
                subtitle: `Cannot add ${amount_} ${name_} to vehicle inventory.`,
                preset: 'warn'
            })

            inv.chat.send(player, `<b>Vehicle inventory full! Cannot add ${amount_} ${name_}.</b>`, new RGBA(255,255,0,255), {timeout: 10});
        }

    }


    /**
     * Removes an item from the inventory. If the item is durable, it will remove an item with matching 
     * durability. Syncs to clients immediately.
     * 
     * @param {object} item - The item we want to remove. This can have an amount greater than one.
     * @param {number} id - The id of the inventory slot we want to remove this item from.
     * @param {object} player - The player who removed the item.
     */

    remove_item (item, id, player)
    {
        // Make it easier and put all the logic in stax.
        this.remove_stack(new inv.stack([item]), id, player);
    }

    /**
     * Removes a stack of items from the inventory. Syncs to clients immediately.
     * 
     * @param {object} stack - The stack of items we want to remove.
     * @param {number} id - The id of the inventory slot we want to remove this item from.
     * @param {object} player - The player who removed the item.
     */

    remove_stack (stack, id, player)
    {
        // If we want to remove items from a specific stack
        if (stack && id != undefined)
        {
            const stack_data = this.contents[id];

            // If there is a mismatch of type of item, don't do anything
            if (stack_data.prop('name') != stack.prop('name') || stack_data.get_amount() < stack.get_amount() || 
                stack_data.prop('rarity') != stack.prop('rarity') 
                || !stack_data)
            {
                console.log(stack);
                console.log(stack_data);
                console.log('Tried to remove stack, but there was an error!');
                jcmp.events.Call('log', 'inventory', `[Vehicle] Tried to remove_stack, but there was a data mismatch. 
                    steam_id: ${player.c.general.steam_id}`);
                return;
            }

            // If we are removing an entire stack
            if (stack.get_amount() === stack_data.get_amount())
            {

                this.contents.splice(id, 1);
                jcmp.events.CallRemote('vinventory/sync/remove', player, 'Vehicle', id);

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

                            stack_data.remove(stack.contents.splice(i, 1)[0]);

                            if (stack_data.get_amount() == 0)
                            {
                                this.contents.splice(id, 1);
                                jcmp.events.CallRemote('vinventory/sync/remove', player, 'Vehicle', id);

                            }
                        }

                        j--;
                    }

                    i--;
                }

                jcmp.events.CallRemote('vinventory/sync/update', player, 
                    JSON.stringify({contents: stack_data.to_array()}), id);

            }
            else // If this is just a stack of one item, like bavarium
            {
                stack_data.remove(stack.contents.splice(0, 1)[0]);

                // If we removed an entire stack
                if (stack_data.get_amount() == 0)
                {
                    this.contents.splice(id, 1);
                    jcmp.events.CallRemote('vinventory/sync/remove', player, 'Vehicle', id);

                }
                else
                {
                    jcmp.events.CallRemote('vinventory/sync/update', player, 
                        JSON.stringify({contents: stack_data.to_array()}), id);

                }
            }

        }

    }

    /**
     * Called when a player enters the vehicle in the driver seat. Sends the vehicle's current inventory to the player.
     * 
     * @param {object} player - The player who entered the vehicle.
     */

    player_enter (player)
    {
        jcmp.events.CallRemote('vinventory/sync/init', player, JSON.stringify(this.to_array()), this.slots);
    }


    /**
     * Checks if the player has a specific item in their inventory.
     * 
     * @param {object} item - The item we want to search for.
     * @returns {boolean} - Whether or not the inventory contains the item.
     */

    has_item (item)
    {
        return this.has_stack(new inv.stack([item]));
    }


    /**
     * Checks if the player has a specific stack of items in their inventory.
     * 
     * @param {object} item - The item we want to search for.
     * @returns {boolean} - Whether or not the inventory contains the item.
     */

    has_stack (stack)
    {
        const new_stack = stack.duplicate();

        for (let i = 0; i < this.contents.length; i++)
        {
            const check_stack = this.contents[i].duplicate();

            // If this is a "stackable" stack (like 2 grapplehooks)
            if ((new_stack.prop('durablility') != undefined || new_stack.prop('can_equip'))
                && (check_stack.prop('durablility') != undefined || check_stack.prop('can_equip'))
                && new_stack.prop('name') === check_stack.prop('name'))
            {
                // If we are checking durable items
                if (new_stack.prop('durability') && check_stack.prop('durability'))
                {
                    const outer_length = check_stack.contents.length;
                    outer_loop: for (let i = 0; i < outer_length; i++)
                    {
                        const inner_length = new_stack.contents.length;
                        this_loop: for (let j = 0; j < inner_length; j++)
                        {
                            if (check_stack.contents[i].durability === new_stack.contents[j].durability)
                            {
                                // Remove checked item from stack so we don't check again
                                new_stack.contents.splice(j, 1);

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
            else if (!(new_stack.prop('durablility') != undefined || new_stack.prop('can_equip'))
                && !(check_stack.prop('durablility') || check_stack.prop('can_equip'))
                && new_stack.prop('name') === check_stack.prop('name'))
            {
                new_stack.get_first().amount -= Math.min(new_stack.get_first().amount, check_stack.get_amount());
            }


        }

        return new_stack.get_amount() === 0;

    }


    /**
     * Takes an item out of index and puts it in new index. Does not swap items.
     * 
     * @param {object} category - The category that the item is in.
     * @param {number} old_index - The index that the item was in.
     * @param {number} new_index - The new index that we want to move the item to.
     * @param {object} client_stack_obj - The stack that the client has in their inventory in this space. MUST MATCH.
     * @param {object} player - The player who is trying to change index.
     */

    change_index (category, old_index, new_index, client_stack_obj, player)
    {
        if (player.client.ping > 500) {return;}

        if (!this.contents[old_index] || !this.contents[new_index] || !client_stack_obj || client_stack_obj.length == 0)
        {
            console.log(`vError in changing index! Something is bad here!`);
            console.log(`${category} ${old_index} ${new_index}`);
            console.log(client_stack_obj);
            console.log(`${player.c.general.name} ${player.client.steamId}`);
            jcmp.events.Call('log', 'inventory', `[Vehicle] Tried to change_index, but something did not match. 
                steam_id: ${player.client.steam_id} category: ${category} old_index: ${old_index} 
                new_index: ${new_index}`);
            return;
        }

        const stack = this.contents[old_index];
        let client_stack;

        let items = [];

        for (let i = 0; i < client_stack_obj.contents.length; i++)
        {
            items.push(new inv.item(client_stack_obj.contents[i]));
        }

        client_stack = new inv.stack(items);
        

        // This is bad
        if (!stack.equals(client_stack))
        {
            console.log(`vError in changing index! Stacks do not match! BAD BAD BAD.`);
            console.log(`${category} ${old_index} ${new_index}`);
            console.log(client_stack_obj);
            jcmp.events.Call('log', 'inventory', `[Vehicle] Tried to change_index, but the stacks did not match. Strike added. 
                steam_id: ${player.client.steam_id} category: ${category} old_index: ${old_index} 
                new_index: ${new_index}`);
            jcmp.events.Call('watchlist/AddStrike', player.c.general.steam_id, `Player tried to change_index in vinventory, 
                but client stack did not match server stack.`, player);
            return;
        }

        this.contents.splice(old_index, 1);
        this.contents.splice(new_index, 0, stack);

        jcmp.events.CallRemote('vinventory/sync/change_id', player, 'Vehicle', old_index, new_index);

    }

    /**
     * Called when a player clicks an item in the vehicle's inventory to take it.
     * 
     * @param {object} stack - The stack that the player is clicking on.
     * @param {number} index - The index of the stack in the category.
     * @param {object} player - The player that clicked the item.
     */

    click_item (s, index, player)
    {
        if (!this.can_use || player.client.ping > 500 || player.health <= 0) {return;}

        this.can_use = false;

        setTimeout(() => 
        {
            this.can_use = true;
        }, 500);

        if (!this.contents[index])
        {
            console.log(`Tried to click item, but item does not exist in vinventory.`);
            jcmp.events.Call('log', 'inventory', `[Vehicle] Tried to click_item, but item does not exist in vinventory.
                steam_id: ${player.c.general.steam_id} index: ${index}`);
            return;
        }

        const stack = this.contents[index];
        let client_stack;

        let items = [];

        for (let i = 0; i < s.contents.length; i++)
        {
            items.push(new inv.item(s.contents[i]));
        }

        client_stack = new inv.stack(items);

        if (!stack.equals(client_stack))
        {
            console.log(`Tried to click item, but client stack did not match! BAD BAD BAD`);
            console.log(client_stack);
            console.log(stack);
            console.log(index);
            jcmp.events.Call('log', 'inventory', `[Vehicle] Tried to click_item, but stacks did not match. Strike added. 
                steam_id: ${player.c.general.steam_id}`);
            jcmp.events.Call('watchlist/AddStrike', player.c.general.steam_id, `Player tried to click_item in vinventory, 
                but client stack did not match server stack.`, player);
            return;
        }

        this.remove_stack(stack.duplicate(), index, player); // Remove stack from vehicle
        const return_stack = player.c.inventory.add_stack(stack.duplicate()); // Add stack to player

        // If there was an overflow
        if (return_stack && return_stack.contents && return_stack.contents.length > 0)
        {
            this.add_stack(return_stack, player); // Add back the overflow
        }

    }

    /**
     * Shifts the items in a stack.
     * 
     * @param {object} s - The stack that the player is clicking on.
     * @param {number} index - The index of the stack in the category.
     * @param {object} player - The player that clicked the item.
     */

    shift_item (s, index, player)
    {
        if (!this.can_shift || player.client.ping > 500 || player.iu.using) {return;} // Lag prevention
        
        this.can_shift = false;

        setTimeout(() => 
        {
            this.can_shift = true;
        }, 500);

        if (!s.contents || !s.contents[0] || !this.contents[index])
        {
            console.log(`Tried to shift item, but item does not exist in vinventory.`);
            jcmp.events.Call('log', 'inventory', `[Vehicle] Tried to shift_item, but item does not exist in vinventory. 
                steam_id: ${player.client.steam_id} index: ${index}`);
            return;
        }

        const stack = this.contents[index];
        let client_stack;

        let items = [];

        for (let i = 0; i < s.contents.length; i++)
        {
            items.push(new inv.item(s.contents[i]));
        }

        client_stack = new inv.stack(items);

        if (client_stack.contents.length == 1)
        {
            return; // Can only shift stacks with durability or with more than 1 item
        }

        if (!stack.equals(client_stack))
        {
            console.log(`Tried to shift stack, but client stack did not match! BAD BAD BAD`);
            console.log(client_stack);
            console.log(stack);
            console.log(index);
            jcmp.events.Call('log', 'inventory', `[Vehicle] Tried to shift_stack, but stacks did not match. Strike added. 
                steam_id: ${player.c.general.steam_id} index: ${index}`);
            jcmp.events.Call('watchlist/AddStrike', player.c.general.steam_id, `Player tried to shift_stack in vinventory, 
                but client stack did not match server stack.`, player);
            return;
        }

        stack.contents.push(stack.contents.splice(0, 1)[0]);

        jcmp.events.CallRemote('vinventory/sync/update', player,
            JSON.stringify({contents: stack.to_array()}), index);

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
        const inv_send = [];

        for (let i = 0; i < this.contents.length; i++)
        {
            const s = {contents: []};
            for (let j = 0; j < this.contents[i].contents.length; j++)
            {
                s.contents.push(this.contents[i].contents[j].to_array());
            }
            inv_send[i] = s;
        }

        return inv_send;
    }
}