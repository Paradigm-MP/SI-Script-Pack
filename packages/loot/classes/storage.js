module.exports = class Storage
{
    /**
     * Useful extension for lootboxes to store additional data.
     * @param {*} owner_steam_id 
     * @param {*} lootbox 
     * @param {*} access_level 
     */
    constructor (id, owner_steam_id, lootbox, access_level, type, upgrades, name, code)
    {
        this.id = id;
        this.owner_steam_id = owner_steam_id;
        this.type = type;
        this.lootbox = lootbox;
        this.lootbox.storage_type = this.type;
        this.access_level = access_level;
        this.can_use = true;
        this.upgrades = upgrades; // Storage upgrades & locks
        this.name = name; // Custom name support
        this.keypad_code = code;

        // Apparently AddRemoteCallable doesn't return an EventInstance
        jcmp.events.AddRemoteCallable('storages/sync/change_access' + this.id, (player, access) => 
            {this.change_access(player, access)});
        
        /*jcmp.events.AddRemoteCallable('storages/sync/remove' + this.id, (player, id) => 
            {this.remove(player, parseInt(id))});*/

        jcmp.events.AddRemoteCallable('storages/sync/enter_keypad_code_' + this.id, (player, id, code) => 
            {this.enter_code(player, id, code)});
        
        jcmp.events.AddRemoteCallable('storages/sync/remove_upgrade_' + this.id, (player, id, upgrade) => 
            {this.remove_upgrade(player, upgrade, id)});
            
        jcmp.events.AddRemoteCallable('storages/sync/set_name_' + this.id, (player, id, name) => 
            {this.set_name(player, id, name)});

        jcmp.events.AddRemoteCallable('storages/sync/hacking_attempt' + this.id, (player, success, dots_completed, num_misses, current_time, id) => 
            {this.hacking_attempt(player, success, dots_completed, num_misses, current_time, id)});
    }

    /**
     * Called when a player tries to add an item to the storage.
     * @param {*} stack 
     */
    add_stack (stack, player)
    {
        // check if they have it open and if they can access, etc

        if (!stack.prop('name') || !stack.prop('rarity') || !stack.prop('amount') || 
            !stack.prop('category') || !stack.prop('stacklimit'))
        {
            console.error(`What buffoon tried to add a stack without the proper data?! tsk tsk storage`);
            return;
        }

        // See if we can stack it with another item, or if it needs to be split up into multiple stacks
        for (let i = 0; i < this.lootbox.contents.length; i++)
        {
            const this_stack = this.lootbox.contents[i];

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

                    //this.update();
                    //jcmp.events.CallRemote('vinventory/sync/update', player, 
                    //    JSON.stringify({contents: this_stack.to_array()}), i);

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

                        //this.update();
                        //jcmp.events.CallRemote('vinventory/sync/update', player, 
                        //    JSON.stringify({contents: this_stack.to_array()}), i);

                        // Remove item from old stack
                        stack.remove(stack.get_first());

                    }

                }
            }
        }

        let max_slots = this.get_max_slots();

        // Splits up items if they overflow stack limits
        while (stack.get_amount() > 0 && this.lootbox.contents.length < max_slots)
        {
            // Split logic for stacks
            while (stack.get_amount() > stack.prop('stacklimit') && this.lootbox.contents.length < max_slots)
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
                const index = this.lootbox.contents.push(temp_stack) - 1;

                //this.update();
                //jcmp.events.CallRemote('vinventory/sync/add', player, 
                //    JSON.stringify({contents: temp_stack.to_array()}), index);

            }

            const index = this.lootbox.contents.push(stack.duplicate()) - 1;
            
            stack.contents = [];

        
            //this.update();
            //jcmp.events.CallRemote('vinventory/sync/add', player, 
            //    JSON.stringify({contents: this.contents[index].to_array()}), index);

        }

        this.update();
        this.update_menu();

        // If we were not able to put all our items in our inventory
        if (stack.get_amount() > 0)
        {
            const amount_ = stack.get_amount();
            const name_ = stack.prop('name');

            // If we can't fit it all, add the remains back to the player's inventory
            if (player)
            {
                player.c.inventory.add_stack(stack);

                jcmp.notify(player, {
                    title: 'Storage is full!',
                    subtitle: `Cannot add ${amount_} ${name_} to storage.`,
                    preset: 'warn'
                })

                loot.chat.send(player, `<b>Storage full! Cannot add ${amount_} ${name_}.</b>`, new RGBA(255,255,0,255), {timeout: 10});
            }
            else
            {
                return stack;
            }
        }

    }

    
    /**
     * Removes a stack of items from the storage. Syncs to clients immediately.
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
            const stack_data = this.lootbox.contents[id];

            // If there is a mismatch of type of item, don't do anything
            if (stack_data.prop('name') != stack.prop('name') || stack_data.get_amount() < stack.get_amount() || 
                stack_data.prop('rarity') != stack.prop('rarity') 
                || !stack_data)
            {
                console.log(stack);
                console.log(stack_data);
                console.log('Tried to remove stack, but there was an error!');
                jcmp.events.Call('log', 'inventory', `[Storage] Tried to remove_stack, but there was a data mismatch. 
                    steam_id: ${player.c.general.steam_id}`);
                return;
            }

            // If we are removing an entire stack
            if (stack.get_amount() === stack_data.get_amount())
            {

                this.lootbox.contents.splice(id, 1);
                //jcmp.events.CallRemote('vinventory/sync/remove', player, 'Vehicle', id);
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

                            stack_data.remove(stack.contents.splice(i, 1)[0]);

                            if (stack_data.get_amount() == 0)
                            {
                                this.lootbox.contents.splice(id, 1);
                                //jcmp.events.CallRemote('vinventory/sync/remove', player, 'Vehicle', id);
                                //this.update();

                            }
                        }

                        j--;
                    }

                    i--;
                }

                //this.update();
                //jcmp.events.CallRemote('vinventory/sync/update', player, 
                //    JSON.stringify({contents: stack_data.to_array()}), id);

            }
            else // If this is just a stack of one item, like bavarium
            {
                stack_data.remove(stack.contents.splice(0, 1)[0]);

                // If we removed an entire stack
                if (stack_data.get_amount() == 0)
                {
                    this.lootbox.contents.splice(id, 1);
                    //jcmp.events.CallRemote('vinventory/sync/remove', player, 'Vehicle', id);
                    //this.update();
                }
                else
                {
                    //jcmp.events.CallRemote('vinventory/sync/update', player, 
                    //    JSON.stringify({contents: stack_data.to_array()}), id);
                    //this.update();
                }
            }

            this.update();
            this.update_menu();

        }

    }

    
    /**
     * Called when a player clicks an item in the storage to take it.
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
        }, 50);

        if (!this.lootbox.contents[index])
        {
            console.log(`Tried to click item, but item does not exist in storage.`);
            jcmp.events.Call('log', 'inventory', `[Storage] Tried to click_item, but item does not exist in storage.
                steam_id: ${player.c.general.steam_id} index: ${index}`);
            return;
        }

        const stack = this.lootbox.contents[index];
        let client_stack;

        let items = [];

        for (let i = 0; i < s.contents.length; i++)
        {
            items.push(new jcmp.inv.item(s.contents[i]));
        }

        client_stack = new jcmp.inv.stack(items);

        if (!stack.equals(client_stack))
        {
            console.log(`Tried to click item, but client stack did not match! BAD BAD BAD`);
            console.log(client_stack);
            console.log(stack);
            console.log(index);
            jcmp.events.Call('log', 'inventory', `[Storage] Tried to click_item, but stacks did not match. no Strike added. 
                steam_id: ${player.c.general.steam_id}`);
            //jcmp.events.Call('watchlist/AddStrike', player.c.general.steam_id, `Player tried to click_item in storage, 
            //    but client stack did not match server stack.`, player);
            return;
        }

        this.remove_stack(stack.duplicate(), index, player); // Remove stack from storage
        const return_stack = player.c.inventory.add_stack(stack.duplicate()); // Add stack to player

        jcmp.events.Call('log', 'storages', 
            `${player.name} took ${stack.prop('name')} x${stack.get_amount()} from storage ID ${this.id}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);

        // If there was an overflow
        if (return_stack && return_stack.contents && return_stack.contents.length > 0)
        {
            this.add_stack(return_stack, player); // Add back the overflow
            
            jcmp.events.Call('log', 'storages', 
                `${player.name} was not able to take everything from storage ID ${this.id}. Overflow: ${return_stack.prop('name')} x${return_stack.get_amount()} Owner? ${player.c.general.steam_id == this.owner_steam_id}`);

        }

        this.update_menu();

    }


    /**
     * Returns whether a player can open the storage or not, depending on lock type. If they cannot 
     * open it, the storage shows LOCKED for the items inside
     * @param {*} player 
     */
    can_open (player)
    {
        const lock_type = this.get_lock_type();

        if (lock_type == 'Unlocked')
        {
            return true;
        }
        else if (lock_type == 'Keypad Lock')
        {
            return player.unlocked_storage === this.id;
        }
        else if (lock_type == 'Identity Lock')
        {
            return (this.access_level == 'Everyone') ? 
                    true :
                this.access_level == 'Friends' ? 
                    player.is_friends(this.owner_steam_id) || this.owner_steam_id == player.c.general.steam_id : // If only friends, return if friends
                    this.owner_steam_id == player.c.general.steam_id; // Only me, so only owner can access
        }

        console.log(`Strange, no valid lock type found for storage with id ${this.id}`);

        return false;

    }

    /**
     * Updates the menu of the owner of the storage, if they are online.
     */
    update_menu ()
    {
        const owner = jcmp.players.find((p) => p.c && p.c.ready && p.c.general && p.c.general.steam_id === this.owner_steam_id);

        if (!owner || !owner.name) {return;}

        const storage_data = {
            id: this.id,
            name: this.name,
            num_items: this.lootbox.contents.length,
            max_slots: this.get_max_slots(),
            access_level: this.get_lock_type()
        }

        jcmp.events.CallRemote('storage/sync/update_menu', owner, JSON.stringify(storage_data));
    }

    /**
     * Called when a player tries to change the access level of a storage.
     * @param {*} player 
     * @param {*} new_access_level 
     */
    change_access (player, new_access_level)
    {
        if (!this.can_change_access())
        {
            jcmp.notify(player, {
                title: 'Unable to change access level',
                subtitle: 'This type of storage does not support multiple access levels',
                preset: 'warn_red',
                time: 5000
            })
            return;
        }
        else if (player.c.general.steam_id != this.owner_steam_id)
        {
            jcmp.notify(player, {
                title: 'Unable to change access level',
                subtitle: 'You are not the owner of this storage',
                preset: 'warn_red',
                time: 5000
            })
            return;
        }

        if (new_access_level != 'Only Me' && new_access_level != 'Friends' && new_access_level != 'Everyone')
        {
            jcmp.notify(player, {
                title: 'Unable to change access level',
                subtitle: 'Invalid access level specified',
                preset: 'warn_red',
                time: 5000
            })
            return;
        }

        if (new_access_level == this.access_level)
        {
            jcmp.notify(player, {
                title: 'Unable to change access level',
                subtitle: `The access level has already been set to ${this.access_level}`,
                preset: 'warn_red',
                time: 5000
            })
            return;
        }

        this.access_level = new_access_level;

        jcmp.events.CallRemote('storages/sync/update_access', player, this.lootbox.id, this.access_level);
        this.update();
        this.update_menu();

        jcmp.events.Call('log', 'storages', 
            `${player.name} changed access level to ${this.access_level} to storage ID ${this.id}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);

        for (let i = 0; i < this.lootbox.players_opened.length; i++)
        {
            const p = this.lootbox.players_opened[i];

            if (!this.can_open(p))
            {
                this.lootbox.close_for_player(p); // Close it if someone has it open and access type changes
            }
        }
    }

    /**
     * Applies an upgrade to a storage, then updates SQL, players who have it opened, and the menu of the owner.
     * @param {*} upgrade 
     */
    apply_upgrade(upgrade, player)
    {
        this.upgrades.push(upgrade);

        this.update();
        this.update_menu();
        
        this.lootbox.sync_nearby(); // Resync basic data so lock type updates

        for (let i = 0; i < this.lootbox.players_opened.length; i++)
        {
            const p = this.lootbox.players_opened[i];

            if (!this.can_open(p) && p.networkId != player.networkId)
            {
                this.lootbox.close_for_player(p); // Close it if someone has it open and access changes
            }
        }

        this.update_extra_sync();

        jcmp.events.Call('log', 'storages', 
            `${player.name} applied ${upgrade} to storage ID ${this.id}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);
    }

    /**
     * Called when a player tries to remove an upgrade from a storage.
     * @param {*} player 
     * @param {*} upgrade 
     * @param {*} id 
     */
    remove_upgrade (player, upgrade, id)
    {
        if (id != this.id) {return;}
        if (!upgrade || upgrade.length < 3) {return;}

        if (!this.upgrades.includes(upgrade)) {return;}
        if (!this.lootbox.players_opened.find((p) => p.networkId == player.networkId)) {return;}
        if (!this.can_open(player)) {return;}

        if (upgrade == 'Identity Lock' && player.c.general.steam_id != this.owner_steam_id)
        {
            jcmp.notify(player, {
                title: 'Failed to remove upgrade',
                subtitle: 'Only the owner can remove an Identity Lock',
                time: 5000,
                preset: 'warn'
            })
            return;
        }

        for (let i = 0; i < this.upgrades.length; i++)
        {
            if (this.upgrades[i] == upgrade)
            {
                if (upgrade == 'Keypad Lock')
                {
                    this.keypad_code = loot.config.storages.default_code; // Reset code
                }

                this.upgrades.splice(i, 1);

                // Give them back the upgrade
                const item_data = jcmp.inv.FindItem(upgrade);
                item_data.amount = 1;
                const item = new jcmp.inv.item(item_data);
                const overflow = player.c.inventory.add_item(item);

                if (overflow)
                {
                    loot.CreateDropbox({
                        pos: player.position,
                        rot: player.rotation,
                        stack: overflow
                    })
                }

                // More items than we can store in a box
                while (this.lootbox.contents.length > this.get_max_slots())
                {
                    const stack = this.lootbox.contents.splice(0, 1)[0];

                    loot.CreateDropbox({
                        pos: player.position,
                        rot: player.rotation,
                        stack: stack
                    })

                    jcmp.notify(player, {
                        title: 'Storage overflow',
                        subtitle: 'Your storage overflowed and some items dropped out!',
                        time: 5000,
                        preset: 'warn'
                    })
                }

                this.update();
                this.update_menu();

                this.lootbox.sync_nearby(); // Resync basic data so lock type updates

                for (let i = 0; i < this.lootbox.players_opened.length; i++)
                {
                    const p = this.lootbox.players_opened[i];

                    if (!this.can_open(p) && p.networkId != player.networkId)
                    {
                        this.lootbox.close_for_player(p); // Close it if someone has it open and access changes
                    }
                }

                this.update_extra_sync();

                jcmp.events.Call('log', 'storages', `${player.c.general.name} removed ${upgrade} from storage ${this.id}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);

                return;
            }
        }
    }

    /**
     * Called when a player enters a code on the keypad lock on a storage.
     * @param {*} player 
     * @param {*} id 
     * @param {*} code 
     */
    enter_code (player, id, code)
    {
        if (id == undefined || code == undefined) {return;}
        if (id != this.id) {return;}

        if (code.length < 4 || code.length > 5) {return;}
        if (this.get_lock_type() != 'Keypad Lock') {return;}
        
        // Setting a new code
        if (code.startsWith('#') && player.unlocked_storage == this.id)
        {
            if (!this.lootbox.players_opened.find((p) => p.networkId == player.networkId)) {return;}

            code = code.replace('#', '');

            // Code isn't the right length
            if (code.length != 4)
            {
                jcmp.notify(player, {
                    title: 'Failed to set code',
                    subtitle: 'The code must be 4 digits long',
                    time: 5000,
                    preset: 'warn_red'
                })
                return;
            }

            if (code.match(/^[0-9]+$/) == null)
            {
                jcmp.notify(player, {
                    title: 'Failed to set code',
                    subtitle: 'The code must only contain numbers',
                    time: 5000,
                    preset: 'warn_red'
                })
                return;
            }

            this.keypad_code = code; // Set new keypad code
            this.update();

            jcmp.notify(player, {
                title: 'Set keypad code',
                subtitle: `You set the keypad code to: ${this.keypad_code}`,
                time: 5000,
                preset: 'success'
            })

            jcmp.events.Call('sound/Play', player, 'hud_multiplier_up.ogg', 0.2);

            jcmp.events.Call('log', 'storages', 
                `${player.c.general.name} set keypad code on storage ${this.id} to ${this.keypad_code}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);

        }
        else // Trying to get in by entering a code
        {
            if (!this.lootbox.players_opened.find((p) => p.networkId == player.networkId)) {return;}

            if (player.unlocked_storage == this.id) {return;} // Already open

            if (player.keypad_attempts >= loot.config.storages.max_keypad_attempts)
            {
                jcmp.events.Call('sound/Play', player, 'hud_multiplier_down.ogg', 0.2);
                return;
            }

            if (code == this.keypad_code)
            {
                this.unlock(player); // Unlock it for the player
                this.lootbox.open(player, this.lootbox.id); // Open it for the player
                jcmp.events.Call('sound/Play', player, 'hud_multiplier_up.ogg', 0.2);

                jcmp.events.Call('log', 'storages', 
                    `${player.c.general.name} unlocked storage ${this.id} with code ${code}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);
            }
            else
            {
                jcmp.events.Call('log', 'storages', 
                    `${player.c.general.name} tried to unlock storage ${this.id} with code ${code}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);
                player.keypad_attempts += 1;
                jcmp.events.Call('sound/Play', player, 'hud_multiplier_down.ogg', 0.2);
            }
        }

    }

    /**
     * Updates contents of the storage, syncing to players who have it open and updating to DB.
     */
    update ()
    {
        this.lootbox.update('loot/storage/update', JSON.stringify(this.lootbox.to_array()));

        const update_str = loot.storage.convert_stor(this);
        
        const sql = `UPDATE storages SET contents = '${update_str}', access_level = '${this.access_level}', 
            upgrades = '${this.get_upgrade_str()}', name = '${this.name}', code = '${this.keypad_code}' WHERE storage_id = '${this.id}'`;

        loot.pool.query(sql);
    }

    /**
     * Gets a string of all equipped upgrades for SQL
     */
    get_upgrade_str()
    {
        let str = '';

        for (let index in this.upgrades)
        {
            str += this.upgrades[index] + ',';
        }

        return str;
    }

    /**
     * Called when a player removes a storage from the world. Creates a dropbox if there are items left inside.
     * @param {*} player 
     * @param {*} id 
     */
    remove (player, id)
    {
        if (id !== this.id) {return;}
        if (player.unlocked_storage != this.id) {return;}
        if (!this.lootbox.players_opened.find((p) => p.networkId == player.networkId)) {return;}

        let sql = `DELETE FROM storages WHERE storage_id = '${this.id}'`;

        loot.pool.query(sql).then((result) => 
        {
            if (player.c.general.steam_id == this.owner_steam_id)
            {
                jcmp.events.CallRemote('storages/sync/remove_entry', player, this.id);
                player.c.storages = player.c.storages.filter((s) => s.id != this.id);
            }

            jcmp.notify(player, {
                title: 'Dismounted Storage',
                subtitle: 'You successfully dismounted the storage.',
                preset: 'success',
                time: 5000
            })

            jcmp.events.Call('log', 'loot', 
                `${player.c.general.name} removed ${this.type} (${this.id}) with ${this.lootbox.contents.length} items inside. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);
            // If there are still items, make a dropbox on the ground
            if (this.lootbox.contents.length > 0)
            {
                for (let i = 0; i < this.lootbox.contents.length; i++)
                {
                    loot.CreateDropbox({
                        pos: this.lootbox.position,
                        rot: this.lootbox.rotation,
                        stack: this.lootbox.contents[i]
                    })
                }
            }
            
            const item_data = JSON.parse(JSON.stringify(jcmp.inv.FindItem(this.type)));

            if (item_data)
            {
                item_data.amount = 1;

                const item = new jcmp.inv.item(item_data);
                const stack = new jcmp.inv.stack([item]);

                loot.CreateDropbox({
                    pos: this.lootbox.position,
                    rot: this.lootbox.rotation,
                    stack: stack
                })    
            }

            // Drop upgrades
            for (let i = 0; i < this.upgrades.length; i++)
            {
                // Give them back the upgrade
                const item_data_upgrade = jcmp.inv.FindItem(this.upgrades[i]);
                item_data_upgrade.amount = 1;
                const item = new jcmp.inv.item(item_data_upgrade);

                loot.CreateDropbox({
                    pos: this.lootbox.position,
                    rot: this.lootbox.rotation,
                    stack: new jcmp.inv.stack([item])
                })
            }

            loot.storages = loot.storages.filter((s) => s.id != this.id);
            this.lootbox.update('loot/sync/close', this.lootbox.id);
            this.lootbox.remove();
        }) 
    }


    /**
     * Converts a string up upgrades into an array of upgrades.
     * @param {*} data 
     */
    static convert_upgrades(data)
    {
        if (!data || typeof(data) != 'string' || data == 'null')
        {
            if (typeof(data) != 'string')
            {
                console.log('Failed to convert_string because it is not a string.');
            }
            return [];
        }

        const upgrades = [];

        const split = data.split(',');

        for (let index in split)
        {
            const upgrade = split[index];

            if (upgrade && upgrade.length > 3)
            {
                upgrades.push(upgrade);
            }
        }

        return upgrades;
    }
    
    /**
     * Converts a string (from SQL db) and returns an object with data for contents of a storage.
     * 
     * @param {object} data - The string that we want to convert.
     * @returns {object} - An object with data.
     */

    static convert_string(data)
    {
        if (!data || typeof(data) != 'string')
        {
            if (typeof(data) != 'string')
            {
                console.log('Failed to convert_string because it is not a string.');
            }
            return [];
        }

        const split = data.split('|');
        const contents = [];

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

                        item_data = jcmp.inv.FindItem(item_data.name); // Get all item data

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
                    else if (split3[k].startsWith('E') && k > 1) // Equipped
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

                const item = new jcmp.inv.item(item_data); // Create item

                if (!stack) // If this is the first item, create the stack
                {
                    stack = new jcmp.inv.stack([item]);
                }
                else // Otherwise, add it to the front of the stack
                {
                    stack.add(item);
                }

                
            }

            contents.push(stack);
            

        }

        return contents;
    }

    /**
     * Returns the maximum number of slots this storage has, according to upgrades.
     */
    get_max_slots()
    {
        return loot.config.storages.types[this.type] + this.upgrades.filter((u) => u == 'Space Upgrade').length;
    }

    /**
     * Gets whether or not the owner of this storage can change the access type between Only Me, Friends, or Everyone.
     */
    can_change_access()
    {
        return this.upgrades.includes('Identity Lock');
    }

    /**
     * Gets the lock type if the storage is locked, otherwise returns 'Unlocked'
     */
    get_lock_type()
    {
        return this.upgrades.find((u) => u.includes('Lock')) || 'Unlocked';
    }

    /**
     * Returns whether or not a specific player can use an item on a storage. Mainly used to check if someone can use a hacker or 
     * apply an upgrade to a storage. Notifies the player.
     * @param {*} item_name 
     */
    can_use_item(item_name, player)
    {
        if (loot.config.storages.upgrades[item_name]) // If it's an upgrade
        {
            if (this.can_open(player)) // If they can open the storage and thus have access to its upgrades
            {
                const upgrade_amt = this.upgrades.filter((u) => u == item_name).length;

                if (item_name.includes('Lock') && this.get_lock_type() != 'Unlocked')
                {
                    jcmp.notify(player, {
                        title: 'Cannot apply upgrade',
                        subtitle: 'You already have a lock on this storage',
                        time: 5000,
                        preset: 'warn'
                    })
                    return false;
                }

                // Too many upgrades of this type already
                if (upgrade_amt >= loot.config.storages.upgrades[item_name].max)
                {
                    jcmp.notify(player, {
                        title: 'Cannot apply upgrade',
                        subtitle: 'You have too many upgrades of this type already',
                        time: 5000,
                        preset: 'warn'
                    })
                    return false;
                }
                else
                {
                    return true; // They can apply the upgrade
                }
            }
            else
            {
                jcmp.notify(player, {
                    title: 'Cannot apply upgrade',
                    subtitle: 'You must unlock the storage first',
                    time: 5000,
                    preset: 'warn'
                })
                return false;
            }
        } // Otherwise, it's a hacking module or something
        else if (loot.config.storages.hackers[item_name])
        {
            if (this.can_open(player) || player.unlocked_storage == this.id)
            {
                jcmp.notify(player, {
                    title: 'Cannot use item',
                    subtitle: 'The storage is already unlocked!',
                    time: 5000,
                    preset: 'warn'
                })
                return false;
            }
            else
            {
                return true;
            }
        }

        return false; // who knows
    }

    /**
     * Converts a Storage object into a string so it can go into the SQL db. Stacks are 
     * split by |, items are split by ~, and items' properties are split by .
     * 
     * @returns {string}
     */

    static convert_stor(storage)
    {
        let str = '';
        for (let i = 0; i < storage.lootbox.contents.length; i++)
        {
            for (let j = 0; j < storage.lootbox.contents[i].contents.length; j++)
            {
                const item = storage.lootbox.contents[i].contents[j];
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

        return str;
    }

    /**
     * Returns whether or not this storage has at least one Shield Upgrade on it.
     */
    get_shielded()
    {
        return this.upgrades.includes('Shield Upgrade');
    }

    /**
     * Returns whether or not this storage has a trap on it.
     */
    get_trapped()
    {
        return this.upgrades.includes('Explosive Upgrade') || this.upgrades.includes('Zap Upgrade');
    }

    /**
     * Called when a player tries to disarm a storage.
     * @param {*} player 
     */
    disarm (player)
    {
        if (!player.current_box || player.current_box.storage.id != this.id) {return;}
        if (player.unlocked_storage == this.id) {return;} // Already unlocked

        if (this.get_trapped())
        {
            this.upgrades = this.upgrades.filter((u) => !u.includes('Zap') && !u.includes('Explosive'));

            this.update();
            this.update_extra_sync();

            jcmp.notify(player, {
                title: 'Storage Disarmed',
                subtitle: 'You successfully disarmed the storage.',
                time: 5000,
                preset: 'success'
            })

            jcmp.events.Call('log', 'storages', 
                `${player.c.general.name} disarmed storage ${this.id}.`);
        }
        else
        {
            jcmp.notify(player, {
                title: 'Storage Disarmed',
                subtitle: 'You tried to disarm the storage, but no traps were found.',
                time: 5000,
                preset: 'warn'
            })
            
            jcmp.events.Call('log', 'storages', 
                `${player.c.general.name} tried to disarm storage ${this.id}, but there was no trap.`);
        }
    }

    /**
     * Called when a player tries to hack into the storage after playing the minigame.
     * @param {*} player 
     * @param {*} success 
     * @param {*} dots_completed 
     * @param {*} num_misses 
     * @param {*} current_time 
     * @param {*} id 
     */
    hacking_attempt(player, success, dots_completed, num_misses, current_time, id)
    {
        if (player.hacking_storage != this.id) {return;}

        player.hacking_storage = null;

        // TRY TO HACK ME BRUH
        if (!player.current_box || player.current_box.storage.id != this.id) {return;}
        if (player.unlocked_storage == this.id) {return;} // Already unlocked
        if (!success) {return;}
        if (success !== 'yo i got it') {return;} // SUPER CHECK LUL
        if (num_misses < 0 || num_misses > 3) {return;}
        if (current_time < 10000 || current_time > 30000) {return;}
        if (id != this.id) {return;}
        if (dots_completed != 27) {return;}

        if (this.get_shielded())
        {
            this.upgrades.splice(this.upgrades.indexOf('Shield Upgrade'), 1);
            this.update();
            this.update_extra_sync();

            jcmp.notify(player, {
                title: 'Hacking Successful',
                subtitle: 'You hacked through one Shield Upgrade on the storage.',
                time: 5000,
                preset: 'success'
            })

            jcmp.events.Call('log', 'storages', `${player.c.general.name} hacked into storage ${this.id}, but it was shielded.`);

            return;
        }

        
        jcmp.notify(player, {
            title: 'Hacking Successful',
            subtitle: 'You hacked into the storage.',
            time: 5000,
            preset: 'success'
        })

        // Unlock and open
        this.unlock(player, true);
        this.lootbox.open(player, this.lootbox.id);

        jcmp.events.Call('log', 'storages', `${player.c.general.name} hacked into storage ${this.id}.`);
    }

    /**
     * Called when a player unlocks a storage, either using a hacker, identity lock, or correct keypad lock
     * @param {*} player 
     */
    unlock(player, used_hacker)
    {
        if (player.unlocked_storage == this.id) {return;} // Already unlocked

        jcmp.events.Call('log', 'loot', `${player.c.general.name} unlocked storage with id ${this.id}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);

        player.unlocked_storage = this.id;

        if (used_hacker && this.get_trapped())
        {
            // Destroys the storage
            if (this.upgrades.includes('Explosive Upgrade'))
            {
                setTimeout(() => {
                    player.health = 0;
                }, 1500);

                setTimeout(() => {
                    this.lootbox.close_for_player(player);
                }, 100);

                player.unlocked_storage = null;

                jcmp.events.Call('log', 'loot', `${player.c.general.name} exploded when they hacked storage ${this.id}`);

                const owner = jcmp.players.find((p) => p.c && p.c.ready && p.c.general && p.c.general.steam_id === this.owner_steam_id);

                let sql = `DELETE FROM storages WHERE storage_id = '${this.id}'`;

                loot.pool.query(sql).then((result) => 
                {
                    if (owner)
                    {
                        jcmp.events.CallRemote('storages/sync/remove_entry', player, this.id);
                        player.c.storages = player.c.storages.filter((s) => s.id != this.id);
                    }

                    jcmp.events.Call('log', 'loot', 
                        `Storage (${this.id}) with ${this.lootbox.contents.length} items inside exploded.`);

                    loot.storages = loot.storages.filter((s) => s.id != this.id);
                    this.lootbox.update('loot/sync/close', this.lootbox.id);
                    this.lootbox.remove();
                }) 

                console.log('KABOOM');
            }
            else if (this.upgrades.includes('Zap Upgrade')) // Does not destroy the storage
            {
                setTimeout(() => {
                    this.lootbox.close_for_player(player);
                }, 100);

                setTimeout(() => {
                    player.health = 0;
                }, 1500);

                player.unlocked_storage = null;

                jcmp.events.Call('log', 'loot', `${player.c.general.name} got zapped when they hacked storage ${this.id}`);

                console.log('ZAP');
            }
        }
    }

    /**
     * Called when a player tries to set the name of the storage.
     * @param {*} player 
     * @param {*} id 
     * @param {*} name 
     */
    set_name(player, id, name)
    {
        if (id != this.id) {return;}
        if (!name) {return;}
        if (player.unlocked_storage != this.id) {return;}

        name = name.trim();

        if (name.length < 1) {return;}

        for (let i = 0; i < name.length; i++)
        {
            const char = name.charCodeAt(i);

            if ((char < 48 || (char > 59 && char < 65) || (char > 90 && char < 97) || char > 122) && char != 32)
            {
                jcmp.notify(player, {
                    title: 'Failed to set storage name',
                    subtitle: `The name contains invalid characters!`,
                    time: 5000,
                    preset: 'warn_red'
                })
                return;
            }
        }

        // If they want to dismount this storage
        if (name === 'DISMOUNT')
        {
            this.remove(player, id);
            return;
        }

        if (this.name == name)
        {
            jcmp.notify(player, {
                title: 'Failed to set storage name',
                subtitle: `The name is already set to ${this.name}!`,
                time: 5000,
                preset: 'warn_red'
            })
            return;
        }

        if (name.length > loot.config.storages.max_name_length)
        {
            jcmp.notify(player, {
                title: 'Failed to set storage name',
                subtitle: `The name can only contain up to ${loot.config.storages.max_name_length} characters!`,
                time: 5000,
                preset: 'warn_red'
            })
            return;
        }

        this.name = name.trim().substring(0, loot.config.storages.max_name_length);
        this.update();
        this.update_menu();

        this.update_extra_sync();

        jcmp.notify(player, {
            title: 'Set storage name',
            subtitle: `Successfully set the storage name to ${this.name}.`,
            time: 5000,
            preset: 'success'
        })

        jcmp.events.Call('log', 'storages', 
            `${player.name} set name of storage ${this.id} to ${this.name}. Owner? ${player.c.general.steam_id == this.owner_steam_id}`);
    }

    /**
     * Updates extra sync data for those who have the storage open.
     */
    update_extra_sync()
    {
        this.lootbox.update('loot/storage/update_extra_sync', JSON.stringify(this.get_extra_sync_data()));
    }

    /**
     * Gets basic sync data to be sent to the client when the box is first loaded in
     */
    get_basic_sync_data()
    {
        return {
            type: this.type,
            owner_id: this.owner_steam_id,
            id: this.id,
            lock_type: this.get_lock_type()
        }
    }

    /**
     * Extra sync data for players once they actually open a storage.
     */
    get_extra_sync_data()
    {
        return {
            access_level: this.access_level,
            can_change_access: this.can_change_access(),
            max_slots: this.get_max_slots(),
            name: this.name,
            upgrades: this.upgrades,
            lock_type: this.get_lock_type()
        }
    }

}