/*
 * CSS styles
 */
export const styles = css`
	main,
	form {
		position: relative !important;
		overflow: visible !important;
	}

	.encryptionButton {
		cursor: pointer;
		flex: 0 0 auto;
		padding: 12px 10px;
		position: sticky;
		transition: all 280ms ease;
	}

	.encryptionButton__button {
		position: sticky;
		box-sizing: border-box;
		height: unset;
		padding: 0;
		top: 0;
		margin: 0;
		margin-inline-start: -14px;
		margin-inline-end: 10px;
		border-radius: 8px;
		transition-duration: 0.2s;
		align-items: center;
		display: flex;
		justify-content: center;
	}
	.encryptionButton:hover .encryptionButton__button,
	.encryptionButton:hover .encryptionButton__buttonWrapper {
		background-color: color-mix(
			in oklab,
			hsl(240 calc(1 * 4%) 60.784% /0.23921568627450981) 100%,
			hsl(0 0% 0% /0.23921568627450981) 0%
		);
	}

	.encryptionButton__buttonWrapper {
		transform: none;
		border-radius: 8px;
		height: 22px;
		padding: 6px;
		transition-duration: 0.2s;
	}

	.encryptionButton svg {
		width: 22px;
		height: 22px;
	}

	.encryptionButton[state="true"] path {
		fill: #43b581;
	}
	.encryptionButton[state="false"] path {
		fill: #b9bbbe;
	}

	.encryptionButton[state="true"]:hover path {
		fill: #1c9c6d;
	}
	.encryptionButton[state="false"]:hover path {
		fill: #dedede;
	}

	#encryptionInput {
		position: absolute;
		left: 8px;
		bottom: 60px;
		width: 280px;
		height: 40px;
		z-index: 9999999;
		overflow: hidden;
		border-radius: 5px;
		background-color: #ff2949;
		transition: all 280ms ease 10ms;
	}

	#encryptionInput svg {
		position: absolute;
		cursor: pointer;
		top: 8px;
		left: 10px;
		z-index: 1;
	}

	#encryptionInput input {
		position: absolute;
		top: 0px;
		left: 34px;
		width: 100%;
		height: 100%;
		border: none;
		text-indent: 4px;
		border-radius: 5px;
		background-color: #ff2949;
		transition: all 280ms ease;
		outline: 0px !important;
		-webkit-appearance: none;
		-webkit-box-shadow: none;
		box-shadow: none;
		resize: none;
		color: #ddd;
		font-size: 0.88em;
		padding: 1px 8px;
		white-space: nowrap;
	}
	#encryptionInput input::placeholder {
		color: #ddd;
	}

	#encryptionInput.nice-password,
	#encryptionInput.nice-password input {
		background-color: rgb(67, 181, 129);
	}

	.decrypted {
		color: #43b581 !important;
	}
	.decrypted a {
		color: #1c9c6d !important;
	}
	.not-decrypted {
		color: #ff2949 !important;
	}

	.updatePanel {
		position: absolute;
		display: flex;
		align-items: center;
		top: 15px;
		left: 0px;
		width: 100%;
		height: 40px;
		z-index: 10;
		overflow: hidden;
		cursor: pointer;
		border-radius: 5px;
		background-color: #7289da;
		-webkit-user-select: none;
		user-select: none;
		transition: all 280ms ease 40ms;
	}
	.updatePanel:hover {
		background-color: #677bc4;
	}
	.updatePanel:active {
		background-color: #5b6eae;
	}

	.updatePanel h2 {
		color: #fff;
		font-size: 0.85em;
		margin-left: 1.2em;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.updatePanel span[action="close"] {
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 77px;
		height: 24px;
		white-space: nowrap;
		margin-right: 1.2em;
		margin-left: auto;
		border-radius: 3px;
		border: 1px solid #fff;
		text-align: center;
		font-size: 0.85em;
		color: #fff;
	}
	.updatePanel span[action="close"]:hover {
		color: #7289da;
		background-color: #fff;
	}

	.animated {
		animation-duration: 280ms;
		animation-fill-mode: both;
		-webkit-animation-duration: 280ms;
		-webkit-animation-fill-mode: both;
	}

	.fadeInUp {
		opacity: 0;
		animation-name: fadeInUp;
		-webkit-animation-name: fadeInUp;
	}
	.fadeOutDown {
		opacity: 1;
		animation-name: fadeOutDown;
		-webkit-animation-name: fadeOutDown;
	}

	@keyframes fadeInUp {
		from {
			transform: translate3d(0, -6px, 0);
		}

		to {
			transform: translate3d(0, -16px, 0);
			opacity: 1;
		}
	}
	@-webkit-keyframes fadeInUp {
		from {
			transform: translate3d(0, -6px, 0);
		}

		to {
			transform: translate3d(0, -16px, 0);
			opacity: 1;
		}
	}
	@keyframes fadeOutDown {
		from {
			transform: translate3d(0, -16px, 0);
		}

		to {
			transform: translate3d(0, -6px, 0);
			opacity: 0;
		}
	}
	@-webkit-keyframes fadeOutDown {
		from {
			transform: translate3d(0, -16px, 0);
		}

		to {
			transform: translate3d(0, -6px, 0);
			opacity: 0;
		}
	}
`;
