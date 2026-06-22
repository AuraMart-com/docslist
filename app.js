import { initializeApp } from "firebase/app";
import { getFirestore, doc as fbDoc, setDoc, getDocs, collection, deleteDoc, updateDoc } from "firebase/firestore";

// ==========================================
// CRITICAL: WIRE UP YOUR LINKS HERE
// ==========================================
const BACKEND_API_URL = "https://script.google.com/macros/s/AKfycbzkNtjvOnmkexRXk_2j-wjUI98MTUcLy0VviSDqAHnpabgmolx6MUOdOi5ZCe1AFEgE/exec";

// Firebase App Configuration (Migrated from Google Sheets CSV listings)
const firebaseConfig = {
    apiKey: "AIzaSyCn1rzZx2kSi_ak7y8aTN22ChnTtQK5XR8",
    authDomain: "hybrid-decoder-071nt.firebaseapp.com",
    projectId: "hybrid-decoder-071nt",
    storageBucket: "hybrid-decoder-071nt.firebasestorage.app",
    messagingSenderId: "650480695500",
    appId: "1:650480695500:web:e6d740b2c31c5f2e1cea69"
};

// Initialize Firebase with custom Firestore database ID
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-f6532a40-48fa-408f-9e18-25d0101ad095");


        const DEFAULT_CATEGORIES = [];

        // =========================================================================
        // SYSTEM DIAGNOSTICS: Google Apps Script Web App Validator & Setup Guide
        // =========================================================================
        function validateBackendConnection() {
            const url = BACKEND_API_URL;
            const banner = document.getElementById('backendDiagnosticBanner');
            if (!banner) return;

            let isInvalid = false;
            if (!url || url.startsWith("PASTE_") || url.trim() === "") {
                isInvalid = true;
            } else if (url.includes("/macros/library/")) {
                isInvalid = true;
            } else if (url.includes("/edit")) {
                isInvalid = true;
            } else if (url.includes("/d/")) {
                isInvalid = true;
            } else if (!url.includes("/macros/s/") || !url.includes("/exec")) {
                isInvalid = true;
            }

            if (isInvalid) {
                banner.style.display = "block";
                
                // Populate Apps Script template area
                const templateArea = document.getElementById('appsScriptTemplateArea');
                if (templateArea) {
                    templateArea.value = `// =========================================================================\n` +
                        `// GOOGLE APPS SCRIPT: FULL SYNC BACKEND FOR SECURED VAULT\n` +
                        `// =========================================================================\n` +
                        `// 1. Set your Drive folder ID where uploaded files will be stored:\n` +
                        `const TARGET_DRIVE_FOLDER_ID = "1rbR0YnwU_9tPmeFqyhIR0mZVjFIYx6Sy";\n\n` +
                        `// 2. Set your Google Spreadsheet ID (or leave blank if container-bound):\n` +
                        `const TARGET_SPREADSHEET_ID = ""; \n\n` +
                        `function getSpreadsheet() {\n` +
                        `  if (TARGET_SPREADSHEET_ID && TARGET_SPREADSHEET_ID !== "YOUR_SPREADSHEET_ID_HERE") {\n` +
                        `    return SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);\n` +
                        `  }\n` +
                        `  try {\n` +
                        `    return SpreadsheetApp.getActiveSpreadsheet();\n` +
                        `  } catch (e) {\n` +
                        `    return null;\n` +
                        `  }\n` +
                        `}\n\n` +
                        `function doPost(e) {\n` +
                        `  try {\n` +
                        `    var payload = JSON.parse(e.postData.contents);\n` +
                        `    var action = payload.action || "upload";\n` +
                        `    var folder = DriveApp.getFolderById(TARGET_DRIVE_FOLDER_ID);\n\n` +
                        `    if (action === "delete") {\n` +
                        `      // A. Delete file/folder from Google Drive\n` +
                        `      if (payload.driveLink && payload.driveLink.indexOf("http") === 0) {\n` +
                        `        var assetId = extractIdFromUrl(payload.driveLink);\n` +
                        `        if (assetId) {\n` +
                        `          try {\n` +
                        `            if (payload.assetType === "Folder") {\n` +
                        `              DriveApp.getFolderById(assetId).setTrashed(true);\n` +
                        `            } else {\n` +
                        `              DriveApp.getFileById(assetId).setTrashed(true);\n` +
                        `            }\n` +
                        `          } catch (errDrive) { /* assets might already be gone */ }\n` +
                        `        }\n` +
                        `      }\n\n` +
                        `      // B. Remove matching row from Google Sheet\n` +
                        `      var ss = getSpreadsheet();\n` +
                        `      if (ss) {\n` +
                        `        var assetType = payload.assetType || "File";\n` +
                        `        var sheetName = assetType === "Folder" ? getSheetNameForFolders(ss) : getSheetNameForFiles(ss);\n` +
                        `        var sheet = ss.getSheetByName(sheetName);\n` +
                        `        if (sheet) {\n` +
                        `          var data = sheet.getDataRange().getValues();\n` +
                        `          var idColIdx = findHeaderColumnIndex(data[0], "id");\n` +
                        `          if (idColIdx !== -1) {\n` +
                        `            for (var i = data.length - 1; i >= 1; i--) {\n` +
                        `              if (String(data[i][idColIdx]).trim() === String(payload.id).trim()) {\n` +
                        `                sheet.deleteRow(i + 1);\n` +
                        `              }\n` +
                        `            }\n` +
                        `          }\n` +
                        `        }\n` +
                        `      }\n` +
                        `      return createJsonResponse({ status: "SUCCESS", message: "Deleted from Drive and spreadsheet" });\n` +
                        `    }\n\n` +
                        `    if (action === "rename") {\n` +
                        `      // A. Rename in Google Drive\n` +
                        `      if (payload.driveLink && payload.driveLink.indexOf("http") === 0) {\n` +
                        `        var assetId = extractIdFromUrl(payload.driveLink);\n` +
                        `        if (assetId) {\n` +
                        `          try {\n` +
                        `            if (payload.assetType === "Folder") {\n` +
                        `              DriveApp.getFolderById(assetId).setName(payload.title);\n` +
                        `            } else {\n` +
                        `              DriveApp.getFileById(assetId).setName(payload.title);\n` +
                        `            }\n` +
                        `          } catch (errDrive) { }\n` +
                        `        }\n` +
                        `      }\n\n` +
                        `      // B. Rename in Google Sheets\n` +
                        `      var ss = getSpreadsheet();\n` +
                        `      if (ss) {\n` +
                        `        var assetType = payload.assetType || "File";\n` +
                        `        var sheetName = assetType === "Folder" ? getSheetNameForFolders(ss) : getSheetNameForFiles(ss);\n` +
                        `        var sheet = ss.getSheetByName(sheetName);\n` +
                        `        if (sheet) {\n` +
                        `          var data = sheet.getDataRange().getValues();\n` +
                        `          var idColIdx = findHeaderColumnIndex(data[0], "id");\n` +
                        `          var titleColIdx = findHeaderColumnIndex(data[0], "title") !== -1 ? findHeaderColumnIndex(data[0], "title") : findHeaderColumnIndex(data[0], "name");\n` +
                        `          if (idColIdx !== -1 && titleColIdx !== -1) {\n` +
                        `            for (var i = 1; i < data.length; i++) {\n` +
                        `              if (String(data[i][idColIdx]).trim() === String(payload.id).trim()) {\n` +
                        `                sheet.getRange(i + 1, titleColIdx + 1).setValue(payload.title);\n` +
                        `                break;\n` +
                        `              }\n` +
                        `            }\n` +
                        `          }\n` +
                        `        }\n` +
                        `      }\n` +
                        `      return createJsonResponse({ status: "SUCCESS", message: "Asset renamed in Drive and sheets" });\n` +
                        `    }\n\n` +
                        `    // Default Action: Upload / Add Row\n` +
                        `    var driveLink = payload.driveLink || "javascript:void(0)";\n\n` +
                        `    if (payload.assetType === "Folder") {\n` +
                        `      if (driveLink === "javascript:void(0)") {\n` +
                        `        var newFolder = folder.createFolder(payload.folderName);\n` +
                        `        newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);\n` +
                        `        driveLink = newFolder.getUrl();\n` +
                        `      }\n` +
                        `    } else {\n` +
                        `      if (payload.fileBase64 && payload.fileBase64 !== "EMPTY_FOLDER" && driveLink === "javascript:void(0)") {\n` +
                        `        var base64Data = payload.fileBase64;\n` +
                        `        if (base64Data.indexOf(",") > -1) {\n` +
                        `          base64Data = base64Data.split(",")[1];\n` +
                        `        }\n` +
                        `        var decodedBytes = Utilities.base64Decode(base64Data);\n` +
                        `        var blob = Utilities.newBlob(decodedBytes, payload.fileType || "application/octet-stream", payload.fileName);\n` +
                        `        var file = folder.createFile(blob);\n` +
                        `        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);\n` +
                        `        driveLink = file.getUrl();\n` +
                        `      }\n` +
                        `    }\n\n` +
                        `    // Write row to Google Sheet\n` +
                        `    var ss = getSpreadsheet();\n` +
                        `    if (ss) {\n` +
                        `      var assetType = payload.assetType || "File";\n` +
                        `      var sheetName = assetType === "Folder" ? getSheetNameForFolders(ss) : getSheetNameForFiles(ss);\n` +
                        `      var sheet = ss.getSheetByName(sheetName);\n` +
                        `      if (!sheet) {\n` +
                        `        if (assetType === "Folder") {\n` +
                        `          sheet = ss.insertSheet("Folders");\n` +
                        `          sheet.appendRow(["id", "title", "category", "parentFolder", "description", "driveLink", "assetType"]);\n` +
                        `        } else {\n` +
                        `          sheet = ss.getSheets()[0];\n` +
                        `        }\n` +
                        `      }\n\n` +
                        `      var headers = sheet.getDataRange().getValues()[0];\n` +
                        `      var newRow = [];\n` +
                        `      for (var i = 0; i < headers.length; i++) {\n` +
                        `        var header = headers[i].toString().toLowerCase().replace(/[^a-z0-9]/g, "");\n` +
                        `        if (header === "id") {\n` +
                        `          newRow.push(payload.id);\n` +
                        `        } else if (header === "title" || header === "filename" || header === "name" || header === "foldername") {\n` +
                        `          newRow.push(payload.title || payload.fileName);\n` +
                        `        } else if (header === "category" || header === "filecategory") {\n` +
                        `          newRow.push(payload.category || (assetType === "Folder" ? "Directory" : "Other"));\n` +
                        `        } else if (header === "description" || header === "filedescription" || header === "desc") {\n` +
                        `          newRow.push(payload.description || "");\n` +
                        `        } else if (header === "drivelink" || header === "link" || header === "url" || header === "fileurl") {\n` +
                        `          newRow.push(driveLink);\n` +
                        `        } else if (header === "parentfolder" || header === "parenfolder" || header === "parent" || header === "parentid") {\n` +
                        `          newRow.push(payload.parentFolder || "root");\n` +
                        `        } else if (header === "assettype" || header === "type") {\n` +
                        `          newRow.push(assetType);\n` +
                        `        } else {\n` +
                        `          newRow.push("");\n` +
                        `        }\n` +
                        `      }\n` +
                        `      sheet.appendRow(newRow);\n` +
                        `    }\n\n` +
                        `    return createJsonResponse({\n` +
                        `      status: "SUCCESS",\n` +
                        `      driveLink: driveLink\n` +
                        `    });\n` +
                        `  } catch (err) {\n` +
                        `    return createJsonResponse({ status: "ERROR", message: err.toString() });\n` +
                        `  }\n` +
                        `}\n\n` +
                        `function extractIdFromUrl(url) {\n` +
                        `  var match = url.match(/[-\\w]{25,}/);\n` +
                        `  return match ? match[0] : null;\n` +
                        `}\n\n` +
                        `function getSheetNameForFiles(ss) {\n` +
                        `  var sheets = ss.getSheets();\n` +
                        `  for (var i = 0; i < sheets.length; i++) {\n` +
                        `    var name = sheets[i].getName();\n` +
                        `    if (name.toLowerCase().indexOf("file") > -1) return name;\n` +
                        `  }\n` +
                        `  return sheets[0].getName();\n` +
                        `}\n\n` +
                        `function getSheetNameForFolders(ss) {\n` +
                        `  var sheets = ss.getSheets();\n` +
                        `  for (var i = 0; i < sheets.length; i++) {\n` +
                        `    var name = sheets[i].getName();\n` +
                        `    if (name.toLowerCase().indexOf("folder") > -1) return name;\n` +
                        `  }\n` +
                        `  if (sheets.length > 1) return sheets[1].getName();\n` +
                        `  return sheets[0].getName();\n` +
                        `}\n\n` +
                        `function findHeaderColumnIndex(headers, targetName) {\n` +
                        `  for (var i = 0; i < headers.length; i++) {\n` +
                        `    if (headers[i].toString().toLowerCase().replace(/[^a-z0-9]/g, "") === targetName) {\n` +
                        `      return i;\n` +
                        `    }\n` +
                        `  }\n` +
                        `  return -1;\n` +
                        `}\n\n` +
                        `function doGet(e) {\n` +
                        `  return createJsonResponse({ status: "SUCCESS", message: "Endpoint active" });\n` +
                        `}\n\n` +
                        `function createJsonResponse(data) {\n` +
                        `  return ContentService.createTextOutput(JSON.stringify(data))\n` +
                        `    .setMimeType(ContentService.MimeType.JSON);\n` +
                        `}`;
                }
            } else {
                banner.style.display = "none";
            }
        }

        window.toggleDiagnosticDetails = function() {
            const details = document.getElementById('diagnosticDetails');
            const btn = document.querySelector('.diagnostic-toggle-btn');
            if (details && btn) {
                if (details.style.display === "none") {
                    details.style.display = "block";
                    btn.innerText = "[HIDE DETAILED STEPS/CODE]";
                } else {
                    details.style.display = "none";
                    btn.innerText = "[SHOW DETAILED STEPS/CODE]";
                }
            }
        };

        window.copyAppsScriptTemplate = function() {
            const copyText = document.getElementById("appsScriptTemplateArea");
            if (copyText) {
                copyText.select();
                copyText.setSelectionRange(0, 99999);
                try {
                    navigator.clipboard.writeText(copyText.value);
                    showToast("Apps Script template copied to clipboard!", "success");
                } catch (err) {
                    document.execCommand("copy");
                    showToast("Apps Script template copied to clipboard!", "success");
                }
            }
        };

        let fileInventory = [];
        let folderInventory = [];

        // No mock fallback assets - completely empty and clean production slate
        const MOCK_SEEDS = [];

        // Modern custom Toast notification system
        window.showToast = function(message, type = 'success') {
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                document.body.appendChild(container);
            }

            const card = document.createElement('div');
            card.className = `toast-card ${type}`;
            
            let icon = 'ℹ️';
            if (type === 'success') {
                icon = '✅';
            } else if (type === 'error') {
                icon = '❌';
            } else if (type === 'info') {
                icon = '🔔';
            }

            card.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${icon}</span>
                    <span class="toast-message">${message}</span>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
            `;

            container.appendChild(card);
            
            // Trigger animation frame for transition
            requestAnimationFrame(() => {
                card.classList.add('active');
            });

            // Auto dismiss after 4 seconds
            setTimeout(() => {
                card.classList.remove('active');
                card.addEventListener('transitionend', () => {
                    card.remove();
                });
            }, 4000);
        };

        // 1. Fetch data from Google Sheets CSV on load with offline safety fallback
        async function fetchDatabase() {
            validateBackendConnection();
            const searchBox = document.getElementById('searchBox');
            const syncStatus = document.getElementById('syncStatus');
            
            try {
                // Fetch both feeds concurrently from custom named Firestore database
                const [filesSnapshot, foldersSnapshot] = await Promise.all([
                    getDocs(collection(db, "files")),
                    getDocs(collection(db, "folders"))
                ]);
                
                fileInventory = [];
                filesSnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    fileInventory.push({
                        id: docSnap.id,
                        title: data.title || "",
                        category: data.category || "Other",
                        parentFolder: data.parentFolder || "root",
                        description: data.description || "",
                        driveLink: data.driveLink || "javascript:void(0)",
                        assetType: "File",
                        fileSize: data.fileSize || "N/A"
                    });
                });

                folderInventory = [];
                foldersSnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    folderInventory.push({
                        id: docSnap.id,
                        title: data.title || "",
                        category: "Directory",
                        parentFolder: data.parentFolder || "root",
                        description: data.description || "",
                        driveLink: data.driveLink || "javascript:void(0)",
                        assetType: "Folder"
                    });
                });
                
                if (syncStatus) {
                    syncStatus.className = "sync-status online";
                    syncStatus.innerHTML = `● CLOUD SYNCED`;
                    syncStatus.title = "Connected securely to Firestore NoSQL cloud database.";
                }

                if (searchBox) {
                    searchBox.disabled = false;
                    searchBox.placeholder = "Search by file name, category, or descriptions...";
                }
                renderVault();
            } catch (err) {
                console.error("Firebase Cloud sync offline:", err);
                
                // Clear the displays so we do not pretend to show a fake sandbox list
                fileInventory = [];
                folderInventory = [];

                if (syncStatus) {
                    syncStatus.className = "sync-status offline";
                    syncStatus.innerHTML = `● SYNC OFFLINE`;
                    syncStatus.title = "Unable to connect to Firebase database. Error: " + err.message;
                }

                if (searchBox) {
                    searchBox.disabled = true;
                    searchBox.placeholder = "Search disabled (database offline)...";
                }
                
                showToast("Firebase cloud sync error: " + err.message, "error");
                renderVault();
            }
        }

        // Lightweight safe row splitter
        function parseCSVContent(text, defaultType) {
            const results = [];
            let row = [];
            let cell = "";
            let inQuotes = false;
            
            const len = text.length;
            for (let i = 0; i < len; i++) {
                const char = text[i];
                const nextChar = text[i + 1];
                
                if (char === '"' || char === "'") {
                    if (inQuotes && nextChar === char) {
                        cell += char;
                        i++; // Skip escape quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    row.push(cell);
                    cell = "";
                } else if ((char === '\r' || char === '\n') && !inQuotes) {
                    if (char === '\r' && nextChar === '\n') {
                        i++; // Skip LF
                    }
                    row.push(cell);
                    results.push(row);
                    row = [];
                    cell = "";
                } else {
                    cell += char;
                }
            }
            if (cell || row.length > 0) {
                row.push(cell);
                results.push(row);
            }
            
            if (results.length < 1) return [];
            
            const headers = results[0].map(h => h.trim().replace(/^["']|["']$/g, ""));
            const parsedArray = [];
            
            for (let i = 1; i < results.length; i++) {
                const currentLine = results[i];
                if (currentLine.length === 0 || (currentLine.length === 1 && !currentLine[0].trim())) continue;
                
                const obj = {};
                headers.forEach((header, idx) => {
                    let value = currentLine[idx] ? currentLine[idx].trim() : "";
                    const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "");
                    
                    // Route common variation synonyms to standardized runtime keys
                    if (lowerHeader === 'id') {
                        obj.id = value;
                    } else if (lowerHeader === 'title' || lowerHeader === 'filename' || lowerHeader === 'name' || lowerHeader === 'foldername') {
                        obj.title = value;
                    } else if (lowerHeader === 'category' || lowerHeader === 'filecategory') {
                        obj.category = value;
                    } else if (lowerHeader === 'description' || lowerHeader === 'filedescription' || lowerHeader === 'desc') {
                        obj.description = value;
                    } else if (lowerHeader === 'drivelink' || lowerHeader === 'link' || lowerHeader === 'url' || lowerHeader === 'fileurl') {
                        obj.driveLink = value;
                    } else if (lowerHeader === 'parentfolder' || lowerHeader === 'parenfolder' || lowerHeader === 'parent' || lowerHeader === 'parentid') {
                        obj.parentFolder = value;
                    } else if (lowerHeader === 'assettype' || lowerHeader === 'type') {
                        obj.assetType = value;
                    } else {
                        // Maintain fallback original key as well
                        obj[header] = value;
                    }
                });
                
                // If title/name is empty or blank, skip this row as it represents an empty/incomplete record
                if (!obj.title || !obj.title.trim()) {
                    continue;
                }

                // Normalize and set robust defaults
                obj.id = obj.id || ("VAL-" + Math.floor(1000 + Math.random() * 9000));
                obj.title = obj.title; // Keep original parsed title
                obj.category = obj.category || (defaultType === 'Folder' ? "Directory" : "Other");
                obj.description = obj.description || "";
                obj.driveLink = obj.driveLink || (defaultType === 'Folder' ? "javascript:void(0)" : "javascript:void(0)");
                
                // Map parent folder hierarchy, default to root
                obj.parentFolder = obj.parentFolder || "root";
                obj.assetType = obj.assetType || defaultType;

                parsedArray.push(obj);
            }
            return parsedArray;
        }

        // Helper to check folder details
        function getActiveFolderName(folderId) {
            if (folderId === 'root') return 'Root';
            const folderDoc = folderInventory.find(item => item.id === folderId);
            return folderDoc ? folderDoc.title : 'Unidentified Folder';
        }

        // Folder file/item count helper (counts nested files & folders inside an active folder ID)
        function getFolderFileCount(folderId) {
            const filesCount = fileInventory.filter(item => (item.parentFolder || 'root') === folderId).length;
            const foldersCount = folderInventory.filter(item => (item.parentFolder || 'root') === folderId).length;
            return filesCount + foldersCount;
        }

        // Render breadcrumbs navigation row traversed upwards from activeFolderId
        function renderBreadcrumbs() {
            const container = document.getElementById('breadcrumbs');
            if (!container) return;

            const urlParams = new URLSearchParams(window.location.search);
            const activeFolderId = urlParams.get('folder') || 'root';

            const trail = [];
            let currentId = activeFolderId;
            let loopGuard = 0;

            while (currentId && currentId !== 'root' && loopGuard < 50) {
                loopGuard++;
                const folderDoc = folderInventory.find(item => item.id === currentId);
                if (folderDoc) {
                    trail.unshift(folderDoc);
                    currentId = folderDoc.parentFolder || 'root';
                } else {
                    break;
                }
            }

            let markup = `<span class="breadcrumb-item" onclick="window.location.search = '?folder=root'">📁 ROOT</span>`;

            trail.forEach((folderDoc, index) => {
                markup += ` <span class="breadcrumb-separator">/</span> `;
                if (index === trail.length - 1) {
                    markup += `<span class="breadcrumb-current">${folderDoc.title.toUpperCase()}</span>`;
                } else {
                    markup += `<span class="breadcrumb-item" onclick="window.location.search = '?folder=' + encodeURIComponent('${folderDoc.id}')">${folderDoc.title.toUpperCase()}</span>`;
                }
            });

            container.innerHTML = markup;
        }

        // Navigation actions
        window.openFolder = function(folderId) {
            window.location.search = '?folder=' + folderId;
        };

        window.navigateHome = function() {
            window.location.search = '?folder=root';
        };

        window.navigateBack = function() {
            const urlParams = new URLSearchParams(window.location.search);
            const activeFolderId = urlParams.get('folder') || 'root';
            if (activeFolderId === 'root') return;

            const folderDoc = folderInventory.find(item => item.id === activeFolderId);
            const parentId = folderDoc ? (folderDoc.parentFolder || 'root') : 'root';
            window.location.search = '?folder=' + parentId;
        };

        window.refreshDatabase = async function() {
            const refreshBtn = document.getElementById('navRefreshBtn');
            if (refreshBtn) {
                refreshBtn.classList.add('loading');
            }
            try {
                await fetchDatabase();
            } catch (e) {
                console.error("Database query sync failed:", e);
            } finally {
                if (refreshBtn) {
                    refreshBtn.classList.remove('loading');
                }
            }
        };

        // Render matching vault records or directory contents
        function renderVault(filterTerm = "") {
            const grid = document.getElementById('vaultGrid');
            if (!grid) return;
            
            grid.innerHTML = "";
            const term = filterTerm.toLowerCase().trim();

            const urlParams = new URLSearchParams(window.location.search);
            const activeFolderId = urlParams.get('folder') || 'root';

            // Dynamic nav controls button state updating
            const homeBtn = document.getElementById('navHomeBtn');
            const backBtn = document.getElementById('navBackBtn');
            if (homeBtn) {
                homeBtn.disabled = (activeFolderId === 'root');
            }
            if (backBtn) {
                backBtn.disabled = (activeFolderId === 'root');
            }

            // Sync clipboard indicator UI
            if (typeof updateClipboardUI === "function") {
                updateClipboardUI();
            }

            // If searched, flat render ALL matching records globally
            if (term.length > 0) {
                // Hide breadcrumbs container when searching globally
                const breadcrumbsEl = document.getElementById('breadcrumbs');
                if (breadcrumbsEl) {
                    breadcrumbsEl.style.display = 'none';
                }

                // GLOBAL SEARCH: Filter ONLY the 'fileInventory' array globally
                const matches = fileInventory.filter(doc => {
                    return (doc.title && doc.title.toLowerCase().includes(term)) ||
                           (doc.category && doc.category.toLowerCase().includes(term)) ||
                           (doc.description && doc.description.toLowerCase().includes(term));
                });

                if (matches.length === 0) {
                    grid.innerHTML = `<p style="color: var(--text-muted)">No File or Folder matching your search query.</p>`;
                    return;
                }

                matches.forEach(doc => {
                    const card = document.createElement('div');
                    card.className = 'doc-card';
                    card.onclick = (e) => {
                        if (e.target.closest('.card-options-container') || e.target.closest('.card-checkbox-wrapper')) return;
                        openFileSystemFile(doc.driveLink, doc.title, doc.id);
                    };
                    const parentName = getActiveFolderName(doc.parentFolder || 'root');
                    const isChecked = selectedItems.some(it => it.id === doc.id);
                    card.innerHTML = `
                        <div class="card-checkbox-wrapper" onclick="event.stopPropagation()">
                            <input type="checkbox" class="card-select-checkbox" data-id="${doc.id}" data-type="file" onchange="toggleCardSelection(this)" ${isChecked ? 'checked' : ''}>
                        </div>
                        <div class="file-icon">📄</div>
                        <div class="doc-meta" style="flex: 1;">
                            <h3 title="${doc.title || "Unidentified Asset"}">${doc.title || "Unidentified Asset"}</h3>
                            ${doc.category ? `<p><strong>Category Tag:</strong> ${doc.category}</p>` : ""}
                            <p><strong>Description:</strong> ${doc.description || "None"}</p>
                            <span class="tag-pill">📂 ${parentName}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="card-options-container" onclick="event.stopPropagation()">
                                <button class="card-options-btn" onclick="toggleCardOptions(event, 'match-${doc.id}')" title="More options">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                                </button>
                                <div id="match-${doc.id}-menu" class="options-dropdown-menu">
                                    <button class="options-dropdown-item" onclick="viewDetails(event, 'file', '${doc.id}')">🔬 Details</button>
                                    <button class="options-dropdown-item" onclick="triggerEdit(event, 'file', '${doc.id}')">📝 Edit</button>
                                    <button class="options-dropdown-item" onclick="copyItem(event, 'file', '${doc.id}')">📋 Copy</button>
                                    <button class="options-dropdown-item" onclick="triggerMove(event, 'file', '${doc.id}')">🚚 Move</button>
                                    <button class="options-dropdown-item" onclick="triggerRename(event, 'file', '${doc.id}')">✏️ Rename</button>
                                    <button class="options-dropdown-item" onclick="downloadFileDirectly(event, '${doc.id}')">💾 Download</button>
                                    <button class="options-dropdown-item delete-item" onclick="triggerDelete(event, 'file', '${doc.id}')">🗑️ Delete</button>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
                return;
            }

            // Normal Folder View navigation (Filtered using active folder parameters)
            const breadcrumbsEl = document.getElementById('breadcrumbs');
            if (breadcrumbsEl) {
                breadcrumbsEl.style.display = 'flex';
            }
            renderBreadcrumbs();

            // Display ONLY items whose parentFolder matches our active folder parameter ID exactly
            const folders = folderInventory.filter(item => {
                const parent = item.parentFolder || 'root';
                return parent === activeFolderId;
            });

            const files = fileInventory.filter(item => {
                const parent = item.parentFolder || 'root';
                return parent === activeFolderId;
            });

            if (folders.length === 0 && files.length === 0) {
                grid.innerHTML = `<p style="color: var(--text-muted); padding: 20px 0;">THIS FOLDER IS CURRENTLY EMPTY.</p>`;
                return;
            }

            // 1. Render subfolders (📁 icon)
            folders.forEach(fold => {
                const fileCount = getFolderFileCount(fold.id);
                const isChecked = selectedItems.some(it => it.id === fold.id);
                const card = document.createElement('div');
                card.className = 'folder-card';
                card.onclick = (e) => {
                    if (e.target.closest('.card-options-container') || e.target.closest('.card-checkbox-wrapper')) return;
                    window.location.search = '?folder=' + fold.id;
                };
                card.innerHTML = `
                    <div class="card-checkbox-wrapper" onclick="event.stopPropagation()">
                        <input type="checkbox" class="card-select-checkbox" data-id="${fold.id}" data-type="folder" onchange="toggleCardSelection(this)" ${isChecked ? 'checked' : ''}>
                    </div>
                    <div class="folder-icon">📁</div>
                    <div class="folder-meta">
                        <h3 title="${fold.title}">${fold.title}</h3>
                        <p>${fileCount} ${fileCount === 1 ? 'item' : 'items'}</p>
                    </div>
                    <div class="card-options-container" onclick="event.stopPropagation()">
                        <button class="card-options-btn" onclick="toggleCardOptions(event, 'fold-${fold.id}')" title="More options">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                        </button>
                        <div id="fold-${fold.id}-menu" class="options-dropdown-menu">
                            <button class="options-dropdown-item" onclick="viewDetails(event, 'folder', '${fold.id}')">🔬 Details</button>
                            <button class="options-dropdown-item" onclick="triggerEdit(event, 'folder', '${fold.id}')">📝 Edit</button>
                            <button class="options-dropdown-item" onclick="copyItem(event, 'folder', '${fold.id}')">📋 Copy</button>
                            <button class="options-dropdown-item" onclick="triggerMove(event, 'folder', '${fold.id}')">🚚 Move</button>
                            <button class="options-dropdown-item" onclick="triggerRename(event, 'folder', '${fold.id}')">✏️ Rename</button>
                            <button class="options-dropdown-item delete-item" onclick="triggerDelete(event, 'folder', '${fold.id}')">🗑️ Delete</button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });

            // 2. Render files (📄 icon)
            files.forEach(doc => {
                const isChecked = selectedItems.some(it => it.id === doc.id);
                const card = document.createElement('div');
                card.className = 'doc-card';
                card.onclick = (e) => {
                    if (e.target.closest('.card-options-container') || e.target.closest('.card-checkbox-wrapper')) return;
                    openFileSystemFile(doc.driveLink, doc.title, doc.id);
                };
                card.innerHTML = `
                    <div class="card-checkbox-wrapper" onclick="event.stopPropagation()">
                        <input type="checkbox" class="card-select-checkbox" data-id="${doc.id}" data-type="file" onchange="toggleCardSelection(this)" ${isChecked ? 'checked' : ''}>
                    </div>
                    <div class="file-icon">📄</div>
                    <div class="doc-meta" style="flex: 1;">
                        <h3 title="${doc.title || "Unidentified Asset"}">${doc.title || "Unidentified Asset"}</h3>
                        ${doc.category ? `<p><strong>Category Tag:</strong> ${doc.category}</p>` : ""}
                        <p><strong>Description:</strong> ${doc.description || "None"}</p>
                        <span class="tag-pill">📂 ${getActiveFolderName(activeFolderId)}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="card-options-container" onclick="event.stopPropagation()">
                            <button class="card-options-btn" onclick="toggleCardOptions(event, 'file-${doc.id}')" title="More options">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                            </button>
                            <div id="file-${doc.id}-menu" class="options-dropdown-menu">
                                <button class="options-dropdown-item" onclick="viewDetails(event, 'file', '${doc.id}')">🔬 Details</button>
                                <button class="options-dropdown-item" onclick="triggerEdit(event, 'file', '${doc.id}')">📝 Edit</button>
                                <button class="options-dropdown-item" onclick="copyItem(event, 'file', '${doc.id}')">📋 Copy</button>
                                <button class="options-dropdown-item" onclick="triggerMove(event, 'file', '${doc.id}')">🚚 Move</button>
                                <button class="options-dropdown-item" onclick="triggerRename(event, 'file', '${doc.id}')">✏️ Rename</button>
                                <button class="options-dropdown-item" onclick="downloadFileDirectly(event, '${doc.id}')">💾 Download</button>
                                <button class="options-dropdown-item delete-item" onclick="triggerDelete(event, 'file', '${doc.id}')">🗑️ Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Dynamically compile category value representation matching the current directory path
        function populateCategoryOptions() {
            const categoryInput = document.getElementById('fileCategory');
            const categoryDisplay = document.getElementById('fileCategoryDisplay');
            if (!categoryInput) return;

            const urlParams = new URLSearchParams(window.location.search);
            const activeFolderId = urlParams.get('folder') || 'root';

            categoryInput.value = activeFolderId;
            if (categoryDisplay) {
                categoryDisplay.value = activeFolderId === 'root' ? "📁 ROOT" : ("📁 " + getActiveFolderName(activeFolderId).toUpperCase());
            }
        }

        // Create virtual folder in memory and localStorage
        function createCustomFolder(folderName) {
            const sanitized = folderName.replace(/\//g, "").trim();
            if (!sanitized) return;

            const urlParams = new URLSearchParams(window.location.search);
            const parentId = urlParams.get('folder') || 'root';

            const generatedId = "VAL-" + Math.floor(1000 + Math.random() * 9000);

            const payload = {
                id: generatedId,
                folderName: sanitized,
                fileName: sanitized,
                title: sanitized,
                name: sanitized,
                fileType: 'application/x-folder',
                fileCategory: 'Directory',
                category: 'Directory',
                fileDescription: 'Virtual folder partition created via UI folder provisioner',
                description: 'Virtual folder partition created via UI folder provisioner',
                fileBase64: 'EMPTY_FOLDER',
                parentFolder: parentId,
                assetType: 'Folder',
                driveLink: 'javascript:void(0)'
            };

            const submitFolderBtn = document.getElementById('submitFolderBtn');
            if (submitFolderBtn) {
                submitFolderBtn.disabled = true;
                submitFolderBtn.innerText = "PROVISIONING...";
            }

            transmitToCloud(payload, submitFolderBtn || { disabled: false, innerText: "" }).then((success) => {
                if (success) {
                    closeFolderModal();
                }
            });
        }

        // Keeps uploaded documents/folders in active memory inventory for instant UI updates before Sheets republishes CSV
        function saveLocalUpload(name, type, category, parentFolder, description, base64Data, assetType = 'File', predefinedId = null, predefinedDriveLink = null, fileSize = 'N/A') {
            const newId = predefinedId || ("VAL-" + Math.floor(1000 + Math.random() * 9000));
            const dataUrl = predefinedDriveLink || (assetType === 'Folder' ? 'javascript:void(0)' : 'javascript:void(0)');
            
            const newDoc = {
                id: newId,
                title: name,
                category: category,
                parentFolder: parentFolder || 'root',
                description: description,
                driveLink: dataUrl,
                assetType: assetType,
                fileSize: fileSize
            };
            
            // Append and merge into the active memory inventory
            if (assetType === 'Folder') {
                const exists = folderInventory.some(doc => doc.id === newId);
                if (!exists) {
                    folderInventory.push(newDoc);
                } else {
                    const idx = folderInventory.findIndex(doc => doc.id === newId);
                    folderInventory[idx] = newDoc;
                }
            } else {
                const exists = fileInventory.some(doc => doc.id === newId);
                if (!exists) {
                    fileInventory.push(newDoc);
                } else {
                    const idx = fileInventory.findIndex(doc => doc.id === newId);
                    fileInventory[idx] = newDoc;
                }
            }
            renderVault();
        }

        // Isolate the physical network transmission logic to Google Sheets & Drive Web App
        async function transmitToCloud(payload, buttonElement) {
            const customId = payload.id || ("VAL-" + Math.floor(1000 + Math.random() * 9000));
            const customName = payload.fileName;
            const categoryTag = payload.fileCategory;
            const description = payload.fileDescription || document.getElementById('fileDescription').value;
            const parentFolderId = payload.parentFolder || document.getElementById('fileCategory').value || 'root';
            const assetType = payload.assetType || (payload.fileBase64 === 'EMPTY_FOLDER' ? 'Folder' : 'File');
            const fileSize = payload.fileSize || 'N/A';

            try {
                // Compile the payload exactly with the columns for both files and folders sheets
                const completePayload = {
                    ...payload,
                    id: customId,
                    title: customName,
                    folderName: customName,
                    fileName: customName,
                    name: customName,
                    category: assetType === 'Folder' ? 'Directory' : categoryTag,
                    fileCategory: assetType === 'Folder' ? 'Directory' : categoryTag,
                    description: description,
                    fileDescription: description,
                    parentFolder: parentFolderId,
                    parenFolder: parentFolderId,
                    assetType: assetType,
                    driveLink: payload.driveLink || 'javascript:void(0)'
                };

                let finalDriveLink = payload.driveLink || 'javascript:void(0)';

                if (BACKEND_API_URL && !BACKEND_API_URL.startsWith("PASTE_")) {
                    try {
                        const response = await fetch(BACKEND_API_URL, {
                            method: "POST",
                            body: JSON.stringify(completePayload)
                        });
                        if (response.ok) {
                            const resData = await response.json();
                            if (resData.status === "SUCCESS") {
                                finalDriveLink = resData.driveLink || finalDriveLink;
                            } else {
                                console.warn("Google Apps Script sync returned non-SUCCESS status:", resData.message);
                            }
                        } else {
                            console.warn(`Google Apps Script returned HTTP status: ${response.status}`);
                        }
                    } catch (backendErr) {
                        console.warn("Google Apps Script sync bypassed (falling back to direct Firestore storage):", backendErr);
                    }
                }

                const collName = assetType === 'Folder' ? 'folders' : 'files';
                const docPayload = {
                    id: customId,
                    title: customName,
                    category: assetType === 'Folder' ? 'Directory' : (categoryTag || "Other"),
                    parentFolder: parentFolderId,
                    description: description,
                    driveLink: finalDriveLink,
                    assetType: assetType,
                    createdAt: new Date().toISOString()
                };
                if (assetType === 'File') {
                    docPayload.fileSize = fileSize;
                }

                // Record item in Firebase Firestore
                await setDoc(fbDoc(db, collName, customId), docPayload);

                if (assetType === 'Folder') {
                    saveLocalUpload(customName, 'application/x-folder', 'Directory', parentFolderId, description, 'EMPTY_FOLDER', 'Folder', customId, finalDriveLink, 'N/A');
                    showToast(`Directory "${customName}" added successfully!`, "success");
                } else {
                    saveLocalUpload(customName, payload.fileType || "application/octet-stream", categoryTag, parentFolderId, description, payload.fileBase64, 'File', customId, finalDriveLink, fileSize);
                    showToast(`File "${customName}" uploaded successfully!`, "success");
                }
                closeModal();
                const uploadForm = document.getElementById('uploadForm');
                if (uploadForm) {
                    uploadForm.reset();
                }
                fetchDatabase(); // Request online live reload
                return true;
            } catch(error) {
                console.error("Cloud transmission failed:", error);
                
                // Red Toast Notification
                showToast("Upload Failed! Drive/Sheet connection rejected.", "error");
                
                // Show a clear, helpful validation modal box explaining how to resolve it
                alert(`🔴 FILE TRANSMISSION FAILURE!\n\nUnable to upload "${customName}" to Google Drive or record it in Google Sheets.\n\nError details:\n↳ "${error.message}"\n\nTROUBLESHOOTING CHECKLIST:\n1. Ensure your Apps Script URL is correct and active.\n2. Ensure your Apps Script is deployed as a Web App with access set to "Anyone" (even anonymous).\n3. Ensure the active Drive Folder ID in your script exists and is writeable.\n4. Make sure you have authorized permissions when setting up the Apps Script.`);
                return false;
            } finally {
                buttonElement.disabled = false;
                buttonElement.innerText = "EXECUTE UPLOAD";
            }
        }

        // 2. Form submission and Base64 conversion logic
        document.getElementById('uploadForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const fileInput = document.getElementById('fileInput');
            
            const assetTypeEl = document.getElementById('assetType');
            const assetType = assetTypeEl ? assetTypeEl.value : (fileInput.files.length > 0 ? 'File' : 'Folder');
            
            const urlParams = new URLSearchParams(window.location.search);
            const activeFolderId = urlParams.get('folder') || 'root';

            if (assetType === 'Folder') {
                const customName = document.getElementById('fileNameInput').value.trim() || "New Folder";
                const description = document.getElementById('fileDescription').value;
                const generatedId = "VAL-" + Math.floor(1000 + Math.random() * 9000);

                const payload = {
                    id: generatedId,
                    folderName: customName,
                    fileName: customName,
                    title: customName,
                    name: customName,
                    fileType: 'application/x-folder',
                    fileCategory: 'Directory',
                    category: 'Directory',
                    fileDescription: description,
                    description: description,
                    fileBase64: 'EMPTY_FOLDER',
                    parentFolder: activeFolderId,
                    assetType: 'Folder',
                    driveLink: 'javascript:void(0)',
                    fileSize: 'N/A'
                };

                submitBtn.disabled = true;
                submitBtn.innerText = "CONVERTING & TRANSMITTING...";

                await transmitToCloud(payload, submitBtn);
            } else {
                const files = fileInput.files;
                if (!files || files.length === 0) return;

                const categoryTag = document.getElementById('fileCategoryTagInput').value.trim() || "Other";
                const description = document.getElementById('fileDescription').value;

                submitBtn.disabled = true;

                // Function to format physical bytes
                const formatBytes = (bytes) => {
                    if (bytes === 0) return '0 Bytes';
                    const k = 1024;
                    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                };

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    let customName = file.name;
                    if (files.length === 1) {
                        customName = document.getElementById('fileNameInput').value.trim() || file.name;
                    }

                    submitBtn.innerText = `UPLOADING [${i + 1}/${files.length}]: ${file.name.substring(0, 15)}...`;

                    try {
                        const base64String = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = () => resolve(reader.result.split(',')[1]);
                            reader.onerror = (err) => reject(err);
                        });

                        const generatedId = "VAL-" + Math.floor(1000 + Math.random() * 9000);
                        const formattedSize = formatBytes(file.size);

                        const payload = {
                            id: generatedId,
                            folderName: customName,
                            fileName: customName,
                            title: customName,
                            name: customName,
                            fileType: file.type,
                            fileCategory: categoryTag,
                            category: categoryTag,
                            fileDescription: description,
                            description: description,
                            fileBase64: base64String,
                            parentFolder: activeFolderId,
                            assetType: 'File',
                            driveLink: 'javascript:void(0)',
                            fileSize: formattedSize
                        };

                        await transmitToCloud(payload, submitBtn);
                    } catch (err) {
                        console.error(`Skipping upload error for file ${file.name}:`, err);
                    }
                }
            }
        });

        // Folder Modal form submit
        document.getElementById('folderForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('folderNameInput');
            const folderName = input.value.trim();
            if (folderName) {
                createCustomFolder(folderName);
            }
        });

        // Dropdown toggle controls
        window.toggleDropdown = function(event) {
            event.stopPropagation();
            const dropdown = document.getElementById('addDropdown');
            dropdown.classList.toggle('active');
        };

        window.triggerNewFile = function(event) {
            event.stopPropagation();
            document.getElementById('addDropdown').classList.remove('active');
            openModal();
        };

        window.triggerNewFolder = function(event) {
            event.stopPropagation();
            document.getElementById('addDropdown').classList.remove('active');
            openFolderModal();
        };

        // Modal triggers
        window.openModal = function() {
            populateCategoryOptions();
            document.getElementById('uploadModal').classList.add('active');
        }
        window.closeModal = function() {
            document.getElementById('uploadModal').classList.remove('active');
            document.getElementById('uploadForm').reset();
        }

        // Automatically prefill the Custom Display Name input with the selected file name (excluding extension)
        const fileInputEl = document.getElementById('fileInput');
        if (fileInputEl) {
            fileInputEl.addEventListener('change', function() {
                const nameInput = document.getElementById('fileNameInput');
                if (nameInput && this.files && this.files[0]) {
                    const fullName = this.files[0].name;
                    const lastDotIndex = fullName.lastIndexOf('.');
                    nameInput.value = lastDotIndex !== -1 ? fullName.substring(0, lastDotIndex) : fullName;
                }
            });
        }

        window.openFolderModal = function() {
            document.getElementById('folderModal').classList.add('active');
            document.getElementById('folderNameInput').focus();
        }
        window.closeFolderModal = function() {
            document.getElementById('folderModal').classList.remove('active');
            document.getElementById('folderForm').reset();
        }
        
        // Universal click-away closes the dynamic add record dropdown menu and item context menus
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('addDropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
            // Close card options dropdowns if clicking outside
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                const container = menu.closest('.card-options-container');
                if (container && !container.contains(e.target)) {
                    menu.classList.remove('active');
                }
            });
        });

        document.getElementById('searchBox').addEventListener('input', (e) => renderVault(e.target.value));

        // Decodes and transforms Google Drive links into embedded preview format URLs
        function getGoogleDriveEmbedUrl(url) {
            if (!url) return "";
            let fileId = "";
            
            // Trim any quotes or trailing whitespace
            const cleanUrl = url.trim().replace(/^["']|["']$/g, "");
            
            // 1. Check for /file/d/FILE_ID
            const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (fileDMatch && fileDMatch[1]) {
                fileId = fileDMatch[1];
            }
            
            // 2. Check for id=FILE_ID parameter
            if (!fileId && cleanUrl.includes("id=")) {
                const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (idMatch && idMatch[1]) {
                    fileId = idMatch[1];
                }
            }
            
            // 3. Check for docs/spreadsheets/presentation paths 
            if (!fileId) {
                const docMatch = cleanUrl.match(/\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);
                if (docMatch && docMatch[2]) {
                    const type = docMatch[1];
                    const docId = docMatch[2];
                    return `https://docs.google.com/${type}/d/${docId}/preview`;
                }
            }
            
            if (fileId) {
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
            
            return cleanUrl;
        }

        // Decodes and transforms Google Drive links into direct download format URLs
        function getGoogleDriveDownloadUrl(url) {
            if (!url) return "";
            let fileId = "";
            
            // Trim any quotes or trailing whitespace
            const cleanUrl = url.trim().replace(/^["']|["']$/g, "");
            
            // 1. Check for /file/d/FILE_ID
            const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (fileDMatch && fileDMatch[1]) {
                fileId = fileDMatch[1];
            }
            
            // 2. Check for id=FILE_ID parameter
            if (!fileId && cleanUrl.includes("id=")) {
                const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (idMatch && idMatch[1]) {
                    fileId = idMatch[1];
                }
            }
            
            // 3. Check for docs/spreadsheets/presentation paths 
            if (!fileId) {
                const docMatch = cleanUrl.match(/\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);
                if (docMatch && docMatch[2]) {
                    const type = docMatch[1];
                    const docId = docMatch[2];
                    if (type === 'document') {
                        return `https://docs.google.com/document/d/${docId}/export?format=pdf`;
                    } else if (type === 'spreadsheets') {
                        return `https://docs.google.com/spreadsheets/d/${docId}/export?format=xlsx`;
                    } else if (type === 'presentation') {
                        return `https://docs.google.com/presentation/d/${docId}/export/pdf`;
                    }
                }
            }
            
            if (fileId) {
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            }
            
            return cleanUrl;
        }

        // Core downloader engine that triggers direct download bypassing any navigation/Google Drive tab redirects
        window.triggerDirectFileDownload = function(driveLink, title) {
            if (!driveLink) return;
            const cleanLink = driveLink.trim().replace(/^["']|["']$/g, "");
            const safeTitle = typeof title === 'string' ? title : (title ? String(title) : "document");

            if (cleanLink.startsWith("data:")) {
                const link = document.createElement("a");
                link.href = cleanLink;
                link.download = safeTitle;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (cleanLink.startsWith("javascript:") || cleanLink === "javascript:void(0)") {
                alert(`ℹ️ Google Drive Link Pending\n\nThis asset ("${safeTitle}") was created, but its physical Google Drive file link has not been generated or updated yet in the spreadsheet directory.\n\nPlease configure your backend Apps Script Web App so that new files automatically get writeable Drive links generated inside your connected spreadsheet!`);
            } else {
                const downloadUrl = getGoogleDriveDownloadUrl(cleanLink);
                
                // Use a silent hidden iframe to force the browser to initiate a direct download in the background
                // without navigating away, flashing, or opening any blank tabs.
                const hiddenIframe = document.createElement("iframe");
                hiddenIframe.style.display = "none";
                hiddenIframe.src = downloadUrl;
                document.body.appendChild(hiddenIframe);
                
                setTimeout(() => {
                    if (hiddenIframe.parentNode) {
                        document.body.removeChild(hiddenIframe);
                    }
                }, 5000);
            }
        };

        // Interactive default opener triggers copy display or binary data downloads
        window.openFileSystemFile = function(driveLink, title) {
            if (!driveLink) return;

            // Setup download and open tab buttons
            const downloadBtn = document.getElementById('viewerDownloadBtn');
            const openTabBtn = document.getElementById('viewerOpenTabBtn');
            const viewerTitle = document.getElementById('viewerTitle');
            const viewerBody = document.getElementById('viewerBody');

            const safeTitle = typeof title === 'string' ? title : (title ? String(title) : "DOCUMENT");

            if (viewerTitle) {
                viewerTitle.innerText = `Preview: ${safeTitle}`;
            }

            // Set up fallback download / open in new tab events
            if (downloadBtn) {
                downloadBtn.onclick = function() {
                    triggerDirectFileDownload(driveLink, safeTitle);
                };
            }

            if (openTabBtn) {
                openTabBtn.onclick = function() {
                    const cleanLink = driveLink.trim().replace(/^["']|["']$/g, "");
                    if (cleanLink.startsWith("javascript:")) {
                        alert("Backend script is offline. Try uploading normally to link active cloud drives.");
                    } else {
                        window.open(cleanLink, "_blank");
                    }
                };
                
                const cleanLink = driveLink.trim().replace(/^["']|["']$/g, "");
                if (cleanLink.startsWith("data:")) {
                    openTabBtn.style.display = "none";
                } else {
                    openTabBtn.style.display = "inline-block";
                }
            }

            // Load Content
            if (viewerBody) {
                viewerBody.innerHTML = `
                    <div class="viewer-loading-spinner">
                        <div>🔄 Loading Preview...</div>
                    </div>
                `;

                setTimeout(() => {
                    const cleanLink = driveLink.trim().replace(/^["']|["']$/g, "");
                    
                    if (cleanLink.startsWith("data:")) {
                        const splitted = cleanLink.split(';');
                        const mediaType = splitted[0] ? splitted[0].substring(5) : "";
                        if (mediaType.startsWith("image/")) {
                            viewerBody.innerHTML = `<img src="${cleanLink}" class="viewer-img" alt="${safeTitle}" />`;
                        } else if (mediaType.startsWith("text/") || mediaType === "application/json" || mediaType === "text/javascript" || mediaType === "text/html") {
                            try {
                                const base64Part = cleanLink.split(',')[1];
                                const decoded = atob(base64Part);
                                viewerBody.innerHTML = `<pre class="viewer-code-container"><code>${escapeHTML(decoded)}</code></pre>`;
                            } catch (err) {
                                viewerBody.innerHTML = `<iframe src="${cleanLink}" class="viewer-iframe" allowfullscreen></iframe>`;
                            }
                        } else {
                            viewerBody.innerHTML = `<iframe src="${cleanLink}" class="viewer-iframe" allowfullscreen></iframe>`;
                        }
                    } else if (cleanLink.startsWith("javascript:")) {
                        // Display beautiful custom simulated documents for preset mocks inside secure sandbox mode
                        if (safeTitle.includes("Semester_Marksheet")) {
                            viewerBody.innerHTML = `
                                <div class="viewer-code-container" style="color: #34d399; padding: 24px;">
                                    <div style="border: 2px dashed #34d399; padding: 20px; border-radius: 4px; background: rgba(52, 211, 153, 0.05); max-width: 600px; margin: 0 auto; line-height: 1.6; font-family: monospace;">
                                        <h2 style="text-align: center; margin-bottom: 20px; font-family: monospace; letter-spacing: 2px;">🎓 ACADEMIC TRANSCRIPT</h2>
                                        <p><strong>STUDENT ID:</strong> STU-99841-B</p>
                                        <p><strong>VERIFIED EXAMINEE:</strong> DEMO CONTEXT USER</p>
                                        <hr style="border: 1px dashed #34d399; margin: 15px 0;">
                                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                                            <thead>
                                                <tr style="border-bottom: 1px solid #34d399;">
                                                    <th>MODULE DESCRIPTION</th>
                                                    <th>CREDITS</th>
                                                    <th>GRADE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td>CS-401 CRYPTOGRAPHIC ALGORITHMS</td><td>4.0</td><td>A+</td></tr>
                                                <tr><td>CS-402 DATABASE SHARDING PROTOCOLS</td><td>4.0</td><td>A</td></tr>
                                                <tr><td>CS-405 SECURED ENCLAVE ARCHITECTURE</td><td>3.0</td><td>A+</td></tr>
                                                <tr><td>CS-410 ADVANCED WEB CLUSTER ENGINEERING</td><td>3.0</td><td>A</td></tr>
                                            </tbody>
                                        </table>
                                        <hr style="border: 1px dashed #34d399; margin: 15px 0;">
                                        <p><strong>CUMULATIVE GPA:</strong> 3.92 / 4.00</p>
                                        <p style="text-align: center; font-size: 0.75rem; opacity: 0.7; margin-top: 25px;">[🔐 Digitally Verified and Approved]</p>
                                    </div>
                                </div>
                            `;
                        } else if (safeTitle.includes("Admission_Fee")) {
                            viewerBody.innerHTML = `
                                <div class="viewer-code-container" style="color: #f59e0b; padding: 24px;">
                                    <div style="border: 2px solid #f59e0b; padding: 20px; border-radius: 4px; background: rgba(245, 158, 11, 0.05); max-width: 500px; margin: 0 auto; line-height: 1.6; font-family: monospace;">
                                        <div style="text-align: center; margin-bottom: 15px;">
                                            <span style="font-size: 2.5rem;">💸</span>
                                            <h3 style="margin-top: 10px; font-family: monospace; color: #f59e0b;">Receipt</h3>
                                        </div>
                                        <p><strong>ISSUER:</strong> OFFICE OF FINANCIAL REGISTRATION</p>
                                        <p><strong>TRANSACTION REF:</strong> TXN-994857183</p>
                                        <p><strong>TIMESTAMP:</strong> 2026-06-06 UTC</p>
                                        <hr style="border-color: #f59e0b; margin: 15px 0;">
                                        <div style="display: flex; justify-content: space-between; font-weight: bold;">
                                            <span>ITEM DESCRIPTION</span>
                                            <span>PAYMENT</span>
                                        </div>
                                        <hr style="border-color: #f59e0b; margin: 5px 0 10px 0;">
                                        <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                                            <span>TUITION FEE (SPRING 2026)</span>
                                            <span>$4,850.00</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between;">
                                            <span>SYSTEM SECURITY LEVY</span>
                                            <span>$150.00</span>
                                        </div>
                                        <hr style="border-color: #f59e0b; margin: 15px 0;">
                                        <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold;">
                                            <span>TOTAL AMOUNT PAID</span>
                                            <span>$5,000.00</span>
                                        </div>
                                        <div style="margin-top: 25px; text-align: center; background: #f59e0b; color: #000; font-weight: bold; padding: 8px; border-radius: 2px; letter-spacing: 1px;">
                                            ✅ Verified and Approved
                                        </div>
                                    </div>
                                </div>
                            `;
                        } else if (safeTitle.includes("UIDAI_Aadhaar")) {
                            viewerBody.innerHTML = `
                                <div class="viewer-code-container" style="color: #60a5fa; padding: 24px;">
                                    <div style="border: 2px dashed #60a5fa; padding: 20px; border-radius: 8px; background: rgba(96, 165, 250, 0.05); max-width: 550px; margin: 0 auto; line-height: 1.5; font-family: monospace;">
                                        <h3 style="text-align: center; color: #60a5fa; font-weight: bold; margin-bottom: 12px; letter-spacing: 1px;">Aadhaar Verification Record</h3>
                                        <hr style="border-color: #60a5fa; margin-bottom: 15px;">
                                        <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                                            <div style="width: 100px; height: 120px; border: 2px solid #5a5f7d; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; background: rgba(255,255,255,0.05); border-radius: 4px;">👤</div>
                                            <div style="flex: 1; min-width: 200px;">
                                                <p><strong>NAME:</strong> JASHUVA V. DEMO</p>
                                                <p><strong>DOB:</strong> 12 / 08 / 1999</p>
                                                <p><strong>GENDER:</strong> MALE</p>
                                                <p><strong>ADDRESS:</strong> AuraFiles Storage Server, Node 4</p>
                                            </div>
                                        </div>
                                        <div style="border: 1px solid #60a5fa; padding: 8px; text-align: center; font-size: 1.2rem; font-weight: bold; letter-spacing: 3px; margin-top: 20px; background: rgba(96, 165, 250, 0.1);">
                                            4882 9901 3855
                                        </div>
                                        <p style="text-align: center; font-size: 0.7rem; color: #60a5fa; margin-top: 8px;">My Aadhaar, My Cloud Identity</p>
                                    </div>
                                </div>
                            `;
                        } else {
                            viewerBody.innerHTML = `
                                <div class="viewer-code-container" style="color: #38bdf8; padding: 24px; font-family: monospace;">
                                    <div style="border: 1px solid #1e293b; padding: 16px; border-radius: 4px; background: #030712; line-height: 1.6;">
                                        <span style="color: #64748b;">// System configurations //</span>
                                        <p style="color: #e2e8f0; margin-top: 10px;"><strong># Environment configurations:</strong></p>
                                        <p>VAULT_PORT_INGRESS=3000</p>
                                        <p>REVERSE_PROXY_SSL=ACTIVE</p>
                                        <p>CLOUD_SYNC_REDUNDANCY=ENABLED</p>
                                        <p>METADATA_DECRYPTOR_ALGO=AES-256-GCM</p>
                                        <p style="color: #e2e8f0; margin-top: 15px;"><strong># Active Repositories:</strong></p>
                                        <p>FILES_RAW_DB="${FILES_CSV_URL}"</p>
                                        <p>FOLDERS_RAW_DB="${FOLDERS_CSV_URL}"</p>
                                        <p>BACKEND_TRANSMITTER="${BACKEND_API_URL}"</p>
                                        <p style="color: #64748b; margin-top: 20px;">// End of manifest report //</p>
                                    </div>
                                </div>
                            `;
                        }
                    } else {
                        const embedUrl = getGoogleDriveEmbedUrl(cleanLink);
                        viewerBody.innerHTML = `<iframe src="${embedUrl}" class="viewer-iframe" allow="autoplay; encrypted-media" allowfullscreen="true" referrerpolicy="no-referrer"></iframe>`;
                    }
                }, 300);
            }

            document.getElementById('viewerModal').classList.add('active');
        };

        window.closeViewerModal = function() {
            const viewerBody = document.getElementById('viewerBody');
            if (viewerBody) {
                viewerBody.innerHTML = "";
            }
            document.getElementById('viewerModal').classList.remove('active');
        };

        function escapeHTML(str) {
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Item context menu toggle trigger
        window.toggleCardOptions = function(event, menuId) {
            event.stopPropagation();
            const targetMenu = document.getElementById(menuId + '-menu');
            const isActive = targetMenu && targetMenu.classList.contains('active');

            // Close all other dropdowns
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });

            if (targetMenu && !isActive) {
                targetMenu.classList.add('active');
            }
        };

        // Modal Action: SHOW METADATA DETAILS
        window.viewDetails = function(event, type, id) {
            if (event) event.stopPropagation();
            
            // Close opened context menu dropdowns
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });

            const contentEl = document.getElementById('detailsContent');
            if (!contentEl) return;

            if (type === 'folder') {
                const folderDoc = folderInventory.find(item => item.id === id);
                const title = folderDoc ? folderDoc.title : "Unidentified Folder";
                const parent = folderDoc ? (folderDoc.parentFolder || 'root') : 'root';
                const parentPathName = getActiveFolderName(parent);
                const count = getFolderFileCount(id);

                contentEl.innerHTML = `
                    <div class="details-row">
                        <span class="details-key">Entry Type</span>
                        <span class="details-val">📁 FOLDER</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Folder Name</span>
                        <span class="details-val" style="font-weight: bold; color: var(--accent);">${title}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Parent Folder</span>
                        <span class="details-val">${parentPathName}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Document Count</span>
                        <span class="details-val">${count} item(s) recorded in this folder</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Operational Class</span>
                        <span class="details-val">Virtual archive index partition</span>
                    </div>
                `;
            } else if (type === 'file') {
                const doc = fileInventory.find(item => item.id === id);
                if (!doc) return;

                const isLocal = doc.driveLink && doc.driveLink.startsWith("data:");
                const originLabel = isLocal ? "🔒 Local Database Storage" : "🌐 Google Drive Cloud Server";

                contentEl.innerHTML = `
                    <div class="details-row">
                        <span class="details-key">Entry Type</span>
                        <span class="details-val">📄 Document File</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Asset Name</span>
                        <span class="details-val" style="font-weight: bold; color: var(--accent);">${doc.title || "Unidentified Asset"}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">File Size</span>
                        <span class="details-val" style="font-family: var(--font-mono); color: var(--accent);">${doc.fileSize || "N/A"}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Storage Source</span>
                        <span class="details-val">${originLabel}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Category Tag</span>
                        <span class="details-val">${(doc.category || "Root").replace(/\//g, " / ")}</span>
                    </div>
                    <div class="details-row">
                        <span class="details-key">Description</span>
                        <span class="details-val">${doc.description || "None (No description metadata tagged)"}</span>
                    </div>
                `;
            }

            document.getElementById('detailsModal').classList.add('active');
        };

        window.closeDetailsModal = function() {
            document.getElementById('detailsModal').classList.remove('active');
        };

        // Modal Action: INITIATE EDIT PROMPT
        window.triggerEdit = function(event, type, id) {
            if (event) event.stopPropagation();

            // Close context menu dropdowns
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });

            document.getElementById('editTargetType').value = type;
            document.getElementById('editTargetId').value = id;

            const nameInput = document.getElementById('editItemName');
            const categoryInput = document.getElementById('editItemCategory');
            const categoryGroup = document.getElementById('editItemCategoryGroup');
            const descriptionInput = document.getElementById('editItemDescription');

            const doc = type === 'folder' 
                ? folderInventory.find(item => item.id === id) 
                : fileInventory.find(item => item.id === id);

            if (!doc) {
                showToast("Edit failed: item not found.", "error");
                return;
            }

            if (nameInput) nameInput.value = doc.title || "";
            if (descriptionInput) descriptionInput.value = doc.description || "";

            if (type === 'folder') {
                if (categoryGroup) categoryGroup.style.display = 'none';
            } else {
                if (categoryGroup) categoryGroup.style.display = 'block';
                if (categoryInput) categoryInput.value = doc.category || "Other";
            }

            document.getElementById('editModal').classList.add('active');
            if (nameInput) nameInput.focus();
        };

        window.closeEditModal = function() {
            document.getElementById('editModal').classList.remove('active');
            document.getElementById('editForm').reset();
        };

        // Handle edit metadata submissions
        document.getElementById('editForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const type = document.getElementById('editTargetType').value;
            const targetId = document.getElementById('editTargetId').value;
            const newName = document.getElementById('editItemName').value.trim();
            const newCategory = type === 'file' ? document.getElementById('editItemCategory').value.trim() : 'Directory';
            const newDescription = document.getElementById('editItemDescription').value.trim();

            if (!newName) return;

            const item = type === 'folder' 
                ? folderInventory.find(doc => doc.id === targetId)
                : fileInventory.find(doc => doc.id === targetId);

            if (!item) {
                showToast("Update failed: Target item not found in database.", "error");
                closeEditModal();
                return;
            }

            const submitEditBtn = document.getElementById('submitEditBtn');
            if (submitEditBtn) {
                submitEditBtn.disabled = true;
                submitEditBtn.innerText = "SAVING CHANGES...";
            }

            try {
                // If name changed, trigger rename sync for Apps Script / Drive files compatibility (optional writeback)
                if (newName !== item.title) {
                    const renamePayload = {
                        action: "rename",
                        id: targetId,
                        title: newName,
                        folderName: newName,
                        fileName: newName,
                        name: newName,
                        category: type === 'folder' ? 'Directory' : (item.category || item.fileCategory || 'Other'),
                        fileCategory: type === 'folder' ? 'Directory' : (item.category || item.fileCategory || 'Other'),
                        description: item.description || '',
                        fileDescription: item.description || '',
                        parentFolder: item.parentFolder || 'root',
                        parenFolder: item.parentFolder || 'root',
                        assetType: type === 'folder' ? 'Folder' : 'File',
                        driveLink: item.driveLink || 'javascript:void(0)'
                    };

                    if (BACKEND_API_URL && !BACKEND_API_URL.startsWith("PASTE_")) {
                        try {
                            const response = await fetch(BACKEND_API_URL, {
                                method: "POST",
                                body: JSON.stringify(renamePayload)
                            });
                            if (response.ok) {
                                const resData = await response.json();
                                if (resData.status !== "SUCCESS") {
                                    console.warn("Google Apps Script rename returned non-success on edit:", resData.message);
                                }
                            }
                        } catch (backendErr) {
                            console.warn("Google Apps Script rename sync bypassed on metadata edit:", backendErr);
                        }
                    }
                }

                // Update in Firestore
                const collName = type === 'folder' ? 'folders' : 'files';
                const patchData = {
                    title: newName,
                    description: newDescription
                };
                if (type === 'file') {
                    patchData.category = newCategory;
                }

                await updateDoc(fbDoc(db, collName, targetId), patchData);

                // Update local memory arrays
                if (type === 'file') {
                    fileInventory.forEach(doc => {
                        if (doc.id === targetId) {
                            doc.title = newName;
                            doc.category = newCategory;
                            doc.description = newDescription;
                        }
                    });
                } else {
                    folderInventory.forEach(doc => {
                        if (doc.id === targetId) {
                            doc.title = newName;
                            doc.description = newDescription;
                        }
                    });
                }

                showToast(`Successfully updated metadata!`, "success");
                closeEditModal();
                renderVault();
                fetchDatabase(); // Request online live reload
            } catch (err) {
                console.error("Metadata update failure:", err);
                showToast("Update failed!", "error");
                alert(`🔴 DATABASE UPDATE FAILURE!\n\nUnable to save updated metadata.\n\nError details:\n↳ "${err.message}"`);
            } finally {
                if (submitEditBtn) {
                    submitEditBtn.disabled = false;
                    submitEditBtn.innerText = "EXECUTE UPDATE";
                }
            }
        });

        // Modal Action: INITIATE RENAME PROMPT
        window.triggerRename = function(event, type, id) {
            if (event) event.stopPropagation();

            // Close context menu dropdowns
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });

            const renameInput = document.getElementById('renameInput');
            const renameLabel = document.getElementById('renameLabel');
            
            document.getElementById('renameTargetType').value = type;
            document.getElementById('renameTargetId').value = id;

            const doc = type === 'folder' ? folderInventory.find(item => item.id === id) : fileInventory.find(item => item.id === id);
            const oldTitle = doc ? doc.title : "";
            document.getElementById('renameTargetOldName').value = oldTitle;

            if (type === 'folder') {
                renameLabel.innerText = "NEW FOLDER NAME";
                if (renameInput) renameInput.value = oldTitle;
            } else {
                renameLabel.innerText = "NEW DOCUMENT FILENAME";
                if (renameInput) renameInput.value = oldTitle;
            }

            document.getElementById('renameModal').classList.add('active');
            if (renameInput) renameInput.focus();
        };

        window.closeRenameModal = function() {
            document.getElementById('renameModal').classList.remove('active');
            document.getElementById('renameForm').reset();
        };

        // Handle rename save submissions
        document.getElementById('renameForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const type = document.getElementById('renameTargetType').value;
            const targetId = document.getElementById('renameTargetId').value;
            const newName = document.getElementById('renameInput').value.trim();

            if (!newName) return;

            // 1. Find matched memory item
            const item = type === 'folder' 
                ? folderInventory.find(doc => doc.id === targetId)
                : fileInventory.find(doc => doc.id === targetId);

            if (!item) {
                showToast("Rename failed: Target item not found in database.", "error");
                closeRenameModal();
                return;
            }

            const submitRenameBtn = document.getElementById('submitRenameBtn');
            if (submitRenameBtn) {
                submitRenameBtn.disabled = true;
                submitRenameBtn.innerText = "SYNCING RENAME...";
            }

            const completePayload = {
                action: "rename",
                id: targetId,
                title: newName,
                folderName: newName,
                fileName: newName,
                name: newName,
                category: type === 'folder' ? 'Directory' : (item.category || item.fileCategory || 'Other'),
                fileCategory: type === 'folder' ? 'Directory' : (item.category || item.fileCategory || 'Other'),
                description: item.description || '',
                fileDescription: item.description || '',
                parentFolder: item.parentFolder || 'root',
                parenFolder: item.parentFolder || 'root',
                assetType: type === 'folder' ? 'Folder' : 'File',
                driveLink: item.driveLink || 'javascript:void(0)'
            };

            try {
                if (BACKEND_API_URL && !BACKEND_API_URL.startsWith("PASTE_")) {
                    try {
                        const response = await fetch(BACKEND_API_URL, {
                            method: "POST",
                            body: JSON.stringify(completePayload)
                        });
                        if (response.ok) {
                            const resData = await response.json();
                            if (resData.status !== "SUCCESS") {
                                console.warn("Google Apps Script rename returned non-success:", resData.message);
                            }
                        }
                    } catch (backendErr) {
                        console.warn("Google Apps Script rename sync bypassed:", backendErr);
                    }
                }

                // Update in Firestore
                const collName = type === 'folder' ? 'folders' : 'files';
                await updateDoc(fbDoc(db, collName, targetId), { title: newName });

                // Update memory arrays
                fileInventory.forEach(doc => {
                    if (doc.id === targetId) {
                        doc.title = newName;
                    }
                });
                folderInventory.forEach(doc => {
                    if (doc.id === targetId) {
                        doc.title = newName;
                    }
                });
                showToast(`Successfully renamed to "${newName}"!`, "success");
                closeRenameModal();
                fetchDatabase(); // Request online live reload
            } catch (err) {
                console.error("Rename cloud transmission failure:", err);
                showToast("Rename failed!", "error");
                alert(`🔴 CLOUD RENAME FAILURE!\n\nUnable to synchronize renamed state in database.\n\nError details:\n↳ "${err.message}"`);
            } finally {
                if (submitRenameBtn) {
                    submitRenameBtn.disabled = false;
                    submitRenameBtn.innerText = "EXECUTE RENAME";
                }
            }
        });

        // Direct Download Link helper Action
        window.downloadFileDirectly = function(event, id) {
            if (event) event.stopPropagation();
            
            // Close context menu dropdowns
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });

            const doc = fileInventory.find(item => item.id === id);
            if (doc) {
                triggerDirectFileDownload(doc.driveLink, doc.title);
            }
        };

        // Modal Action: INITIATE DELETE WARNING DIALOG
        window.triggerDelete = function(event, type, id) {
            if (event) event.stopPropagation();

            // Close context menu dropdowns
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });

            document.getElementById('deleteTargetType').value = type;
            document.getElementById('deleteTargetId').value = id;

            const promptEl = document.getElementById('deletePromptMessage');
            const doc = type === 'folder' ? folderInventory.find(item => item.id === id) : fileInventory.find(item => item.id === id);
            const title = doc ? doc.title : "Unidentified Asset";

            if (type === 'folder') {
                promptEl.innerHTML = `You are about to permanently delete the Folder <strong style="color: var(--accent);">${title}</strong> and ALL nested subfolders or documents contained inside it.`;
            } else {
                promptEl.innerHTML = `You are about to permanently delete the document <strong style="color: var(--accent);">${title}</strong> (ID: ${id}).`;
            }

            document.getElementById('deleteModal').classList.add('active');
        };

        window.closeDeleteModal = function() {
            document.getElementById('deleteModal').classList.remove('active');
            document.getElementById('deleteForm').reset();
        };

        // Recursive child item lookup helper
        function getNestedItemsToDelete(folderId) {
            const resultIds = new Set([folderId]);
            let previousSize = 0;

            while (previousSize !== resultIds.size) {
                previousSize = resultIds.size;
                fileInventory.forEach(item => {
                    if (item.parentFolder && resultIds.has(item.parentFolder)) {
                        resultIds.add(item.id);
                    }
                });
                folderInventory.forEach(item => {
                    if (item.parentFolder && resultIds.has(item.parentFolder)) {
                        resultIds.add(item.id);
                    }
                });
            }

            return Array.from(resultIds);
        }

        // Handle delete wipe submissions
        document.getElementById('deleteForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const type = document.getElementById('deleteTargetType').value;
            const targetId = document.getElementById('deleteTargetId').value;
            const submitBtn = document.getElementById('submitDeleteBtn');

            if (type === 'multi') {
                const itemsToDelete = JSON.parse(targetId); // [{id, type}]
                submitBtn.disabled = true;
                submitBtn.innerText = `PURGING ${itemsToDelete.length} SELECTED...`;

                const deletePromises = [];
                const filesToDelete = [];
                const foldersToDelete = [];
                const allIdsToDelete = []; // Includes subcontents

                for (const item of itemsToDelete) {
                    if (item.type === 'file') {
                        const doc = fileInventory.find(it => it.id === item.id);
                        if (doc) {
                            filesToDelete.push(doc);
                            allIdsToDelete.push(doc.id);
                        }
                    } else if (item.type === 'folder') {
                        const nested = getNestedItemsToDelete(item.id);
                        nested.push(item.id);
                        nested.forEach(nestedId => {
                            if (!allIdsToDelete.includes(nestedId)) {
                                allIdsToDelete.push(nestedId);
                                const f = folderInventory.find(it => it.id === nestedId);
                                if (f && !foldersToDelete.some(x => x.id === nestedId)) foldersToDelete.push(f);
                                const fl = fileInventory.find(it => it.id === nestedId);
                                if (fl && !fileInventory.some(x => x.id === nestedId)) filesToDelete.push(fl);
                            }
                        });
                    }
                }

                if (BACKEND_API_URL && !BACKEND_API_URL.startsWith("PASTE_")) {
                    filesToDelete.forEach(doc => {
                        const payload = {
                            action: "delete",
                            id: doc.id,
                            assetType: "File",
                            driveLink: doc.driveLink || "javascript:void(0)"
                        };
                        deletePromises.push(
                            fetch(BACKEND_API_URL, {
                                method: "POST",
                                body: JSON.stringify(payload)
                            }).catch(() => {})
                        );
                    });
                    foldersToDelete.forEach(fold => {
                        const payload = {
                            action: "delete",
                            id: fold.id,
                            assetType: "Folder",
                            driveLink: fold.driveLink || "javascript:void(0)"
                        };
                        deletePromises.push(
                            fetch(BACKEND_API_URL, {
                                method: "POST",
                                body: JSON.stringify(payload)
                            }).catch(() => {})
                        );
                    });
                }

                try {
                    if (deletePromises.length > 0) {
                        try {
                            await Promise.all(deletePromises);
                        } catch (e) {}
                    }

                    const firebaseDeletePromises = [];
                    filesToDelete.forEach(docToDelete => {
                        firebaseDeletePromises.push(deleteDoc(fbDoc(db, "files", docToDelete.id)));
                    });
                    foldersToDelete.forEach(foldToDelete => {
                        firebaseDeletePromises.push(deleteDoc(fbDoc(db, "folders", foldToDelete.id)));
                    });

                    await Promise.all(firebaseDeletePromises);

                    fileInventory = fileInventory.filter(doc => !allIdsToDelete.includes(doc.id));
                    folderInventory = folderInventory.filter(doc => !allIdsToDelete.includes(doc.id));

                    showToast(`Deleted ${itemsToDelete.length} selected items!`, "success");
                    closeDeleteModal();
                    clearSelected();
                    fetchDatabase();
                } catch (err) {
                    console.error("Multi recursive delete failure:", err);
                    showToast("Multi delete failed!", "error");
                    alert(`🔴 CLOUD DELETE FAILURE!\n\nUnable to delete these items.\n\nError details:\n↳ "${err.message}"`);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Confirm Deletion";
                }
                return;
            }

            if (type === 'file') {
                const doc = fileInventory.find(item => item.id === targetId);
                if (!doc) {
                    showToast("Delete failed: File not found.", "error");
                    closeDeleteModal();
                    return;
                }
                
                if (!BACKEND_API_URL || BACKEND_API_URL.startsWith("PASTE_")) {
                    showToast("Delete disabled! Connect your Apps Script URL first.", "error");
                    alert("🔴 DELETE FAILURE\nYou must configure and connect your Google Apps Script URL before you can delete files.");
                    closeDeleteModal();
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.innerText = "Deleting File...";
                
                try {
                    const payload = {
                        action: "delete",
                        id: doc.id,
                        assetType: "File",
                        driveLink: doc.driveLink
                    };

                    if (BACKEND_API_URL && !BACKEND_API_URL.startsWith("PASTE_")) {
                        try {
                            const response = await fetch(BACKEND_API_URL, {
                                method: "POST",
                                body: JSON.stringify(payload)
                            });
                            if (response.ok) {
                                const resData = await response.json();
                                if (resData.status !== "SUCCESS") {
                                    console.warn("Google Apps Script delete file warning:", resData.message);
                                }
                            }
                        } catch (backendErr) {
                            console.warn("Google Apps Script delete file bypassed (deleting in Firestore):", backendErr);
                        }
                    }
                    
                    // Delete document from Firestore
                    await deleteDoc(fbDoc(db, "files", targetId));

                    // Remove file matching matching ID from memory inventory
                    fileInventory = fileInventory.filter(item => item.id !== targetId);
                    showToast(`File "${doc.title}" deleted successfully!`, "success");
                    closeDeleteModal();
                    fetchDatabase(); // Full reload sync
                } catch (err) {
                    console.error("Delete failure:", err);
                    showToast("Delete action failed!", "error");
                    alert(`🔴 CLOUD DELETE SEQUENCE FAILED!\n\nUnable to delete this file.\n\nError details:\n↳ "${err.message}"`);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Confirm Deletion";
                }

            } else if (type === 'folder') {
                const docFolder = folderInventory.find(item => item.id === targetId);
                if (!docFolder) {
                    showToast("Delete failed: Folder not found.", "error");
                    closeDeleteModal();
                    return;
                }

                const idsToDelete = getNestedItemsToDelete(targetId);

                // Gather files to delete
                const filesToDelete = fileInventory.filter(item => idsToDelete.includes(item.id));
                // Gather folders to delete
                const foldersToDelete = folderInventory.filter(item => idsToDelete.includes(item.id));
                
                submitBtn.disabled = true;
                submitBtn.innerText = `PURGING ${filesToDelete.length + foldersToDelete.length} REGISTRIES...`;
                
                const deletePromises = [];
                
                if (BACKEND_API_URL && !BACKEND_API_URL.startsWith("PASTE_")) {
                    // Queue all files deletion payloads
                    filesToDelete.forEach(doc => {
                        const payload = {
                            action: "delete",
                            id: doc.id,
                            assetType: "File",
                            driveLink: doc.driveLink || "javascript:void(0)"
                        };
                        deletePromises.push(
                            fetch(BACKEND_API_URL, {
                                method: "POST",
                                body: JSON.stringify(payload)
                            }).then(async r => {
                                if (!r.ok) throw new Error(`HTTP code ${r.status}`);
                                const data = await r.json();
                                data.itemTitle = doc.title;
                                return data;
                            }).catch(err => {
                                console.warn(`Bypassed optional write-back deletion for file ${doc.title}:`, err);
                                return { status: "SUCCESS", itemTitle: doc.title };
                            })
                        );
                    });

                    // Queue folders deletion payloads
                    foldersToDelete.forEach(fold => {
                        const payload = {
                            action: "delete",
                            id: fold.id,
                            assetType: "Folder",
                            driveLink: fold.driveLink || "javascript:void(0)"
                        };
                        deletePromises.push(
                            fetch(BACKEND_API_URL, {
                                method: "POST",
                                body: JSON.stringify(payload)
                            }).then(async r => {
                                if (!r.ok) throw new Error(`HTTP code ${r.status}`);
                                const data = await r.json();
                                data.itemTitle = fold.title;
                                return data;
                            }).catch(err => {
                                console.warn(`Bypassed optional write-back deletion for folder ${fold.title}:`, err);
                                return { status: "SUCCESS", itemTitle: fold.title };
                            })
                        );
                    });
                }

                try {
                    if (deletePromises.length > 0) {
                        try {
                            const results = await Promise.all(deletePromises);
                            const failures = results.filter(res => res && res.status !== "SUCCESS");
                            if (failures.length > 0) {
                                console.warn("Some secondary writebacks had failures:", failures);
                            }
                        } catch (pErr) {
                            console.warn("Secondary writebacks promise failed:", pErr);
                        }
                    }
                    
                    // Delete all nested files and folders from Firestore
                    const firebaseDeletePromises = [];
                    filesToDelete.forEach(docToDelete => {
                        firebaseDeletePromises.push(deleteDoc(fbDoc(db, "files", docToDelete.id)));
                    });
                    foldersToDelete.forEach(foldToDelete => {
                        firebaseDeletePromises.push(deleteDoc(fbDoc(db, "folders", foldToDelete.id)));
                    });
                    // Also delete the target folder itself
                    firebaseDeletePromises.push(deleteDoc(fbDoc(db, "folders", targetId)));
                    await Promise.all(firebaseDeletePromises);

                    // Filter memory arrays to remove deleted items
                    fileInventory = fileInventory.filter(doc => !idsToDelete.includes(doc.id));
                    folderInventory = folderInventory.filter(doc => !idsToDelete.includes(doc.id));
                    
                    showToast(`Folder "${docFolder.title}" and its contents have been deleted!`, "success");
                    closeDeleteModal();
                    fetchDatabase(); // Full reload sync
                } catch (err) {
                    console.error("Folder recursive delete failure:", err);
                    showToast("Folder deletion failed!", "error");
                    alert(`🔴 FOLDER DELETION FAILED!\n\nUnable to delete this folder and its contents.\n\nError details:\n↳ "${err.message}"`);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Confirm Deletion";
                }
            }

            closeDeleteModal();
            renderVault();
        });

        // Clipboard variables & operations
        let clipboard = null;
        try {
            clipboard = JSON.parse(sessionStorage.getItem("vault_clipboard_storage"));
        } catch(e) {}

        window.updateClipboardUI = function() {
            const pasteBtn = document.getElementById('navPasteBtn');
            const notice = document.getElementById('clipboardNotice');
            const itemNameSpan = document.getElementById('clipboardItemName');

            let isHidden = false;
            try {
                isHidden = sessionStorage.getItem("vault_clipboard_hidden") === "true";
            } catch(e) {}

            if (clipboard && clipboard.name && !isHidden) {
                if (pasteBtn) {
                    pasteBtn.disabled = false;
                    pasteBtn.title = `Paste: ${clipboard.name}`;
                }
                if (notice) {
                    notice.style.display = "inline-block";
                    if (itemNameSpan) {
                        const dispName = clipboard.name.length > 25 ? clipboard.name.substring(0, 22) + "..." : clipboard.name;
                        itemNameSpan.innerText = dispName;
                    }
                }
            } else {
                if (pasteBtn) {
                    pasteBtn.disabled = true;
                    pasteBtn.title = "Paste Copied Item";
                }
                if (notice) {
                    notice.style.display = "none";
                }
            }
        };

        window.copyItem = function(event, type, id) {
            if (event) event.stopPropagation();

            // Close context menu dropdowns
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });

            const doc = type === 'folder' ? folderInventory.find(item => item.id === id) : fileInventory.find(item => item.id === id);
            if (!doc) return;

            clipboard = {
                type: type, // 'file' or 'folder'
                id: doc.id,
                name: doc.title
            };

            try {
                sessionStorage.setItem("vault_clipboard_storage", JSON.stringify(clipboard));
                sessionStorage.setItem("vault_clipboard_hidden", "false");
            } catch (e) {}
            window.updateClipboardUI();
        };

        window.pasteItem = async function() {
            if (!clipboard) return;

            const urlParams = new URLSearchParams(window.location.search);
            const activeFolderId = urlParams.get('folder') || 'root';

            const pasteBtn = document.getElementById('navPasteBtn');
            const originalText = pasteBtn ? pasteBtn.innerHTML : "📋 Paste Copied Item";
            if (pasteBtn) {
                pasteBtn.disabled = true;
                pasteBtn.innerHTML = "⚙️ PASTING...";
            }

            // Convert clipboard to a flat list of elements to process
            let itemsToPaste = [];
            if (clipboard.isMulti) {
                itemsToPaste = clipboard.items;
            } else {
                itemsToPaste = [{ id: clipboard.id, type: clipboard.type, name: clipboard.name }];
            }

            let successCount = 0;

            for (const item of itemsToPaste) {
                if (item.type === 'file') {
                    const doc = fileInventory.find(it => it.id === item.id);
                    if (!doc) continue;

                    let newTitle = doc.title || "Untitled File";
                    const isDuplicate = fileInventory.some(f => f.parentFolder === activeFolderId && f.title === newTitle);
                    
                    if (isDuplicate) {
                        const lastDot = newTitle.lastIndexOf('.');
                        if (lastDot !== -1) {
                            const base = newTitle.substring(0, lastDot);
                            const ext = newTitle.substring(lastDot);
                            newTitle = base + " - Copy" + ext;
                        } else {
                            newTitle = newTitle + " - Copy";
                        }
                    }

                    const newId = "VAL-" + Math.floor(1000 + Math.random() * 9000);
                    const clonedDoc = {
                        id: newId,
                        title: newTitle,
                        category: doc.category || "Other",
                        parentFolder: activeFolderId,
                        description: doc.description || "",
                        driveLink: doc.driveLink,
                        assetType: 'File',
                        fileSize: doc.fileSize || "N/A"
                    };

                    try {
                        const payload = {
                            action: "upload",
                            id: clonedDoc.id,
                            title: clonedDoc.title,
                            fileName: clonedDoc.title,
                            assetType: "File",
                            parentFolder: clonedDoc.parentFolder,
                            fileCategory: clonedDoc.category,
                            fileDescription: clonedDoc.description,
                            driveLink: clonedDoc.driveLink,
                            fileBase64: "EMPTY_FOLDER"
                        };

                        if (BACKEND_API_URL && !BACKEND_API_URL.startsWith("PASTE_")) {
                            try {
                                const response = await fetch(BACKEND_API_URL, {
                                    method: "POST",
                                    body: JSON.stringify(payload)
                                });
                                if (response.ok) {
                                    const resData = await response.json();
                                    if (resData.status === "SUCCESS") {
                                        clonedDoc.driveLink = resData.driveLink || clonedDoc.driveLink;
                                    }
                                }
                            } catch (backendErr) {
                                console.warn("Google Apps Script paste fetch bypassed:", backendErr);
                            }
                        }

                        await setDoc(fbDoc(db, "files", clonedDoc.id), {
                            title: clonedDoc.title,
                            category: clonedDoc.category,
                            parentFolder: clonedDoc.parentFolder,
                            description: clonedDoc.description,
                            driveLink: clonedDoc.driveLink || "javascript:void(0)",
                            assetType: 'File',
                            fileSize: clonedDoc.fileSize,
                            createdAt: new Date().toISOString()
                        });

                        fileInventory.push(clonedDoc);
                        successCount++;
                    } catch (e) {
                         console.error("Paste sync failure details:", e);
                    }
                } else if (item.type === 'folder') {
                    const folderId = item.id;

                    // Check nested hierarchy
                    const nestedIds = getNestedItemsToDelete(folderId);
                    if (nestedIds.includes(activeFolderId)) {
                        showToast("A folder cannot be copied inside itself or nested underneath its own structure.", "error");
                        continue;
                    }

                    const folderDoc = folderInventory.find(it => it.id === folderId);
                    if (!folderDoc) continue;

                    let newFolderName = folderDoc.title || "Untitled Folder";
                    let folderExists = folderInventory.some(f => f.parentFolder === activeFolderId && f.title === newFolderName);
                    while (folderExists) {
                        newFolderName = newFolderName + " - Copy";
                        folderExists = folderInventory.some(f => f.parentFolder === activeFolderId && f.title === newFolderName);
                    }

                    // 1. Clone top-level folder
                    const clonedFolderId = "VAL-" + Math.floor(1000 + Math.random() * 9000);
                    const clonedFolder = {
                        id: clonedFolderId,
                        title: newFolderName,
                        category: 'Directory',
                        parentFolder: activeFolderId,
                        description: folderDoc.description || "",
                        driveLink: folderDoc.driveLink || "javascript:void(0)",
                        assetType: 'Folder'
                    };

                    const recordsToSync = [clonedFolder];

                    // 2. Recursively clone descendants
                    const queue = [{ src: folderId, dst: clonedFolderId }];

                    while (queue.length > 0) {
                        const current = queue.shift();
                        const descendantFiles = fileInventory.filter(it => it.parentFolder === current.src);
                        const descendantFolders = folderInventory.filter(it => it.parentFolder === current.src);

                        descendantFolders.forEach(child => {
                            const newChildId = "VAL-" + Math.floor(1000 + Math.random() * 9000);
                            const clonedDoc = {
                                id: newChildId,
                                title: child.title,
                                category: 'Directory',
                                parentFolder: current.dst,
                                description: child.description || "",
                                driveLink: child.driveLink || "javascript:void(0)",
                                assetType: 'Folder'
                            };
                            recordsToSync.push(clonedDoc);
                            queue.push({ src: child.id, dst: newChildId });
                        });

                        descendantFiles.forEach(child => {
                            const newChildId = "VAL-" + Math.floor(1000 + Math.random() * 9000);
                            const clonedDoc = {
                                id: newChildId,
                                title: child.title,
                                category: child.category || "Other",
                                parentFolder: current.dst,
                                description: child.description || "",
                                driveLink: child.driveLink,
                                assetType: 'File',
                                fileSize: child.fileSize || "N/A"
                            };
                            recordsToSync.push(clonedDoc);
                        });
                    }

                    try {
                        for (const rec of recordsToSync) {
                            const payload = {
                                action: "upload",
                                id: rec.id,
                                title: rec.title,
                                fileName: rec.title,
                                folderName: rec.title,
                                assetType: rec.assetType,
                                parentFolder: rec.parentFolder,
                                fileCategory: rec.category,
                                fileDescription: rec.description,
                                driveLink: rec.driveLink,
                                fileBase64: "EMPTY_FOLDER"
                            };

                            if (BACKEND_API_URL && !BACKEND_API_URL.startsWith("PASTE_")) {
                                try {
                                    const response = await fetch(BACKEND_API_URL, {
                                        method: "POST",
                                        body: JSON.stringify(payload)
                                    });
                                    if (response.ok) {
                                        const resData = await response.json();
                                        if (resData.status === "SUCCESS") {
                                            rec.driveLink = resData.driveLink || rec.driveLink || "javascript:void(0)";
                                        }
                                    }
                                } catch (backendErr) {
                                    console.warn(`Google Apps Script paste recursive fetch bypassed for ${rec.title}:`, backendErr);
                                }
                            }

                            const collName = rec.assetType === 'Folder' ? 'folders' : 'files';
                            const dbPayload = {
                                title: rec.title,
                                category: rec.category,
                                parentFolder: rec.parentFolder,
                                description: rec.description,
                                driveLink: rec.driveLink || "javascript:void(0)",
                                assetType: rec.assetType,
                                createdAt: new Date().toISOString()
                            };
                            if (rec.assetType === 'File') {
                                dbPayload.fileSize = rec.fileSize || "N/A";
                            }

                            await setDoc(fbDoc(db, collName, rec.id), dbPayload);

                            if (rec.assetType === 'Folder') {
                                folderInventory.push(rec);
                            } else {
                                fileInventory.push(rec);
                            }
                        }
                        successCount++;
                    } catch (e) {
                        console.error("Paste folder structure failure details:", e);
                    }
                }
            }

            if (successCount > 0) {
                showToast(`Pasted successfully!`, "success");
                try {
                    sessionStorage.setItem("vault_clipboard_hidden", "true");
                } catch (hErr) {}
            } else {
                showToast(`Paste operation found no items to duplicate.`, "info");
            }

            if (pasteBtn) {
                pasteBtn.disabled = false;
                pasteBtn.innerHTML = originalText;
            }
            window.updateClipboardUI();
            renderVault();
            fetchDatabase();
        };

        // MULTIPLE SELECTION MANAGEMENT
        let selectedItems = [];

        window.toggleCardSelection = function(checkbox) {
            const id = checkbox.getAttribute('data-id');
            const type = checkbox.getAttribute('data-type');
            if (checkbox.checked) {
                if (!selectedItems.some(it => it.id === id)) {
                    selectedItems.push({ id, type });
                }
            } else {
                selectedItems = selectedItems.filter(it => it.id !== id);
            }
            window.updateMultiSelectBar();
        };

        window.clearSelected = function() {
            selectedItems = [];
            document.querySelectorAll('.card-select-checkbox').forEach(cb => cb.checked = false);
            window.updateMultiSelectBar();
        };

        window.updateMultiSelectBar = function() {
            const count = selectedItems.length;
            const bar = document.getElementById('multiSelectBar');
            const countEl = document.getElementById('multiSelectCount');
            if (bar && countEl) {
                if (count > 0) {
                    countEl.innerText = `${count} ${count === 1 ? 'item' : 'items'} selected`;
                    bar.classList.add('active');
                } else {
                    bar.classList.remove('active');
                }
            }
        };

        window.multiCopySelected = function() {
            if (selectedItems.length === 0) return;
            const items = [...selectedItems];
            clipboard = {
                isMulti: true,
                items: items
            };
            try {
                sessionStorage.setItem("vault_clipboard_storage", JSON.stringify(clipboard));
                sessionStorage.setItem("vault_clipboard_hidden", "false");
                showToast(`Copied ${items.length} items to clipboard!`, "success");
            } catch(e) {}
            window.updateClipboardUI();
            clearSelected();
        };

        // RELOCATION MOVE FUNCTIONS
        window.triggerMove = function(event, type, id) {
            if (event) event.stopPropagation();
            
            document.querySelectorAll('.options-dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });

            document.getElementById('moveTargetType').value = type;
            document.getElementById('moveTargetId').value = id;

            const selectEl = document.getElementById('moveDestinationSelect');
            if (selectEl) {
                selectEl.innerHTML = '';

                const rootOpt = document.createElement('option');
                rootOpt.value = 'root';
                rootOpt.textContent = '📁 ROOT (Main Vault)';
                selectEl.appendChild(rootOpt);

                const restrictedIds = [];
                if (type === 'folder') {
                    const nested = getNestedItemsToDelete(id);
                    nested.forEach(nestedId => {
                        if (!restrictedIds.includes(nestedId)) restrictedIds.push(nestedId);
                    });
                    if (!restrictedIds.includes(id)) restrictedIds.push(id);
                }

                folderInventory.forEach(f => {
                    if (restrictedIds.includes(f.id)) return;
                    const opt = document.createElement('option');
                    opt.value = f.id;
                    opt.textContent = `📁 ${f.title}`;
                    selectEl.appendChild(opt);
                });
            }

            document.getElementById('moveModal').classList.add('active');
        };

        window.closeMoveModal = function() {
            document.getElementById('moveModal').classList.remove('active');
            document.getElementById('moveForm').reset();
        };

        window.multiMoveSelected = function() {
            if (selectedItems.length === 0) return;

            document.getElementById('moveTargetType').value = 'multi';
            document.getElementById('moveTargetId').value = JSON.stringify(selectedItems);

            const selectEl = document.getElementById('moveDestinationSelect');
            if (selectEl) {
                selectEl.innerHTML = '';

                const rootOpt = document.createElement('option');
                rootOpt.value = 'root';
                rootOpt.textContent = '📁 ROOT (Main Vault)';
                selectEl.appendChild(rootOpt);

                const restrictedIds = [];
                selectedItems.filter(it => it.type === 'folder').forEach(foldItem => {
                    const nested = getNestedItemsToDelete(foldItem.id);
                    nested.forEach(nestedId => {
                        if (!restrictedIds.includes(nestedId)) restrictedIds.push(nestedId);
                    });
                    if (!restrictedIds.includes(foldItem.id)) restrictedIds.push(foldItem.id);
                });

                folderInventory.forEach(f => {
                    if (restrictedIds.includes(f.id)) return;
                    const opt = document.createElement('option');
                    opt.value = f.id;
                    opt.textContent = `📁 ${f.title}`;
                    selectEl.appendChild(opt);
                });
            }

            document.getElementById('moveModal').classList.add('active');
        };

        document.getElementById('moveForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const type = document.getElementById('moveTargetType').value;
            const targetId = document.getElementById('moveTargetId').value;
            const destinationId = document.getElementById('moveDestinationSelect').value;
            const submitBtn = document.getElementById('submitMoveBtn');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerText = "MOVING...";

            try {
                if (type === 'multi') {
                    const itemsToMove = JSON.parse(targetId);
                    const movePromises = itemsToMove.map(async (item) => {
                        const collName = item.type === 'folder' ? 'folders' : 'files';
                        await updateDoc(fbDoc(db, collName, item.id), { parentFolder: destinationId });
                        if (item.type === 'folder') {
                            const idx = folderInventory.findIndex(it => it.id === item.id);
                            if (idx !== -1) folderInventory[idx].parentFolder = destinationId;
                        } else {
                            const idx = fileInventory.findIndex(it => it.id === item.id);
                            if (idx !== -1) fileInventory[idx].parentFolder = destinationId;
                        }
                    });
                    await Promise.all(movePromises);
                    showToast(`Successfully relocated ${itemsToMove.length} items!`, "success");
                } else {
                    const collName = type === 'folder' ? 'folders' : 'files';
                    await updateDoc(fbDoc(db, collName, targetId), { parentFolder: destinationId });
                    if (type === 'folder') {
                        const idx = folderInventory.findIndex(it => it.id === targetId);
                        if (idx !== -1) folderInventory[idx].parentFolder = destinationId;
                        showToast(`Directory relocated successfully!`, "success");
                    } else {
                        const idx = fileInventory.findIndex(it => it.id === targetId);
                        if (idx !== -1) fileInventory[idx].parentFolder = destinationId;
                        showToast(`Document relocated successfully!`, "success");
                    }
                }
                closeMoveModal();
                clearSelected();
                renderVault();
                fetchDatabase();
            } catch (err) {
                console.error("Relocate failure:", err);
                showToast("Relocate failed!", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });

        window.multiDeleteSelected = function() {
            if (selectedItems.length === 0) return;

            document.getElementById('deleteTargetType').value = 'multi';
            document.getElementById('deleteTargetId').value = JSON.stringify(selectedItems);

            const promptEl = document.getElementById('deletePromptMessage');
            if (promptEl) {
                promptEl.innerText = `You are about to permanently delete the ${selectedItems.length} selected item(s). Any folders selected will delete their contents recursively.`;
            }

            document.getElementById('deleteModal').classList.add('active');
        };

        // Start checking registry sync on system initialization load
        fetchDatabase();
