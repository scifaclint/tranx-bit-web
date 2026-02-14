"use client";

import { useState, useEffect } from "react";
import LandingHeader from "@/components/landing-page/landing-header";
import { motion } from "framer-motion";
import {
    ChevronRight,
    Mail,
    Phone,
    ExternalLink,
    ShieldCheck,
    Scale,
    Clock,
    UserCheck,
    Lock,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "products", title: "2. Our Products And Offerings" },
    { id: "eligibility", title: "3. Eligibility" },
    { id: "verification", title: "4. Identity Verification" },
    { id: "security", title: "5. Security of Account" },
    { id: "cancellation", title: "6. Transaction Cancellation and Refund" },
    { id: "modification", title: "7. Transaction Modification" },
    { id: "prohibited", title: "8. Prohibited Activities" },
    { id: "proprietary", title: "9. Proprietary Rights" },
    { id: "privacy", title: "10. Privacy Policy" },
    { id: "monitoring", title: "11. Account Monitoring" },
    { id: "grievance", title: "12. Grievance Policy" },
    { id: "disclaimers", title: "13. Disclaimers and Liability" },
    { id: "aml", title: "14. Anti-Money Laundering" },
    { id: "governing", title: "15. Governing Law" },
    { id: "contact", title: "16. Contact Details" },
    { id: "cookies", title: "17. Cookies" },
    { id: "hyperlinking", title: "18. Hyperlinking" },
    { id: "waiver", title: "19. Waiver" },
    { id: "force-majeure", title: "20. Force Majeure" },
];

