export function initOpikServer(): void {
  
  if (typeof window !== "undefined") {
    return;
  }

  
  if (process.env.OPIK_API_KEY && process.env.OPIK_WORKSPACE_NAME) {
    console.log("✅ Opik configured for this route");
  }
}