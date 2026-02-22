import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const syncSchool = async () => {
  try {
    const filePath = path.resolve("./src/lib/data/schools.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const parseData = JSON.parse(rawData);
    const sourceArray = parseData.data || parseData;

    const formattedData = sourceArray
      .map((school) => {
        const name = school.name?.trim();
        const location = school.location?.trim();

        // LOGIC: Differentiate generic names by appending location
        const isGeneric = [
          "Federal University",
          "Federal University of Technology",
          "Federal University of Agriculture",
        ].includes(name);

        const finalName = isGeneric && location ? `${name} (${location})` : name;

        return {
          reference_id: school.id,
          name: finalName,
          short_name: school.short_name?.trim() || "N/A",
          location: location,
          email_domain: school.email_domain,
          type: school.type,
          url: school.url,
          vice_chancellor: school.vice_chancellor,
          year_of_establishment: school.year_of_establishment,
        };
      })
      .sort((a, b) => {
        // Primary Sort: Name
        const nameCompare = a.name.localeCompare(b.name, "en", {
          sensitivity: "base",
        });

        // Secondary Sort: If names are identical, use location as the checking point
        if (nameCompare === 0) {
          return (a.location || "").localeCompare(b.location || "", "en", {
            sensitivity: "base",
          });
        }

        return nameCompare;
      });

    console.log(`[SYSTEM]: Synchronizing ${formattedData.length} institutional nodes in alphabetical order...`);

    // Only use .upsert() here. Remove .order() and .ilike() as they are for GET requests.
    const { error } = await supabase
      .from("schools")
      .upsert(formattedData, { onConflict: "reference_id" });

    if (error) throw error;

    console.log("[SUCCESS]: Locus Institutional Database synchronized with 0 data loss.");
  } catch (err) {
    console.error("[CRITICAL_FAILURE]:", err.message);
  }
};

syncSchool();