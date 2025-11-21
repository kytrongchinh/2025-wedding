import React, { FC } from "react";
// -- Other --
import _ from "lodash";
import { Link } from "react-router-dom";
import { ROUTERS } from "@/types/contants";
import { useRecoilState } from "recoil";
import { userAtom } from "@/stores/user";
import { adtimaAtom } from "@/stores/adtima";
import { MY_ROUTERS } from "@/types/enums";
import { CommonProps } from "@/types/interface";

const MyCmp: FC<CommonProps> = (props) => {
	const { cmpData, register, errors, type } = props;
	const [user, setUser] = useRecoilState(userAtom);
	const [adtima, setAdtima] = useRecoilState(adtimaAtom);

	if (!_.isArray(cmpData?.termList)) return;

	const renderError = (term) => {
		let error = "";
		switch (term?.name) {
			case "Đủ 18 tuổi":
				error = `Vui lòng xác nhận đã đủ 18 tuổi`;
				break;
			case "Đồng ý thể lệ và theo dõi OA":
				error = `Vui lòng đồng ý thể lệ và theo dõi OA`;
				break;
			case "Chính sách thỏa thuận sử dụng dịch vụ":
				error = `Vui lòng đồng ý điều khoản chương trình`;
				break;
			default:
				error = `Vui lòng đồng ý `;
				break;
		}
		return error;
	};
	const renderLabel = (name) => {
		if (name == "Đủ 18 tuổi") {
			return <>Tôi xác nhận tôi đủ 18 tuổi*</>;
		} else if (name == "Đồng ý thể lệ và theo dõi OA") {
			return (
				<span className="px-2 text-wrap">
					Tôi đồng ý với <Link to={ROUTERS.TNC}>Thể lệ chương trình và theo dõi Zalo OA Milo Việt Nam</Link>
				</span>
			);
		} else if (name == "Chính sách thỏa thuận sử dụng dịch vụ") {
			return (
				<span className="px-2 text-wrap">
					Tôi đã đọc, hiểu và đồng ý với{" "}
					<Link to={MY_ROUTERS.POLICY} className="text-blue-700 underline">
						Điều Khoản Sử Dụng, Thông Báo Về Quyền Riêng Tư, Thông Báo về Cookies của Nestlé
					</Link>
					. Tôi đồng ý nhận quà tặng, sản phẩm hay các thông tin khuyến mại, sự kiện, khảo sát, tư vấn miễn phí từ nhãn hàng MILO cũng như các nhãn hàng khác của Nestlé
					và La Vie qua điện thoại, tin nhắn SMS, email hoặc các nền tảng trực tuyến khác.(*)
				</span>
			);
		} else {
			return <span className="px-2 text-wrap">{name}</span>;
		}
	};

	const handleClickLink = async (e, label, name) => {
		if (label == "Đồng ý thể lệ và theo dõi OA") {
			e.preventDefault();

			const is_check = e.target.checked;

			if (is_check == true) {
				if (type == "quiz" && user?.user_is_follower == true) {
					setTimeout(() => {
						e.target.checked = true;
					}, 200);
				} else {
				}
			} else {
				if (user?.user_is_follower == true) {
					props.clearErrors(name);
					props.setValue(name, true);
				}
			}
		}
	};

	const renderTermCusstom = () => {
		return cmpData.termList.map(({ values }) => {
			const term = values[0];
			const nameCheckbox = "checkbox_" + term?._id;
			const label = term?.name;
			const link = term?.link;
			return (
				<div className="form-groups checkbox py-1" key={term._id}>
					<div className="form-groups-w">
						<input {...register(nameCheckbox, { required: true })} type="checkbox" id={term._id} onClick={(e) => handleClickLink(e, label, nameCheckbox)} />
						<label htmlFor={term._id} className="">
							<span></span>
							{renderLabel(label)}
						</label>
						{errors?.["checkbox_" + term._id] && <div className="text-sm text-red-500 italic" dangerouslySetInnerHTML={{ __html: renderError(term) }}></div>}
					</div>
				</div>
			);
		});
	};

	return <>{renderTermCusstom()}</>;
};

export default MyCmp;
