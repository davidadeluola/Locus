 import {ShieldCheck , Cpu,Smartphone, BarChart3} from "lucide-react"
 
 const featureList = [
    {
      title: "Anti-Spoofing Engine",
      desc: "Advanced detection for GPS emulators and VPNs to ensure physical presence.",
      icon: <ShieldCheck className="text-orange-500" />,
    },
    {
      title: "Rotating TOTP QR",
      desc: "Encrypted codes that refresh every 30s, rendering photos or screenshots useless.",
      icon: <Cpu className="text-orange-500" />,
    },
    {
      title: "Cross-Platform Sync",
      desc: "Real-time updates between Student and Lecturer interfaces via Supabase.",
      icon: <Smartphone className="text-orange-500" />,
    },
    {
      title: "Automated Analytics",
      desc: "Instant generation of attendance trends and participation metrics.",
      icon: <BarChart3 className="text-orange-500" />,
    },
  ];

  export default featureList