$(document).ready( function() {
    $.ajax({
        url: "http://127.0.0.1:5000/districts",
        method: "GET",
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
                      <td class="text-center" colspan="6">No data available.</td>
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
                    <td>` + answer[i][3] + `</td>
                    <td>` + answer[i][4] + `</td>
                    <td>` + answer[i][5] + `</td>
                    <td>` + answer[i][6] + `</td>
                    <td>` + answer[i][7] + `</td>
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
    })


    $.ajax({
        url: "http://127.0.0.1:5000/events",
        method: "GET",
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
                      <td class="text-center" colspan="6">No data available.</td>
                  </tr>
                  `
                );
            } else {
                $("#eventsTableBody").html("");
                for (let i = 0; i < answer.length; i++) {
                    $('#eventsTableBody').append(
                    `
                    <tr>
                    <td>` + answer[i][0] + `</td>
                    <td>` + answer[i][1] + `</td>
                    <td>` + answer[i][2] + `</td>
                    <td>` + answer[i][3] + `</td>
                    <td>` + answer[i][4] + `</td>
                    </tr>
                    `
                    )
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
    })
});

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