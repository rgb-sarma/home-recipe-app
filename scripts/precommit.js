const fs = require("fs");

const path = "./package-lock.json";

try {
	if (fs.existsSync(path)) {
		console.error(`Blocked file exists, remove it before commiting: '${path}'`);
		process.exit(1);
	} else {
		process.exit(0);
	}
} catch (err) {
	console.error(err);
	process.exit(1);
}
