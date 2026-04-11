import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, width = "max-w-lg" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50"
      style={{ animation: "overlay-show 0.15s ease-out" }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${width} bg-surface rounded-xl shadow-modal border border-border`}
        style={{ animation: "content-show 0.2s ease-out" }}
      >
        <div className="flex items-center justify-between h-14 px-5 border-b border-border">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text hover:bg-bg-subtle transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
