/**
 * gibberish.js
 * Fitur cerdas pendeteksi kata acak / spam ketikan / keyboard mashing.
 * Versi ketat - threshold lebih rendah, lebih banyak pengecekan.
 */

function isGibberish(text) {
    const trimmed = text.trim();
    if (trimmed.length <= 2) return true;

    // 1. Pembersihan Teks
    // Dedup dulu sebelum hapus ketawa supaya "wkwkwkkwkw" jadi "wkwkwkwkw" dan terhapus
    let deduplicatedForLaughs = text.toLowerCase().replace(/(.)\1{2,}/g, '$1$1');
    let cleanFromLaughs = deduplicatedForLaughs
        .normalize('NFKD')
        .replace(/[^a-z\s]/g, '')
        .replace(/\s+/g, '')
        .replace(/(wkwk|wk|haha|hihi|huhu|hehe|ckck|xixi)+/g, '');

    if (cleanFromLaughs.length === 0) return false;
    if (cleanFromLaughs.length <= 2) return false;

    // Dedup lagi setelah dibersihkan
    const deduplicated = cleanFromLaughs.replace(/(.)\1+/g, '$1'); // aabbcc -> abc untuk cek rasio dan berderet

    let gibberishScore = 0;

    // ─────────────────────────────────────────
    // 2. Bigram Mustahil (diperluas)
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
        'kb','kc','kj','kv','kw','lq','lx','lz',
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

    for (const bigram of impossibleBigrams) {
        if (deduplicated.includes(bigram)) {
            gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]);
            break; // Satu bigram mustahil sudah cukup jadi bukti kuat
        }
    }

    // ─────────────────────────────────────────
    // 3. Pola Keyboard Mashing
    // ─────────────────────────────────────────
    const keyboardPatterns = [
        'qwer','wert','erty','rtyu','tyui','yuio','uiop',
        'asdf','sdfg','dfgh','fghj','ghjk','hjkl',
        'zxcv','xcvb','cvbn','vbnm',
        'qaz','wsx','edc','rfv','tgb','yhn','ujm',
        'qsc','qdc','qzx','plm','okn','ijn',
        'lkjh','mnbv','poiu'
    ];

    for (const pattern of keyboardPatterns) {
        if (deduplicated.includes(pattern)) {
            gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]);
        }
    }

    // ─────────────────────────────────────────
    // 4. Karakter Berulang Ekstrem
    // ─────────────────────────────────────────
    if (/(.)\1{4,}/.test(cleanFromLaughs)) {
        gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]); // aaaaa
    }

    if (cleanFromLaughs.length > 7) {
        const uniqueChars = new Set(cleanFromLaughs.split(''));
        if (uniqueChars.size <= 3) {
            gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]); 
        } else if (uniqueChars.size <= 4) {
            gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]); 
        }
    }

    // ─────────────────────────────────────────
    // 5. Rasio Vokal vs Konsonan
    // ─────────────────────────────────────────
    // Hitung konsonan dengan menganggap digraph (ng, ny) sebagai 1 konsonan
    const withoutDigraphs = deduplicated.replace(/(ng|ny|sy|kh|pr|tr|kr|gr)/g, 'c');
    const vowelsCount = (withoutDigraphs.match(/[aeiou]/g) || []).length;
    const consonantsCount = withoutDigraphs.length - vowelsCount;

    if (withoutDigraphs.length > 4) { 
        if (vowelsCount === 0) {
            gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]); 
        } else {
            const ratio = consonantsCount / vowelsCount;
            if (ratio > 4) { 
                gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]); 
            } else if (ratio < 0.2) { 
                gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]);
            }
        }
    }

    // ─────────────────────────────────────────
    // 6. Konsonan Berderet
    // ─────────────────────────────────────────
    // Cek pada string yang digraph-nya sudah disingkat
    if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(withoutDigraphs)) {
        gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]); 
    } else if (/[bcdfghjklmnpqrstvwxyz]{3,}/.test(withoutDigraphs)) {
        gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]);
    }

    // ─────────────────────────────────────────
    // 7. Panjang teks ekstrem
    // ─────────────────────────────────────────
    if (cleanFromLaughs.length > 20) {
        gibberishScore += ; console.log('Score + at line', new Error().stack.split('\\n')[1].match(/:(\d+):/)[1]);
    }

    // Threshold tetap 3, karena bobot penalti sudah disesuaikan agar lebih akurat
    return gibberishScore >= 3;
}

module.exports = isGibberish;