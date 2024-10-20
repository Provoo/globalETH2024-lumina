import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  const { friendAddress } = await req.json();

  // First, try to select the existing record
  let { data, error } = await supabase
    .from("omi_divice")
    .select()
    .eq("omi_id", friendAddress)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error querying OMI device:", error);
    return NextResponse.json(
      { error: "Failed to query friend" },
      { status: 500 }
    );
  }

  // If no record found, insert a new one
  if (!data) {
    const { data: insertData, error: insertError } = await supabase
      .from("omi_divice")
      .insert({ omi_id: friendAddress })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting OMI device:", insertError);
      return NextResponse.json(
        { error: "Failed to register friend" },
        { status: 500 }
      );
    }

    data = insertData;
    console.log("New friend registered:", data);
  } else {
    console.log("Existing friend retrieved:", data);
  }

  return NextResponse.json({ success: true, data });
}
