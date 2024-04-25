Bin information used to find a bank card
### Install
```
yarn add lookup-bin
//or
npm install lookup-bin
```
### Use
```
const lookupBin=require("./index")
//use local db
console.log(lookupBin.LocalFindBin("440393"))
//If it doesn't exist locally, it will be searched on the network
console.log(await lookupBin.FindBin("440393"))
//Use web search
console.log(await lookupBin.WebFindBin("440393"))
```
