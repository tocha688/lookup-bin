const { HttpsProxyAgent } = require("https-proxy-agent")
const lookup = require("./index")
const pLimit = require("p-limit");
const { default: axios } = require("axios");

let proxys = [];
async function ProxyLoad() {
    return axios.get(`http://yizhiyan.user.xiecaiyun.com/api/proxies?action=getText&key=NP4AB8FD93&count=1000&word=&rand=false&norepeat=false&detail=false&ltime=&idshow=false`).then(x => {
        proxys = x.data.split("\n").map(x => x.trim()).filter(x => !!x)
        console.log("代理获取成功", proxys.length)
    }).catch(e => {
        console.log("error", e.message)
        return ProxyLoad
    })
}
async function pullMain(start, end, size) {
    const limit = pLimit(size);
    //一个任务10000数据
    let waits = [];
    let timer = setInterval(() => {
        lookup.SaveBins()
        ProxyLoad()
    }, 1000 * 5)
    await ProxyLoad()
    let ok = 0;
    for (let index = start; index <= end; index++) {
        if (lookup.LocalFindBin(index)) {
            continue
        }
        waits.push(limit(async () => {
            do {
                try {
                    const xurl = "http://yizhiyan:1.yizhiyan@" + proxys.pop();
                    const data = await lookup.WebFindBin(index, {
                        httpsAgent: new HttpsProxyAgent(xurl)
                    })
                    ok++
                    if (data) {
                        console.log("有效", index, ok + "/" + waits.length)
                    } else {
                        console.log("无效", index, ok + "/" + waits.length)
                    }
                    break
                } catch (e) {
                    console.log("错误重试",index,e.message)
                }
            } while (true)
        }))
    }
    console.log("启动完毕", waits.length)
    await Promise.all(waits)
    lookup.SaveBins()
    clearInterval(timer)
    console.log("运行完成")
}

pullMain(618377, 699999, 50)
// ProxyLoad()
