import { faker } from '@faker-js/faker'

faker.seed(20260604)

const eventTopics = [
  {
    id: 'rhetoric-governance-assembly',
    type: 'Featured Summit',
    date: 'October 14, 2026',
    time: '9:00 AM - 5:00 PM WAT',
    title: 'Rhetoric & Governance Assembly',
    location: 'International Conference Centre, Abuja, Nigeria',
    city: 'Abuja',
    access: 'public',
  },
  {
    id: 'rhetoric-corporate-boardrooms',
    type: 'Recurring Online',
    date: 'November 04, 2026',
    time: '2:00 PM - 4:00 PM WAT',
    title: 'Rhetoric in Corporate Boardrooms',
    location: 'Zoom - Virtual',
    city: 'Virtual',
    access: 'members',
  },
  {
    id: 'drafting-crisis-bulletins',
    type: 'Workshop',
    date: 'December 11, 2026',
    time: '10:00 AM - 3:00 PM WAT',
    title: 'Drafting High-Stakes Crisis Bulletins',
    location: 'Lagos Continental Hotel, Lagos, Nigeria',
    city: 'Lagos',
    access: 'public',
  },
  {
    id: 'inaugural-lecture-series-2027',
    type: 'Public Lecture',
    date: 'January 22, 2027',
    time: '11:00 AM - 1:00 PM WAT',
    title: 'Inaugural Lecture Series: The Voice Behind the Office',
    location: 'University of Port Harcourt Auditorium, Port Harcourt',
    city: 'Port Harcourt',
    access: 'public',
  },
  {
    id: 'annual-general-meeting-2027',
    type: 'Guild Meeting',
    date: 'February 08, 2027',
    time: '10:00 AM - 12:00 PM WAT',
    title: 'GNSW Annual General Meeting 2027',
    location: 'Guild Secretariat, Maitama, Abuja',
    city: 'Abuja',
    access: 'members',
  },
  {
    id: 'writing-for-the-executive-branch',
    type: 'Workshop',
    date: 'March 19, 2027',
    time: '2:00 PM - 5:00 PM WAT',
    title: 'Writing for the Executive Branch: A Practitioner\'s Workshop',
    location: 'Zoom - Virtual',
    city: 'Virtual',
    access: 'members',
  },
]

const eventImages = [
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200',
]

export const events = eventTopics.map((event, index) => ({
  ...event,
  image: eventImages[index],
  summary: faker.lorem.sentence({ min: 12, max: 18 }),
  description: [
    `${event.title} brings together ${faker.helpers.arrayElement([
      'speechwriters',
      'policy advisors',
      'communications leads',
      'public affairs professionals',
    ])} for a focused session on the craft, ethics, and practice of institutional speechwriting.`,
    faker.lorem.paragraph(4),
    faker.lorem.paragraph(3),
  ].join('\n\n'),
  highlights: [
    faker.helpers.arrayElement([
      'Practical drafting exercises with facilitator feedback',
      'Live case study review from Nigerian public institutions',
      'Structured networking with Guild members and guests',
    ]),
    faker.helpers.arrayElement([
      'Certificate of participation issued after the event',
      'Session materials shared with registered attendees',
      'Interactive Q&A with experienced practitioners',
    ]),
    faker.helpers.arrayElement([
      'Open to members, associates, and invited professionals',
      'Limited seats to preserve a focused learning environment',
      'Recommended for writers supporting senior executives',
    ]),
  ],
}))

export function getEvents() {
  return events
}

export function getEventById(id) {
  return events.find((e) => e.id === id) ?? null
}