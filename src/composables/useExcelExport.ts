import * as XLSX from 'xlsx';

export function useExcelExport() {

  const exportToExcel = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    // 1. Crear una hoja de trabajo (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Crear un libro de trabajo (Workbook)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // 3. Generar el archivo y forzar la descarga
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return {
    exportToExcel,
  };
}
