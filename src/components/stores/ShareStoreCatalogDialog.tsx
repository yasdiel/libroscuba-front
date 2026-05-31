import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Copy, Send, Share2, X } from "lucide-react"
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon"
import { Button } from "@/components/ui/button"
import {
  copyTextToClipboard,
  getPublicStoreUrl,
  storeCatalogShareText,
  telegramShareUrl,
  whatsappShareUrl,
} from "@/lib/shareStore"
import { showSnackbar } from "@/lib/snackbar"

interface ShareStoreCatalogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeName: string
  tiendaSlug: string
}

export function ShareStoreCatalogDialog({
  open,
  onOpenChange,
  storeName,
  tiendaSlug,
}: ShareStoreCatalogDialogProps) {
  const url = getPublicStoreUrl(tiendaSlug)
  const message = storeCatalogShareText(storeName, url)

  const shareWhatsApp = () => {
    window.open(whatsappShareUrl(message), "_blank", "noopener,noreferrer")
    onOpenChange(false)
  }

  const shareTelegram = () => {
    window.open(
      telegramShareUrl(url, `Visita mi catálogo «${storeName}» en LibrosCuba`),
      "_blank",
      "noopener,noreferrer"
    )
    onOpenChange(false)
  }

  const copyLink = async () => {
    const ok = await copyTextToClipboard(url)
    if (ok) {
      showSnackbar("Enlace copiado al portapapeles.")
      onOpenChange(false)
    } else {
      showSnackbar("No se pudo copiar el enlace.")
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-brand" />
              <DialogPrimitive.Title className="text-base font-semibold text-gray-900">
                Compartir catálogo
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="mt-2 text-sm text-gray-600">
            Envía el enlace público de tu tienda para que vean tus libros publicados.
          </DialogPrimitive.Description>

          <p className="mt-3 break-all rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {url}
          </p>

          <div className="mt-4 space-y-2">
            <Button
              type="button"
              className="w-full justify-start gap-3 bg-[#25D366] text-white hover:bg-[#20bd5a]"
              onClick={shareWhatsApp}
            >
              <WhatsAppIcon />
              WhatsApp
            </Button>
            <Button
              type="button"
              className="w-full justify-start gap-3 bg-[#229ED9] text-white hover:bg-[#1f8fc4]"
              onClick={shareTelegram}
            >
              <Send className="h-5 w-5 shrink-0" />
              Telegram
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-start gap-3"
              onClick={() => void copyLink()}
            >
              <Copy className="h-5 w-5 shrink-0" />
              Copiar enlace
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
