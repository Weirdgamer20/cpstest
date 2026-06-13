import React from 'react';
import { Trophy, RefreshCw, X, Share2, Zap, Award } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  score: number;
  duration: string;
  cps: number;
  testType: string;
  onClose: () => void;
  onRestart: () => void;
}

export default function ScoreModal({
  isOpen,
  score,
  duration,
  cps,
  testType = 'CPS Speed Test',
  onClose,
  onRestart
}: ScoreModalProps) {
  if (!isOpen) return null;

  // Determine Rank and Emoji
  let rank = 'Sloth';
  let emoji = '🦥';
  let desc = 'You are clicking slowly. Try relaxing your forearm!';
  let rankColor = 'text-slate-400 bg-slate-500/10 border-slate-500/30';

  if (cps >= 4 && cps < 7) {
    rank = 'Turtle';
    emoji = '🐢';
    desc = 'Average speed. Great for casual gamers!';
    rankColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  } else if (cps >= 7 && cps < 10) {
    rank = 'Cheetah';
    emoji = '🐆';
    desc = 'Fast clicker! You are battle-ready for competitive PvP!';
    rankColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (cps >= 10 && cps < 14) {
    rank = 'Meteor';
    emoji = '☄️';
    desc = 'Absolute Legend! Your fingers fly across the keys!';
    rankColor = 'text-red-400 bg-red-500/10 border-red-500/30';
  } else if (cps >= 14) {
    rank = 'Cyber Android';
    emoji = '🤖';
    desc = 'Unbelievable! Are you human, or is this an auto-clicker?';
    rankColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 glow-green';
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-md">
      <div className="bg-[#0e1324] border border-[#1e294b] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative game-card-glow max-h-[90vh] overflow-y-auto">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-center text-slate-950 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-900 bg-slate-950/10 hover:bg-slate-900/20"
          >
            <X size={16} />
          </button>
          <Trophy size={48} className="mx-auto text-slate-950 mb-2 animate-bounce" />
          <h2 className="text-xl font-extrabold tracking-wide uppercase">Test Completed!</h2>
          <p className="text-xs font-bold opacity-80 uppercase">{testType}</p>
        </div>

        {/* Dynamic score summary */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Performance</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-5xl font-extrabold text-emerald-400 font-mono tracking-tight">{cps.toFixed(2)}</span>
              <span className="text-lg font-bold text-neutral-400">CPS</span>
            </div>
            <p className="text-xs text-slate-400">Clicks per elapsed second</p>
          </div>

          {/* Gamified Rank card */}
          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="text-4xl select-none">{emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs font-bold uppercase">Assigned Rank:</span>
                <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded border ${rankColor}`}>
                  {rank}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">{desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#151c33]/50 rounded-xl border border-slate-850 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Clicks</p>
              <p className="text-lg font-extrabold text-white font-mono">{score}</p>
            </div>
            <div className="p-3 bg-[#151c33]/50 rounded-xl border border-slate-850 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Duration</p>
              <p className="text-lg font-extrabold text-white font-mono">{duration}</p>
            </div>
          </div>

          {/* Social Sharing block with Challenge URLs & real channels */}
          <div className="p-4 bg-[#0a0e1b]/80 border border-slate-850 rounded-2xl space-y-3">
            <span className="text-[10px] font-black tracking-widest text-[#10b981] uppercase block text-center">
              Invite & Challenge Your Friends
            </span>
            
            <div className="text-center bg-slate-900/60 p-2 border border-slate-800 rounded-lg select-all">
              <span className="text-[9px] text-slate-550 block font-bold mb-1 uppercase">Your Challenge Link</span>
              <p className="text-[10px] text-emerald-400 font-mono break-all truncate">
                {`${window.location.origin}/challenge/${cps.toFixed(1)}/cps`}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=I%20just%20recorded%20${cps.toFixed(2)}%20CPS%20on%20Chronos%20Arena!%20Can%20you%20beat%20me%3F%20Challenge%20me%20here%3A%20${encodeURIComponent(`${window.location.origin}/challenge/${cps.toFixed(1)}/cps`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center text-xs transition-colors"
                title="Share to WhatsApp"
              >
                💬
              </a>
              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=I%20just%20recorded%20${cps.toFixed(2)}%20CPS%20on%20Chronos%20Arena!%20Beat%20my%20score%20here%20${encodeURIComponent(`${window.location.origin}/challenge/${cps.toFixed(1)}/cps`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl flex items-center justify-center text-xs transition-colors"
                title="Share to Twitter/X"
              >
                𝕏
              </a>
              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/challenge/${cps.toFixed(1)}/cps`)}&text=I%20just%20recorded%20${cps.toFixed(2)}%20CPS%20on%20Chronos%20Arena!`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center text-xs transition-colors"
                title="Share to Telegram"
              >
                ✈️
              </a>
              {/* Discord info */}
              <button
                onClick={() => {
                  const inviteText = `Chronos Arena Score: ${cps.toFixed(2)} CPS!\nPlay and beat this score: ${window.location.origin}/challenge/${cps.toFixed(1)}/cps`;
                  navigator.clipboard.writeText(inviteText);
                  alert("Copied custom Discord message payload to clipboard!");
                }}
                className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-450 border border-indigo-500/20 rounded-xl flex items-center justify-center text-xs transition-colors"
                title="Copy for Discord"
              >
                👾
              </button>
              {/* Quick Copy */}
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/challenge/${cps.toFixed(1)}/cps`;
                  navigator.clipboard.writeText(shareUrl);
                  alert("Challenge invite URL copied!");
                }}
                className="p-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 border border-slate-500/20 rounded-xl flex items-center justify-center text-xs transition-colors"
                title="Copy URL link"
              >
                🔗
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onRestart}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>Retry speedtest</span>
            </button>
            <button
              onClick={() => {
                // Mock native sharing dialog
                if (navigator.share) {
                  navigator.share({
                    title: 'Chronos Arena Result',
                    text: `My click speed is ${cps.toFixed(2)} CPS on Chronos Arena! Can you beat me?`,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  // Fallback alert using simulated status in page or simple copy
                  const textToCopy = `My click speed is ${cps.toFixed(2)} CPS on Chronos Arena! Can you beat me?`;
                  navigator.clipboard.writeText(textToCopy);
                  const btn = document.getElementById('share-btn-score');
                  if (btn) {
                    btn.innerText = 'COPIED!';
                    setTimeout(() => {
                      if (btn) btn.innerText = 'SHARE';
                    }, 2000);
                  }
                }
              }}
              id="share-btn-score"
              className="px-4 py-3 bg-[#151c33] text-slate-300 hover:text-white border border-slate-800 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-colors hover:bg-slate-800 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
