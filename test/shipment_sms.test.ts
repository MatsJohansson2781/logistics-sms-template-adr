import assert from "node:assert/strict";
import { buildDeliveryMessage } from "../src/shipment_sms";

const result = buildDeliveryMessage({ phone: "+15555550123", event: { shipmentId: "SHP-2048", status: "delivered", occurredAt: "2026-10-24T08:30:00.000Z" }, proof: { fileId: "pod-2048", kind: "photo", capturedAt: "2026-10-24T08:29:00.000Z" } });
assert.equal(result.decision, "delivery-confirmed");
assert.equal(result.payload.messages[0].template_vars.status, "delivered");
console.log("shipment decision test passed");
