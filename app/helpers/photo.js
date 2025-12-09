var fs = require("fs");
var photo = {};

photo.addWatermark = async function (path_photo, path_photo_out, path_watermark = "", rotate = 0) {
	var sharp = require("sharp");
	return new Promise(async function (resolve, reject) {
		try {
			var photo_out = _basepath + path_photo_out;
			var photo = _basepath + path_photo;

			var watermark = path_watermark ? _basepath + path_watermark : _basepath + "public/frontend/assets/images/watermark_big.png";

			sharp.cache(false);
			var obj_photo = await sharp(photo, { failOnError: false });

			if (rotate) {
				var buff_photo = await obj_photo.rotate(rotate).toBuffer();
				fs.writeFileSync(photo, buff_photo);
				obj_photo = await sharp(buff_photo);
			}

			var photo_metadata = await obj_photo.metadata();

			let w_resize = helpers.base.parseInteger(photo_metadata.width / 4);
			let h_resize = helpers.base.parseInteger(photo_metadata.height / 4);

			var obj_water = await sharp(watermark);
			var buff_water = await obj_water.toBuffer();
			var logo_metadata = await obj_water.metadata();

			//if(photo_metadata.width < 535 || photo_metadata.height < 180){
			//scale watermark
			buff_water = await sharp(watermark).resize(w_resize).toBuffer();
			obj_water = await sharp(buff_water);
			logo_metadata = await obj_water.metadata();
			//}

			var X = 10;
			var Y = photo_metadata.height - logo_metadata.height - 10;

			var options = [
				{
					input: buff_water,
					top: Y,
					left: X,
				},
			];

			await obj_photo.composite(options).jpeg({ quality: 90 }).toFile(photo_out);

			//create thumb
			let ext = path_photo_out.split(".");
			let path_thumb = ext[0] + "_thumb." + ext[1];
			let path_photo_watermark = ext[0] + "_watermarrk." + ext[1];

			//resize photo thumb
			await helpers.photo.resize(path_photo_out, path_thumb, 500);
			//resize photo watermark
			await helpers.photo.resize(path_photo_out, path_photo_watermark, photo_metadata.width);

			//remove file out
			helpers.file.removeFile(path_photo_out);
			//helpers.file.clearCacheStatic(path_photo_out);

			return resolve({ thumb: path_thumb, watermark: path_photo_watermark });
		} catch (e) {
			console.log("addWatermark", e);
			return resolve("");
		}
	});
};

photo.resize = function (data, des, w) {
	return new Promise(function (resolve, reject) {
		sharp(_basepath + data)
			.resize(w)
			.toFile(_basepath + des)
			.then((data) => {
				return resolve(data);
			})
			.catch((err) => {
				console.log("err", err);
				return resolve(false);
			});
	});
};

photo.resizeCustom = function (data, des, typeUpload) {
	var sharp = require("sharp");
	let appearanceImage = this.appearanceImage(typeUpload);
	return new Promise(function (resolve, reject) {
		const image = sharp(_basepath + data);
		image.metadata().then(function (metadata) {
			// console.log(metadata)
			let w = appearanceImage.width;
			if (metadata.width < w) {
				w = Math.round(metadata.width / 2);
			}
			if (appearanceImage.watermark) {
				if (appearanceImage.resize) {
					if (appearanceImage.resize_all) {
						return image
							.resize(w, appearanceImage.height)
							.composite([{ input: _basepath + "public/admin/images/avatar/default.jpg", gravity: "southeast" }])
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							});
					} else {
						return image
							.resize(w)
							.composite([{ input: _basepath + "public/admin/images/avatar/logo11_1.png", gravity: "southeast" }])
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							});
					}
				} else {
					return (
						image
							// .resize(w)
							.composite([{ input: _basepath + "public/admin/images/avatar/logo11_1.png", gravity: "southeast" }])
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							})
					);
				}
			} else {
				if (appearanceImage.resize) {
					if (appearanceImage.resize_all) {
						return image
							.resize(w, appearanceImage.height)
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							});
					} else {
						return image
							.resize(w)
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							});
					}
				} else {
					return (
						image
							// .resize(w)
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							})
					);
				}
			}
		});
	});
};

photo.appearanceImage = function (type) {
	let appearance = {};
	switch (type) {
		case "slider":
			appearance = {
				resize: false,
				width: 1920,
				height: 1000,
				watermark: false,
				resize_all: false,
			};
			break;

		case "partner":
			appearance = {
				resize: true,
				width: 183,
				height: 132,
				watermark: false,
				resize_all: false,
			};
			break;

		case "project":
			appearance = {
				resize: true,
				width: 1000,
				height: 667,
				watermark: false,
				resize_all: false,
			};
			break;
		case "testimonial":
			appearance = {
				resize: true,
				width: 160,
				height: 160,
				watermark: false,
				resize_all: false,
			};
			break;
		case "image":
			appearance = {
				resize: true,
				width: 1000,
				height: 667,
				watermark: false,
				resize_all: false,
			};
			break;

		case "team":
			appearance = {
				resize: true,
				width: 370,
				height: 370,
				watermark: false,
				resize_all: false,
			};
			break;

		default:
			appearance = {
				resize: true,
				width: 1920,
				height: 1000,
				watermark: false,
				resize_all: false,
			};
			break;
	}
	return appearance;
};

