// fc2Helper
import BaseWebHelper from "./baseWebHelper";
import { SITE_CONFIGS } from "../../comm/constant";

class Fc2Helper extends BaseWebHelper {
	constructor() {
		const { boxSelector, codeSelector, magnetSelector, name } =
			SITE_CONFIGS.FC2;
		super({
			boxSelector,
			codeSelector,
			magnetSelector,
		});
		this.siteName = name;
	}
}

export default Fc2Helper;
