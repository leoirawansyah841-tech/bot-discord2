/**
 * gibberish.js
 * Fitur cerdas pendeteksi kata acak / spam ketikan / keyboard mashing.
 * Versi ketat - threshold lebih rendah, lebih banyak pengecekan.
 */

function isGibberish(text) {
    const trimmed = text.trim();
    if (trimmed.length <= 2) return true;

    // Dedup awal untuk hapus ketawa panjang
    let deduplicatedForLaughs = text.toLowerCase().replace(/(.)\1{2,}/g, '$1$1');
    
    // Hapus ketawa
    let textWithoutLaughs = deduplicatedForLaughs
        .normalize('NFKD')
        .replace(/(wkwk|wk|haha|hihi|huhu|hehe|ckck|xixi)+/g, '');

    // Hanya ambil huruf dan spasi, hapus simbol
    let cleanText = textWithoutLaughs.replace(/[^a-z\s]/g, '');
    let words = cleanText.split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) return false;

    let gibberishScore = 0;

    // ─────────────────────────────────────────
    // 2. Bigram Mustahil & Pola Keyboard (Cek Per Kata!)
    // ─────────────────────────────────────────
    const impossibleBigrams = [
        'bx','cj','cv','cx','dx','fq','fx','gq','gx','hx',
        'jc','jf','jg','jq','js','jv','jw','jx','jz',
        'kq','kx','mx','px','pz',
        'qb','qc','qd','qf','qg','qh','qj','qk','ql','qm','qn','qp','qs','qt','qv','qw','qx','qy','qz',
        'sx','vb','vf','vh','vj','vm','vp','vq','vt','vw','vx','wx','xj','xx','zj','zq','zx',
        'bq','bf','bz','cf','cg','cp','dj','dq','dv','dw','dz',
        'fj','fk','fp','fv','fw','gb','gj','gv','gw',
        'hj','hq','hv','hz','jb','jd','jh','jk','jl','jm','jn','jp','jr','jt','ju',
        'kb','kc','kj','kv','lq','lx','lz',
        'mj','mq','mv','mw','mz','nq','nv','nx','nz',
        'pb','pd','pf','pg','pj','pk','pm','pn','pq','pv','pw',
        'rb','rc','rd','rf','rg','rh','rj','rk','rl','rm','rp','rq','rr','rv','rw','rx','rz',
        'tb','tc','td','tf','tg','tj','tk','tl','tm','tn','tp','tq','tv','tw','tx','tz',
        'vd','ve','vi','vk','vl','vn','vo','vs','vu','vv','vy',
        'wc','wd','wf','wg','wh','wj','wk','wl','wm','wn','wp','wq','wr','ws','wt','wv','ww','wz',
        'xb','xc','xd','xe','xf','xg','xh','xi','xk','xl','xm','xn','xo','xp','xq','xr','xs','xt','xu','xv','xw','xy','xz',
        'yq','yx','yy','yz',
        'zb','zc','zd','ze','zf','zg','zh','zi','zk','zl','zm','zn','zo','zp','zr','zs','zt','zu','zv','zw','zy','zz',
    ];

    const keyboardPatterns = [
        'qwer','wert','erty','rtyu','tyui','yuio','uiop',
        'asdf','sdfg','dfgh','fghj','ghjk','hjkl',
        'zxcv','xcvb','cvbn','vbnm',
        'qaz','wsx','edc','rfv','tgb','yhn','ujm',
        'qsc','qdc','qzx','plm','okn','ijn',
        'lkjh','mnbv','poiu'
    ];

    let hasImpossibleBigram = false;
    let hasKeyboardPattern = false;

    for (let word of words) {
        let dedupWord = word.replace(/(.)\1+/g, '$1');
        
        for (const bigram of impossibleBigrams) {
            if (dedupWord.includes(bigram)) {
                hasImpossibleBigram = true;
                break;
            }
        }
        
        for (const pattern of keyboardPatterns) {
            if (dedupWord.includes(pattern)) {
                hasKeyboardPattern = true;
                break;
            }
        }
    }

    if (hasImpossibleBigram) gibberishScore += 3;
    if (hasKeyboardPattern) gibberishScore += 3;

    // ─────────────────────────────────────────
    // 3. Karakter Berulang Ekstrem (Cek per kata)
    // ─────────────────────────────────────────
    let hasExtremeRepeat = false;
    for (let word of words) {
        if (/(.)\1{4,}/.test(word)) {
            hasExtremeRepeat = true; 
        }
    }
    if (hasExtremeRepeat) gibberishScore += 2;

    // Variasi huruf sedikit (Cek pada kalimat utuh tanpa spasi)
    let cleanNoSpace = cleanText.replace(/\s+/g, '');
    if (cleanNoSpace.length > 7) {
        const uniqueChars = new Set(cleanNoSpace.split(''));
        if (uniqueChars.size <= 3) {
            gibberishScore += 4; 
        } else if (uniqueChars.size <= 4) {
            gibberishScore += 2; 
        }
    }

    // ─────────────────────────────────────────
    // 4. Rasio Vokal vs Konsonan
    // ─────────────────────────────────────────
    const deduplicatedNoSpace = cleanNoSpace.replace(/(.)\1+/g, '$1');
    const withoutDigraphs = deduplicatedNoSpace.replace(/(ng|ny|sy|kh|pr|tr|kr|gr)/g, 'c');
    const vowelsCount = (withoutDigraphs.match(/[aeiou]/g) || []).length;
    const consonantsCount = withoutDigraphs.length - vowelsCount;

    if (withoutDigraphs.length > 4) { 
        if (vowelsCount === 0) {
            gibberishScore += 4; 
        } else {
            const ratio = consonantsCount / vowelsCount;
            if (ratio > 4) { 
                gibberishScore += 3; 
            } else if (ratio < 0.2) { 
                gibberishScore += 3;
            }
        }
    }

    // ─────────────────────────────────────────
    // 5. Konsonan Berderet
    // ─────────────────────────────────────────
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(withoutDigraphs)) {
        gibberishScore += 3; 
    } else if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(withoutDigraphs)) {
        gibberishScore += 1;
    }

    // ─────────────────────────────────────────
    // 6. Panjang teks ekstrem
    // ─────────────────────────────────────────
    if (cleanNoSpace.length > 20) {
        gibberishScore += 1;
    }

    return gibberishScore >= 3;
}

module.exports = isGibberish;