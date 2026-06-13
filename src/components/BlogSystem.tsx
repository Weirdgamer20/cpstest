import React, { useState } from 'react';
import { BLOG_POSTS, BlogPost } from '../data/blogData';
import { BookOpen, Calendar, User, Clock, ChevronRight, Search, ArrowLeft, Share2, Sparkles, AlertCircle } from 'lucide-react';

interface BlogSystemProps {
  onNavigateToMode: (mode: any) => void;
}

export default function BlogSystem({ onNavigateToMode }: BlogSystemProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  // Filter posts
  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = activeTag ? post.tags.includes(activeTag) : true;
    return matchesSearch && matchesTag;
  });

  // Extract all unique tags
  const allTags = Array.from(new Set(BLOG_POSTS.flatMap((post) => post.tags)));

  const handleShare = (post: BlogPost) => {
    const shareUrl = `${window.location.origin}/blog/${post.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    }
  };

  const handleModeRedirect = (path: string) => {
    // Map path to mode
    if (path === '/jitter-click-test') onNavigateToMode('jitter');
    else if (path === '/reaction-time-test') onNavigateToMode('reaction');
    else if (path === '/5-second-cps-test') onNavigateToMode('cps-test');
    else if (path === '/kohi-click-test') onNavigateToMode('kohi');
    else onNavigateToMode('home');
  };

  return (
    <div id="blog-system-root" className="space-y-6 animate-fadeIn text-slate-100">
      
      {/* Blog header section */}
      {!selectedPost ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-400" />
                <span>CHRONOS ESPORTS BLOG & RESEARCH</span>
              </span>
              <h1 className="text-2xl font-black text-white mt-1 uppercase tracking-wide">
                PVP Speed Test Insights
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Explore hand biomechanics guides, neurological reaction data, and mechanical mouse optimizations verified by esports trainers.
              </p>
            </div>
          </div>

          {/* Search, Filter tags, and Blog list view */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Filter tags panel (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="p-4 bg-[#080c18] border border-slate-850 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} className="text-emerald-400" /> Filter Topics
                </h3>
                
                <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
                  <button
                    onClick={() => setActiveTag(null)}
                    className={`px-3 py-2 text-left rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeTag === null
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12182c]'
                    }`}
                  >
                    All Articles
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={`px-3 py-2 text-left rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTag === tag
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#12182c]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative side panel info */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 uppercase tracking-tight">
                  <AlertCircle size={14} className="shrink-0" /> Scientific Parity
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Every guide published is cross-examined against physical clinical reports on motor kinetics, wrist stress mitigation, and neural conduction intervals.
                </p>
              </div>
            </div>

            {/* Main Articles List Grid (lg:col-span-9) */}
            <div className="lg:col-span-9 space-y-5">
              {/* Search Box */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Query blog topics or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#080c18] border border-slate-850 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/40"
                />
              </div>

              {/* Loop articles cards */}
              {filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="p-5 bg-[#080c18] border border-slate-850 rounded-2xl hover:border-emerald-500/20 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                      
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-emerald-400">
                          <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 uppercase font-black uppercase text-[9px]">
                            {post.category}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar size={11} /> {post.date}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock size={11} /> {post.readTime}
                          </span>
                        </div>

                        <h2 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight mt-1">
                          {post.title}
                        </h2>

                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          {post.summary}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-[9px] uppercase font-bold px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-emerald-400 font-extrabold uppercase shrink-0">
                        <span>Read post</span>
                        <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 bg-[#080c18] border border-slate-850 rounded-2xl text-slate-500 font-mono text-xs">
                  No matching blog posts found. Try another search query!
                </div>
              )}
            </div>
            
          </div>
        </div>
      ) : (
        // Active blog reader view layout
        <div className="space-y-6">
          {/* Back to list button */}
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer w-fit py-1.5 pr-3 bg-slate-900/40 hover:bg-slate-900 px-3.5 rounded-xl border border-slate-850"
          >
            <ArrowLeft size={14} /> Back to Insights list
          </button>

          {/* Core Post structure */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Main Article Col */}
            <div className="lg:col-span-8 p-6 lg:p-8 bg-[#080c18] border border-slate-850 rounded-2xl space-y-6">
              
              {/* Header meta */}
              <div className="space-y-3.5 border-b border-slate-850 pb-5">
                <span className="text-[9px] uppercase font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                  {selectedPost.category}
                </span>

                <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                  {selectedPost.title}
                </h1>

                <div className="flex flex-wrap gap-4 items-center text-xs text-slate-400 pt-1 font-mono">
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-emerald-400" /> {selectedPost.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-400" /> {selectedPost.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-400" /> {selectedPost.readTime}
                  </span>
                </div>
              </div>

              {/* Render content paragraphs beautifully with typography patterns */}
              <div className="text-slate-350 text-[13px] leading-relaxed space-y-5 font-sans font-medium">
                {selectedPost.content.split('\n\n').map((para, pIdx) => {
                  if (para.startsWith('## ')) {
                    return (
                      <h2 key={pIdx} className="text-white font-extrabold text-lg pt-4 pb-1 uppercase tracking-tight border-b border-slate-900">
                        {para.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (para.startsWith('### ')) {
                    return (
                      <h3 key={pIdx} className="text-slate-200 font-extrabold text-sm pt-3 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-450 rounded-full" />
                        {para.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (para.startsWith('- ')) {
                    const items = para.split('\n');
                    return (
                      <ul key={pIdx} className="list-disc list-inside pl-2.5 space-y-2 bg-[#0a0e19] p-3 rounded-xl border border-slate-900">
                        {items.map((it, itIdx) => {
                          const cleaned = it.replace('- ', '');
                          if (cleaned.includes('**')) {
                            const parts = cleaned.split('**');
                            return (
                              <li key={itIdx}>
                                <strong className="text-slate-200">{parts[1]}</strong>
                                {parts[2]}
                              </li>
                            );
                          }
                          return <li key={itIdx}>{cleaned}</li>;
                        })}
                      </ul>
                    );
                  }
                  return <p key={pIdx}>{para}</p>;
                })}
              </div>

              {/* Action linking section */}
              {selectedPost.relatedPath && (
                <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-[#0a0e1a] to-emerald-500/5 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Ready to Put This Technique to the Test?
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      We have custom interactive benchmarks mapped directly to this physical coaching guide.
                    </p>
                  </div>
                  <button
                    onClick={() => handleModeRedirect(selectedPost.relatedPath!)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition-all tracking-wider uppercase shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Launch Game</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Right Meta Info Panel */}
            <div className="lg:col-span-4 space-y-4">
              {/* Share card */}
              <div className="p-5 bg-[#080c18] border border-slate-850 rounded-2xl text-center space-y-4">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Share Article</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Copy compiling educational links to share speed tips with your guild mates or team discords.
                </p>
                <button
                  onClick={() => handleShare(selectedPost)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    copyStatus 
                      ? 'bg-transparent text-emerald-400 border-emerald-500' 
                      : 'bg-[#12182c] border-slate-800 text-slate-300 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500'
                  }`}
                >
                  <Share2 size={13} />
                  <span>{copyStatus ? 'Link Copied!' : 'Copy Share link'}</span>
                </button>
              </div>

              {/* More articles side navigation */}
              <div className="p-4 bg-[#080c18] border border-slate-850 rounded-2xl space-y-3.5">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Read Next</h3>
                
                <div className="space-y-2 border-t border-slate-900 pt-2 text-xs">
                  {BLOG_POSTS.filter((p) => p.id !== selectedPost.id).slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="p-2 rounded-lg hover:bg-[#12182c] border border-transparent hover:border-slate-850 cursor-pointer space-y-0.5 group transition-all"
                    >
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">{post.category}</span>
                      <h4 className="font-bold text-slate-300 group-hover:text-emerald-450 transition-colors line-clamp-1">
                        {post.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
