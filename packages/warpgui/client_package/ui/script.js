$(document).ready(function() 
{
    $('.window').draggable({handle: ".title", stack: 'div', disabled: false});
    
    let open_key = 120; // F9
    let open = false;
    let admin = false;
    let loaded = false;

    const acceptWarp = "Accept Warp";
    const warpHere = "Warp Here";
    const warpTo = "Warp To";

    $('.players').empty();

    if (!open)
    {
        $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
    }

    $('html').css('visibility', 'visible');

    function AddPlayer(id, name)
    {
        if (!loaded) {return;}
        let player = document.createElement("div");
        player.id = "networkId_" + id;
        player.className = "player-entry";
        $('.players').append(player);
        $('.players').append(document.createElement("hr"));

        let playername = document.createElement("span");
        playername.textContent = name;
        playername.className = "player-name";
        $('#networkId_' + id).append(playername);
        
        let warpto = document.createElement("span");
        warpto.textContent = warpTo;
        warpto.className = "warp";
        warpto.id = "networkIdwarp_" + id;
        $('#networkId_' + id).append(warpto);

        if (admin)
        {
            let warphere = document.createElement("span");
            warphere.textContent = warpHere;
            warphere.className = "warp";
            warphere.id = "networkIdwarp_" + id;
            $('#networkId_' + id).append(warphere);
        }
        
        Sort();
        
    }

    function RemovePlayer(id)
    {
        let entry = $('#networkId_' + id);
        if (entry.length > 0)
        {
            entry.remove(); // If it exists, remove it
        }
    }

    function Sort()
    {
        let $divs = $("div.player-entry");
        const sorted = $divs.sort(function(a,b)
        {
            return ($(a).find("span.player-name").text() > $(b).find("span.player-name").text() ? 1 : -1);
        });
        $(".players").html(sorted);
    }

    // .click does not work for dynamically generated elements, use .on
    $(".players").on("click", ".warp", function()
    {
        const text = $(this).text();

        if (text == acceptWarp) // Clicked accept warp button
        {
            let id = $(this).attr('id')
            id = id.replace('networkIdaccept_', '');
            id = parseInt(id);
            jcmp.CallEvent('warpgui/AcceptWarp', id);
            $(this).remove();
        }
        else if (text == warpHere && admin) // Clicked warp here button
        {
            let id = $(this).attr('id')
            id = id.replace('networkIdwarp_', '');
            id = parseInt(id);
            jcmp.CallEvent('warpgui/WarpHere', id);
        }
        else if (text == warpTo) // Clicked warp to button
        {
            let id = $(this).attr('id')
            id = id.replace('networkIdwarp_', '');
            id = parseInt(id);
            jcmp.CallEvent('warpgui/WarpTo', id);
        }
    })

    $(".close-icon").hover(function()
    {
        $("#close-button").css("color", "red");
    }, function()
    {
        $("#close-button").css("color", "black");
    });

    $(".close-icon").click(function()
    {
        open = !open;
        $('.window').fadeOut("fast", function() {$('.window').css('visibility', 'hidden'); $("#close-button").css("color", "black");});
        jcmp.HideCursor();
        jcmp.CallEvent('warpgui/ToggleOpen', true);
    });

    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key)
        {
            ToggleOpen();
        }

    };

    function ToggleOpen()
    {
        open = !open;
        if (open) 
        {
            $('.window').css('visibility', 'visible');
            $('.window').fadeIn("fast");
            jcmp.ShowCursor(); 
        } 
        else 
        {
            $('.window').fadeOut("fast", function() {$('.window').css('visibility', 'hidden');});
            jcmp.HideCursor();
        }
        jcmp.CallEvent('warpgui/ToggleOpen', !open);
    }

    jcmp.AddEvent('warpgui/AddAcceptWarp', (id) => {
        let entry = $('#networkIdaccept_' + id);
        if (entry.length == 0)
        {
            let accept = document.createElement("span");
            accept.textContent = acceptWarp;
            accept.className = "warp";
            accept.id = "networkIdaccept_" + id;
            $('#networkId_' + id).append(accept);
        }
        
    })

    jcmp.AddEvent('warpgui/AddPlayer', (id, name) => {
        AddPlayer(id, name);
    })

    jcmp.AddEvent('warpgui/RemovePlayer', (id) => {
        RemovePlayer(id);
    })
    
    jcmp.AddEvent('warpgui/InitConfig', (c) => {
        c = JSON.parse(c);
        open_key = c.open_key;
        admin = c.admin;
        loaded = true;
    })


    jcmp.CallEvent('warpgui/Ready');

})
