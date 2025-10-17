import BaseWebHelper from "./baseWebHelper";
import { SITE_CONFIGS } from "../../comm/constant";

class JavLibraryHelper extends BaseWebHelper {
	constructor() {
		const { boxSelector, codeSelector, magnetSelector, name } =
			SITE_CONFIGS.JAVLIBRARY;
		super({
			boxSelector,
			codeSelector,
			magnetSelector,
		});
		this.siteName = name;
	}
}

export default JavLibraryHelper;
