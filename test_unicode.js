function normalizeForFilter(text) {
    return text.normalize('NFKD') 
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[\u200B-\u200D\uFEFF]/g, '') 
        .toLowerCase()
        .replace(/4/g, 'a')
        .replace(/1|!/g, 'i')
        .replace(/0/g, 'o')
        .replace(/3/g, 'e')
        .replace(/5/g, 's')
        .replace(/@/g, 'a')
        .replace(/[.,_\-\*\/\|"']/g, ''); 
}

console.log("k0ntol:", normalizeForFilter("k0ntol"));
console.log("kóntól:", normalizeForFilter("kóntól"));
console.log("k.o.n.t.o.l:", normalizeForFilter("k.o.n.t.o.l"));
console.log("𝙠𝙤𝙣𝙩𝙤𝙡:", normalizeForFilter("𝙠𝙤𝙣𝙩𝙤𝙡"));
console.log("k o n t o l:", normalizeForFilter("k o n t o l"));

