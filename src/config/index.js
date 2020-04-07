module.exports = {
	// api: "http://10.136.210.204:3001", // for prod
	api: "http://10.136.210.204:3000",
	serverUTC: 420,
	fileTypes: [
		'accdb', 'avi', 'bmp', 'doc', 'docx', 'eml', 'fla', 'gif', 'html', 'jpeg', 'mov', 'mp3', 'mpeg', 'pdf', 'png', 'ppt', 'pptx', 'pst', 'pub', 'rar', 'readme', 'tiff', 'txt', 'url', 'vsd', 'wav', 'wma', 'wmv', 'xls', 'xlsx', 'zip', 'csv'
	],
	fileSize: 20000000,
	io: {
		// connection: "http://10.136.210.204:3001", // for prod
		connection: "http://10.136.210.204:3000",
		actionPrefix: 'SOCKET_'
	}
};
