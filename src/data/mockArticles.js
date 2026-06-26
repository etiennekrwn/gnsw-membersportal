const articleTopics = [
  {
    title: 'How Clear Briefings Help Leaders Make Better Decisions',
    excerpt: 'A strong briefing does more than summarize facts. It gives a leader the context, choices, and language needed to act with confidence.',
    author: {
      name: 'Adaeze Okonkwo',
      role: 'Senior Policy Speechwriter',
      credential: 'MA',
      bio: 'Adaeze writes executive speeches and policy briefings for public sector leaders across West Africa.',
    },
    tag: 'Featured',
    category: 'Leadership',
    tags: ['briefings', 'leadership', 'clarity'],
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=900',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1400',
  },
  {
    title: 'Writing Speeches That Sound Human on Stage',
    excerpt: 'Memorable speeches are built for the ear first. Rhythm, plain language, and a clear emotional turn can make formal remarks feel alive.',
    author: {
      name: 'Chinedu Eze',
      role: 'Communications Strategist',
      credential: 'MSc',
      bio: 'Chinedu coaches executives on public communication, speech delivery, and message discipline.',
    },
    tag: 'For You',
    category: 'Culture',
    tags: ['delivery', 'voice', 'speechwriting'],
    thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=900',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1400',
  },
  {
    title: 'The First Hour After a Public Crisis',
    excerpt: 'The opening response sets the tone for everything that follows. Teams need verified facts, a holding line, and a calm approval process.',
    author: {
      name: 'Mariam Bello',
      role: 'Crisis Communications Lead',
      credential: '',
      bio: 'Mariam advises institutions on crisis response, stakeholder communication, and public trust.',
    },
    tag: 'Trending',
    category: 'Politics',
    tags: ['crisis', 'trust', 'public affairs'],
    thumbnail: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=900',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1400',
  },
  {
    title: 'Turning Policy Detail Into Public Meaning',
    excerpt: 'Citizens rarely need every technical clause. They need to understand what changed, why it matters, and how it affects daily life.',
    author: {
      name: 'Ifeanyi Nwosu',
      role: 'Public Policy Analyst',
      credential: 'PhD',
      bio: 'Ifeanyi helps policy teams translate complex reforms into clear public messages.',
    },
    tag: 'Latest',
    category: 'Economy',
    tags: ['policy', 'translation', 'citizens'],
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=900',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1400',
  },
  {
    title: 'What Executive Writers Can Learn From Town Halls',
    excerpt: 'Town halls reveal the questions people actually care about. Good writers listen for worries, repeated phrases, and the gaps between official language and lived experience.',
    author: {
      name: 'Temitope Akinola',
      role: 'Executive Writer',
      credential: 'MA',
      bio: 'Temitope develops speeches, newsletters, and public notes for institutional leaders.',
    },
    tag: 'For You',
    category: 'Leadership',
    tags: ['listening', 'town halls', 'audience'],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=900',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1400',
  },
  {
    title: 'A Practical Checklist for Approval-Ready Drafts',
    excerpt: 'Before a speech goes upstairs, it should answer the obvious questions: audience, occasion, core message, sensitivities, and required action.',
    author: {
      name: 'Ngozi Adeyemi',
      role: 'Editorial Director',
      credential: '',
      bio: 'Ngozi leads editorial systems for leadership offices and membership organizations.',
    },
    tag: 'Featured',
    category: 'Technology',
    tags: ['editing', 'workflow', 'quality'],
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=900',
    image: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1400',
  },
]

