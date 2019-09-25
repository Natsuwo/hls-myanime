require('dotenv').config()
const app = require('./app')(__dirname);

// Only Server
var config = {
    host: 'localhost',
    port: 4000
}
const { host, port } = config
app.listen(port, host)
console.log(`Server is running on http://${host}:${port}`)