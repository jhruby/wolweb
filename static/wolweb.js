$(document).ready(function () {

    jQuery.showSnackBar = function (data) {

        $('#snackbar').text(data.message);
        if (data.error != null) {
            $('#snackbar').addClass('alert-danger');
            $('#snackbar').removeClass('alert-success')
        } else {
            $('#snackbar').removeClass('alert-danger')
            $('#snackbar').addClass('alert-success')
        }
        $('#snackbar').show();

        // After 2 seconds, hide the Div Again
        setTimeout(function () {
            $('#snackbar').hide();
        }, 2000);
    };

    jQuery.wakeUpDeviceByName = function (deviceName) {
        $.ajax({
            type: "GET",
            url: vDir + "/wake/" + deviceName,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                $.showSnackBar(data);
            },
            error: function (data, err) {
                $.showSnackBar(data);
                console.error(data);
            }
        })
    };

    getAppData();

});

function getAppData() {

    $.getJSON(vDir + "/data/get", function (data) {
        window.appData = data;
        if (!appData.devices) {
            appData.devices = [];
        }
        renderData();
    }).fail(function (data) {
        alert("Error: Problem with getting approver information.");
    });

}

function renderData() {

    var BSControl = function (config) {
        jsGrid.ControlField.call(this, config);
    };

    BSControl.prototype = new jsGrid.ControlField({

       
    });

    jsGrid.fields.bscontrol = BSControl;

    var gridFields = [];
    var gridWidth = "700px";

    gridFields.push({ name: "name", title: "Počítač", type: "text", width: 150, validate: { validator: "required", message: "Device name is a required field." } });
    gridFields.push({ name: "mac", title: "MAC Adresa", type: "text", width: 120, validate: { validator: "pattern", param: /^[0-9a-f]{1,2}([\.:-])(?:[0-9a-f]{1,2}\1){4}[0-9a-f]{1,2}$/gmi, message: "MAC Address is a required field." } });
    gridFields.push({
        name: "command", type: "control", width: 125, modeSwitchButton: false,
        itemTemplate: function (value, item) {
            return $("<button>").addClass("btn btn-primary btn-sm")
                .attr({ type: "button", title: "Vzbudit počítač" })
                .html("<i class=\"fas fa-bolt\"></i>VZBUDIT")
                .on("click", function () {
                    $.wakeUpDeviceByName(item.name)
                });
        },
        editTemplate: function (value, item) { return "" },
        insertTemplate: function () { return "" }
    });
   

    $("#GridDevices").jsGrid({
        height: "auto",
        width: "auto",
        updateOnResize: true,
        editing: false,
        inserting: false,
        sorting: false,
        confirmDeleting: true,
        deleteConfirm: "Are you sure you want to delete this Device?",
        data: appData.devices,
        fields: gridFields,
        rowClick: function (args) {
            args.cancel = true;
        },
        onItemInserted: saveInsertedData,
        onItemDeleted: saveAppData,
        onItemUpdated: saveAppData
    });


}

function saveAppData() {

    $.ajax({
        type: "POST",
        url: vDir + "/data/save",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(appData),
        success: function (data) {
            $.showSnackBar(data);
        },
        error: function (data, err) {
            $.showSnackBar(data);
            console.error(data);
        }
    });

}

function saveInsertedData() {

    saveAppData();
    $(".device-insert-button").click();

}
