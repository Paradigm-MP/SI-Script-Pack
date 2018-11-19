$(document).ready(function() 
{
    let timeout = null;
    let load_time;
    const adaptive_loading = true; // Whether or not we want to use adaptive loading for terrain loading

    const total_packages_needed = 
    {
        before_login: 3,
        after_login: 17
    }

    let total_packages_loaded = 0;
    let logged_in = false;
    let completed = false;

    let tips_inverval;
    let current_tip = -1;
    let visible = false;
    let desync = false;

    const tips = 
    [
        'The safezone is a safe area for trading and hanging out.',
        `The safezone's borders are indicated by yellow circles.`,
        `The neutralzone's borders are invisible, but end at the outer limits of the city.`,
        'The safezone is surrounded by the neutralzone, an area where you do not lose items or experience on death.',
        'The neutralzone is an area where you do not lose items or experience on death.',
        'Legendary tier items can only be found in airdrops.',
        `Use '/w name' and hit tab to autocomplete to whisper to someone in chat.`,
        `Use '@name' and hit tab to autocomplete to mention someone in chat.`,
        'Drop items in chat by CTRL + right clicking them.',
        'Use the different tabs in chat for your different needs.',
        'The Log tab in chat shows important system messages, like death drops.',
        'Press G to open your inventory.',
        'Press T to open the chat.',
        'Press F5 to show/hide chat.',
        'Press H to view the Handbook, a place with lots of helpful information.',
        'Press F8 to open the Private Messages menu.',
        'Click the lock in the inventory to unlock a category and reorganize it.',
        'Always watch for announcements from Administrators.',
        'Type /clear to clear the chat.',
        'Type /suicide to die without losing any items or experience.',
        'Hover over names and tags in chat to get more information.',
        'You can join our Discord by pressing F4.',
        'You can join our Steam Group at https://steamcommunity.com/groups/SI-JCMP',
        'Got a bug? Found an issue? Tell us in Discord by pressing F4.',
        'Got a suggestion? Tell us in Discord by pressing F4.',
        'Got a cool screenshot? Share it with us in Discord by pressing F4.',
        `Want to set up a trade while you're not on the server? Use our Discord by pressing F4.`,
        'Your hunger and thirst is shown in the top right corner in the Survival HUD.',
        'Your health is shown in the top right corner in the Survival HUD.',
        'Your current experience and level is shown in the top right corner in the Survival HUD.',
        'You can minimize/maximize the Survival HUD by clicking the arrow in the top right corner.',
        'You can suggest ideas to us in our Steam Group at https://steamcommunity.com/groups/SI-JCMP',
        'You can SHIFT + click a stack in your inventory to change what item appears on top.',
        'Right click items to drop them, and close your inventory with G to confirm drop.',
        'There are four categories of items: Cosmetics, Weaponry, Utility, and Survival.',
        'Cosmetics are rare, wearable items, such as hats.',
        'Backpacks can increase the maximum slots available in your inventory.',
        'Levelling up increases the maximum slots available in your inventory.',
        `If you are selling something, start your message with 'WTS', which means 'Want To Sell'.`,
        `If you are buying something, start your message with 'WTB', which means 'Want To Buy'.`,
        'Suggest a loading tip in our Discord by pressing F4.',
        `Reply to whispers with '/r'`,
        'Some items take a few seconds to use, such as healing items like Medkits.',
        'Vehicles can be found in most cities.',
        'Press F6 to open the vehicles menu.',
        'To purchase a vehicle, make sure you have enough Bavarium and then enter it.',
        `If you can't enter a vehicle, it means that you don't own it, have enough Bavarium to buy it, or already have too many vehicles.`,
        'Every vehicle has built in storage. To access it, open your inventory inside of the vehicle.',
        `To drop items in a vehicle's storage, simply drop items normally while in a vehicle and they will go into the vehicle's storage.`,
        'If you enter an owned vehicle, you will steal the vehicle for yourself and be able to claim any items inside.',
        'You can join our Facebook page at https://www.facebook.com/SurvivalIslandJC3MP/',
        'If you encounter an issue, please report it using /report',
        'If you see harassment, please report it using /report',
        'If you encounter a problem, please report it using /report',
        'If you have an issue, please report it using /report',
        'If you see evidence of cheating, please report it using /report',
        'If you have concerns about the server, please tell us using /report',
        'Stuck loading? Disconnect from the server and then reconnect.',
        `Don't forget to favorite us by clicking the heart icon next to us in the server browser!`,
        `You can see all online players by opening the player list with P.`,
        `You can friend other players by using the player list with P.`,
        `Loot can be found all around the place. Try looking in corners or bushes.`,
        `Better loot is harder to find. Try looking in places you normally wouldn't go.`,
        `Better loot is usually found on the tops of buildings. Try grappling up and looking around.`,
        `Press F7 to open the storages menu.`
    ]

    $('div.tips').fadeOut(1);
    $('div.bar-loader').fadeOut(1);

    Show();

    function UpdatePackagesLoaded(name)
    {
        if ($('div.bar-loader').css('display') == 'none' || $('div.bar-loader').css('opacity') < 0.9)
        {
            setTimeout(function() 
            {
                UpdatePackagesLoaded();
            }, 500);
            return;
        }

        total_packages_loaded += 1;

        console.log(`Loaded package ${name}`);

        let percent = Math.floor(total_packages_loaded / total_packages_needed.before_login * 100);

        if (logged_in) {percent = Math.floor(total_packages_loaded / total_packages_needed.after_login * 100);}

        $('div.bar-loader>div.inside').css('transform', `translateX(${percent - 100}%)`);

        const options = 
        {
            useEasing: false,
            useGrouping: true, 
            separator: ',', 
            decimal: '.'
        }
        const counter = new CountUp('percent', parseInt($('#percent').text()), percent, 0, 0.75, options);
        counter.start();

        if (percent == 100)
        {
            setTimeout(function() 
            {
                $('div.bar-loader').fadeOut(1000);
                completed = true;

                setTimeout(function() {
                    
                    const counter2 = new CountUp('percent', 0, 0, 0, 0, options);
                    counter2.start();
                }, 1000);
            }, 2000);

        }

        setTimeout(function() 
        {
            jcmp.CallEvent('load/package_load_delay');
        }, 3000);
    }

    function Show()
    {
        $('div.loader').css('animation', 'spin 3s linear infinite');

        if (!logged_in)
        {
            setTimeout(() => 
            {
                if (!logged_in && visible) // If the loader is still showing after 15 seconds while not logged in, they desynced
                {
                    desync = true;

                    clearInterval(tips_inverval);

                    $('div.tips').fadeOut(500, function() 
                    {
                        $('#tiptext').text(`Uh oh! It looks like something went wrong! Try reconnecting to fix the issue. If the problem 
                        persists, contact an Admin on Discord at discord.paradigm.mp`);
                        $('div.tips').fadeIn(500);
                    });
                }
            }, 30000);
        }

        $('svg.progress>circle.fill').css('transition', 'none');
        $('svg.progress>circle.fill').css('stroke-dashoffset', '78.226vh');

        visible = true;
        $("div.bg").stop(true); // Stop all current and queued animations
        $("div.bg").show(1);

        if (typeof jcmp != 'undefined')
        {
            jcmp.CallEvent('load/ToggleFrozen', true);
            //jcmp.CallEvent('load/ToggleControl', false);
        }

        if (total_packages_loaded > -1 && $('div.bar-loader').css('display') == 'none' && !completed)
        {
            $('div.bar-loader').stop(true);
            $('div.bar-loader').fadeOut(1);
            setTimeout(function() 
            {
                $('div.bar-loader').fadeIn(1000);
            }, 500);
        }

        if (timeout != null)
        {
            timeout = null;
        }

        $('div.graphic').css(
        {
            'animation': 'grow 0.75s ease-in-out 1',
            'visibility': 'visible'
        })

        if (tips_inverval != null)
        {
            return;
        }

        setTimeout(function() 
        {
            if (tips_inverval != null || !visible) 
            {
                clearInterval(tips_inverval); 
                tips_inverval = null; 
                return;
            }

            GetRandomTipIndex();

            if ($('div.tips').css('display') == 'none')
            {
                $('div.tips').fadeOut(500, function() 
                {
                    $('#tiptext').text(tips[current_tip]);
                    $('div.tips').fadeIn(500);
                });
            }

            if (!visible) {return;}

            tips_inverval = setInterval(function() 
            {
                if (!visible || desync) {return;}
                
                $('div.tips').fadeOut(500, function()
                {
                    GetRandomTipIndex();

                    setTimeout(() => 
                    {
                        if (!visible || desync) {return;}

                        $('#tiptext').text(tips[current_tip]);
                        $('div.tips').fadeIn(500);
                    }, 4000);
                });
            }, 15000);
        }, 3000);

    }

    function Hide()
    {
        visible = false;

        if (tips_inverval != null)
        {
            clearInterval(tips_inverval);
            tips_inverval = null;
        }

        $('div.bar-loader').stop(true);
        $('div.bar-loader').fadeOut(1000);

        timeout = setTimeout(function() 
        {
            $("div.bg").stop();

            $('div.tips').stop();
            $('div.tips').fadeOut(500);
            
            $('div.graphic').css(
            {
                'animation': 'shrink 0.76s ease-in-out 1'
            })

            setTimeout(function() 
            {
                $('div.graphic').css(
                {
                    'visibility': 'hidden',
                    'animation': 'none'
                })

                $('div.loader').css('animation', 'none');

                //jcmp.CallEvent('load/ToggleControl', true);
            }, 750);

            setTimeout(function() 
            {
                jcmp.CallEvent('load/ToggleFrozen', false);
            }, 250);
            
            $('div.bg').fadeOut(1000, function() 
            {

            });
            
            timeout = null;
        }, 1000);

    }

    function GetRandomTipIndex()
    {
        const old_tip = current_tip;

        while (current_tip == old_tip)
        {
            current_tip = Math.floor(tips.length * Math.random());
        }
    }

    jcmp.AddEvent('load/package_loaded', (name) => 
    {
        UpdatePackagesLoaded(name);
    })

    jcmp.AddEvent('load/Show', () => 
    {
        Show();
    });

    jcmp.AddEvent('load/Hide', () => 
    {
        Hide();
    });

    jcmp.AddEvent('load/GameTeleportInitiated', () => 
    {
        load_time = new Date().getMilliseconds();
        jcmp.CallEvent('load/increase_load');
        if (timeout != null) {clearTimeout(timeout);}
    })

    jcmp.AddEvent('load/GameTeleportCompleted', () => 
    {
        // "Adaptive Loading"
        if (timeout != null) {clearTimeout(timeout);}
        let diff = new Date().getMilliseconds() - load_time;
        diff = Math.max(6000, (diff + 300) * 52 + 1500);

        if (!adaptive_loading)
        {
            diff = 1000;
        }

        $('svg.progress>circle.fill').css('transition', `stroke-dashoffset ${diff / 1000}s linear`);
        $('svg.progress>circle.fill').css('stroke-dashoffset', '0');

        setTimeout(function() 
        {
            if (timeout != null) {clearTimeout(timeout);}
            jcmp.CallEvent('load/decrease_load');
            //jcmp.CallEvent('load/ToggleControl', true);
        }, diff);
    })

    jcmp.AddEvent('load/reset2', () => 
    {
        logged_in = true;
        completed = false;
        total_packages_loaded = 0;

        $('div.bar-loader>div.inside').css('transform', `translateX(-100%)`);
        $('#percent').text('0');
    })

    setTimeout(function() 
    {
        jcmp.CallEvent('load/uiready');
    }, 1000);
    
})