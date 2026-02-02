function doGet(e) {
  var searchName = e.parameter.name;
  if (!searchName) return ContentService.createTextOutput(JSON.stringify({found:false, message:"System Ready"}));

  try {
    var result = findStudent(searchName);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({found:false, message:err.toString()}));
  }
}

function findStudent(searchName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  // CONFIGURATION
  var ROW_HEADERS = 0;       
  var ROW_MAX = 1;           
  var ROW_AVG = 3;           
  var ROW_MEDIAN = 4;        
  var ROW_STUDENT_START = 8; 

  var headers = data[ROW_HEADERS];
  var maxRow = data[ROW_MAX];

  // Auto-detect Total Column
  var COL_TOTAL = -1;
  for (var c = 0; c < headers.length; c++) {
    if (String(headers[c]).trim().toLowerCase() === "total") {
      COL_TOTAL = c;
      break;
    }
  }
  if (COL_TOTAL === -1) COL_TOTAL = 17;

  for (var i = ROW_STUDENT_START; i < data.length; i++) {
    var row = data[i];
    // Column 1 is typically Name, Column 0 was ID
    var currentName = String(row[1]).trim().toLowerCase();
    
    // Compare inputs (case-insensitive)
    if (currentName == String(searchName).trim().toLowerCase()) {
      var studentResult = [];
      var studentTotal = parseFloat(row[COL_TOTAL]) || 0;
      var totalMax = (maxRow[COL_TOTAL]) ? maxRow[COL_TOTAL] : 100;

      for (var j = 2; j < headers.length; j++) {
        var h = String(headers[j]);
        if (h !== "" && h !== "Total" && h !== "Total Curved" && h !== "Final Curved") {
          var s = row[j];
          var m = (maxRow[j]) ? maxRow[j] : 100;
          
          studentResult.push({
            category: h,
            score: s,
            max: m,
            avg: (data[ROW_AVG] && data[ROW_AVG][j]) ? data[ROW_AVG][j] : 0,
            median: (data[ROW_MEDIAN] && data[ROW_MEDIAN][j]) ? data[ROW_MEDIAN][j] : 0
          });
        }
      }

      return {
        found: true,
        studentName: row[1], // Return the original casing from the sheet
        data: studentResult,
        totalScore: studentTotal,
        totalMax: totalMax,
        lastUpdated: new Date().toLocaleDateString()
      };
    }
  }
  return { found: false };
}
