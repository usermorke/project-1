import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Marcați ruta ca fiind dinamică
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Obțineți datele primite de la client
    const data = await request.json();
    const filePath = path.join(process.cwd(), "checkout-data.json");

    // Verificați dacă fișierul există
    if (!fs.existsSync(filePath)) {
      // Dacă nu există, creați-l și adăugați datele
      fs.writeFileSync(filePath, JSON.stringify([data], null, 2), "utf-8");
      console.log("Fișierul `checkout-data.json` a fost creat.");
    } else {
      // Dacă fișierul există, adăugați datele la cele existente
      const existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      existingData.push(data);

      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf-8");
      console.log("Datele au fost adăugate în `checkout-data.json`.");
    }

    // Log pentru datele primite
    console.log("Datele primite de la utilizator:", data);

    return NextResponse.json({ success: true, message: "Datele au fost salvate cu succes." });
  } catch (error) {
    console.error("Eroare la salvarea datelor:", error);
    return NextResponse.json(
      { success: false, message: "Eroare la salvarea datelor." },
      { status: 500 }
    );
  }
}
