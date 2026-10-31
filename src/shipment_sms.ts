import { z } from "zod";

const shipmentEvent = z.object({ shipmentId: z.string().min(1), status: z.enum(["picked_up", "in_transit", "delivered"]), occurredAt: z.string().datetime() });
const proofOfDelivery = z.object({ fileId: z.string().min(1), kind: z.enum(["photo", "signature"]), capturedAt: z.string().datetime() });
const exception = z.object({ code: z.string().min(1), note: z.string().min(1) });
export const deliveryUpdate = z.object({ phone: z.string().min(7), event: shipmentEvent, proof: proofOfDelivery.optional(), exception: exception.optional() });

type ApprovedTemplate = { name: string; templateId: string; variables: readonly string[] };
const approvedDeliveryTemplate: ApprovedTemplate = { name: "shipment-delivery-v1", templateId: "shipment-delivery-v1", variables: ["shipmentId", "status"] };

export function buildDeliveryMessage(input: unknown) {
  const update = deliveryUpdate.parse(input);
  const vars = { shipmentId: update.event.shipmentId, status: update.event.status };
  return {
    template: approvedDeliveryTemplate,
    payload: { messages: [{ to: update.phone, template_id: approvedDeliveryTemplate.templateId, template_vars: vars }] },
    decision: update.event.status === "delivered" && update.proof ? "delivery-confirmed" : "tracking-update",
  } as const;
}
