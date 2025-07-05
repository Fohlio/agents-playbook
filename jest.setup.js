// Jest setup file
const { config } = require('dotenv');

// Load environment variables for tests
config({ path: '.env.local' });
config({ path: '.env' });

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