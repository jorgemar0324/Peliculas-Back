const express = require('express')
const app = express()
const {getConnection} = require('./config/database')
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 8080
app.use(cors());
app.use(express.json());


getConnection();
app.use('/api/director', require('./routes/director'));
app.use('/api/genero', require('./routes/genero'));
app.use('/api/productora', require('./routes/productora'));
app.use('/api/tipo', require('./routes/tipo'));
app.use('/api/media', require('./routes/media'));
      


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
