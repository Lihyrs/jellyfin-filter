// javdbHelper
import BaseWebHelper from "./baseWebHelper";
import { SITE_CONFIGS } from "../../comm/constant";
import { HTML_ATTRI } from "../../comm/constant";

class JavdbHelper extends BaseWebHelper {
	constructor() {
		const { boxSelector, codeSelector, magnetSelector, name } =
			SITE_CONFIGS.JAVDB;
		super({
			boxSelector,
			codeSelector,
			magnetSelector,
		});
		this.siteName = name;
	}

	findCode() {
		const searchParams = new URLSearchParams(location.search);
		const paths = state.settings.javdbOuPath
			.split(/\s*[,;]\s*/)
			.trim()
			.filter(Boolean);
		if (
			searchParams.get("t") === "western" ||
			searchParams.get("q")?.match(/\d{2}\.\d{2}\.\d{2}/) ||
			paths.some((path) => location.pathname.includes(path))
		) {
			return super.findCodeWithSelectors(this.boxSelector, (box) => {
				let fakeTitle = box.getAttribute(HTML_ATTRI.data.FAKE_TITLE);
				if (fakeTitle) return fakeTitle;
				const titleElement = box.querySelector(this.codeSelector);
				const title = titleElement.textContent
					.trim()
					.replaceAll(" ", "");
				const date = box
					.querySelector(".meta")
					.textContent.trim()
					.slice(2)
					.replaceAll("-", ".");
				fakeTitle = `${title}.${date}`;
				box.setAttribute(HTML_ATTRI.data.FAKE_TITLE, fakeTitle);
				titleElement.textContent = fakeTitle;
				return fakeTitle;
			});
		} else {
			return super.findCodeWithSelectors(
				this.boxSelector,
				this.codeSelector
			);
		}
	}
}

export default JavdbHelper;
