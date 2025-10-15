import logger from "../lib/Logger";
import { addQuery, request } from "../utils/request";
import parseUserPairsToParams from "../utils/parseUserPairsToParams";
class jellyfin {
	constructor(serverUrl, token, userId, deviceId) {
		this.serverUrl = serverUrl;
		this.token = token;
		this.userId = userId;
		this.deviceId = deviceId;
		this.headers = {
			["X-Emby-Token"]: this.token,
		};

	}

	fetchItems = async (extraFetchParams) => {
		const extraParams = parseUserPairsToParams(extraFetchParams);
		logger.debug("fetchItem-->", extraFetchParams, extraParams);
		const params = {
			sortBy: "DateCreated",
			sortOrder: "Descending",
			...extraParams,
		};
		let limit = Number(params.limit);
		if (isNaN(limit)) {
			params.limit = 200;
		} else if (limit === 0) {
			params.limit = undefined;
		}
		return this.searchItems(params);
	};

	async searchItems(params) {
		const extraParams = parseUserPairsToParams(this.extraSearchParams);
		const finalParams = {
			startIndex: 0,
			// fields: 'SortName',
			imageTypeLimit: 1,
			mediaTypes: "Video",
			includeItemTypes: "Movie",
			recursive: true,
			sortBy: "SortName",
			sortOrder: "Ascending",
			limit: 2,
			enableUserData: true,
			enableImages: false,
			enableTotalRecordCount: false,
			userId: this.userId,
			...extraParams,
			...params,
		};
		if (this.serverUrl && this.token) {
			const url = `${this.serverUrl}/Items`;
			logger.debug("searchItem-->", params.searchTerm, finalParams);
			try {
				const response = await request(addQuery(url, finalParams), {
					headers: {
						...this.headers,
					},
				});
				logger.debug(response);
				return response.Items;
			} catch (error) {
				logger.error(error);
				throw error;
			}
		} else {
			const err = "serverUrl 或 apiKey 不能为空";
			logger.error(err);
			throw new Error(err);
		}
	}
}

export default jellyfin;
