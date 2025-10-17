import BaseWebHelper from "./baseWebHelper";
import { SITE_CONFIGS } from "../../comm/constant";

class JinjierHelper extends BaseWebHelper {
	constructor() {
		const { boxSelector, codeSelector, magnetSelector, name } =
			SITE_CONFIGS.JINJIER;
		super({
			boxSelector,
			codeSelector,
			magnetSelector,
		});
		this.siteName = name;
	}
}

export default JinjierHelper;
