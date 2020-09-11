const imageCompression = require('browser-image-compression');

const axios = require('axios').default;
const formData = require('form-data');

const uploadedPhotos = [];

let photoUploading = false;

axios.get('./allPhotos').then(res => {
    const photos = res.data;
    renderPhotos(photos);
}).catch(e => {
    alert(e);
})

const fileInput = document.getElementById('fileInput');

const sendButton = document.getElementById('sendButton');

const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 700,
    useWebWorker: true
}

fileInput.onchange = onFileUpload;

async function onFileUpload() {
    photoUploading = true;
    let data = new FormData();
    const file = fileInput.files[0];
    const compressedFile = await imageCompression(file, options);
    const fileName = new Date().getTime() + '.' + file.name.split('.').pop();

    data.append('file', compressedFile, fileName);

    axios.post('/add', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(res => {
        photoUploading = false;
        renderPhotos([res.data]);
    })
}

const startPooling = (time) => {
    setInterval(() => {
        if (photoUploading) {
            return;
        }
        axios.get('./allPhotos').then(res => {
            const photos = res.data;
            const newPhotos = photos.filter(x => uploadedPhotos.indexOf(x) === -1);
            if (newPhotos.length) {
                renderPhotos(newPhotos)
            }

        }).catch(e => {
            alert(e);
        })
    }, time)
}

const sizes = [9, 18, 36, 48, 72, 144];

const renderPhotos = (photos, filler = false) => {
    const container = document.getElementById('main');
    if (filler) {
        photos.forEach(element => {
            const img = document.createElement("div");
            img.classList.add('copy');
            img.style.backgroundImage = `url('./photos/${element}')`;
            document.getElementById('main').appendChild(img);
        });
        return;
    }
    photos.forEach((element, index) => {
        const img = document.createElement("div");
        img.style.backgroundImage = `url('./photos/${element}')`;
        const lastPhoto = Array.from(document.querySelectorAll('#main div:not(.copy)')).pop();
        if (!lastPhoto) {
            document.getElementById('main').appendChild(img);
        } else {
            lastPhoto.after(img);
        }
        // lastPhoto.append(img);
        uploadedPhotos.push(element);
    });

    if (uploadedPhotos.length > 4) {
        container.dataset.style = 2;
    }
    if (uploadedPhotos.length > 18) {
        container.dataset.style = 3;
    }
    if (uploadedPhotos.length > 36) {
        container.dataset.style = 4;
    }
    if (uploadedPhotos.length > 48) {
        container.dataset.style = 5;
    }
    fillWithRandom();
}

const fillWithRandom = () => {
    if (document.querySelectorAll('.copy')) {
        document.querySelectorAll('.copy').forEach(i => {
            i.remove();
        })
    }

    const _tmp = [...sizes];
    const renderedQuantity = uploadedPhotos.length;
    _tmp.push(renderedQuantity);
    _tmp.sort((a, b) => a - b);
    const fillQuantity = _tmp[_tmp.indexOf(renderedQuantity) + 1] - renderedQuantity;
    console.log(renderedQuantity, fillQuantity);
    const photos = new Array(fillQuantity).fill(uploadedPhotos[renderedQuantity - 1]);
    renderPhotos(photos, true);
}

startPooling(5000);