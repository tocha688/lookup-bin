const fs = require("fs")
const axios = require("axios")
const cheerio = require("cheerio")

async function checkBin2(bin) {
    do {
        try {
            return await axios.get("https://bincheck.io/zh/details/" + bin, {
                headers: {
                    // "con"
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"
                },
                // httpsAgent: new HttpsProxyAgent({ proxy: `http://user-bunan99-sessid-${faker.string.alphanumeric(8)}-sesstime-1-keep-true:bunan123@ac913fb2e773e488.vbf.na.roxlabs.vip:4600` })
            })
                .then(x => {
                    if (x.data.includes("您尝试检查的 BIN 是有效的")) {
                        console.log(bin, "有效")
                        //获取
                        const $ = cheerio.load(x.data)
                        return {
                            card: {
                                brand: $(".overflow-x-auto table").eq(0).find("tr").eq(1).find("td").eq(1).text().trim().replace("------", ""),
                                type: $(".overflow-x-auto table").eq(0).find("tr").eq(2).find("td").eq(1).text().trim().replace("------", ""),
                                level: $(".overflow-x-auto table").eq(0).find("tr").eq(3).find("td").eq(1).text().trim().replace("------", ""),
                            },
                            bank: {
                                name: $(".overflow-x-auto table").eq(0).find("tr").eq(4).find("td").eq(1).text().trim().replace("------", ""),
                                website: $(".overflow-x-auto table").eq(0).find("tr").eq(5).find("td").eq(1).text().trim().replace("------", ""),
                                phone: $(".overflow-x-auto table").eq(0).find("tr").eq(6).find("td").eq(1).text().trim().replace("------", ""),
                            },
                            country: {
                                name: $(".overflow-x-auto table").eq(1).find("tr").eq(0).find("td").eq(1).text().trim().replace("------", ""),
                                code: $(".overflow-x-auto table").eq(1).find("tr").eq(2).find("td").eq(1).text().trim().replace("------", ""),
                                iso3: $(".overflow-x-auto table").eq(1).find("tr").eq(3).find("td").eq(1).text().trim().replace("------", ""),
                                currency: $(".overflow-x-auto table").eq(1).find("tr").eq(4).find("td").eq(1).text().trim().replace("------", ""),
                            }
                        };
                    }
                    if (x.data.includes("是无效的 BIN 号！")) {
                        console.log(bin, "无效")
                        return false;
                    }
                    fs.writeFileSync("x.html", x.data)
                })
        } catch (e) {
            console.log(e.message)
        }
    } while (true)
}

async function main(start = 100000, end = 999999, _path = "bins_01.json") {
    let bins = {};
    if (fs.existsSync(_path)) {
        bins = JSON.parse(fs.readFileSync(_path).toString("utf-8"))
        start = Object.keys(bins).pop()
    }
    for (let i = start; i < end; i++) {
        let _bin = i + ""
        let data = await checkBin2(_bin)
        if (data) {
            bins[_bin] = data;
            fs.writeFileSync(_path, JSON.stringify(bins))
        }
    }
}

let size = 100;
let over = parseInt((999999 - 100000) / size)
for (let i = 0; i < size; i++) {
    const start = 100000 + (over * i);
    let end = 100000 + (over * (i + 1) - 1)
    if (size - 1 == i) {
        end = 999999
    }
    const file = `./dbs/bins_${start}_${end}.json`
    // console.log(start, end, file)
    main(start, end, file)
}

// main(100000, 200000, _path = "bins_01.json")
// main(200001, 300000, _path = "bins_02.json")
// main(300001, 400000, _path = "bins_03.json")
// main(400001, 400000, _path = "bins_04.json")
// main(500001, 600000, _path = "bins_05.json")
// main(600001, 700000, _path = "bins_06.json")
// main(700001, 800000, _path = "bins_07.json")
// main(800001, 900000, _path = "bins_08.json")
// main(900001, 999999, _path = "bins_09.json")