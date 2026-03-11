const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('test.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS test (info TEXT)");
  db.run("INSERT INTO test(info) VALUES (?)", ["test info"]);
  db.all("SELECT info FROM test", [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row.info);
    });
  });
});

db.close();
