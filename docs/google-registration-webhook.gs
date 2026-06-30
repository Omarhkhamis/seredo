function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || "{}");
    var formType = data.type === "exhibitor" ? "exhibitor" : "visitor";

    delete data.type;

    var result =
      formType === "exhibitor"
        ? registerExhibitor(data)
        : registerVisitor(data);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        message: error && error.message ? error.message : "Registration failed"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
