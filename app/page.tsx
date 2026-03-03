import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f2ec] text-[#111]">
      <main className="mx-auto max-w-6xl px-6 py-20">
        {/* HERO */}
        <section className="grid gap-16 md:grid-cols-12 md:items-center">
          {/* Text */}
          <div className="md:col-span-5">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-[#666] uppercase">
              Group Movement Class
            </p>

            {/* Keep the original main headline */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Strong body. Strong mind. Strong ME.
            </h1>

            {/* NEW hero paragraph (first sentence slightly emphasized, not huge) */}
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#555] md:text-lg">
              <span className="font-semibold text-[#111]">
                Rebuild your strength. Reclaim your power. Feel alive again.
              </span>{" "}
              Joyful strength and movement for your ME time — where music, play,
              connection, and conscious awareness come together.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#join"
                className="inline-flex items-center justify-center rounded-full bg-[#111] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#000]"
              >
                Book your spot
              </a>

              <a
                href="#about"
                className="inline-flex items-center justify-center rounded-full border border-[#111] px-7 py-3 text-sm font-semibold text-[#111] transition hover:bg-[#111] hover:text-white"
              >
                Learn more
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="md:col-span-7">
            <div className="relative overflow-hidden border border-[#ddd] bg-white">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/images/strongMEparts.png"
                  alt="StrongME movement, connection and healing"
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="mt-28 grid gap-12 border-t border-[#ddd] pt-16 md:grid-cols-12"
        >
          <div className="md:col-span-4">
            <h2 className="text-2xl font-bold tracking-tight">
              What is StrongME?
            </h2>
          </div>

          <div className="md:col-span-8 space-y-4 text-[#555] leading-relaxed">
            <p className="font-semibold text-[#111]">
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

            <p className="font-semibold text-[#111]">
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

            <p className="font-semibold text-[#111]">
              Strong body. Strong mind. Strong ME.
            </p>
          </div>
        </section>

        {/* FORMAT */}
        <section className="mt-24 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="text-2xl font-bold tracking-tight">Class format</h2>
          </div>

          <div className="md:col-span-8 space-y-6">
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
        <section id="join" className="mt-28 border-t border-[#ddd] pt-16">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Join us every Saturday
              </h2>
              <p className="mt-4 text-[#555]">
              Make this your time. Leave energized, empowered, and strong.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#"
                  className="rounded-full bg-[#111] px-7 py-3 text-sm font-semibold text-white hover:bg-[#000]"
                >
                  Book now
                </a>
                <a
                  href="mailto:strongme@example.com"
                  className="rounded-full border border-[#111] px-7 py-3 text-sm font-semibold hover:bg-[#111] hover:text-white"
                >
                  strongmeclass@gmail.com
                </a>
              </div>
            </div>

            <div className="md:col-span-5 text-sm text-[#555]">
              <div className="border border-[#ddd] bg-white p-6">
                <p className="font-semibold text-[#111]">Schedule</p>
                <p className="mt-1">Every Saturday · 10:30</p>

                <p className="mt-6 font-semibold text-[#111]">Location</p>
                <p className="mt-1">Zurich</p>
              </div>
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
    <div className="flex gap-6 border-b border-[#ddd] pb-4">
      <div className="w-20 shrink-0 text-sm font-semibold text-[#111]">
        {time}
      </div>
      <div>
        <p className="font-semibold text-[#111]">{title}</p>
        <p className="mt-1 text-sm text-[#555]">{text}</p>
      </div>
    </div>
  );
}