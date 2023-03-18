const express = require('express')
const app = express()
app.use(express.static('public'))
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.get('/', (req, resp) => {
  resp.render('index')
})

let port = 8080
console.log(`http://localhost:${port}`);
app.listen(port) 