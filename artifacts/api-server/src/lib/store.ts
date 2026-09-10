import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export type StoredVerification = {
  id: number;
  originalText: string;
  extractedClaim: string;
  verdict: string;
  confidence: number;
  explanation: string;
  evidence: unknown[];
  mlSignal: unknown;
  searchStatus: string;
  createdAt: string;
};

const dataDir = path.resolve(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });
const database = new DatabaseSync(path.join(dataDir, "truthguard.db"));

database.exec(`
  CREATE TABLE IF NOT EXISTS verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_text TEXT NOT NULL,
    extracted_claim TEXT NOT NULL,
    verdict TEXT NOT NULL,
    confidence REAL NOT NULL,
    explanation TEXT NOT NULL,
    evidence_json TEXT NOT NULL,
    ml_signal_json TEXT NOT NULL,
    search_status TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

export function saveVerification(result: Omit<StoredVerification, "id">): number {
  const statement = database.prepare(`
    INSERT INTO verifications
      (original_text, extracted_claim, verdict, confidence, explanation, evidence_json, ml_signal_json, search_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const inserted = statement.run(
    result.originalText,
    result.extractedClaim,
    result.verdict,
    result.confidence,
    result.explanation,
    JSON.stringify(result.evidence),
    JSON.stringify(result.mlSignal),
    result.searchStatus,
    result.createdAt,
  );
  return Number(inserted.lastInsertRowid);
}

export function listVerifications(): StoredVerification[] {
  const rows = database
    .prepare(
      `SELECT id, original_text, extracted_claim, verdict, confidence, explanation,
        evidence_json, ml_signal_json, search_status, created_at
       FROM verifications ORDER BY id DESC LIMIT 20`,
    )
    .all() as Array<Record<string, string | number>>;
  return rows.map((row) => ({
    id: Number(row.id),
    originalText: String(row.original_text),
    extractedClaim: String(row.extracted_claim),
    verdict: String(row.verdict),
    confidence: Number(row.confidence),
    explanation: String(row.explanation),
    evidence: JSON.parse(String(row.evidence_json)),
    mlSignal: JSON.parse(String(row.ml_signal_json)),
    searchStatus: String(row.search_status),
    createdAt: String(row.created_at),
  }));
}