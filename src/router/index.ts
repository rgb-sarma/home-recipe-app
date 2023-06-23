import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import AuthPage from "../views/Auth/AuthPage.vue";
import LoginPage from "../views/Auth/Sub/LoginPage.vue";
import RegisterPage from "../views/Auth/Sub/RegisterPage.vue";
import PageNotFound from "../views/PageNotFound.vue";

const routes = [
	{
		path: "/",
		name: "Home",
		component: HomePage,
	},
	{
		path: "/auth",
		name: "AuthPage",
		component: AuthPage,
		children: [
			{
				path: "login",
				name: "LoginPage",
				component: LoginPage,
			},
			{
				path: "register",
				name: "RegisterPage",
				component: RegisterPage,
			},
		],
	},
	{
		path: "/:pathMatch(.*)*",
		name: "not-found",
		component: PageNotFound,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
