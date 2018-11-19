$(document).ready(function() 
{

    $(document).find('div.dropdown-content').hide();

    $('div.dropdown').mouseenter(function() 
    {
        const width = $(this).find('div.dropdown-content').width();

        $(this).find('div.dropdown-content').css(
        {
            'top': $(this).offset().top + $(this).height(),
            'left': $(this).offset().left + $(this).width() / 2 - width / 2,
            'visibility': 'visible'
        });

        $(this).find('div.dropdown-content').show("fade", { direction: "up" }, 200, function() 
        {
            
        });
    });

    $('div.dropdown').mouseleave(function() 
    {
        $(this).find('div.dropdown-content').hide("fade", { direction: "up" }, 200, function() 
        {
            
        });
    });

})