const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const router = express.Router();

const upload = multer({ storage });

router.post(
    '/process',
    upload.fields([
        { name: 'audio', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ]),
    (req, res) => {
        res.send('File uploaded');
    }
)

app.use('/api', router);

app.all('*', (req, res) => {
    res.send('Not implemented');
})

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});