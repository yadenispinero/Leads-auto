// ==========================================
// MANTENIMIENTO DE LA HOJA "CANDIDATAS"
// ==========================================
// Nota: procesarCandidatasPendientes() y el envío a n8n se quitaron —
// n8n ahora se conecta de forma independiente a leer "Candidatas" por su cuenta
// (arquitectura "pull", no "push"). N8NClient.gs debe eliminarse del proyecto.

function limpiarCandidatasProcesadas() {
  const sheet = SpreadsheetApp.openById(ID_HOJA_CANDIDATAS).getSheetByName(NOMBRE_HOJA_CANDIDATAS);
  const data = sheet.getDataRange().getValues();
  let eliminadas = 0;
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][CAND_COL_ESTADO] === 'Procesado') {
      sheet.deleteRow(i + 1);
      eliminadas++;
    }
  }
  Logger.log(`🧹 ${eliminadas} fila(s) procesada(s) eliminada(s).`);
}