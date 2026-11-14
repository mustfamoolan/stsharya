delete process.env.ELECTRON_RUN_AS_NODE

import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc'

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in Main Process:', error)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection in Main Process:', reason)
})

function createWindow(): void {
  const isDev = process.env.NODE_ENV === 'development' || !!process.env['ELECTRON_RENDERER_URL']
  const iconPath = join(__dirname, '../../resources/icon.ico')

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 960,
    minHeight: 650,
    show: false,
    autoHideMenuBar: true,
    title: 'الاستشارية',
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.alestsharia.app')
  }

  // Register clean IPC handlers
  registerIpcHandlers()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
