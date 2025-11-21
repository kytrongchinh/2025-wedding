import MyCmp from "@/components/cmp/my-cmp";
import useCMPData from "@/hooks/useCMPData";
import useSeo from "@/hooks/useSeo";
import { userAtom } from "@/stores/user";
import { CmpDataResponse, dataConsent } from "@/types/interface";
import React, { FC, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { useForm } from "react-hook-form";
const Form: FC = () => {
	const { loadCMPData, postConsents } = useCMPData();
	const [cmpData, setCmpData] = useState<CmpDataResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const user = useRecoilValue(userAtom);
	const user_id = user?._id;
	useEffect(() => {
		const fetchData = async () => {
			if (!user_id) return;
			setLoading(true);
			const data = await loadCMPData(user_id);
			console.log(data, "sss");
			setCmpData(data);
			setLoading(false);
		};

		fetchData();
	}, [user_id]);
	useSeo({ title: "Điền thông tin" });
	const [formData, setFormData] = useState({ fullname: "", phone: "", address: "" });
	const {
		register,
		handleSubmit,
		formState,
		formState: { errors },
		setError,
		setValue,
		clearErrors,
		getValues,
	} = useForm({ shouldFocusError: true });
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};
	const onSubmit = async (data) => {
		if (!cmpData) return;

		const data_conss = {
			...cmpData?.requestData,
			extend_uid: user_id,
			term_id: cmpData.requestData.term_id,
			property_last_data: JSON.stringify(formData),
			mapping_key: cmpData.mappingKey,
			last_platform: cmpData?.requestData?.platform,
			last_browser: cmpData?.requestData?.browser,
		};

		const success = await postConsents(data_conss);

		if (success) {
			alert("Consent submitted successfully!");
		} else {
			alert("Failed to submit consent.");
		}
	};
	const onError = (e) => {
		console.log(`==>`, e);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit, onError)} className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mb-28">
			<h2 className="text-2xl font-semibold mb-4">Consent Form</h2>
			<div className="mb-2">
				<label className="block text-gray-700 font-medium mb-2">Fullname</label>
				<input
					type="text"
					{...register("fullname", {
						required: true,
						maxLength: 70,
						minLength: 1,
						pattern: /[a-zA-Z0-9]/,
					})}
					// defaultValue={user?.name || ""}
					maxLength={70}
					placeholder="Họ tên"
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					onChange={handleChange}
				/>
				{errors.fullname && <div className="error text-sm text-red-500 italic">Vui lòng nhập họ tên</div>}
			</div>
			<div className="mb-2">
				<label className="block text-gray-700 font-medium mb-2">Phone</label>
				<input
					type="text"
					{...register("phone", {
						required: true,
						// valueAsNumber: true,
						maxLength: 10,
						minLength: 10,
						// pattern: /[0-9]{10}/,
						pattern: /(03|05|07|08|09)+([0-9]{8})\b/,
					})}
					defaultValue={user?.phone || ""}
					maxLength={10}
					inputMode="tel"
					placeholder="Số điện thoại*"
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					onChange={handleChange}
				/>
				{errors.phone && errors.phone?.message != "-102" && <div className="error text-sm text-red-500 italic">Vui lòng nhập số điện thoại hợp lệ</div>}
				{errors.phone && errors.phone?.message == "-102" && (
					<div className="error text-sm text-red-500 italic">Số điện thoại đã đăng ký, vui lòng nhập số điện thoại khác!</div>
				)}
			</div>
			<div className="mb-2">
				<label className="block text-gray-700 font-medium mb-2">Address</label>
				<input
					type="text"
					{...register("address", {
						required: true,
						maxLength: 120,
						minLength: 1,
						pattern: /[a-zA-Z0-9]/,
					})}
					maxLength={120}
					placeholder="Địa chỉ"
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					onChange={handleChange}
				/>
				{errors.address && <div className="error text-sm text-red-500 italic">Vui lòng địa chỉ</div>}
			</div>
			<MyCmp cmpData={cmpData} register={register} errors={errors} setValue={setValue} clearErrors={clearErrors} />
			<button type="submit" onClick={handleSubmit(onSubmit, onError)} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
				Submit
			</button>
		</form>
	);
};

export default Form;
