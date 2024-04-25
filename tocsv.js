const fs = require('fs');
const path = require('path');

// 指定文件夹路径
const dirPath = path.join(__dirname, 'dbs');

// 读取文件夹中的所有文件
fs.readdir(dirPath, (err, files) => {
    if (err) {
        return console.error(`读取文件夹失败: ${err}`);
    }

    // 初始化一个空对象来存储所有的数据
    let allData = {};

    // 遍历文件夹中的每一个文件
    files.forEach(file => {
        // 只处理.json文件
        if (path.extname(file) === '.json') {
            // 读取文件内容
            const data = JSON.parse(fs.readFileSync(path.join(dirPath, file)));
            // 合并数据
            const str = Object.keys(data).map(k => {
                let td = data[k];
                try {
                    return [
                        k, td.card.brand, td.card.type, td.card.level,
                        td.bank.name, td.bank.website, td.bank.phone,
                        td.country.name, td.country.code, td.country.iso3, td.country.currency
                    ].join(",")
                } catch (e) {
                    console.log(k, td)
                    process.exit()
                }
            }).join("\n")
            fs.appendFileSync('bins.csv', str, 'utf8');
        }
    });

    // 将合并后的数据写入到新的json文件中
});
