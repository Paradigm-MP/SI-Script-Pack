$(document).ready(function() 
{
    $('.window').draggable({handle: ".title", stack: 'div', disabled: false});
    
    let messages = [];
    let new_messages = [];
    let current_user = -1;
    const open_key = 119; // F8
    let open = false;
    let can_open = 0;
    let sound_enabled = true;
    let notify_enabled = true;

    $('.mail-notify').css('visibility', 'hidden');

    if (!open)
    {
        $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
    }

    $('html').css('visibility', 'visible');

    /**
     * Changes currently selected player to player with id and name.
     * 
     * @param {number} id - The id of the player to change to
     * @param {string} name - The name of the player to switch to
     */

    function changePlayer(id, title, name)
    {
        $(".player-entry").each(function(index) 
        {
            if ($(this).hasClass('selected'))
            {
                $(this).removeClass('selected');
            }
        });

        $(`#${id}`).addClass('selected');

        id = id.replace('networkId_', '');
        id = parseInt(id);
        if (typeof messages["networkId_" + id] == 'undefined')
        {
            messages["networkId_" + id] = [];
        }

        $('.message-area').empty();
        
        messages["networkId_" + id].forEach(function(entry) 
        {
            CreateMessage(id, entry);
        });
        
        current_user = id;
        $("#input-area").attr("placeholder", `Type a message to ${name}...`);
        $("#input-area").val(""); // Clear textbox 
        $("#input-area").focus();
        // Scroll to bottom
        let element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;

        // Remove new message indicators if there was one
        if (new_messages.indexOf(id) > -1)
        {
            new_messages.splice(new_messages.indexOf(id), 1);
        }
        $('#newmessage_' + id).remove();
        $('.message-title').html(title);
        $('#newmessage_' + id).remove();

    }

    function AddPlayer(id, name, tagdata)
    {
        messages["networkId_" + id] = [];
        let entry = $('#networkId_' + id);
        if (entry.length > 0)
        {
            entry.remove(); // If it exists, remove it
        }

        const $player = $(`<div id='networkId_${id}' class='player-entry'></div>`).text(name);

        if (tagdata)
        {
            $player.prepend(
                $(`<span class='tag' style='background-color: ${tagdata.color}'>${tagdata.name}</span>`));
        }

        $('.players').append($player);
        Sort();
    }

    $(document).on("click", ".player-entry",function() 
    {
        let name = '';
        $(this).contents().each(function()
        {
            if (this.nodeType === 3)
            {
                name += this.wholeText;
            }
        });

        changePlayer($(this).attr('id'), $(this).html(), name);
    });

    function RemovePlayer(id)
    {
        messages["networkId_" + id] = [];
        let entry = $('#networkId_' + id);
        if (entry.length > 0)
        {
            entry.remove(); // If it exists, remove it
        }

        if (current_user == id)
        {
            $('.message-area').empty();
            $('.message-title').text("Select a player to begin");
            current_user = -1;
            $("#input-area").attr("placeholder", "Type a message...");
            $("#input-area").val(""); // Clear textbox 
        }
    }

    function AddMessage(id, entry)
    {
        messages["networkId_" + id].push(entry);
        
        if (current_user == id)
        {
            CreateMessage(id, entry);
        }

        if (current_user != id && new_messages.indexOf(id) == -1)
        {
            new_messages.push(id);
            CreateSmallIndicator(id);
        }

        if (!open && entry.type == 'from')
        {
            if (sound_enabled)
            {
                let sound = document.createElement("AUDIO");
                sound.setAttribute("src","./sounds/mail.ogg");
                sound.volume = 0.25;
                sound.play();
            }
        }
        /*
        if (!open && notify_enabled)
        {
            $('.mail-notify').css('visibility', 'visible');
        }*/

    }

    function CreateMessage(id, entry) // type: to or from, msg: text
    {
        let message = document.createElement("div");
        message.textContent = entry.msg;
        message.className = "message " + entry.type;
        $('.message-area').append(message);
        let element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
    }

    function CreateSmallIndicator(id)
    {
        let span = document.createElement("span");
        span.className = "new-messages";
        span.id = "newmessage_" + id;
        let icon = document.createElement("span");
        icon.className = "fa fa-envelope";
        span.appendChild(icon);
        $('#networkId_' + id).prepend(span);
    }

    function Sort()
    {
        let $divs = $("div.player-entry");
        const sorted = $divs.sort(function(a,b)
        {
            return ($(a).text() > $(b).text() ? 1 : -1);
        });
        $(".players").html(sorted);
    }
    
    $(".mute-icon.notify").hover(function()
    {
        ToggleNotifyIcon(true);
    }, function()
    {
        ToggleNotifyIcon(false);
    });

    function ToggleNotifyIcon(hovered)
    {
        if (notify_enabled)
        {
            if (hovered)
            {
                $("#notify-toggle").removeClass("fa fa-eye");
                $("#notify-toggle").addClass("fa fa-eye-slash");
            }
            else
            {
                $("#notify-toggle").removeClass("fa fa-eye-slash");
                $("#notify-toggle").addClass("fa fa-eye");
            }
        }
        else
        {
            if (hovered)
            {
                $("#notify-toggle").removeClass("fa fa-eye-slash");
                $("#notify-toggle").addClass("fa fa-eye");
            }
            else
            {
                $("#notify-toggle").removeClass("fa fa-eye");
                $("#notify-toggle").addClass("fa fa-eye-slash");
            }
        }
    }

    $(".mute-icon.sound").hover(function()
    {
        ToggleSoundIcon(true);
    }, function()
    {
        ToggleSoundIcon(false);
    });

    function ToggleSoundIcon(hovered)
    {
        if (sound_enabled)
        {
            if (hovered)
            {
                $("#sound-toggle").removeClass("fa fa-volume-up");
                $("#sound-toggle").addClass("fa fa-volume-off");
            }
            else
            {
                $("#sound-toggle").removeClass("fa fa-volume-off");
                $("#sound-toggle").addClass("fa fa-volume-up");
            }
        }
        else
        {
            if (hovered)
            {
                $("#sound-toggle").removeClass("fa fa-volume-off");
                $("#sound-toggle").addClass("fa fa-volume-up");
            }
            else
            {
                $("#sound-toggle").removeClass("fa fa-volume-up");
                $("#sound-toggle").addClass("fa fa-volume-off");
            }
        }
    }

    function ToggleSound(enabled)
    {
        sound_enabled = enabled;
        ToggleSoundIcon(false);
        jcmp.CallEvent('guipm/UpdateSettings', notify_enabled, sound_enabled);
    }

    function ToggleNotify(enabled)
    {
        notify_enabled = enabled;
        ToggleNotifyIcon(false);
        jcmp.CallEvent('guipm/UpdateSettings', notify_enabled, sound_enabled);
        if (!notify_enabled)
        {
            $('.mail-notify').css('visibility', 'hidden');
        }
    }

    $(".mute-icon.sound").click(function() 
    {
        ToggleSound(!sound_enabled);
    });

    $(".mute-icon.notify").click(function() 
    {
        ToggleNotify(!notify_enabled);
    });

    
    $(".close-icon").hover(function()
    {
        $("#close-button").css("color", "red");
    }, function()
    {
        $("#close-button").css("color", "white");
    });

    $(".close-icon").click(function()
    {
        open = !open;
        $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden'); $("#close-button").css("color", "white");});
        jcmp.HideCursor();
        jcmp.CallEvent('guipm/ToggleOpen', open);
        jcmp.CallEvent('guipm/disable_menus', !open);
    });

    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == 13 && open)
        {
            let msg = $("#input-area").val();
            if (msg.length > 0 && current_user > -1)
            {
                jcmp.CallEvent('guipm/SendMessage', msg, current_user);
            }
            $("#input-area").val("");
        }
        else if (keycode == open_key && can_open == 0)
        {
            open = !open;
            jcmp.CallEvent('guipm/disable_menus', !open);
            if (open) 
            {
                $('.window').css('visibility', 'visible');
                $('.window').fadeIn(1);
                $("#input-area").val("");
                $("#input-area").blur();
                jcmp.ShowCursor(); 
                $('.mail-notify').css('visibility', 'hidden');
                if (new_messages.indexOf(current_user) > -1)
                {
                    new_messages.splice(new_messages.indexOf(current_user), 1);
                    $('#newmessage_' + current_user).remove();
                }
            } 
            else 
            {
                $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
                $("#input-area").blur();
                jcmp.HideCursor();
            }
            jcmp.CallEvent('guipm/ToggleOpen', open);
        }

    };

    jcmp.AddEvent('guipm/AddMessage', (id, entry) => {
        entry = JSON.parse(entry);
        AddMessage(id, entry);
    })

    jcmp.AddEvent('guipm/AddPlayer', (data) => {
        data = JSON.parse(data);
        AddPlayer(data.id, data.name, data.tag);
    })

    jcmp.AddEvent('guipm/RemovePlayer', (id) => {
        RemovePlayer(id);
    })


    jcmp.AddEvent('guipm/SetSettings', (notify, sound) => {
        ToggleNotify(notify);
        ToggleSound(sound);
    })

    jcmp.AddEvent('guipm/ToggleEnabled', (enabled) => 
    {
        can_open = (enabled) ? can_open - 1 : can_open + 1;
    })

    jcmp.CallEvent('guipm/Ready');

})
