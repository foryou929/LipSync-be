const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
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
    '/lip-sync',
    upload.fields([
        { name: 'audio', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ]),
    (req, res) => {
        try {
            const audioFilePath = req.files.audio[0].path;
            const videoFilePath = req.files.video[0].path;
            const audioFileInfo = path.parse(audioFilePath);
            const audioFileNameWithoutExt = audioFileInfo.name;
            const videoFileInfo = path.parse(videoFilePath);
            const videoFileNameWithoutExt = videoFileInfo.name;
            exec(`~/LipSync-core/env/bin/python run.py -video_file ~/LipSync-be/${videoFilePath} -vocal_file ~/LipSync-be/${audioFilePath} -output_file output/output.mp4`, { cwd: '../LipSync-core' }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).json({ error: 'Error running process' });
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                res.json({ message: `Process output: ${stdout}`, url: `${videoFileNameWithoutExt}_${audioFileNameWithoutExt}_LipSync.mp4` });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
        }
    }
)

router.post(
    '/live-portrait',
    upload.fields([
        { name: 'src', maxCount: 1 },
        { name: 'dst', maxCount: 1 },
    ]),
    (req, res) => {
        try {
            const srcFilePath = req.files.src[0].path;
            const dstFilePath = req.files.dst[0].path;
            const srcFileInfo = path.parse(srcFilePath);
            const srcFileNameWithoutExt = srcFileInfo.name;
            const dstFileInfo = path.parse(dstFilePath);
            const dstFileNameWithoutExt = dstFileInfo.name;
            exec(`~/LivePortrait/LivePortrait_env/bin/python inference.py -s ~/LipSync-be/${srcFilePath} -d ~/LipSync-be/${dstFilePath}`, { cwd: '../LivePortrait' }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).json({ error: 'Error running process' });
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                fs.renameSync(`../LivePortrait/animations/${srcFileNameWithoutExt}--${dstFileNameWithoutExt}.mp4`, `uploads/${srcFileNameWithoutExt}_${dstFileNameWithoutExt}_LivePortrait.mp4`);
                res.json({ message: `Process output: ${stdout}`, url: `${srcFileNameWithoutExt}_${dstFileNameWithoutExt}_LivePortrait.mp4` });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
        }
    }
)

app.use('/api', router);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.all('*', (req, res) => {
    res.send('Not implemented');
})

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});