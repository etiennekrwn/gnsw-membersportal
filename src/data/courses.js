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

// --- Lightweight, per-member course progress persisted locally ---
const PROGRESS_KEY = 'gnsw_course_progress'

function loadProgressMap() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveProgressMap(map) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
}

const TEMPLATE_LESSON_TITLES = [
  'Foundations and Objectives',
  'Core Concepts',
  'Building the Skill',
  'Practical Application',
  'Common Pitfalls',
  'Putting It Into Practice',
]

/**
 * A mutable view of a course for lesson-taking. Seeded from the mock course,
 * but the user's progress/currentLesson is persisted so it advances as they
 * complete lessons.
 */
export function getCourseWithProgress(course) {
  if (!course) return null
  const map = loadProgressMap()
  const stored = map[course.id]
  const base = getCourseById(course.id)

  const lessonCount = base ? base.moduleList.reduce((s, m) => s + m.lessonCount, 0) : base?.lessons || 0
  const currentLessonIndex = stored?.completed ?? 0

  // current lesson title derived from template slots, or fall back to seed
  const templateTitle = TEMPLATE_LESSON_TITLES[currentLessonIndex % TEMPLATE_LESSON_TITLES.length]
  const fallback = base?.currentLesson?.lessonTitle

  return {
    ...course,
    progress: stored ? Math.min(100, Math.round((currentLessonIndex / lessonCount) * 100)) : (course.progress || 0),
    currentLesson: {
      moduleTitle: `Module ${Math.floor(currentLessonIndex / 3) + 1}`,
      lessonTitle: templateTitle || fallback || 'Lesson',
      lessonId: `${course.id}-l${currentLessonIndex + 1}`,
    },
  }
}

export function advanceCourseProgress(courseId) {
  const map = loadProgressMap()
  const current = map[courseId]?.completed ?? 0
  map[courseId] = { completed: current + 1 }
  saveProgressMap(map)
}
