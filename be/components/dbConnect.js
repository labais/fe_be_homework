exports.dbConnect = function dbConnect(error) {

    const dbPath = __dirname + '/../db/aranet.db';
    const sqlite3 = require('sqlite3').verbose();
    return new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            error(err);
        }
    });
}