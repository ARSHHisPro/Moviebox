import React, { useEffect } from 'react';
import { Shield, EyeOff, Database, Lock, Server, Trash2, ArrowLeft, CheckCircle2, AlertCircle, FileCheck } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (route: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sections = [
    { id: 'foundational-principle', title: '1. Foundational Doctrine: User Main Data Stored Nowhere' },
    { id: 'data-we-never-collect', title: '2. Information We Never Collect or Request' },
    { id: 'local-first-storage', title: '3. The Local-First Client Architecture' },
    { id: 'authentication-tokens', title: '4. Firebase Authentication & Identity Privacy' },
    { id: 'no-server-logs', title: '5. Server-Side Non-Logging Architecture' },
    { id: 'third-party-iframes', title: '6. Third-Party Video Embeds & External Analytics' },
    { id: 'data-destruction', title: '7. Complete Data Erasure & User Control' },
    { id: 'gdpr-ccpa', title: '8. International Compliance: GDPR, CCPA & Global Rights' },
    { id: 'children-privacy', title: '9. Protection of Minors (COPPA Policy)' },
    { id: 'security-standards', title: '10. Technical Security & Encryption Standards' },
    { id: 'policy-updates', title: '11. Amendments & Notification of Changes' },
    { id: 'privacy-officer', title: '12. Contacting the Privacy Officer' },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00d2ff]" />
            <span>Return to Catalog</span>
          </button>
          <div className="text-xs text-slate-400">
            Policy Version: <span className="text-white font-mono">v2.4.0 (Sept 2026)</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-950 via-black to-[#04151f] shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Uncompromising Privacy Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Privacy Policy & Data Sovereignty
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              At MovieBox, your digital privacy is not a decorative marketing statement — it is engineered into our system architecture. We operate under a strict non-custodial model: <strong className="text-white">your main user data is stored nowhere on our servers</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">No Identity Profiling</div>
                  <div className="text-[11px] text-slate-400">Zero ad brokers</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Database className="w-5 h-5 text-[#00d2ff] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Local-First Storage</div>
                  <div className="text-[11px] text-slate-400">On your device only</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">1-Click Total Wipe</div>
                  <div className="text-[11px] text-slate-400">Instant cache erase</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* Sticky Navigation */}
          <div className="lg:col-span-1 glass-panel p-5 rounded-3xl border border-white/10 sticky top-6 hidden lg:block space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Privacy Sections</h3>
            <nav className="space-y-1 text-xs">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block py-1.5 px-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors truncate"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Legal Text */}
          <div className="lg:col-span-3 space-y-10 text-xs sm:text-sm text-slate-300 leading-relaxed">

            {/* Section 1 */}
            <section id="foundational-principle" className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                <Shield className="w-4 h-4" />
                <span>Foundational Pillar</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                1. Foundational Doctrine: User Main Data Stored Nowhere
              </h2>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 font-medium leading-relaxed">
                MovieBox is built on the tenet that the safest user data is data that is never gathered, never centralized, and never monetized. We do not maintain user databases containing personal real-world identities, browsing habits, credit cards, or physical locations.
              </div>
              <p>
                Unlike commercial streaming services that track every second of user pause time, cursor velocity, and biometric engagement to construct algorithmic advertising dossiers, MovieBox is a personal curation software tool. We do not sell, rent, monetize, syndicate, or broker user records to third-party data aggregators, advertising syndicates, or analytics firms.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-we-never-collect" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-rose-400" />
                <span>2. Information We Never Collect or Request</span>
              </h2>
              <p>
                To provide absolute transparency, here is an explicit list of data categories that MovieBox <strong className="text-white">NEVER</strong> collects, requests, or processes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Financial & Billing Data</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    No credit card numbers, bank details, cryptocurrency wallets, or billing addresses. MovieBox is 100% free.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Government Identifiers</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    No Social Security numbers, passport records, driver's licenses, or national identity IDs.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Real-Time Precise Geolocation</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    We never query GPS coordinates, WiFi triangulation, or mobile cellular tower telemetry.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Biometric & Sensor Telemetry</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    No camera feeds, microphone recordings, facial recognition data, or fingerprint tokens.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="local-first-storage" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#00d2ff]" />
                <span>3. The Local-First Client Architecture</span>
              </h2>
              <p>
                All your preferences and application state reside strictly on your own hardware inside your web browser's isolated local storage sandbox (<code className="text-[#00d2ff]">localStorage</code> and <code className="text-[#00d2ff]">sessionStorage</code>):
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-white">Continue Watching Timestamps:</strong> When you pause a title, the numerical millisecond timestamp and episode number are written solely into your local browser's storage key (<code className="text-[#00d2ff]">moviebox_continue_watching</code>). This allows you to resume playback seamlessly on your device without transmitting viewing logs to our servers.
                </li>
                <li>
                  <strong className="text-white">Favorites & Watchlist:</strong> Titles you heart or bookmark are saved into <code className="text-[#00d2ff]">moviebox_favorites</code> directly on your phone or computer.
                </li>
                <li>
                  <strong className="text-white">UI Theme Preferences:</strong> Your selected visual theme (Midnight, Ocean, Purple, Emerald, or Crimson) is saved into <code className="text-[#00d2ff]">moviebox_theme</code>.
                </li>
                <li>
                  <strong className="text-white">Parental PIN Protection:</strong> If you set a 4-digit security PIN to restrict certain titles, the cryptographic hash is evaluated client-side on your own device.
                </li>
              </ul>
              <p>
                Because this data is stored client-side, clearing your browser cookies and site data completely wipes all records instantly.
              </p>
            </section>

            {/* Section 4 */}
            <section id="authentication-tokens" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <span>4. Firebase Authentication & Identity Privacy</span>
              </h2>
              <p>
                To provide access to interactive features such as the Trivia Leaderboard and Community Film Reviews, MovieBox integrates Google Firebase Authentication.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong className="text-white">Anonymous Guest Sessions:</strong> By default, users browse with an anonymous, randomized cryptographic token generated on-the-fly. No personal identifying information (PII) is associated with this token.
                </li>
                <li>
                  <strong className="text-white">Optional Account Creation:</strong> If you voluntarily choose to sign in via Google or email, Firebase securely provisions your session. Passwords are never visible to or stored in plain-text by MovieBox; they are hashed using Google's enterprise scrypt/bcrypt authentication architecture.
                </li>
                <li>
                  <strong className="text-white">Leaderboard Usernames:</strong> When submitting trivia scores, you may specify a custom display moniker of your choosing. We encourage pseudonyms and avoid requiring real names.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="no-server-logs" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <span>5. Server-Side Non-Logging Architecture</span>
              </h2>
              <p>
                Our server backend operates with ephemeral in-memory request forwarding:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong className="text-white">Zero IP Request Logging:</strong> We do not write inbound user IP addresses, request header profiles, or query terms into persistent log files.
                </li>
                <li>
                  <strong className="text-white">In-Memory Cache:</strong> Responses from The Movie Database (TMDB) are cached transiently in RAM to protect rate limits. Once the process memory is refreshed, all transient cache is automatically recycled.
                </li>
                <li>
                  <strong className="text-white">No Telemetry Beacons:</strong> MovieBox does not inject Google Analytics, Meta Pixel, TikTok tracking beacons, or cross-site fingerprinting scripts into its source bundles.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="third-party-iframes" className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-amber-950/10 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>External Content Notice</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                6. Third-Party Video Embeds & External Analytics
              </h2>
              <p>
                When you initiate playback on a film or episode, MovieBox renders an HTML iframe pointing to independent media syndication endpoints (e.g., VidLink, VidSrc, AutoEmbed).
              </p>
              <p>
                <strong className="text-white">Please be aware:</strong> Once an iframe loads, your browser establishes a direct TCP/TLS connection with that external operator's domain. That third-party domain operates under its own privacy policy and terms. They may deploy their own cookies, session storage, or advertisement scripts within the boundary of their frame.
              </p>
              <p>
                MovieBox enforces strict iframe sandbox restrictions where supported and employs click-hijack prevention to block unauthorized new-window spawning. However, we cannot regulate the internal privacy practices of external hosts.
              </p>
            </section>

            {/* Section 7 */}
            <section id="data-destruction" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <span>7. Complete Data Erasure & User Control</span>
              </h2>
              <p>
                You possess absolute sovereignty over any local data stored by MovieBox:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-white">Single-Click In-App Wipe:</strong> In the Settings page (<button onClick={() => onNavigate('settings')} className="text-[#00d2ff] hover:underline font-bold">Settings & Library</button>), clicking "Clear All Local Data" instantly purges all Continue Watching entries, playlists, favorites, and cached announcements from your browser.
                </li>
                <li>
                  <strong className="text-white">Native Browser Tools:</strong> You can purge all site data at any time via your browser's Developer Tools or Settings menu (Clear Browsing Data → Cookies and Site Data).
                </li>
                <li>
                  <strong className="text-white">Firebase Account Deletion:</strong> If you created an authenticated profile, you may request account erasure at any time, which purges your record from the Firebase Authentication registry.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="gdpr-ccpa" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <span>8. International Compliance: GDPR, CCPA & Global Rights</span>
              </h2>
              <p>
                Regardless of your country of origin or physical location, MovieBox respects universal data minimization standards:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-white">Right to Access:</strong> You can view all saved data directly in your browser's storage inspector.</li>
                <li><strong className="text-white">Right to Rectification:</strong> You can freely update your preferences, passwords, and profile moniker.</li>
                <li><strong className="text-white">Right to Erasure ("Right to Be Forgotten"):</strong> You have full power to delete your data autonomously at any second.</li>
                <li><strong className="text-white">Right to Opt-Out of Sale:</strong> We never sell user data, making the CCPA "Do Not Sell My Personal Information" opt-out permanently satisfied by default.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="children-privacy" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">9. Protection of Minors (COPPA Policy)</h2>
              <p>
                MovieBox is intended for general audiences and cinephiles. We do not knowingly solicit, collect, or store personal information from children under the age of 13 (or under 16 within the European Economic Area). If you believe a minor has submitted personal information, please notify us immediately, and we will purge the associated records from our Firebase registry.
              </p>
            </section>

            {/* Section 10 */}
            <section id="security-standards" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">10. Technical Security & Encryption Standards</h2>
              <p>
                All network transmissions between your browser and MovieBox are secured using modern Transport Layer Security (TLS 1.3 / HTTPS encryption). Authentication tokens are stored inside secure browser memory segments. We apply strict Content Security Policies (CSP) to mitigate cross-site scripting (XSS) risks.
              </p>
            </section>

            {/* Section 11 */}
            <section id="policy-updates" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">11. Amendments & Notification of Changes</h2>
              <p>
                We may revise this Privacy Policy periodically to reflect technological changes, emerging legal frameworks, or new site capabilities. The latest version will always be accessible at this URL with the corresponding revision timestamp.
              </p>
            </section>

            {/* Section 12 */}
            <section id="privacy-officer" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">12. Contacting the Privacy Officer</h2>
              <p>
                If you have inquiries, privacy audit questions, or wish to exercise data erasure rights, you may contact our privacy coordinators:
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Website Maintainer:</span>
                  <span className="text-white font-bold">Arshh (@arshhispro_)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Direct Channel:</span>
                  <a href="https://www.instagram.com/arshhispro_/" target="_blank" rel="noopener noreferrer" className="text-[#00d2ff] hover:underline font-mono">
                    instagram.com/arshhispro_
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Privacy Desk Email:</span>
                  <span className="text-slate-300 font-mono">privacy@moviebox-support.internal</span>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};
