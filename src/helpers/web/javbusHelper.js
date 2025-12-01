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
}

export default JavBusHelper;
