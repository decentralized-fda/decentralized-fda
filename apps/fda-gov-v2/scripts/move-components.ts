const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Components to move (not duplicates)
const componentsToMove: string[] = ['dialog.tsx', 'theme-provider.tsx', 'icons.tsx']

// Components to delete (duplicates)
const componentsToDelete: string[] = [
  'button.tsx', 'switch.tsx', 'checkbox.tsx', 'badge.tsx',
  'select.tsx', 'radio-group.tsx', 'separator.tsx', 'progress.tsx',
  'tabs.tsx', 'textarea.tsx', 'label.tsx', 'input.tsx', 'sheet.tsx',
  'tooltip.tsx', 'card.tsx', 'alert.tsx'
]

function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory ${dir} does not exist`)
  }
}

function moveFile(sourcePath: string, destPath: string): void {
  try {
    if (fs.existsSync(sourcePath)) {
      // Check if destination file exists
      if (fs.existsSync(destPath)) {
        const sourceContent: string = fs.readFileSync(sourcePath, 'utf8')
        const destContent: string = fs.readFileSync(destPath, 'utf8')
        
        if (sourceContent === destContent) {
          console.log(`${path.basename(sourcePath)} is identical, removing source`)
          fs.unlinkSync(sourcePath)
        } else {
          console.warn(`Warning: ${path.basename(sourcePath)} differs from UI version, keeping UI version`)
          fs.unlinkSync(sourcePath)
        }
      } else {
        fs.copyFileSync(sourcePath, destPath)
        fs.unlinkSync(sourcePath)
        console.log(`Moved ${path.basename(sourcePath)} to ui directory`)
      }
    }
  } catch (error) {
    console.error(`Error moving file ${sourcePath}:`, error)
    process.exit(1)
  }
}

function updateImports(files: string[]): void {
  files.forEach((file: string) => {
    try {
      const filePath: string = path.join(process.cwd(), file)
      let content: string = fs.readFileSync(filePath, 'utf8')
      let hasChanges: boolean = false

      // Update imports for moved components
      componentsToMove.forEach((component: string) => {
        const componentName: string = path.basename(component, path.extname(component))
        const oldImport: RegExp = new RegExp(`from ["']@/components/${componentName}["']`, 'g')
        const newImport: string = `from "@/components/ui/${componentName}"`
        
        if (oldImport.test(content)) {
          content = content.replace(oldImport, newImport)
          hasChanges = true
          console.log(`Updated imports in ${file} for ${componentName}`)
        }
      })

      if (hasChanges) {
        fs.writeFileSync(filePath, content)
      }
    } catch (error) {
      console.error(`Error updating imports in ${file}:`, error)
      process.exit(1)
    }
  })
}

try {
  const componentsDir: string = path.join(process.cwd(), 'components')
  const uiDir: string = path.join(componentsDir, 'ui')

  // Verify directories exist
  ensureDirectoryExists(componentsDir)
  ensureDirectoryExists(uiDir)

  // Move unique components
  componentsToMove.forEach((file: string) => {
    const sourcePath: string = path.join(componentsDir, file)
    const destPath: string = path.join(uiDir, file)
    moveFile(sourcePath, destPath)
  })

  // Delete duplicate components
  componentsToDelete.forEach((file: string) => {
    const filePath: string = path.join(componentsDir, file)
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`Deleted duplicate ${file}`)
      }
    } catch (error) {
      console.error(`Error deleting ${file}:`, error)
      process.exit(1)
    }
  })

  // Update imports in all TypeScript/JavaScript files
  const files: string[] = glob.sync('**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', '.next/**', 'scripts/**'],
    cwd: process.cwd()
  })

  updateImports(files)

  console.log('Component migration completed successfully!')
} catch (error) {
  console.error('Migration failed:', error)
  process.exit(1)
} 