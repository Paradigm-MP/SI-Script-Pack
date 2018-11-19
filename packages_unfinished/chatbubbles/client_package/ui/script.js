$(document).ready(function() 
{
$('html').css('visibility', 'visible');
    let messages = [];
    let msg_amount = 0;
    let my_name; // Name of this localplayer
    let players = []; // Names of players
    let size_x, size_y;
    
    /**
     * Adds a message to the container.
     *
     * @param {object} obj - Object with all the data of the message
     * @param {string} channel - Channel that the message is going to
     */

    function AddMessage(obj, r = 255, g = 255, b = 255, channel)
    {
        obj = JSON.parse(obj);

        obj.mn = msg_amount;
        obj.html = obj.html.replace(`id="m_">`, `id="m_${obj.mn}">`);

        if (obj.msg.length > 150)
        {
            obj.msg = obj.msg.substring(0, 150) + '...';
        }

        obj.r = r;
        obj.b = b;
        obj.g = g;

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

        const message = $(`<div class='message' id='d_${obj.mn}'>${obj.html}</div>`);

        $('.container').append(message);

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
        }

        //$('#d_' + obj.mn).hide().fadeIn(250);

        if ($(".container .message").length > 3)
        {
            $(".container .message").first().remove();
            messages.splice(0, 1);
        }

        messages.push(JSON.stringify(obj));

        msg_amount++;

        setTimeout(function() 
        {
            if ($(`#d_${obj.mn}`).length === 0) {return;}
            $(`#d_${obj.mn}`).remove();
            messages.splice(0, 1);
            CheckDimensions();
        }, 6000 + 150 * obj.msg.length);

        
        CheckDimensions();
        
	}

    function GetStackAmount(stack) 
    {
        return (stack.contents[0].durability || stack.contents[0].can_equip) ? stack.contents.length : stack.contents[0].amount;
    }

    /**
     * See if dimensions of the container changed, and if so, then update the render stuff
     */
    function CheckDimensions()
    {
        if (size_x != $('div.container').width() || size_y != $('div.container').height())
        {
            size_x = $('div.container').width();
            size_y = $('div.container').height();

            if (messages.length == 0)
            {
                size_x = 0;
                size_y = 0;
            }

            jcmp.CallLocalEvent('chatbubbles/ui/update_size', size_x, size_y);
        }
    }

    jcmp.AddEvent('chatbubble/AddPlayer', (name) => 
    {
        players.push(name);
    })

    jcmp.AddEvent('chat2/RemovePlayer', (name) => 
    {
        if (players.indexOf(name) > -1) {players.splice(players.indexOf(name), 1);}
        // TODO maybe remove above line if we get player validation checking
    })

    jcmp.AddEvent('set_name', (name, names) => 
    {
        players = JSON.parse(names);
        my_name = name;
    })

    jcmp.AddEvent('add', (...args) => 
    {
        setTimeout(function() 
        {
            AddMessage(...args);
            $('html').css('visibility', 'visible');
        }, 100);
    })

    CheckDimensions(); //TODO get rid of this, only for testing

    jcmp.CallLocalEvent('chatbubbles/bubble_ready');

})
