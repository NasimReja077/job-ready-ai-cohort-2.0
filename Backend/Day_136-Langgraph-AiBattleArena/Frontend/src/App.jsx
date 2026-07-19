import { useState, useEffect, useRef } from 'react';
import {
  LuBrain,
  LuSend,
  LuPaperclip,
  LuTrophy,
  LuSparkles,
  LuCpu,
  LuTrash2,
  LuFileText,
  LuX
} from 'react-icons/lu';
import { FiAlertTriangle, FiHelpCircle } from 'react-icons/fi';

function App() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [mode, setMode] = useState('live'); // 'live' or 'demo'
  const [attachedFile, setAttachedFile] = useState(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if Backend is running on port 3000
  useEffect(() => {
    fetch('http://localhost:3000/')
      .then((res) => {
        if (res.ok) {
          setBackendOnline(true);
          setMode('live');
        } else {
          setBackendOnline(false);
          setMode('demo');
        }
      })
      .catch(() => {
        setBackendOnline(false);
        setMode('demo');
      });
  }, []);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Mock response generator when server is offline
  const getMockResponse = (problem) => {
    const normalized = problem.toLowerCase();

    // Exact response matching user request prompt
    if (normalized.includes("hands problem") || normalized.includes("robot")) {
      return {
        problem: problem,
        solution_1: "**\"Robot hands struggle to grasp fragile eggs—too tight, they crush; too loose, they drop. Engineers chase the perfect grip, where strength meets gentleness in 25 words.\"**",
        solution_2: "In a lab, a robot struggled to grasp a fragile vase. Its rigid hands crushed it. \"Flexibility,\" sighed the engineer, \"is the key to human touch.\"",
        judge: {
          solution_1_score: 4,
          solution_2_score: 10,
          solution_1_reasoning: "Solution 1 suffered from a severe meta-instruction leak where it literally included the phrase \"in 25 words\" as part of the story's text, which ruined the narrative. Without that phrase, it was 23 words, but with it, it was 27 words.",
          solution_2_reasoning: "Solution 2 is an excellent short story that perfectly captures the essence of the robotics 'hands problem'. It is beautifully written and is almost exactly 25 words (it has 26 words), adhering to the length constraint much more naturally without any awkward leaks."
        }
      };
    }

    if (normalized.includes("quantum") || normalized.includes("entanglement")) {
      return {
        problem: problem,
        solution_1: "**Quantum entanglement** is a phenomenon where two particles become deeply interconnected. No matter how far apart they are—even light-years—measuring one instantly determines the state of the other. Einstein famously called this *\"spooky action at a distance.\"*",
        solution_2: "Imagine two magical dice. Roll one in New York, and it lands on 6. Instantly, the other die in Tokyo lands on 6 as well, even though no signal traveled between them. In physics, these dice are entangled particles, sharing information instantaneously across space.",
        judge: {
          solution_1_score: 9,
          solution_2_score: 8,
          solution_1_reasoning: "Solution 1 gives a precise and professional scientific overview. It correctly highlights the connection, the distance parameter, and mentions Einstein's historic quote, which adds nice context.",
          solution_2_reasoning: "Solution 2 uses a beautiful analogy (the dice metaphor) to make the abstract concept relatable. However, it slightly oversimplifies quantum mechanics, which could mislead the reader into thinking direct signal data transfer is possible."
        }
      };
    }

    // Default mock response
    return {
      problem: problem,
      solution_1: `Here is **Model Alpha's** solution to: "${problem}". We analyze the query through strict logical guidelines. By utilizing algorithmic decomposition, we can map out a direct, step-by-step resolution that focuses on technical accuracy and speed. This implementation minimizes runtime overhead.`,
      solution_2: `This is **Model Beta's** contextual perspective on: "${problem}". We approach this by providing a comprehensive overview first, establishing foundational definitions, and detailing the trade-offs of different implementations. This response is structured to prioritize readability, narrative flow, and overall developer understanding.`,
      judge: {
        solution_1_score: 8,
        solution_2_score: 9,
        solution_1_reasoning: "Model Alpha (Solution 1) provided a highly structured and direct answer. It is technically accurate and saves reading time, making it excellent for rapid reference, though it misses out on explaining the edge cases.",
        solution_2_reasoning: "Model Beta (Solution 2) went deeper, providing a helpful overview and detailing structural trade-offs. The narrative flow is superior and easier to follow, offering higher overall value for the user."
      }
    };
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userPrompt = prompt;
    const currentAttachment = attachedFile;
    setPrompt('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      if (mode === 'live') {
        const response = await fetch('http://localhost:3000/invoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: userPrompt }),
        });

        if (!response.ok) {
          throw new Error('API server returned an error');
        }

        const data = await response.json();
        if (data.success && data.result) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              problem: userPrompt,
              attachment: currentAttachment,
              solution_1: data.result.solution_1,
              solution_2: data.result.solution_2,
              judge: data.result.judge,
            },
          ]);
        } else {
          throw new Error('Invalid backend response format');
        }
      } else {
        // Run in local sandbox demo mode with mock generator
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const mockResult = getMockResponse(userPrompt);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            problem: userPrompt,
            attachment: currentAttachment,
            solution_1: mockResult.solution_1,
            solution_2: mockResult.solution_2,
            judge: mockResult.judge,
          },
        ]);
      }
    } catch (error) {
      console.error('Error generating AI responses:', error);
      // Fallback mechanism to demo mode automatically
      setMode('demo');
      const mockResult = getMockResponse(userPrompt);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          problem: userPrompt,
          attachment: currentAttachment,
          solution_1: mockResult.solution_1,
          solution_2: mockResult.solution_2,
          judge: mockResult.judge,
          errorNotice: 'API request failed. Automatically using local Sandbox mode.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0].name);
    }
  };

  const handleQuickPrompt = (text) => {
    setPrompt(text);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Simple custom Markdown / text parser for rich rendering
  const parseMarkdown = (text) => {
    if (!text) return null;

    // Split by code blocks ```
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```([a-zA-Z0-9-]*)\n?([\s\S]*?)```/);
        const code = match ? match[2] : part.slice(3, -3);
        const lang = match ? match[1] : '';

        return (
          <div key={index} className="my-3 rounded-lg border border-white/5 bg-neutral-950/60 overflow-hidden font-mono text-[13px]">
            {lang && (
              <div className="bg-neutral-900/60 px-4 py-1.5 border-b border-white/5 text-xs text-neutral-400 flex justify-between items-center select-none">
                <span>{lang}</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Code</span>
              </div>
            )}
            <pre className="p-4 overflow-x-auto text-left text-neutral-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Inline formatting: Bold (**text**), Inline Code (`code`), Italic (*text*)
      const inlineParts = part.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

      return (
        <span key={index} className="whitespace-pre-line leading-relaxed">
          {inlineParts.map((subPart, subIndex) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return (
                <strong key={subIndex} className="text-white font-semibold">
                  {subPart.slice(2, -2)}
                </strong>
              );
            }
            if (subPart.startsWith('*') && subPart.endsWith('*')) {
              return (
                <em key={subIndex} className="text-neutral-200 italic">
                  {subPart.slice(1, -1)}
                </em>
              );
            }
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code key={subIndex} className="bg-neutral-950/60 px-1.5 py-0.5 rounded text-violet-400 font-mono text-xs border border-white/5">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-5xl mx-auto px-4 md:px-8 py-6 relative z-1">
      {/* Background radial gradient behind chat area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header bar */}
      <header className="flex justify-between items-center py-4 border-b border-white/5 mb-8 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-600/10 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <LuBrain className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white m-0">AI BATTLE ARENA</h1>
            <p className="text-[10px] text-neutral-500 font-mono tracking-wider">AI EVALUATION PLAYGROUND</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mode switch */}
          <div className="flex items-center bg-neutral-950/80 border border-white/5 rounded-full p-1 text-xs font-mono">
            <button
              onClick={() => setMode('live')}
              disabled={!backendOnline}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${mode === 'live'
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'text-neutral-400 hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
              Live API
            </button>
            <button
              onClick={() => setMode('demo')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${mode === 'demo'
                ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20'
                : 'text-neutral-400 hover:text-neutral-200'
                }`}
            >
              Sandbox Demo
            </button>
          </div>

          {/* Connection Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950/60 border border-white/5 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
            <span className="text-neutral-400 hidden sm:inline">{backendOnline ? 'Server Active (Port 3000)' : 'Sandbox Mode'}</span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-lg bg-red-950/10 border border-red-500/20 text-red-400 hover:bg-red-950/30 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              title="Clear Arena Chat"
            >
              <LuTrash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear Arena</span>
            </button>
          )}
        </div>
      </header>

      {/* Main chat viewport */}
      <main className="flex-1 flex flex-col justify-start mb-8 min-h-[50vh]">
        {messages.length === 0 && !isLoading ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-violet-600/10 rounded-full blur-xl scale-125" />
              <div className="p-5 rounded-full bg-neutral-950/80 border border-violet-500/20 relative shadow-[0_0_30px_rgba(139,92,246,0.15)] animate-pulse">
                <LuBrain className="w-12 h-12 text-violet-400" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Start comparing AI responses</h2>
            <p className="text-neutral-400 max-w-md text-sm leading-relaxed mb-8">
              Enter a prompt and compare answers generated by multiple AI models with an AI Judge recommendation.
            </p>

            {/* Quick Suggestions */}
            <div className="w-full max-w-xl">
              <p className="mono-label text-neutral-500 mb-3 flex items-center justify-center gap-1">
                <FiHelpCircle className="w-3.5 h-3.5" />
                Select a test query to launch
              </p>
              <div className="flex flex-col gap-2">
                {[
                  {
                    title: 'The Robotics "Hands Problem" Story',
                    prompt: 'Give short story for The "hands problem" in robotics, in 25 words'
                  },
                  {
                    title: 'Top 10 Countries with Highest AI Adoption Rates in 2026',
                    prompt: 'Explain Top 10 Countries with Highest AI Adoption Rates in 2026, what drives adoption in each country, where the talent pools are deepest, and what these trends mean for building global engineering teams.AI Adoption Rankings Summary'
                  },
                  {
                    title: 'Global AI Brain Race and The Global AI Index',
                    prompt: 'Explain Global AI Brain Race Report 2026: Top 10 Countries Ranked for Shaping The Future of AI Leadership and The first index to benchmark nations on their level of investment, innovation and implementation of artificial intelligence.'
                  },
                  {
                    title: 'Code Optimization Check',
                    prompt: 'Write a function to check if a string is palindrome in Python, optimized'
                  },
                  {
                    title: 'Quantum Entanglement Metaphor',
                    prompt: 'Explain Quantum Entanglement like I am 5 years old using a metaphor'
                  },
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(item.prompt)}
                    className="w-full text-left p-3.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-violet-500/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-neutral-300 group-hover:text-violet-400 block mb-0.5">{item.title}</span>
                      <span className="text-[11px] text-neutral-500 line-clamp-1 font-mono">{item.prompt}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-600 group-hover:text-violet-400 border border-neutral-800 group-hover:border-violet-500/30 px-2 py-0.5 rounded-full transition-all">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation stream */
          <div className="flex flex-col gap-10">
            {messages.map((message) => {
              // Determine winning solution
              const s1Score = message.judge?.solution_1_score || 0;
              const s2Score = message.judge?.solution_2_score || 0;
              const s1Wins = s1Score > s2Score;
              const s2Wins = s2Score > s1Score;
              const isTied = s1Score === s2Score;

              // Calculate confidence level dynamically based on score differential
              const scoreDiff = Math.abs(s1Score - s2Score);
              let confidence = "92%";
              if (isTied) confidence = "50% (No consensus)";
              else if (scoreDiff >= 5) confidence = "98% (High certainty)";
              else if (scoreDiff >= 3) confidence = "94% (Certain)";
              else if (scoreDiff >= 1) confidence = "89% (Moderate)";

              return (
                <div key={message.id} className="flex flex-col gap-6 animate-fade-in">
                  {/* Alert notification if sandbox mode was triggered as fallback */}
                  {message.errorNotice && (
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-mono">
                      <FiAlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{message.errorNotice}</span>
                    </div>
                  )}

                  {/* 1. User Prompt Card */}
                  <div className="glass-panel p-5 rounded-xl border border-white/5 relative bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono-label text-neutral-500 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        Arena Input Prompt
                      </span>
                      {message.attachment && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-violet-400 bg-violet-600/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                          <LuFileText className="w-3 h-3" />
                          <span>{message.attachment}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[15px] text-white leading-relaxed font-medium">{message.problem}</p>
                  </div>

                  {/* 2. Side-by-side Solution Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Solution 1 Card (Mistral) */}
                    <div
                      className={`glass-panel p-5 rounded-xl transition-all relative flex flex-col justify-between ${s1Wins
                        ? 'border-violet-500/60 shadow-[0_0_35px_rgba(139,92,246,0.22),_inset_0_0_12px_rgba(139,92,246,0.12)] bg-violet-950/[0.02]'
                        : 'border-white/5 hover:border-white/10'
                        }`}
                    >
                      {/* Winning highlights */}
                      {s1Wins && (
                        <div className="absolute -top-3 right-4 bg-violet-600 border border-violet-400 text-white text-[9px] font-mono tracking-widest px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 uppercase select-none">
                          <LuTrophy className="w-2.5 h-2.5" /> Best Response
                        </div>
                      )}

                      <div>
                        {/* Card Header */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${s1Wins ? 'bg-violet-600/10 border-violet-500/30' : 'bg-neutral-900 border-white/5'}`}>
                              <LuSparkles className={`w-4 h-4 ${s1Wins ? 'text-violet-400' : 'text-neutral-400'}`} />
                            </div>
                            <div>
                              <h3 className={`text-xs font-bold tracking-wide ${s1Wins ? 'text-violet-400' : 'text-neutral-300'}`}>MODEL ALPHA</h3>
                              <p className="text-[9px] text-neutral-500 font-mono tracking-wider">MISTRAL AI</p>
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className={`flex flex-col items-end ${s1Wins ? 'text-violet-400' : 'text-neutral-400'}`}>
                            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Score</span>
                            <span className={`text-xl font-bold font-mono ${s1Wins ? 'text-violet-400 text-neon-glow-violet' : 'text-neutral-300'}`}>
                              {s1Score.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Response Body */}
                        <div className="text-neutral-300 text-[14px] leading-relaxed mb-6 font-normal">
                          {parseMarkdown(message.solution_1)}
                        </div>
                      </div>
                    </div>

                    {/* Solution 2 Card (Cohere) */}
                    <div
                      className={`glass-panel p-5 rounded-xl transition-all relative flex flex-col justify-between ${s2Wins
                        ? 'border-violet-500/60 shadow-[0_0_35px_rgba(139,92,246,0.22),_inset_0_0_12px_rgba(139,92,246,0.12)] bg-violet-950/[0.02]'
                        : 'border-white/5 hover:border-white/10'
                        }`}
                    >
                      {/* Winning highlights */}
                      {s2Wins && (
                        <div className="absolute -top-3 right-4 bg-violet-600 border border-violet-400 text-white text-[9px] font-mono tracking-widest px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 uppercase select-none">
                          <LuTrophy className="w-2.5 h-2.5" /> Best Response
                        </div>
                      )}

                      <div>
                        {/* Card Header */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${s2Wins ? 'bg-violet-600/10 border-violet-500/30' : 'bg-neutral-900 border-white/5'}`}>
                              <LuCpu className={`w-4 h-4 ${s2Wins ? 'text-violet-400' : 'text-neutral-400'}`} />
                            </div>
                            <div>
                              <h3 className={`text-xs font-bold tracking-wide ${s2Wins ? 'text-violet-400' : 'text-neutral-300'}`}>MODEL BETA</h3>
                              <p className="text-[9px] text-neutral-500 font-mono tracking-wider">COHERE AI</p>
                            </div>
                          </div>

                          {/* Score Badge */}
                          <div className={`flex flex-col items-end ${s2Wins ? 'text-violet-400' : 'text-neutral-400'}`}>
                            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Score</span>
                            <span className={`text-xl font-bold font-mono ${s2Wins ? 'text-violet-400 text-neon-glow-violet' : 'text-neutral-300'}`}>
                              {s2Score.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Response Body */}
                        <div className="text-neutral-300 text-[14px] leading-relaxed mb-6 font-normal">
                          {parseMarkdown(message.solution_2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Judge Verdict block */}
                  <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden bg-neutral-950/40">
                    {/* Glowing side accent line - Emerald for verdict clarity, or violet */}
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500" />

                    {/* Verdict Header */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-5 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <LuTrophy className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">JUDGE RECOMMENDATION VERDICT</h4>
                          <span className="text-[10px] font-mono text-neutral-500">EVALUATION METRICS</span>
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[9px] text-neutral-500 font-mono block uppercase">Verdict Winner</span>
                          <span className="text-xs font-bold font-mono text-white uppercase">
                            {s1Wins ? 'Model Alpha' : s2Wins ? 'Model Beta' : 'Draw (Tied)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-neutral-500 font-mono block uppercase">Verdict Score</span>
                          <span className="text-xs font-bold font-mono text-emerald-400">
                            {Math.max(s1Score, s2Score).toFixed(1)}/10.0
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-neutral-500 font-mono block uppercase">Confidence</span>
                          <span className="text-xs font-bold font-mono text-neutral-300">{confidence}</span>
                        </div>
                      </div>
                    </div>

                    {/* Verdict Reasoning */}
                    <div className="mb-6">
                      <h5 className="text-[11px] font-mono text-neutral-400 mb-2 uppercase tracking-wide">Winning Model Reasoning</h5>
                      <p className="text-neutral-300 text-sm leading-relaxed">
                        {s1Wins ? message.judge?.solution_1_reasoning : s2Wins ? message.judge?.solution_2_reasoning : "Both models provided equal quality responses. The evaluation scores resulted in a draw."}
                      </p>
                    </div>

                    {/* Side-by-side reasoning comparison */}
                    <div className="pt-4 border-t border-white/5">
                      <h5 className="text-[11px] font-mono text-neutral-400 mb-3 uppercase tracking-wide">Side-by-Side Evaluation breakdown</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg bg-white/[0.01] border border-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-neutral-300">Model Alpha Assessment</span>
                            <span className="text-xs font-mono text-neutral-500">Score: {s1Score}/10</span>
                          </div>
                          <p className="text-neutral-400 text-xs leading-relaxed font-light">
                            {message.judge?.solution_1_reasoning || 'No details available.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-white/[0.01] border border-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-neutral-300">Model Beta Assessment</span>
                            <span className="text-xs font-mono text-neutral-500">Score: {s2Score}/10</span>
                          </div>
                          <p className="text-neutral-400 text-xs leading-relaxed font-light">
                            {message.judge?.solution_2_reasoning || 'No details available.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Streaming / Loading Placeholder Cards */}
        {isLoading && (
          <div className="flex flex-col gap-6 animate-pulse mt-10">
            {/* User Input Prompt (static mirror) */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 bg-white/[0.01]">
              <div className="w-32 h-3 bg-neutral-800 rounded mb-2" />
              <div className="w-3/4 h-4 bg-neutral-700 rounded" />
            </div>

            {/* Grid for side-by-side solution cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Solution 1 card placeholder */}
              <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-56">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800" />
                      <div className="flex flex-col gap-1.5">
                        <div className="w-20 h-3 bg-neutral-800 rounded" />
                        <div className="w-12 h-2.5 bg-neutral-900 rounded" />
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-neutral-800 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="w-full h-3 bg-neutral-800 rounded" />
                    <div className="w-11/12 h-3 bg-neutral-800 rounded" />
                    <div className="w-4/5 h-3 bg-neutral-800 rounded" />
                  </div>
                </div>
              </div>

              {/* Solution 2 card placeholder */}
              <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-56">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800" />
                      <div className="flex flex-col gap-1.5">
                        <div className="w-20 h-3 bg-neutral-800 rounded" />
                        <div className="w-12 h-2.5 bg-neutral-900 rounded" />
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-neutral-800 rounded-lg" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="w-full h-3 bg-neutral-800 rounded" />
                    <div className="w-11/12 h-3 bg-neutral-800 rounded" />
                    <div className="w-4/5 h-3 bg-neutral-800 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Judge verdict card placeholder */}
            <div className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden bg-neutral-950/40">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-neutral-800" />
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-neutral-800" />
                  <div className="w-32 h-3.5 bg-neutral-800 rounded" />
                </div>
                <div className="flex gap-4">
                  <div className="w-16 h-8 bg-neutral-800 rounded" />
                  <div className="w-16 h-8 bg-neutral-800 rounded" />
                </div>
              </div>
              <div className="flex flex-col gap-2.5 mb-4">
                <div className="w-1/4 h-3 bg-neutral-800 rounded" />
                <div className="w-full h-3.5 bg-neutral-800 rounded" />
                <div className="w-11/12 h-3.5 bg-neutral-800 rounded" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Sticky Bottom Input Area */}
      <footer className="sticky bottom-0 bg-[#050505]/90 backdrop-blur-md pt-4 pb-4 border-t border-white/5 z-30">
        <form onSubmit={handleSend} className="w-full max-w-4xl mx-auto flex flex-col gap-3 relative">

          {/* Active file attachment pill display */}
          {attachedFile && (
            <div className="absolute -top-7 left-2 flex items-center gap-1.5 px-3 py-1 rounded-md bg-violet-600/10 border border-violet-500/20 text-violet-400 text-xs font-mono animate-fade-in shadow-md">
              <LuFileText className="w-3.5 h-3.5" />
              <span>{attachedFile}</span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="text-neutral-400 hover:text-red-400 ml-1 transition-all cursor-pointer"
                title="Remove attachment"
              >
                <LuX className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Glowing container */}
          <div className="glass-panel rounded-2xl active-input-glow flex items-center border border-white/10 p-2 pl-4 transition-all pr-3 bg-neutral-950/80">
            {/* Attach button */}
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mr-2.5"
              title="Attach context file..."
            >
              <LuPaperclip className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Input area */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Compare responses from multiple AI models..."
              disabled={isLoading}
              rows={2}
              className="flex-1 bg-transparent border-0 outline-none text-white text-[14px] placeholder-neutral-500 resize-none py-1 focus:ring-0 leading-relaxed font-light"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Send Button with state management */}
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className={`h-11 px-5 rounded-xl font-medium text-xs font-mono flex items-center justify-center gap-2 select-none border transition-all cursor-pointer ${prompt.trim() && !isLoading
                ? 'bg-violet-600 border-violet-500 text-white hover:bg-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                : 'bg-neutral-900 border-white/5 text-neutral-500 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <LuSend className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="flex justify-between items-center px-2 text-[10px] text-neutral-500 font-mono">
            <span>Powered by Mistral AI, Cohere, and Gemini</span>
            <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default App;