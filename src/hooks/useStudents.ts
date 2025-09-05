"use client";

import { useState, useEffect, useCallback } from 'react'

export interface Student {
  id: string
  name: string
  points: number
  classId: string
  isSelected?: boolean
  createdAt: string
  updatedAt: string
}

export interface Class {
  id: string
  name: string
  description: string | null
  teacherId: string
  students: Student[]
  createdAt: string
  updatedAt: string
}

export function useStudents(classId: string | null, teacherId: string | null) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  }

  const addPointsToStudents = async (studentIds: string[], pointsToAdd: number, reason: string, behavior?: string) => {
    if (!teacherId) throw new Error('Teacher ID is required')

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
        throw new Error('Failed to update student points')
      }

      const updatedStudents = await response.json()
      
      // Update local state
      setStudents(prevStudents => 
        prevStudents.map(student => {
          const updatedStudent = updatedStudents.find((s: Student) => s.id === student.id)
          return updatedStudent ? { ...updatedStudent, isSelected: false } : student
        })
      )

      return updatedStudents
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
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

  const createStudent = async (name: string) => {
    if (!classId || !teacherId) throw new Error('Class ID and Teacher ID are required')

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          classId,
          points: 0,
          teacherId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create student')
      }

      const newStudent = await response.json()
      setStudents(prevStudents => [...prevStudents, { ...newStudent, isSelected: false }])
      
      return newStudent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return {
    students,
    loading,
    error,
    fetchStudents,
    addPointsToStudents,
    toggleStudentSelection,
    createStudent
  }
}
