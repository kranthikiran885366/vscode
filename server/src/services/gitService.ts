import { execSync, spawnSync } from 'child_process'
import { join } from 'path'
import { logger } from '../utils/logger'

export interface GitStatus {
  branch: string
  modified: string[]
  staged: string[]
  untracked: string[]
  ahead?: number
  behind?: number
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
      logger.info('Git repository initialized', 'GIT_SERVICE', { path: projectPath })
      return true
    } catch (error) {
      logger.error('Git init error', 'GIT_SERVICE', error)
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

      // Get ahead/behind counts
      let ahead = 0
      let behind = 0
      try {
        const aheadBehind = execSync('git rev-list --left-right --count @{u}...HEAD', {
          cwd: this.projectPath,
        })
          .toString()
          .trim()
          .split('\t')
        behind = parseInt(aheadBehind[0]) || 0
        ahead = parseInt(aheadBehind[1]) || 0
      } catch {
        // No remote tracking branch
      }

      return { branch, modified, staged, untracked, ahead, behind }
    } catch (error) {
      logger.error('Git status error', 'GIT_SERVICE', error)
      return { branch: 'unknown', modified: [], staged: [], untracked: [] }
    }
  }

  add(files: string[]): boolean {
    try {
      if (files.length === 0) {
        execSync('git add .', { cwd: this.projectPath })
      } else {
        execSync(`git add ${files.map((f) => `"${f}"`).join(' ')}`, { cwd: this.projectPath })
      }
      logger.info('Files staged', 'GIT_SERVICE', { fileCount: files.length })
      return true
    } catch (error) {
      logger.error('Git add error', 'GIT_SERVICE', error)
      return false
    }
  }

  commit(message: string, author?: string): boolean {
    try {
      let cmd = `git commit -m "${message.replace(/"/g, '\\"')}"`
      if (author) {
        cmd += ` --author="${author}"`
      }
      execSync(cmd, { cwd: this.projectPath })
      logger.info('Commit created', 'GIT_SERVICE', { message })
      return true
    } catch (error) {
      logger.error('Git commit error', 'GIT_SERVICE', error)
      return false
    }
  }

  getDiff(file?: string): string {
    try {
      const cmd = file ? `git diff ${file}` : 'git diff'
      return execSync(cmd, { cwd: this.projectPath }).toString()
    } catch (error) {
      logger.error('Git diff error', 'GIT_SERVICE', error)
      return ''
    }
  }

  getStagedDiff(file?: string): string {
    try {
      const cmd = file ? `git diff --cached ${file}` : 'git diff --cached'
      return execSync(cmd, { cwd: this.projectPath }).toString()
    } catch (error) {
      logger.error('Git staged diff error', 'GIT_SERVICE', error)
      return ''
    }
  }

  getBlame(file: string): string {
    try {
      return execSync(`git blame ${file}`, { cwd: this.projectPath }).toString()
    } catch (error) {
      logger.error('Git blame error', 'GIT_SERVICE', error)
      return ''
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
      logger.error('Git log error', 'GIT_SERVICE', error)
      return []
    }
  }

  push(remote = 'origin', branch = 'main'): boolean {
    try {
      execSync(`git push ${remote} ${branch}`, { cwd: this.projectPath })
      logger.info('Pushed to remote', 'GIT_SERVICE', { remote, branch })
      return true
    } catch (error) {
      logger.error('Git push error', 'GIT_SERVICE', error)
      return false
    }
  }

  pull(remote = 'origin', branch = 'main'): boolean {
    try {
      execSync(`git pull ${remote} ${branch}`, { cwd: this.projectPath })
      logger.info('Pulled from remote', 'GIT_SERVICE', { remote, branch })
      return true
    } catch (error) {
      logger.error('Git pull error', 'GIT_SERVICE', error)
      return false
    }
  }

  addRemote(name: string, url: string): boolean {
    try {
      execSync(`git remote add ${name} ${url}`, { cwd: this.projectPath })
      logger.info('Remote added', 'GIT_SERVICE', { name })
      return true
    } catch (error) {
      logger.error('Git remote add error', 'GIT_SERVICE', error)
      return false
    }
  }

  createBranch(branchName: string): boolean {
    try {
      execSync(`git checkout -b ${branchName}`, { cwd: this.projectPath })
      logger.info('Branch created', 'GIT_SERVICE', { branchName })
      return true
    } catch (error) {
      logger.error('Git branch creation error', 'GIT_SERVICE', error)
      return false
    }
  }

  deleteBranch(branchName: string, force = false): boolean {
    try {
      const flag = force ? '-D' : '-d'
      execSync(`git branch ${flag} ${branchName}`, { cwd: this.projectPath })
      logger.info('Branch deleted', 'GIT_SERVICE', { branchName })
      return true
    } catch (error) {
      logger.error('Git branch delete error', 'GIT_SERVICE', error)
      return false
    }
  }

  mergeBranch(branchName: string): boolean {
    try {
      execSync(`git merge ${branchName}`, { cwd: this.projectPath })
      logger.info('Branch merged', 'GIT_SERVICE', { branchName })
      return true
    } catch (error) {
      logger.error('Git merge error', 'GIT_SERVICE', error)
      return false
    }
  }

  rebaseBranch(branchName: string): boolean {
    try {
      execSync(`git rebase ${branchName}`, { cwd: this.projectPath })
      logger.info('Branch rebased', 'GIT_SERVICE', { branchName })
      return true
    } catch (error) {
      logger.error('Git rebase error', 'GIT_SERVICE', error)
      return false
    }
  }

  listBranches(): string[] {
    try {
      const output = execSync('git branch -a', { cwd: this.projectPath }).toString()
      return output
        .split('\n')
        .filter(Boolean)
        .map((b) => b.replace(/^[\*\s]+/, ''))
    } catch (error) {
      logger.error('Git list branches error', 'GIT_SERVICE', error)
      return []
    }
  }

  getCurrentBranch(): string {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { cwd: this.projectPath })
        .toString()
        .trim()
    } catch (error) {
      logger.error('Git get branch error', 'GIT_SERVICE', error)
      return 'unknown'
    }
  }

  switchBranch(branchName: string): boolean {
    try {
      execSync(`git checkout ${branchName}`, { cwd: this.projectPath })
      logger.info('Branch switched', 'GIT_SERVICE', { branchName })
      return true
    } catch (error) {
      logger.error('Git switch branch error', 'GIT_SERVICE', error)
      return false
    }
  }

  stash(): boolean {
    try {
      execSync('git stash', { cwd: this.projectPath })
      logger.info('Changes stashed', 'GIT_SERVICE')
      return true
    } catch (error) {
      logger.error('Git stash error', 'GIT_SERVICE', error)
      return false
    }
  }

  stashPop(): boolean {
    try {
      execSync('git stash pop', { cwd: this.projectPath })
      logger.info('Stash popped', 'GIT_SERVICE')
      return true
    } catch (error) {
      logger.error('Git stash pop error', 'GIT_SERVICE', error)
      return false
    }
  }

  /**
   * Get commit history with stats
   */
  getCommitHistory(limit: number = 50): CommitInfo[] {
    try {
      const logOutput = execSync(
        `git log -${limit} --pretty=format:"%H|%an|%s|%ai|%b"`,
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
      logger.error('Get commit history error', 'GIT_SERVICE', error)
      return []
    }
  }

  /**
   * Get detailed commit info
   */
  getCommitDetail(hash: string): any {
    try {
      const detail = execSync(`git show ${hash} --stat`, { cwd: this.projectPath })
        .toString()

      return {
        hash: hash.substring(0, 7),
        detail,
      }
    } catch (error) {
      logger.error('Get commit detail error', 'GIT_SERVICE', error)
      return null
    }
  }

  /**
   * Revert a commit
   */
  revertCommit(hash: string): boolean {
    try {
      execSync(`git revert ${hash} --no-edit`, { cwd: this.projectPath })
      logger.info('Commit reverted', 'GIT_SERVICE', { hash })
      return true
    } catch (error) {
      logger.error('Revert commit error', 'GIT_SERVICE', error)
      return false
    }
  }

  /**
   * Reset to commit
   */
  resetToCommit(hash: string, hard: boolean = false): boolean {
    try {
      const flag = hard ? '--hard' : '--soft'
      execSync(`git reset ${flag} ${hash}`, { cwd: this.projectPath })
      logger.info('Reset to commit', 'GIT_SERVICE', { hash, hard })
      return true
    } catch (error) {
      logger.error('Reset commit error', 'GIT_SERVICE', error)
      return false
    }
  }

  /**
   * Get repository statistics
   */
  getRepoStats(): any {
    try {
      const commits = execSync('git rev-list --all --count', { cwd: this.projectPath })
        .toString()
        .trim()

      const branches = this.listBranches().length

      const authors = execSync(
        'git log --format=%an | sort -u | wc -l',
        { cwd: this.projectPath }
      )
        .toString()
        .trim()

      const latestTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "none"', {
        cwd: this.projectPath,
      })
        .toString()
        .trim()

      return {
        totalCommits: parseInt(commits),
        totalBranches: branches,
        totalAuthors: parseInt(authors),
        latestTag,
      }
    } catch (error) {
      logger.error('Get repo stats error', 'GIT_SERVICE', error)
      return null
    }
  }

  /**
   * Create a tag
   */
  createTag(tagName: string, message?: string): boolean {
    try {
      if (message) {
        execSync(`git tag -a ${tagName} -m "${message}"`, { cwd: this.projectPath })
      } else {
        execSync(`git tag ${tagName}`, { cwd: this.projectPath })
      }
      logger.info('Tag created', 'GIT_SERVICE', { tagName })
      return true
    } catch (error) {
      logger.error('Create tag error', 'GIT_SERVICE', error)
      return false
    }
  }

  /**
   * List tags
   */
  listTags(): string[] {
    try {
      const output = execSync('git tag', { cwd: this.projectPath }).toString()
      return output.split('\n').filter(Boolean)
    } catch (error) {
      logger.error('List tags error', 'GIT_SERVICE', error)
      return []
    }
  }

  /**
   * Delete a tag
   */
  deleteTag(tagName: string): boolean {
    try {
      execSync(`git tag -d ${tagName}`, { cwd: this.projectPath })
      logger.info('Tag deleted', 'GIT_SERVICE', { tagName })
      return true
    } catch (error) {
      logger.error('Delete tag error', 'GIT_SERVICE', error)
      return false
    }
  }

  /**
   * Cherry-pick a commit
   */
  cherryPick(hash: string): boolean {
    try {
      execSync(`git cherry-pick ${hash}`, { cwd: this.projectPath })
      logger.info('Cherry-pick applied', 'GIT_SERVICE', { hash })
      return true
    } catch (error) {
      logger.error('Cherry-pick error', 'GIT_SERVICE', error)
      return false
    }
  }

  /**
   * Squash commits
   */
  squashCommits(count: number): boolean {
    try {
      execSync(`git reset --soft HEAD~${count} && git commit`, { cwd: this.projectPath })
      logger.info('Commits squashed', 'GIT_SERVICE', { count })
      return true
    } catch (error) {
      logger.error('Squash commits error', 'GIT_SERVICE', error)
      return false
    }
  }
}
