import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const searchParams = url.searchParams;
  const userUID = searchParams.get("uid");

  // Verify the OMI device
  const { data: omi, error } = await supabase
    .from("omi_divice")
    .select("*")
    .eq("omi_id", userUID)
    .single();

  if (error || !omi) {
    console.error("Error fetching OMI device:", error);
    return NextResponse.json(
      { error: "Unauthorized or OMI device not found" },
      { status: 401 }
    );
  }

  const memory = await req.json();
  const { data, error: insertError } = await supabase
    .from("memories")
    .insert({
      memories: memory,
      encrypted: false, // Set this to true if the data is encrypted
      omi_id: omi.omi_id,
    })
    .select();

  if (insertError) {
    console.error("Error inserting memory:", insertError);
    return NextResponse.json(
      { error: "Failed to save memory" },
      { status: 500 }
    );
  }

  // Log the memory and userUID (you may want to remove this in production)
  console.log("Memory saved:", data);
  console.log("User UID:", userUID);

  return NextResponse.json({ success: true, data });
}
