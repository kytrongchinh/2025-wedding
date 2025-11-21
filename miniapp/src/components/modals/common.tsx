import React, { FC } from "react";
import Modal from "react-modal";
// -- Components --
import imageClose from "@/assets/images/close.png";
import _ from "lodash";
import { CommonProps } from "@/types/interface";
import "./common.scss";
const CommonModal: FC<CommonProps> = (props) => {
	const { modalIsOpen, onClose, content, name, buttonName = "đóng", handleModalActionClick, noted = "" } = props;
	const renderContent = () => {
		let title = "THÔNG BÁO";
		if (name == "noti-success") {
			title = "CHÚC MỪNG";
		} else if (name == "noti-error") {
			title = "RẤT TIẾC";
		} else {
			title = "THÔNG BÁO";
		}
		return (
			<>
				<h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
				<div className="text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
				<div className="mt-4 text-center">
					<button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow hover:bg-blue-600 transition uppercase">
						{buttonName}
					</button>
				</div>
			</>
		);
	};

	return (
		<Modal
			isOpen={modalIsOpen}
			onRequestClose={onClose}
			contentLabel="Example Modal"
			ariaHideApp={!modalIsOpen}
			className="fixed inset-0 flex items-center justify-center z-50 p-5 position-relative z-2"
			overlayClassName="fixed inset-0 bg-black bg-opacity-50 transition-opacity my-index"
		>
			<div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
				<button onClick={onClose} className="absolute top-2 right-2 p-[1px] rounded-full bg-black">
					<img src={imageClose} alt="Close" className="w-6 h-6" />
				</button>
				<div className="modal-content-wrap">{renderContent()}</div>
			</div>
		</Modal>
	);
};
export default CommonModal;
