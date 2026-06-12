'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import CodeEditor from '@/components/editor/CodeEditor'
import { useProjectStore, useFileStore } from '@/lib/store/useAppStore'
import { useFiles } from '@/lib/hooks/useApi'

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const { currentProject, setCurrentProject, projects } = useProjectStore()
  const { files, currentFile, openTabs, openFile, setCurrentFile, updateFile } = useFileStore()
  const { fetchFiles, createFile, updateFile: updateFileApi } = useFiles(projectId)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Load project
        const project = projects.find((p) => p._id === projectId)
        if (project) {
          setCurrentProject(project)
        }

        // Load files
        await fetchFiles(projectId)
      } catch (error) {
        console.error('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [projectId])

  const handleCreateFile = async () => {
    const name = prompt('Enter file name:')
    if (!name) return

    try {
      await createFile(name)
      await fetchFiles(projectId)
    } catch (error) {
      console.error('Failed to create file')
    }
  }

  const handleSaveFile = async () => {
    if (!currentFile) return

    try {
      await updateFileApi(currentFile._id, currentFile.content, 'File updated')
      updateFile(currentFile._id, currentFile.content)
    } catch (error) {
      console.error('Failed to save file')
    }
  }

  if (loading) {
    return <MainLayout>Loading...</MainLayout>
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-200px)] flex flex-col">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800 flex items-center bg-gray-50 dark:bg-gray-950">
          {openTabs.map((file) => (
            <button
              key={file._id}
              onClick={() => setCurrentFile(file)}
              className={`px-4 py-2 text-sm border-b-2 transition ${
                currentFile?._id === file._id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              {file.name}
            </button>
          ))}
          <button
            onClick={handleCreateFile}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            + New File
          </button>
        </div>

        {/* Editor */}
        {currentFile ? (
          <div className="flex-1 flex flex-col">
            <CodeEditor
              fileId={currentFile._id}
              initialContent={currentFile.content}
              language={currentFile.language}
              onChange={(content) => updateFile(currentFile._id, content)}
            />
            <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-end gap-2">
              <button
                onClick={handleSaveFile}
                className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No file selected. Create a new file to get started.
          </div>
        )}
      </div>
    </MainLayout>
  )
}
