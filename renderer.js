// Menggunakan querySelector karena struktur HTML telah diperbarui
const applyBtn = document.getElementById("applyBtn");
const pasteBtn = document.getElementById("pasteBtn");
const resetBtn = document.getElementById("resetBtn");
const defaultBtn = document.getElementById("defaultBtn");
const smoothBtn = document.getElementById("smoothBtn");
const jsonInput = document.getElementById("jsonInput");

// Check for updates when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Check for updates in the background (with delay to not slow down app startup)
  setTimeout(async () => {
    try {
      const updateResult = await window.electronAPI.checkForUpdates();
      // Only show update notification if update is available and user chose to update
      if (updateResult.updateAvailable && updateResult.action === 0) {
        // User chose to update now, already handled in main process
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, 3000); // Delay check by 3 seconds to not slow app startup

  // Load existing Roblox settings when the page loads (fully automatic)
  try {
    const result = await window.electronAPI.readRobloxSettings();
    if (result.success) {
      jsonInput.value = result.content;

      // Show a notification that settings were loaded (same style as reset button)
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ECC71;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
      `;
      notification.textContent = '📋 Existing settings loaded from Roblox!';
      document.body.appendChild(notification);

      // Remove notification after 3 seconds
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    } else {
      // Show a notification that no settings were found with more specific message
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #F39C12;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
      `;
      // Check if the error message indicates the file doesn't exist vs is empty
      const errorMsg = result.error || '';
      let message = 'ℹ️ No existing settings found';
      if (errorMsg.includes('empty')) {
        message = 'ℹ️ Settings file is empty';
      } else if (errorMsg.includes('does not exist')) {
        message = 'ℹ️ No existing settings file found';
      }
      notification.textContent = message;
      document.body.appendChild(notification);

      // Remove notification after 3 seconds
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }
  } catch (error) {
    // Show error notification if there's an exception
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '❌ Error loading settings: ' + error.message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
});

// Tombol Apply
applyBtn.addEventListener("click", async () => {
  let content = jsonInput.value.trim();
  if (!content) {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '⚠️ Textbox is empty!';
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
    return;
  }

  // Validasi dan perbaiki format JSON jika perlu
  try {
    // Coba parse JSON untuk memastikan valid
    let parsedJson;
    try {
      parsedJson = JSON.parse(content);
    } catch (e) {
      // Jika parsing gagal, coba perbaiki format
      // Tambahkan kurung kurawal jika tidak ada
      if (!content.startsWith('{')) {
        content = '{' + content;
      }
      if (!content.endsWith('}')) {
        content = content + '}';
      }

      // Coba parsing lagi
      parsedJson = JSON.parse(content);
    }

    // Format JSON dengan benar
    content = JSON.stringify(parsedJson, null, 2);
  } catch (e) {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '❌ Invalid JSON format: ' + e.message;
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
    return;
  }

  const result = await window.electronAPI.saveJSON(content);

  if (result.success) {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2ECC71;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '✅ Success! Now open Roblox 🐱';
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);

    // Menutup aplikasi setelah notifikasi muncul
    setTimeout(() => window.close(), 2000);
  } else {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '❌ Failed to save file: ' + result.error;
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
});

// Tombol Paste
pasteBtn.addEventListener("click", async () => {
  const clipboardText = await window.electronAPI.readClipboard();
  if (clipboardText) {
    let content = clipboardText.trim();

    // Validasi dan perbaiki format JSON jika perlu
    try {
      // Coba parse JSON untuk memastikan valid
      let parsedJson;
      try {
        parsedJson = JSON.parse(content);
      } catch (e) {
        // Jika parsing gagal, coba perbaiki format
        // Tambahkan kurung kurawal jika tidak ada
        if (!content.startsWith('{')) {
          content = '{' + content;
        }
        if (!content.endsWith('}')) {
          content = content + '}';
        }

        // Coba parsing lagi
        parsedJson = JSON.parse(content);
      }

      // Format JSON dengan benar
      content = JSON.stringify(parsedJson, null, 2);
      jsonInput.value = content;

      // Tampilkan notifikasi bahwa JSON berhasil diformat
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ECC71;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
      `;
      notification.textContent = '📋 JSON successfully formatted and pasted!';
      document.body.appendChild(notification);

      // Hapus notifikasi setelah beberapa detik
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    } catch (e) {
      // Tampilkan notifikasi error
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #E74C3C;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
      `;
      notification.textContent = '❌ Invalid JSON format: ' + e.message;
      document.body.appendChild(notification);

      // Hapus notifikasi setelah beberapa detik
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  } else {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '⚠️ Clipboard kosong atau tidak bisa dibaca!';
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  }
});

// Tombol Default Lag-Ball
defaultBtn.addEventListener("click", async () => {
  const defaultSettings = `{
 "FFlagDebugSkyGray": "True",
 "DFIntTaskSchedulerTargetFps": "500",
 "FFlagDebugDisplayFPS": "True",
  "DFIntMaxAverageFrameDelayExceedFactor": "0",
  "DFIntMaxAcceptableUpdateDelay": "0",
  "DFIntTargetTimeDelayFacctorTenths": "1",
  "DFIntClientPacketMaxDelayMs": "0",
  "DFIntMaxFrameBufferSize": "1",
  "FIntInterpolationAwareTargetTimeLerpHundredth": "100"
}`;

  const result = await window.electronAPI.saveJSON(defaultSettings);

  if (result.success) {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2ECC71;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '✅ Lag-Ball settings applied successfully! Now open Roblox 🐱';
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);

    setTimeout(() => window.close(), 2000);
  } else {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '❌ Failed to apply Lag-Ball settings: ' + result.error;
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
});

// Tombol Default SmoothBall
smoothBtn.addEventListener("click", async () => {
  const smoothSettings = `{
 "FFlagDebugSkyGray": "True",
 "DFIntTaskSchedulerTargetFps": "500",
 "FFlagDebugDisplayFPS": "True",
"FIntInterpolationAwareTargetTimeLerpHundredth": "1",
"FIntNumFramesToCaptureCallStack": "1",
"DFIntTargetTimeDelayFacctorTenths": "1",
"DFIntClientPacketMaxDelayMs": "1",
"DFIntMaxFrameBufferSize": "-1",
"DFIntMaxFramesToSend": "1"
}`;

  const result = await window.electronAPI.saveJSON(smoothSettings);

  if (result.success) {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2ECC71;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '✅ SmoothBall settings applied successfully! Now open Roblox ⚽';
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);

    setTimeout(() => window.close(), 2000);
  } else {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '❌ Failed to apply SmoothBall settings: ' + result.error;
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
});

// Tombol Reset
resetBtn.addEventListener("click", async () => {
  // Kosongkan textarea
  jsonInput.value = "";

  // Simpan file kosong
  const result = await window.electronAPI.saveJSON("");

  if (result.success) {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2ECC71;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = '✅ File reset to default (empty)!';
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  } else {
    // Gunakan notifikasi berbasis DOM daripada alert
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E74C3C;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    notification.textContent = `❌ Failed to reset file: ${result.error}`;
    document.body.appendChild(notification);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  // Fokus langsung ke textarea tanpa menunggu alert
  setTimeout(() => {
    jsonInput.focus();
    jsonInput.select(); // Pilih seluruh teks agar siap untuk input
  }, 10);
});