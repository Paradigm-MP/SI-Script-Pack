$(document).ready(function() 
{
    let slots = 
    {
        Cosmetics: 5,
        Weaponry: 6,
        Survival: 6,
        Utility: 5
    }

    let vehicle_slots = 5;

    for (let category in slots)
    {
        UpdateSlotUI(category);
    }
    
    let open_key = 71; // G
    let open = false;
    let can_open = true;

    let can_drag = true;
    let ammo_types = {};

    let tooltip_timeout;
    let $tooltip_item;
    let $hovered_item;
    let shift_down = false;
    let ctrl_down = false;

    let append_id = 0;

    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    const categories = ['Cosmetics', 'Weaponry', 'Survival', 'Utility'];
    
    
    $('div.tooltip').fadeOut(1);
    $('div.vehicle-container').fadeOut(1);
    $('div.desync-container').hide();

    if (!open)
    {
        $('div.main-container').hide();
    }

    $('html').css('visibility', 'visible');

    /**
     * Called by the server when the player first logs in. This takes the data directly from SQL and
     * puts it into the UI. Stack logic does not apply here. 
     * Stacks that should combine into each other (like 20 bav and 50 bav) are not combined, because the 
     * player purposefully separated them.
     * 
     * @param {object} - The object of the inventory of the player. Should follow a specific format.
     */

    function InitializeInventory(contents, slots)
    {
        $('div.item-container').empty();

        if (contents.length == 0 || !contents)
        {
            return; // No items in inventory! :(
        }

        for (const category in contents)
        {
            for (let i = 0; i < contents[category].length; i++)
            {
                const stack = contents[category][i];

                stack.get_amount = function() 
                {
                    return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
                }

                if (!stack || !stack.contents[0])
                {
                    jcmp.CallEvent('debug', `[WARN] Stack of index ${i} failed to add to inventory on initialize [403].`);
                    continue;
                }

                // If we are missing a key piece of information, don't add the item.
                if (!stack.contents[0].name || !stack.contents[0].rarity || !stack.contents[0].amount || 
                    !stack.contents[0].category || !stack.contents[0].stacklimit)
                {
                    jcmp.CallEvent('debug', `[ERROR] Stack of index ${i} and category ${category} failed to add 
                        to inventory on initialize. [401]`);
                    continue;
                }

                const new_stack = AddStackToUI(stack, i);

            }

        }


    }


    /**
     * Called by the server when the player enters a vehicle.
     * 
     * @param {object} - The object of the inventory of the vehicle. Should follow a specific format.
     */

    function InitializeInventoryV(contents, slots)
    {
        $('div.section.Vehicle>div.item-container').empty();
        UpdateSlotUI('Vehicle');

        if (contents.length == 0 || !contents)
        {
            return; // No items in inventory! :(
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
                jcmp.CallEvent('debug', `[WARN] Stack of index ${i} failed to add to inventory on initialize [403].`);
                continue;
            }

            // If we are missing a key piece of information, don't add the item.
            if (!stack.contents[0].name || !stack.contents[0].rarity || !stack.contents[0].amount || 
                !stack.contents[0].category || !stack.contents[0].stacklimit)
            {
                jcmp.CallEvent('debug', `[ERROR] Stack of index ${i} and category ${category} failed to add 
                    to inventory on initialize. [401]`);
                continue;
            }

            const new_stack = AddStackToUI(stack, i, 'Vehicle');

        }


    }


    function AddStackToUI(stack, id, category)
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

        const cat = (category) ? category : stack.contents[0].category;

        // Add it to the proper section. Prepend to make it appear at top
        $(`div.section.${cat} div.item-container`).prepend($stack);

        UpdateSlotUI(cat);
    }


    /**
     * Updates slot UI (both used slots and available slots) for a specified category.
     * 
     * @param {string} category - The category that we want to update the slots on.
     */

    function UpdateSlotUI(category)
    {
        const used = $(`div.section.${category} div.item-container .item`).length;
        const available = (slots[category]) ? slots[category] : vehicle_slots;

        // Update slot text
        $(`div.section.${category} .slots`).text(`${used}/${available}`);
        $(`div.section.${category} .slots`).data('tooltip', 
        {
            used: used,
            available: available
        })

    }

    $(document).on('mousemove', '.item', function(e)
    {
        $tooltip_item = $(this);
        $hovered_item = $(this);
        
        $("div.tooltip").html(GetTooltipText($tooltip_item.data('stack')));
        $('div.tooltip').css(
        {
            'top': e.pageY - 20 - $('div.tooltip').height(),
            'left': e.pageX - 20 - $('div.tooltip').width(),
        });

        $('div.tooltip').show();

    })

    // Hover over item to see tooltip
    $(document).on("mouseenter", ".item", function() 
    {
        jcmp.CallEvent('sound/Play', 'commlink_map_cursor_opressed_region_over_rev.ogg', 0.1);
    })

    
    $(document).on('mouseleave', '*', function(e)
    {
        $('div.tooltip').hide();
    })

    // Click lock to toggle dragging
    $(document).on("click", ".toggle-lock", function() 
    {
        //$("div.tooltip").fadeOut('fast');
        const main_category = $(this).parent().parent().attr('class').replace('section ', '');

        // Don't do anything if we can drag stuff around
        if ($(this).parent().parent().find('.item').hasClass('dropping') 
            || $(this).parent().parent().find('.item').hasClass('dropping-chat') || !can_drag)
        {
            return;
        }


        if ($(this).hasClass('fa-lock'))
        {
            $(this).removeClass('fa-lock');
            $(this).addClass('fa-unlock');
            $(this).parent().parent().find('.item-container').sortable(
            {
                cursor: 'move',
                scroll: false,
                zIndex: 9999,
                axis: 'y',
                containment: 'parent',
                tolerance: 'pointer',
                start: function(event, ui) 
                {
                    const start_pos = ui.item.index();
                    ui.item.data('start_pos', start_pos);
                },
                stop: function(event, ui)
                {
                    const category = ui.item.data('stack').contents[0].category;
                    let total = $(`div.section.${category} div.item-container div.item`).length - 1;

                    if (main_category == 'Vehicle') {total -= 1;} // ???

                    let start_pos = total - ui.item.data('start_pos');
                    let index = total - ui.item.index();

                    if (index == start_pos)
                    {
                        return;
                    }

                    if (main_category == 'Vehicle')
                    {
                        jcmp.CallEvent('vinventory/ui/change_index', 'Vehicle', start_pos, index, JSON.stringify(ui.item.data('stack')));
                    }
                    else
                    {
                        jcmp.CallEvent('inventory/ui/change_index', category, start_pos, index, JSON.stringify(ui.item.data('stack')));
                    }

                },
                disabled: false
            });
            $(this).parent().parent().find('.item-container').disableSelection();
        }
        else
        {
            $(this).removeClass('fa-unlock');
            $(this).addClass('fa-lock');
            $(this).parent().parent().find('.item-container').sortable("disable");
        }


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

    // Player clicks on an item to use it
    $(document).on("click", ".item", function() 
    {
        jcmp.CallEvent('sound/Play', 'commlink_map_legend_check_rev.ogg', 0.1);

        const this_stack = $(this).data('stack');
        const category = $(this).parent().parent().attr('class').replace('section ', '');

        // If item is in wrong category, eg hack
        if (!this_stack || ! category || !this_stack.contents || 
            (category != this_stack.contents[0].category && category != 'Vehicle'))
        {
            return;
        }

        // If the data doesn't have what we are looking for
        if (!this_stack.contents[0].name || !this_stack.contents[0].category || !this_stack.contents[0].rarity
            || !this_stack.contents[0].amount || !this_stack.contents[0].stacklimit)
        {
            return;
        }

        // Cannot use items while dragging is enabled
        if ($(this).parent().hasClass('ui-sortable') && !$(this).parent().hasClass('ui-sortable-disabled'))
        {
            return;
        }

        // If we have right clicked it and are trying to drop it
        if ($(this).hasClass('dropping'))
        {
            const total_amount = $(this).data('stack').get_amount();
            let amount = $(this).data('dropping');
            amount += 1;
            if (amount > total_amount)
            {
                amount = 1;
            }
            $(this).data('dropping', amount);
            $(this).find('.amount').text(`${amount}/${total_amount}`);

            return;
        }
        else if ($(this).hasClass('dropping-chat'))
        {
            const total_amount = $(this).data('stack').get_amount();
            let amount = $(this).data('dropping-chat');
            amount += 1;
            if (amount > total_amount)
            {
                amount = 1;
            }
            $(this).data('dropping-chat', amount);
            $(this).find('.amount').text(`${amount}/${total_amount}`);

            return;
        }

        // If they are holding shift, then shift the stack
        if (shift_down)
        {
            if (this_stack.contents.length > 1)
            {
                if (category == 'Vehicle')
                {
                    jcmp.CallEvent('vinventory/ui/shift_item', JSON.stringify(this_stack), $(this).data('id'));
                }
                else
                {
                    jcmp.CallEvent('inventory/ui/shift_item', JSON.stringify(this_stack), $(this).data('id'));
                }
                
            }
            return;
        }

        if (category == 'Vehicle')
        {
            jcmp.CallEvent('vinventory/ui/click_item', JSON.stringify(this_stack), $(this).data('id'));
        }
        else
        {
            jcmp.CallEvent('inventory/ui/click_item', JSON.stringify(this_stack), $(this).data('id'));
        }

    })

    // Scroll items to adjust drop amount
    $(document).on("DOMMouseScroll mousewheel wheel", '.item', function(event) 
    {
        let e = window.event || event;
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        const category = $(this).parent().parent().attr('class').replace('section ', '');

        // If they are holding shift, then shift the stack
        if (shift_down && $hovered_item)
        {
            jcmp.CallEvent('sound/Play', 'commlink_leaderboards_filter_enter_rev.ogg', '0.1');
            const this_stack = $hovered_item.data('stack');
            if (this_stack.contents.length > 1)
            {
                if (category == 'Vehicle')
                {
                    jcmp.CallEvent('vinventory/ui/shift_item', JSON.stringify(this_stack), $(this).data('id'));
                }
                else
                {
                    jcmp.CallEvent('inventory/ui/shift_item', JSON.stringify(this_stack), $(this).data('id'));
                }
            }
            return;
        }

        // If we aren't dropping it, don't do anything
        if (!$hovered_item || !($hovered_item.hasClass('dropping') || $hovered_item.data('dropping')
            || $hovered_item.hasClass('dropping-chat') || $hovered_item.data('dropping-chat')))
        {
            return;
        }

        jcmp.CallEvent('sound/Play', 'commlink_leaderboards_filter_enter_rev.ogg', '0.1');

        const total_amount = $hovered_item.data('stack').get_amount();

        // Scroll up
        if (delta > 0) 
        {
            if ($hovered_item.data('dropping') && $hovered_item.hasClass('dropping'))
            {
                let amount = $hovered_item.data('dropping');
                amount += 1;
                if (amount > total_amount)
                {
                    amount = 1;
                }
                $hovered_item.data('dropping', amount);
                $hovered_item.find('.amount').text(`${amount}/${total_amount}`);
            }
            else if ($hovered_item.data('dropping-chat') && $hovered_item.hasClass('dropping-chat'))
            {
                let amount = $hovered_item.data('dropping-chat');
                amount += 1;
                if (amount > total_amount)
                {
                    amount = 1;
                }
                $hovered_item.data('dropping-chat', amount);
                $hovered_item.find('.amount').text(`${amount}/${total_amount}`);
            }
        }
        else // Scroll down
        {
            if ($hovered_item.data('dropping') && $hovered_item.hasClass('dropping'))
            {
                let amount = $hovered_item.data('dropping');
                amount -= 1;
                if (amount < 1)
                {
                    amount = total_amount;
                }
                $hovered_item.data('dropping', amount);
                $hovered_item.find('.amount').text(`${amount}/${total_amount}`);
            }
            else if ($hovered_item.data('dropping-chat') && $hovered_item.hasClass('dropping-chat'))
            {
                let amount = $hovered_item.data('dropping-chat');
                amount -= 1;
                if (amount < 1)
                {
                    amount = total_amount;
                }
                $hovered_item.data('dropping-chat', amount);
                $hovered_item.find('.amount').text(`${amount}/${total_amount}`);
            }
        }
    })

    // Player right clicks on an item to start dropping it
    $(document).on("contextmenu", ".item", function() 
    {
        const category = $(this).parent().parent().attr('class').replace('section ', '');

        if (category == 'Vehicle') {return false;}

        // Don't do anything if we can drag stuff around
        if ($(this).parent().hasClass('ui-sortable') && !$(this).parent().hasClass('ui-sortable-disabled'))
        {
            return false;
        }

        jcmp.CallEvent('sound/Play', 'commlink_map_location_jump_rev.ogg', 0.1);

        if (ctrl_down && !$(this).hasClass('dropping') && !$(this).hasClass('dropping-chat'))
        {
            $(this).addClass('dropping-chat');
            $(this).data('dropping-chat', $(this).data('stack').get_amount());
        }
        else if ($(this).hasClass('dropping-chat'))
        {
            if (ctrl_down)
            {
                let stack = JSON.parse(JSON.stringify($(this).data('stack')));

                // If we are dropping specific items out of a stack
                if (stack.contents[0].durability && $(this).data('dropping-chat') < $(this).data('stack').get_amount())
                {
                    stack.contents.splice($(this).data('dropping-chat'), 
                        $(this).data('stack').get_amount() - $(this).data('dropping-chat'));
                }
                else if (!stack.contents[0].durability && $(this).data('dropping-chat') < $(this).data('stack').get_amount())
                {
                    stack.contents[0].amount = $(this).data('dropping-chat');
                }

                jcmp.CallEvent('inventory/ui/drop_item_chat', 
                    JSON.stringify(stack), $(this).data('id'),
                    $(this).data('dropping-chat'));
            }

            $(this).removeClass('dropping-chat');
            $(this).removeData('dropping-chat');
            $(this).find('.amount').text($(this).data('stack').get_amount());
        }
        else
        {
            if (!$(this).hasClass('dropping'))
            {
                $(this).addClass('dropping');
                $(this).data('dropping', $(this).data('stack').get_amount());
            }
            else
            {
                $(this).removeClass('dropping');
                $(this).removeData('dropping');
                $(this).find('.amount').text($(this).data('stack').get_amount());
            }
        }

        return false; // Disables context menu
    })

    document.onkeydown = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == 16) // shift
        {
            shift_down = true;
        }
        else
        {
            shift_down = false;
        }

        if (keycode == 17)
        {
            ctrl_down = true;
        }
        else
        {
            ctrl_down = false;
        }
    };


    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key && can_open)
        {
            ToggleOpen();
        }
        shift_down = false;

    };
    
    function ToggleOpen()
    {
        open = !open;
        if (open) 
        {
            $('div.main-container').show(1);
            jcmp.ShowCursor(); 
        } 
        else 
        {
            $('div.main-container').hide(1);
            jcmp.HideCursor();

            for (let category in categories)
            {
                $(`.item`).each(function()
                {
                    if ($(this).data('dropping') && $(this).hasClass('dropping'))
                    {
                        let stack = $(this).data('stack');

                        // If we are dropping specific items out of a stack
                        if ((stack.contents[0].durability || stack.contents[0].can_equip) && $(this).data('dropping') < stack.get_amount())
                        {
                            stack.contents.splice($(this).data('dropping'), stack.get_amount() - $(this).data('dropping'));
                        }

                        jcmp.CallEvent('inventory/ui/drop_item', 
                            JSON.stringify(stack), $(this).data('id'),
                            $(this).data('dropping'));

                        $(this).removeClass('dropping');
                        $(this).removeData('dropping');
                        $(this).find('.amount').text($(this).data('stack').get_amount());
                    }
                    else if ($(this).data('dropping-chat') && $(this).hasClass('dropping-chat'))
                    {
                        $(this).find('.amount').text($(this).data('stack').get_amount());
                        $(this).removeClass('dropping-chat');
                        $(this).removeData('dropping-chat');
                    }
                })
            }
        }
        jcmp.CallEvent('inventory/ToggleOpen', open);
    }

    jcmp.AddEvent('inventory/ToggleOpenOutside', () => 
    {
        ToggleOpen();
    })

    jcmp.AddEvent('inventory/Enable', () => 
    {
        can_open = true;
    })

    jcmp.AddEvent('inventory/ToggleEnabled', (enabled) => 
    {
        can_open = enabled;
    })

    jcmp.AddEvent('inventory/ui/init_ammo_types', (data) => 
    {
        ammo_types = JSON.parse(data);
    })

    jcmp.AddEvent('inventory/ui/init', (contents, s) => 
    {
        slots = JSON.parse(s);
        
        for (let category in slots)
        {
            UpdateSlotUI(category);
        }

        InitializeInventory(JSON.parse(contents));
    })

    jcmp.AddEvent('inventory/ui/update_slots', (s) => 
    {
        slots = JSON.parse(s);

        for (let category in slots)
        {
            UpdateSlotUI(category);
        }

    })

    // **************************** PLAYER INVENTORY EVENTS

    jcmp.AddEvent('inventory/ui/update', (stack, id) => 
    {
        stack = JSON.parse(stack);

        stack.get_amount = function() 
        {
            return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
        }

        const $item = $(`div.section.${stack.contents[0].category} #item_${id}`);

        if ($item && $item.length)
        {
            $item.data('stack', stack);

            $item.find('.equipped').remove();
            $item.find('.amount').remove();
            //$item.find('.durability').remove();
            
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
                $item.append($(`<div class='${equip_class}'></div>`));
            }

            let amount = stack.get_amount();

            if (amount > 1)
            {
                $item.prepend($(`<div class='amount'>${amount}</div>`));
            }

            // If this item is durable, display its durability
            if (stack.contents[0].durability && !stack.contents[0].custom_data.hide_dura)
            {
                const durability = Math.ceil(100 * stack.contents[0].durability / stack.contents[0].max_durability);
                if ($item.find('div.durability'))
                {
                    $item.find('div.durability').find('div.inner').css('width', `${durability}%`);
                }
                else
                {
                    const durability = Math.ceil(100 * stack.contents[0].durability / stack.contents[0].max_durability);
                    $item.append(
                        $(`<div class='durability'><div class='inner' style='width:${durability}%'></div></div>`));
                }

            }

        }
        else
        {
            console.log('nothing found! :(');
        }

        if ($tooltip_item)
        {
            $("div.tooltip").html(GetTooltipText($tooltip_item.data('stack')));
        }
        
    })

    jcmp.AddEvent('inventory/ui/add', (stack, id) => 
    {
        stack = JSON.parse(stack);

        stack.get_amount = function() 
        {
            return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
        }

        AddStackToUI(stack, id);
    })

    jcmp.AddEvent('inventory/ui/remove', (category, id) => 
    {
        $(`div.section.${category} #item_${id}`).remove();
        UpdateSlotUI(category);
        
        const length = $(`div.section.${category} .slots`).data('tooltip').used;

        for (let i = 0; i < length; i++)
        {
            $(`div.section.${category} .item`).eq(length - i - 1).attr('id', `item_${i}`);
            $(`div.section.${category} .item`).eq(length - i - 1).data('id', i);
        }
    })

    jcmp.AddEvent('inventory/ui/change_id', (category, old_id, new_id) => 
    {

        const length = $(`div.section.${category} .slots`).data('tooltip').used;

        if (old_id < new_id) // 1 -> 5
        {
            for (let i = new_id; i >= old_id; i--)
            {
                $(`div.section.${category} .item`).eq(length - i - 1).attr('id', `item_${i}`);
                $(`div.section.${category} .item`).eq(length - i - 1).data('id', i);
            }
        }
        else // 5 -> 1
        {
            for (let i = old_id; i >= new_id; i--)
            {
                $(`div.section.${category} .item`).eq(length - i - 1).attr('id', `item_${i}`);
                $(`div.section.${category} .item`).eq(length - i - 1).data('id', i);
            }
        }
    })

    // ********************************** PLAYER INVENTORY EVENTS 


    // ********************************** VEHICLE INVENTORY EVENTS

    // Called when a player enters a vehicle
    jcmp.AddEvent('vinventory/ui/init', (contents, s) => 
    {
        vehicle_slots = s;
        
        UpdateSlotUI('Vehicle');

        InitializeInventoryV(JSON.parse(contents));
    })

    
    jcmp.AddEvent('vinventory/ui/update', (stack, id) => 
    {
        stack = JSON.parse(stack);

        stack.get_amount = function() 
        {
            return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
        }

        const $item = $(`div.section.Vehicle #item_${id}`);

        if ($item && $item.length)
        {
            $item.data('stack', stack);

            $item.find('.equipped').remove();
            $item.find('.amount').remove();
            $item.find('.durability').remove();
            
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
                $item.append($(`<div class='${equip_class}'></div>`));
            }

            let amount = stack.get_amount();

            if (amount > 1)
            {
                $item.prepend($(`<div class='amount'>${amount}</div>`));
            }

            // If this item is durable, display its durability
            if (stack.contents[0].durability && !stack.contents[0].custom_data.hide_dura)
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
        
        if ($tooltip_item)
        {
            $("div.tooltip").html(GetTooltipText($tooltip_item.data('stack')));
        }
        
    })

    jcmp.AddEvent('vinventory/ui/add', (stack, id) => 
    {
        stack = JSON.parse(stack);

        stack.get_amount = function() 
        {
            return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
        }

        AddStackToUI(stack, id, 'Vehicle');
    })

    jcmp.AddEvent('vinventory/ui/remove', (category, id) => 
    {
        //$("div.tooltip").fadeOut('fast');

        if (tooltip_timeout)
        {
            clearTimeout(tooltip_timeout);
            tooltip_timeout = null;
        }
        
        $(`div.section.Vehicle #item_${id}`).remove();
        UpdateSlotUI(category);
        
        const length = $(`div.section.Vehicle .slots`).data('tooltip').used;

        for (let i = 0; i < length; i++)
        {
            $(`div.section.Vehicle .item`).eq(length - i - 1).attr('id', `item_${i}`);
            $(`div.section.Vehicle .item`).eq(length - i - 1).data('id', i);
        }
    })

    jcmp.AddEvent('vinventory/ui/change_id', (category, old_id, new_id) => 
    {

        const length = $(`div.section.Vehicle .slots`).data('tooltip').used;

        if (old_id < new_id) // 1 -> 5
        {
            for (let i = new_id; i >= old_id; i--)
            {
                $(`div.section.Vehicle .item`).eq(length - i - 1).attr('id', `item_${i}`);
                $(`div.section.Vehicle .item`).eq(length - i - 1).data('id', i);
            }
        }
        else // 5 -> 1
        {
            for (let i = old_id; i >= new_id; i--)
            {
                $(`div.section.Vehicle .item`).eq(length - i - 1).attr('id', `item_${i}`);
                $(`div.section.Vehicle .item`).eq(length - i - 1).data('id', i);
            }
        }
    })


    // ***************************** VEHICLE INVENTORY EVENTS END

    jcmp.AddEvent('inventory/ui/ToggleDrag', (can_toggle) => 
    {
        can_drag = can_toggle;
    })

    // Toggles the vehicle menu to be visible or not
    jcmp.AddEvent('inventory/ui/ToggleVehicleMenu', (enabled) => 
    {
        if (enabled)
        {
            $('div.vehicle-container').fadeIn(1);
        }
        else
        {
            $('div.vehicle-container').fadeOut(1);
        }
    })

    jcmp.AddEvent('inventory/ui/show_desync', () => 
    {
        jcmp.HideCursor();
        jcmp.HideCursor();
        jcmp.HideCursor();

        $('div.desync-container').show();
        
        $('div.main-container').hide();
        $('div.section').hide();
    })

    jcmp.CallEvent('inventory/Ready');

})
