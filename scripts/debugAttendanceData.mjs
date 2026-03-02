/**
 * Debug script to check attendance data in Supabase
 * Run with: node scripts/debugAttendanceData.mjs
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAttendanceData() {
  console.log("🔍 Debugging Attendance Data...\n");

  try {
    // 1. Get all attendance logs
    console.log("📋 Fetching all attendance logs...");
    const { data: logs, error: logsError } = await supabase
      .from("attendance_logs")
      .select("id, student_id, signed_at, session_id");

    if (logsError) {
      console.error("❌ Error fetching attendance logs:", logsError);
      return;
    }

    console.log(`✅ Found ${logs?.length || 0} attendance logs\n`);

    if (!logs || logs.length === 0) {
      console.log("ℹ️ No attendance logs found in database");
      return;
    }

    // 2. Get unique student IDs
    const uniqueStudentIds = [...new Set(logs.map((log) => log.student_id))];
    console.log(`👥 Unique students in attendance: ${uniqueStudentIds.length}`);
    console.log("Student IDs:", uniqueStudentIds);
    console.log("\n");

    // 3. Check if profiles exist for each student
    console.log("🔍 Checking for matching profiles...\n");
    for (const studentId of uniqueStudentIds) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, matric_no, email, department, level")
        .eq("id", studentId)
        .single();

      if (profileError) {
        console.log(`❌ Student ${studentId}: NO PROFILE FOUND`);
        console.log(`   Error:`, profileError.message);
      } else if (profile) {
        console.log(`✅ Student ${studentId}:`);
        console.log(`   Name: ${profile.full_name}`);
        console.log(`   Matric: ${profile.matric_no}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Department: ${profile.department}`);
      } else {
        console.log(`⚠️ Student ${studentId}: Profile returned null`);
      }
    }

    console.log("\n");

    // 4. Check attendance logs with full details
    console.log("📊 Sample Attendance Records:");
    const sampleLogs = logs.slice(0, 5);

    for (const log of sampleLogs) {
      console.log(`\n🔸 Attendance ID: ${log.id}`);
      console.log(`  Student ID: ${log.student_id}`);
      console.log(`  Session ID: ${log.session_id}`);
      console.log(`  Signed At: ${log.signed_at}`);

      // Try to fetch profile for this student
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, matric_no")
        .eq("id", log.student_id)
        .single();

      if (profile) {
        console.log(`  Profile: ${profile.full_name} (${profile.matric_no})`);
      } else {
        console.log(`  Profile: NOT FOUND`);
      }
    }

    console.log("\n");

    // 5. Check if there's a relation issue
    console.log("🔗 Testing relation query (profiles:student_id)...");
    const { data: logsWithRelation, error: relationError } = await supabase
      .from("attendance_logs")
      .select(
        `
        id,
        student_id,
        signed_at,
        profiles:student_id (
          id,
          full_name,
          matric_no
        )
      `
      )
      .limit(5);

    if (relationError) {
      console.error("❌ Relation query error:", relationError);
    } else {
      console.log("✅ Relation query successful");
      logsWithRelation?.forEach((log) => {
        console.log(`\nLog ${log.id}:`);
        console.log(`  student_id: ${log.student_id}`);
        console.log(`  profiles data:`, log.profiles);
      });
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

debugAttendanceData();
