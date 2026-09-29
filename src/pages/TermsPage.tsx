import React, { useEffect } from 'react';
import { Shield, FileText, AlertTriangle, Scale, Lock, EyeOff, Server, HelpCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (route: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sections = [
    { id: 'introduction', title: '1. Introduction & Acceptance of Terms' },
    { id: 'non-hosting', title: '2. Absolute Non-Hosting & Indexing Disclaimer' },
    { id: 'dmca', title: '3. DMCA & Safe Harbor Copyright Policy' },
    { id: 'third-party-embeds', title: '4. Third-Party Embeds & External Servers' },
    { id: 'zero-storage', title: '5. Zero Main Data Retention & Privacy Model' },
    { id: 'user-conduct', title: '6. User Eligibility & Lawful Conduct' },
    { id: 'ip-rights', title: '7. Intellectual Property & Fair Use Notices' },
    { id: 'disclaimer-warranties', title: '8. Comprehensive Disclaimer of Warranties' },
    { id: 'limitation-liability', title: '9. Strict Limitation of Liability' },
    { id: 'indemnification', title: '10. User Indemnification' },
    { id: 'modifications', title: '11. Right to Modify Platform & Terms' },
    { id: 'arbitration', title: '12. Mandatory Arbitration & Class Action Waiver' },
    { id: 'governing-law', title: '13. Governing Law & Jurisdiction' },
    { id: 'severability', title: '14. Severability & Entire Agreement' },
    { id: 'contact', title: '15. Contact & Legal Notice Information' },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Back and Breadcrumb */}
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

        {/* Page Hero */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-950 via-black to-[#050b14] shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d2ff]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Official Terms of Service</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Terms & Legal Framework
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Please read these terms carefully before accessing or using MovieBox. By accessing, browsing, or using this platform, you unequivocally acknowledge that MovieBox <strong className="text-white">does not host, stream, or store any multimedia content</strong> and operates strictly as a client-side indexing user agent.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Server className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Zero Media Hosting</div>
                  <div className="text-[11px] text-slate-400">100% external embeds</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-[#00d2ff] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Client-First Privacy</div>
                  <div className="text-[11px] text-slate-400">Main data stored nowhere</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">DMCA Compliant</div>
                  <div className="text-[11px] text-slate-400">Notice & Takedown ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout with Sidebar Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Sticky Quick Nav */}
          <div className="lg:col-span-1 glass-panel p-5 rounded-3xl border border-white/10 sticky top-6 hidden lg:block space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Table of Contents</h3>
            <nav className="space-y-1 text-xs">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block py-1.5 px-2 rounded-lg text-slate-400 hover:text-[#00d2ff] hover:bg-white/5 transition-colors truncate"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Detailed Legal Text */}
          <div className="lg:col-span-3 space-y-10 text-xs sm:text-sm text-slate-300 leading-relaxed">

            {/* Section 1 */}
            <section id="introduction" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00d2ff]" />
                <span>1. Introduction & Acceptance of Terms</span>
              </h2>
              <p>
                These Terms of Service ("Terms", "Agreement") constitute a legally binding agreement between you (referred to as "User", "You", or "Your") and the creators and maintainers of MovieBox (referred to as "MovieBox", "we", "us", or "our").
              </p>
              <p>
                By opening, visiting, indexing, connecting to, or otherwise utilizing any webpage, API endpoint, application bundle, or service belonging to MovieBox, you explicitly confirm that:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
                <li>You have read, understood, and consented to be bound by every clause, condition, and warranty disclaimer set forth in this document.</li>
                <li>You are at least 18 years of age or possess legal parental or guardian consent under applicable territorial law.</li>
                <li>You agree to comply with all domestic and international laws, regulations, and statutes regarding online conduct and intellectual property rights.</li>
              </ul>
              <p>
                If you do not unconditionally agree to these Terms in their entirety, you are strictly prohibited from using this website, and you must terminate your session and close all active windows immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section id="non-hosting" className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-rose-950/10 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Legal Architecture</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                2. Absolute Non-Hosting & Indexing Disclaimer
              </h2>
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 font-semibold space-y-2">
                <p>
                  MOVIEBOX DOES NOT HOST, STORE, UPLOAD, BROADCAST, TRANSCODE, OR MANAGE ANY VIDEO FILES, AUDIO TRACKS, MP4S, M3U8 PLAYLISTS, OR DIGITAL MEDIA CONTAINERS ON ANY SERVER, HARD DRIVE, OR CLOUD INFRASTRUCTURE UNDER OUR CONTROL.
                </p>
              </div>
              <p>
                MovieBox operates strictly and exclusively as a search interface, hypertext navigation tool, and metadata cataloging client. The technical operation of this platform is analogous to a specialized web browser:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-white">Metadata Provision:</strong> Synopsis, cast rosters, release dates, and promotional posters are gathered automatically through legitimate third-party publicly accessible APIs (such as The Movie Database — TMDB).
                </li>
                <li>
                  <strong className="text-white">Embedding Only:</strong> When a user requests video playback, MovieBox renders an inline browser frame (<code className="text-[#00d2ff]">&lt;iframe&gt;</code>) directed to autonomous, third-party media syndication providers (e.g., VidLink, VidSrc, AutoEmbed, 2Embed, SmashyStream). These third parties exist entirely outside our domain, control, network infrastructure, and legal governance.
                </li>
                <li>
                  <strong className="text-white">No Transmission or Caching:</strong> No multimedia bits or video data packets pass through MovieBox servers or databases. The video stream flows directly and point-to-point between the user's browser client and the third-party web host.
                </li>
              </ul>
              <p>
                Because no copyrighted files reside on our systems, MovieBox cannot remove files from the internet. If you are a copyright holder seeking removal of material, you must direct your notices to the actual host serving the stream.
              </p>
            </section>

            {/* Section 3 */}
            <section id="dmca" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>3. DMCA & Safe Harbor Copyright Policy</span>
              </h2>
              <p>
                MovieBox respects the intellectual property rights of creators and adheres to the provisions of Title II of the Digital Millennium Copyright Act (17 U.S.C. § 512, "DMCA") and international safe harbor frameworks.
              </p>
              <p>
                As an indexing service that does not host content, we will expeditiously remove or disable links, titles, or metadata records upon receiving a verified, legally sufficient notification of claimed infringement pursuant to 17 U.S.C. § 512(c)(3).
              </p>
              <div className="space-y-2 pl-2 border-l-2 border-[#00d2ff]/40">
                <p className="font-semibold text-white">A valid DMCA Notification must contain all of the following:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner.</li>
                  <li>Identification of the copyrighted work claimed to have been infringed.</li>
                  <li>Identification of the material claimed to be infringing, with information reasonably sufficient to permit us to locate the item on MovieBox (e.g., precise URL or TMDB identifier).</li>
                  <li>Sufficient contact information, including your full legal name, mailing address, telephone number, and email address.</li>
                  <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
                  <li>A statement, under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
                </ol>
              </div>
              <p>
                Notices may be submitted directly to our administrative team via email at <span className="text-[#00d2ff] font-mono">legal@moviebox-support.internal</span> or by opening an official request through our verified channels.
              </p>
            </section>

            {/* Section 4 */}
            <section id="third-party-embeds" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-400" />
                <span>4. Third-Party Embeds & External Servers</span>
              </h2>
              <p>
                MovieBox connects users with diverse external streaming embed endpoints. We do not inspect, endorse, guarantee, monitor, or assume liability for the practices, uptime, scripts, cookies, or content delivered by these independent operators.
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-white">Independent Third Parties:</strong> External player providers may independently trigger pop-up advertisements, trackers, or secondary redirects within their iframes. MovieBox incorporates robust sandbox defenses and click interceptors, but cannot override the inherent behavior of independent domains.
                </li>
                <li>
                  <strong className="text-white">Ad-Blocking Recommendation:</strong> We encourage all users to employ modern browser privacy protections (e.g., uBlock Origin, Brave Shields, or privacy-oriented DNS resolvers) to enhance their browsing experience.
                </li>
                <li>
                  <strong className="text-white">Assumption of Risk:</strong> Your interactions with third-party embed servers are solely between you and the respective third party.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="zero-storage" className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-cyan-950/10 space-y-4">
              <div className="flex items-center gap-2 text-[#00d2ff] font-bold uppercase tracking-wider text-xs">
                <EyeOff className="w-4 h-4" />
                <span>Core Privacy Architecture</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                5. Zero Main Data Retention & Privacy Model
              </h2>
              <p>
                A core foundational pillar of MovieBox is radical privacy and data minimization. We operate under a strict <strong className="text-white">Zero Main Data Retention</strong> doctrine:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Stored Locally on Your Device</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Your Continue Watching playback positions, favorite lists, and UI color schemes reside inside your device's browser memory (<code className="text-[#00d2ff]">localStorage</code>). They are not transmitted to or stored on remote tracking servers.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No Persistent Identity Logging</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    MovieBox servers do not maintain IP address query history, user activity profiles, or behavioral advertising dossiers. We do not sell, rent, or trade user records.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="user-conduct" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <span>6. User Eligibility & Lawful Conduct</span>
              </h2>
              <p>
                You agree to use MovieBox solely for personal, non-commercial entertainment purposes. You agree not to engage in any prohibited conduct, including without limitation:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Deploying automated crawlers, scrapers, bots, or unauthorized headless clients to overload platform servers.</li>
                <li>Attempting to bypass, disable, reverse-engineer, decompile, or otherwise tamper with security measures, admin password locks, or PIN features.</li>
                <li>Conducting denial of service (DoS/DDoS) attacks, port scanning, or malicious packet injection against MovieBox infrastructure.</li>
                <li>Commercializing, re-selling, or redistributing access to MovieBox services or interfaces for monetary profit.</li>
                <li>Using MovieBox in jurisdictions where indexing or accessing media via third-party web scrapers is explicitly prohibited by law.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="ip-rights" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-400" />
                <span>7. Intellectual Property & Fair Use Notices</span>
              </h2>
              <p>
                The visual layout, user interface components, software codebase, CSS styling, and distinctive branding of MovieBox are protected under international copyright, trademark, and trade dress regulations.
              </p>
              <p>
                All movie titles, character trademarks, poster artworks, backdrops, studio logos, and promotional blurbs displayed on MovieBox are the sole property of their respective copyright holders (including Marvel Studios, Warner Bros., Disney, Universal Pictures, Sony Pictures, Netflix, and other production companies).
              </p>
              <p className="text-slate-400 text-xs italic">
                MovieBox is an unofficial fan and cinephile project. It is not endorsed by, sponsored by, affiliated with, or partnered with The Motion Picture Association (MPA), TMDB, or any motion picture distributor.
              </p>
            </section>

            {/* Section 8 */}
            <section id="disclaimer-warranties" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>8. Comprehensive Disclaimer of Warranties</span>
              </h2>
              <p className="uppercase text-slate-300 font-semibold text-xs tracking-wide">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE.
              </p>
              <p>
                TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW, MOVIEBOX AND ITS CREATORS DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</li>
                <li>WARRANTIES THAT THE SERVICE WILL FUNCTION UNINTERRUPTED, BUG-FREE, SECURE, OR ERROR-FREE.</li>
                <li>WARRANTIES REGARDING THE SPEED, RESOLUTION, AUDIO FIDELITY, OR CONTINUITY OF THIRD-PARTY EMBEDDED STREAMS.</li>
                <li>WARRANTIES THAT THE METADATA, REVIEWS, OR TRIVIA SCORES ARE ACCURATE, COMPLETE, OR UP TO DATE.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="limitation-liability" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-400" />
                <span>9. Strict Limitation of Liability</span>
              </h2>
              <p>
                UNDER NO CIRCUMSTANCES, INCLUDING NEGLIGENCE, SHALL MOVIEBOX, ITS DEVELOPERS, AFFILIATES, OR VOLUNTEER OPERATORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES ARISING OUT OF:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>THE USE OF, OR INABILITY TO USE, THE PLATFORM OR ANY THIRD-PARTY EMBEDDED STREAM.</li>
                <li>ANY LOSS OF DATA, DEVICE MALFUNCTION, MALWARE FROM THIRD-PARTY AD NETWORKS, OR HARDWARE CRASH.</li>
                <li>ANY RELIANCE ON INFORMATION, USER REVIEWS, ANNOUNCEMENTS, OR METADATA PROVIDED ON THE SERVICE.</li>
              </ul>
              <p>
                IN NO EVENT SHALL OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS OR DAMAGES EXCEED THE TOTAL AMOUNT PAID BY YOU TO MOVIEBOX IN THE PRECEDING TWELVE MONTHS (WHICH, AS A FREE SERVICE, SHALL BE ZERO DOLLARS / $0.00).
              </p>
            </section>

            {/* Section 10 */}
            <section id="indemnification" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">10. User Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless MovieBox, its maintainers, contractors, and contributors from and against any claims, liabilities, losses, damages, expenses, and costs (including reasonable legal and attorney fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Your violation or breach of any provision of these Terms of Service.</li>
                <li>Your infringement of any third-party intellectual property, privacy, or proprietary right.</li>
                <li>Your misuse of MovieBox in violation of local, state, federal, or international laws.</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section id="modifications" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">11. Right to Modify Platform & Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify, update, suspend, or terminate any aspect of the platform or these Terms at any time without notice. Updates take effect immediately upon being posted to this URL. Continued use of the platform following the publication of revised terms constitutes your complete acceptance of the amendments.
              </p>
            </section>

            {/* Section 12 */}
            <section id="arbitration" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">12. Mandatory Arbitration & Class Action Waiver</h2>
              <p>
                Any dispute, claim, or controversy arising out of or relating to these Terms or the service shall be resolved by confidential, binding individual arbitration rather than in court.
              </p>
              <p className="font-bold text-white">
                YOU AND MOVIEBOX AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
              </p>
            </section>

            {/* Section 13 */}
            <section id="governing-law" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">13. Governing Law & Jurisdiction</h2>
              <p>
                These Terms shall be interpreted and governed in accordance with general principles of contract law and applicable federal safe harbor statutory frameworks, without regard to conflict of law principles.
              </p>
            </section>

            {/* Section 14 */}
            <section id="severability" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">14. Severability & Entire Agreement</h2>
              <p>
                If any provision of these Terms is determined by a competent tribunal to be unlawful, void, or unenforceable, that specific provision shall be severed without affecting the validity and enforceability of all remaining provisions. These Terms constitute the entire agreement between you and MovieBox regarding use of the platform.
              </p>
            </section>

            {/* Section 15 */}
            <section id="contact" className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#00d2ff]" />
                <span>15. Contact & Legal Notice Information</span>
              </h2>
              <p>
                If you have questions, inquiries, or official notices regarding these Terms of Service or our DMCA compliance guidelines, you may reach our administrative maintainers through:
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Website Creator:</span>
                  <span className="text-white font-bold">Arshh (@arshhispro_)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Official Channel:</span>
                  <a href="https://www.instagram.com/arshhispro_/" target="_blank" rel="noopener noreferrer" className="text-[#00d2ff] hover:underline font-mono">
                    instagram.com/arshhispro_
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Electronic Notice Desk:</span>
                  <span className="text-slate-300 font-mono">legal@moviebox-support.internal</span>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};
