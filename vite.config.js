import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn } from "vite-plugin-monkey";
import meta from "./src/meta";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getGitUsername() {
	try {
		const { stdout } = await execAsync("git config user.name");
		return stdout.trim();
	} catch (error) {
		console.warn("无法获取 Git 用户名，使用默认值");
		return "";
	}
}

export default defineConfig(async () => {
	const gitAuthor = await getGitUsername();
	const { author, ...otherMeta } = meta;

	return {
		plugins: [
			vue(),
			monkey({
				entry: "src/main.js",
				userscript: {
					author: author || gitAuthor,
					icon: "https://vitejs.dev/logo.svg",
					namespace: "npm/vite-plugin-monkey",
					// match: ["https://www.baidu.com/", "https://*.bing.com/"],
					// // 使用 resource 和 require 组合
					// resource: {
					//     "naive-ui-css": "https://cdn.jsdelivr.net/npm/naive-ui@2.43.1/dist/index.css",
					//     "ionicons-css": "https://cdn.jsdelivr.net/npm/@vicons/ionicons5/index.css"
					// },
					// require: [
					//     "https://cdn.jsdelivr.net/npm/vue@3.5.19/dist/vue.global.prod.js",
					//     "https://cdn.jsdelivr.net/npm/pinia@2.1.6/dist/pinia.iife.js",
					//     "https://cdn.jsdelivr.net/npm/naive-ui@2.43.1/dist/index.js",
					//     "https://cdn.jsdelivr.net/npm/@vicons/ionicons5@0.12.0/index.js"
					// ],
					// grant: [
					//     "GM_addStyle",
					//     "GM_getResourceText",
					//     "GM_addElement"
					// ],
					...otherMeta,
				},
				build: {
					// 使用数组格式配置 externalGlobals
					externalGlobals: [
						["vue", cdn.jsdelivr("Vue", "dist/vue.global.prod.js")],
						["pinia", cdn.jsdelivr("Pinia", "dist/pinia.iife.js")],
						["naive-ui", cdn.jsdelivr("naive", "dist/index.js")],
                        ["loglevel", cdn.jsdelivr("log", "dist/loglevel.min.js")],
					],
					// 配置外部资源（CSS）
					externalResource: {
						"naive-ui/dist/index.css": {
							resourceName: "naive-ui-css",
							resourceUrl:
								"https://cdn.jsdelivr.net/npm/naive-ui@2.43.1/dist/index.css",
							loader: `(function() {
                                const css = GM_getResourceText('naive-ui-css');
                                GM_addStyle(css);
                                return css;
                            })()`,
						},
					},
					// 启用自动 grant
					// autoGrant: true,
					metaFileName: "src/meta.js",
					sourcemap: true,
					minify: false,
					// 自定义 CSS 副作用处理
					// cssSideEffects: `(function(css) {
					//     if (typeof GM_addStyle !== 'undefined') {
					//         GM_addStyle(css);
					//     } else {
					//         const style = document.createElement('style');
					//         style.textContent = css;
					//         document.head.appendChild(style);
					//     }
					// })`,
				},
				server: {
					mountGmApi: true, // 对于 Tampermonkey 建议关闭
					// open: true,
				},
				// 客户端别名
				// clientAlias: "$",
				// 启用样式导入
				// styleImport: true,
			}),
		],
		server: {
			cors: true,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods":
					"GET, POST, PUT, DELETE, PATCH, OPTIONS",
				"Access-Control-Allow-Headers":
					"X-Requested-With, content-type, Authorization",
			},
		},
		build: {
			rollupOptions: {
				// external: ["vue", "pinia", "naive-ui"],
			},
		},
	};
});
