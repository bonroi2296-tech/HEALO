export const runtime = "edge";

export function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "healo",
    version: process.env.npm_package_version || "0.0.0",
  });
}
