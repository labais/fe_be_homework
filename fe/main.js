$(document).ready(function () {

    const datatable = $('#main-data').FillRawData().DataTable({
        initComplete: function () {

            const filterNameColId = $('#main-data thead th').length - 2;
            const filterVariantColId = $('#main-data thead th').length - 1;

            $('input#filter-name').on('keyup click', function () {
                datatable.column(filterNameColId).search(this.value).draw();
            });
            $('input#filter-variant').on('keyup click', function () {
                datatable.column(filterVariantColId).search(this.value).draw();
            });

            setTimeout(() => {
                datatable.column(filterNameColId).visible(false); // hide search-data columns
                datatable.column(filterVariantColId).visible(false);
            }, 1);


            $('#main-data_filter').hide(); // original search must be enabled for custom searches to work (but users is not supposed to use it)

            this.api().columns().every(function (id) {
                if (id == 0) return;
                const title = $(this.column(id).header()).text();
                $('#hidden-sensors ul').append(`<li hidden><button class="add-column fbutton" data-col-id="${id}" title="add column">${title}</button></li>`)
                $(this.column(id).header()).append(`<button class="remove-column fbutton" data-col-id="${id}" title="Hide column">X</button>`);
            });

        }
    });

    $('table').on('click', '.remove-column', function () {
        toggleColumn($(this).data('col-id'), false);
    });

    $('#hidden-sensors').on('click', '.add-column', function () {
        toggleColumn($(this).data('col-id'), true);
    });

    const toggleColumn = (id, on) => {
        datatable.column(id).visible(on);
        $(`#hidden-sensors button[data-col-id=${id}]`).parent().toggle(!on);
        $('#hidden-sensors-heading').toggle($('#hidden-sensors button:visible').length > 0);
    };
    $('#hidden-sensors-heading').toggle(false);

});


$.fn.FillRawData = function FillRawData() {

    const metricColumns = {}; // lookup table: metricsID => eq in data table
    const colNames = [];
    for (const [i, data] of Object.entries(metricsData.data.items)) {
        metricColumns[data.id] = i;

        let unitName = '';
        data.units.forEach(unit => {
            if (unit.selected) {
                unitName = unit.name;
            }
        });

        unitName = !unitName ? '(not stated)' : unitName;
        colNames.push(data.name + ` <span class="unit-name">${unitName}</span>`);
    }

    this.find('thead tr').append(colNames.reduce((prev, current) =>
        `${prev}<th>${current}</th>`, ''
    ));

    this.find('thead tr').append('<th>hidden sensor name</th><th>hidden sensor variant</th>'); // 2 more invisible cols for searching


    for (const [id, sData] of Object.entries(sensorsData)) {
        const sensorName = sData.name.length > 0 ? sData.name : `[unnamed-${id}]`;
        const sensorVariantName = (sensorTypesData[sData.type][sData.variant]?.name ?? '[unknown variant]').replace(' ', '&nbsp;');
        const sensorFullName = `${sensorName} ${sensorVariantName}`

        const columns = [];
        for (const [id, eq] of Object.entries(metricColumns)) {
            columns.push('-'); // create empty cols for all metrics
        }

        for (const [mId, mData] of Object.entries(sData.metrics)) {
            columns[metricColumns[mId]] = mData.v; // overwrite date in relevant metrics columns
        }

        const metricsColumnsHtml = columns.reduce((prev, current) =>
            `${prev}<td>${current}</td>`, ''
        );

        this.find('tbody').append(`<tr><td>${sensorFullName}</td>${metricsColumnsHtml}<td>${sensorName}</td><td>${sensorVariantName}</td></tr>`);
    }

    return this;
}

