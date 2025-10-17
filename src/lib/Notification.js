// notification.js
const validTypes = ["info", "success", "warning", "error"];

class NotificationManager {
	constructor() {
		this.notification = null;
	}

	setNotification(notificationInstance) {
		this.notification = notificationInstance;
	}

	_notify(data, type) {
		if (!this.notification) {
			console.warn("通知实例未初始化");
			return;
		}
		this.notification[type]({
			content: "notification",
			duration: 2500,
			keepAliveOnHover: true,
			...data,
		});
	}

	notify(data, type = "info") {
		const t = validTypes.includes(type) ? type : "info";
		this._notify(data, t);
	}

	success(data) {
		this._notify(data, "success");
	}

	warn(data) {
		this._notify(data, "warning");
	}

	error(data) {
		this._notify(data, "error");
	}
}

export const notificationManager = new NotificationManager();

export default notificationManager;
