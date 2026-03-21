import Link from "next/link";

const socialLinks = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

const footerColumns = [
  {
    title: "Platform",
    links: [
      { label: "About", href: "/#how-it-works" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Contact", href: "mailto:support@golfcharity.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20 bg-[#020d04]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* Brand */}
          <div>
            <h3
              className="text-white font-semibold text-lg mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              ⛳ Golf Charity
            </h3>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              Play golf, support causes you believe in, and win prizes.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-white/40 hover:text-white hover:border-green-400 transition"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div> {/* ✅ THIS WAS MISSING */}

          {/* Columns */}
          <div className="grid grid-cols-2 gap-10">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="text-xs text-white/25 mb-3 uppercase tracking-widest font-semibold">
                  {col.title}
                </p>
                <div className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-xs text-white/45 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>
            © {new Date().getFullYear()} Golf Charity Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/50 transition-colors duration-200">
              Privacy
            </Link>
            <span className="text-white/10">·</span>
            <Link href="/terms" className="hover:text-white/50 transition-colors duration-200">
              Terms
            </Link>
            <span className="text-white/10">·</span>
            <Link href="/cookies" className="hover:text-white/50 transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}