import { expect, vi } from "vitest";

// Browser APIs jsdom lacks, and the fetch and console policies (WS-11).

let viewportWidth = 1024;
const mediaQueries = new Set<FakeMediaQueryList>();

// Supports the `(min-width: Npx)` and `(max-width: Npx)` features antd's
// breakpoints use, joined by `and`; any other feature never matches.
function matchesViewport(media: string): boolean {
  return media.split(/\s+and\s+/i).every((feature) => {
    const match = /^\(\s*(min|max)-width:\s*([\d.]+)px\s*\)$/i.exec(
      feature.trim(),
    );
    if (!match?.[1] || !match[2]) {
      return false;
    }
    const limit = Number(match[2]);
    return match[1].toLowerCase() === "min"
      ? viewportWidth >= limit
      : viewportWidth <= limit;
  });
}

type ChangeListener = (event: MediaQueryListEvent) => void;

class FakeMediaQueryList extends EventTarget {
  readonly media: string;
  matches: boolean;
  onchange: ChangeListener | null = null;
  readonly #listeners = new Set<ChangeListener>();

  constructor(media: string) {
    super();
    this.media = media;
    this.matches = matchesViewport(media);
  }

  addListener(listener: ChangeListener): void {
    this.#listeners.add(listener);
  }

  removeListener(listener: ChangeListener): void {
    this.#listeners.delete(listener);
  }

  update(): void {
    const matches = matchesViewport(this.media);
    if (matches === this.matches) {
      return;
    }
    this.matches = matches;
    const event = Object.assign(new Event("change"), {
      matches,
      media: this.media,
    }) as MediaQueryListEvent;
    this.dispatchEvent(event);
    this.onchange?.(event);
    for (const listener of this.#listeners) {
      listener(event);
    }
  }
}

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

function define(name: string, value: unknown): void {
  Object.defineProperty(window, name, {
    configurable: true,
    writable: true,
    value,
  });
}

// Installed once per file, outside `vi.stubGlobal`, so `unstubGlobals` keeps
// them between tests.
export function installBrowserStubs(): void {
  define("matchMedia", (media: string) => {
    const query = new FakeMediaQueryList(media);
    mediaQueries.add(query);
    return query;
  });
  // Without it, antd's Avatar and Dropdown crash.
  define("ResizeObserver", ResizeObserverStub);
  // The router restores scroll positions.
  define("scrollTo", () => {});
}

// Wrap in `act()` once something is rendered.
export function setViewportWidth(width: number): void {
  viewportWidth = width;
  define("innerWidth", width);
  for (const query of mediaQueries) {
    query.update();
  }
  window.dispatchEvent(new Event("resize"));
}

const unexpectedFetches: string[] = [];

// Fails the test on any fetch call it did not stub.
export function installFetchGuard(): void {
  unexpectedFetches.length = 0;
  vi.stubGlobal("fetch", (input: RequestInfo | URL) => {
    unexpectedFetches.push(
      input instanceof Request ? input.url : String(input),
    );
    return Promise.reject(new TypeError("Unexpected fetch in a test"));
  });
}

export function assertNoUnexpectedFetch(): void {
  expect(unexpectedFetches, "fetch calls the test did not stub").toEqual([]);
}

type ConsoleLevel = "error" | "warn";

const declaredConsole: { level: ConsoleLevel; pattern: RegExp }[] = [];
const unexpectedConsole: string[] = [];

// Declares console output a test expects, such as the router's "Error in
// route match" warning on an error path. Anything undeclared fails the test.
export function expectConsole(level: ConsoleLevel, pattern: RegExp): void {
  declaredConsole.push({ level, pattern });
}

function describeArgument(value: unknown): string {
  if (value instanceof Error) {
    return value.stack ?? value.message;
  }
  return typeof value === "string" ? value : String(value);
}

// Spies are installed before each test, because `restoreMocks` removes spies
// created earlier.
export function installConsolePolicy(): void {
  declaredConsole.length = 0;
  unexpectedConsole.length = 0;
  for (const level of ["error", "warn"] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      const text = args.map(describeArgument).join(" ");
      const declared = declaredConsole.some(
        (entry) => entry.level === level && entry.pattern.test(text),
      );
      if (!declared) {
        unexpectedConsole.push(`console.${level}: ${text}`);
      }
    });
  }
}

export function assertConsolePolicy(): void {
  expect(unexpectedConsole, "console output the test did not declare").toEqual(
    [],
  );
}
