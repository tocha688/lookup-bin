const fs = require('fs');
const path = require('path');

// 指定文件夹路径
const dirPath = path.join(__dirname, 'dbs');
const prismaClint = require('@prisma/client')
const prisma = new prismaClint.PrismaClient()

function getId(bank_name) {
    bank_name = bank_name.trim()
    bank_name = bank_name.toLocaleLowerCase().replace(/[\s-,\.\(\)]+/ig, "_")
    if (
        bank_name.lastIndexOf(".") || bank_name.lastIndexOf(")")
    ) {
        bank_name = bank_name.substring(0, bank_name.length - 1);
    }
    return bank_name;
}

// 读取文件夹中的所有文件
fs.readdir(dirPath, async (err, files) => {
    if (err) {
        return console.error(`读取文件夹失败: ${err}`);
    }

    // 初始化一个空对象来存储所有的数据
    // 遍历文件夹中的每一个文件
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (path.extname(file) === '.json') {
            // 读取文件内容

            const data = JSON.parse(fs.readFileSync(path.join(dirPath, file)));
            const bins = Object.keys(data)
            let list = bins.map(async bin => {
                const td = data[bin];

                let country = {
                    code: td.country.code,
                    name: td.country.name,
                    iso3: td.country.iso3,
                    currency: td.country.currency,
                }
                if (!!country) {
                    let _country = await prisma.country.findFirst({ where: { code: country.code } });
                    if (!_country) {
                        _country = await prisma.country.create({ data: country }).catch(e => { })
                    }
                }

                let bank = {
                    id: getId(td.bank.name),
                    name: td.bank.name,
                    website: td.bank.website,
                    phone: td.bank.phone,
                    country_code: country?.code || undefined
                }
                if (!!bank && !!bank.id) {
                    let _bank = await prisma.bank.findFirst({ where: { id: bank.id } });
                    if (!_bank) {
                        _bank = await prisma.bank.create({ data: bank }).catch(e => { })
                    }
                }

                return {
                    bin: bin,
                    brand: td.card.brand,
                    type: td.card.type,
                    level: td.card.level,
                    bank_id: bank?.id || undefined,
                    country_code: country?.code || undefined,
                };
            })
            list = await Promise.all(list)

            await prisma.bin.createMany({ data: list })
        }
    }

});
