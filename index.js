const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT;
const app = express();

app.get('/api/upload', (req, res) => {
    
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});