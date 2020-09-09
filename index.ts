import * as fs from 'fs';
import * as path from 'path';

const save = require('save-file');
const express = require('express');

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = new express();

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/photos', express.static('photos'));
app.use('/static', express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/allPhotos', (req, res) => {
    const fileList = [];
    fs.readdir('./photos', (err, files) => {
        files.forEach(file => {
            fileList.push(file);
        });
        res.send(fileList).status(200);
    });
});

app.post('/add', async (req, res) => {
    try {
        if (!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {

            const image = req.files.file;
            console.log(image);
            image.mv('./photos/' + image.name);
            res.send('./photos/' + image.name).status(200);
        }
    } catch (err) {
        res.status(500).send(err);
    }
})

app.listen(process.env.port || 3000, () => {
    console.log(`Example app listening at http://localhost:3000`)
})