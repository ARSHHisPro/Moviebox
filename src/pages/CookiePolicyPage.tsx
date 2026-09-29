import React, { useEffect } from 'react';
import { Cookie, Settings2, ShieldCheck, Database, Layers, ExternalLink, ArrowLeft, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';

interface CookiePolicyPageProps {
  onNavigate: (route: string) => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenCookieBanner = () => {
    window.dispatchEvent(new Event('open-cookie-banner'));
  };

  const sections = [
    { id: 'what-are-cookies', title: '1. What Are Cookies & Web Storage Technologies?' },
    { id: 'storage-philosophy', title: '2. Our Client-Side Storage Philosophy' },
    { id: 'storage-inventory', title: '3. Complete MovieBox Storage Inventory' },
    { id: 'categories', title: '4. Storage Categories & Functional Purposes' },
    { id: 'third-party-cookies', title: '5. Third-Party Cookies Originating from Embeds' },
    { id: 'browser-controls', title: '6. Managing & Blocking Cookies in Browsers' },
    { id: 'dnt-gpc', title: '7. Do Not Track (DNT) & Global Privacy Control' },
    { id: 'policy-changes', title: '8. Revisions & Policy Modifications' },
    { id: 'contact', title: '9. Cookie Management & Contact Support' },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Back and Breadcrumbs */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00d2ff]" />
            <span>Return to Catalog</span>
          </button>
          <div className="text-xs text-slate-400">
            Last Updated: <span className="text-white font-mono">September 29, 2026</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-950 via-black to-[#090514] shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Cookie className="w-3.5 h-3.5" />
              <span>Cookie & Local Storage Policy</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Cookie Policy & Storage Transparency
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              This document outlines how MovieBox utilizes browser storage mechanisms (<code className="text-[#00d2ff]">localStorage</code>, <code className="text-[#00d2ff]">sessionStorage</code>, and HTTP state) to enhance your streaming curation without centralized tracking.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenCookieBanner}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#00d2ff] to-cyan-500 hover:from-cyan-400 hover:to-[#00d2ff] text-black font-extrabold text-xs shadow-xl shadow-[#00d2ff]/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Settings2 className="w-4 h-4 stroke-[2.5px]" />
                <span>Adjust Cookie Preferences</span>
              </button>
              <button
                onClick={() => onNavigate('privacy')}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Read Privacy Policy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* Quick Nav */}
          <div className="lg:col-span-1 glass-panel p-5 rounded-3xl border border-white/10 sticky top-6 hidden lg:block space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Cookie Sections</h3>
            <nav className="space-y-1 text-xs">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block py-1.5 px-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors truncate"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Legal Text */}
          <div className="lg:col-span-3 space-y-10 text-xs sm:text-sm text-slate-300 leading-relaxed">

            {/* Section 1 */}
            <section id="what-are-cookies" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Cookie className="w-5 h-5 text-amber-400" />
                <span>1. What Are Cookies & Web Storage Technologies?</span>
              </h2>
              <p>
                Cookies are small alphanumeric text files stored on your computer or mobile device when you load websites. While traditional cookies are automatically transmitted to web servers in every HTTP header, modern modern web platforms like MovieBox primarily employ <strong className="text-white">HTML5 Web Storage (localStorage and sessionStorage)</strong>.
              </p>
              <p>
                Unlike cookies, data stored in HTML5 <code className="text-[#00d2ff]">localStorage</code> remains strictly on your local device. It is never transmitted across the wire to our servers during ordinary page navigation, providing far superior security, speed, and privacy isolation.
              </p>
            </section>

            {/* Section 2 */}
            <section id="storage-philosophy" className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-cyan-950/10 space-y-4">
              <div className="flex items-center gap-2 text-[#00d2ff] font-bold uppercase tracking-wider text-xs">
                <Database className="w-4 h-4" />
                <span>Zero Tracking Architecture</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                2. Our Client-Side Storage Philosophy
              </h2>
              <p>
                MovieBox has eliminated traditional tracking cookies entirely. We do not use third-party analytics cookies, advertising cookies, behavioral re-targeting pixels, or device fingerprinting hashes.
              </p>
              <p>
                Every storage entry instantiated by MovieBox serves one of two purposes:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-white">User Utility:</strong> Preserving your Continue Watching timestamps so you can resume where you left off.</li>
                <li><strong className="text-white">Customization:</strong> Remembering your selected theme colors, volume levels, and favorite bookmarks.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="storage-inventory" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>3. Complete MovieBox Storage Inventory</span>
              </h2>
              <p>
                In compliance with international transparency directives, here is an exhaustive audit of all storage keys utilized on the MovieBox domain:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white font-bold">
                      <th className="py-2.5 px-3">Storage Key</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Purpose & Data Retained</th>
                      <th className="py-2.5 px-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[#00d2ff]">moviebox_continue_watching</td>
                      <td className="py-2.5 px-3">localStorage</td>
                      <td className="py-2.5 px-3">Stores paused movie/episode timestamps & season numbers.</td>
                      <td className="py-2.5 px-3">Persistent (Until cleared)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[#00d2ff]">moviebox_favorites</td>
                      <td className="py-2.5 px-3">localStorage</td>
                      <td className="py-2.5 px-3">Your bookmarked titles and watchlist media IDs.</td>
                      <td className="py-2.5 px-3">Persistent (Until cleared)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[#00d2ff]">moviebox_history</td>
                      <td className="py-2.5 px-3">localStorage</td>
                      <td className="py-2.5 px-3">List of recently visited catalog titles for quick access.</td>
                      <td className="py-2.5 px-3">Persistent (Until cleared)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[#00d2ff]">moviebox_theme</td>
                      <td className="py-2.5 px-3">localStorage</td>
                      <td className="py-2.5 px-3">Active visual color scheme (Midnight, Ocean, Purple, etc.).</td>
                      <td className="py-2.5 px-3">Persistent (Until cleared)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[#00d2ff]">moviebox_cookie_consent</td>
                      <td className="py-2.5 px-3">localStorage</td>
                      <td className="py-2.5 px-3">Records your cookie choices so the banner does not re-appear.</td>
                      <td className="py-2.5 px-3">Persistent (Until cleared)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[#00d2ff]">moviebox_user</td>
                      <td className="py-2.5 px-3">localStorage</td>
                      <td className="py-2.5 px-3">Local user session credentials or anonymous guest token.</td>
                      <td className="py-2.5 px-3">Persistent (Until sign-out)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[#00d2ff]">moviebox_announcement</td>
                      <td className="py-2.5 px-3">localStorage</td>
                      <td className="py-2.5 px-3">Cached top banner broadcast for instant zero-latency render.</td>
                      <td className="py-2.5 px-3">Persistent (Until updated)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-[#00d2ff]">moviebox_system_settings</td>
                      <td className="py-2.5 px-3">localStorage</td>
                      <td className="py-2.5 px-3">Cached platform configuration variables.</td>
                      <td className="py-2.5 px-3">Persistent (Until updated)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4 */}
            <section id="categories" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>4. Storage Categories & Functional Purposes</span>
              </h2>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Strictly Necessary Storage</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-bold">Always Required</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Essential for security, session verification, and fundamental routing. Without these tokens, the website cannot render media catalog pages or manage user sign-in state.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Functional & Personalization Storage</span>
                    <span className="text-[10px] text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded font-bold">User Controlled</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Allows MovieBox to remember your preferred playback timestamp, audio volume, selected streaming server index, and custom theme palette across browser reloads.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Advertising & Tracking Cookies</span>
                    <span className="text-[10px] text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded font-bold">100% Never Used</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    MovieBox contains zero advertising pixels, zero tracking cookies, and zero behavioral telemetry scrapers.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="third-party-cookies" className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-amber-950/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-black text-white">
                5. Third-Party Cookies Originating from Embeds
              </h2>
              <p>
                When you initiate playback on a video player, an iframe points to independent third-party streaming engines (such as VidLink, VidSrc, AutoEmbed, Embed.su, SmashyStream).
              </p>
              <p>
                Because these embeds run on distinct origin domains, those third parties may deploy their own cookies or storage objects according to their respective policies. MovieBox has no access to or control over these third-party cookies due to modern browser Same-Origin Policy protections.
              </p>
              <p>
                To block third-party cookies from embedded video players, we recommend enabling "Block Third-Party Cookies" within your browser's security preferences.
              </p>
            </section>

            {/* Section 6 */}
            <section id="browser-controls" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <span>6. Managing & Blocking Cookies in Browsers</span>
              </h2>
              <p>
                You have the absolute right to accept, reject, or wipe cookies and local storage objects at any moment:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-white">Google Chrome:</strong> Settings → Privacy and Security → Third-Party Cookies → Block third-party cookies or Clear browsing data.
                </li>
                <li>
                  <strong className="text-white">Mozilla Firefox:</strong> Settings → Privacy & Security → Enhanced Tracking Protection (Strict Mode) or Clear Data.
                </li>
                <li>
                  <strong className="text-white">Apple Safari (iOS & macOS):</strong> Settings → Safari → Advanced → Block All Cookies / Prevent Cross-Site Tracking.
                </li>
                <li>
                  <strong className="text-white">Brave Browser:</strong> Shields Up → Block cross-site trackers and third-party cookies.
                </li>
              </ul>
              <p>
                You can also wipe all MovieBox local storage at any time by clicking the "Clear All Local Data" button on our <button onClick={() => onNavigate('settings')} className="text-[#00d2ff] hover:underline font-bold">Settings Page</button>.
              </p>
            </section>

            {/* Section 7 */}
            <section id="dnt-gpc" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">7. Do Not Track (DNT) & Global Privacy Control (GPC)</h2>
              <p>
                MovieBox honors Do Not Track (DNT) browser headers and Global Privacy Control (GPC) signals. Because we do not track users across websites, these signals are naturally respected and enforced across our entire software architecture.
              </p>
            </section>

            {/* Section 8 */}
            <section id="policy-changes" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">8. Revisions & Policy Modifications</h2>
              <p>
                We may periodically update this Cookie Policy to reflect changes in storage keys or technical requirements. Any modifications will be posted directly to this page with an updated timestamp.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">9. Cookie Management & Contact Support</h2>
              <p>
                If you have questions about how storage is handled on MovieBox or wish to adjust your consent preferences, please use the button below or contact the maintainer:
              </p>
              <div className="pt-2">
                <button
                  onClick={handleOpenCookieBanner}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#00d2ff]" />
                  <span>Re-open Consent Selector</span>
                </button>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};
