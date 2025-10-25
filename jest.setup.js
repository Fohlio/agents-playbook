// Jest setup file
const { config } = require('dotenv');
require('@testing-library/jest-dom');

// Load environment variables for tests
config({ path: '.env.local' });
config({ path: '.env' });

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