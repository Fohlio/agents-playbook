// Jest setup file
const { config } = require('dotenv');
require('@testing-library/jest-dom');

// Load environment variables for tests
config({ path: '.env.local' });
config({ path: '.env' });

// Mock next-intl for tests
jest.mock('next-intl', () => ({
  useTranslations: () => (key, values) => {
    // Simple mock that returns the key with interpolated values
    if (values) {
      return Object.entries(values).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, String(v)),
        key
      );
    }
    return key;
  },
  useLocale: () => 'en',
  useMessages: () => ({}),
  useNow: () => new Date(),
  useTimeZone: () => 'UTC',
  NextIntlClientProvider: ({ children }) => children,
}));

jest.mock('next-intl/server', () => ({
  getTranslations: () => Promise.resolve((key) => key),
  getLocale: () => Promise.resolve('en'),
  getMessages: () => Promise.resolve({}),
}));

jest.mock('next-intl/routing', () => ({
  defineRouting: (config) => config,
  createSharedPathnamesNavigation: () => ({
    Link: 'a',
    redirect: jest.fn(),
    usePathname: () => '/',
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
  }),
}));

jest.mock('next-intl/navigation', () => ({
  createSharedPathnamesNavigation: () => ({
    Link: 'a',
    redirect: jest.fn(),
    usePathname: () => '/',
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
  }),
  createNavigation: () => ({
    Link: 'a',
    redirect: jest.fn(),
    usePathname: () => '/',
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    getPathname: () => '/',
  }),
}));

// Polyfill Web APIs for Node.js test environment
global.Request = class Request {
  method;
  body;

  constructor(url, init) {
    this.method = init?.method || 'GET';
    this.body = init?.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
};

global.Response = class Response {
  status;
  statusText;
  headers;
  body;

  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Map(Object.entries(init?.headers || {}));
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }
};

global.Headers = class Headers extends Map {};

// Polyfill fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
    text: () => Promise.resolve(''),
  })
);

// Polyfill TransformStream for AI SDK
global.TransformStream = class TransformStream {
  readable;
  writable;

  constructor() {
    const chunks = [];
    this.writable = {
      write: (chunk) => chunks.push(chunk),
      close: () => {},
    };
    this.readable = {
      read: () => chunks.shift(),
    };
  }
};

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log during tests unless VERBOSE is set
  log: process.env.VERBOSE ? console.log : jest.fn(),
  debug: process.env.VERBOSE ? console.debug : jest.fn(),
  info: process.env.VERBOSE ? console.info : jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Extend Jest matchers
expect.extend({
  toContainWorkflow(received, workflowId) {
    const pass = received.includes(workflowId);
    if (pass) {
      return {
        message: () => `expected "${received}" not to contain workflow "${workflowId}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to contain workflow "${workflowId}"`,
        pass: false,
      };
    }
  },
}); 