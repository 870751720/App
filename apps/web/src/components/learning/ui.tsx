import type { ReactNode } from "react";

export function Panel({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <div id={id} className={`rounded-lg border border-[#d9ddd4] bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-bold text-[#425047]">{text}</span>
      {children}
    </label>
  );
}

export function Badge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-[#2e6f57]/20 bg-white px-3 py-2 text-sm font-bold text-[#2e6f57] shadow-sm">
      {icon}
      {children}
    </div>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-bold text-[#647069]">{label}</span>
      <span className="text-right font-black">{value}</span>
    </div>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return <div className="mt-4 rounded-md border border-[#f4b4a4] bg-[#fff4ef] p-3 text-sm font-bold text-[#a33b1f]">{children}</div>;
}

export function Metric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#647069]">{label}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-md bg-[#eef2ec] text-[#2e6f57]">{icon}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#647069]">{detail}</p>
    </Panel>
  );
}

export function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-[#d9ddd4] bg-white p-4 shadow-sm">
      <span className="grid size-10 place-items-center rounded-md bg-[#eef2ec] text-[#2e6f57]">{icon}</span>
      <p className="mt-3 font-black">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#647069]">{text}</p>
    </div>
  );
}

export function Section({ id, icon, title, children }: { id: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section id={id} className="grid gap-3">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-md bg-[#e7ece5] text-[#2e6f57]">{icon}</span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function ReportBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel>
      <h3 className="text-lg font-black">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#647069]">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </Panel>
  );
}
