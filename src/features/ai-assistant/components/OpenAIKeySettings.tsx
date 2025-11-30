'use client';

import { useState } from 'react';
import { useOpenAIKey } from '@/features/ai-assistant/hooks/useOpenAIKey';
import { Key, CheckCircle2, XCircle, Loader2, Trash2, Save } from 'lucide-react';

export function OpenAIKeySettings() {
  const { hasKey, updatedAt, isLoading, saveKey, removeKey, testKey } =
    useOpenAIKey();

  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        valid: false,
        message: 'Please enter an API key',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testKey(apiKey);

    setTestResult({
      valid: result.valid,
      message: result.valid
        ? 'API key is valid and working!'
        : result.error || 'Invalid API key',
    });

    setIsTesting(false);
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setSaveError('Please enter an API key');
      return;
    }

    try {
      setSaveError(null);
      await saveKey(apiKey, true); // Test connection before saving
      setApiKey('');
      setIsEditing(false);
      setTestResult(null);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save API key'
      );
    }
  };

  const handleRemove = async () => {
    if (
      !confirm(
        'Are you sure you want to remove your OpenAI API key? You will not be able to use the AI assistant without it.'
      )
    ) {
      return;
    }

    try {
      await removeKey();
      setApiKey('');
      setIsEditing(false);
      setTestResult(null);
    } catch (error) {
      console.error('Failed to remove key:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              OpenAI API Key
            </h3>
            <p className="text-sm text-gray-600">
              Required for AI-assisted workflow creation
            </p>
          </div>
        </div>
      </div>

      {/* Key Status */}
      {hasKey && !isEditing && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">
                API key is configured
              </p>
              {updatedAt && (
                <p className="text-xs text-green-700 mt-1">
                  Last updated: {new Date(updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Form */}
      {(!hasKey || isEditing) && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="openai-key"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              API Key
            </label>
            <input
              id="openai-key"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
                setSaveError(null);
              }}
              placeholder="sk-proj-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border ${
                testResult.valid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    testResult.valid ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Save Error */}
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{saveError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || (!testResult?.valid && !!testResult)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save API Key
            </button>

            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setApiKey('');
                  setTestResult(null);
                  setSaveError(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit/Remove Buttons */}
      {hasKey && !isEditing && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Update API Key
          </button>
          <button
            onClick={handleRemove}
            className="px-4 py-2 text-red-700 border border-red-300 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
