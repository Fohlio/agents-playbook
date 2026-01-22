'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useOpenAIKey } from '@/features/ai-assistant/hooks/useOpenAIKey';
import { Key, CheckCircle2, XCircle, Loader2, Trash2, Save } from 'lucide-react';
import { Card } from '@/shared/ui/atoms';

export function OpenAIKeySettings() {
  const t = useTranslations('aiAssistant.openaiSettings');
  const tCommon = useTranslations('common');

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
        message: t('enterApiKey'),
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testKey(apiKey);

    setTestResult({
      valid: result.valid,
      message: result.valid
        ? t('keyValid')
        : result.error || t('keyInvalid'),
    });

    setIsTesting(false);
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setSaveError(t('enterApiKey'));
      return;
    }

    try {
      setSaveError(null);
      await saveKey(apiKey, true);
      setApiKey('');
      setIsEditing(false);
      setTestResult(null);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : t('enterApiKey')
      );
    }
  };

  const handleRemove = async () => {
    if (!confirm(t('confirmRemove'))) {
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
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">{t('loadingConfig')}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30">
            <Key className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-mono text-cyan-400 uppercase tracking-wider" style={{ textShadow: '0 0 10px #00ffff40' }}>
              {t('title')}
            </h3>
            <p className="text-sm text-cyan-100/50 font-mono">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Key Status */}
      {hasKey && !isEditing && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-400 font-mono uppercase">
                {t('keyConfigured')}
              </p>
              {updatedAt && (
                <p className="text-xs text-green-400/60 font-mono mt-1">
                  {t('lastUpdated')}: {new Date(updatedAt).toLocaleDateString()}
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
              className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2"
            >
              {t('apiKeyLabel')}
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
              className="w-full px-4 py-2.5 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
            />
            <p className="text-xs text-cyan-100/30 font-mono mt-1">
              {t('getKeyFrom')}{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                {t('openaiPlatform')}
              </a>
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`p-3 border ${
                testResult.valid
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-pink-500/10 border-pink-500/50'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm font-mono ${
                    testResult.valid ? 'text-green-400' : 'text-pink-400'
                  }`}
                >
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Save Error */}
          {saveError && (
            <div className="p-3 bg-pink-500/10 border border-pink-500/50">
              <p className="text-sm text-pink-400 font-mono">&gt; ERROR: {saveError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="px-4 py-2 bg-transparent border border-cyan-500/50 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('testing')}
                </>
              ) : (
                t('testConnection')
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || (!testResult?.valid && !!testResult)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              <Save className="w-4 h-4" />
              {tCommon('save')}
            </button>

            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setApiKey('');
                  setTestResult(null);
                  setSaveError(null);
                }}
                className="px-4 py-2 text-cyan-100/50 font-mono text-sm uppercase hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {tCommon('cancel')}
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
            className="px-4 py-2 bg-transparent border border-cyan-500/50 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
          >
            {t('updateKey')}
          </button>
          <button
            onClick={handleRemove}
            className="px-4 py-2 bg-transparent border border-pink-500/50 text-pink-400 font-mono text-sm uppercase tracking-wider hover:bg-pink-500/10 hover:border-pink-400 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {t('remove')}
          </button>
        </div>
      )}
    </Card>
  );
}
