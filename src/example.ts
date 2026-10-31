import { sendSmsBatch } from "./infrai_sms";
import { buildDeliveryMessage } from "./shipment_sms";

// The capability idiom is sms.batch.send; the client maps it to the documented route.

const message = buildDeliveryMessage({
  phone: process.env.SMS_TO ?? "+15555550123",
  event: { shipmentId: "SHP-2048", status: "delivered", occurredAt: "2026-10-24T08:30:00.000Z" },
  proof: { fileId: "pod-2048", kind: "photo", capturedAt: "2026-10-24T08:29:00.000Z" },
});
console.log(message.decision, message.template.name);
if (process.env.INFRAI_API_KEY) console.log(await sendSmsBatch(message.payload, `shipment:${message.payload.messages[0].template_id}:${message.payload.messages[0].to}`));
