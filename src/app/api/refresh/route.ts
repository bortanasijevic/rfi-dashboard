import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";

export async function POST(req: Request) {
  // Simple protection: require an API key header (optional in dev)
  const headerKey = process.env.REFRESH_KEY || "";
  const sentKey = req.headers.get("x-refresh-key") || "";
  if (headerKey && sentKey !== headerKey) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Resolve paths
  const home = process.env.HOME || os.homedir();
  // default: /Users/<me>/Desktop/API Script
  const scriptDir = (process.env.API_SCRIPT_DIR || `${home}/Desktop/API Script`).replace("~", home);
  const py = process.env.PYTHON_BIN || "python3";
  const scriptName = process.env.EXPORTER_FILE || "pull_rfis_rest_final_patched1.py";

  return new Promise((resolve) => {
    const child = spawn(py, [scriptName], {
      cwd: path.resolve(scriptDir),
      env: process.env, // exporter loads .env itself
    });

    let out = "";
    let err = "";

    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));

    child.on("close", (code) => {
      resolve(
        NextResponse.json(
          { ok: code === 0, code, stdout: out, stderr: err },
          { status: code === 0 ? 200 : 500 }
        )
      );
    });
  });
}
