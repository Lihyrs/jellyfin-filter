import BaseWebHelper from "./baseWebHelper";
import { SITE_CONFIGS } from "../../comm/constant";

class JavLibraryHelper extends BaseWebHelper {
	constructor() {
		const { boxSelector, codeSelector, magnet, name } =
			SITE_CONFIGS.JAVLIBRARY;
		super({
			boxSelector,
			codeSelector,
			magnet,
		});
		this.siteName = name;
	}
}

export default JavLibraryHelper;