photo.readImage = function (image, type) {
	try {
		// console.log(image);
		if (image) {
			var ext = image.split(".").pop().toLowerCase();

			var name = image.split(".").shift();
			if (type && name && ext) {
				return _baseUrl + name + "_" + type + "." + ext + "?v=" + _versionCache;
			} else {
				return _baseUrl + image + "?v=" + _versionCache;
			}
		}
		return _baseUrl + image + "?v=" + _versionCache;
	} catch (error) {
		console.log(error);
		return _baseUrl + image + "?v=" + _versionCache;
	}
};

photo.get_size_buffer = function (data) {
	var sharp = require("sharp");
	return new Promise(function (resolve, reject) {
		const image = sharp(data);
		image.metadata().then(function (metadata) {
			return resolve(metadata);
		});
	});
};

photo.resizeCustom = function (data, des, typeUpload) {
	var sharp = require("sharp");
	let appearanceImage = this.appearanceImage(typeUpload);
	return new Promise(function (resolve, reject) {
		const image = sharp(_basepath + data);
		image.metadata().then(function (metadata) {
			// console.log(metadata)
			let w = appearanceImage.width;
			if (metadata.width < w) {
				w = Math.round(metadata.width / 2);
			}
			if (appearanceImage.watermark) {
				if (appearanceImage.resize) {
					if (appearanceImage.resize_all) {
						return image
							.resize(w, appearanceImage.height)
							.composite([{ input: _basepath + "public/admin/images/avatar/default.jpg", gravity: "southeast" }])
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							});
					} else {
						return image
							.resize(w)
							.composite([{ input: _basepath + "public/admin/images/avatar/logo11_1.png", gravity: "southeast" }])
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							});
					}
				} else {
					return (
						image
							// .resize(w)
							.composite([{ input: _basepath + "public/admin/images/avatar/logo11_1.png", gravity: "southeast" }])
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							})
					);
				}
			} else {
				if (appearanceImage.resize) {
					if (appearanceImage.resize_all) {
						return image
							.resize(w, appearanceImage.height)
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							});
					} else {
						return image
							.resize(w)
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							});
					}
				} else {
					return (
						image
							// .resize(w)
							.toFile(_basepath + des)
							.then((data) => {
								// console.log(data)
								return resolve(data);
							})
							.catch((err) => {
								console.log("err", err);
								return resolve(false);
							})
					);
				}
			}
		});
	});
};

const { createCanvas, loadImage } = require("canvas");
const path = require("path");

photo.generateCard = async (prefix = "Quý khách", fullName = "", slug = "") => {
	const width = 1200;
	const height = 630;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	const bg = await loadImage("./public/frontend/assets/images/thumb.png");
	ctx.drawImage(bg, 0, 0, width, height);

	const baseX = 400;
	const baseY = 555;

	// 1. Vẽ prefix: (prefix truyền vào)
	ctx.fillStyle = "#a00000";
	ctx.font = "italic 26px Montserrat";
	ctx.fillText(prefix, baseX, baseY);

	// Lấy chiều rộng của prefix + 1 space
	const prefixWidth = ctx.measureText(prefix + " ").width;

	// 2. Vẽ tên (bold + lớn)
	ctx.font = "italic bold 35px Montserrat";
	ctx.fillText(fullName, baseX + prefixWidth, baseY);

	const buffer = canvas.toBuffer("image/png");
	const outputDir = path.join(process.cwd(), "media/cards");

	// nếu thư mục chưa tồn tại → tự tạo
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	// tạo tên file
	const filename = `card-${slug}${Date.now()}.png`;
	const filePath = path.join(outputDir, filename);
	fs.writeFileSync(filePath, buffer);
	console.log(`✔ ${filename} đã tạo!`);
	return `media/cards/${filename}`;
};

const QRCode = require("qrcode");
photo.generateQR = async (url = "", slug = "") => {
	return new Promise((resolve, reject) => {
		QRCode.toBuffer(url, { type: "png" }, (err, buffer) => {
			if (err) return reject(err);

			const outputDir = path.join(process.cwd(), "media/qrcodes");

			// nếu thư mục chưa tồn tại → tạo mới
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			// tên file
			const filename = `qrcode-${slug}-${Date.now()}.png`;
			const filePath = path.join(outputDir, filename);

			// lưu file
			fs.writeFileSync(filePath, buffer);

			// trả về tên file (hoặc đường dẫn)
			resolve({
				filename,
				filePath,
				name: `media/qrcodes/${filename}`,
			});
		});
	});
};

module.exports = photo;
