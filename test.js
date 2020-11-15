var promise = (a)=>{
    return new Promise((resolve, reject)=>{
        if(a){
            resolve({message: "thanhcong"})
        }
        else{
            reject({message: "thatbai"})
        }
    })
}
var f = async ()=>{
    var re = await promise(0).then(data=>console.log(data)).catch(err=>{
        return console.log(err.message)
    })
    console.log(re)
    
}
f()