$(document).ready(function() 
{
    $('.window').draggable({handle: ".title", disabled: false});
    
    let open_key = 80; // P
    let open = false;
    let can_open = 0;
    let max_players = 0;
    let friends = {};
    const friend_status_text = 
    {
        "Friends" : {"hover": "Remove Friend", "not_hover": "Friend"},
        "Pending" : {"hover": "Cancel Request", "not_hover": "Pending"},
        "Requested" : {"hover": "Accept Friend", "not_hover": "Requested"},
        "None" : {"hover": "Add Friend", "not_hover": "Add Friend"},
    }

    if (!open)
    {
        $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
        $('div.entries').empty().append($(`<div class='offline-divider'><hr>Offline Friends<hr></div>`));
    }

    $('html').css('visibility', 'visible');

    /**
     * Creates a player entry in the list.
     * 
     * @param {object} data - The data of the player. Must include:
     *  * id - the player's networkId
     *  * steam_id - the player's steam_id
     *  * color - the player's color
     *  * name - the player's name
     *  * friend_status - either "Friends", "Pending", "Requested", or "None"
     *  * level - the player's level
     *  * ping - the player's ping
     *  * is_me - if this player is us (used for removing the "add friend" button)
     *  * offline - if this player is offline (aka they are a friend or pending friend)
     */
    function CreateEntry(data)
    {
        let return_from_here = false;

        // If this player already exists in the menu in the offline section
        $(`.entry`).each(function()
        {
            const player_data = $(this).data('player');

            // If we are trying to add a duplicate
            if (!$(this).hasClass('offline') && player_data.steam_id == data.steam_id)
            {
                return_from_here = true; // Don't do anything
            }

            // If this online player matches an offline player
            if (player_data.steam_id == data.steam_id)
            {
                player_data.networkId = data.networkId;
                player_data.ping = data.ping;
                player_data.level = data.level;

                // Update ping and level
                $(this).find('span.text.ping').text(data.ping);
                $(this).find('span.text.level').text(data.level);
                $(this).removeClass('offline'); // They are now online

                $(this).attr('id', `p_${data.id}`);

                $(this).detach().prependTo($('div.entries'));

                return_from_here = true;
            }
        })

        if (return_from_here) {return;}

        const id_str = (!data.offline) ? ` id='p_${data.id}'` : ''; // Only use id if they are online

        const $entry = $(`<div class='entry'${id_str}></div>`)
            .append($(`<span class='text name' style='color: ${data.color}'>${data.name}</span>`))
            .append($(`<span class='text level'>${data.level}</span>`))
            .append($(`<span class='text ping'>${data.ping}</span>`))
            .data('player', data);

        if (data.friend_status != "None")
        {
            $entry.append(
                $(`<span class='button ${data.friend_status}'>${friend_status_text[data.friend_status].not_hover}</span>`));
        }
        else
        {
            $entry.append(
                $(`<span class='button add'>${friend_status_text[data.friend_status].not_hover}</span>`));
        }

        // If they have a tag, add it
        if (data.tag)
        {
            $entry.find('span.text.name').prepend(
                $(`<span class='text tag' style='background-color: ${data.tag.tagcolor};'>${data.tag.tagname}</span>`));
        }

        // If this is our player, remove the Add Friend button
        if (data.is_me)
        {
            $entry.find('span.button').remove();
        }

        if (data.offline)
        {
            $entry.addClass('offline');
            $('div.entries').append($entry); // If the player is offline, put them at the bottom
        }
        else
        {
            $('div.entries').prepend($entry); // If the player is online, put them at the top
        }

    }

    /**
     * Called when a player disconnects. Either removes the entry, or if they are a friend, puts in offline players
     */
    function RemoveEntry(data)
    {
        const $entry = $(`div.entry#p_${data.id}`);
        const player_data = $entry.data('player');

        // This has no friend status, so just remove them.
        if (player_data.friend_status == "None")
        {
            $entry.remove();
            return;
        }

        $entry.removeAttr('id'); // Remove id so someone with the same networkId doesn't mess stuff up
        $entry.addClass('offline');
        $entry.find('span.text.ping').text('--'); // Set ping to -- because they don't have a ping

        $entry.detach().appendTo($('div.entries')); // Put the entry at the bottom, since they are offline
    }

    // Click add friend button
    $(".entries").on("click", "span.button", function()
    {
        const data = $(this).parent().data('player');

        if (!data) {return;} // No data found :(
        if (data.is_me) {return;} // Can't friend ourselves

        // If they clicked an "add friend" button
        if ($(this).hasClass('add') && data.friend_status == "None")
        {
            jcmp.CallEvent('friends/ui/add_friend', data.steam_id);
        }
        else if ($(this).hasClass('Friends') && data.friend_status == "Friends") // If they clicked a "Friends" button (to remove friend)
        {
            jcmp.CallEvent('friends/ui/remove_friend', data.steam_id);
        }
        else if ($(this).hasClass('Pending') && data.friend_status == "Pending") // If they clicked a "Pending" button (to cancel sent friend request)
        {
            jcmp.CallEvent('friends/ui/cancel_friend_request', data.steam_id);
        }
        else if ($(this).hasClass('Requested') && data.friend_status == "Requested") // If they clicked a "Requested" button (to accept request from someone)
        {
            jcmp.CallEvent('friends/ui/accept_friend_request', data.steam_id);
        }


    });

    function ModifyEntry(data)
    {
        let $entry = $(`div.entry#p_${data.id}`);

        if (data.id == undefined && data.steam_id)
        {
            // If we are looking for offline entries (eg we accepted a friend request from offline player)
            $(`.entry`).each(function()
            {
                const player_data = $(this).data('player');

                if (player_data.steam_id == data.steam_id)
                {
                    $entry = $(this);
                }
            })
        }

        if (!$entry)
        {
            return;
        }

        const player_data = $entry.data('player');

        if (data.ping)
        {
            $entry.find('span.text.ping').text(data.ping);
            player_data.ping = data.ping;
        }

        if (data.level)
        {
            $entry.find('span.text.level').text(data.level);
            player_data.level = data.level;
        }

        if (data.friend_status)
        {
            $entry.find('span.text.level').text();
            const $button = $entry.find('span.button');

            ClearClasses($button);

            if (data.friend_status != "None")
            {
                $button.addClass(data.friend_status);
            }
            else
            {
                $button.addClass('add');
            }

            $button.text(friend_status_text[data.friend_status].not_hover);

            // Remove offline entries that have no friend status
            if ($entry.hasClass('offline') && data.friend_status == "None")
            {
                $entry.remove();
                return;
            }

            player_data.friend_status = data.friend_status;
        }


        $entry.data('player', player_data);
    }

    function ClearClasses(entry)
    {
        entry.removeClass('Friends').removeClass('Pending').removeClass('Requested').removeClass('None');
    }

    // Hover button
    $(".entries").on("mouseenter", "span.button", function()
    {
        const data = $(this).parent().data('player');
        $(this).text(friend_status_text[data.friend_status].hover);
    })

    // UnHover button
    $(".entries").on("mouseleave", "span.button", function()
    {
        const data = $(this).parent().data('player');
        $(this).text(friend_status_text[data.friend_status].not_hover);
    })

    // Close window when X is pressed
    $(".close-icon").click(function()
    {
        ToggleOpen();
    });

    // Make X red when hovered
    $(".close-icon").hover(function()
    {
        $("#close-button").css("color", "red");
    }, function()
    {
        $("#close-button").css("color", "white");
    });

    // Toggles open/closed
    function ToggleOpen()
    {
        open = !open;
        if (open) 
        {
            $('.window').css('visibility', 'visible');
            $('.window').fadeIn(1);
            jcmp.ShowCursor(); 
        } 
        else 
        {
            $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
            jcmp.HideCursor();
        }

        jcmp.CallEvent('friends/disable_menus', !open);
        jcmp.CallEvent('friends/ToggleOpen', open);
    }
    
    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key && can_open == 0)
        {
            ToggleOpen();
        }

    };

    // When player data is sent (names, levels, ping, etc)
    jcmp.AddEvent('init', (data) => 
    {
        data = JSON.parse(data);

        data.forEach((entry) => 
        {
            CreateEntry(entry);
        });

        UpdateTitlePlayers();
    });

    // When a player connects, add them
    jcmp.AddEvent('friends/add_entry', (data) => 
    {
        CreateEntry(JSON.parse(data));
        UpdateTitlePlayers();
    });

    // When a player disconnects, remove them (or make them offline)
    jcmp.AddEvent('friends/remove_entry', (data) => 
    {
        RemoveEntry(JSON.parse(data)); // Just networkId
        UpdateTitlePlayers();
    });

    // When a player levels up, ping changes, or friendship changes
    jcmp.AddEvent('friends/modify_entry', (data) => 
    {
        ModifyEntry(JSON.parse(data));
    });

    // 15 second ping change
    jcmp.AddEvent('friends/modify_entries', (data) => 
    {
        data = JSON.parse(data);

        data.forEach(function(entry) 
        {
            ModifyEntry(entry);
        }, this);
    });

    // Called by other packages to stop it from opening
    jcmp.AddEvent('friends/ToggleEnabled', (enabled) => 
    {
        can_open = (enabled) ? can_open - 1 : can_open + 1;
    });

    jcmp.AddEvent('friends/ui/set_max', (max) => 
    {
        max_players = max;
        UpdateTitlePlayers();
    })

    function UpdateTitlePlayers()
    {
        let num_players = 0;
        $(`.entry`).each(function()
        {
            if (!$(this).hasClass('offline'))
            {
                num_players++;
            }
        })

        $('div.title-text').text(`Player List (${num_players}/${max_players})`);
    }

    // Called when the UI is done loading and tells the server to send data
	setTimeout(function () {
		jcmp.CallLocalEvent('friends/ready');
	}, 2000);
	
})
