const fs = require('fs');
const path = require('path');
const axios = require("axios")
const cheerio = require("cheerio")

// 指定文件夹路径
const binPath = path.join(__dirname, 'bins.csv');
function LoadBins() {
    if (!fs.existsSync(binPath)) {
        throw new Error("The bins.csv file does not exist.")
    }
    // if (bins) return bins;
    const objs = {};
    fs.readFileSync(binPath).toString("utf8").split("\n").forEach(x => {
        const arr = x.trim().split(",").map(x => decodeURIComponent(x.trim()));
        const bin = {
            bin: arr[0],
            card_brand: arr[1],
            card_type: arr[2],
            card_level: arr[3],
            bank_name: arr[4],
            bank_website: arr[5],
            bank_phone: arr[6],
            country_name: arr[7],
            country_code: arr[8],
            country_iso3: arr[9],
            currency: arr[10],
        }
        objs[bin.bin] = bin;
    })
    return objs;
}
let bins = global.lookupBins = global.lookupBins || LoadBins();

function SaveBins(objs = bins) {
    const str = Object.values(objs).map(x => [
        x.bin,
        x.card_brand,
        x.card_type,
        x.card_level,
        x.bank_name,
        x.bank_website,
        x.bank_phone,
        x.country_name,
        x.country_code,
        x.country_iso3,
        x.currency,
    ].map(x => x ? encodeURIComponent(x) : "").join(",")).join("\n")
    fs.writeFileSync("bins.csv", str)
}

async function WebFindBin(bin, axiosConfig) {
    bin = ToBin(bin);
    return await axios.get("https://bincheck.io/zh/details/" + bin, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"
        },
        ...axiosConfig
    })
        .then(x => {
            if (x.data.includes("您尝试检查的 BIN 是有效的")) {
                //获取
                const $ = cheerio.load(x.data)
                const data = {
                    bin,
                    card_brand: $(".overflow-x-auto table").eq(0).find("tr").eq(1).find("td").eq(1).text().trim().replace("------", ""),
                    card_type: $(".overflow-x-auto table").eq(0).find("tr").eq(2).find("td").eq(1).text().trim().replace("------", ""),
                    card_level: $(".overflow-x-auto table").eq(0).find("tr").eq(3).find("td").eq(1).text().trim().replace("------", ""),
                    bank_name: $(".overflow-x-auto table").eq(0).find("tr").eq(4).find("td").eq(1).text().trim().replace("------", ""),
                    bank_website: $(".overflow-x-auto table").eq(0).find("tr").eq(5).find("td").eq(1).text().trim().replace("------", ""),
                    bank_phone: $(".overflow-x-auto table").eq(0).find("tr").eq(6).find("td").eq(1).text().trim().replace("------", ""),
                    country_name: $(".overflow-x-auto table").eq(1).find("tr").eq(0).find("td").eq(1).text().trim().replace("------", ""),
                    country_code: $(".overflow-x-auto table").eq(1).find("tr").eq(2).find("td").eq(1).text().trim().replace("------", ""),
                    country_iso3: $(".overflow-x-auto table").eq(1).find("tr").eq(3).find("td").eq(1).text().trim().replace("------", ""),
                    currency: $(".overflow-x-auto table").eq(1).find("tr").eq(4).find("td").eq(1).text().trim().replace("------", ""),
                };
                bins[data.bin] = data
                return data;
            }
            if (x.data.includes("是无效的 BIN 号！")) {
                return false;
            }
            console.error("WEB_LOAD_BIN_ERR", x.data)
        })
}
function ToBin(card) {
    return (card + "").substring(0, 6)
}

module.exports = {
    ToBin,
    LoadBins,
    SaveBins,
    async FindBin(bin) {
        bin = ToBin(bin);
        let data = this.LocalFindBin(bin)
        if (!data) {
            data = await WebFindBin(bin)
        }
        return data;
    },
    LocalFindBin(bin) {
        bin = ToBin(bin);
        if (!bins) {
            LoadBins()
        }
        return bins[bin]
    },
    WebFindBin
}
