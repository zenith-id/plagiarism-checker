const STEPS = [
  {
    title: "Unggah dokumen",
    description: "Pilih file tugas mahasiswa atau sebutkan nama mata kuliah sebagai konteks.",
  },
  {
    title: "Analisis otomatis",
    description: "Sistem menghitung kemiripan antar dokumen menggunakan beberapa algoritma.",
  },
  {
    title: "Tinjau & ekspor",
    description: "Lihat peringkat pasangan mencurigakan dan unduh laporan dalam format PDF.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-canvas-soft border-y border-hairline">
      <div className="max-w-6xl w-full mx-auto px-6 py-16">
        <h2 className="text-3xl text-center mb-10">Cara kerja</h2>
        <ol className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-xl bg-canvas-card border border-hairline p-6">
              <span className="absolute -top-3 left-6 w-7 h-7 grid place-items-center rounded-full bg-primary text-on-primary text-sm">
                {i + 1}
              </span>
              <h3 className="text-lg mt-2 mb-2">{step.title}</h3>
              <p className="text-body text-sm">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
