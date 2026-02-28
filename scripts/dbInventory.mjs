/**
 * Comprehensive database inventory script
 * Run with: node scripts/dbInventory.mjs
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log("📊 DATABASE INVENTORY CHECK\n");

  try {
    // Check Profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, matric_no")
      .limit(5);

    console.log("👥 PROFILES:");
    console.log(`   Count: ${profiles ? profiles.length : "Unknown"}`);
    if (profiles && profiles.length > 0) {
      profiles.forEach((p) => {
        console.log(`   - ${p.full_name} (${p.matric_no})`);
      });
    }
    console.log("");

    // Check Classes
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select("id, course_code, course_title, lecturer_id")
      .limit(5);

    console.log("📚 CLASSES:");
    console.log(`   Count: ${classes ? classes.length : "Unknown"}`);
    if (classes && classes.length > 0) {
      classes.forEach((c) => {
        console.log(`   - ${c.course_code}: ${c.course_title}`);
      });
    }
    console.log("");

    // Check Sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("id, class_id, created_at, expires_at")
      .limit(5);

    console.log("🔔 SESSIONS:");
    console.log(`   Count: ${sessions ? sessions.length : "Unknown"}`);
    if (sessions && sessions.length > 0) {
      sessions.forEach((s) => {
        console.log(`   - ID: ${s.id}`);
        console.log(`     Class ID: ${s.class_id}`);
        console.log(`     Created: ${s.created_at}`);
      });
    }
    console.log("");

    // Check Class Enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("class_enrollments")
      .select("id, class_id, student_id")
      .limit(5);

    console.log("📝 CLASS ENROLLMENTS:");
    console.log(`   Count: ${enrollments ? enrollments.length : "Unknown"}`);
    if (enrollments && enrollments.length > 0) {
      enrollments.forEach((e) => {
        console.log(`   - Class ${e.class_id}, Student ${e.student_id}`);
      });
    }
    console.log("");

    // Check Attendance Logs
    const { data: logs, error: logsError } = await supabase
      .from("attendance_logs")
      .select("id, student_id, session_id, signed_at")
      .limit(5);

    console.log("✅ ATTENDANCE LOGS:");
    console.log(`   Count: ${logs ? logs.length : "Unknown"}`);
    if (logs && logs.length > 0) {
      logs.forEach((l) => {
        console.log(`   - ID: ${l.id}, Student: ${l.student_id}, Session: ${l.session_id}`);
      });
    } else {
      console.log("   ⚠️ NO ATTENDANCE LOGS");
    }
    console.log("");

    // Summary
    console.log("=" + "=".repeat(50));
    console.log("📌 SUMMARY:");
    if (!profiles || profiles.length === 0) {
      console.log("❌ No student profiles in database");
    } else {
      console.log(`✅ ${profiles.length} student profiles exist`);
    }

    if (!sessions || sessions.length === 0) {
      console.log("❌ No attendance sessions created");
    } else {
      console.log(`✅ ${sessions.length} attendance sessions exist`);
    }

    if (!logs || logs.length === 0) {
      console.log("❌ No attendance logs recorded (students haven't signed in yet)");
    } else {
      console.log(`✅ ${logs.length} attendance records exist`);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

checkDatabase();
