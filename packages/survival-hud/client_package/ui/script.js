$(document).ready(function() 
{

    let open = false;
    const low_threshold = 15;
    let health = 100;
    let low_arrow = 0;

    const offset = 118; // 2 * pi * r
    // also change CSS at bottom

    $('html').css('visibility', 'visible');

    // Show actual percents on mouse over
    $(document).on('mouseenter', 'div.section', function()
    {
        if (open)
        {
            $(this).find('.replace-svg').css('visibility', 'hidden');
            $(this).find('.level').css('visibility', 'hidden');
            $(this).find('.level-text').css('visibility', 'hidden');
            $(this).find('.percent').css('visibility', 'visible');
        }
    })

    $(document).on('mouseleave', 'div.section', function()
    {
        $(this).find('.replace-svg').css('visibility', 'visible');
        $(this).find('.level').css('visibility', 'visible');
        $(this).find('.level-text').css('visibility', 'visible');
        $(this).find('.percent').css('visibility', 'hidden');
    })

    $(document).on('click', 'div.toggle', function()
    {
        const visible = $('div.arrow').hasClass('right');
        $('div.section').stop();

        if (visible)
        {
            $('div.arrow').removeClass('right').addClass('left');
            $('div.section').animate({opacity: 0}, 250);
        }
        else
        {
            $('div.arrow').removeClass('left').addClass('right');
            $('div.section').animate({opacity: 1}, 250);
        }
        UpdateArrow();
    })

    jcmp.AddEvent('survival-hud/ui/grapple_toggle', (toggled) => 
    {
        setTimeout(() => {
            if (toggled) { $('div.section.grapplehook').removeClass('hidden'); }
            else { $('div.section.grapplehook').addClass('hidden'); }
        }, 500);
    })

    jcmp.AddEvent('survival-hud/ui/para_toggle', (toggled) => 
    {
        setTimeout(() => {
            if (toggled) { $('div.section.parachute').removeClass('hidden'); }
            else { $('div.section.parachute').addClass('hidden'); }
        }, 500);
    })

    jcmp.AddEvent('survival-hud/ui/wingsuit_toggle', (toggled) => 
    {
        setTimeout(() => {
            if (toggled) { $('div.section.wingsuit').removeClass('hidden'); }
            else { $('div.section.wingsuit').addClass('hidden'); }
        }, 500);
    })

    jcmp.AddEvent('survival-hud/ui/update_equipped', (stack) => 
    {
        stack = JSON.parse(stack);

        let equipped = false;
        let item_name = '';

        for (let i = 0; i < stack.contents.length; i++)
        {
            item_name = stack.contents[i].name;
            equipped = equipped || stack.contents[i].equipped;

            const new_percent = Math.ceil((stack.contents[i].durability / stack.contents[i].max_durability) * 100);
            if (stack.contents[i].equipped && (stack.contents[i].name == 'Grapplehook' || stack.contents[i].name == 'DuraGrapple'))
            {
                $('div.section.grapplehook svg.progress circle.fill').css("stroke-dashoffset", (1 - new_percent / 100) * offset);
                $('div.section.grapplehook .percent').text(`${new_percent}%`);
            }
            else if (stack.contents[i].equipped && (stack.contents[i].name == 'Parachute'))
            {
                $('div.section.parachute svg.progress circle.fill').css("stroke-dashoffset", (1 - new_percent / 100) * offset);
                $('div.section.parachute .percent').text(`${new_percent}%`);
            } 
            else if (stack.contents[i].equipped && (stack.contents[i].name == 'Wingsuit'))
            {
                $('div.section.wingsuit svg.progress circle.fill').css("stroke-dashoffset", (1 - new_percent / 100) * offset);
                $('div.section.wingsuit .percent').text(`${new_percent}%`);
            }
        }
        
        if (item_name == 'Grapplehook' || item_name == 'DuraGrapple')
        {
            if (equipped) { $('div.section.grapplehook').removeClass('hidden'); }
            //else { $('div.section.grapplehook').addClass('hidden'); }
        }
        else if (item_name == 'Parachute')
        {
            if (equipped) { $('div.section.parachute').removeClass('hidden'); }
            //else { $('div.section.parachute').addClass('hidden'); }
        } 
        else if (item_name == 'Wingsuit')
        {
            if (equipped) { $('div.section.wingsuit').removeClass('hidden'); }
            //else { $('div.section.wingsuit').addClass('hidden'); }
        }

    })

    jcmp.AddEvent('survival-hud/update_health', (percent) => 
    {
        percent = (percent < 0) ? 0 : percent;
        
        let new_percent = Math.ceil(percent * 100);
        if (health == new_percent)
        {
            return;
        }
        
        health = new_percent;

        $('div.section.health svg.progress circle.fill').css("stroke-dashoffset", (1 - new_percent / 100) * offset);
        $('div.section.health .percent').text(`${new_percent}%`);

        // Make icon flash red if low
        if (new_percent < low_threshold && !$('div.section.health svg').hasClass('low'))
        {
            $('div.section.health svg').addClass('low');
            low_arrow += 1;
        }
        else if (new_percent >= low_threshold && $('div.section.health svg').hasClass('low'))
        {
            $('div.section.health svg').removeClass('low');
            low_arrow -= 1;
        }
        UpdateArrow();
    })

    jcmp.AddEvent('survival-hud/Toggle', (o) => 
    {
        open = o;
        if (!open)
        {
            $('.section').find('svg').css('visibility', 'visible');
            $('.section').find('.level').css('visibility', 'visible');
            $('.section').find('.percent').css('visibility', 'hidden');
        }
    })

    // When exp/level changes
    jcmp.AddEvent('character/exp/exp_change', (exp) => 
    {
        exp = JSON.parse(exp);

        const percent = Math.floor((exp.experience / exp.max) * 100);
        $('div.section.level svg.progress circle.fill').css("stroke-dashoffset", (1 - percent / 100) * offset);
        $('div.section.level .level').text(exp.level);
        $('div.section.level .percent').text(`${percent}%`);

    })

    // When hunger changes
    jcmp.AddEvent('survival-hud/update_hunger', (hunger) => 
    {
        const percent = Math.floor((hunger / 100) * 100);
        $('div.section.hunger svg.progress circle.fill').css("stroke-dashoffset", (1 - percent / 100) * offset);
        $('div.section.hunger .percent').text(`${percent}%`);

        // Make icon flash red if low
        if (percent < low_threshold && !$('div.section.hunger svg').hasClass('low'))
        {
            $('div.section.hunger svg').addClass('low');
            low_arrow += 1;
        }
        else if (percent >= low_threshold && $('div.section.hunger svg').hasClass('low'))
        {
            $('div.section.hunger svg').removeClass('low');
            low_arrow -= 1;
        }
        UpdateArrow();
    })

    // When thirst changes
    jcmp.AddEvent('survival-hud/update_thirst', (thirst) => 
    {
        const percent = Math.floor((thirst / 100) * 100);
        const new_class = `c100 p${percent} progress`;
        $('div.section.thirst .percent').text(`${percent}%`);
        $('div.section.thirst svg.progress circle.fill').css("stroke-dashoffset", (1 - percent / 100) * offset);

        // Make icon flash red if low
        if (percent < low_threshold && !$('div.section.thirst svg').hasClass('low'))
        {
            $('div.section.thirst svg').addClass('low');
            low_arrow += 1;
        }
        else if (percent >= low_threshold && $('div.section.thirst svg').hasClass('low'))
        {
            $('div.section.thirst svg').removeClass('low');
            low_arrow -= 1;
        }
        UpdateArrow();
    })

    function UpdateArrow()
    {
        if (low_arrow > 0 && !$('div.arrow').hasClass('low-arrow') && $('div.arrow').hasClass('left'))
        {
            $('div.arrow').addClass('low-arrow');
        }
        else if ((low_arrow == 0 && $('div.arrow').hasClass('low-arrow')) 
            || ($('div.arrow').hasClass('low-arrow') && $('div.arrow').hasClass('right')))
        {
            $('div.arrow').removeClass('low-arrow');
        }
    }

    
    $('div.sz-container').hide();

    jcmp.AddEvent('safezone/ui/ToggleEnabled', (enabled) => 
    {
        if (enabled)
        {
            $('span.sz-title').text('In Safezone');
            $('span.sz-subtitle').text('You cannot take damage here');
            $('div.sz-container').show();
        }
        else
        {
            $('div.sz-container').hide();
        }
    })

    jcmp.AddEvent('neutralzone/ui/ToggleEnabled', (enabled) => 
    {
        if (enabled)
        {
            $('span.sz-title').text('In Neutralzone');
            $('span.sz-subtitle').text('You cannot lose items or exp here');
            $('div.sz-container').show();
        }
        else
        {
            $('div.sz-container').hide();
        }
    })

    jcmp.AddEvent('safezone/ui/set_hidden', (hidden) => 
    {
        if (hidden) {$('div.sz-container').hide();}
        else {$('div.sz-container').show();}
    })

    jcmp.CallEvent('safezone/ui/loaded');
    jcmp.CallEvent('survival-hud/Ready');

})
