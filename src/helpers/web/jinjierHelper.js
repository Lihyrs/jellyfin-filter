import BaseWebHelper from "./baseWebHelper";
import { SITE_CONFIGS } from "../../comm/constant";

class JinjierHelper extends BaseWebHelper {
	constructor() {
		const { boxSelector, codeSelector, magnet, name } =
			SITE_CONFIGS.JINJIER;
		super({
			boxSelector,
			codeSelector,
			magnet,
		});
		this.siteName = name;
	}
}

export default JinjierHelper;
