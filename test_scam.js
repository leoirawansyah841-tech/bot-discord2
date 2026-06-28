function normalizeForFilter(text) {
    if (!text) return '';
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

console.log('serif:', normalizeForFilter('𝐡𝐞𝐥𝐥𝐨'));
console.log('sans-serif:', normalizeForFilter('𝗵𝗲𝗹𝗹𝗼'));
console.log('fraktur:', normalizeForFilter('𝖍𝖊𝖑𝖑𝖔'));
console.log('double-struck:', normalizeForFilter('𝕙𝕖𝕝𝕝𝕠'));
