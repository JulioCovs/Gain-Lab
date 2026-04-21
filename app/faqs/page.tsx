import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqItems = [
  {
    id: "envios-nacionales",
    question: "¿Hacen envios nacionales en todo Mexico?",
    answer:
      "Si. Enviamos a toda la Republica Mexicana. El tiempo estimado es de 2 a 6 dias habiles segun el destino y operador logístico.",
  },
  {
    id: "autenticidad",
    question: "¿Como garantizan la autenticidad de los productos?",
    answer:
      "Todos los suplementos de Gain Lab pasan por validacion de proveedor, control de lote y verificacion de calidad antes de publicarse.",
  },
  {
    id: "metodos-pago",
    question: "¿Que metodos de pago estan disponibles?",
    answer:
      "Actualmente operamos con confirmacion interna de compra. La integracion de pagos online (tarjeta y wallets) sera habilitada en la siguiente fase.",
  },
  {
    id: "seguimiento",
    question: "¿Puedo rastrear mi pedido?",
    answer:
      "Si. Una vez confirmado, recibirás actualizaciones de estado y detalles de envio para seguimiento nacional.",
  },
]

export default function FaqsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7]">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Preguntas Frecuentes</h1>
        <p className="mt-2 text-muted-foreground">
          Todo lo que necesitas saber sobre envios nacionales, autenticidad y metodos de pago.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-white px-6 py-3">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <Footer />
    </div>
  )
}
