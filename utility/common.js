module.exports = {
    base64DecodeString: function (str) {
        let buff = new Buffer.from(str, "base64");
        return decodeURI(buff.toString("ascii"));
    },
}