const imageCompression = require('browser-image-compression');

const axios = require('axios').default;
const formData = require('form-data');

const uploadedPhotos = [];

axios.get('./allPhotos').then(res => {
    const photos = res.data;
    photos.forEach(element => {
        const img = document.createElement("img");
        img.src = './photos/' + element;
        document.getElementById('main').appendChild(img);
        uploadedPhotos.push(element);
    });
}).catch(e => {
    alert(e);
})

const fileInput = document.getElementById('fileInput');

const sendButton = document.getElementById('sendButton');

const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
}

sendButton.onclick = async () => {
    let data = new FormData();
    const file = fileInput.files[0];
    const compressedFile = await imageCompression(file, options);
    const fileName = new Date().getTime() + '.' + file.name.split('.').pop();

    console.log(compressedFile, fileName);
    data.append('file', compressedFile, fileName);

    axios.post('/add', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(res => {
        const img = document.createElement("img");
        img.src = res.data;
        uploadedPhotos.push(fileName);
        document.getElementById('main').appendChild(img);
    })
}

const startPooling = (time) => {
    setInterval(() => {
        console.log(uploadedPhotos);
        axios.get('./allPhotos').then(res => {
            const photos = res.data;
            const newPhotos = photos.filter(x => uploadedPhotos.indexOf(x) === -1);
            if (newPhotos.length) {
                newPhotos.forEach(element => {
                    const img = document.createElement("img");
                    img.src = './photos/' + element;
                    document.getElementById('main').appendChild(img);
                    uploadedPhotos.push(element);
                });
            }

        }).catch(e => {
            alert(e);
        })
    }, time)
}

startPooling(5000);