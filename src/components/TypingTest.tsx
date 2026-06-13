import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RefreshCw, Award, Activity, Play } from 'lucide-react';

const PARAGRAPHS = [
  "Glitch in the matrix. The rapid response of mechanical keyboard switches separates the pro esports champions from the amateur scrub. Focus your visual senses and optimize your fingers to strike the letters with absolute precision and unmatched acceleration.",
  "Counter Strike and Valorant necessitate flawless mouse tracking and clicking accuracy. To click efficiently, players combine high-frequency jitter clicking methods with physical arm muscle tensioning to obtain scores over twelve clicks per second on competitive targets.",
  "Vaporwave beats hum in the background while lines of pristine TypeScript code compile into production-ready fullstack web applications. In modern software engineering, clean modularized structures always keep our system resilient so it operates stably behind the scenes.",
  "The dragon flew high above the mountain ridges, guarding the golden keys to the ancient temple of speed. Only a gamer with outstanding reflexes, ultra low latency hardware, and consistent keystroke accuracy could hope to claim the royal title of typing master.",
];

export default function TypingTest() {
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // seconds
  const [paragraph, setParagraph] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Paragraph
  const initTest = () => {
    const randomText = PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
    setParagraph(randomText);
    setUserInput('');
    setIsActive(false);
    setTimeLeft(selectedDuration);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    initTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedDuration]);

  // Start Timer on keypress
  const startTimer = () => {
    setIsActive(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsActive(false);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    const value = e.target.value;
    
    if (!isActive && value.length === 1) {
      startTimer();
    }

    if (value.length <= paragraph.length) {
      setUserInput(value);
      calculateStats(value);
    }
  };

  const calculateStats = (input: string) => {
    if (input.length === 0) {
      setAccuracy(100);
      return;
    }

    // Accuracy Calculation
    let correctChars = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === paragraph[i]) {
        correctChars++;
      }
    }
    const accVal = Math.round((correctChars / input.length) * 100);
    setAccuracy(accVal);

    // WPM Calculation (5 characters represent 1 word on average)
    const timeElapsed = selectedDuration - timeLeft;
    const minutesElapsed = (timeElapsed > 0 ? timeElapsed : 1) / 60;
    const estimatedWords = correctChars / 5;
    const computedWpm = Math.round(estimatedWords / (minutesElapsed || 0.01));
    setWpm(computedWpm);
  };

  // Focus simulation
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render character blocks
  const renderParagraph = () => {
    return paragraph.split('').map((char, index) => {
      let colorClass = 'text-slate-400';
      if (index < userInput.length) {
        colorClass = userInput[index] === char ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5 font-extrabold line-through';
      } else if (index === userInput.length) {
        colorClass = 'text-white border-b-2 border-emerald-400 animate-pulse';
      }
      return (
        <span key={index} className={`font-mono text-sm md:text-base tracking-normal transition-colors duration-100 ${colorClass}`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Settings Row */}
      <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div id="typing-logo-wrap" className="space-y-1 text-center md:text-left">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
            <span>⌨️ Mechanical training hub</span>
          </p>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Typing Speed Test</h2>
          <p className="text-xs text-slate-400">Increase your structural speed so you can type code or chat blocks effortlessly! Click down to start typing.</p>
        </div>

        {/* Level selections */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-905 overflow-hidden border border-slate-800 p-1 bg-[#12172a]">
            {[15, 30, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedDuration(sec)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedDuration === sec 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <button
            onClick={initTest}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer border border-slate-750"
            title="Reset Paragraph"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Primary stats widget panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0e1324] border border-slate-800 p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Time Left</p>
          <p className="text-2xl font-mono font-extrabold text-[#f3f4f6]" id="typing-timer">
            {timeLeft}s
          </p>
        </div>
        <div className="bg-[#0e1324] border border-slate-800 p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Raw Speed</p>
          <p className="text-2xl font-mono font-extrabold text-indigo-400">
            {wpm} <span className="text-xs text-slate-400">WPM</span>
          </p>
        </div>
        <div className="bg-[#0e1324] border border-slate-800 p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Typing Accuracy</p>
          <p className="text-2xl font-mono font-extrabold text-emerald-400">
            {accuracy}%
          </p>
        </div>
        <div className="bg-[#0e1324] border border-slate-800 p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Keystrokes</p>
          <p className="text-2xl font-mono font-extrabold text-purple-400">
            {userInput.length} / {paragraph.length}
          </p>
        </div>
      </div>

      {/* Typing box */}
      <div 
        onClick={focusInput}
        className="bg-[#0c0f1b] border border-slate-800 rounded-2xl p-6 min-h-48 relative overflow-hidden select-none cursor-text hover:border-indigo-500/20 transition-all shadow-inner block"
      >
        <div className="leading-relaxed text-justify mb-4 select-none pointer-events-none p-1">
          {renderParagraph()}
        </div>

        {/* Hidden active text area */}
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={isFinished}
          id="typing-invisible-textarea"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-auto resize-none outline-none z-10 p-6"
          placeholder="Start typing the text here..."
          autoFocus
        />

        {!isActive && userInput.length === 0 && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs z-10 pointer-events-none">
            <Keyboard size={32} className="text-indigo-400 animate-bounce mb-2" />
            <p className="text-sm font-bold text-white uppercase tracking-wide">Click here to focus and begin typing!</p>
            <p className="text-[11px] text-slate-400">The clock starts ticking the very instant you strike the first key.</p>
          </div>
        )}
      </div>

      {/* Finish Report */}
      {isFinished && (
        <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/20 border border-indigo-500/30 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between text-center md:text-left animate-fadeIn">
          <div className="space-y-1">
            <p className="text-xs text-indigo-400 font-extrabold uppercase flex items-center gap-1.5 justify-center md:justify-start">
              <Award size={14} /> Certificate Registered!
            </p>
            <h3 className="text-base font-extrabold text-white">Your High Score: {wpm} Words Per Minute</h3>
            <p className="text-xs text-slate-300">You typed with a formidable accuracy of <strong className="text-emerald-400">{accuracy}%</strong>. Keep repeating tests to elevate muscle fiber reflexes!</p>
          </div>

          <button
            onClick={initTest}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold uppercase hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Try another round
          </button>
        </div>
      )}
    </div>
  );
}
