import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "../src/App.jsx";

function card(n, extra = {}) {
  return { id: `c00${n}`, nl: `Zin ${n}.`, en: `Sentence ${n}.`, tip: "", newWords: [], ...extra };
}

function serve(body, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
    })),
  );
}

function pool(cards) {
  return { generatedAt: "2026-10-20T21:30:00Z", wordCount: 140, cards };
}

const getCard = () => screen.getByText(/^Zin \d\.$/).closest(".card");

describe("App states", () => {
  it("shows the empty state when the file is missing", async () => {
    serve("", 404);
    render(<App />);
    expect(await screen.findByText("No cards yet. Run the build to make sentences.")).toBeInTheDocument();
  });

  it("shows the empty state when there are no cards", async () => {
    serve(pool([]));
    render(<App />);
    expect(await screen.findByText("No cards yet. Run the build to make sentences.")).toBeInTheDocument();
  });

  it("shows the error state when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    render(<App />);
    expect(
      await screen.findByText("Cards cannot load right now. Reload the page to try again."),
    ).toBeInTheDocument();
  });
});

describe("Navigation", () => {
  it("stops at the ends", async () => {
    serve(pool([card(1), card(2), card(3)]));
    render(<App />);
    await screen.findByText("1 / 3");

    fireEvent.keyDown(window, { key: "k" });
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "j" });
    fireEvent.keyDown(window, { key: "j" });
    fireEvent.keyDown(window, { key: "j" });
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("moves with j and k", async () => {
    serve(pool([card(1), card(2)]));
    render(<App />);
    await screen.findByText("1 / 2");

    fireEvent.keyDown(window, { key: "j" });
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "k" });
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("starts a new set with n", async () => {
    serve(pool([card(1), card(2), card(3)]));
    render(<App />);
    await screen.findByText("1 / 3");

    fireEvent.keyDown(window, { key: "j" });
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: " " });
    fireEvent.keyDown(window, { key: "n" });
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(getCard()).toHaveAttribute("data-flipped", "false");
  });
});

describe("Card", () => {
  it("flips with Space only", async () => {
    serve(pool([card(1)]));
    render(<App />);
    await screen.findByText("Zin 1.");

    const el = getCard();
    expect(el).toHaveAttribute("data-flipped", "false");
    fireEvent.keyDown(window, { key: " " });
    expect(el).toHaveAttribute("data-flipped", "true");
    fireEvent.keyDown(window, { key: " " });
    expect(el).toHaveAttribute("data-flipped", "false");
    fireEvent.click(el);
    expect(el).toHaveAttribute("data-flipped", "false");
    fireEvent.keyDown(window, { key: "Enter" });
    expect(el).toHaveAttribute("data-flipped", "false");
  });

  it("y copies the Dutch sentence", async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    serve(pool([card(1)]));
    render(<App />);
    await screen.findByText("Zin 1.");

    fireEvent.keyDown(window, { key: "y" });
    expect(writeText).toHaveBeenCalledWith("Zin 1.");
    expect(getCard()).toHaveAttribute("data-flipped", "false");
    expect(await screen.findByText("copied")).toBeInTheDocument();
  });

  it("y copies Dutch also when the English side shows", async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    serve(pool([card(1)]));
    render(<App />);
    await screen.findByText("Zin 1.");

    fireEvent.keyDown(window, { key: " " });
    fireEvent.keyDown(window, { key: "y" });
    expect(writeText).toHaveBeenCalledWith("Zin 1.");
    expect(await screen.findByText("copied")).toBeVisible();
  });

  it("shows copy failed when the clipboard fails", async () => {
    const writeText = vi.fn(async () => {
      throw new Error("denied");
    });
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    serve(pool([card(1)]));
    render(<App />);
    await screen.findByText("Zin 1.");

    fireEvent.keyDown(window, { key: "y" });
    expect(await screen.findByText("copy failed")).toBeInTheDocument();
  });

  it("hides an empty tip and shows a tip with text", async () => {
    serve(pool([card(1, { tip: "Verb second." })]));
    render(<App />);
    expect(await screen.findByText("Verb second.")).toBeInTheDocument();
  });
});

describe("Key hints", () => {
  it("? shows and hides the shortcuts", async () => {
    serve(pool([card(1)]));
    render(<App />);
    await screen.findByText("Zin 1.");
    expect(screen.queryByLabelText("Keyboard shortcuts")).not.toBeInTheDocument();
    expect(screen.getByText(/for shortcuts/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByLabelText("Keyboard shortcuts")).toHaveTextContent("new set");
    expect(screen.queryByText(/for shortcuts/)).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "?" });
    expect(screen.queryByLabelText("Keyboard shortcuts")).not.toBeInTheDocument();
  });

  it("Escape hides the shortcuts", async () => {
    serve(pool([card(1)]));
    render(<App />);
    await screen.findByText("Zin 1.");

    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByLabelText("Keyboard shortcuts")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByLabelText("Keyboard shortcuts")).not.toBeInTheDocument();
  });
});

describe("New words note", () => {
  it("lists new words in the set", async () => {
    serve(pool([card(1, { newWords: ["is"] }), card(2)]));
    render(<App />);
    expect(await screen.findByText(/New words in this set:/)).toHaveTextContent("is");
  });

  it("is not shown when there are no new words", async () => {
    serve(pool([card(1)]));
    render(<App />);
    await screen.findByText("Zin 1.");
    expect(screen.queryByText(/New words in this set:/)).not.toBeInTheDocument();
  });
});
