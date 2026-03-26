import Image from "next/image";

export default function Home() {
  return (
    <div className="site-shell">
      <main className="page">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-copy">
            <p className="hero-eyebrow">Group Movement Class</p>

            <h1 className="hero-title">
              Strong body.
              <br />
              Strong mind.
              <br />
              Strong ME.
            </h1>

            <p className="hero-description">
              <span className="hero-description-strong">
                Rebuild your strength. Reclaim your power. Feel alive again.
              </span>{" "}
              Joyful strength and movement for your ME time — where music, play,
              connection, and conscious awareness come together.
            </p>

            <div className="hero-actions">
              <a href="#join" className="btn btn-primary">
                Book your spot
              </a>
              <a href="#about" className="btn btn-secondary">
                Learn more
              </a>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-image-frame">
              <Image
                src="/images/strongME_New.png?v=2"
                alt="StrongME movement, connection and healing"
                fill
                priority
                className="hero-image"
                sizes="(min-width: 1024px) 52vw, 100vw"
              />
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="content-section section-divider">
          <div className="section-label">
            <h2>What is StrongME?</h2>
          </div>

          <div className="section-content">
            <p className="lead-paragraph">
              StrongME is structured, joyful movement training designed to
              rebuild strength, power, and stability during everyday and major
              life stress.
            </p>

            <p>
              Burnout. Anxiety. Birth. Illness. Loss. Career shifts. Ongoing
              workplace pressure. Name it. Then take your power back — and feel
              alive again.
            </p>

            <p>
              When stress overloads your system, your body does not need more
              pressure — it needs intelligent rebuilding. StrongME combines
              rhythmic cardio and strength training, playful movement with balls
              and cloths, and a guided closing practice of floor stretching,
              mindful breath, and embodied awareness to help you restore
              physical strength, stabilize stress responses, and rebuild
              sustainable energy.
            </p>

            <p className="quote-block">
              This is not where you carry it.
              <br />
              This is where you release it.
            </p>

            <p>
              We step onto the floor. We let the music lead. We dance. We play.
              We sweat. We laugh. We breathe deeper. We reconnect — to our
              bodies and to each other.
            </p>

            <p>
              You leave lighter. Clearer. Stronger. And unmistakably uplifted —
              your glow visible again.
            </p>

            <p className="closing-line">Strong body. Strong mind. Strong ME.</p>
          </div>
        </section>

        {/* FORMAT */}
        <section className="content-section">
          <div className="section-label">
            <h2>Class format</h2>
          </div>

          <div className="section-content section-content-tight">
            <FormatRow
              time="10 min"
              title="Warm-up & arrival"
              text="Gentle rhythm, joint mobility, body awareness, playful introduction."
            />
            <FormatRow
              time="35 min"
              title="Dance, play & strength"
              text="Joyful dance aerobics, soft ball movement, functional strength without pressure."
            />
            <FormatRow
              time="15 min"
              title="Stretch & mindfulness"
              text="Slow stretches, breath, and integration to calm the nervous system."
            />
          </div>
        </section>

        {/* JOIN */}
        <section id="join" className="join-section section-divider">
          <div className="join-copy">
            <h2>Join us every Saturday</h2>
            <p className="join-subline">
              Make this your time. Leave energized, empowered, and strong.
            </p>

            <div className="hero-actions">
              <a href="#" className="btn btn-primary">
                Book now
              </a>
              <a
                href="mailto:strongmeclass@gmail.com"
                className="btn btn-secondary"
              >
                strongmeclass@gmail.com
              </a>
            </div>
          </div>

          <div className="join-card">
            <div className="join-card-block">
              <span className="join-card-label">Schedule</span>
              <p>Every Saturday · 10:30</p>
            </div>

            <div className="join-card-block">
              <span className="join-card-label">Price</span>
              <p>35 CHF per class</p>
              <p>235 CHF monthly subscription (8 classes included)</p>
            </div>

            <div className="join-card-block">
              <span className="join-card-label">Location</span>
              <p>Zurich</p>
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