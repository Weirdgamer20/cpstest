import React, { useEffect } from 'react';
import { seoDataMap } from '../seoData';
import { AlignLeft, HelpCircle, GraduationCap, ChevronRight, Bookmark } from 'lucide-react';

interface SeoLayoutProps {
  currentPathname: string;
}

export default function SeoLayout({ currentPathname }: SeoLayoutProps) {
  const data = seoDataMap[currentPathname];

  useEffect(() => {
    if (!data) return;
    // Dynamically update head titles and tags for perfect SEO indexing!
    document.title = data.metaTitle;
    
    // Attempt updating meta elements if possible
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute("content", data.metaDescription);
    }
  }, [data]);

  if (!data) return null;

  // Generate dynamic schemas for Search Engines
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": data.breadcrumbs.map((bc, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": bc.name,
      "item": `https://cpstest.chronosarena.com${bc.item}`
    }))
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Chronos Arena Gaming Reflex Bench",
    "operatingSystem": "All",
    "applicationCategory": "GameApplication, EducationalApplication",
    "browserRequirements": "Requires HTML5 Canvas, Web Audio API, pointer events compatibility.",
    "softwareVersion": "2.4.2",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-[#1e294b]">
      {/* Inject JSON-LD Schema structures */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />

      {/* Styled breadcrumbs navigation */}
      <nav className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-slate-500 bg-[#0c1122]/50 px-3 py-1.5 rounded-lg border border-slate-900/60 w-fit">
        {data.breadcrumbs.map((bc, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={10} className="text-slate-600" />}
            <span className={idx === data.breadcrumbs.length - 1 ? "text-emerald-400" : ""}>
              {bc.name}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Unique Page Headings */}
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
          <AlignLeft size={16} className="text-emerald-400" />
          {data.h1}
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          {data.metaDescription}
        </p>
      </div>

      {/* 500+ Word Comprehensive Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#0d1222]/80 border border-[#1e294b] rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Main Text block */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 text-slate-200">
            <GraduationCap size={16} className="text-emerald-400" />
            {data.educationalContent.sectionTitle}
          </h3>
          <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
            {data.educationalContent.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        {/* Pro Tips Side Card */}
        <div className="lg:col-span-4 p-5 bg-[#090d19] border border-slate-850 rounded-2xl space-y-4">
          <div>
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Bookmark size={12} />
              {data.educationalContent.tipsTitle}
            </h4>
            <div className="border-b border-slate-850 my-2" />
          </div>
          <ul className="space-y-2.5 text-[11px] text-slate-350 list-none pl-0">
            {data.educationalContent.tips.map((tip, idx) => (
              <li key={idx} className="flex gap-2 items-start">
                <span className="text-emerald-400 select-none">⚡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              PRO BENCHMARKS
            </span>
            <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 leading-normal">
              {data.educationalContent.professionalBenchmarks}
            </div>
          </div>
        </div>
      </div>

      {/* Styled FAQ list with expandables */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle size={16} className="text-teal-400" />
          Frequently Asked Questions (FAQ)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.faqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-[#0a0e1a]/80 border border-slate-850 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-normal">
                {faq.question}
              </h4>
              <p className="text-xs text-slate-405 leading-relaxed font-sans">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
