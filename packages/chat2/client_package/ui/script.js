$(document).ready(function() 
{

    const type_key = 84; // T
    const close_key = 27; // Escape
    const send_key = 13; // Enter
    const open_key = 116; // F5
    let messages = [];
    let new_messages = [];
    let current_channel = null;
    let open = true;
    let can_open = 0;
    let sound_enabled = true;
    let notify_enabled = true;
    let typing = false;
    let msg_amount = 0;
    let can_send = true;
    let transitioning = false;
    const slide_speed = 100;
    const levels = [];
    const last_messaged = []; // Names of people who you have messaged or have messaged you
    const players = []; // Names of people on the server
    let last_messaged_index = 0;
    let my_name;
    let at_index = 0;
    let switched_channels = false;
    let ammo_types = {};

    let $tooltip_item;
    let $hovered_item;
    let tooltip_timeout;

    let stack_data = [];

    const msg_history = []; // Anything that this player typed in chat, used for up and down arrows
    let msg_history_index = 0;

    const tag_tooltips = 
    {
        Admin: "This player creates the scripts and administrates the server. Part of the server staff.",
        Mod: "This player moderates the server and makes sure it all runs smoothly. Part of the server staff.",
        Support: "This player helps others and makes sure everything runs smoothly. Part of the server staff.",
        Alpha: "This player helped test the server before it was available to the public.",
        Beta: "This player helped test the server during its public beta testing phase.",
        nanos: "This player is one of the people who helped create the multiplayer mod.",
        Discord: "This player is an approved submitter on our Discord.",
        Bot: "This is an automated message from a bot."
    }

    FadeOutWindow();
    $("div.tooltip").fadeOut(1);
    $('html').css('pointer-events', 'none');
    $('#input-area').hide();
    
    $('html').css('visibility', 'visible');

    /**
     * Adds a message to the chat window.
     * If the current channel matches the message's channel, the message is displayed.
     *
     * @param {object} obj - Object with all the data of the message
     * @param {string} channel - Channel that the message is going to
     */

    function AddMessage(obj, r = 255, g = 255, b = 255, channel)
    {
        obj = JSON.parse(obj);
        let history = obj.history;
        let need_update = false;

        if (history == undefined)
        {
            obj.mn = msg_amount;
            obj.html = obj.html.replace(`id="m_">`, `id="m_${obj.mn}">`);
            if (obj.channel == undefined)
            {
                if (obj.name == undefined)
                {
                    obj.channel = (typeof channel != 'undefined') ? channel : current_channel;
                }
                else
                {
                    jcmp.CallEvent('debug', "[Chat] Warning: player message was not sent with a channel. Rejecting message.");
                    return;
                }
            }
            obj.r = r;
            obj.b = b;
            obj.g = g;
            obj.mi = messages[obj.channel].length;

            if (obj.stack != undefined)
            {
                obj.stack = JSON.parse(obj.stack);
            }

            if (obj.msg != undefined)
            {
                if (obj.msg.indexOf(`@"${my_name}"`) > -1)
                {
                    obj.at_me = true;
                }
            }
        }

        /*if (obj.name != undefined)
        {
            obj.html = obj.html.replace(`id="n_">`, `id="n_${obj.pid}">`);
        }*/

        if (obj.channel == current_channel)
        {
            let message = document.createElement("div");
            message.className = "message";
            message.id = "d_" + obj.mn;
            message.innerHTML = obj.html;
            $('.message-area').append(message);

            if (obj.msg != undefined)
            {
                $(`#m_${obj.mn}`).text(obj.msg);
            }

            if (obj.name != undefined)
            {
                $(`#d_${obj.mn}>#n_${obj.pid}`).text(obj.name);
            }

            if (obj.style != undefined)
            {
                $(`#d_${obj.mn}`).css('font-style', obj.style);
            }

            if (obj.stack != undefined && obj.stack.length > 0)
            {
                if (obj.stack.length > 0) // If they have an item in chat
                {
                    // It is actually an array of stacks
                    let html = $(`#m_${obj.mn}`).html();
                    let search_str = html; // Support for multiple stacks/items or whatever
                    for (let i = 0; i < obj.stack.length; i++)
                    {
                        const name = obj.stack[i].contents[0].name;

                        const total_name = `[${name} x${GetStackAmount(obj.stack[i])}]`;
                        let index = search_str.indexOf(total_name);
                        const replace_str = new Array(total_name.length + 1).join(' ');

                        if (index > -1) // If the item is in the chat message
                        {
                            const prepend = `<span class='item ${obj.stack[i].contents[0].rarity}' id='stack_${i}'>`;
                            const append = `</span>`;

                            search_str = search_str.replace(total_name, prepend + replace_str + append);
                            html = html.substring(0, index) +
                                 html.substring(index, html.length + 1).replace(total_name, prepend + total_name + append);
                        }
                    }

                    $(`#m_${obj.mn}`).data('stack', obj.stack);
                    $(`#m_${obj.mn}`).html(html);
                }

            }

            if (obj.at_me == true) // If they were @ed
            {
                $(`#d_${obj.mn}`).addClass('atted');
                let html = $(`#m_${obj.mn}`).html();

                let index = html.indexOf(`@"${my_name}"`);
                let last_index = html.indexOf(`"`, index + 2);
                if (index > -1 && last_index > -1)
                {
                    html = html.substring(0, index) + `<b><font style='color:#449BF2'>@`
                        + html.substring(index + 2, last_index) + `</font></b>` // gets rid of quotes
                        + html.substring(last_index + 1, html.length + 1);

                    $(`#m_${obj.mn}`).html(html);
                }

                if (!obj.seen)
                {
                    jcmp.CallEvent('notify', JSON.stringify({
                        title: 'New chat notification!', 
                        subtitle: 'You were mentioned by someone.',
                        preset: 'atted'
                    }))
                }
            }
            else // Otherwise, highlight the name blue only
            {
                let html = $(`#m_${obj.mn}`).html();
                let ps = JSON.parse(JSON.stringify(players));
                ps.push(my_name);

                for (let index_ in players)
                {
                    const name = players[index_]
                    let index = html.indexOf(`@"${name}"`);
                    let last_index = html.indexOf(`"`, index + 2);

                    if (index > -1 && last_index > -1)
                    {
                        html = html.substring(0, index) + `<b><font style='color:#449BF2'>@`
                            + html.substring(index + 2, last_index) + `</font></b>` // gets rid of quotes
                            + html.substring(last_index + 1, html.length + 1);

                        $(`#m_${obj.mn}`).html(html);
                    }
                }

            }

            
            if (obj.everyone && !obj.at_me)
            {
                $(`#d_${obj.mn}`).addClass('atted');
                let html = $(`#m_${obj.mn}`).html();
                html = html.replace(`@everyone`, `<b><font style='color:#449BF2'>@everyone</font></b>`);
                $(`#m_${obj.mn}`).html(html);

                if (!obj.seen)
                {
                    jcmp.CallEvent('notify', JSON.stringify({
                        title: 'New chat notification!', 
                        subtitle: 'You were mentioned by someone.',
                        preset: 'atted'
                    }))
                }
            }

            $('.message-area').stop();

            if (!switched_channels)
            {
                $('.message-area').animate({
                    scrollTop: $('.message-area')[0].scrollHeight
                }, 1000, function() 
                {
                    
                });
            }
            else
            {
                $('.message-area').scrollTop($('.message-area')[0].scrollHeight);
            }


            $('#d_' + obj.mn).hide().fadeIn(250);

            if ($(".message-area .message").length > 100)
            {
                setTimeout(() => 
                {
                    $(".message-area .message").first().remove();
                    messages[obj.channel].splice(0,1);
                }, 1000);
            }

            if (!obj.seen)
            {
                obj.seen = true;
                need_update = true;
            }

        }

        CheckAdditionalArguments(obj);

        if (history == undefined)
        {
            obj.history = true;
            messages[obj.channel].push(JSON.stringify(obj));
        }

        if (need_update)
        {
            messages[obj.channel][obj.mi] = JSON.stringify(obj);
        }

        // If there is a new message on a different channel, create an icon
        if (current_channel != obj.channel)
        {
            if (!$('#ci_' + obj.channel).length)
            {
                let container = document.createElement("div");
                container.className = "new-icon";
                container.id = "ci_" + obj.channel;
                $('#ch_' + obj.channel).append(container);

                let icon = document.createElement("i");
                icon.className = "fa fa-exclamation-circle";
                icon.style.color = "#DBDBDB";
                $('#ci_' + obj.channel).append(icon);
            }
        }

        msg_amount++;
	}

    /**
     * Checks for and applies additional arguments in the chat message, such as timeouts.
     *
     * @param {object} obj - Object with all the data of the message
     */

    function CheckAdditionalArguments(obj)
    {
        if (typeof obj.timeout != 'undefined')
        {
            setTimeout(() => 
            {
                if (current_channel == obj.channel)
                {
                    $('#d_' + obj.mn).hide(1000, function(){$('#d_' + obj.mn).remove();});
                }
                messages[obj.channel].splice(obj.mi,1);
            }, 1000 * obj.timeout);
        }
    }

    /**
     * Creates a new channel in the chat window.
     *
     * @param {string} name - Name of the channel to be created
     */

    function CreateNewChannel(name)
    {
        messages[name] = [];

        let channel = document.createElement("span");
        channel.className = "channel";
        channel.textContent = name;
        channel.id = "ch_" + name;
        $('.channels').append(channel);
        if (current_channel == null)
        {
            ChangeChannel(name);
        }
    }

    /**
     * Changes the currently displayed/selected channel.
     *
     * @param {string} new_channel - Channel that the player is switching to.
     */

    function ChangeChannel(new_channel)
    {
        if (new_channel != current_channel)
        {
            switched_channels = true;
            $('#ch_' + current_channel).removeClass('active');
            current_channel = new_channel;
            $('#ch_' + current_channel).addClass('active');
            $('.message-area').empty();
            $("#input-area").focus();

            let length = messages[current_channel].length;
            for (let i = 0; i < length; i++)
            {
                let obj = messages[current_channel][i];
                AddMessage(obj);
            }

            if ($('#ci_' + current_channel).length > 0)
            {
                $('#ci_' + current_channel).remove();
            }
            switched_channels = false;

        }
    }

    // Click a channel to change it
    $(".channels").on("click", ".channel", function()
    {
        ChangeChannel($(this).text());
    });

    // Hover over tags to see tooltip
    $(document).on("mouseenter", "#tag", function() {
        $("div.tooltip").finish();
        $("div.tooltip").html(GetTooltipText($(this).text()));
        $('div.tooltip').css(
        {
            'top': $(this).offset().top + $(this).height() + 5,
            'left': $(this).offset().left
        });
        $("div.tooltip").fadeIn('fast');
    });

    // Hover exit tags to fade out tooltip
    $(document).on("mouseleave", "#tag", function() {
        $("div.tooltip").fadeOut('fast');
    });

    function GetTooltipText(tag)
    {
        let html = `<b>${tag}</b><br><hr>`;
        return (typeof tag_tooltips[tag] == 'undefined') ?
            html + "No description available." :
            html + tag_tooltips[tag];
    }


    // Hover over name to see tooltip
    $(document).on("mouseenter", ".player-name", function() {
        if (!$(this).attr('id') || $(this).attr('id').length == 0) {return;}

        const c = $(this).css('color');
        const id = $(this).attr('id').replace('n_', '');
        const level = (levels[id] == undefined) ? '???' : levels[id];

        $("div.tooltip").finish();
        $("div.tooltip")
            .html('')
            .append($(`<b><span style="color: ${c}">}</span></b>`)
                .text($(this).text()))
            .append($(`<br><hr>`))
            .append($(`<span class="tooltip-level">Level ${level}</span>`));

        $('div.tooltip').css(
        {
            'top': $(this).offset().top + $(this).height() + 5,
            'left': $(this).offset().left
        });
        $("div.tooltip").fadeIn('fast');
    });

    // Hover exit name to fade out tooltip
    $(document).on("mouseleave", ".player-name", function() {
        $("div.tooltip").fadeOut('fast');
    });

    // Click name to make msg /w "Name" 
    $(document).on("click", ".player-name", function() {
        if (typing && open)
        {
            $(`#input-area`).val(`/w "${$(this).text()}" `);
            SetCaretToEnd();
        }
    });

    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == send_key && typing && !transitioning)
        {
            let msg = $("#input-area").val();
            if (msg.length > 0 && can_send && current_channel != null && current_channel != "Log")
            {
                jcmp.CallEvent('chat_submit_message', msg, current_channel, JSON.stringify(stack_data));
                msg_history.splice(0,0,msg); // Add to message history
                msg_history_index = 0;
            }
            FadeOutWindow();
            $("#input-area").val("");
            $("#input-area").blur();
            $('#input-area').clearQueue();
            $('#input-area').stop();
            $('#input-area').show();
            stack_data = [];
            transitioning = true;
            $('#input-area').hide("slide", { direction: "up" }, slide_speed, function() {
                typing = false;
                transitioning = false;
            });
            jcmp.HideCursor();
            $('html').css('pointer-events', 'none');
            $('html').blur();
            can_send = false;
            setTimeout(() => 
            {
                can_send = true;
            }, 250);
            jcmp.CallEvent('chat_input_state', false);
        }
        else if (keycode == open_key)
        {
            ToggleOpen();
        }
        else if (keycode == close_key && typing && !transitioning)
        {
            transitioning = true;
            $('#input-area').hide("slide", { direction: "up" }, slide_speed, function() {
                typing = false;
                transitioning = false;
            });
            FadeOutWindow();
            $("#input-area").blur();
            $("#input-area").val("");
            jcmp.HideCursor();
            $('html').css('pointer-events', 'none');
            $('html').blur();
            jcmp.CallEvent('chat_input_state', false);
        }
        else if (keycode == type_key && open && !typing && !transitioning && can_open == 0)
        {
            FadeInWindow();
            typing = true;
            transitioning = true;
            $('#input-area').show("slide", { direction: "up" }, slide_speed, function() {
                transitioning = false;
            });
            $("#input-area").focus();
            $("#input-area").val("");
            jcmp.ShowCursor();
            $('html').css('pointer-events', 'auto');
            jcmp.CallEvent('chat_input_state', true);
        }
        else if (keycode == 9 && open && typing) // tab
        {
            let msg = $("#input-area").val();


            // If they are trying to mention someone with @name
            if (msg.indexOf(`@`) > -1)
            {
                const index = msg.indexOf(`@`);
                const name = msg.substring(index + 1, msg.length + 1);

                // If they want to cycle through players
                if (name.startsWith(`"`))
                {
                    const first_index = name.indexOf(`"`);
                    const last_index = name.indexOf(`"`, first_index + 1);

                    at_index += 1;
                    if (at_index > players.length - 1) {at_index = 0;}

                    const at_name = players[at_index];

                    msg = msg.replace(`@"${name.substring(1, name.length)}"`, `@"${at_name}"`);
                    $("#input-area").val(msg);

                    SetCaretToEnd();
                }
                else if (name.indexOf(`"`) == -1) // Otherwise they entered part of a name and want to match it to someone
                {
                    let player_name = name.trim().toLowerCase();

                    if (player_name.length == 0)
                    {
                        return;
                    }

                    let searched_name = players.find((n) => n.toLowerCase().indexOf(player_name) > -1);
                    
                    // We got a match
                    if (searched_name && searched_name.length > 1)
                    {
                        msg = msg.substring(0, index) + `@"${searched_name}" `;
                        $("#input-area").val(msg);
                        SetCaretToEnd();
                    }

                }
            }
            

            // If it doesn't start with the whisper command, don't do anything
            if (!msg.startsWith('/w '))
            {
                SetCaretToEnd();
                return;
            }

            // They want to cycle through last messaged people
            if (msg.split(`"`).length - 1 > 0 && last_messaged.length > 0)
            {
                const first_index = msg.indexOf(`"`);
                const last_index = msg.indexOf(`"`, first_index + 1);

                last_messaged_index += 1;
                if (last_messaged_index > last_messaged.length - 1) {last_messaged_index = 0;}

                const name = last_messaged[last_messaged_index];

                msg = `/w "${name}"` + msg.substring(last_index + 1, msg.length);
                $("#input-area").val(msg);

                SetCaretToEnd();

            }
            else if(msg.split(`"`).length - 1 == 0) // They want to get the name that matches
            {
                let player_name = msg.substring(4, msg.length + 1).trim().toLowerCase();
                let searched_name = players.find((name) => name.toLowerCase().indexOf(player_name) > -1);

                // We got a match
                if (searched_name && searched_name.length > 1)
                {
                    $("#input-area").val(`/w "${searched_name}" `);
                    SetCaretToEnd();

                    if (last_messaged.length > 0)
                    {
                        last_messaged_index = last_messaged.findIndex((name) => name === searched_name);
                    }

                }


            }


        }
        else if (keycode == 38 && open && typing && msg_history.length > 0) // Up arrow
        {
            $("#input-area").val(msg_history[msg_history_index]);
            SetCaretToEnd();

            msg_history_index = (msg_history_index + 1 >= msg_history.length) ? 0 : msg_history_index + 1;
        }
        else if (keycode == 40 && open && typing && msg_history.length > 0) // Down arrow
        {
            $("#input-area").val(msg_history[msg_history_index]);
            SetCaretToEnd();

            msg_history_index = (msg_history_index - 1 < 0) ? msg_history.length - 1 : msg_history_index - 1;
        }

        // Spacebar or shift, prevents scrolling
        if (keycode === 32 || keycode == 16) 
        {
            e.preventDefault();
            return false;
        }

    };

    function SetCaretToEnd()
    {
        if($("#input-area").createTextRange)
        {
            const range = $("#input-area").createTextRange();
            range.move('character', $("#input-area").val().length - 1);
            range.select();
        }
        else 
        {
            if($("#input-area").selectionStart) 
            {
                $("#input-area").focus();
                $("#input-area").setSelectionRange($("#input-area").val().length - 1, $("#input-area").val().length - 1);
            }
            else
            {
                $("#input-area").focus();
            } 
        }
    }

    function ToggleOpen()
    {
        if (typing) {return;}

        open = !open;
        $('html').css('pointer-events', 'none');
        $('html').blur();
        if (open)
        {
            $('.window').clearQueue();
            $('.window').stop();
            $('.window').css('visibility', 'visible');
            $('.window').fadeIn("fast");
            $("#input-area").val("");
            $('#input-area').hide();
            //jcmp.CallEvent('chat_input_state', typing);
        }
        else
        {
            FadeOutWindow();
            typing = false;
            $('.window').clearQueue();
            $('.window').stop();
            $('.window').fadeOut("fast");
            $("#input-area").val("");
            $('#input-area').hide();
            stack_data = [];
            //jcmp.CallEvent('chat_input_state', typing);
            jcmp.HideCursor();
        }
    }

    
    // Hover over item to see tooltip
    $(document).on("mousemove", "span.item", function(e) 
    {
        let data = $(this).parent().data('stack');

        // If it's bold, aka death drop
        if ($(this).parent().is('b'))
        {
            data = $(this).parent().parent().data('stack');
        }

        if (data == undefined)
        {
            data = $(this).parent().parent().parent().data('stack');
        }

        if (data == undefined)
        {
            data = $(this).parent().parent().parent().parent().data('stack');
        }

        const index = parseInt($(this).attr('id').replace('stack_', ''));

        $("div.tooltip").finish();
        $("div.tooltip").html(GetTooltipTextItem(data[index]));
        $('div.tooltip').css(
        {
            'top': e.pageY - 20 - $('div.tooltip').height(),
            'left': e.pageX + 20,
        });
        $("div.tooltip").show();
    });

    
    $(document).on('mouseleave', '*', function(e)
    {
        $('div.tooltip').hide();
    })


    function GetTooltipTextItem(stack)
    {
        if (!stack.get_amount)
        {
            stack.get_amount = function() 
            {
                return (this.contents[0].durability || this.contents[0].can_equip) ? this.contents.length : this.contents[0].amount;
            }
        }

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
    
    function GetStackAmount(stack) 
    {
        return (stack.contents[0].durability || stack.contents[0].can_equip) ? stack.contents.length : stack.contents[0].amount;
    }

    function FadeOutWindow()
    {
        $(`::-webkit-scrollbar`).stop();
        $(`::-webkit-scrollbar`).fadeOut(200);
        $(`div.message-area`).css({
            'border-color': 'rgba(255, 255, 255, 0.0)',
            'background-color': 'rgba(0, 0, 0, 0.0)',
        });
        $(`div.channels`).stop();
        $(`div.channels`).fadeOut(200);
    }

    function FadeInWindow()
    {
        $(`::-webkit-scrollbar`).stop();
        $(`::-webkit-scrollbar`).fadeIn(200);
        $(`div.message-area`).css({
            'border-color': 'rgba(255, 255, 255, 0.4)',
            'background-color': 'rgba(0, 0, 0, 0.2)',
        });
        $(`div.channels`).stop();
        $(`div.channels`).fadeIn(200);
    }

    jcmp.AddEvent('chat2/Toggle', () => 
    {
        ToggleOpen();
    })

    jcmp.AddEvent('chat_message', (...args) => {
        AddMessage(...args);
    })

    jcmp.AddEvent('chat/ClearChat', () => {
        $(".message").each(function(index) 
        {
            $(this).hide(1000, function() {$(this).remove();});
        });

        messages[current_channel] = [];
        AddMessage(JSON.stringify({html: "<b>Chat Cleared.</b>", timeout: 5}), 224, 210, 114);
    })

    jcmp.AddEvent('chat2/sync_level', (id, level) => {
        levels[id] = level;
    })

    jcmp.AddEvent('chat/InitConfig', (config) => {
        config = JSON.parse(config);
        config.default_channels.forEach((name) => 
        {
            if (typeof messages[name] == 'undefined')
            {
                CreateNewChannel(name);
            }
            else
            {
                jcmp.CallEvent('debug', `[Chat] Tried to create new channel ${name} when it already existed.`);
            }
        });
    })

    jcmp.AddEvent('chat2/SyncLevels', (data) => 
    {
        data = JSON.parse(data);

        for (let id in data)
        {
            levels[id] = data[id].exp.level;
        }
    })

    jcmp.AddEvent('chat2/AddMessagedPlayer', (name) => 
    {
        if (!last_messaged.includes(name))
        {
            last_messaged.push(name);
        }
    })

    jcmp.AddEvent('chat2/AddPlayer', (name) => 
    {
        if (!players.includes(name))
        {
            players.push(name);
        }
    })

    jcmp.AddEvent('chat2/RemovePlayer', (name) => 
    {
        if (players.indexOf(name) > -1) {players.splice(players.indexOf(name), 1);}
        if (last_messaged.indexOf(name) > -1) {last_messaged.splice(last_messaged.indexOf(name), 1);}
        // TODO maybe remove above line if we get player validation checking
    })

    jcmp.AddEvent('chat2/drop_item_chat', (stack, index) => 
    {
        if (open && typing)
        {
            stack = JSON.parse(stack);

            $("#input-area").val($("#input-area").val() + `[${stack.contents[0].name} x${GetStackAmount(stack)}]`);
            stack_data.push(stack);
        }
    })

    jcmp.AddEvent('inventory/ui/init_ammo_types', (data) => 
    {
        ammo_types = JSON.parse(data);
    })


    // Store name for @ usage
    jcmp.AddEvent('chat2/StoreName', (name) => 
    {
        my_name = name;
    })

    jcmp.AddEvent('chat2/ToggleEnabled', (enabled) => 
    {
        can_open = (enabled) ? can_open - 1 : can_open + 1;
    })

    jcmp.CallEvent('chat_ready');

})
