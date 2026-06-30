import { prisma } from "./db";

/**
 * Append a row to the audit log. Per proposal §3.7 — every admin action
 * (order update, payment verification, product change) must capture
 * timestamp, actor, action, before/after diff, and source IP.
 */

export interface AuditEntry {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
}

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        before: (entry.before as object) ?? undefined,
        after: (entry.after as object) ?? undefined,
        ip: entry.ip,
        userAgent: entry.userAgent,
      },
    });
  } catch (err) {
    // Audit logging must never break a request flow. Log and move on.
    console.error("[audit] failed to write log entry", err);
  }
}
