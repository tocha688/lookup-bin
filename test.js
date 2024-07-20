const lookupBin=require("./index")

// console.log(lookupBin.WebFindBin("414720"))
console.log(lookupBin.LocalFindBin("414720"))

lookupBin.WebFindBin("414720").then(x=>{
    console.log(x)
})