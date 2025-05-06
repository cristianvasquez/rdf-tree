#!/usr/bin/env node

import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { createServer } from 'vite'
import { fileURLToPath } from 'url'

// Get the directory where the script is installed
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const turtleFilePath = process.argv[2]

if (!turtleFilePath) {
  console.error('Please provide a Turtle/TriG file path.')
  process.exit(1)
}

if (!fs.existsSync(turtleFilePath)) {
  console.error('File not found:', turtleFilePath)
  process.exit(1)
}

async function loadAndServe() {
  let server
  try {
    // Create a temporary symbolic link in the public directory relative to the package
    const publicDir = path.join(__dirname, 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir)
    }

    const fileName = path.basename(turtleFilePath)
    const linkPath = path.join(publicDir, fileName)

    // Remove existing symlink if it exists
    if (fs.existsSync(linkPath)) {
      fs.unlinkSync(linkPath)
    }

    // Create symlink using absolute paths
    fs.symlinkSync(path.resolve(turtleFilePath), linkPath)

    // Start the Vite server with the correct config path
    server = await createServer({
      configFile: path.join(__dirname, 'vite.config.js'),
      root: __dirname,
      envPrefix: 'VITE_',
      define: {
        'import.meta.env.VITE_INITIAL_RDF_FILE': JSON.stringify(`/${fileName}`),
      },
    })

    await server.listen()

    const url = `http://localhost:${server.config.server.port}`
    console.log('Starting server with RDF file:', fileName)
    console.log('Server URL:', url)
    console.log('Press Ctrl+C to stop the server')

    // Platform-specific browser opening
    const platform = process.platform
    let command

    switch (platform) {
      case 'win32':
        command = `start ${url}`
        break
      case 'darwin':
        command = `open ${url}`
        break
      default:
        command = `xdg-open ${url}`
        break
    }

    exec(command, (error) => {
      if (error) {
        console.error('Failed to open browser:', error)
      }
    })

    const cleanup = async () => {
      console.log('\nShutting down...')
      if (fs.existsSync(linkPath)) {
        fs.unlinkSync(linkPath)
      }
      if (server) {
        await server.close()
      }
      process.exit(0)
    }

    // Handle various exit signals
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('exit', cleanup)

  } catch (err) {
    console.error('Error:', err)
    if (server) {
      await server.close()
    }
    process.exit(1)
  }
}

await loadAndServe()
