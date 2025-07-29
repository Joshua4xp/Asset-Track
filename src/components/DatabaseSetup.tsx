import React, { useEffect, useState } from "react";
import { supabase, hasSupabaseCredentials } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

// This component runs database setup automatically in the background
// It doesn't render any UI - it's just for initialization
const DatabaseSetup = () => {
  const { user, session } = useAuth();
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    if (user && session && hasSupabaseCredentials && !setupComplete) {
      runAutomaticSetup();
    }
  }, [user, session, setupComplete]);

  const runAutomaticSetup = async () => {
    try {
      console.log("Running automatic database setup...");
      
      // Test connectivity with the actual projects table structure
      const { data: testData, error: testError } = await supabase
        .from("projects")
        .select("count", { count: "exact", head: true });

      if (testError) {
        console.error("Database connectivity test failed:", testError);
        return;
      }

      // Test assets table
      const { data: assetsTest, error: assetsError } = await supabase
        .from("assets")
        .select("count", { count: "exact", head: true });
        
      if (assetsError) {
        console.error("Assets table test failed:", assetsError);
        return;
      }

      console.log("Database setup completed successfully");
      setSetupComplete(true);
    } catch (error) {
      console.error("Automatic database setup failed:", error);
    }
  };

  // This component doesn't render anything
  return null;
};

export default DatabaseSetup;