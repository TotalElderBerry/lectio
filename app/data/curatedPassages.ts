export interface CuratedPassage {
  reference: string
  title: string
}

export interface PassageGroup {
  theme: string
  passages: CuratedPassage[]
}

/**
 * For the days when you don't know where to begin. Kept deliberately short —
 * a long list is another decision to make, and the point is to start praying.
 */
export const CURATED_PASSAGES: PassageGroup[] = [
  {
    theme: 'When you need consolation',
    passages: [
      { reference: 'Psalm 23', title: 'The Lord is my shepherd' },
      { reference: 'Isaiah 43:1-5', title: 'I have called you by name' },
      { reference: 'Matthew 11:28-30', title: 'Come to me, all who labour' },
      { reference: 'Psalm 121', title: 'I lift up my eyes' },
      { reference: 'John 14:1-7', title: 'Let not your heart be troubled' },
    ],
  },
  {
    theme: 'When you need mercy',
    passages: [
      { reference: 'Luke 15:11-24', title: 'The father runs to meet him' },
      { reference: 'Psalm 51:1-12', title: 'Create in me a clean heart' },
      { reference: 'John 8:1-11', title: 'Neither do I condemn you' },
      { reference: 'Luke 7:36-50', title: 'Her many sins are forgiven' },
    ],
  },
  {
    theme: 'When you are being called',
    passages: [
      { reference: '1 Samuel 3:1-10', title: 'Speak, for your servant hears' },
      { reference: 'Isaiah 6:1-8', title: 'Here I am; send me' },
      { reference: 'Luke 5:1-11', title: 'Put out into the deep' },
      { reference: 'Jeremiah 1:4-9', title: 'Before I formed you' },
      { reference: 'Mark 1:16-20', title: 'Follow me' },
    ],
  },
  {
    theme: 'When you are in darkness',
    passages: [
      { reference: 'Psalm 130', title: 'Out of the depths' },
      { reference: 'Psalm 42', title: 'Why are you cast down, my soul?' },
      { reference: 'Lamentations 3:17-26', title: 'His mercies are new every morning' },
      { reference: 'Mark 14:32-42', title: 'Gethsemane' },
      { reference: 'Psalm 88', title: 'Darkness is my closest friend' },
    ],
  },
  {
    theme: 'When you want to give thanks',
    passages: [
      { reference: 'Psalm 103', title: 'Bless the Lord, O my soul' },
      { reference: 'Luke 1:46-55', title: 'The Magnificat' },
      { reference: 'Psalm 100', title: 'Enter his gates with thanksgiving' },
      { reference: 'Philippians 4:4-9', title: 'Rejoice always' },
    ],
  },
  {
    theme: 'The heart of the Gospel',
    passages: [
      { reference: 'John 1:1-14', title: 'The Word became flesh' },
      { reference: 'Matthew 5:1-12', title: 'The Beatitudes' },
      { reference: 'Luke 24:13-35', title: 'The road to Emmaus' },
      { reference: 'John 15:1-11', title: 'I am the vine' },
      { reference: '1 Corinthians 13:1-13', title: 'The greatest of these is love' },
    ],
  },
]
