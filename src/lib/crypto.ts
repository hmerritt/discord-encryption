import $ from "jquery";

import { getChannel } from "../state/actions";
import { log } from "./log";

export const PREFIX = "#!enc/";
export const ALGO = { name: "AES-GCM", length: 256 } as const;

/**
 * Derive a Master Key (Key Material) from the User's Password.
 *
 * Uses `PBKDF2` to convert a string password into a cryptographic key object.
 */
export const deriveKey = async (password: string): Promise<CryptoKey> => {
	const enc = new TextEncoder();
	const keyMaterial = await window.crypto.subtle.importKey(
		"raw",
		enc.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveKey"]
	);

	return keyMaterial;
};

/**
 * Encrypt the message.
 *
 * Generates a unique Salt and IV, encrypts via AES-GCM, and bundles everything.
 */
export const encrypt = async (plaintext: string, password: string): Promise<string> => {
	const enc = new TextEncoder();

	// Generate a random salt (16 bytes) for this specific message
	const salt = window.crypto.getRandomValues(new Uint8Array(16));
	const keyMaterial = await deriveKey(password);

	// Derive the actual AES key using PBKDF2
	const key = await window.crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt,
			iterations: 100000,
			hash: "SHA-256"
		},
		keyMaterial,
		ALGO,
		false,
		["encrypt"]
	);

	// Generate a unique IV (12 bytes) for this message
	// 12 bytes is the standard recommended size for AES-GCM
	const iv = window.crypto.getRandomValues(new Uint8Array(12));

	// Encrypt
	const ciphertext = await window.crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv },
		key,
		enc.encode(plaintext)
	);

	// PACKING: Salt (16) + IV (12) + Ciphertext (N) -> Base64
	const bundle = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
	bundle.set(salt, 0);
	bundle.set(iv, salt.length);
	bundle.set(new Uint8Array(ciphertext), salt.length + iv.length);

	return arrayBufferToBase64(bundle.buffer);
};

/**
 * Decrypt a message.
 *
 * Unpacks the `Salt` and `IV`, re-derives the key, and decrypts.
 */
export const decrypt = async (
	base64Bundle: string,
	password: string
): Promise<string> => {
	const bundleBuffer = base64ToArrayBuffer(base64Bundle);
	const bundle = new Uint8Array(bundleBuffer);

	// Guard clause for minimum length (Salt 16 + IV 12 = 28 bytes minimum)
	if (bundle.byteLength < 28) {
		throw new Error("Data too short to contain Salt and IV");
	}

	// Extract parts
	const salt = bundle.slice(0, 16);
	const iv = bundle.slice(16, 28);
	const data = bundle.slice(28);

	// Re-derive the key using the extracted salt
	const keyMaterial = await deriveKey(password);
	const key = await window.crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt,
			iterations: 100_000,
			hash: "SHA-256"
		},
		keyMaterial,
		ALGO,
		false,
		["decrypt"]
	);

	// Decrypt
	const decrypted = await window.crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: iv },
		key,
		data
	);

	return new TextDecoder().decode(decrypted);
};

// --- Helpers ---

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
	let binary = "";
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
	const binary_string = window.atob(base64);
	const len = binary_string.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
};

export const isMessageEncrypted = (msg: string) => msg?.startsWith(PREFIX);

export const decryptAllMessages = async () => {
	let markup = $(`div[class*="messageContent"]`);
	if (!markup || markup.length === 0) markup = $(`div[id*="message-content"]`);

	$(markup).each(function () {
		const message = $(this).text().trim();
		if (!isMessageEncrypted(message)) return;

		decrypt(message.slice(PREFIX.length), getChannel().password)
			.then((decrypted) => {
				if (!decrypted) throw "decryption failed";
				$(this)
					.html(decrypted)
					.removeClass("not-decrypted")
					.addClass("decrypted");
			})
			.catch((e) => {
				log.error(`Error decrypting message`, e);
				$(this).removeClass("decrypted").addClass("not-decrypted");
			});
	});
};
