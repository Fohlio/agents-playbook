import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatSidebar } from '../ChatSidebar';
import '@testing-library/jest-dom';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock MarkdownContent
jest.mock('@/shared/ui/atoms/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
}));

// Mock hooks
const mockUseAIChat = jest.fn();
const mockUseAIChatSessions = jest.fn();
const mockUseLoadChatSession = jest.fn();

jest.mock('@/features/ai-assistant/hooks/useAIChat', () => ({
  useAIChat: (props: unknown) => mockUseAIChat(props),
}));

jest.mock('@/features/ai-assistant/hooks/useAIChatSessions', () => ({
  useAIChatSessions: (props: unknown) => mockUseAIChatSessions(props),
}));

jest.mock('@/features/ai-assistant/hooks/useLoadChatSession', () => ({
  useLoadChatSession: () => mockUseLoadChatSession(),
}));

describe('ChatSidebar - Beta Badge Integration', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock implementations
    mockUseAIChat.mockReturnValue({
      messages: [],
      input: '',
      isLoading: false,
      error: null,
      setInput: jest.fn(),
      handleSubmit: jest.fn(),
      tokenCount: 0,
      loadSession: jest.fn(),
      sessionId: '',
    });

    mockUseAIChatSessions.mockReturnValue({
      sessions: [],
      isLoading: false,
      refresh: jest.fn(),
    });

    mockUseLoadChatSession.mockReturnValue({
      loadSession: jest.fn(),
      isLoading: false,
    });
  });

  it('should render AI Assistant header when open', () => {
    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Translation mock returns the key
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should render beta badge in header', () => {
    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Translation mock returns the key 'beta'
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('should render workflow mode indicator', () => {
    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Translation mock returns the key 'mode.workflow'
    expect(screen.getByText('(mode.workflow)')).toBeInTheDocument();
  });

  it('should render mini-prompt mode indicator', () => {
    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="mini-prompt"
      />
    );

    // Translation mock returns the key 'mode.prompt'
    expect(screen.getByText('(mode.prompt)')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <ChatSidebar
        isOpen={false}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Translation mock returns the key
    expect(screen.queryByText('title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('beta-badge')).not.toBeInTheDocument();
  });

  it('should render close button', () => {
    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Translation mock returns the key
    const closeButton = screen.getByLabelText('close');
    expect(closeButton).toBeInTheDocument();
  });

  it('should render session history button', () => {
    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Translation mock returns the key
    const historyButton = screen.getByLabelText('history');
    expect(historyButton).toBeInTheDocument();
  });

  it('should render beta badge with small size styling', () => {
    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Translation mock returns the key 'beta'
    const betaBadge = screen.getByText('beta');
    // Check it has the small styling (text-[10px])
    expect(betaBadge).toHaveClass('text-[10px]');
  });
});

describe('ChatSidebar - Session Switcher', () => {
  const mockOnClose = jest.fn();
  const mockLoadSession = jest.fn();
  const mockFetchSession = jest.fn();
  const mockRefreshSessions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show active session with cyberpunk styling', () => {
    const mockSessions = [
      {
        id: 'session-1',
        lastMessageAt: new Date('2025-11-02T10:00:00Z'),
        messageCount: 5,
        tokenUsage: { total: 1200 },
      },
      {
        id: 'session-2',
        lastMessageAt: new Date('2025-11-02T11:00:00Z'),
        messageCount: 3,
        tokenUsage: { total: 800 },
      },
    ];

    mockUseAIChat.mockReturnValue({
      messages: [],
      input: '',
      isLoading: false,
      error: null,
      setInput: jest.fn(),
      handleSubmit: jest.fn(),
      tokenCount: 0,
      loadSession: mockLoadSession,
      sessionId: 'session-1', // Active session
    });

    mockUseAIChatSessions.mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
      refresh: mockRefreshSessions,
    });

    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Open session selector
    const historyButton = screen.getByLabelText('history');
    fireEvent.click(historyButton);

    // Check active session has correct cyberpunk styling
    const activeSession = screen.getByTestId('active-session');
    expect(activeSession).toHaveClass('bg-purple-500/20', 'border-l-2', 'border-purple-400');
  });

  it('should show active badge on current session', () => {
    const mockSessions = [
      {
        id: 'session-1',
        lastMessageAt: new Date('2025-11-02T10:00:00Z'),
        messageCount: 5,
        tokenUsage: { total: 1200 },
      },
    ];

    mockUseAIChat.mockReturnValue({
      messages: [],
      input: '',
      isLoading: false,
      error: null,
      setInput: jest.fn(),
      handleSubmit: jest.fn(),
      tokenCount: 0,
      loadSession: mockLoadSession,
      sessionId: 'session-1',
    });

    mockUseAIChatSessions.mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
      refresh: mockRefreshSessions,
    });

    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Open session selector
    const historyButton = screen.getByLabelText('history');
    fireEvent.click(historyButton);

    // Check for Active badge - translation mock returns the key 'activeBadge'
    const activeBadge = screen.getByTestId('active-badge');
    expect(activeBadge).toBeInTheDocument();
    expect(activeBadge).toHaveTextContent('activeBadge');
  });

  it('should not show active styling on inactive sessions', () => {
    const mockSessions = [
      {
        id: 'session-1',
        lastMessageAt: new Date('2025-11-02T10:00:00Z'),
        messageCount: 5,
        tokenUsage: { total: 1200 },
      },
      {
        id: 'session-2',
        lastMessageAt: new Date('2025-11-02T11:00:00Z'),
        messageCount: 3,
        tokenUsage: { total: 800 },
      },
    ];

    mockUseAIChat.mockReturnValue({
      messages: [],
      input: '',
      isLoading: false,
      error: null,
      setInput: jest.fn(),
      handleSubmit: jest.fn(),
      tokenCount: 0,
      loadSession: mockLoadSession,
      sessionId: 'session-1', // Only session-1 is active
    });

    mockUseAIChatSessions.mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
      refresh: mockRefreshSessions,
    });

    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Open session selector
    const historyButton = screen.getByLabelText('history');
    fireEvent.click(historyButton);

    // Check inactive session doesn't have active styling
    const inactiveSessions = screen.getAllByTestId('inactive-session');
    expect(inactiveSessions).toHaveLength(1);
    expect(inactiveSessions[0]).not.toHaveClass('bg-purple-500/20');
  });

  it('should call handleSelectSession when clicking on session', async () => {
    const mockSessions = [
      {
        id: 'session-1',
        lastMessageAt: new Date('2025-11-02T10:00:00Z'),
        messageCount: 5,
        tokenUsage: { total: 1200 },
      },
    ];

    mockFetchSession.mockResolvedValue({
      id: 'session-1',
      messages: [],
    });

    mockUseAIChat.mockReturnValue({
      messages: [],
      input: '',
      isLoading: false,
      error: null,
      setInput: jest.fn(),
      handleSubmit: jest.fn(),
      tokenCount: 0,
      loadSession: mockLoadSession,
      sessionId: '',
    });

    mockUseAIChatSessions.mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
      refresh: mockRefreshSessions,
    });

    mockUseLoadChatSession.mockReturnValue({
      loadSession: mockFetchSession,
      isLoading: false,
    });

    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Open session selector
    const historyButton = screen.getByLabelText('history');
    fireEvent.click(historyButton);

    // Click on session
    const sessionButton = screen.getByTestId('inactive-session');
    fireEvent.click(sessionButton);

    await waitFor(() => {
      expect(mockFetchSession).toHaveBeenCalledWith('session-1');
    });
  });

  it('should create new session when clicking "New Chat"', () => {
    mockUseAIChat.mockReturnValue({
      messages: [],
      input: '',
      isLoading: false,
      error: null,
      setInput: jest.fn(),
      handleSubmit: jest.fn(),
      tokenCount: 0,
      loadSession: mockLoadSession,
      sessionId: 'session-1',
    });

    mockUseAIChatSessions.mockReturnValue({
      sessions: [],
      isLoading: false,
      refresh: mockRefreshSessions,
    });

    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Open session selector
    const historyButton = screen.getByLabelText('history');
    fireEvent.click(historyButton);

    // Click "New Chat" - Translation mock returns the key
    const newChatButton = screen.getByText('newChat');
    fireEvent.click(newChatButton);

    expect(mockLoadSession).toHaveBeenCalledWith('', []);
    expect(mockRefreshSessions).toHaveBeenCalled();
  });

  it('should display all sessions in the list', () => {
    const mockSessions = [
      {
        id: 'session-1',
        lastMessageAt: new Date('2025-11-02T10:00:00Z'),
        messageCount: 5,
        tokenUsage: { total: 1200 },
      },
      {
        id: 'session-2',
        lastMessageAt: new Date('2025-11-02T11:00:00Z'),
        messageCount: 3,
        tokenUsage: { total: 800 },
      },
      {
        id: 'session-3',
        lastMessageAt: new Date('2025-11-02T12:00:00Z'),
        messageCount: 7,
        tokenUsage: { total: 1500 },
      },
    ];

    mockUseAIChat.mockReturnValue({
      messages: [],
      input: '',
      isLoading: false,
      error: null,
      setInput: jest.fn(),
      handleSubmit: jest.fn(),
      tokenCount: 0,
      loadSession: mockLoadSession,
      sessionId: 'session-2',
    });

    mockUseAIChatSessions.mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
      refresh: mockRefreshSessions,
    });

    render(
      <ChatSidebar
        isOpen={true}
        onClose={mockOnClose}
        mode="workflow"
      />
    );

    // Open session selector
    const historyButton = screen.getByLabelText('history');
    fireEvent.click(historyButton);

    // Check all sessions are displayed
    const activeSession = screen.getByTestId('active-session');
    const inactiveSessions = screen.getAllByTestId('inactive-session');
    expect(activeSession).toBeInTheDocument();
    expect(inactiveSessions).toHaveLength(2);
  });
});
