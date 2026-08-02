import { getChannelId } from "./helpers";
import { log } from "./log";

export type DiscordReactNode = unknown;

export type DiscordMarkdownParser = {
	parse: (
		plaintext: string,
		inline?: boolean,
		options?: { channelId?: string }
	) => DiscordReactNode;
	parseTopic: (...args: any[]) => DiscordReactNode;
	parseEmbedTitle: (...args: any[]) => DiscordReactNode;
};

export type DecryptedMessageState = "pending" | "decrypted" | "not-decrypted";

type ReactRoot = {
	render: (node: DiscordReactNode) => void;
	unmount: () => void;
};

type RenderedMessage = {
	channelId: string;
	ciphertext: string;
	password: string;
	mount?: HTMLElement;
	root?: ReactRoot;
};

const renderedMessages = new Map<HTMLElement, RenderedMessage>();

let markdownParser: DiscordMarkdownParser | null | undefined;
let removalObserver: MutationObserver | undefined;
let warnedAboutFallback = false;

const isMarkdownParser = (value: unknown): value is DiscordMarkdownParser => {
	const parser = value as Partial<DiscordMarkdownParser> | null;
	return (
		!!parser &&
		typeof parser.parse === "function" &&
		typeof parser.parseTopic === "function" &&
		typeof parser.parseEmbedTitle === "function"
	);
};

const warnOnce = (message: string, error?: unknown) => {
	if (warnedAboutFallback) return;
	warnedAboutFallback = true;
	log.warn(message, error);
};

const resolveMarkdownParser = (): DiscordMarkdownParser | null => {
	if (markdownParser !== undefined) return markdownParser;

	try {
		const candidate = BdApi.Webpack.getByKeys(
			"parse",
			"parseTopic",
			"parseEmbedTitle",
			{ searchExports: true }
		);
		markdownParser = isMarkdownParser(candidate) ? candidate : null;
	} catch (error) {
		markdownParser = null;
		warnOnce(
			"Could not resolve Discord's Markdown parser; decrypted messages will use safe plaintext.",
			error
		);
	}

	if (!markdownParser) {
		warnOnce(
			"Could not resolve Discord's Markdown parser; decrypted messages will use safe plaintext."
		);
	}
	return markdownParser;
};

const releaseRenderedMessage = (element: HTMLElement, restoreCiphertext: boolean) => {
	const rendered = renderedMessages.get(element);
	if (!rendered) return;

	try {
		rendered.root?.unmount();
	} catch (error) {
		log.warn("Could not unmount a decrypted message renderer.", error);
	}

	renderedMessages.delete(element);
	element.classList.remove("decrypted", "not-decrypted");

	if (restoreCiphertext && element.isConnected) {
		element.replaceChildren(document.createTextNode(rendered.ciphertext));
	}
};

const cleanDetachedRenderers = () => {
	for (const [element, rendered] of renderedMessages) {
		if (!element.isConnected || (rendered.mount && !rendered.mount.isConnected)) {
			releaseRenderedMessage(element, false);
		}
	}
};

export const initializeDecryptedMessageRenderer = () => {
	resolveMarkdownParser();

	if (removalObserver || !document.body) return;
	removalObserver = new MutationObserver(cleanDetachedRenderers);
	removalObserver.observe(document.body, { childList: true, subtree: true });
};

export const cleanupDecryptedMessageRenderer = () => {
	removalObserver?.disconnect();
	removalObserver = undefined;

	for (const element of [...renderedMessages.keys()]) {
		releaseRenderedMessage(element, true);
	}

	markdownParser = undefined;
	warnedAboutFallback = false;
};

export const getRenderedCiphertext = (element: HTMLElement) =>
	renderedMessages.get(element)?.ciphertext;

export const isMessageRenderedFor = (
	element: HTMLElement,
	ciphertext: string,
	channelId: string,
	password: string
) => {
	const rendered = renderedMessages.get(element);
	return (
		rendered?.ciphertext === ciphertext &&
		rendered.channelId === channelId &&
		rendered.password === password
	);
};

export const restoreRenderedMessage = (element: HTMLElement) => {
	releaseRenderedMessage(element, true);
};

export const setDecryptedMessageState = (
	element: HTMLElement,
	state: DecryptedMessageState
) => {
	element.classList.toggle("decrypted", state === "decrypted");
	element.classList.toggle("not-decrypted", state === "not-decrypted");
};

const renderPlaintext = (element: HTMLElement, plaintext: string) => {
	element.replaceChildren(document.createTextNode(plaintext));
};

export const renderDecryptedMessage = (
	element: HTMLElement,
	plaintext: string,
	ciphertext: string,
	channelId = getChannelId(),
	password = ""
) => {
	releaseRenderedMessage(element, false);

	const rendered: RenderedMessage = { channelId, ciphertext, password };
	const parser = resolveMarkdownParser();

	if (parser) {
		let root: ReactRoot | undefined;
		try {
			const parsed = parser.parse(plaintext, false, { channelId });
			const mount = document.createElement("div");
			mount.setAttribute("data-encryption-render-root", "");
			mount.style.display = "contents";

			const createRoot = BdApi.ReactDOM?.createRoot;
			if (typeof createRoot !== "function") {
				throw new Error("BdApi.ReactDOM.createRoot is unavailable");
			}

			root = createRoot(mount) as ReactRoot;
			const node = BdApi.React.createElement(BdApi.React.Fragment, null, parsed);

			element.replaceChildren(mount);
			root.render(node);
			rendered.mount = mount;
			rendered.root = root;
		} catch (error) {
			try {
				root?.unmount();
			} catch {
				// The safe plaintext replacement below still removes the failed mount.
			}
			markdownParser = null;
			warnOnce(
				"Discord's Markdown parser failed; decrypted messages will use safe plaintext.",
				error
			);
			renderPlaintext(element, plaintext);
		}
	} else {
		renderPlaintext(element, plaintext);
	}

	renderedMessages.set(element, rendered);
	setDecryptedMessageState(element, "decrypted");
};
