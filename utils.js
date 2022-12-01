fs = require('fs').promises;

const readFile = (filePath, callback) => {
    fs.readFile(filePath, 'utf8')
        .then(data => callback(data))
        .catch(console.log);
}

exports.readFile = readFile;
