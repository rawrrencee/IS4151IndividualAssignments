$(document).ready( function() {
    $.ajax({
        url: "http://127.0.0.1:5000/districts",
        method: "GET",
        data: {district: 1},
        contentType: "application/json",
        success: function (answer) {
            console.log(answer);

            if ($.fn.DataTable.isDataTable('#districtTable')) {
                $("#districtTable").DataTable().destroy();
            }
            if (answer.length === 0) {
                $("#districtTableBody").html("");
                $("#districtTableBody").append(
                    `
                  <tr>
                      <td class="text-center" colspan="7">No data available.</td>
                  </tr>
                  `
                );
            } else {
                $("#districtTableBody").html("");
                for (let i = 0; i < answer.length; i++) {
                    $('#districtTableBody').append(
                    `
                    <tr>
                    <td>` + answer[i][1] + `</td>
                    <td>` + answer[i][2] + `</td>
                    <td>` + answer[i][4] + `</td>
                    <td>` + answer[i][5] + `</td>
                    <td>` + answer[i][6] + `</td>
                    <td>` + answer[i][7] + `</td>
                    <td>` + answer[i][8] + `</td>
                    </tr>
                    `
                    )
                }
                if (!$.fn.DataTable.isDataTable('#districtTable')) {
                    var districtTable = $("#districtTable").DataTable({
                        "lengthMenu": [5, 10, 15, 20, 50],
                        "order": [6, 'desc']
                    });
                }
            }
            $('.districtTable thead th').each(function (index, element) {
                var title = $(this).text();
                $(this).append('<input type="text" class="col-search-input" style="width: 100%;" placeholder="Search ' + title + '" />');
            });
            if ($.fn.DataTable.isDataTable('#districtTable')) {
                districtTable.columns().every(function () {
                    var districtTable = this;
                    $('input', this.header()).on('keyup change', function () {
                      if (districtTable.search() !== this.value) {
                        districtTable.search(this.value).draw();
                      }
                    });
                  
                    $('input', this.header()).on('click', function (e) {
                      e.stopPropagation();
                    });
                  });
            }

        }
    })


    $.ajax({
        url: "http://127.0.0.1:5000/events",
        method: "GET",
        data: {district: 1},
        contentType: "application/json",
        success: function (answer) {
            console.log(answer);

            if ($.fn.DataTable.isDataTable('#eventsTable')) {
                $("#eventsTable").DataTable().destroy();
            }
            if (answer.length === 0) {
                $("#eventsTableBody").html("");
                $("#eventsTableBody").append(
                    `
                  <tr>
                      <td class="text-center" colspan="7">No current events in this district available.</td>
                  </tr>
                  `
                );
            } else {
                $("#eventsTableBody").html("");
                for (let i = 0; i < answer.length; i++) {
                    if (answer[i][3] == 1) {
                        $('#eventsTableBody').append(
                            `
                            <tr>
                            <td>` + answer[i][0] + `</td>
                            <td>` + answer[i][1] + `</td>
                            <td>` + answer[i][2] + `</td>
                            <td>` + answer[i][3] + `</td>
                            <td>` + answer[i][4] + `</td>
                            <td><button class="deactivateLocalLD btn btn-sm btn-info" id="deactivateEvent`+ answer[i][3] +`_district` + answer[i][2] + `" type="button" data-deviceId="`+ answer[i][0] + `" data-originDistrict="1" data-district="` + answer[i][2] + `" data-event="`+ answer[i][3] + `"><i class="fa fa-close"></i></button></td>
                            </tr>
                            `
                            )
                    } else {
                        $('#eventsTableBody').append(
                            `
                            <tr>
                            <td>` + answer[i][0] + `</td>
                            <td>` + answer[i][1] + `</td>
                            <td>` + answer[i][2] + `</td>
                            <td>` + answer[i][3] + `</td>
                            <td>` + answer[i][4] + `</td>
                            <td><button disabled class="btn btn-sm btn-info" id="deactivateEvent`+ answer[i][3] +`_district` + answer[i][2] + `" type="button" data-deviceId="`+ answer[i][0] + `" data-district="` + answer[i][2] + `" data-event="`+ answer[i][3] + `"><i class="fa fa-close"></i></button></td>
                            </tr>
                            `
                            )
                    }

                }
                if (!$.fn.DataTable.isDataTable('#eventsTable')) {
                    var eventsTable = $("#eventsTable").DataTable({
                        "lengthMenu": [5, 10, 15, 20, 50],
                        "order": [4, 'desc']
                    });
                }
            }
            $('.eventsTable thead th').each(function (index, element) {
                var title = $(this).text();
                $(this).append('<input type="text" class="col-search-input" style="width: 100%;" placeholder="Search ' + title + '" />');
            });
            if ($.fn.DataTable.isDataTable('#eventsTable')) {
                eventsTable.columns().every(function () {
                    var eventsTable = this;
                    $('input', this.header()).on('keyup change', function () {
                    if (eventsTable.search() !== this.value) {
                        eventsTable.search(this.value).draw();
                    }
                    });
                
                    $('input', this.header()).on('click', function (e) {
                    e.stopPropagation();
                    });
                });
            }
        }
    })
});

$(document).on('click', '.deactivateLocalLD', function() {

    let deviceId = $(this).data("deviceid");
    let originDistrict = $(this).data("origindistrict");
    let district = $(this).data("district");
    let event = $(this).data("event");

    $.ajax({
        url: "http://localhost:5001/deactivateLocalLD",
        method: "POST",
        data: {district: 1},
        contentType: "application/json",
        success: function (answer) {
            console.log(answer);
        }
    });
})

$('#postSampleDataButton').click(function() {
    console.log('button clicked');
    let districtData = [];
    tracker1 = [1000, 'tiget'];
    districtData.push(tracker1);

    $.ajax({
        url: "http://127.0.0.1:5000/addDistrictData",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(districtData),
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