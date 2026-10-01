"use client";

export default function BottomSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-ink/40 md:items-center md:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-5 pb-8 md:rounded-3xl md:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bunting -mx-5 -mt-5 mb-5 rounded-t-3xl" />
        {children}
      </div>
    </div>
  );
}
