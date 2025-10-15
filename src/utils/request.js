// import state from "../state";
import logger from "../lib/Logger";
function request(url, { method = "GET", data, headers = {} } = {}) {
	logger.debug(`请求: ${url}`);
	logger.debug(`header:`, headers);
	// if (new URL(url).origin === state.settings.serverUrl) {
	// 	headers["X-Emby-Token"] = state.settings.apiKey;
	// 	logger.debug("apikey-->", state.settings.apiKey);
	// }
	const now = Date.now();
	return new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			method,
			url,
			data,
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
			onload(response) {
				if (response.status === 200) {
					try {
						resolve(JSON.parse(response.responseText));
						logger.debug(
							`请求成功: ${url}, 耗时: ${Date.now() - now}ms`
						);
					} catch (error) {
						reject(error);
					}
				} else {
					reject(response);
				}
			},
			onerror: reject,
		});
	});
}

function getQuery(params) {
	return Object.entries(params)
		.filter(([_, value]) => value != null && value !== "")
		.map(([key, value]) => {
			if (value && typeof value === "object") {
				return Object.entries(value)
					.map(
						([k, v]) =>
							`${encodeURIComponent(
								`${key}[${k}]`
							)}=${encodeURIComponent(v)}`
					)
					.join("&");
			} else {
				return `${encodeURIComponent(key)}=${encodeURIComponent(
					value
				)}`;
			}
		})
		.join("&");
}

function addQuery(base, params) {
	if (!params) return base;
	const query = getQuery(params);
	if (!query) return base;
	return base.endsWith("?") ? base + query : `${base}?${query}`;
}

export { request, getQuery, addQuery };
export default request;
