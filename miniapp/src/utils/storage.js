import StorageApi from "@/services/miniapp/storage";
import CryptoJS from "crypto-js";
let storage = {};

storage.setStorage = async (key, data, expired = 3600) => {
	key = hashText(key);
	key = `${import.meta.env.VITE_APP_STORAGE_KEY}_${key}`;
	const data_storage = {
		data: data,
		expired: new Date().getTime() + expired * 1000,
	};
	// console.log(data_storage);
	return await StorageApi.setItem(key, JSON.stringify(data_storage));
};

storage.getStorage = async (key) => {
	key = hashText(key);
	key = `${import.meta.env.VITE_APP_STORAGE_KEY}_${key}`;
	let data_store = await StorageApi.getItem(key);
	if (!data_store) {
		return null;
	}
	data_store = JSON.parse(data_store);
	if (data_store?.expired < new Date().getTime()) {
		await StorageApi.removeItem(key);
		return null;
	}
	return data_store?.data;
};

storage.removeStorage = async (key) => {
	key = hashText(key);
	key = `${import.meta.env.VITE_APP_STORAGE_KEY}_${key}`;
	return await StorageApi.removeItem(key);
};

storage.getKey = (key) => {
	key = hashText(key);
	return `${import.meta.env.VITE_APP_STORAGE_KEY}_${key}`;
};

storage.clearAll = async () => {
	return await StorageApi.clearStorage();
};

const hashText = (text) => {
	return CryptoJS.SHA256(text).toString();
};

export default storage;
