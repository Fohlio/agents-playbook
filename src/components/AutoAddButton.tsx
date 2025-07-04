"use client";

import { useState } from "react";

export default function AutoAddButton() {
  const [copied, setCopied] = useState(false);

  const mcpConfig = `{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.vercel.app/api/mcp"
    }
  }
}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mcpConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const openClaudeConfig = () => {
    // Пытаемся открыть файл конфигурации Claude Desktop
    const isWindows = navigator.platform.toLowerCase().includes('win');
    const isMac = navigator.platform.toLowerCase().includes('mac');
    
    if (isMac) {
      // На Mac открываем директорию с конфигурацией
      window.open('file:///Users/' + (process.env.USER || 'username') + '/Library/Application Support/Claude/', '_blank');
    } else if (isWindows) {
      // На Windows
      window.open('file:///' + (process.env.APPDATA || 'C:\\Users\\username\\AppData\\Roaming') + '\\Claude\\', '_blank');
    } else {
      // Просто копируем конфигурацию
      copyToClipboard();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">Quick Setup</h3>
        <p className="text-slate-600">
          Automatically add AI Agents Playbook to your Claude Desktop
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={copyToClipboard}
          className="w-full group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center space-x-3">
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Configuration copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy MCP Configuration</span>
              </>
            )}
          </div>
        </button>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <div className="text-sm text-slate-600">
              <p className="font-medium mb-1">After copying:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open Claude Desktop</li>
                <li>Go to Settings</li>
                <li>Find "MCP Servers" section</li>
                <li>Paste the copied configuration</li>
                <li>Restart Claude Desktop</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 