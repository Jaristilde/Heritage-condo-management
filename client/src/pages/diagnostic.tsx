import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Diagnostic() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  async function runDiagnostics() {
    setTesting(true);
    const logs: string[] = [];

    try {
      // Test 1: Basic fetch to login endpoint
      logs.push("🔍 Test 1: Testing POST to /api/auth/login...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "board",
          password: "board123",
        }),
      });

      logs.push(`   Response status: ${response.status} ${response.statusText}`);
      logs.push(`   Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

      if (response.ok) {
        const data = await response.json();
        logs.push(`   ✅ SUCCESS! Received token: ${data.token.substring(0, 20)}...`);
        logs.push(`   User: ${data.user.username} (${data.user.role})`);
      } else {
        const text = await response.text();
        logs.push(`   ❌ FAILED! Response: ${text}`);
      }
    } catch (error) {
      logs.push(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test 2: Check if dashboard endpoint works
    try {
      logs.push("\n🔍 Test 2: Testing GET to /api/dashboard/stats...");
      const response = await fetch("/api/dashboard/stats");
      logs.push(`   Response status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        logs.push(`   ✅ Dashboard endpoint works!`);
      } else {
        logs.push(`   ❌ Dashboard endpoint failed`);
      }
    } catch (error) {
      logs.push(`   ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test 3: LocalStorage test
    try {
      logs.push("\n🔍 Test 3: Testing localStorage...");
      localStorage.setItem("test_key", "test_value");
      const val = localStorage.getItem("test_key");
      logs.push(`   ✅ localStorage works! Value: ${val}`);
      localStorage.removeItem("test_key");
    } catch (error) {
      logs.push(`   ❌ localStorage ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test 4: Browser info
    logs.push("\n🔍 Test 4: Browser information...");
    logs.push(`   User Agent: ${navigator.userAgent}`);
    logs.push(`   Online: ${navigator.onLine}`);
    logs.push(`   Cookies Enabled: ${navigator.cookieEnabled}`);

    setResults(logs);
    setTesting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Login Diagnostic Test</CardTitle>
          <CardDescription>
            This page tests the login connection to identify any issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={testing}
            className="w-full"
            data-testid="button-run-diagnostics"
          >
            {testing ? "Running Tests..." : "Run Diagnostics"}
          </Button>

          {results.length > 0 && (
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {results.join("\n")}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
