// javbusHelper
import BaseWebHelper from "./baseWebHelper";
import { SITE_CONFIGS } from "../../comm/constant";

class JavBusHelper extends BaseWebHelper {
	constructor() {
		const { boxSelector, codeSelector, magnet, name } = SITE_CONFIGS.JAVBUS;
		super({
			boxSelector,
			codeSelector,
			magnet,
		});
		this.siteName = name;
	}

	onCodeFound(code, box, type) {
		console.log(`在 ${this.siteName} 找到代码: ${code}`);
		const magnets = this.findMagnetLinksInBox(box);
		console.log(`找到 ${magnets.length} 个磁力链接`);
	}
}

export default JavBusHelper;
