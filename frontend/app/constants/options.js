// constants/options.js

export const ENGAGEMENT_COLORS = {
  'Uncontacted': 'bg-gray-200 text-gray-800',
  'No response': 'bg-red-100 text-red-400',
  'Contacted but not screened': 'bg-yellow-100 text-yellow-700',
  'Contacted & screened': 'bg-blue-100 text-blue-700',
  'Sent to client': 'bg-indigo-100 text-indigo-700',
  'Negotiation': 'bg-orange-100 text-orange-700',
  'Contacted but ghosting': 'bg-pink-100 text-pink-700',
  'Six mos rule': 'bg-purple-100 text-purple-700',
  'Out of budget': 'bg-red-200 text-red-800',
  'NDA': 'bg-teal-100 text-teal-700',
  'Not interested at all': 'bg-red-300 text-red-800',
  'Not interested in project': 'bg-yellow-300 text-yellow-800',
  'Call scheduled': 'bg-green-100 text-green-700',
  'Call done': 'bg-green-200 text-green-800',
  'Call again': 'bg-blue-200 text-blue-800',
  'Not relevant': 'bg-red-300 text-red-800'
};

export const TYPE_COLORS = {
  'Former': 'bg-gray-100 text-gray-700',
  'Customer': 'bg-blue-100 text-blue-700',
  'Competitor': 'bg-red-100 text-red-700',
  'Industry Expert': 'bg-green-100 text-green-700',
  'Partner': 'bg-indigo-100 text-indigo-700',
  'Franchisee': 'bg-purple-100 text-purple-700',
  'Distributer': 'bg-yellow-100 text-yellow-700',
  'Supplier': 'bg-pink-100 text-pink-700',
  'Reference': 'bg-teal-100 text-teal-700',
  'Dealer': 'bg-orange-100 text-orange-700',
  'Consultant': 'bg-cyan-100 text-cyan-700',
  'Others': 'bg-gray-200 text-gray-800',
};

export const TYPE_OPTIONS = [
  'Competitor',
  'Consultant',
  'Customer',
  'Dealer',
  'Distributor',
  'Franchisee',
  'Former',
  'Industry Expert',
  'Partner',
  'Reference',
  'Supplier',
  'Others',
];

export const ENGAGEMENT_OPTIONS = [
  'Call again',
  'Call done',
  'Call scheduled',
  'Contacted & screened',
  'Contacted but ghosting',
  'Contacted but not screened',
  'No response',
  'NDA',
  'Negotiation',
  'Not interested at all',
  'Not interested in project',
  'Out of budget',
  'Sent to client',
  'Six mos rule',
  'Uncontacted',
  'Not relevant'
];


export const SOURCE_OF_RESPONSE = [
  'Cold call',
  'E-mail',
  'LinkedIn',
  'Reference',
  'Others'
];