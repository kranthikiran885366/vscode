import { execSync } from 'child_process'
import { join } from 'path'

interface GitStatus {
  branch: string
  modified: string[]
  staged: string[]
  untracked: string[]
}

interface CommitInfo {
  hash: string
  author: string
  message: string
  date: string
}

export class GitService {
  private projectPath: string

  constructor(projectPath: string) {
    this.projectPath = projectPath
  }

  static init(projectPath: string): boolean {
    try {
      execSync('git init', { cwd: projectPath })
      execSync('git config user.email "zencode@mvksolutions.com"', { cwd: projectPath })
      execSync('git config user.name "ZenCode AI"', { cwd: projectPath })
      return true
    } catch (error) {
      console.error('Git init error:', error)
      return false
    }
  }

  getStatus(): GitStatus {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: this.projectPath })
        .toString()
        .trim()

      const statusOutput = execSync('git status --porcelain', { cwd: this.projectPath })
        .toString()
        .split('\n')
        .filter(Boolean)

      const modified: string[] = []
      const staged: string[] = []
      const untracked: string[] = []

      statusOutput.forEach((line) => {
        const status = line.substring(0, 2)
        const filePath = line.substring(3)

        if (status === '??') {
          untracked.push(filePath)
        } else if (status.startsWith('M') || status.endsWith('M')) {
          modified.push(filePath)
        } else if (status.startsWith('A') || status.startsWith('D')) {
          staged.push(filePath)
        }
      })

      return { branch, modified, staged, untracked }
    } catch (error) {
      console.error('Git status error:', error)
      return { branch: 'unknown', modified: [], staged: [], untracked: [] }
    }
  }

  add(files: string[]): boolean {
    try {
      if (files.length === 0) {
        execSync('git add .', { cwd: this.projectPath })
      } else {
        execSync(`git add ${files.join(' ')}`, { cwd: this.projectPath })
      }
      return true
    } catch (error) {
      console.error('Git add error:', error)
      return false
    }
  }

  commit(message: string): boolean {
    try {
      execSync(`git commit -m "${message}"`, { cwd: this.projectPath })
      return true
    } catch (error) {
      console.error('Git commit error:', error)
      return false
    }
  }

  getLog(limit = 10): CommitInfo[] {
    try {
      const logOutput = execSync(
        `git log --oneline -${limit} --pretty=format:"%H|%an|%s|%ai"`,
        { cwd: this.projectPath }
      )
        .toString()
        .split('\n')
        .filter(Boolean)

      return logOutput.map((line) => {
        const [hash, author, message, date] = line.split('|')
        return { hash: hash.substring(0, 7), author, message, date }
      })
    } catch (error) {
      console.error('Git log error:', error)
      return []
    }
  }

  push(remote = 'origin', branch = 'main'): boolean {
    try {
      execSync(`git push ${remote} ${branch}`, { cwd: this.projectPath })
      return true
    } catch (error) {
      console.error('Git push error:', error)
      return false
    }
  }

  pull(remote = 'origin', branch = 'main'): boolean {
    try {
      execSync(`git pull ${remote} ${branch}`, { cwd: this.projectPath })
      return true
    } catch (error) {
      console.error('Git pull error:', error)
      return false
    }
  }

  addRemote(name: string, url: string): boolean {
    try {
      execSync(`git remote add ${name} ${url}`, { cwd: this.projectPath })
      return true
    } catch (error) {
      console.error('Git remote add error:', error)
      return false
    }
  }

  createBranch(branchName: string): boolean {
    try {
      execSync(`git checkout -b ${branchName}`, { cwd: this.projectPath })
      return true
    } catch (error) {
      console.error('Git branch creation error:', error)
      return false
    }
  }

  mergeBranch(branchName: string): boolean {
    try {
      execSync(`git merge ${branchName}`, { cwd: this.projectPath })
      return true
    } catch (error) {
      console.error('Git merge error:', error)
      return false
    }
  }
}
