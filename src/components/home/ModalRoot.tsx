import { useAppStore } from "../../store/useAppStore";
import { ModalShell } from "./ModalShell";
import { TicketDetail } from "./TicketDetail";
import { MetricList } from "./MetricList";

export function ModalRoot() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const item = useAppStore((s) => {
    if (s.modal?.kind !== "ticket") return undefined;
    const ticketId = s.modal.id;
    return s.items.find((i) => i.actionable_item_id === ticketId);
  });

  if (!modal) return null;

  if (modal.kind === "metric") {
    return (
      <ModalShell onClose={closeModal} width={600}>
        <MetricList metricKey={modal.key} />
      </ModalShell>
    );
  }

  if (!item) return null;
  return (
    <ModalShell onClose={closeModal} width={560}>
      <TicketDetail item={item} backKey={modal.backKey} />
    </ModalShell>
  );
}
