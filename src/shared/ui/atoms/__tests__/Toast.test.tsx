import { render, screen, fireEvent, act } from "@testing-library/react";
import { Toast } from "../Toast";
import { ToastProvider, useToast } from "../../providers/ToastProvider";

// Helper component to test useToast hook
function ToastTrigger({
  message,
  variant,
  action,
  duration,
}: {
  message: string;
  variant?: "success" | "error" | "info" | "warning";
  action?: { label: string; onClick: () => void };
  duration?: number;
}) {
  const { showToast } = useToast();
  return (
    <button
      onClick={() => showToast({ message, variant, action, duration })}
      data-testid="show-toast"
    >
      Show Toast
    </button>
  );
}

describe("Toast Component", () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders with message", () => {
    render(
      <Toast
        id="test-1"
        message="Test notification"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText("Test notification")).toBeInTheDocument();
  });

  it("renders with success variant", () => {
    render(
      <Toast
        id="test-1"
        message="Success message"
        variant="success"
        onDismiss={mockOnDismiss}
      />
    );

    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass("bg-green-50");
  });

  it("renders with error variant", () => {
    render(
      <Toast
        id="test-1"
        message="Error message"
        variant="error"
        onDismiss={mockOnDismiss}
      />
    );

    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass("bg-red-50");
  });

  it("renders with warning variant", () => {
    render(
      <Toast
        id="test-1"
        message="Warning message"
        variant="warning"
        onDismiss={mockOnDismiss}
      />
    );

    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass("bg-yellow-50");
  });

  it("renders with info variant (default)", () => {
    render(
      <Toast
        id="test-1"
        message="Info message"
        onDismiss={mockOnDismiss}
      />
    );

    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass("bg-blue-50");
  });

  it("renders action button when provided", () => {
    const mockAction = jest.fn();
    render(
      <Toast
        id="test-1"
        message="Test with action"
        action={{ label: "Undo", onClick: mockAction }}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  it("calls action onClick and dismisses when action button clicked", () => {
    const mockAction = jest.fn();
    render(
      <Toast
        id="test-1"
        message="Test with action"
        action={{ label: "Undo", onClick: mockAction }}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.click(screen.getByText("Undo"));
    
    expect(mockAction).toHaveBeenCalled();
    
    // Wait for exit animation
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(mockOnDismiss).toHaveBeenCalledWith("test-1");
  });

  it("dismisses when close button clicked", () => {
    render(
      <Toast
        id="test-1"
        message="Test notification"
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.click(screen.getByLabelText("Dismiss notification"));
    
    // Wait for exit animation
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(mockOnDismiss).toHaveBeenCalledWith("test-1");
  });

  it("auto-dismisses after duration", () => {
    render(
      <Toast
        id="test-1"
        message="Test notification"
        duration={3000}
        onDismiss={mockOnDismiss}
      />
    );

    expect(mockOnDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Wait for exit animation
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockOnDismiss).toHaveBeenCalledWith("test-1");
  });

  it("does not auto-dismiss when duration is 0", () => {
    render(
      <Toast
        id="test-1"
        message="Test notification"
        duration={0}
        onDismiss={mockOnDismiss}
      />
    );

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it("has correct accessibility attributes", () => {
    render(
      <Toast
        id="test-1"
        message="Test notification"
        onDismiss={mockOnDismiss}
      />
    );

    const toast = screen.getByRole("alert");
    expect(toast).toHaveAttribute("aria-live", "polite");
  });
});

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows toast when showToast is called", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Hello World" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId("show-toast"));

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("shows multiple toasts", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="First toast" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId("show-toast"));
    fireEvent.click(screen.getByTestId("show-toast"));

    expect(screen.getAllByText("First toast")).toHaveLength(2);
  });

  it("limits toasts to max 5", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Toast" duration={0} />
      </ToastProvider>
    );

    // Show 7 toasts
    for (let i = 0; i < 7; i++) {
      fireEvent.click(screen.getByTestId("show-toast"));
    }

    // Should only show 5
    expect(screen.getAllByText("Toast")).toHaveLength(5);
  });

  it("removes toast after duration", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Temporary toast" duration={1000} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId("show-toast"));
    expect(screen.getByText("Temporary toast")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(screen.queryByText("Temporary toast")).not.toBeInTheDocument();
  });

  it("renders toast with correct variant", () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Success!" variant="success" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId("show-toast"));

    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass("bg-green-50");
  });

  it("renders toast with action button", () => {
    const mockAction = jest.fn();
    render(
      <ToastProvider>
        <ToastTrigger
          message="With action"
          action={{ label: "Click me", onClick: mockAction }}
        />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId("show-toast"));
    expect(screen.getByText("Click me")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Click me"));
    expect(mockAction).toHaveBeenCalled();
  });
});

describe("useToast hook", () => {
  it("throws error when used outside ToastProvider", () => {
    const TestComponent = () => {
      useToast();
      return null;
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useToast must be used within a ToastProvider"
    );

    consoleSpy.mockRestore();
  });
});

