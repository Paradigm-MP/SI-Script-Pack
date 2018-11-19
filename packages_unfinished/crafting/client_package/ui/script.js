$(document).ready(function() 
{

    let open_key = 67; // C - temporary for testing
    let open = true;
    let can_open = false;
    // TODO close by E because it opens by E
    $('div.tooltip').hide();

    if (!open)
    {
        $('html').fadeOut(1);
    }

    $('div.middle.craft-advanced').hide();
    $('div.middle.craft').hide();
    $('div.button.mode.advanced').hide();
    $('div.inventory-view').hide();
    
    $('html').css('visibility', 'visible');

    
    // Click decraft mode button
    $(".right-container").on("click", "div.button.decraft", function()
    {
        if (!$(this).hasClass('selected'))
        {
            // hide crafting ui, show decrafting ui
            $(this).addClass('selected');
            $('div.right-container div.button.craft').removeClass('selected');

            
            $('div.middle.craft').hide();
            $('div.middle.craft-advanced').hide();
            $('div.middle.decraft').show();

            if ($('div.right-container div.button.mode.advanced').hasClass('selected'))
            {
                $('div.right-container div.button.mode.advanced').removeClass('selected');
                $('div.right-container div.button.mode.basic').addClass('selected');
            }
            
            $('div.button.mode.advanced').hide();
        }
    });

    // Click craft mode button
    $(".right-container").on("click", "div.button.craft", function()
    {
        if (!$(this).hasClass('selected'))
        {
            // hide decrafting ui, show crafting ui
            $(this).addClass('selected');
            $('div.right-container div.button.decraft').removeClass('selected');

            
            $('div.middle.decraft').hide();
            $('div.middle.craft').show();
            $('div.middle.craft-advanced').hide();
            $('div.button.mode.advanced').show();
        }
    });


    // Click basic mode button
    $(".right-container").on("click", "div.button.mode.basic", function()
    {
        if (!$(this).hasClass('selected'))
        {
            // hide advanced crafting ui, show basic crafting ui
            $(this).addClass('selected');
            $('div.right-container div.button.mode.advanced').removeClass('selected');


            $('div.middle.decraft').hide();
            $('div.middle.craft').show();
            $('div.middle.craft-advanced').hide();
        }
    });

    // Click advanced mode button
    $(".right-container").on("click", "div.button.mode.advanced", function()
    {
        if (!$(this).hasClass('selected'))
        {
            // hide ui, show advanced crafting ui
            $(this).addClass('selected');
            $('div.right-container div.button.mode.basic').removeClass('selected');

            $('div.middle.decraft').hide();
            $('div.middle.craft').hide();
            $('div.middle.craft-advanced').show();

            if ($('div.right-container div.button.decraft').hasClass('selected'))
            {
                $('div.right-container div.button.decraft').removeClass('selected');
                $('div.right-container div.button.craft').addClass('selected');
            }
        }
    });


    // Click combiner view button
    $("div.middle.craft-advanced").on("click", "div.button.advanced-view.combiner", function()
    {
        if (!$(this).hasClass('selected'))
        {
            $(this).addClass('selected');
            $('div.middle.craft-advanced>div.button.advanced-view.inventory').removeClass('selected');
            $('div.middle.craft-advanced>div.combiner-view').show();
            $('div.middle.craft-advanced>div.inventory-view').hide();
        }
    })

    // Click inventory view button
    $("div.middle.craft-advanced").on("click", "div.button.advanced-view.inventory", function()
    {
        if (!$(this).hasClass('selected'))
        {
            $(this).addClass('selected');
            $('div.middle.craft-advanced>div.button.advanced-view.combiner').removeClass('selected');
            $('div.middle.craft-advanced>div.inventory-view').show();
            $('div.middle.craft-advanced>div.combiner-view').hide();
        }
    })


    // use notifications presets: craft, craft_advanced, decraft


    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key && can_open)
        {
            ToggleOpen();
        }

    };

    function ToggleOpen()
    {
        open = !open;
        if (open) 
        {
            $('html').css('visibility', 'visible');
            $('html').fadeIn("fast");
            jcmp.ShowCursor(); 
        } 
        else 
        {
            $('html').fadeOut("fast", function() {$('html').css('visibility', 'hidden');});
            jcmp.HideCursor();
        }
        jcmp.CallEvent('crafting/ToggleOpen', open);
    }

    jcmp.AddEvent('crafting/Enable', () => {
        can_open = true;
    })

    jcmp.CallEvent('crafting/Ready');

})
