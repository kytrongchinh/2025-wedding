const endConfigs = import.meta.env;

const config: Record<string, any> = {};

// Sử dụng for...of và Object.keys để duyệt các key
for (const k of Object.keys(endConfigs)) {
	// Kiểm tra và loại bỏ tiền tố "VITE_"
	if (k.startsWith("VITE_")) {
		config[k.replace("VITE_", "")] = endConfigs[k];
	}
}

// Nếu không có MODE, đặt giá trị mặc định là "production"
const isDevMode = (config?.MODE ?? "production") === "development";

export default config;
