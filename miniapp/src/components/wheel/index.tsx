import React, { useImperativeHandle, forwardRef } from "react";
import { motion, useAnimation, useWillChange } from "framer-motion";
import imageSpin from "@/assets/images/wheel/spin.png";
import imageBG from "@/assets/images/wheel/circle.png";
import state from "@/assets/images/wheel/state.png";
import { itemsWheel } from "./data-wheel";
import "./wheel.scss";
import { PropsWheel, WheelHandle } from "@/types/types";

const Wheel = forwardRef<WheelHandle, PropsWheel>((props, ref) => {
	const { wheelResultPosition, handleWheelStop } = props;

	const spinControl = useAnimation();
	const willChange = useWillChange();
	const spinDuration = 0.3;
	const spinCount = 15; // Number of spins to end when API response value
	const itemsAngle = 360 / itemsWheel.length;
	const rot = 90 - itemsAngle;
	const wheelVariant = {
		defaultSpin: () => ({
			rotate: 0,
			wheelResultPositiontranslateZ: 0,
		}),
		initialStart: () => ({
			rotate: [0, 360],
			transition: {
				duration: spinDuration,
				ease: "linear",
				repeatType: "loop" as const,
				repeat: Infinity,
			},
		}),
		start: ({ endPosition }: { endPosition: number }) => {
			const totalSegments = itemsWheel.length; // Make sure this matches the actual number of items
			const itemsAngle = 360 / totalSegments; // Each segment's angle
			const offset = itemsAngle / 2; // Adjust to center the selected segment
			const finalRotation = 360 * spinCount - itemsAngle * (endPosition - 2) + offset;

			return {
				rotate: finalRotation,
				transition: {
					repeat: 0,
					duration: spinDuration * spinCount + spinDuration,
					ease: "easeOut",
				},
			};
		},
	};

	useImperativeHandle(ref, () => ({
		set: (state: string) => {
			spinControl.set(wheelVariant[state]);
		},
		start: (state: string, position = 0) => {
			spinControl.start(wheelVariant[state]({ endPosition: position })).then(() => {
				handleWheelStop(position);
			});
		},
	}));

	return (
		<>
			<motion.div className="wheel-container">
				<img src={imageBG} className="w-100" alt="Background" />
				<motion.div
					className="wheel-items"
					variants={wheelVariant}
					custom={{
						endPosition: wheelResultPosition,
					}}
					style={{ willChange, transform: "rotate(0) translateZ(0)" }}
					animate={spinControl}
					// onAnimationComplete={() => handleWheelStop(wheelResultPosition)}
				>
					<div className="bg-wrapper">
						<motion.div className="bg-inside">
							{itemsWheel.map((ele, i) => (
								<div
									key={i}
									data-position={i + 1}
									className={`wheel-item`}
									style={{
										willChange: "auto",
										background: `${ele.bgColor}`,
										transform: `rotate(${itemsAngle * i}deg) skewY(-${rot}deg)`,
									}}
								>
									<div
										style={{
											willChange: "auto",
											transform: `skewY(${rot}deg) rotate(${itemsAngle / 2}deg)`,
										}}
									>
										<img src={ele.imageURL} />
									</div>
									{i + 1}
								</div>
							))}
						</motion.div>
					</div>
				</motion.div>
				<img src={imageSpin} className="image-spin" alt="Spin" />
			</motion.div>
			<div className="state">
				<div className="img">
					<img src={state} alt="Spin" />
				</div>
			</div>
		</>
	);
});

export default Wheel;
