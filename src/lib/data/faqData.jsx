const faqData = [
  {
    question: "How does Locus prevent proxy attendance?",
    answer:
      "Locus uses a dual-verification layer: Geofencing (ensuring the device is within the lecture hall radius) and Time-based One-Time Password (TOTP) QR codes that refresh every 30 seconds to prevent photo sharing.",
  },
  {
    question: "What happens if a student has no internet connection?",
    answer:
      "Locus is designed for the African context. We are implementing an offline-first caching mechanism that allows students to 'queue' their validation locally, which syncs once a stable connection is established.",
  },
  {
    question: "Can it be integrated with existing university portals?",
    answer:
      "Yes. Our architecture uses Supabase, making it easy to sync school_id and course data with legacy university management systems via secure APIs.",
  },
  {
    question: "Is the geolocation data secure?",
    answer:
      "Locus only captures location during the 30-second check-in window. We don't track students post-validation, and all coordinate data is salted and hashed before storage.",
  },
  {
    question: "Can students use GPS spoofing apps to cheat?",
    answer:
      "Our Anti-Spoofing Engine detects mock location providers and developer mode overrides. If a student attempts to use a GPS emulator, the system automatically flags the attempt and denies the check-in.",
  },
  {
    question: "What if a student logs into multiple devices?",
    answer:
      "Locus enforces a 'Single-Session' policy. Each student account is bound to a specific device ID during the check-in window, preventing one student from signing in for multiple friends from one phone.",
  },
  {
    question: "How do lecturers access the attendance data?",
    answer:
      "Lecturers have a dedicated 'Control Panel' where they can monitor check-ins in real-time. Once a session is ended, they can instantly download a formatted XLSX report that is ready for departmental submission.",
  },
  {
    question: "Does Locus work for large lecture halls (500+ students)?",
    answer:
      "Absolutely. By utilizing Supabase's real-time subscriptions and optimized indexing, Locus handles high-concurrency check-ins simultaneously without lag, even in massive faculty halls.",
  },
];

export default faqData;
