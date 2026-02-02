"use client";

import { useState, useEffect } from "react";
import LandingHeader from "@/components/landing-page/landing-header";
import { motion } from "framer-motion";
import {
    ChevronRight,
    Mail,
    ShieldCheck,
    Lock,
    Eye,
    Database,
    UserPlus,
    Bell,
    FileText,
    Users,
    AlertTriangle,
    Scale
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "introduction", title: "1. Introduction" },
    { id: "information-collect", title: "2. What Information Do We Collect?" },
    { id: "consent", title: "3. Your Consent" },
    { id: "usage", title: "4. How Do We Use Your Information?" },
    { id: "cookies", title: "5. Website Cookies" },
    { id: "log-files", title: "6. Log Files" },
    { id: "sharing", title: "7. Sharing Your Personal Data" },
    { id: "protection", title: "8. How Do We Protect Your Data?" },
    { id: "dpa", title: "9. Data Protection Acts (DPA)" },
    { id: "children", title: "10. Children's Information" },
    { id: "changes", title: "11. Changes To Privacy Policy" },
    { id: "contact", title: "12. Contact Us" },
];

export default function PrivacyPolicyPage() {
    const [activeSection, setActiveSection] = useState("introduction");

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
                <div className="mb-16 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center lg:justify-start gap-2 text-zinc-500 text-sm mb-4"
                    >
                        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span>Privacy Policy</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter"
                    >
                        PRIVACY <span className="text-zinc-400">POLICY</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="h-1.5 w-24 bg-black dark:bg-white mt-8 mx-auto lg:mx-0"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-zinc-500 max-w-xl text-lg mx-auto lg:mx-0"
                    >
                        At Tranxbit, we prioritise the privacy of our visitors and are fully dedicated to complying with all applicable data protection laws.
                    </motion.p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-80 shrink-0">
                        <div className="sticky top-24 space-y-1 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-4">Policy Contents</p>
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
                        {/* Introduction */}
                        <section id="introduction" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Introduction</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify">
                                <p>
                                    At Tranxbit, we prioritise the privacy of our visitors and are fully dedicated to complying with all applicable data protection laws, regulations, rules, and principles. We take every measure to ensure that all personal information we receive is handled with absolute confidentiality and security.
                                </p>
                                <p>
                                    Our Privacy Policy sets out the minimum standards that must be strictly followed in relation to the collection, storage, use, and disclosure of personal information. We reaffirm our commitment to handling all personal information we receive or process with the utmost confidentiality and security.
                                </p>
                                <p className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl text-sm italic">
                                    Please note that this Privacy Policy applies only to our online activities and is applicable to visitors to our website who share and/or collect information on Tranxbit. It does not apply to any information collected offline or through channels other than this website.
                                </p>
                            </div>
                        </section>

                        {/* Information Collection */}
                        <section id="information-collect" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">What Information Do We Collect?</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify">
                                <p>
                                    We will clearly indicate the personal information that we require from you and the purpose for which it is required when we ask you to provide it.
                                </p>
                                <p>
                                    If you choose to contact us directly, we may obtain additional information about you, including your name, email address, phone number, the contents of your message, any attachments you may send us, and any other information you may provide.
                                </p>
                                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                    <p className="font-bold mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Account Registration Data:
                                    </p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium">
                                        <li className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-black rounded-lg border border-zinc-100 dark:border-zinc-800">
                                            <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" /> Full Name & Address
                                        </li>
                                        <li className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-black rounded-lg border border-zinc-100 dark:border-zinc-800">
                                            <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" /> KYC Details
                                        </li>
                                        <li className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-black rounded-lg border border-zinc-100 dark:border-zinc-800">
                                            <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" /> Bank Account Details
                                        </li>
                                        <li className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-black rounded-lg border border-zinc-100 dark:border-zinc-800">
                                            <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" /> Email & Telephone
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Consent */}
                        <section id="consent" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Your Consent</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify text-justify">
                                <p>
                                    Your consent is essential to begin the data processing process. By accessing our platforms or using our services, you are hereby consenting to our Privacy Policy and agreeing to its terms.
                                </p>
                                <div className="p-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 opacity-50 shrink-0" />
                                    To fully understand the principle of consent, please refer to Articles 18(2) and 843 of the Ghana Data Protection Act.
                                </div>
                                <p className="text-base">
                                    We reserve the right to modify this Privacy Policy at any time. The revised version will become effective <strong>7 days after publication</strong> on our website or office facilities.
                                </p>
                            </div>
                        </section>

                        {/* How We Use Information */}
                        <section id="usage" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Database className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">How Do We Use Your Information?</h2>
                            </div>
                            <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>The information we collect is used for a variety of purposes, including:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        "Providing & maintaining our website.",
                                        "Improving & expanding our services.",
                                        "Analyzing how you use the website.",
                                        "Developing new products & features.",
                                        "Direct communication & marketing.",
                                        "Email communications & updates.",
                                        "Fraud prevention & security."
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 items-start p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <div className="w-2 h-2 rounded-full bg-black dark:bg-white mt-1.5 shrink-0" />
                                            <span className="text-sm font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Cookies */}
                        <section id="cookies" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Eye className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Website Cookies</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify">
                                <p>
                                    To enhance user experience, we utilize cookies. These small files help us understand user interaction, remember preferences, and optimize settings.
                                </p>
                                <p className="font-bold text-black dark:text-white">
                                    We do not use cookies to collect personal information without consent, nor do we share cookie data with third parties for advertising.
                                </p>
                                <p className="text-sm opacity-80 italic">
                                    You may decline cookies via browser settings, though some features may then fail to function correctly.
                                </p>
                            </div>
                        </section>

                        {/* Log Files */}
                        <section id="log-files" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Log Files</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify text-justify">
                                <p>
                                    We follow a standard practice of using log files to analyze trends and manage the website. Data includes IP addresses, browser types, ISP, time stamps, and click counts.
                                </p>
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center font-bold text-zinc-900 dark:text-zinc-100">
                                    NONE OF THE LOG FILE INFORMATION IS PERSONALLY IDENTIFIABLE.
                                </div>
                            </div>
                        </section>

                        {/* Sharing Data */}
                        <section id="sharing" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Sharing Your Personal Data</h2>
                            </div>
                            <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p>We may share your Personal Data with others for the following reasons:</p>
                                <ul className="space-y-6">
                                    <li className="space-y-2">
                                        <p className="font-bold text-black dark:text-white">With Service Providers:</p>
                                        <p className="text-sm">Third parties that perform functions at our direction, such as identity verification, transaction processing, or customer support.</p>
                                    </li>
                                    <li className="space-y-2">
                                        <p className="font-bold text-black dark:text-white">With Financial Institutions:</p>
                                        <p className="text-sm">Partners we work with to offer Tranxbit-related services or process transactions.</p>
                                    </li>
                                    <li className="space-y-2">
                                        <p className="font-bold text-black dark:text-white">With Other Transaction Parties:</p>
                                        <p className="text-sm">Includes users you are sending/receiving funds from and their service providers to resolve disputes or prevent fraud.</p>
                                    </li>
                                    <li className="space-y-2">
                                        <p className="font-bold text-black dark:text-white">As Required by Law:</p>
                                        <p className="text-sm">To comply with court proceedings, law enforcement requests, or to prevent physical harm and financial loss.</p>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Protection */}
                        <section id="protection" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">How Do We Protect Your Data?</h2>
                            </div>
                            <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                                        <h4 className="font-black text-xs uppercase tracking-tighter mb-4 text-zinc-400">Security Measures</h4>
                                        <p className="text-sm">Firewalls, data encryption, and strict information access authorization controls.</p>
                                    </div>
                                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                                        <h4 className="font-black text-xs uppercase tracking-tighter mb-4 text-zinc-400">Confidentiality</h4>
                                        <p className="text-sm">Your data is confidential and will not be divulged except under legal or regulatory conditions.</p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium italic">
                                    We periodically train authorised staff on contemporary measures for data security. In case of a violation, our Data Protection Officer will address the issue within <strong>30 days</strong>.
                                </p>
                            </div>
                        </section>

                        {/* DPA */}
                        <section id="dpa" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Data Protection Acts (DPA)</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                                <p className="text-base font-bold text-black dark:text-white">Under the DPA, your legal entitlements include:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    {[
                                        "The right to be informed.",
                                        "The right to complain or request.",
                                        "The right to access information without charge.",
                                        "The right to know controller specifics.",
                                        "The right to object or withdraw consent.",
                                        "The right to data portability.",
                                        "The right to remediation for breach.",
                                        "The right to limit data processing.",
                                        "The right to request deletion."
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 py-1 border-b border-zinc-100 dark:border-zinc-800/50">
                                            <ChevronRight className="w-3 h-3 text-zinc-400" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Children */}
                        <section id="children" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Children's Information</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify">
                                <p>
                                    Tranxbit does not knowingly collect any Personal Information from children under the age of <strong>18</strong>. If you suspect that your child has provided this information, please contact us immediately for prompt deletion.
                                </p>
                            </div>
                        </section>

                        {/* Changes */}
                        <section id="changes" className="scroll-mt-24 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Changes To Privacy Policy</h2>
                            </div>
                            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify">
                                <p>
                                    We retain the right to modify this policy at any time. Changes will be communicated via website notice or email. Continued use implies acceptance of updated terms.
                                </p>
                            </div>
                        </section>

                        {/* Contact */}
                        <section id="contact" className="scroll-mt-24 group pb-12">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Contact Us For Enquiries</h2>
                            </div>
                            <div className="p-8 bg-black dark:bg-white text-white dark:text-black rounded-3xl shadow-2xl">
                                <p className="text-xl font-bold mb-6">Have concerns regarding your data?</p>
                                <div className="flex flex-col sm:flex-row gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Official Email</p>
                                        <a href="mailto:tranxbit94@gmail.com" className="text-xl font-black hover:underline">tranxbit94@gmail.com</a>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 py-12 mt-12">
                <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">© 2026 TranxBit Platform. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/terms-of-service" className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-bold">Terms of Service</Link>
                        <Link href="/" className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-bold">Back to Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
