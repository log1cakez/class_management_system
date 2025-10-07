"use client";

import { useState, useEffect, useCallback } from 'react'

export interface Student {
  id: string
  name: string
  points: number
  classId: string
  isSelected?: boolean
}

export function useStudents(classId: string | null, teacherId: string | null) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingPoints, setAddingPoints] = useState(false)
  const [creatingStudent, setCreatingStudent] = useState(false)

  const fetchStudents = useCallback(async () => {
    if (!classId || !teacherId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/students?classId=${classId}&teacherId=${teacherId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data.map((student: Student) => ({ ...student, isSelected: false })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [classId, teacherId])

  const addPointsToStudents = async (studentIds: string[], pointsToAdd: number, reason: string, behavior?: string) => {
    if (!teacherId) throw new Error('Teacher ID is required')

    setAddingPoints(true)
    setError(null)

    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds,
          pointsToAdd,
          reason,
          behavior,
          teacherId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to update student points')
      }

      const responseData = await response.json()
      
      // Handle different response formats
      if (responseData.success) {
        // New format with success flag
        console.log('Points updated successfully:', responseData.message)
        // Refresh student data to get updated points
        await fetchStudents()
        return responseData
      } else if (Array.isArray(responseData)) {
        // Original format with student array
        const updatedStudents = responseData
        
        // Update local state
        setStudents(prevStudents => 
          prevStudents.map(student => {
            const updatedStudent = updatedStudents.find((s: Student) => s.id === student.id)
            return updatedStudent ? { ...updatedStudent, isSelected: false } : student
          })
        )

        return updatedStudents
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (err) {
      console.error('Error in addPointsToStudents:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setAddingPoints(false)
    }
  }

  const toggleStudentSelection = (id: string) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === id
          ? { ...student, isSelected: !student.isSelected }
          : student
      )
    )
  }

  const toggleSelectAll = () => {
    const allSelected = students.every(student => student.isSelected)
    setStudents(prevStudents =>
      prevStudents.map(student => ({ ...student, isSelected: !allSelected }))
    )
  }

  const sortStudents = (sortBy: 'name' | 'points') => {
    setStudents(prevStudents => {
      const sorted = [...prevStudents].sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name)
        } else {
          return b.points - a.points // Descending order for points
        }
      })
      return sorted
    })
  }

  const createStudent = async (name: string) => {
    if (!classId || !teacherId) throw new Error('Class ID and Teacher ID are required')

    setCreatingStudent(true)
    setError(null)

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          classId,
          teacherId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create student')
      }

      const newStudent = await response.json()
      setStudents(prev => [...prev, { ...newStudent, isSelected: false }])
      return newStudent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setCreatingStudent(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return {
    students,
    loading,
    error,
    addingPoints,
    creatingStudent,
    addPointsToStudents,
    toggleStudentSelection,
    toggleSelectAll,
    sortStudents,
    createStudent,
    refetch: fetchStudents,
  }
}