"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const crypto = require("crypto");
function base64url(input) {
    return (input instanceof Buffer ? input : Buffer.from(input))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function signJwt(payload, secret, expiresInSeconds = 7 * 24 * 60 * 60) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const body = { ...payload, iat: now, exp: now + expiresInSeconds };
    const headerB64 = base64url(JSON.stringify(header));
    const payloadB64 = base64url(JSON.stringify(body));
    const data = `${headerB64}.${payloadB64}`;
    const signature = crypto.createHmac('sha256', secret).update(data).digest();
    const sigB64 = base64url(signature);
    return `${data}.${sigB64}`;
}
function verifyJwt(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            return null;
        const [h, p, s] = parts;
        const data = `${h}.${p}`;
        const expected = base64url(crypto.createHmac('sha256', secret).update(data).digest());
        if (expected !== s)
            return null;
        const payload = JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && now > payload.exp)
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.util.js.map