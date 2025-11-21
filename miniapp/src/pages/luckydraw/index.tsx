import useSeo from "@/hooks/useSeo";
import React, { FC, useRef, useState } from "react";
import Button from "@/components/button/button";
import Wheel from "@/components/wheel";
import { WheelHandle } from "@/types/types";
import { itemsWheel } from "@/components/wheel/data-wheel";
import { MODAL_NAME } from "@/types/enums";
import { useRecoilState } from "recoil";
import { modalAtom } from "@/stores/modal";
const Luckydraw: FC = () => {
	useSeo({ title: "Vòng quay may mắn" });
	const [, setComModal] = useRecoilState(modalAtom);
	const wheelRef = useRef<WheelHandle>(null);
	const [isProcess, setIsProcess] = useState(false);
	// Khi người chơi nhấn "Quay"
	const handlePlayGame = () => {
		if (isProcess) {
			return;
		}
		const totalItems = itemsWheel?.length; // Lấy số lượng phần thưởng thực tế
		const randomPosition = Math.floor(Math.random() * totalItems) + 1;
		console.log("Quay vòng quay...", randomPosition);
		wheelRef.current?.set("defaultSpin");
		setTimeout(() => {
			setIsProcess(true);
			wheelRef.current?.start("start", randomPosition);
		}, 100);
	};

	const handleWheelStop = (position: number) => {
		console.log("Vòng quay đã dừng!", position); // Có thể xử lý kết quả tại đây
		setComModal((prevState) => ({
			...prevState,
			open: true,
			name: MODAL_NAME.NOTI,
			content: itemsWheel?.[position - 1]?.name,
		}));
		setIsProcess(false);
	};
	return (
		<>
			<h2 className="font-bold  text-2xl text-emerald-700 pb-4 text-center uppercase">Luckydraw page</h2>
			<Wheel ref={wheelRef} wheelResultPosition={5} handlePlayGame={handlePlayGame} handleWheelStop={handleWheelStop} />
			<div className="flex  items-center justify-center  bg-yellow-600 uppercase rounded-md shadow-md p-1 w-1/2 m-auto">
				<Button text="Quay" customClass="text-2xl text-center" onClick={handlePlayGame} />
			</div>
		</>
	);
};

export default Luckydraw;
