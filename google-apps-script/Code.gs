/**
 * ZED Fragrances: order capture and the admin portal's data.
 *
 * The website's /api/orders route (src/app/api/orders/route.ts) posts every order here. This script
 * adds one row per order to the "Orders" sheet, saves EasyPaisa / JazzCash payment screenshots to a
 * Drive folder (linked from the row) and emails you about the order. The admin portal (/admin) uses
 * it to list orders, change their status and show payment screenshots.
 *
 * Setup: google-apps-script/README.md in the website repository.
 */

// Must be exactly the same as ORDERS_SCRIPT_SECRET in the website's environment variables.
const SECRET = "PASTE_YOUR_SECRET_HERE";

// Email the owner of this sheet about every new order (a free Google account can send 100 a day).
const NOTIFY_BY_EMAIL = true;

const SHEET_NAME = "Orders";
const FOLDER_NAME = "ZED Orders - Payment Screenshots";

// The script writes by position: add your own columns to the right of these, never between them.
const HEADERS = [
  "Date",
  "Order ID",
  "Status",
  "Payment",
  "Name",
  "Phone",
  "City",
  "Address",
  "Notes",
  "Items",
  "Subtotal",
  "Delivery",
  "COD charges",
  "Total",
  "Screenshot",
];
const STATUSES = ["New", "Verify payment", "Confirmed", "Dispatched", "Delivered", "Cancelled"];

/** Every request from the website: a new order, or an admin portal action. */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return reply({ ok: false, error: "Unauthorized" });

    switch (body.action) {
      case "list":
        return reply({ ok: true, orders: listOrders() });
      case "status":
        setStatus(body.id, body.status);
        return reply({ ok: true });
      case "screenshot":
        return reply(Object.assign({ ok: true }, readScreenshot(body.id)));
      default:
        createOrder(body.order);
        return reply({ ok: true });
    }
  } catch (error) {
    console.error(error);
    return reply({ ok: false, error: String(error) });
  }
}

function createOrder(order) {
  const screenshot = order.screenshot ? saveScreenshot(order.id, order.screenshot) : null;
  addRow(order, screenshot);
  if (NOTIFY_BY_EMAIL) notify(order, screenshot);
}

/** All orders, newest first. */
function listOrders() {
  const sheet = getSheet();
  const count = sheet.getLastRow() - 1;
  if (count < 1) return [];

  const range = sheet.getRange(2, 1, count, HEADERS.length);
  const formulas = range.getFormulas();
  return range
    .getValues()
    .map((row, index) => ({
      date: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
      id: String(row[1]),
      status: String(row[2]),
      payment: String(row[3]),
      name: String(row[4]),
      phone: String(row[5]),
      city: String(row[6]),
      address: String(row[7]),
      notes: String(row[8]),
      items: String(row[9]),
      subtotal: Number(row[10]) || 0,
      delivery: Number(row[11]) || 0,
      codFee: Number(row[12]) || 0,
      total: Number(row[13]) || 0,
      screenshot: Boolean(fileId(formulas[index][14])),
    }))
    .filter((order) => order.id)
    .reverse();
}

function setStatus(id, status) {
  if (STATUSES.indexOf(status) === -1) throw new Error("Unknown status: " + status);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    getSheet().getRange(findRow(id), 3).setValue(status);
  } finally {
    lock.releaseLock();
  }
}

/** The order's payment screenshot as base64. Only files linked from the sheet can be read. */
function readScreenshot(id) {
  const file = fileId(getSheet().getRange(findRow(id), 15).getFormula());
  if (!file) throw new Error("No screenshot for " + id);
  const blob = DriveApp.getFileById(file).getBlob();
  return { type: blob.getContentType(), data: Utilities.base64Encode(blob.getBytes()) };
}

function findRow(id) {
  const sheet = getSheet();
  const match = sheet
    .getRange(2, 2, Math.max(sheet.getLastRow() - 1, 1), 1)
    .createTextFinder(String(id))
    .matchEntireCell(true)
    .findNext();
  if (!match) throw new Error("Order not found: " + id);
  return match.getRow();
}

/** Drive file ID from the Screenshot column's =HYPERLINK("https://drive.google.com/file/d/<id>/…") formula. */
function fileId(formula) {
  const match = /\/d\/([\w-]+)/.exec(formula || "");
  return match ? match[1] : null;
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || setup();
}

