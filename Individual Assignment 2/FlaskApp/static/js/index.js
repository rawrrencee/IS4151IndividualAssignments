$(document).ready( function() {
    $.ajax({
        url: "http://127.0.0.1:5000/district",
        method: "GET",
        cache: false,
        contentType: false,
        processData: false,
        dataType: "json",
        success: function (answer) {
            console.log(answer);
        }
    })
});

$(document).ajaxStart(function () {
    $("#loading").show();
});

$(document).ajaxStop(function () {
    $("#loading").hide();
});

$(document).ready(function () {
    $("#loading").hide();
});