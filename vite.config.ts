/// <reference types="vitest" />

import * as path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import vueI18n from "@intlify/unplugin-vue-i18n/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

export default defineConfig({
	resolve: {
		alias: {
			"/@": path.resolve(__dirname, "/src"),
			"@": path.resolve(__dirname, "src"),
			"~/": `${path.resolve(__dirname, "src")}/`,
		},
	},
	server: {
		port: 3000,
	},
	plugins: [
		vue({
			include: [/\.vue$/, /\.md$/],
			reactivityTransform: true,
		}),
		vueI18n({
			runtimeOnly: true,
			compositionOnly: true,
			fullInstall: true,
			strictMessage: false, // This is for "html" in message
			include: path.resolve(__dirname, "./src/locales/**"),
		}),
		Icons({
			scale: 0.9,
			defaultClass: "faico",
			compiler: "vue3",
		}),
		Components({
			dirs: ["./src/components", "./src/views"],
			dts: "src/generated/components.d.ts",
			extensions: ["vue", "md"],
			include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
			types: [
				{
					from: "vue-router",
					names: ["RouterLink", "RouterView"],
				},
			],
			resolvers: [
				IconsResolver({
					alias: {
						fa: "fa6-solid",
					},
				}),
			],
		}),
		AutoImport({
			include: [
				/\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
				/\.vue$/,
				/\.vue\?vue/, // .vue
				/\.md$/, // .md
			],
			imports: [
				"vue",
				"vue-router",
				"vue-i18n",
				"pinia",
				{
					axios: [
						// default imports
						["default", "axios"], // import { default as axios } from 'axios',
					],
				},
			],
			eslintrc: {
				enabled: false, // Breaks project 0.14.3+
				filepath: "src/generated/.eslintrc-auto-import.json",
				globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
			},
			dts: "src/generated/auto-imports.d.ts",
			dirs: ["src/composables", "src/stores"],
			vueTemplate: true,
			injectAtEnd: true,
		}),
	],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
          @import "@/assets/css/vars.scss";
          @import "@/assets/css/global.scss";
        `,
			},
		},
		devSourcemap: true,
		modules: {
			scopeBehaviour: "global",
		},
	},
	optimizeDeps: {
		exclude: [],
	},
	build: {
		sourcemap: true,
		rollupOptions: {
			treeshake: false,
		},
	},
	test: {
		globals: true,
		include: ["test/**/*.test.ts"],
		environment: "jsdom",
		deps: {
			inline: ["@vue", "@vueuse"],
		},
	},
});
