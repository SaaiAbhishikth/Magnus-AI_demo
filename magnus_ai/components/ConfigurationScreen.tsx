import React, { useState } from 'react';
import { AgentIcon } from './icons/Icons';

interface ConfigurationScreenProps {
  onSave: (apiKey: string, clientId: string) => void;
}

export const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');

  const handleSave = () => {
    if (apiKey.trim() && clientId.trim()) {
      onSave(apiKey.trim(), clientId.trim());
    } else {
      alert('Please provide both a Gemini API Key and a Google Client ID.');
    }
  };

  return (
    <div className="bg-primary text-text-primary min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-secondary rounded-xl border border-gray-700/50 shadow-2xl p-8">
        <div className="text-center mb-8">
            <div className="inline-block bg-accent p-3 rounded-xl mb-4">
                <AgentIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Configuration Required</h1>
            <p className="text-text-secondary mt-2">
                Please provide your API keys to enable Magnus AI. These will be stored locally in your browser.
            </p>
        </div>
        
        <div className="space-y-6">
            <div>
                <label htmlFor="gemini-api-key" className="block text-sm font-medium text-text-secondary mb-2">
                    Google Gemini API Key
                </label>
                <input
                    id="gemini-api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API Key"
                    className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                />
            </div>
            <div>
                <label htmlFor="google-client-id" className="block text-sm font-medium text-text-secondary mb-2">
                    Google Client ID
                </label>
                <input
                    id="google-client-id"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter your Google Client ID"
                    className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                />
            </div>
        </div>

        <div className="mt-8">
            <button
                onClick={handleSave}
                disabled={!apiKey.trim() || !clientId.trim()}
                className="w-full px-8 py-3 rounded-lg text-base font-semibold text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Save and Continue
            </button>
        </div>
        
        <div className="text-center mt-6 text-xs text-text-secondary">
          <p>You can find your keys at:</p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent/80 hover:text-accent">Google AI Studio (for Gemini Key)</a>
          <span className="mx-2">|</span>
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-accent/80 hover:text-accent">Google Cloud Console (for Client ID)</a>
        </div>
      </div>
    </div>
  );
};
