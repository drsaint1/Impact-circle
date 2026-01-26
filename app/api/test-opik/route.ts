import { NextResponse } from "next/server";
import { getOpikClient } from "@/lib/opik/config";

export async function GET() {
  try {
    console.log("🧪 Testing Opik integration...");

    
    const envCheck = {
      apiKey: !!process.env.OPIK_API_KEY,
      workspace: !!process.env.OPIK_WORKSPACE_NAME,
      project: !!process.env.OPIK_PROJECT_NAME,
      url: !!process.env.OPIK_URL_OVERRIDE,
    };

    console.log("📋 Environment variables:", envCheck);

    if (!envCheck.apiKey || !envCheck.workspace) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        envCheck,
      }, { status: 500 });
    }

    
    const client = getOpikClient();

    if (!client) {
      return NextResponse.json({
        success: false,
        error: "Failed to create Opik client",
        envCheck,
      }, { status: 500 });
    }

    console.log("✅ Opik client created successfully");

    
    const trace = client.trace({
      name: "test_trace",
      input: { message: "Testing Opik integration" },
      output: { status: "success" },
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
      tags: ["test", "integration"],
    });

    console.log("✅ Test trace created");

    
    trace.end();

    
    await client.flush();

    console.log("✅ Trace flushed to Opik");

    return NextResponse.json({
      success: true,
      message: "✅ Opik is working perfectly!",
      envCheck,
      traceCreated: true,
    });

  } catch (error) {
    console.error("❌ Opik test failed:", error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}