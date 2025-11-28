import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState, EmptyStateIcons } from "../EmptyState";
import {
  noSearchResults,
  emptyWorkflowLibrary,
  emptyMiniPromptLibrary,
  noSharedItems,
  noFilterResults,
  emptyDiscovery,
} from "../empty-state-presets";

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("EmptyState Component", () => {
  it("renders title", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState title="Empty" description="Try a different search" />
    );
    expect(screen.getByText("Try a different search")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByTestId("empty-state-description")).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        title="Empty"
        icon={<div data-testid="custom-icon">Icon</div>}
      />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    const mockClick = jest.fn();
    render(
      <EmptyState
        title="Empty"
        actions={[
          { label: "Primary Action", onClick: mockClick },
          { label: "Secondary Action", variant: "secondary" },
        ]}
      />
    );

    expect(screen.getByText("Primary Action")).toBeInTheDocument();
    expect(screen.getByText("Secondary Action")).toBeInTheDocument();
  });

  it("calls onClick when action button is clicked", () => {
    const mockClick = jest.fn();
    render(
      <EmptyState
        title="Empty"
        actions={[{ label: "Click Me", onClick: mockClick }]}
      />
    );

    fireEvent.click(screen.getByText("Click Me"));
    expect(mockClick).toHaveBeenCalled();
  });

  it("renders link when action has href", () => {
    render(
      <EmptyState
        title="Empty"
        actions={[{ label: "Go Somewhere", href: "/dashboard" }]}
      />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("applies custom className", () => {
    render(<EmptyState title="Empty" className="custom-class" />);
    const container = screen.getByTestId("empty-state");
    expect(container).toHaveClass("custom-class");
  });

  it("uses custom testId", () => {
    render(<EmptyState title="Empty" testId="my-empty-state" />);
    expect(screen.getByTestId("my-empty-state")).toBeInTheDocument();
  });
});

describe("EmptyStateIcons", () => {
  it("has search icon", () => {
    expect(EmptyStateIcons.search).toBeDefined();
  });

  it("has library icon", () => {
    expect(EmptyStateIcons.library).toBeDefined();
  });

  it("has share icon", () => {
    expect(EmptyStateIcons.share).toBeDefined();
  });

  it("has filter icon", () => {
    expect(EmptyStateIcons.filter).toBeDefined();
  });

  it("has prompt icon", () => {
    expect(EmptyStateIcons.prompt).toBeDefined();
  });
});

describe("Empty State Presets", () => {
  describe("noSearchResults", () => {
    it("returns correct props", () => {
      const onClear = jest.fn();
      const props = noSearchResults("test query", onClear);

      expect(props.title).toBe('No results for "test query"');
      expect(props.description).toBeDefined();
      expect(props.actions).toHaveLength(1);
      expect(props.actions![0].label).toBe("Clear Search");
    });

    it("calls onClear when action clicked", () => {
      const onClear = jest.fn();
      const props = noSearchResults("test", onClear);
      
      render(<EmptyState {...props} />);
      fireEvent.click(screen.getByText("Clear Search"));
      
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe("emptyWorkflowLibrary", () => {
    it("returns correct props", () => {
      const props = emptyWorkflowLibrary();

      expect(props.title).toBe("Your workflow library is empty");
      expect(props.actions).toHaveLength(2);
      expect(props.actions![0].href).toContain("discover");
      expect(props.actions![1].href).toContain("workflows/new");
    });
  });

  describe("emptyMiniPromptLibrary", () => {
    it("returns correct props", () => {
      const props = emptyMiniPromptLibrary();

      expect(props.title).toBe("Your mini-prompts library is empty");
      expect(props.actions).toHaveLength(2);
    });
  });

  describe("noSharedItems", () => {
    it("returns correct props", () => {
      const props = noSharedItems();

      expect(props.title).toBe("You haven't shared anything yet");
      expect(props.actions).toHaveLength(1);
      expect(props.actions![0].href).toContain("library");
    });
  });

  describe("noFilterResults", () => {
    it("returns correct props", () => {
      const onClear = jest.fn();
      const props = noFilterResults(onClear);

      expect(props.title).toBe("No results match your filters");
      expect(props.actions).toHaveLength(1);
    });

    it("calls onClearFilters when action clicked", () => {
      const onClear = jest.fn();
      const props = noFilterResults(onClear);
      
      render(<EmptyState {...props} />);
      fireEvent.click(screen.getByText("Clear All Filters"));
      
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe("emptyDiscovery", () => {
    it("returns correct props for workflow", () => {
      const props = emptyDiscovery("workflow");

      expect(props.title).toBe("No workflows found");
      expect(props.actions![0].href).toContain("workflows/new");
    });

    it("returns correct props for mini-prompt", () => {
      const props = emptyDiscovery("mini-prompt");

      expect(props.title).toBe("No mini-prompts found");
      expect(props.actions![0].href).toContain("mini-prompts/new");
    });
  });
});

