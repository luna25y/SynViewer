const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

// 设置静态文件目录为根目录
app.use(express.static(__dirname));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }]), (req, res) => {
    res.json({ success: true });
});

app.get('/', (req, res) => {
    // 绝对路径
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
