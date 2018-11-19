$(document).ready(function() 
{
    $('html').css('visibility', 'visible');

    const open_key = 79; // O key to open
    let open = false;
    let can_open = true;
    let my_id = -1;

    const players = {};

    $('div.tooltip').hide();
    $('i.fas.fa-map-marker-alt').hide();

    function UpdatePlayer(data)
    {
        if (players[data.id]) // If the player already is on the map
        {
            if (data.color) {players[data.id].css('background-color', data.color);}
            if (data.name) {players[data.id].data('name', data.name);}
            
            if (data.id == my_id && !data.localplayer) {return;}

            players[data.id].css({
                left: `${data.x}%`,
                top: `${data.y}%`
            })

        }
        else // If the player is not on the map and they have a color
        {
            const $player = $(`<div class='player' id='p_${data.id}' style='top: ${data.y}%; left: ${data.x}%; background-color: ${data.color};'></i>`);
            $player.data('name', data.name).data('id', data.id);
            if (data.id == my_id) {$player.addClass('me');}
            $('div.container').prepend($player);
            players[data.id] = $player;
        }
    }

    function Open()
    {
        open = true;

        $('body').stop();
        $('body').css('transform', 'rotateX(0deg)');

        jcmp.ShowCursor();
        jcmp.CallLocalEvent('toggle_map', open);
    }

    function Close()
    {
        open = false;

        $('body').stop();
        $('body').css('transform', 'rotateX(90deg)');
        
        jcmp.HideCursor();
        jcmp.CallLocalEvent('toggle_map', open);
    }

    
    $(document).on('click', function(e)
    {
        if (!open) {return;}

        const x = ((parseInt(e.pageX - $('div.container').offset().left)) / $('div.container').width()) * 100;
        const z = ((e.pageY - $('div.container').offset().top) / $('div.container').height()) * 100;

        jcmp.CallLocalEvent('teleport', Math.max(Math.min(100, x), 0), Math.max(Math.min(100, z), 0));
        Close();

    })

    jcmp.AddEvent('toggle', () => 
    {
        if (can_open)
        {
            if (open) {Close();} else {Open();}
        }
    })

    $(document).on('contextmenu', function(e)
    {
        if (!open) {return;}
        if ($('i.fas.fa-map-marker-alt').css('display') == 'none')
        {
            // Not showing, so display it
            $('i.fas.fa-map-marker-alt')
            .css({
                'top': e.pageY - $('div.container').offset().top - $('i.fas.fa-map-marker-alt').height(),
                'left': e.pageX - $('div.container').offset().left - $('i.fas.fa-map-marker-alt').width() / 2,
            })
            .show();

            
            const x = ((parseInt($('i.fas.fa-map-marker-alt').css('left')) + $('i.fas.fa-map-marker-alt').width() / 2) / $('div.container').width()) * 100;
            const z = (($('i.fas.fa-map-marker-alt').offset().top + $('i.fas.fa-map-marker-alt').height()) / $('div.container').height()) * 100;

            jcmp.CallLocalEvent('set_marker', x, z);
        }
        else
        {
            // Showing, so remove it
            $('i.fas.fa-map-marker-alt').hide();

            jcmp.CallLocalEvent('hide_marker');
        }
        e.preventDefault();
    })

    $(document).on('mousemove', '.player', function(e)
    {
        if (!$(this).data('name')) {return;}

        const name = $(this).data('name');
        const color = $(this).css('background-color');

        $('div.tooltip')
            .empty()
            .text(name)
            .css({
                'top': e.pageY,
                'left': e.pageX,
                'color': color
            })
            .show();
    })

    $(document).on('mouseleave', '*', function(e)
    {
        $('div.tooltip').hide();
    })

    jcmp.AddEvent('toggle_enabled', (enabled) => 
    {
        can_open = !enabled;
    })

    jcmp.AddEvent('add', (data) => 
    {
        UpdatePlayer(JSON.parse(data));
    })

    jcmp.AddEvent('set_id', (id) => 
    {
        my_id = id;
    })

    jcmp.AddEvent('remove_player', (id) => 
    {
        delete players[id];
        $(`#p_${id}`).remove();
    })

    jcmp.AddEvent('update_pos', (data) => 
    {
        if (!players[my_id]) {return;}
        data = JSON.parse(data);
        data.localplayer = true;
        UpdatePlayer(data);
    })

    jcmp.CallLocalEvent('ready');

})
