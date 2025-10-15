import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn } from "vite-plugin-monkey";
import meta from "./src/meta";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 异步获取 Git 用户名
async function getGitUsername() {
	try {
		const { stdout } = await execAsync("git config user.name");
		return stdout.trim();
	} catch (error) {
		console.warn("无法获取 Git 用户名，使用默认值");
		return "";
	}
}

// https://vitejs.dev/config/
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
					match: ["https://www.baidu.com/", "https://*.bing.com/"],
					...otherMeta,
				},
				build: {
					externalGlobals: {
						vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js"),
					},
					metaFileName: "src/meta.js",
					sourcemap: true, // 启用 sourcemap
					minify: false, // 如果要调试，建议关闭压缩
				},
				server: { mountGmApi: true },
			}),
		],

		// 添加服务器配置
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
	};
});
