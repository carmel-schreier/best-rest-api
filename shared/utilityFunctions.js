module.exports = {
    getPayload: function (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const buff = Buffer.from(base64, "base64");
        const payloadInit = buff.toString('ascii');
        const payload = JSON.parse(payloadInit);
        return payload
    },

}