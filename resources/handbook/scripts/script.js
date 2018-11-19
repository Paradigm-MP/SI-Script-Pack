$(document).ready(function() 
{

    document.registerElement('page-tag');


    let open = true;
    let can_open = true;
    //const open_key = 118; // F7

    // These are the HTML pages that will be searched when the user uses the search function
    const search_list = 
    [
        'items/common.html',
        'items/epic.html',
        'items/legendary.html',
        'items/rare.html',
        'items/uncommon.html',
        'help/advancedtactics.html',
        'help/changelog.html',
        'help/howtoplay.html',
        'help/imstuck.html',
        'help/controls.html',
        'gameplay/building.html',
        'gameplay/experience.html',
        'gameplay/general.html',
        'gameplay/loot.html',
        'gameplay/other.html',
        'gameplay/skills.html',
        'gameplay/vehicles.html',
        'gameplay/airdrops.html',
        'feedback/contactthestaff.html',
        'feedback/giveyouropinion.html',
        'feedback/ourdiscord.html',
        'feedback/oursteamgroup.html',
        'feedback/reportanissue.html'
    ]

    const search = 
    {
        active: false,
        total: 0,
        progress: 0,
        results: []
    }


    $('html').css('visibility', 'visible');

    
    // Load our header
    $("#header").load("MY RESOURCE PATH/resources/handbook/content/header.html", function() 
    {
        $.getScript("MY RESOURCE PATH/resources/handbook/scripts/header.js");
    });

    // Load our main page
    $("#content-area").load("MY RESOURCE PATH/resources/handbook/content/main.html", function() 
    {
        
    });

    // Override default link behavior
    // Must use wrapper "html" in .on and then "a" for dynamic content
    $("html").on("click", "a", function(e)
    {
        if (!search.active)
        {
            const page_name = $(this).data("link");
            $("#content-area").load('MY RESOURCE PATH/resources/handbook/content/' + page_name, function() 
            {

            });
            e.preventDefault();
        }
    })

    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        //if (keycode == open_key && can_open)
        //{
        //    ToggleOpen();
        //}
        if (keycode == 13 && $("#search").is(":focus") && open && !search.active) // if they press enter
        {
            ShowSearchUI();

            search.active = true;

            // Reset search progress
            search.progress = 0;
            search.total = search_list.length;

            // Get the search term
            const search_term = $("#search").val().trim().toLowerCase();

            search.results = [];

            // If they didn't just type 'a'
            if (search_term.length > 2)
            {
                // Search through all pages
                for (let i = 0; i < search_list.length; i++)
                {
                    $.get(search_list[i], function(data) 
                    {
                        let data_original = data;

                        let hits = 0;
                        data = data.toLowerCase();

                        let search_index = data.indexOf(search_term);
                        while (search_index > -1)
                        {
                            hits++;
                            data = data.substring(0, search_index) + 
                                data.substring(search_index + search_term.length, data.length);
                            search_index = data.indexOf(search_term)
                        }

                        if (hits > 0)
                        {
                            search.results.push({hits: hits, name: search_list[i], html: data_original});
                        }

                        search.progress++;
                        UpdateSearchProgress();

                    });
                }
            }
            else
            {
                for (let i = 0; i < search_list.length; i++)
                {
                    search.progress++;
                    UpdateSearchProgress();
                }
            }

        }

    };


    $("html").on("click", "div.search-result", function()
    {
        if (!search.active && search.results.length > 0)
        {
            $("#content-area").load(search.results[$(this).attr('data-index')].name, function() 
            {

            });
        }
    })

    /**
     * This function is called when the user presses enter to search the Handbook. 
     * This clears the page and puts the loading UI on the page while it searches.
     */

    function ShowSearchUI()
    {
        $('div.content').empty();
        $('div.content')
            .append($(`<h1 id="searchtext">Searching...</h1>`))
            .append($(`<div class='loader'><div></div></div>`))
    }

    /**
     * This function is called when the search makes more progress.
     */

    function UpdateSearchProgress()
    {
        $('div.loader div').width(`${search.progress / search.total}%`);

        SortSearchResults();

        if (search.progress == search.total)
        {
            $('div.loader div').width(`100%`);

            search.active = false;
            $('div.loader').fadeOut(500, function()
            {
                $('div.loader').remove();
            })

            if (search.results.length > 0)
            {
                $('#searchtext').text(`Results found!`);
                for (let i = 0; i < search.results.length; i++)
                {
                    const name = search.results[i].html.substring(7, search.results[i].html.indexOf(`</title>`));
                    $('div.content')
                        .append($(`<div data-index='${i}' class='search-result'></div>`)
                            .text(name))
                }
            }
            else
            {
                $('#searchtext').text(`No results found. :(`);
            }

        }
    }

    /**
     * This function sorts search results, if there are any. Called every time a page is processed.
     */

    function SortSearchResults()
    {
        if (search.results.length < 2)
        {
            return;
        }

        for (let i = 0; i < search.results.length; i++)
        {
            for (let j = 0; j < search.results.length; j++)
            {
                if (search.results[j].hits < search.results[i].hits)
                {
                    let temp_data = search.results[j];
                    search.results[j] = search.results[i];
                    search.results[i] = temp_data;
                }
            }
        }
    }


    $(window).on('resize', function()
    {
        $('div.content').css('max-height', $('div.content').parent().height() - $('#header').height());
    })

    setInterval(function() 
    {
        if (open)
        {
            $('div.content').css('max-height', $('div.content').parent().height() - $('#header').height());
        }
        
    }, 1000);

    /*function ToggleOpen()
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
        jcmp.CallEvent('handbook/ToggleOpen', open);
    }*/

    jcmp.AddEvent('handbook/ToggleEnabled', (enabled) => 
    {
        can_open = enabled;
    })

    jcmp.CallEvent('handbook/ToggleOpen', open);

    //jcmp.CallEvent('handbook/Ready');

})