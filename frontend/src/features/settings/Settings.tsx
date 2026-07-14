import React, { useState } from 'react';
import { 
  Sliders, 
  Key, 
  Volume2, 
  Settings as SettingsIcon, 
  CheckCircle,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [voiceMode, setVoiceMode] = useState(true);
  const [sessionTime, setSessionTime] = useState(30);
  const [openaiKey, setOpenaiKey] = useState('sk-proj-••••••••••••••••');
  const [anthropicKey, setAnthropicKey] = useState('sk-ant-••••••••••••••••');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg('Configuration settings saved successfully.');
    }, 1000);
  };

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Configuration Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Configure simulator behavior, custom difficulty curves, and LLM API integrations.</p>
      </div>

      {successMsg && (
        <motion.div 
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-success/10 border border-accent-success/20 text-xs text-green-400 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle size={14} className="flex-shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Simulator Configurations */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 shadow-xl space-y-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-main/50 pb-3">
            <Sliders size={18} className="text-accent-primary" />
            <span>Simulation Parameters</span>
          </h2>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Question Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Beginner', 'Intermediate', 'Expert', 'Staff'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`py-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                    difficulty === level 
                      ? 'bg-accent-primary border-accent-primary text-white' 
                      : 'bg-bg-main border-border-main text-text-secondary hover:text-text-primary hover:border-border-main/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-text-muted mt-1.5">Adjusts complexity of algorithms and systemic design depth.</p>
          </div>

          {/* Session Time Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Max Session Duration
              </label>
              <span className="text-xs text-accent-primary font-semibold">{sessionTime} minutes</span>
            </div>
            <input
              type="range"
              min={15}
              max={60}
              step={5}
              value={sessionTime}
              onChange={(e) => setSessionTime(Number(e.target.value))}
              className="w-full h-1 bg-bg-main rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
            <div className="flex justify-between text-[9px] text-text-muted px-1">
              <span>15m</span>
              <span>30m</span>
              <span>45m</span>
              <span>60m</span>
            </div>
          </div>

          {/* Voice Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-bg-main/50 border border-border-main rounded-xl">
            <div className="flex items-start gap-3">
              <Volume2 className="text-accent-primary mt-0.5 flex-shrink-0" size={18} />
              <div>
                <h4 className="text-xs font-bold text-text-primary">Text-to-Speech Voice Response</h4>
                <p className="text-[9px] text-text-secondary mt-0.5">Let the AI read questions aloud using natural neural voices.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={voiceMode}
                onChange={() => setVoiceMode(!voiceMode)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-bg-main peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:bg-white peer-checked:bg-accent-primary"></div>
            </label>
          </div>
        </motion.div>

        {/* API Credentials */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 shadow-xl flex flex-col justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="space-y-6">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-main/50 pb-3">
              <Key size={18} className="text-accent-secondary" />
              <span>API Gateway Keys</span>
            </h2>

            <div className="bg-bg-sec/50 border border-border-main/50 p-4 rounded-xl flex gap-3 text-[10px] text-text-secondary">
              <Brain size={18} className="text-accent-warning flex-shrink-0 mt-0.5" />
              <span>
                By default, the simulator runs on shared sandbox servers. Insert your own LLM API keys below to unlock custom models and speed optimizations.
              </span>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider" htmlFor="openaiKey">
                OpenAI API Key
              </label>
              <input
                id="openaiKey"
                type="password"
                className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-muted"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
            </div>

            {/* Anthropic API Key */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider" htmlFor="anthropicKey">
                Anthropic API Key
              </label>
              <input
                id="anthropicKey"
                type="password"
                className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-muted"
                placeholder="sk-ant-..."
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-accent-primary/25 transition-all text-xs disabled:opacity-50 mt-6"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <SettingsIcon size={14} />
                <span>Save Simulator Configuration</span>
              </>
            )}
          </button>
        </motion.div>

      </form>
    </div>
  );
};
