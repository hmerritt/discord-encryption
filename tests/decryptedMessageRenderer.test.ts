// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	cleanupDecryptedMessageRenderer,
	renderDecryptedMessage,
	setDecryptedMessageState
} from "../src/lib/decryptedMessageRenderer";
import { log } from "../src/lib/log";

vi.mock("../src/lib/helpers", () => ({
	getChannelId: () => "channel-1"
}));

vi.mock("../src/lib/log", () => ({
	log: { warn: vi.fn() }
}));

const ciphertext = "#!enc/encrypted-payload";

const createMessage = () => {
	const element = document.createElement("div");
	element.className = "messageContent-test";
	element.textContent = ciphertext;
	document.body.append(element);
	return element;
};

const installBdApi = (parser: unknown, render = vi.fn(), unmount = vi.fn()) => {
	const createElement = vi.fn((type, props, ...children) => ({
		props: { ...props, children },
		type
	}));

	globalThis.BdApi = {
		React: { Fragment: Symbol("Fragment"), createElement },
		ReactDOM: {
			createRoot: vi.fn(() => ({ render, unmount }))
		},
		Webpack: {
			getByKeys: vi.fn(() => parser)
		}
	} as any;

	return { createElement, render, unmount };
};

describe("decrypted message rendering", () => {
	beforeEach(() => {
		document.body.replaceChildren();
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanupDecryptedMessageRenderer();
		document.body.replaceChildren();
	});

	it("renders attacker-controlled HTML and CSS as literal plaintext when Markdown is unavailable", () => {
		installBdApi(null);
		const element = createMessage();
		const plaintext =
			'<style>body{display:none}</style><form><img src=x onerror="alert(1)"><svg onload="alert(1)"></svg></form>';

		renderDecryptedMessage(element, plaintext, ciphertext, "channel-1", "password");

		expect(element.textContent).toBe(plaintext);
		expect(element.querySelector("style, form, img, svg, script")).toBeNull();
		expect(document.head.querySelector("style")).toBeNull();
		expect(element.classList.contains("decrypted")).toBe(true);
		expect(element.classList.contains("not-decrypted")).toBe(false);
	});

	it("preserves ordinary special characters and Unicode in the plaintext fallback", () => {
		installBdApi(null);
		const element = createMessage();
		const plaintext = "1 < 2 & 3 > 2 — 🔐";

		renderDecryptedMessage(element, plaintext, ciphertext, "channel-1", "password");

		expect(element.textContent).toBe(plaintext);
		expect(element.childNodes).toHaveLength(1);
		expect(element.firstChild?.nodeType).toBe(Node.TEXT_NODE);
	});

	it.each([
		["single", "first\nsecond"],
		["double", "first\n\nsecond"],
		["triple", "first\n\n\nsecond"],
		["leading", "\n\nfirst"],
		["trailing", "first\n\n"],
		["whitespace-only", " \n \n  "]
	])("preserves every %s line break in the plaintext fallback", (_, plaintext) => {
		installBdApi(null);
		const element = createMessage();

		renderDecryptedMessage(element, plaintext, ciphertext, "channel-1", "password");

		expect(element.textContent).toBe(plaintext);
		expect(element.childNodes).toHaveLength(1);
		expect(element.firstChild?.nodeType).toBe(Node.TEXT_NODE);
		expect(element.children).toHaveLength(0);
	});

	it("logs only one compatibility warning when the Markdown parser is unavailable", () => {
		installBdApi(null);
		const first = createMessage();
		const second = createMessage();

		renderDecryptedMessage(first, "first", ciphertext, "channel-1", "password");
		renderDecryptedMessage(second, "second", ciphertext, "channel-1", "password");

		expect(log.warn).toHaveBeenCalledOnce();
	});

	it("passes plaintext to Discord's Markdown parser and renders only its React result", () => {
		const parsed = [{ type: "strong", value: "safe parser output" }];
		const parser = {
			parse: vi.fn(() => parsed),
			parseEmbedTitle: vi.fn(),
			parseTopic: vi.fn()
		};
		const api = installBdApi(parser);
		const element = createMessage();
		const plaintext = "**bold** <style>body{display:none}</style>";

		renderDecryptedMessage(element, plaintext, ciphertext, "channel-1", "password");

		expect(parser.parse).toHaveBeenCalledWith(plaintext, true, {
			allowEmojiLinks: true,
			allowHeading: true,
			allowLinks: true,
			allowList: true,
			channelId: "channel-1"
		});
		expect(api.createElement).toHaveBeenCalledWith(
			BdApi.React.Fragment,
			null,
			parsed
		);
		expect(api.render).toHaveBeenCalledOnce();
		const mount = element.querySelector<HTMLElement>("[data-encryption-render-root]");
		expect(mount).not.toBeNull();
		expect(mount?.style.whiteSpace).toBe("break-spaces");
		expect(element.querySelector("style")).toBeNull();
		expect(element.classList.contains("decrypted")).toBe(true);
	});

	it("falls back to literal plaintext if Discord's parser throws", () => {
		const parser = {
			parse: vi.fn(() => {
				throw new Error("parser changed");
			}),
			parseEmbedTitle: vi.fn(),
			parseTopic: vi.fn()
		};
		installBdApi(parser);
		const element = createMessage();
		const plaintext = "<img src=x onerror=alert(1)>";

		renderDecryptedMessage(element, plaintext, ciphertext, "channel-1", "password");

		expect(element.textContent).toBe(plaintext);
		expect(element.querySelector("img")).toBeNull();
		expect(log.warn).toHaveBeenCalledOnce();
	});

	it("uses mutually exclusive decrypted and not-decrypted classes", () => {
		installBdApi(null);
		const element = createMessage();

		setDecryptedMessageState(element, "not-decrypted");
		expect(element.classList.contains("not-decrypted")).toBe(true);
		expect(element.classList.contains("decrypted")).toBe(false);
		expect(element.textContent).toBe(ciphertext);

		setDecryptedMessageState(element, "pending");
		expect(element.classList.contains("not-decrypted")).toBe(false);
		expect(element.classList.contains("decrypted")).toBe(false);

		setDecryptedMessageState(element, "decrypted");
		expect(element.classList.contains("not-decrypted")).toBe(false);
		expect(element.classList.contains("decrypted")).toBe(true);
	});

	it("unmounts React roots and restores ciphertext during cleanup", () => {
		const parser = {
			parse: vi.fn(() => []),
			parseEmbedTitle: vi.fn(),
			parseTopic: vi.fn()
		};
		const api = installBdApi(parser);
		const element = createMessage();

		renderDecryptedMessage(element, "decrypted", ciphertext, "channel-1", "password");
		cleanupDecryptedMessageRenderer();

		expect(api.unmount).toHaveBeenCalledOnce();
		expect(element.textContent).toBe(ciphertext);
		expect(element.classList.contains("decrypted")).toBe(false);
		expect(element.classList.contains("not-decrypted")).toBe(false);
	});
});
