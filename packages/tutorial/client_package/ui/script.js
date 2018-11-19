$(document).ready(function() 
{

    const DEV_MODE = false;
    const FADE_TIME = (DEV_MODE) ? 1 : 500;
    let _this;

    $('div.container').hide();
    $('div.fader').hide();
    $('div.container .button.continue').hide();

    $('div.container.tu-1').fadeIn(FADE_TIME);

    $(document).on("click", ".button", function() 
    {
        const id = $(this).attr('id');
        _this = $(this);

        if (id == 'start_tut' || id == 'start_tut2')
        {
            jcmp.CallEvent('start');
            FadeTo(4);
        }
        else if (id == 'decline_tut')
        {
            FadeTo(2);
        }
        else if (id == 'decline_tut2')
        {
            FadeTo(3);
        }
        else if (id == 'close' || id == 'close2')
        {
            const parent = $(this).parent().parent();
            parent.fadeOut(FADE_TIME, function()
            {
                jcmp.HideCursor();
                jcmp.CallLocalEvent('toggle-controls', true);
                jcmp.CallLocalEvent('close');
            })
        }
        else if (id == 'continue1')
        {
            FadeTo(5);
        }
        else if (id == 'continue2')
        {
            FadeTo(6);
            $('div.fader').addClass('survival-hud');
            $('div.fader').fadeIn(FADE_TIME);
        }
        else if (id == 'continue3')
        {
            FadeTo(7);
        }
        else if (id == 'continue4')
        {
            FadeTo(8);
        }
        else if (id == 'continue5')
        {
            FadeTo(9);
            $('div.fader').removeClass('survival-hud');
            $('div.fader').addClass('sz-indicator');
        }
        else if (id == 'continue6')
        {
            FadeTo(10);
            $('div.fader').fadeOut(FADE_TIME);
            jcmp.CallLocalEvent('toggle-controls', true);
            jcmp.HideCursor();
            jcmp.CallLocalEvent('set_marker1');
        }
        else if (id == 'continue7')
        {
            FadeTo(12);
        }
        else if (id == 'continue8')
        {
            FadeTo(13);
            $('div.fader').fadeOut(FADE_TIME);
        }
        else if (id == 'continue9')
        {
            FadeTo(14);
        }
        else if (id == 'continue10')
        {
            FadeTo(15);
            jcmp.CallLocalEvent('toggle-controls', true);
            jcmp.HideCursor();
            jcmp.CallLocalEvent('spawn_box');
        }
        else if (id == 'continue11')
        {
            FadeTo(17);
        }
        else if (id == 'continue12')
        {
            FadeTo(19);
        }
        else if (id == 'continue13')
        {
            FadeTo(21);
        }
        else if (id == 'continue14')
        {
            FadeTo(22);
            $('div.fader').fadeOut(FADE_TIME);
        }
        else if (id == 'continue15')
        {
            FadeTo(23);
        }
        else if (id == 'continue16')
        {
            FadeTo(24);
        }
        else if (id == 'continue17')
        {
            FadeTo(25);
        }
        else if (id == 'continue18')
        {
            FadeTo(26);
        }
        else if (id == 'continue19')
        {
            FadeTo(27);
        }
        else if (id == 'continue20')
        {
            FadeTo(28);
        }
        else if (id == 'continue21')
        {
            FadeTo(29);
        }
        else if (id == 'continue22')
        {
            FadeTo(30);
        }
    })

    /**
     * Fades out current one, then fades in new one with class-id
     * @param {*} id 
     */
    function FadeTo(id)
    {
        const parent = _this.parent().parent();
        parent.fadeOut(FADE_TIME, function()
        {
            parent.addClass('hidden');
            $(`div.container.tu-${id}`).removeClass('hidden');
            $(`div.container.tu-${id}`).fadeIn(FADE_TIME);
            _this = $(`div.container.tu-${id}`).find('div.bottom-container').find('*').first();

            const button_time = (DEV_MODE) ? 1 : $(`div.container.tu-${id}`).data('time');

            setTimeout(() => {
                $(`div.container.tu-${id} .button.continue`).show();
            }, button_time);
        })
    }

    // Hover enter disabled confirm button to display tooltip
    $(document).on("mouseenter", ".button", function() 
    {
        jcmp.CallEvent('sound/Play', 'commlink_map_cursor_liberated_region_over_rev.ogg', 0.15);
    })

    // Hover enter disabled confirm button to display tooltip
    $(document).on("click", ".button", function() 
    {
        jcmp.CallEvent('sound/Play', 'comlink_mod_unlock.ogg', 0.15);
    })

    jcmp.AddEvent('got_waypoint', () => 
    {
        jcmp.CallLocalEvent('toggle-controls', false);
        jcmp.ShowCursor();
        FadeTo(11);
        $('div.fader').fadeIn(FADE_TIME);
    })

    jcmp.AddEvent('box_complete', () => 
    {
        jcmp.CallLocalEvent('toggle-controls', false);
        jcmp.ShowCursor();
        FadeTo(16);
    })

    jcmp.AddEvent('inventory_open', () => 
    {
        const parent = _this.parent().parent();
        if (parent.hasClass('tu-17'))
        {
            FadeTo(18);
            $('div.fader').removeClass('sz-indicator');
            $('div.fader').addClass('inventory');
            $('div.fader').fadeIn(FADE_TIME);
        }
    })

    jcmp.AddEvent('equipped_grapple', () => 
    {
        const parent = _this.parent().parent();
        if (parent.hasClass('tu-19'))
        {
            FadeTo(20);
        }
    })

    jcmp.ShowCursor();

    jcmp.CallLocalEvent('toggle-controls', false);
    jcmp.CallLocalEvent('ready');
})