/** Opening the web app URL in a browser shows this, to check the deployment. */
function doGet() {
  return ContentService.createTextOutput("ZED orders endpoint is running.");
}

/** Run once from the editor: creates the Orders sheet (headers, formats, status dropdown) and the screenshots folder. */
function setup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    const first = spreadsheet.getSheets()[0];
    sheet = first.getLastRow() === 0 ? first.setName(SHEET_NAME) : spreadsheet.insertSheet(SHEET_NAME);
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  sheet.setFrozenRows(1);

  const rows = sheet.getMaxRows() - 1;
  sheet.getRange(2, 1, rows, 1).setNumberFormat("d mmm yyyy, h:mm am/pm");
  sheet.getRange(2, 11, rows, 4).setNumberFormat("#,##0");
  sheet.getRange(2, 8, rows, 3).setWrap(true);
  sheet
    .getRange(2, 3, rows, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());

  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(8, 260);
  sheet.setColumnWidth(10, 260);

  getFolder();
  return sheet;
}

/** Run from the editor to test the sheet, folder and email without the website. Delete the TEST row afterwards. */
function testOrder() {
  const order = {
    id: "TEST-" + Date.now().toString(36).toUpperCase(),
    payment: "Cash on Delivery",
    customer: { name: "Test Customer", phone: "0300-1234567", city: "Lahore", address: "Test address", notes: "Test order" },
    items: "• Test perfume 30ml × 1: Rs 1,000",
    currency: "PKR",
    subtotal: 1000,
    delivery: 150,
    codFee: 50,
    total: 1200,
    screenshot: null,
  };
  const result = doPost({ postData: { contents: JSON.stringify({ secret: SECRET, order: order }) } });
  console.log(result.getContent());
}

function addRow(order, screenshot) {
  const customer = order.customer;
  const row = [
    new Date(),
    order.id,
    screenshot ? "Verify payment" : "New",
    order.payment,
    customer.name,
    customer.phone,
    customer.city,
    customer.address,
    customer.notes,
    order.items,
    order.subtotal,
    order.delivery,
    order.codFee,
    order.total,
  ].map(plain);
  row.push(screenshot ? '=HYPERLINK("' + screenshot.getUrl() + '", "View")' : "");

  // One order at a time, so simultaneous orders never overwrite each other.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    getSheet().appendRow(row);
  } finally {
    lock.releaseLock();
  }
}

/** Customer text that starts like a formula (=, +, -, @) is stored as plain text, never run. */
function plain(value) {
  return typeof value === "string" && /^[=+\-@]/.test(value) ? "'" + value : value;
}

function saveScreenshot(orderId, screenshot) {
  const extension = (screenshot.name.match(/\.\w+$/) || [".jpg"])[0];
  const blob = Utilities.newBlob(Utilities.base64Decode(screenshot.data), screenshot.type, orderId + extension);
  return getFolder().createFile(blob);
}

function getFolder() {
  const properties = PropertiesService.getScriptProperties();
  const id = properties.getProperty("FOLDER_ID");
  if (id) {
    try {
      const existing = DriveApp.getFolderById(id);
      if (!existing.isTrashed()) return existing;
    } catch (error) {
      // Deleted: make a new one below.
    }
  }
  const folder = DriveApp.createFolder(FOLDER_NAME);
  properties.setProperty("FOLDER_ID", folder.getId());
  return folder;
}

function notify(order, screenshot) {
  // The order is already saved: a failed email must not fail it.
  try {
    const customer = order.customer;
    const money = (amount) => order.currency + " " + amount.toLocaleString("en-US");
    const lines = [
      "Order " + order.id + " · " + order.payment,
      "",
      order.items,
      "",
      "Subtotal: " + money(order.subtotal),
      "Delivery: " + money(order.delivery),
      order.codFee ? "COD charges: " + money(order.codFee) : null,
      "Total: " + money(order.total),
      "",
      customer.name,
      customer.phone,
      customer.address + ", " + customer.city,
      customer.notes ? "Notes: " + customer.notes : null,
      "",
      screenshot ? "Payment screenshot: " + screenshot.getUrl() : null,
      "All orders: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    ].filter((line) => line !== null);
    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      "New order " + order.id + " · " + money(order.total) + " · " + order.payment,
      lines.join("\n"),
    );
  } catch (error) {
    console.error("Order email failed", error);
  }
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
