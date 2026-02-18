import { FileSpreadsheet, MapPin, QrCode, Zap } from "lucide-react";

const steps = [
    {
      title: "Session Initialization",
      description: "Lecturer generates a unique session ID. System captures the classroom's precise GPS coordinates as the ground-truth center.",
      icon: <Zap className="text-orange-600" size={24} />,
      tag: "STEP 01"
    },
    {
      title: "Dynamic QR Generation",
      description: "A rotating TOTP-based QR code is displayed. This code expires every 30 seconds to prevent photo-sharing or proxy check-ins.",
      icon: <QrCode className="text-orange-600" size={24} />,
      tag: "STEP 02"
    },
    {
      title: "Geofence Validation",
      description: "Student scans via Locus. The Haversine formula calculates the distance; access is granted only if they are within the allowed radius.",
      icon: <MapPin className="text-orange-600" size={24} />,
      tag: "STEP 03"
    },
    {
      title: "Immutable Reporting",
      description: "Verified logs are synced to Supabase. Lecturers export tamper-proof XLSX reports with precise entry timestamps.",
      icon: <FileSpreadsheet className="text-orange-600" size={24} />,
      tag: "STEP 04"
    }
  ];

export default steps;

  