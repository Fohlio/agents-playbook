import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarkdownContent } from '../MarkdownContent';

// Mock react-markdown to avoid ESM issues
jest.mock('react-markdown', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => <div>{children}</div>,
  };
});

jest.mock('remark-gfm', () => {
  return {
    __esModule: true,
    default: () => {},
  };
});

describe('MarkdownContent', () => {
  it('should render content using react-markdown', () => {
    render(<MarkdownContent content="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should render with default text-gray-900 className', () => {
    render(<MarkdownContent content="Test" testId="markdown-default" />);
    const element = screen.getByTestId('markdown-default');
    expect(element).toBeInTheDocument();
    // Default className includes text-gray-900 for proper text color
    expect(element.className).toContain('text-gray-900');
  });

  it('should apply custom className', () => {
    render(<MarkdownContent content="Test" className="custom-class" testId="markdown" />);
    const element = screen.getByTestId('markdown');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('text-gray-900'); // Should still have default color
  });

  it('should render markdown content', () => {
    const content = "# Main Title";
    render(<MarkdownContent content={content} />);
    // Since we mocked ReactMarkdown, it just renders the content as is
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it('should pass testId prop correctly', () => {
    render(<MarkdownContent content="Test" testId="custom-id" />);
    expect(screen.getByTestId('custom-id')).toBeInTheDocument();
  });
});
