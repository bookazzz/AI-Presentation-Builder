export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          AI Presentation Builder
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Загрузите текст или Excel — получите готовую презентацию 
          с выводами, графиками и экспортом в PPTX/PDF за несколько минут.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
          >
            Начать бесплатно
          </a>
          <a
            href="/login"
            className="border border-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition"
          >
            Войти
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported formats */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Поддерживаемые форматы</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['TXT', 'DOCX', 'XLSX', 'CSV', 'PDF'].map((fmt) => (
              <span key={fmt} className="bg-gray-200 px-6 py-3 rounded-lg font-medium text-gray-700">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-500 text-sm border-t">
        AI Presentation Builder &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}

const steps = [
  {
    title: 'Загрузите файл',
    desc: 'TXT, DOCX, XLSX, CSV или PDF. Или просто вставьте текст.',
  },
  {
    title: 'Настройте презентацию',
    desc: 'Выберите тип, стиль, аудиторию и количество слайдов.',
  },
  {
    title: 'Скачайте результат',
    desc: 'Готовая презентация в PPTX или PDF с графиками и выводами.',
  },
];
