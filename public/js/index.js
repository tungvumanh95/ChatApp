
$(document).on('mousedown', '.left .person', function(e) {
    if ($(this).hasClass('.active')) {
        return false;
    } else {
        var findChat = $(this).attr('data-chat');
        var personName = $(this).find('.name').text();
        $('.right .top .name').html(personName);
        if ($('.active-chat').css('display') == 'block') {
            $('.active-chat').css('display', 'none');
        }
        $('.active-chat').removeClass('active-chat');
        $('.left .person').removeClass('active');
        $(this).addClass('active');
        var $chatBox = $('.chat[data-chat = '+findChat+']');
        $chatBox.addClass('active-chat');
        var scroll = $(this).data('scroll');
        if ($chatBox.data('scroll') == 'true') {
            $chatBox.css('display', 'block');
        }
    }
});