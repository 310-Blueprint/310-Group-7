const application = (id, company, location, role, dueDate) => ({
  id,
  company,
  location,
  role,
  dueDate,
})

export const INITIAL_COLUMNS = [
  {
    title: 'To apply',
    tone: 'bg-brand-blue',
    applications: [
      application(
        'atlassian-software-engineering',
        'Atlassian',
        'Sydney, AU',
        'Software Engineering Intern',
        '25 Jul',
      ),
    ],
  },
  {
    title: 'Applied / Waiting',
    tone: 'bg-brand-pink',
    applications: [
      application('xero-product-design', 'Xero', 'Wellington, NZ', 'Product Design Intern', '18 Aug'),
      application(
        'datacom-software-development',
        'Datacom',
        'Auckland, NZ',
        'Software Development Intern',
        '22 Aug',
      ),
    ],
  },
  {
    title: 'Interview',
    tone: 'bg-brand-green',
    applications: [
      application(
        'canva-frontend-engineering',
        'Canva',
        'Sydney, AU',
        'Frontend Engineering Intern',
        '19 Aug',
      ),
      application(
        'air-new-zealand-data',
        'Air New Zealand',
        'Auckland, NZ',
        'Data Analyst Intern',
        '21 Aug',
      ),
      application('serko-qa-engineering', 'Serko', 'Auckland, NZ', 'QA Engineering Intern', '26 Aug'),
    ],
  },
  {
    title: 'Offer',
    tone: 'bg-brand-yellow',
    applications: [
      application(
        'sharesies-software-engineering',
        'Sharesies',
        'Wellington, NZ',
        'Software Engineering Intern',
        '20 Aug',
      ),
      application('trademe-web-development', 'Trade Me', 'Wellington, NZ', 'Web Development Intern', '23 Aug'),
    ],
  },
]
