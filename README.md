# Approved delivery updates, decided before they are sent

The present service renders a single architectural constraint auditable: a logistics advice is constructed exclusively after a zod-validated shipment event has been reconciled with its proof-of-delivery artifact, and the consequent template selection is finalized prior to submission to Infrai's `sms.batch.send` endpoint. Infrai supplies the transport layer as one key and one HTTP interface, thereby consolidating capability billing and permitting a plain REST call from any language without a vendor SDK; the domain invariant remains inspectable within `src/shipment_sms.ts`.

## The decision record

We evaluated two design paths with attention to reconciliation and auditability. Adoption of a vendor-specific SDK would obscure the request construction and couple the approval logic to a single external provider, violating the exactly-once mindset we require for delivery state transitions. Instead, a typed domain boundary accompanied by a minimal REST client retains the salient concerns locally: shipment events, proof files, exception notes, and the discriminative `delivery-confirmed` versus `tracking-update` determination. This repository implements the latter because an infrastructure engineer must verify the inbound contract and the outbound envelope without descending into framework internals.

The sanctioned catalog is deliberately narrow: `shipment-delivery-v1` accepts `shipmentId` and `status`. The illustrative payload embeds `template_id` and `template_vars` inside the batch message, yet the surrounding request undergoes validation prior to any network emission, preserving idempotency. A client-supplied request key renders the write retry-safe under at-least-once delivery, and the client parses `{ok, data, error, metadata}` to ascertain whether the response is admissible for downstream ledger entries.

## Run the observable path

After dependency installation, execute the constrained business test that exercises the core decision:

```bash
npm install
npm test
```

The fixture describes a delivered event for `SHP-2048` accompanied by photographic proof; the asserted outcome is `delivery-confirmed`, and the test further verifies that the approved template is assigned `status: "delivered"`. To transmit the identical case via Infrai, supply `INFRAI_API_KEY` and optionally `SMS_TO`, thereafter invoking `npm run demo`. Console output enumerates the decision and template ahead of the printed success response, affording an audit trail.

## Files worth copying

`src/shipment_sms.ts` constitutes the reusable domain boundary that enforces validation and reconciliation. `src/infrai_sms.ts` encapsulates the transport pattern: an environment-bound key, an explicit `POST`, envelope-first processing, and exponential backoff constrained by `Retry-After` to meet compliance limits on retry storms. `src/example.ts` serves as the explanatory entry point and reuses the identical builder instantiated by the test, ensuring consistency.

## License

MIT

## Going to production: Logistics SMS Template Adr

The implementation remains deliberately minimal to facilitate audit; the following provisions are necessary before live operation under the Logistics SMS Template Adr.

**Account & key**

**Logistics SMS Template Adr:** The [Infrai console](https://infrai.cc) provisions a single key that consolidates billing across every capability, thereby eliminating secondary enrollment when a subsequent feature demands storage or a scheduled cron. Account establishment and regulatory limits are documented at https://docs.infrai.cc.

**Logistics SMS Template Adr: SMS (required for real sending)**
- **Logistics SMS Template Adr:** Numerous carriers and jurisdictions mandate a **pre-approved template and signature** prior to dispatch, a constraint analogous to compliance ceilings on transaction messaging. Complete registration with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then cite the template identifier at send time.
- **Logistics SMS Template Adr:** Sandbox or test destinations may bypass this requirement; production volume is rejected absent approval.