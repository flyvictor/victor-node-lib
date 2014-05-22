module.exports.encode = function (decoded) {
	if (!decoded) {
		return '';
	}
	// using implementation from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FencodeURIComponent
	return encodeURIComponent(decoded)
		.replace(/[!'()]/g, escape)
		.replace(/\*/g, "%2A");
};

module.exports.decode = function (encoded) {
	if (!encoded) {
		return '';
	}
	return decodeURIComponent(encoded);
};