const badWords = require('./badwords.js');
console.log('Total kata:', badWords.length);

const hasSpecial = badWords.filter(w => {
    try {
        new RegExp('\\b' + w.split('').join('\\s*') + '\\b', 'i');
        return false;
    } catch (e) {
        return true;
    }
});

if (hasSpecial.length === 0) {
    console.log('Semua kata aman untuk RegExp!');
} else {
    console.log('Kata yang masih bermasalah:', hasSpecial);
}
