export type CsvOracion = {
  titulo: string;
  texto: string;
  categoria: string;
};

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function parseOracionesCsv(content: string): CsvOracion[] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;
  const csv = content.replace(/^\uFEFF/, "");

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);

  if (inQuotes) {
    throw new Error("CSV invalido: hay comillas sin cerrar");
  }

  if (rows.length < 2) {
    throw new Error("El CSV debe incluir cabecera y al menos una oracion");
  }

  const headers = rows[0].map(normalizeHeader);
  const tituloIndex = headers.indexOf("titulo");
  const textoIndex = headers.indexOf("texto");
  const categoriaIndex = headers.indexOf("categoria");

  if (tituloIndex === -1 || textoIndex === -1 || categoriaIndex === -1) {
    throw new Error("El CSV debe tener columnas: titulo,texto,categoria");
  }

  return rows.slice(1).map((csvRow, index) => {
    const oracion = {
      titulo: csvRow[tituloIndex]?.trim() || "",
      texto: csvRow[textoIndex]?.trim() || "",
      categoria: csvRow[categoriaIndex]?.trim() || "",
    };

    if (!oracion.titulo || !oracion.texto || !oracion.categoria) {
      throw new Error(`Fila ${index + 2}: titulo, texto y categoria son obligatorios`);
    }

    return oracion;
  });
}
