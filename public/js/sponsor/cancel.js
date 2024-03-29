$(function(){
    var locale = $('html').attr('lang');
    $('.confirm-cancel').on('click', function(){
        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: $(this).attr('data-url'),
            data: {
                paymentNo: $('input[name="paymentNo"]').val(),
                last4DigitsOfTel: $('input[name="last4DigitsOfTel"]').val()
            },
            beforeSend: function() {
                $('.errmsg').text('');
                $('.cancel-reservation-confirm').modal('hide');
            }
        }).done(function(data) {
            if (data.success) {
                var html;
                if (locale === 'ja') {
                    html = 
                        '<tr><th>購入番号:</th><td>' + data.reservations[0].payment_no + '</td></tr>'
                        + '<tr><th>タイトル:</th><td>' + data.reservations[0].film_name_ja + '</td></tr>'
                        + '<tr><th>上映時間/場所:</th><td>' + data.reservations[0].performance_start_str_ja + '  ' + data.reservations[0].location_str_ja + '</td></tr>'
                        + '<tr><th>座席</th><td>';
                } else {
                    html = 
                        '<tr><th>Transaction number:</th><td>' + data.reservations[0].payment_no + '</td></tr>'
                        + '<tr><th>Title:</th><td>' + data.reservations[0].film_name_en + '</td></tr>'
                        + '<tr><th>Date/Location:</th><td>' + data.reservations[0].performance_start_str_en + '  ' + data.reservations[0].location_str_en + '</td></tr>'
                        + '<tr><th>Seat</th><td>';
                }

                data.reservations.forEach(function(reservation, index){
                    // html += '<div class="form-group form-class">';
                    html += '<label for="checkbox_reservationIds' + index + '" class="checkbox-inline">'
                    html += '<input type="checkbox" id="checkbox_reservationIds' + index + '" name="reservationIds" value="' + reservation._id + '">' + reservation.seat_code
                    html += '</label>';
                    // html += '</div>';
                });
                html += '</td></tr>';

                $('.table-reservation-confirm').html(html);
                $('.cancel-reservation-confirm').modal();
            } else {
                $('.errmsg').text(data.message);
            }
        }).fail(function(jqxhr, textStatus, error) {
            $('.errmsg').text('Unexpected Error.');
        }).always(function(data) {
        });
    });

    $('.execute-cancel').on('click', function(){
        var reservationIds = $('input[name="reservationIds"]:checked').map(function(){
            return $(this).val();
        }).get();

        if (reservationIds.length === 0) {
            alert('Select seat codes.');
            return;
        }

        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: $(this).attr('data-url'),
            data: {
                reservationIds: JSON.stringify(reservationIds),
                paymentNo: $('input[name="paymentNo"]').val(),
                last4DigitsOfTel: $('input[name="last4DigitsOfTel"]').val()
            },
            beforeSend: function() {
                $('.cancel-reservation-confirm').modal('hide');
            }
        }).done(function(data) {
            if (data.success) {
                $('.cancel-reservation-complete').modal();
            } else {
                alert('キャンセルできませんでした');

            }
        }).fail(function(jqxhr, textStatus, error) {
            alert('キャンセルできませんでした');
        }).always(function(data) {
        });
    });
});