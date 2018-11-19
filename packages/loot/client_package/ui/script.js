$(document).ready(function() 
{

    let open_key = 69; // E
    let open = false;
    let can_open = 0;
    let renaming = false;

    let demo = false;
    let is_storage = false;
    let storage = {};
    let ammo_types = {};
    let current_contents = [];

    let tooltip_timeout;
    let $tooltip_item;
    let $hovered_item;

    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    const categories = ['Cosmetics', 'Weaponry', 'Survival', 'Utility'];
    
    let id;
    
    $('div.tooltip').fadeOut(1);
    $('div.access-container').hide();
    $('div.keypad-container').hide();
    $('div.upgrade-container').hide();
    $('div.name-container').hide();

    if (!open)
    {
        //$('html').hide();
    }

    $('html').css('visibility', 'visible');

    /**
     * Called by the server when the player opens a lootbox.
     * 
     * @param {object} - The object of the lootbox's contents.
     */

    function InitializeLoot(contents)
    {
        current_contents = contents;

        $('span.section-title').text(GetLootName());

        if (contents.length == 0 || !contents)
        {
            return; // No items in inventory! :(
        }
        else if (contents == 'Locked')
        {
            for (let i = 0; i < 6; i++)
            {
                // Create the item, but don't add it yet. We need to store data on it.
                const $stack = $(`<div class='item locked' id='item_${i}'><i class='fa fa-lock'></i> LOCKED <i class='fa fa-lock'></i></div>`);
                $stack.data('id', i);

                // Add it to the proper section. Prepend to make it appear at top
                $(`div.section.Loot div.item-container`).prepend($stack);
            }

            return;
        }

        for (let i = 0; i < contents.length; i++)
        {
            const stack = contents[i];

            stack.get_amount = function() 
            {
                return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
            }

            if (!stack || !stack.contents[0])
            {
                jcmp.CallEvent('debug', `[WARN] Stack of index ${i} failed to add to loot on initialize [403].`);
                continue;
            }

            // If we are missing a key piece of information, don't add the item.
            if (!stack.contents[0].name || !stack.contents[0].rarity || !stack.contents[0].amount || 
                !stack.contents[0].category || !stack.contents[0].stacklimit)
            {
                jcmp.CallEvent('debug', `[ERROR] Stack of index ${i} and category ${stack.contents[0].category} failed to add 
                    to loot on initialize. [401]`);
                continue;
            }

            const new_stack = AddStackToUI(stack, i);

        }


    }

    function AddStackToUI(stack, id)
    {
        let amount = stack.get_amount();
        
        //const name = (stack.contents[0].custom_data.display_name) ? 
        //   stack.contents[0].custom_data.display_name : stack.contents[0].name;

        const name = stack.contents[0].name;

        // Create the item, but don't add it yet. We need to store data on it.
        const $stack = $(`<div class='item ${stack.contents[0].rarity}' id='item_${id}'>${name}</div>`);
        $stack.data('id', id);

        // Store all the data, including additional data (future compatibility)
        $stack.data('stack', stack);

        // If this item is equipped, create the marker for it
        let equipped = false;
        let equipped_stacked = false;

        // Gotta check to see if an item in the stack is equipped
        for (let i = 0; i < stack.contents.length; i++)
        {
            let item = stack.contents[i];

            if (item.equipped)
            {
                equipped = true;
                equipped_stacked = i != 0; // Make the indicator transparent if the first item is not equipped
            }
        }

        // If the item is equipped
        if (equipped)
        {
            // If the item is equipped as the top item of a stack or inside the stack
            const equip_class = (equipped_stacked) ? 'equipped stacked' : 'equipped';
            $stack.append($(`<div class='${equip_class}'></div>`));
        }

        if (amount > 1 && !$stack.find('.amount').length)
        {
            $stack.prepend($(`<div class='amount'>${amount}</div>`));
        }

        // If this item is durable, display its durability
        if (stack.contents[0].durability && !stack.contents[0].custom_data.hide_dura)
        {
            const durability = Math.ceil(100 * stack.contents[0].durability / stack.contents[0].max_durability);
            $stack.append(
                $(`<div class='durability'><div class='inner' style='width:${durability}%'></div></div>`));
        }

        // If the stack has a special color, such as healing items
        if (stack.contents[0].color)
        {
            $stack.addClass(stack.contents[0].color);
        }

        // Add it to the proper section. Prepend to make it appear at top
        $(`div.section.Loot div.item-container`).prepend($stack);

    }

    $(document).on('mousemove', '.item', function(e)
    {
        if ($(this).hasClass('locked')) {return;}

        $tooltip_item = $(this);
        
        $("div.tooltip").html(GetTooltipText($tooltip_item.data('stack')));
        $('div.tooltip').css(
        {
            'top': e.pageY - 20 - $('div.tooltip').height(),
            'left': e.pageX - 20 - $('div.tooltip').width(),
        });

        $('div.tooltip').show();

    })

    $(document).on('mousemove', 'span.section-title', function(e)
    {
        if ($(this).hasClass('locked')) {return;}
        if (!is_storage || !storage.unlocked) {return;}

        $tooltip_item = $(this);
        
        $("div.tooltip").html(`<i>Click to rename storage.<br><br>Rename to <b>DISMOUNT</b> to dismount storage.</i>`);
        $('div.tooltip').css(
        {
            'top': e.pageY - 20 - $('div.tooltip').height(),
            'left': e.pageX - 20 - $('div.tooltip').width(),
        });

        $('div.tooltip').show();

    })

    $(document).on('mouseleave', '*', function(e)
    {
        $('div.tooltip').hide();
    })


    /**
     * Gets tooltip text in HTML format from item data on hover over.
     * 
     * @param {object} data - Data from the item we are hovering over.
     * @returns {string} - HTML string with formatted data.
     */

    function GetTooltipText(stack)
    {
        const name = (stack.contents[0].custom_data.display_name) ? 
            stack.contents[0].custom_data.display_name : stack.contents[0].name;

        let html = `<span class='title'>${name}</span><hr class='tooltip'>
            <span class='rarity ${stack.contents[0].rarity}'>${stack.contents[0].rarity}</span><br>
            <span class='amount'>Stack Amount: <b>${stack.get_amount()}</b></span><br>
            <span class='stacklimit'>Stack Limit: <b>${stack.contents[0].stacklimit}</b></span>`;
        
        if (stack.contents[0].durability && !stack.contents[0].custom_data.hide_dura)
        {
            const durability = Math.ceil(100 * stack.contents[0].durability / stack.contents[0].max_durability);
            html += `<br><span class='durability'>Durability: <b>${durability}%</b></span>`;
        }

        // If it is currently equipped
        if (stack.contents[0].equipped == true)
        {
            html += `<br><span class='equipped'><i>Equipped</i></span>`;
        }

        if (ammo_types[stack.contents[0].name])
        {
            html += `<br><span class='ammotype'><i>Requires ${ammo_types[stack.contents[0].name].ammo_type}</i></span>`;
        }

        if (stack.contents[0].custom_data.dogtag)
        {
            html += `<br><span class='dogtag'><i><b>${stack.contents[0].custom_data.dogtag}'s Dogtag</b></i></span>`;
        }
        
        if (stack.contents[0].custom_data.drawing_name)
        {
            html += `<br><span class='drawing-name'><i><b>${stack.contents[0].custom_data.drawing_name}</b></i></span>`;
        }
        
        if (stack.contents[0].name == 'Landclaim' && stack.contents[0].custom_data.size)
        {
            html += `<br><span class='landclaim-size'><i><b>Size: ${stack.contents[0].custom_data.size}m</b></i></span>`;
        }
        
        if (stack.contents.length > 1)
        {
            // Add on more to the tooltip depending on how many items are in the stack
            for (let i = 0; i < stack.contents.length - 1; i++)
            {
                const name2 = (stack.contents[i+1].custom_data.display_name) ? 
                    stack.contents[i+1].custom_data.display_name : `${stack.contents[i+1].name} ${i+2}`;
        
                html += `<hr class='tooltip'><span class='title'>${name2}</span>`;

                if (stack.contents[i+1].durability && !stack.contents[i+1].custom_data.hide_dura)
                {
                    const durability = Math.ceil(100 * stack.contents[i+1].durability / stack.contents[i+1].max_durability);
                    html += `<br><span class='durability'>Durability: <b>${durability}%</b></span>`;
                }

                // If this item in the stack is equipped
                if (stack.contents[i+1].equipped == true)
                {
                    html += `<br><span class='equipped'><i>Equipped</i></span>`;
                }

                if (ammo_types[stack.contents[i+1].name])
                {
                    html += `<br><span class='ammotype'><i>Requires ${ammo_types[stack.contents[i+1].name].ammo_type}</i></span>`;
                }

                if (stack.contents[i+1].custom_data.dogtag)
                {
                    html += `<br><span class='dogtag'><i><b>${stack.contents[i+1].custom_data.dogtag}'s Dogtag</b></i></span>`;
                }
        
                if (stack.contents[i+1].custom_data.drawing_name)
                {
                    html += `<br><span class='drawing-name'><i><b>${stack.contents[i+1].custom_data.drawing_name}</b></i></span>`;
                }
        
                if (stack.contents[0].name == 'Landclaim' && stack.contents[i+1].custom_data.size)
                {
                    html += `<br><span class='landclaim-size'><i><b>Size: ${stack.contents[i+1].custom_data.size}m</b></i></span>`;
                }
                
            };
        }

        return html;
    }

    // Hover over item to see tooltip
    $(document).on("mouseenter", ".item,.access-entry,.keypad-number,.keypad-enter", function() 
    {
        jcmp.CallEvent('sound/Play', 'commlink_map_cursor_opressed_region_over_rev.ogg', 0.1);
    })

    // Player clicks on an item to take it
    $(document).on("click", ".item", function() 
    {
        jcmp.CallEvent('sound/Play', 'commlink_map_legend_check_rev.ogg', 0.1);

        const this_stack = $(this).data('stack');
        const category = $(this).parent().parent().attr('class').replace('section ', '');

        // If the data doesn't have what we are looking for
        if (!this_stack.contents[0].name || !this_stack.contents[0].category || !this_stack.contents[0].rarity
            || !this_stack.contents[0].amount || !this_stack.contents[0].stacklimit)
        {
            return;
        }

        jcmp.CallEvent('loot/ui/take_item', JSON.stringify(this_stack), $(this).data('id'), id);

    })

    // Player clicks on an item to use it
    $(document).on("click", ".access-entry", function() 
    {
        if ($(this).hasClass('selected')) {return;}
        jcmp.CallEvent('sound/Play', 'commlink_map_legend_check_rev.ogg', 0.1);

        const access = $(this).text();

        if (access.trim().length > 3)
        {
            jcmp.CallEvent('storages/ui/change_access', storage.id, access.trim());
        }
    })

    // Player clicks on the check to take all
    $(document).on("click", "div.button.close", function() 
    {
        jcmp.CallEvent('sound/Play', 'commlink_map_legend_check_rev.ogg', 0.1);

        // todo consolidate this into 1 function
        open = false;
        jcmp.HideCursor();
        jcmp.CallEvent('loot/ui/close');
        $('div.tooltip').fadeOut(1);
        $('.item-container').empty();
    })

    
    // Player clicks on keypad button
    $(document).on("click", "div.keypad-number", function() 
    {
        if (typeof jcmp != 'undefined')
        {
            jcmp.CallEvent('sound/Play', 'commlink_map_legend_check_rev.ogg', 0.1);
        }
        
        let input = $('div.keypad-input').text();

        // Clicks backspace
        if ($(this).hasClass('backspace'))
        {
            $('div.keypad-input').text(input.length > 0 ? 
                input.substring(0, input.length - 1) : '');
            return;
        }

        if ((input.length < 5 && input.substring(0, 1) == '#') || input.length < 4)
        {
            $('div.keypad-input').text(input + $(this).text());
        }
    })

    
    // Player clicks on keypad button
    $(document).on("click", "div.keypad-enter", function() 
    {
        if (typeof jcmp != 'undefined')
        {
            jcmp.CallEvent('sound/Play', 'commlink_map_legend_check_rev.ogg', 0.1);
        }
        
        const input = $('div.keypad-input').text().trim();
        $('div.keypad-input').text('');

        if (input.length >= 4 && input.length < 6)
        {
            jcmp.CallEvent('storages/ui/enter_keypad_code', storage.id, input);
        }
    })

    // Player clicks on an upgrade X to remove it
    $(document).on("click", "div.upgrade-entry i.fa", function() 
    {
        if (typeof jcmp != 'undefined')
        {
            jcmp.CallEvent('sound/Play', 'commlink_map_legend_check_rev.ogg', 0.1);
        }
        
        const input = $(this).parent().text().trim();

        if (input.length > 0)
        {
            jcmp.CallEvent('storages/ui/remove_upgrade', storage.id, input);
        }
    })

    
    // Player clicks on the storage title to rename it
    $(document).on("click", "span.section-title", function() 
    {
        if (!is_storage || !storage.unlocked) {return;}
        if ($(this).hasClass('locked')) {return;}

        renaming = true;
        jcmp.CallEvent('loot/toggle_menus', false);

        $('#name_input').val(storage.name);
        $('div.name-container').show();
    })

    
    // Player clicks on the confirm button to rename storage
    $(document).on("click", "button.name-submit", function() 
    {
        const name = $('#name_input').val().trim().substring(0, 20);

        if (name.length > 0 && storage.unlocked)
        {
            jcmp.CallEvent('storages/ui/set_name', storage.id, name);
        }

        jcmp.CallEvent('loot/toggle_menus', true);

        renaming = false;
        $('div.name-container').hide();
    })

    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key && open && !renaming && can_open == 0)
        {
            // redo this logic to fit with actual lootboxes
            open = false;
            jcmp.HideCursor();
            jcmp.CallEvent('loot/ui/close');
            $('div.tooltip').fadeOut(1);
            $('.item-container').empty();
        }
        else if (keycode == open_key && !open && can_open == 0)
        {
            jcmp.CallEvent('loot/ui/try_open');
        }

    };

    jcmp.AddEvent('loot/ui/close', () => 
    {
        if (!open) {return;}
        
        open = false;
        jcmp.HideCursor();
        $('div.tooltip').fadeOut(1);
        $('.item-container').empty();
        $('div.name-container').hide();

        if (renaming)
        {
            renaming = false;
            jcmp.CallEvent('loot/toggle_menus', true);
        }
    })

    jcmp.AddEvent('loot/ui/init_ammo_types', (data) => 
    {
        ammo_types = JSON.parse(data);
    })

    jcmp.AddEvent('storage/ui/update_access', (access) => 
    {
        storage.access_level = access;

        UpdateAccess();
    })

    function UpdateAccess()
    {
        $('div.access-entry').removeClass('selected');
        if (storage.access_level == 'Everyone')
        {
            $('span.circle.everyone').parent().addClass('selected');
        }
        else if (storage.access_level == 'Friends')
        {
            $('span.circle.friends').parent().addClass('selected');
        }
        else if (storage.access_level == 'Only Me')
        {
            $('span.circle.onlyme').parent().addClass('selected');
        }
    }

    /**
     * Updates the upgrades in the upgrade field.
     * @param {*} data 
     */
    function UpdateUpgrades(data)
    {
        if (!data) {return;}

        $('div.upgrade-entry-container').empty();
        for (let i = 0; i < data.length; i++)
        {
            $('div.upgrade-entry-container').append(`<div class='upgrade-entry'>${data[i]}<i class='fa fa-close'></i></div>`);
        }
    }

    function GetLootName()
    {
        return demo ? 'Example Loot' : is_storage ? !storage.unlocked ? 
            `Locked Storage (?/?)` : `${storage.name} (${current_contents.length}/${storage.max_slots})` : 'Loot';
    }

    // Extra sync info, called when a player modifies the upgrades on a storage
    jcmp.AddEvent('storages/ui/update_extra_sync', (data) => 
    {
        data = JSON.parse(data);

        // Copy over new storage data
        for (var attrname in data) { storage[attrname] = data[attrname]; }

        UpdateUpgrades(data.upgrades);
        $('span.section-title').text(GetLootName());

        // If it has a keypad lock, show it
        if (data.lock_type == 'Keypad Lock')
        {
            $('div.keypad-container').show();
        }
        else if (data.lock_type == 'Identity Lock') // If it has an identity lock and this is the owner, show it
        {
            if (data.can_change_access) //&& storage.is_mine)
            {
                UpdateAccess();
                $('div.access-container').show();
            }
        }
        else if (data.lock_type == 'Unlocked')
        {
            $('div.access-container').hide();
            $('div.keypad-container').hide();
        }

    })
    
    // When a player tries to open a lootbox and the contents are sent by server
    jcmp.AddEvent('loot/ui/init', (data) => 
    {
        data = JSON.parse(data);

        demo = data.demo;
        storage = data.storage;
        is_storage = data.is_storage;

        $('div.access-container').hide();
        $('div.keypad-container').hide();
        $('div.upgrade-container').hide();
        $('div.name-container').hide();

        // If it has a keypad lock, show it
        if (storage.lock_type == 'Keypad Lock')
        {
            $('div.keypad-container').show();
        }
        else if (storage.lock_type == 'Identity Lock' && storage.unlocked && is_storage) // If it has an identity lock and this is the owner, show it
        {
            if (storage.can_change_access) //&& storage.is_mine)
            {
                UpdateAccess();
                $('div.access-container').show();
            }
        }

        // If the storage has been unlocked by the player, show the upgrades
        if (storage.unlocked && is_storage)
        {
            $('div.upgrade-container').show();

            UpdateUpgrades(storage.upgrades);
        }

        $('div.tooltip').fadeOut(1);
        $('.item-container').empty();
        InitializeLoot(data.contents);

        $('div.keypad-input').text('');

        if (open) {return;}

        jcmp.CallEvent('loot/ui/ready'); // Call this event to show the ui after the loot has loaded
        jcmp.ShowCursor();
        open = true;

        
        const audio = new Audio(is_storage ? 'storage.ogg' : 'loot.ogg');
        audio.volume = 0.8;
        audio.play();

        setTimeout(() => {
            audio.remove();
        }, audio.duration * 1000);


        id = data.id;
    })

    jcmp.AddEvent('loot/storage/ui/update', (data) => 
    {
        $('div.tooltip').fadeOut(1);
        $('.item-container').empty();
        InitializeLoot(JSON.parse(data));
    })

    jcmp.AddEvent('loot/ui/update', (stack, index, _id) => 
    {
        if (_id !== id) {return;}

        stack = {contents: JSON.parse(stack)};

        stack.get_amount = function() 
        {
            return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
        }

        const $item = $(`div.section.Loot #item_${index}`);

        if ($item && $item.length)
        {
            $item.data('stack', stack);

            $item.find('.equipped').remove();
            $item.find('.amount').remove();
            $item.find('.durability').remove();
            
            // No equipped logic because items in lootboxes will never be equipped

            let amount = stack.get_amount();

            if (amount > 1)
            {
                $item.prepend($(`<div class='amount'>${amount}</div>`));
            }

            // If this item is durable, display its durability
            if (stack.contents[0].durability)
            {
                const durability = Math.ceil(100 * stack.contents[0].durability / stack.contents[0].max_durability);
                $item.append(
                    $(`<div class='durability'><div class='inner' style='width:${durability}%'></div></div>`));
            }

        }
        else
        {
            console.log('nothing found! :(');
        }
    })

    // We shouldn't ever need to add a stack to loot - only take remove/update
    /*jcmp.AddEvent('loot/ui/add', (stack, id) => 
    {
        stack = JSON.parse(stack);

        stack.get_amount = function() 
        {
            return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
        }

        AddStackToUI(stack, id);
    })*/

    jcmp.AddEvent('loot/ui/remove', (index, _id) => 
    {
        if (_id !== id) {return;}

        $(`div.section.Loot #item_${index}`).remove();
        
        const length = $(`div.section.Loot .item`).length;

        for (let i = 0; i < length; i++)
        {
            $(`div.section.Loot .item`).eq(length - i - 1).attr('id', `item_${i}`);
            $(`div.section.Loot .item`).eq(length - i - 1).data('id', i);
        }
    })

    jcmp.AddEvent('loot/ToggleEnabled', (enabled) => 
    {
        can_open = (enabled) ? can_open - 1 : can_open + 1;
    })

    jcmp.CallEvent('loot/ui/first_init');

})
