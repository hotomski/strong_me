import Image from "next/image";
import Link from "next/link";
import { MdEmail } from "react-icons/md";

export default function Corporate() {
  return (
    <div className="site-shell corp-shell">
      {/* NAV */}
      <nav className="corp-nav">
        <Link href="/" className="corp-nav-logo">StrongME</Link>
        <Link href="/" className="corp-nav-link">← Back to StrongME Classes</Link>
      </nav>

      <main className="page">

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-copy">
            <p className="hero-eyebrow corp-eyebrow">Workplace Wellness Program</p>

            <h1 className="hero-title">
              Strong teams.
              <br />
              Clear minds.
              <br />
              Better work.
            </h1>

            <p className="hero-description">
              <span className="hero-description-strong">
                A focused 20-minute movement and mindfulness session —
                designed for your team, delivered at your workplace.
              </span>{" "}
              Reset energy, release tension, and return to work sharper,
              calmer, and more present. No gym. No equipment. Just results.
            </p>

            <div className="hero-actions">
              <a href="mailto:info@strongme.pro" className="btn corp-btn-primary">
                Request a session
              </a>
              <a href="#about" className="btn corp-btn-secondary">
                Learn more
              </a>
            </div>
          </div>

          <div className="hero-media">
            <div className="corp-hero-card">
              <div className="corp-stat">
                <span className="corp-stat-number">20</span>
                <span className="corp-stat-label">minutes</span>
              </div>
              <div className="corp-stat-divider" />
              <div className="corp-stat">
                <span className="corp-stat-number">3</span>
                <span className="corp-stat-label">elements</span>
              </div>
              <div className="corp-stat-divider" />
              <div className="corp-stat">
                <span className="corp-stat-number">∞</span>
                <span className="corp-stat-label">impact</span>
              </div>
              <p className="corp-hero-card-text">
                Movement · Strength · Mindfulness
              </p>
            </div>
          </div>
        </section>

        {/* THREE PILLARS */}
        <section className="corp-pillars section-divider">
          <div className="corp-pillar">
            <span className="corp-pillar-emoji">🕺</span>
            <span className="corp-pillar-time">10 min</span>
            <h3 className="corp-pillar-title">Joyful Movement</h3>
            <p className="corp-pillar-text">Shake off tension. Wake up the body. Lift the mood.</p>
          </div>
          <div className="corp-pillar">
            <span className="corp-pillar-emoji">💪</span>
            <span className="corp-pillar-time">5 min</span>
            <h3 className="corp-pillar-title">Functional Strength</h3>
            <p className="corp-pillar-text">Build stability and power. No equipment needed.</p>
          </div>
          <div className="corp-pillar">
            <span className="corp-pillar-emoji">🧘</span>
            <span className="corp-pillar-time">5 min</span>
            <h3 className="corp-pillar-title">Guided Meditation</h3>
            <p className="corp-pillar-text">Calm and clear mind. Return to work focused and ready to perform.</p>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="content-section section-divider">
          <div className="section-label">
            <h2>The midday slump is real</h2>
          </div>

          <div className="section-content">
            <p className="lead-paragraph">
              Back-to-back meetings. Hours of sitting. Mental overload.
              Your team deserves a reset.
            </p>

            <p>
              Most wellness programs are too long, too disruptive, or feel like another obligation.
              StrongME Corporate fits into a lunch break and delivers results you can see and feel.
            </p>

            <p className="quote-block">
              Twenty minutes is enough to change everything.
              <br />
              If you know how to use them.
            </p>
          </div>
        </section>

        {/* FORMAT */}
        <section className="content-section">
          <div className="section-label">
            <h2>Session format</h2>
          </div>

          <div className="section-content section-content-tight">
            <FormatRow
              time="10 min"
              title="Joyful movement"
              text="Energizing rhythmic movement to shake off tension, wake up the body, and lift mood. No dance experience needed — just willingness to move."
            />
            <FormatRow
              time="5 min"
              title="Functional strength"
              text="Targeted bodyweight exercises that build stability and power. Office-friendly, no equipment, suitable for all fitness levels."
            />
            <FormatRow
              time="5 min"
              title="Guided meditation & relaxation"
              text="A structured closing practice of breath, body scan, and conscious awareness — leaving participants calm, clear, and ready to perform."
            />
          </div>
        </section>

        {/* BENEFITS */}
        <section className="content-section">
          <div className="section-label">
            <h2>What your team gains</h2>
          </div>

          <div className="section-content section-content-tight">
            <FormatRow
              time="Energy"
              title="Renewed afternoon focus"
              text="Movement reactivates circulation and oxygen flow to the brain — the most effective natural antidote to the post-lunch energy crash."
            />
            <FormatRow
              time="Stress"
              title="Reduced tension & cortisol"
              text="The guided meditation segment actively lowers cortisol levels, helping the nervous system shift from reactive to calm and regulated."
            />
            <FormatRow
              time="Mood"
              title="Lifted team spirit"
              text="Shared movement creates connection. Teams that move together build trust, lighten the atmosphere, and collaborate more openly."
            />
            <FormatRow
              time="Body"
              title="Countered sedentary damage"
              text="Functional strength and mobility work directly offset the physical effects of prolonged sitting — protecting long-term health."
            />
          </div>
        </section>

        {/* FOR THE COMPANY */}
        <section className="content-section">
          <div className="section-label">
            <h2>Why companies invest</h2>
          </div>

          <div className="section-content">
            <p className="lead-paragraph">
              Employee wellbeing is not a perk anymore — it is a performance strategy.
            </p>
            <p>
              Companies that invest in structured movement and mindfulness
              practices report lower absenteeism, higher retention, and stronger
              team cohesion. StrongME Corporate makes that investment simple,
              accessible, and immediately visible.
            </p>
            <p>
              A session over lunch. No venue change. No logistics overhead.
              Just a dedicated facilitator, a cleared space, and a team that shows up and leaves better.
            </p>
            <p className="quote-block">
              Your people are your greatest asset.
              <br />
              Treat them like it.
            </p>
          </div>
        </section>

        {/* ABOUT INSTRUCTOR */}
        <section className="content-section">
          <div className="section-label">
            <h2>About the instructor</h2>
          </div>

          <div className="section-content">
            <div className="instructor-profile">
              <div className="instructor-photo-wrap">
                <Image
                  src="/images/profile.jpg"
                  alt="Sofija Hotomski — StrongME instructor"
                  fill
                  className="instructor-photo"
                  sizes="(min-width: 1024px) 220px, 160px"
                />
              </div>
              <div className="instructor-bio">
                <p className="lead-paragraph">
                  StrongME was created by Sofija Hotomski — movement facilitator,
                  mindfulness practitioner, and former tech professional based in Zurich.
                </p>
                <p>
                  Sofija holds a PhD in Computer Science and spent years as a Product Manager
                  in the tech industry. She knows what high-pressure days feel like from the inside —
                  the back-to-back meetings, the mental overload, the body slowly shutting down
                  from too much sitting and too little recovery.
                </p>
                <p>
                  She designed StrongME Corporate from the inside out. She knows what your days
                  feel like, and she knows exactly what your body and mind need to recover.
                </p>
                <p>
                  StrongME group classes run every Saturday and Sunday in Zurich,
                  with a growing community who return week after week for the energy,
                  the connection, and the results.
                </p>
                <p className="closing-line">Strong body. Strong mind. Strong ME.</p>
                <a
                  href="https://www.hotomski.com/"
                  className="instructor-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about Sofija →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="join-section section-divider">
          <div className="join-copy">
            <h2>Bring StrongME to your office</h2>
            <p className="join-subline">
              Ready to invest twenty minutes that change the rest of your team&apos;s day?
              Let&apos;s talk.
            </p>

            <div className="hero-actions">
              <a href="mailto:info@strongme.pro" className="btn corp-btn-primary">
                <MdEmail size={18} />
                info@strongme.pro
              </a>
            </div>
          </div>

          <div className="join-card corp-card">
            <div className="join-card-block">
              <span className="join-card-label">Format</span>
              <p>20-minute live session at your workplace</p>
            </div>

            <div className="join-card-block">
              <span className="join-card-label">Requirements</span>
              <p>A clear open space</p>
              <p>Comfortable clothes</p>
              <p>No equipment needed</p>
            </div>

            <div className="join-card-block">
              <span className="join-card-label">Location</span>
              <p>Your office — Zurich area</p>
              <p>Remote sessions available on request</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

function FormatRow({
  time,
  title,
  text,
}: {
  time: string;
  title: string;
  text: string;
}) {
  return (
    <div className="format-row">
      <div className="format-time">{time}</div>
      <div className="format-body">
        <p className="format-title">{title}</p>
        <p className="format-text">{text}</p>
      </div>
    </div>
  );
}
