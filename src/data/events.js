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

const eventDetails = [
  {
    summary: 'A full-day summit on how public language shapes trust, accountability, and institutional leadership.',
    description: [
      'Rhetoric & Governance Assembly brings together speechwriters, policy advisors, communications leads, and public affairs professionals for a focused session on the craft, ethics, and practice of institutional speechwriting.',
      'The programme will examine how leaders can explain complex decisions without losing accuracy or public confidence. Sessions will cover keynote drafting, policy framing, audience analysis, and the role of language in democratic accountability.',
      'Participants will leave with practical frameworks for preparing speeches, briefings, and public statements that are clear, responsible, and suited to high-pressure moments.',
    ],
  },
  {
    summary: 'An online session for writers who support executives, boards, and senior management teams.',
    description: [
      'Rhetoric in Corporate Boardrooms brings together speechwriters, communications leads, and public affairs professionals for a focused session on the craft, ethics, and practice of institutional speechwriting.',
      'The session will explore how boardroom language differs from campaign, public sector, and media-facing communication. Facilitators will discuss tone, confidentiality, decision records, and the discipline required when writing for senior executives.',
      'Attendees will work through short examples and learn how to turn board priorities into remarks that are direct, balanced, and useful to the people making decisions.',
    ],
  },
  {
    summary: 'A hands-on workshop for drafting clear updates when facts are moving quickly.',
    description: [
      'Drafting High-Stakes Crisis Bulletins brings together communications leads, public affairs professionals, and speechwriters for a focused session on the craft, ethics, and practice of institutional speechwriting.',
      'The workshop will cover holding statements, internal approvals, stakeholder updates, and the language of uncertainty. Participants will learn how to acknowledge concern, protect accuracy, and communicate next steps without overpromising.',
      'The day includes guided writing exercises, peer review, and a simulation that tests how messages perform under time pressure.',
    ],
  },
  {
    summary: 'A public lecture on the unseen craft behind speeches delivered from positions of authority.',
    description: [
      'Inaugural Lecture Series: The Voice Behind the Office brings together speechwriters, policy advisors, communications leads, and public affairs professionals for a focused session on the craft, ethics, and practice of institutional speechwriting.',
      'The lecture will consider the relationship between the office, the office holder, and the writer who helps shape public language. It will also address attribution, confidentiality, historical memory, and the responsibility that comes with writing on behalf of others.',
      'Guests can expect a thoughtful discussion of professional standards and the future of speechwriting as a recognized public communication discipline.',
    ],
  },
  {
    summary: 'The Guild’s annual meeting for member updates, planning, elections, and professional priorities.',
    description: [
      'GNSW Annual General Meeting 2027 brings together members, associates, and Guild leaders for a focused review of the past year and the work ahead.',
      'The meeting will include reports from the executive committee, updates on membership programmes, discussion of training priorities, and consideration of proposed initiatives for the next operating year.',
      'Members are encouraged to attend prepared to contribute ideas, ask questions, and help shape the Guild’s professional agenda.',
    ],
  },
  {
    summary: 'A practitioner workshop on preparing speeches, memos, and briefings for executive branch leaders.',
    description: [
      'Writing for the Executive Branch: A Practitioner\'s Workshop brings together speechwriters, policy advisors, communications leads, and public affairs professionals for a focused session on the craft, ethics, and practice of institutional speechwriting.',
      'The workshop will focus on executive priorities, inter-agency coordination, policy accuracy, and the practical demands of writing for principals who work under constant public scrutiny.',
      'Participants will practice turning technical notes into usable remarks and will receive guidance on managing revisions, approvals, and sensitive language.',
    ],
  },
]

export const events = eventTopics.map((event, index) => ({
  ...event,
  image: eventImages[index],
  summary: eventDetails[index].summary,
  description: eventDetails[index].description.join('\n\n'),
  highlights: [
    'Practical drafting exercises with facilitator feedback',
    'Session materials shared with registered attendees',
    event.access === 'members'
      ? 'Reserved for Guild members and approved associates'
      : 'Open to members, associates, and invited professionals',
  ],
}))

export function getEvents() {
  return events
}

export function getEventById(id) {
  return events.find((e) => e.id === id) ?? null
}