export default function TermsOfServicePage() {
    const [activeSection, setActiveSection] = useState("acceptance");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5, rootMargin: "-100px 0px -40% 0px" }
        );

        SECTIONS.forEach((section) => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 100,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
            <LandingHeader />

            <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-24">
                {/* Hero Header */}
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-zinc-500 text-sm mb-4"
                    >
                        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span>Terms of Service</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter"
                    >
                        TERMS OF <span className="text-zinc-400">SERVICE</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="h-1.5 w-24 bg-black dark:bg-white mt-8"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-zinc-500 max-w-xl text-lg"
                    >
                        Last Updated: February 2, 2026. These terms govern your use of the TranxBit platform and its services.
                    </motion.p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-80 shrink-0">
                        <div className="sticky top-24 space-y-1 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-4">Table of Contents</p>
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-3",
                                        activeSection === section.id
                                            ? "bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg"
                                            : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    <span className={cn(
                                        "w-1 h-4 rounded-full transition-all",
                                        activeSection === section.id ? "bg-zinc-400" : "bg-transparent"
                                    )} />
                                    {section.title}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content Body */}
                    <div className="flex-1 space-y-20 max-w-3xl">
                        {/* Section 1 */}
                        <section id="acceptance" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Acceptance of Terms</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    By registering and opening an account with <strong>TRANXBIT</strong>, you have unconditionally agreed to and accepted our terms of use. If you do not agree with any of these terms, please desist from using the TRANXBIT website and its services.
                                </p>
                                <p>
                                    Please note that these terms may be revised and reissued at any time. Your continued use of the tranxbit Platform will be deemed as an irrevocable acceptance of any revisions. Notwithstanding the above, we will strive to notify you of changes to these terms which significantly affect your rights and obligations.
                                </p>
                                <p className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-l-4 border-black dark:border-white rounded-r-xl italic text-sm">
                                    Such notices shall be sent to the email address you provided as part of your account registration and it is your responsibility to keep your contact information up-to-date.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section id="products" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Our Products And Offerings</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    Tranxbit as a platform bridges the gap between individuals who need liquid cash and businesses who need discounted gift cards as a payment alternative. We provide services using our website (tranxbit.com).
                                </p>
                                <p>
                                    Our services enable individuals to exchange gift cards and vouchers for cash equivalent (herein referred to as ‘customers’ or ‘clients’ or ‘users’), and also enable businesses to get discounted gift cards as payment alternatives (herein referred to as ‘partners’).
                                </p>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section id="eligibility" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Eligibility</h2>
                            </div>
                            <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>To be eligible for the use of TRANXBIT PLATFORM, you must:</p>
                                <ul className="space-y-3">
                                    {[
                                        "Complete the registration process.",
                                        "Not be less than 18 years of age.",
                                        "Possess the authority to accept the terms of use.",
                                        "Not have been previously suspended or banned.",
                                        "Pass all KYC and compliance requirements.",
                                        "Not violate any law and regulation applicable to you (AML, Anti-Corruption)."
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="mt-1.5 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                                                <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">{i + 1}</span>
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section id="verification" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Identity Verification</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    You hereby authorize TRANXBIT to, directly or through the use of a third party or parties, make any inquiries we consider necessary to verify your identity and/or your transaction and/or protect against fraud.
                                </p>
                                <p>
                                    This includes querying identity information contained in public reports (e.g., your name, address, past addresses, or date of birth), querying account information associated with your linked bank account, and taking action we reasonably deem necessary based on the results.
                                </p>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section id="security" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Security of Account</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    Tranxbit remains committed to the security of the platform, user data, and user assets. However, it is important that users treat login credentials as <strong>confidential information</strong> and avoid disclosure to any other party.
                                </p>
                                <div className="p-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl shadow-2xl relative overflow-hidden group">
                                    <AlertCircle className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
                                    <p className="font-bold mb-2">CRITICAL REMINDER:</p>
                                    <p className="text-sm opacity-90">
                                        Tranxbit will NEVER ask for your login credentials via email, SMS, social media, instant messenger, or any other channel. You are totally responsible for the security of your account.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section id="cancellation" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Transaction Cancellation and Refund</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    Transactions on Tranxbit may be canceled within a certain time window if requested by a user. This time window is totally dictated by Tranxbit and generally depends on the transaction status.
                                </p>
                                <p>
                                    Tranxbit may also cancel a suspicious transaction, or if we believe it's beyond our risk appetite, or if you are unable to provide all required information (like a purchase receipt) to verify the authenticity of your transaction.
                                </p>
                            </div>
                        </section>

                        {/* Section 7 */}
                        <section id="modification" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Transaction Modification</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    Tranxbit may modify a transaction if submitted with wrong details (perceived or otherwise). By using TRANXBIT you agree that we may modify your transaction in its best interest, or in your best interest.
                                </p>
                            </div>
                        </section>

                        {/* Section 8 */}
                        <section id="prohibited" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Prohibited Activities</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
                                {[
                                    "Breach terms of use or privacy policies.",
                                    "Attempt to trade assets not legally obtained.",
                                    "Engage in fraudulent activities.",
                                    "Breach any laws and regulations.",
                                    "Act in a defamatory or harassing manner.",
                                    "Provide false personal information.",
                                    "Carry out automated infrastructure straining activities."
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 9 */}
                        <section id="proprietary" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <ExternalLink className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Proprietary Rights</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    Tranxbit is the exclusive owner of all intellectual property rights, including the Platform, services, logos, trade names, brand names, designs, and software used in connection with the Tranxbit Platform.
                                </p>
                                <p>
                                    Unauthorized use of any proprietary marks featured on the Platform may violate intellectual property laws. These Terms do not transfer any ownership rights from Tranxbit to you.
                                </p>
                            </div>
                        </section>

                        {/* Section 10 */}
                        <section id="privacy" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Privacy Policy</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    By using the Tranxbit Platform, you acknowledge and agree to be bound by our <Link href="/privacy-policy" className="text-black dark:text-white underline font-bold">Privacy Policy</Link>.
                                </p>
                                <p>
                                    Our Privacy Policy outlines the collection, use, and disclosure of personal information and other data. We may update or revise the Privacy Policy from time to time, and changes are effective immediately upon posting.
                                </p>
                            </div>
                        </section>

                        {/* Section 11 */}
                        <section id="monitoring" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Account Monitoring, Suspension, or Termination</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    TRANXBIT shall immediately close, suspend or limit your account if we believe you have acted in violation of these Terms or applicable laws.
                                </p>
                                <p className="text-base">Reasons for suspension include but are not limited to:</p>
                                <ul className="space-y-2 text-sm bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                    <li>• Violation of intellectual property or privacy rights of any third party.</li>
                                    <li>• Using services for fraudulent purposes.</li>
                                    <li>• Supplying false, misleading, or deceptive information.</li>
                                    <li>• Failure to respond to inquiries within a reasonable period.</li>
                                    <li>• Legal or regulatory requirements.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 12 */}
                        <section id="grievance" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Grievance Policy</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>
                                    TRANXBIT believes in providing excellent service and strives to be sincere and transparent. We have developed a procedure for prompt attention to grievances.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                        <ExternalLink className="w-5 h-5 text-zinc-400" />
                                        <span className="text-sm">Live Chat on Domain</span>
                                    </div>
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-zinc-400" />
                                        <span className="text-sm">support@tranxbit.com</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 13 */}
                        <section id="disclaimers" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Disclaimers and Liability Limitation</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <ul className="space-y-4">
                                    <li className="flex gap-4">
                                        <AlertCircle className="w-6 h-6 text-zinc-400 mt-1 shrink-0" />
                                        <span>TRANXBIT is not liable for delays or failures caused by events outside our control (e.g., internet outages, natural disasters).</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <AlertCircle className="w-6 h-6 text-zinc-400 mt-1 shrink-0" />
                                        <span>Tranxbit disclaims liability for indirect, incidental, or consequential damages to the fullest extent permitted by law.</span>
                                    </li>
                                    <li className="flex gap-4 font-bold border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                        <ExternalLink className="w-6 h-6 text-black dark:text-white mt-1 shrink-0" />
                                        <span>All transactions are done either on our official website (Tranxbit.com), or on our mobile app downloadable on Apple Store or Google Play Store. We DO NOT offer services through social media.</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 14 */}
                        <section id="aml" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Anti-Money Laundering Policy</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>TranXbit complies with international and local regulations including:</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    {[
                                        "Ghana Anti-Money Laundering Act, 2020 (Act 1044)",
                                        "Cooperation with Ghana Financial Intelligence Centre (FIC)",
                                        "Money Laundering (Prohibition) Act, 2011 (Nigeria)",
                                        "Terrorism (Prevention) Act, 2011 (Nigeria)",
                                        "Central Bank of Nigeria AML/CFT Regulations, 2013"
                                    ].map((item, i) => (
                                        <li key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 font-medium">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Section 15 */}
                        <section id="governing" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Governing Law</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                        <p className="font-bold text-black dark:text-white mb-2 underline">GHANA</p>
                                        <p className="text-sm">Governed by the laws of the Republic of Ghana.</p>
                                    </div>
                                    <div className="flex-1 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                        <p className="font-bold text-black dark:text-white mb-2 underline">NIGERIA</p>
                                        <p className="text-sm">Governed by the laws of the Federal Republic of Nigeria.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 16 */}
                        <section id="contact" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Contact Details</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>If you have any questions or concerns, please contact us:</p>
                                <a href="mailto:support@tranxbit.com" className="inline-flex items-center gap-2 text-black dark:text-white font-black text-2xl hover:gap-4 transition-all">
                                    support@tranxbit.com
                                    <ChevronRight className="w-6 h-6" />
                                </a>
                            </div>
                        </section>

                        {/* Sections 17-20 (Simpler layout for brief sections) */}
                        <div className="space-y-16 pt-12 border-t border-zinc-100 dark:border-zinc-800">
                            {[
                                { id: "cookies", title: "17. Cookies", content: "Our Platform uses cookies to enhance user experience and analytics. By using our Platform, you consent to the use of cookies in accordance with our Privacy Policy." },
                                { id: "hyperlinking", title: "18. Hyperlinking to Our Content", content: "You may hyperlink to our website provided that the link reflects accuracy and does not portray us in a false manner. We reserve the right to request removal of any link." },
                                { id: "waiver", title: "19. Waiver", content: "Our failure to enforce any provision of these Terms shall not constitute a waiver of our rights to enforce such provision in the future." },
                                { id: "force-majeure", title: "20. Force Majeure", content: "The Company shall not be held liable for any failure resulting from causes beyond its reasonable control, including natural disasters, war, strikes, or system outages." }
                            ].map((section) => (
                                <section key={section.id} id={section.id} className="scroll-mt-24">
                                    <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                                    <p className="text-zinc-500 text-sm leading-relaxed">{section.content}</p>
                                </section>
                            ))}
                        </div>

                        {/* Approval Footer */}
                        <div className="pt-24 pb-12 text-center">
                            <div className="inline-block px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black tracking-widest text-xs uppercase shadow-2xl">
                                Approved By Management
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Basic Footer for Documentation */}
            <footer className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 py-12">
                <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">© 2026 TranxBit Platform. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy-policy" className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-bold">Privacy Policy</Link>
                        <Link href="/" className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-bold">Back to Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
