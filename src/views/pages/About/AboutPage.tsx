const TEAM = [
  { name: 'Juan Bermejo', role: 'Desarrollador', icon: 'person', color: 'bg-blue-50 text-blue-600' },
  { name: 'Haxell Gomez', role: 'Desarrollador', icon: 'person', color: 'bg-violet-50 text-violet-600' },
  { name: 'Lucas Romero', role: 'Desarrollador', icon: 'person', color: 'bg-emerald-50 text-emerald-600' },
];

const ADVISORS = [
  { name: 'Diego Gomez', role: 'Asesor', icon: 'school', color: 'bg-orange-50 text-orange-600' },
  { name: 'Aimer Maturana', role: 'Asesor', icon: 'school', color: 'bg-amber-50 text-amber-600' },
];

const PROCESS = [
  { icon: 'sensors',        label: 'Adquisición de Datos',     desc: 'Respaldo local en tarjeta SD para no perder información y envío hacia la nube.',  color: 'bg-primary-50 text-primary-600' },
  { icon: 'cloud_sync',     label: 'Nube y Almacenamiento',    desc: 'Almacenamiento remoto en Supabase/PostgreSQL para fácil acceso.', color: 'bg-blue-50 text-blue-600' },
  { icon: 'science',        label: 'Consulta e IA',            desc: 'Consulta de datos y posibilidad de alimentar modelos de IA.', color: 'bg-emerald-50 text-emerald-600' },
];

export default function AboutPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 lg:space-y-12 max-w-[900px] mx-auto">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Acerca de Bio-Laguna</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitoreo ambiental enfocado en cuerpos de agua del Caribe colombiano</p>
      </div>

      {/* ── Overview ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-400 px-8 py-10 text-white">
          <span className="material-icons-round text-4xl mb-3 block opacity-80">water</span>
          <h2 className="text-xl font-bold mb-3">Contexto del Proyecto</h2>
          <p className="text-sm leading-relaxed opacity-90 max-w-2xl">
            Bio-Laguna es un proyecto de monitoreo ambiental enfocado en cuerpos de agua del Caribe colombiano. 
            Su propósito principal es vigilar la calidad del agua y aportar a la detección temprana de condiciones 
            que puedan favorecer eventos de anoxia o deterioro ecológico.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <div className="p-8">
            <span className="material-icons-round text-primary-500 text-2xl mb-3 block">hub</span>
            <h3 className="font-semibold text-gray-900 mb-2">Enfoque AIoT</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Combinamos una unidad de adquisición de datos en una boya o sistema flotante con sensores 
              ambientales, conectividad a la nube, almacenamiento y una plataforma web. Convertimos mediciones físicas 
              del entorno en información útil y accionable.
            </p>
          </div>
          <div className="p-8">
            <span className="material-icons-round text-emerald-500 text-2xl mb-3 block">track_changes</span>
            <h3 className="font-semibold text-gray-900 mb-2">Objetivo e Impacto</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Nacimos de una necesidad ambiental concreta: mejorar el seguimiento de la calidad del agua en 
              ecosistemas vulnerables y generar herramientas tecnológicas que faciliten una respuesta más 
              oportuna ante señales de deterioro.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pillars ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">En Esencia</h2>
        <p className="text-sm text-gray-400 -mt-2">Bio-Laguna busca lograr cuatro propósitos fundamentales:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                <span className="material-icons-round text-xl">visibility</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Tiempo Real</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Hacer visible el estado del agua en tiempo real.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 text-violet-600">
                <span className="material-icons-round text-xl">dashboard</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Centralización</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Centralizar la información en una plataforma accesible.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-50 text-primary-600">
                <span className="material-icons-round text-xl">analytics</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Datos Útiles</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Generar datos útiles para análisis y modelos.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                <span className="material-icons-round text-xl">shield</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Prevención</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Contribuir a la prevención de eventos de anoxia y problemas ecológicos.</p>
            </div>
        </div>
      </section>

      {/* ── How it Works ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">La Arquitectura</h2>
        <p className="text-sm text-gray-400 -mt-2">El proyecto contempla los siguientes pasos tecnológicos:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {PROCESS.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color}`}>
                <span className="material-icons-round text-xl">{step.icon}</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{step.label}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Equipo y Asesores ───────────────────────────────────────── */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-gray-900">El Equipo</h2>
        <p className="text-sm text-gray-400 -mt-2">Los integrantes detrás de la innovación en Bio-Laguna.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {TEAM.map((member) => (
            <div key={member.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${member.color}`}>
                <span className="material-icons-round text-3xl">{member.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{member.name}</p>
                <p className="text-xs font-medium text-primary-500 mt-0.5">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <h2 className="text-xl font-bold text-gray-900">Asesores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4 max-w-2xl">
            {ADVISORS.map((advisor) => (
              <div key={advisor.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${advisor.color}`}>
                  <span className="material-icons-round text-3xl">{advisor.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{advisor.name}</p>
                  <p className="text-xs font-medium text-orange-500 mt-0.5">{advisor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="text-center text-xs text-gray-400 pb-4 pt-2 border-t border-gray-100">
        © Bio-Laguna 2026. Todos los derechos reservados.&nbsp;·&nbsp;
        <span className="text-gray-400">Proyecto de Monitoreo Ambiental</span>
      </footer>
    </div>
  );
}