const articleBodies = [
  [
    { type: 'paragraph', text: 'A useful briefing begins with a simple promise: the reader should leave knowing what happened, what it means, and what decision is required. That sounds obvious, but many briefings bury the decision under background detail.' },
    { type: 'heading', text: 'Start With the Decision' },
    { type: 'paragraph', text: 'Lead with the choice in front of the principal. Then support it with the minimum context needed to understand the trade-offs. The best briefs are not thin; they are disciplined.' },
    { type: 'pullquote', text: 'Clarity is not the absence of detail. It is detail arranged in the order a decision-maker needs it.' },
    { type: 'paragraph', text: 'A final review should test whether the document can be read quickly under pressure. If the recommendation, risk, and next step are hard to find, the brief is not ready.' },
  ],
  [
    { type: 'paragraph', text: 'A speech may be drafted on a screen, but it lives in a room. The writer has to hear the line before the audience does. Long sentences, stacked clauses, and heavy abstractions often collapse when spoken aloud.' },
    { type: 'heading', text: 'Write for Breath' },
    { type: 'paragraph', text: 'Shorter sentences are not automatically better, but every sentence needs a shape the speaker can carry. Use pauses, repetition, and plain verbs to give the speaker room to connect.' },
    { type: 'pullquote', text: 'If a line cannot survive being read aloud, it is not ready for the podium.' },
    { type: 'paragraph', text: 'The goal is not informality. The goal is credibility. A leader can sound dignified and still sound human.' },
  ],
  [
    { type: 'paragraph', text: 'The first hour of a crisis rewards preparation. Teams that wait to design their approval process after pressure arrives usually lose time and confidence.' },
    { type: 'heading', text: 'Use a Holding Line' },
    { type: 'paragraph', text: 'A holding line should acknowledge the issue, state what is known, explain what is being verified, and promise the next update. It should never pretend certainty where none exists.' },
    { type: 'pullquote', text: 'Speed matters, but accuracy is what keeps the second statement from becoming another crisis.' },
    { type: 'paragraph', text: 'After the first response, keep a log of facts, decisions, and public commitments. The record will protect the team when events move quickly.' },
  ],
  [
    { type: 'paragraph', text: 'Policy communication often fails when it assumes that technical accuracy is the same as public understanding. A statement can be correct and still leave people unsure about what has changed.' },
    { type: 'heading', text: 'Name the Human Effect' },
    { type: 'paragraph', text: 'Every policy message should answer three questions: who is affected, what they should expect, and where they can get help. Details can follow once the public meaning is clear.' },
    { type: 'pullquote', text: 'People do not reject complexity; they reject being asked to decode it without a guide.' },
    { type: 'paragraph', text: 'Good policy language respects the reader. It avoids slogans when precision is needed and avoids jargon when plain English will do.' },
  ],
  [
    { type: 'paragraph', text: 'Town halls are a live test of institutional language. They show which phrases land, which claims need proof, and which concerns have been underestimated.' },
    { type: 'heading', text: 'Listen for Repetition' },
    { type: 'paragraph', text: 'When different people ask the same question in different words, the communication gap is real. Writers should capture those patterns and bring them back into future speeches and notes.' },
    { type: 'pullquote', text: 'The audience often writes the next draft for you, if you listen carefully enough.' },
    { type: 'paragraph', text: 'After a town hall, review the questions before reviewing the applause. Questions are the clearest map of what the next message must address.' },
  ],
  [
    { type: 'paragraph', text: 'Approval-ready drafts reduce friction. They make it easy for reviewers to see the purpose of the piece, the choices made, and the areas where judgment is still needed.' },
    { type: 'heading', text: 'Check the Essentials' },
    { type: 'paragraph', text: 'Confirm the audience, occasion, speaking time, protocol requirements, names, titles, data points, and sensitivities. Most late-stage edits come from missing one of these basics.' },
    { type: 'pullquote', text: 'A clean draft is not just well written. It is easy to trust.' },
    { type: 'paragraph', text: 'Before submission, add a short note explaining the main argument and any unresolved questions. Reviewers move faster when they know where to focus.' },
  ],
]

export const mockArticles = Array.from({ length: 15 }).map((_, index) => {
  const topic = articleTopics[index % articleTopics.length]

  return {
    id: index + 1,
    ...topic,
    author: {
      ...topic.author,
      initials: topic.author.name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
    },
    date: new Date(2026, 5, 25 - index).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    readTime: 4 + (index % 8),
    claps: 64 + index * 23,
    comments: 3 + (index % 9),
    tier: index % 3 === 0 ? 'ROLE_ASSOCIATE' : 'ROLE_MEMBER',
    body: articleBodies[index % articleBodies.length],
  }
})

export const getArticleById = (id) => mockArticles.find(a => a.id === Number(id));
export const getRelatedArticles = (currentId, limit = 3) =>
  mockArticles.filter(a => a.id !== Number(currentId)).slice(0, limit);
