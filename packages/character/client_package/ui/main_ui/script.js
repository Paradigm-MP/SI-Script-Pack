$(document).ready(function() 
{
    // Whether or not this person is banned.
    let banned = false;

    // Used for creation of a new character
    let current_char_id;

    // When the player clicks a character to play, disable everything else
    let char_selected = false;

    $("div.tooltip").fadeOut(1);
    $("div.name-area").fadeOut(1);
    $('div.warning').fadeOut(1);
    $('div.invalid-name').hide();
    $('html').css('visibility', 'visible');

    // Player clicked on a space to create a new character
    $(document).on("click", "td.new", function() 
    {
        if ($(this).data('clicked') == true || char_selected) {return;}

        $(this).data('clicked', true);
        CreateNewCharacter($(this).attr('id').replace('char_', ''));
    });

    
    // Hover enter disabled confirm button to display tooltip
    $(document).on("mouseenter", "td", function() 
    {
        jcmp.CallEvent('sound/Play', 'commlink_map_cursor_liberated_region_over_rev.ogg', 0.2);
    })

    // Player clicked on a space to login to an existing character
    $(document).on("click", "td.existing", function() 
    {
        if (char_selected || $(this).hasClass('banned') || banned) {return;}

        char_selected = true;
        jcmp.CallEvent('character/login', $(this).attr('id').replace('char_', ''));
    });

    /**
     * Shows the necessary UI after the player hits '+ Create New Character'
     * 
     * @param {number} id - Id of character, must be 1-3
     */
    function CreateNewCharacter(id)
    {
        // Store character id we are working on
        current_char_id = id;

        // Hide other characters' UI
        $("td.character").each(function(index) 
        {
            $(this).hide("fade", 200, function() 
            {
                // Once hidden, show name input UI and back button
                if (index == 0)
                {
                    ShowNameUI();
                }
            });
        });
    }

    /**
     * Shows the UI input to type a name for a new character.
     */
    function ShowNameUI()
    {
        $('div.name-area').show("fade", 200, function() 
            {
            });
        $("div.name-area").focus();
    }

    // Player clicked on a space to create a new character
    $(document).on("click", "button.name-submit.confirm-before.enabled", function() 
    {
        // Trim, get rid of multiple spaces together
        let name = $('input.name').val().trim();
        name = name.replace(/\s\s+/g, ' ');
        name = name.substring(0, 30);
        name = ProcessNameInput(name);

        $('input.name').val(name);

        // If their name is too short, don't do anything, let them figure it out
        if (name.length < 3) {return;}

        $('div.warning').fadeIn(200);
        //$('div.bg').css('filter', 'blur(5px)');

    });

    
    // Player clicked on a space to go back
    $(document).on("click", "button.name-submit.back", function() 
    {
        $('div.warning').fadeOut(200);
        //$('div.bg').css('filter', 'blur(0px)');
    })

    // Player clicked on a space to create a new character
    $(document).on("click", "button.name-submit.confirm", function() 
    {
        // If we already submitted to the server and are waiting for a response, don't send again
        if ($(this).data('submitted') == true || current_char_id == undefined) {return;}

        // Trim, get rid of multiple spaces together
        let name = $('input.name').val().trim();
        name = name.replace(/\s\s+/g, ' ');
        name = name.substring(0, 30);
        name = ProcessNameInput(name);

        $('input.name').val(name);

        // If their name is too short, don't do anything, let them figure it out
        if (name.length < 3) 
        {
            
            $('div.warning').fadeOut(200);
    
            $('div.invalid-name').show();
    
            if (invalid_timeout) {clearTimeout(invalid_timeout); invalid_timeout = null;}
    
            invalid_timeout = setTimeout(function() 
            {
                $('div.invalid-name').fadeOut(1000);
            }, 7000);
    
            return;
        }

        jcmp.CallEvent('character/create_new', name, current_char_id);

        // Set submitted to true so we don't send multiple times
        $(this).data('submitted', true);



    });

    $(document).on("propertychange keyup paste input", "input.name", function() 
    {
        let text = ProcessNameInput($(this).val().trim());
        
        if (text.length >= 3 && text.length < 30)
        {
            $('button.name-submit').removeClass('disabled');
            $('button.name-submit').addClass('enabled');
            $("div.tooltip").fadeOut('fast');
        }
        else if ($('button.name-submit').hasClass('enabled'))
        {
            $('button.name-submit').removeClass('enabled');
            $('button.name-submit').addClass('disabled');
        }
    });

    /**
     * Gets rid of weird unicode.
     * 
     * @param {string} input - The raw input from the player.
     * @returns {string} - Procesed input.
     */
    function ProcessNameInput(input)
    {
        let new_str = input;
        for (let i = 0; i < input.length; i++)
        {
            if (input.charCodeAt(i) > 125 || input.charCodeAt(i) < 32)
            {
                new_str = new_str.substring(0, i) + new_str.substring(i+1, new_str.length);
            }
        }
        return new_str;
    }

    /**
     * Parses last played string into a nice looking one.
     * 
     * @param {string} s - The string to format.
     * @returns {string} - The formatted string.
     */

    function GetLastPlayed(s)
    {
        s = s.split('-');
        let m;
        switch(s[1])
        {
            case '1': {m = 'January'; break;}
            case '2': {m = 'February'; break;}
            case '3': {m = 'March'; break;}
            case '4': {m = 'April'; break;}
            case '5': {m = 'May'; break;}
            case '6': {m = 'June'; break;}
            case '7': {m = 'July'; break;}
            case '8': {m = 'August'; break;}
            case '9': {m = 'September'; break;}
            case '10': {m = 'October'; break;}
            case '11': {m = 'November'; break;}
            case '12': {m = 'December'; break;}
        }

        return m + ' ' + s[2] + ', ' + s[0];
    }

    // Hover enter disabled confirm button to display tooltip
    $(document).on("mouseenter", "button.name-submit.disabled", function() 
    {
        $("div.tooltip").finish();
        $('div.tooltip').css(
        {
            'top': $(this).offset().top + $(this).height() + 20,
            'left': $(this).offset().left+ $(this).width() / 2 - $('div.tooltip').width() / 2
        });
        $("div.tooltip").fadeIn('fast');
    });

    // Hover exit disabled confirm button to fade out tooltip
    $(document).on("mouseleave", "button.name-submit.disabled", function() {
        $("div.tooltip").fadeOut('fast');
    });

    /*CreateCharEntries([
        {
            general: {
                last_played: '2018-10-18',
                time_online: 7362,
                color: 'red',
                name: 'Test Char',
                kills: 12,
                deaths: 2,
                boxes_looted: 581,
                chat_banned: 0,
                health: 800
            },
            exp: {
                level: 7,
                experience: 120
            }
            // owned vehicles
            // landclaims
            // hunger/thirst
            // tag
            // banned
            // number of friends
        }
    ])*/

    /**
     * Creates character entries using data from server
     * @param {*} data 
     */
    function CreateCharEntries(data)
    {
        for (let i = 0; i < 2; i++)
        {
            const d = data[i];
            if (d == undefined || d.general == undefined)
            {
                continue;
            }

            const last_played = GetLastPlayed(d.general.last_played);
            let time_online = `${d.general.time_online} minutes`;

            // Convert to hours if they have played at least 2 hours
            if (d.general.time_online >= 120)
            {
                const hours = Math.floor(d.general.time_online / 60);
                time_online = (hours > 1) ? `${hours} hours` : `${hours} hour`;
            }

            let char_id = i + 1;
            $(`#char_${char_id}`)
                .removeClass('new')
                .addClass('existing')
                .html('')
                .append($(`<div class="char-name" style='color:${d.general.color}'></div>`)
                    .text(d.general.name))
                .append($(`<div class="char-level">Level ${d.exp.level}</div>`))
                //.append($(`<div class="char-exp">(${d.exp.experience}/${d.exp.max})</div>`))
                .append($(`<div class="char-kills">Kills: ${d.general.kills}</div>`))
                .append($(`<div class="char-deaths">Deaths: ${d.general.deaths}</div>`))
                .append($(`<div class="char-boxes-looted">Boxes looted: ${d.general.boxes_looted}</div>`))
                .append($(`<div class="char-time-online">Time Online: ${time_online}</div>`))
                .append($(`<div class="char-last-played">Last Played: ${last_played}</div>`));

            if (d.tag != undefined)
            {
                $(`#char_${char_id}>div.char-name`)
                    .prepend($(`<span class='tag' style='background-color: ${d.tag.color}'>${d.tag.name}<span>`));
            }

            if (d.banned && d.banned.ban_date)
            {
                const ban_msg = (d.banned.ban_date == "Forever") ? 
                    "Banned Forever" : "Banned until " + GetLastPlayed(d.banned.ban_date);

                $(`#char_${char_id}`)
                    .append($(`<div class="banned">${ban_msg}</div>`))
                    .addClass('banned');
                banned = true;

                $(`#char_${char_id}`)
                    .append($(`<div class="banned-appeal">
                        Want to appeal your ban? Message an Admin on Discord by pressing F4</div>`))
            }
        }
    }

    jcmp.AddEvent('character/create_char_entries', (data) => 
    {
        jcmp.ShowCursor();
        data = JSON.parse(data);

        CreateCharEntries(data);
    })

    jcmp.AddEvent('character/Loaded', () => 
    {
        jcmp.HideCursor();
        jcmp.CallEvent('character/mouse_hidden_on_load');
    })

    jcmp.AddEvent('character/add_entry', () => 
    {
        $('div.char-area')
            .css(
            {
                'width': '60%'
            });

        $('tr')
            .append($(`<td id='char_2' class='character new'><i id="icon-plus" class="fa fa-plus"></i> Create New Character</td>`));

    })

    let invalid_timeout;

    jcmp.AddEvent('character/reset_name', () => 
    {
        $('div.warning').fadeOut(200);

        $('div.invalid-name').show();

        if (invalid_timeout) {clearTimeout(invalid_timeout); invalid_timeout = null;}

        invalid_timeout = setTimeout(function() 
        {
            $('div.invalid-name').fadeOut(1000);
        }, 7000);

        $('button.name-submit.confirm')
            .data('submitted', false)
            .val('');

        $('#name_input').val('');

        if ($('button.name-submit').hasClass('enabled'))
        {
            $('button.name-submit').removeClass('enabled');
            $('button.name-submit').addClass('disabled');
        }
    })

    jcmp.CallEvent('character/ui_loaded');

})
