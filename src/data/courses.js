import { mockCourses } from './mockCourses.js'
import { canAccessTier } from './mockUsers.js'

export { mockCourses }

export function getCourses() {
  return mockCourses
}

export function getCourseById(id) {
  return mockCourses.find(c => c.id === id) ?? null
}

export function getCourseCategories() {
  return [...new Set(mockCourses.map(c => c.category))]
}

export function getInProgressCourse() {
  return mockCourses
    .filter(c => c.enrollmentState === 'in_progress' && c.progress > 0)
    .sort((a, b) => b.progress - a.progress)[0] ?? null
}

export function getRecommendedCourses(userTier) {
  return mockCourses.filter(c => canAccessTier(userTier, c.tier))
}

export function searchCourses(query) {
  const q = query.trim().toLowerCase()
  if (!q) return mockCourses
  return mockCourses.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.instructor.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q)
  )
}

export function filterCourses({ query = '', category = 'All' } = {}) {
  let results = searchCourses(query)
  if (category && category !== 'All') {
    results = results.filter(c => c.category === category)
  }
  return results
}

export function isCourseLocked(userTier, course) {
  return !canAccessTier(userTier, course.tier) || course.enrollmentState === 'locked'
}

export function getContinueLessonRoute(course) {
  if (!course?.currentLesson?.lessonId) {
    return `/learning/${course.id}`
  }
  return `/learning/${course.id}/lesson/${course.currentLesson.lessonId}`
}
