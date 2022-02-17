const {dbConnect} = require('./dbConnect')

const db = dbConnect((err) => {
    console.error(err.message);
    resp.status(400).json(err.message);
});

exports.getNewest = function getNewest(req, resp) {
    console.log("@ getAranetData()");

    db.all(`SELECT MAX(rtime) as rtime,
                   sensors.sensor_id,
                   name,
                   metric_name,
                   unit_name,
                   rvalue
            FROM measures
                     JOIN sensors ON sensors.sensor_id = measures.sensor_id
                     JOIN metrics ON metrics.metric_id = measures.metric_id
                     JOIN units ON units.unit_id = metrics.metric_id
            GROUP BY measures.sensor_id
    `, (err, rows) => {
        if (err) {
            console.error(err.message);
            resp.status(500).json(err.message);
        } else {

            const results = [];
            rows.forEach(function (e) {
                results.push({
                    sensorId: e.sensor_id,
                    sensorName: e.name,
                    metric: e.metric_name,
                    unitName: e.unit_name,
                    rvalue: e.rvalue,
                    rtime: e.rtime,
                });
            });
            resp.status(200).setHeader('Content-Type', 'application/json').json(results);
        }
    });

}

exports.getMinMax = function getNewest(req, resp, reqDate) {
    console.log("@ getMinMax()");

    const actualDate = new Date(Date.parse(reqDate));
    const timeString = actualDate.getFullYear() + '-' + ('0' + (actualDate.getMonth() + 1)).slice(-2) + '-' + ('0' + actualDate.getDate()).slice(-2);

    db.all(`SELECT minmax.*, metric_name, unit_name
            FROM (
                     SELECT 'max' AS type, MAX(rvalue) AS rvalue, *
                     FROM measures
                              JOIN sensors ON sensors.sensor_id = measures.sensor_id
                     WHERE rtime LIKE '${timeString}%'
                     GROUP BY measures.sensor_id, metric_id
                   UNION
                     SELECT 'min' AS type, MIN(rvalue), *
                     FROM measures
                              JOIN sensors ON sensors.sensor_id = measures.sensor_id
                     WHERE rtime LIKE '${timeString}%'
                     GROUP BY measures.sensor_id, metric_id
                     ORDER BY sensor_id, metric_id
                 ) AS minmax
                     JOIN metrics ON metrics.metric_id = minmax.metric_id
                     JOIN units ON units.unit_id = minmax.metric_id
    `, (err, rows) => {
        if (err) {
            console.error(err.message);
            resp.status(500).json(err.message);
        } else {

            const minMaxValues = {min: {}, max: {}};
            rows.forEach(function (e) {
                minMaxValues[e.type][e.sensor_id] = e.rvalue;
            });

            const minMaxTimes = {min: {}, max: {}};
            rows.forEach(function (e) {
                minMaxTimes[e.type][e.sensor_id] = e.rtime;
            });

            const results = [];
            rows.forEach(function (e) {
                results.push({
                    sensorId: e.sensor_id,
                    sensorName: e.name,
                    metric: e.metric_name,
                    unitName: e.unit_name,
                    values: {
                        min: {
                            rvalue: minMaxValues['min'][e.sensor_id],
                            rtime: minMaxTimes['min'][e.sensor_id],
                        },
                        max: {
                            rvalue: minMaxValues['max'][e.sensor_id],
                            rtime: minMaxTimes['max'][e.sensor_id],
                        }
                    }

                });
            });


            resp.status(200).setHeader('Content-Type', 'application/json').json(results);
        }

    });

}

