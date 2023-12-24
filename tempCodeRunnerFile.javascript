let a = ['a', 'b', 'd']
let found = false
let l = a.length
for (let i = 0; i < l; i++) {
    const item = a[i];
    if(item.localeCompare('c') == 1 ){
        console.log(i)
        console.log(a[i])
        console.log(a)
        // found = true 
        a.splice(2, 0,'c')
    }
    else
    {
        console.log(item);
    }
}
console.log(a)