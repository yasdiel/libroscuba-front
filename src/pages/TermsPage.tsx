import { FileText } from "lucide-react"
import { TERMS_SECTIONS } from "@/content/terms"

export function TermsPage() {
  return (
    <div className="px-4 py-6 pb-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light">
          <FileText className="h-5 w-5 text-brand" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand">Legal</p>
          <h1 className="text-xl font-bold text-gray-900">Términos y Condiciones</h1>
        </div>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-gray-600">
        Términos y Condiciones de Uso de <strong className="text-gray-900">LibrosCuba</strong>.
        Operado bajo el ecosistema de CSD (Cuban Software Development).
      </p>

      <article className="space-y-6">
        {TERMS_SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <h2 className="mb-3 text-base font-semibold text-gray-900">{section.title}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-gray-700">
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </article>
    </div>
  )
}
