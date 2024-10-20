import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req, { params }) {
  const { omi_id } = params;

  // Fetch memories for the given OMI device
  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .eq("omi_id", omi_id);

  if (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json(
      { error: "Error fetching memories" },
      { status: 500 }
    );
  }

  if (!memories || memories.length === 0) {
    return NextResponse.json(
      { message: "No memories found for this OMI device" },
      { status: 404 }
    );
  }

  // Return the memories
  return NextResponse.json(memories[0]);
}
