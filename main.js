// upload files
async function uploadFiles() {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];

    if (!file1 || !file2) {
        alert('Please upload both files before uploading');
        return;
    }

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('success');
            } else {
                alert('fail');
            }
        } else {
            alert('fail response');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error:', error);
    }
}

// show files
document.getElementById('file1').addEventListener('change', handleFileSelect);
document.getElementById('file2').addEventListener('change', handleFileSelect);

document.getElementById('scale').addEventListener('change', handleScale);

document.getElementById('left').addEventListener('scroll', synchronizeScroll);
document.getElementById('right').addEventListener('scroll', synchronizeScroll);


let leftScrollTop = 0;
let rightScrollTop = 0;
let scaleValue = 1;

async function handleFileSelect(event) {
    const file = event.target.files[0];

    if (file) {
        if (file.type === 'application/pdf') {
            await displayPdf(file, event.target.id, scaleValue);
        } else {
            displayTextFile(file, event.target.id, scaleValue);
        }
    }
}

function handleScale(event){
    scaleValue = parseFloat(event.target.value);
    if(scaleValue <= 0 || isNaN(scaleValue)){
        scaleValue = 1;
    }
    updatePdfDisplay();
}

async function displayPdf(file, fileId, scaleValue) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        const buffer = e.target.result;
        const pdf = await pdfjsLib.getDocument(new Uint8Array(buffer)).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: scaleValue });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            await page.render(renderContext).promise;
            document.getElementById(fileId === 'file1' ? 'left' : 'right').appendChild(canvas);
        }
    };
    reader.readAsArrayBuffer(file);
}

function updatePdfDisplay() {
    const leftContainer = document.getElementById('left');
    const rightContainer = document.getElementById('right');

    leftContainer.innerHTML = '';
    rightContainer.innerHTML = '';

    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];
    console.log(file1);

    if (file1) {
        displayPdf(file1, 'file1', scaleValue);
    }

    if (file2) {
        displayPdf(file2, 'file2', scaleValue);
    }
}

function displayTextFile(file, fileId) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const targetId = fileId === 'file1' ? 'left' : 'right';
        document.getElementById(targetId).innerHTML = content;
    };
    reader.readAsText(file);
}

function synchronizeScroll(event) {
    const leftPanel = document.getElementById('left');
    const rightPanel = document.getElementById('right');

    // avoid limitless regression
    leftPanel.removeEventListener('scroll', synchronizeScroll);
    rightPanel.removeEventListener('scroll', synchronizeScroll);

    if (event.target.id === 'left') {
        rightPanel.scrollTop = leftPanel.scrollTop;
        rightPanel.scrollLeft = leftPanel.scrollLeft;
    } else {
        leftPanel.scrollTop = rightPanel.scrollTop;
        leftPanel.scrollLeft = rightPanel.scrollLeft;
    }

    leftPanel.addEventListener('scroll', synchronizeScroll);
    rightPanel.addEventListener('scroll', synchronizeScroll);
}

