import React, { FC } from "react";
import "./css.scss";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { ButtonProps } from "@/types/interface";

const Button: FC<ButtonProps> = ({ text, buttonType = "", onClick, path, align = "", customClass = "" }) => {
	const navigate = useNavigate();
	const handleButtonClick = () => {
		if (!path && onClick) {
			onClick();
		} else {
			navigate(path || "/", { replace: true });
		}
	};
	return (
		<div className={`button ${buttonType} ${align} ${customClass}`} onClick={handleButtonClick}>
			<div className="wrap">{text}</div>
		</div>
	);
};
export default Button;
