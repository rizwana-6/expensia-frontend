export default function AuthArt() {
  return (
    <aside className="auth-art">
      <div className="auth-art-inner">
        <div className="auth-brand">
          expensia<span>.</span>
        </div>

        <svg
          className="auth-illustration"
          viewBox="0 0 560 440"
          role="img"
          aria-label="Illustration of a budget card with a donut chart, bar chart and coins"
        >
          <defs>
            <filter
              id="authSoftShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="150%"
            >
              <feDropShadow
                dx="0"
                dy="14"
                stdDeviation="16"
                floodColor="#5f6e88"
                floodOpacity="0.2"
              />
            </filter>
          </defs>

          <circle cx="290" cy="230" r="190" fill="#ffffff" opacity="0.55" />
          <circle cx="100" cy="120" r="70" fill="#e8a6be" opacity="0.35" />
          <circle cx="480" cy="350" r="90" fill="#c9b5dd" opacity="0.45" />
          <circle cx="470" cy="70" r="40" fill="#8cbea9" opacity="0.35" />

          <g filter="url(#authSoftShadow)">
            <rect x="110" y="110" width="340" height="230" rx="30" fill="#ffffff" />
          </g>
          <rect x="140" y="140" width="90" height="12" rx="6" fill="#d9dde6" />
          <rect x="140" y="162" width="140" height="22" rx="11" fill="#77849b" />
          <rect x="380" y="142" width="48" height="26" rx="13" fill="#f4e4ea" />

          <g transform="rotate(-90 205 266)" fill="none" strokeWidth="20">
            <circle cx="205" cy="266" r="48" stroke="#e8a6be" strokeDasharray="105.6 301.6" strokeDashoffset="0" />
            <circle cx="205" cy="266" r="48" stroke="#77849b" strokeDasharray="75.4 301.6" strokeDashoffset="-105.6" />
            <circle cx="205" cy="266" r="48" stroke="#8cbea9" strokeDasharray="66.3 301.6" strokeDashoffset="-181" />
            <circle cx="205" cy="266" r="48" stroke="#c9b5dd" strokeDasharray="54.3 301.6" strokeDashoffset="-247.3" />
          </g>

          <rect x="300" y="276" width="20" height="40" rx="10" fill="#a7b6cc" />
          <rect x="330" y="252" width="20" height="64" rx="10" fill="#a7b6cc" />
          <rect x="360" y="268" width="20" height="48" rx="10" fill="#a7b6cc" />
          <rect x="390" y="232" width="20" height="84" rx="10" fill="#a7b6cc" />
          <rect x="420" y="258" width="20" height="58" rx="10" fill="#e8a6be" />

          <g>
            <rect x="352" y="64" width="160" height="46" rx="23" fill="#e3f1ea" />
            <circle cx="376" cy="87" r="12" fill="#8cbea9" />
            <path
              d="M376 93 L376 81 M371 86 L376 81 L381 86"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <text x="396" y="93" fontSize="15" fontWeight="700" fill="#2f6b52">
              + ₹45,000
            </text>
          </g>

          <g>
            <rect x="56" y="326" width="150" height="46" rx="23" fill="#f9e3ec" />
            <circle cx="80" cy="349" r="12" fill="#e8a6be" />
            <path
              d="M80 343 L80 355 M75 350 L80 355 L85 350"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <text x="100" y="355" fontSize="15" fontWeight="700" fill="#8a3a58">
              − ₹1,250
            </text>
          </g>

          <g>
            <circle cx="476" cy="296" r="34" fill="#f2dcc0" stroke="#e6c79c" strokeWidth="3" />
            <circle cx="476" cy="296" r="24" fill="none" stroke="#e6c79c" strokeWidth="2" />
            <text x="476" y="305" fontSize="26" fontWeight="700" fill="#a8763b" textAnchor="middle">
              ₹
            </text>
          </g>
          <g>
            <circle cx="520" cy="346" r="22" fill="#f2dcc0" stroke="#e6c79c" strokeWidth="3" />
            <text x="520" y="354" fontSize="20" fontWeight="700" fill="#a8763b" textAnchor="middle">
              ₹
            </text>
          </g>
          <g>
            <circle cx="70" cy="200" r="24" fill="#f2dcc0" stroke="#e6c79c" strokeWidth="3" />
            <text x="70" y="208" fontSize="21" fontWeight="700" fill="#a8763b" textAnchor="middle">
              ₹
            </text>
          </g>

          <path d="M500 160 Q500 174 514 174 Q500 174 500 188 Q500 174 486 174 Q500 174 500 160Z" fill="#ffffff" />
          <path d="M40 90 Q40 100 50 100 Q40 100 40 110 Q40 100 30 100 Q40 100 40 90Z" fill="#ffffff" />
          <path d="M300 400 Q300 410 310 410 Q300 410 300 420 Q300 410 290 410 Q300 410 300 400Z" fill="#c9b5dd" />
        </svg>

        <div className="auth-tagline">
          <h2>Know where every rupee goes.</h2>
          <p>Track spending, set budgets and see your month at a glance.</p>
        </div>
      </div>
    </aside>
  );
}
